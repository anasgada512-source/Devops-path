import { lesson, topic } from './helpers.js';

export const cloud = topic(
  'cloud-kubernetes',
  3,
  '☁️',
  'Cloud and Kubernetes',
  'Cloud building blocks, and how Kubernetes runs containers reliably at scale.',
  [
    'Choose between IaaS, PaaS and serverless',
    'Understand pods, deployments and services in Kubernetes',
    'Write and validate a Kubernetes Deployment manifest',
  ],
  [
    lesson(
      'cloud-basics',
      'Cloud Basics',
      'Regions, compute, storage, networking and identity on AWS, Azure and Google Cloud.',
      9,
      `
The cloud means renting computing resources on demand instead of buying servers. You pay for what you use and can scale up or down in minutes.

## Service models

| Model | You manage | Provider manages | Example |
|---|---|---|---|
| IaaS | OS, runtime, app | Hardware, network | AWS EC2, Azure VM |
| PaaS | App and data | OS, runtime, scaling | Render, Heroku, Elastic Beanstalk |
| Serverless | Functions only | Everything else | AWS Lambda, Cloud Functions |

## Core building blocks (same ideas on every cloud)

| Need | AWS | Azure | Google Cloud |
|---|---|---|---|
| Virtual machines | EC2 | Virtual Machines | Compute Engine |
| Object storage | S3 | Blob Storage | Cloud Storage |
| Managed database | RDS | Azure SQL | Cloud SQL |
| Containers (Kubernetes) | EKS | AKS | GKE |
| Private network | VPC | VNet | VPC |
| Permissions | IAM | Entra ID / RBAC | IAM |

## Concepts to learn first

- **Region and availability zone**: deploy across zones so one data center failure does not take you down.
- **IAM**: give every person and service the least permission needed. Never use the root account for daily work and turn on MFA.
- **VPC and security groups**: put databases in private subnets; only expose load balancers.
- **Cost control**: set budgets and billing alerts on day one. Forgotten resources are the most common surprise bill.

> Pick one cloud and go deep. The concepts transfer, only the names change. Free tiers exist, but always check the current limits and set billing alerts.
`
    ),
    lesson(
      'kubernetes-core-concepts',
      'Kubernetes Core Concepts',
      'Pods, Deployments, Services, ConfigMaps and the kubectl commands to inspect them.',
      11,
      `
Docker runs one container. **Kubernetes (K8s)** runs **thousands**, restarts them when they crash, spreads them across machines, and rolls out new versions without downtime.

## The objects you need first

| Object | What it is |
|---|---|
| Pod | Smallest unit: one or more containers sharing a network |
| Deployment | Keeps N identical Pods running and handles rolling updates |
| Service | A stable address and load balancer in front of Pods |
| Ingress | HTTP routing from outside the cluster (hostnames, paths, TLS) |
| ConfigMap / Secret | Configuration and sensitive values, injected as env vars or files |
| Namespace | A virtual cluster for separating teams or environments |

## How it works

You declare the **desired state** ("run 3 copies of this image"). Controllers constantly compare reality to that state and fix any difference. If a Pod dies, a new one is created. This is called a **reconciliation loop**.

## kubectl essentials

~~~bash
kubectl get pods -A                       # all pods, all namespaces
kubectl describe pod my-pod               # events: why is it Pending?
kubectl logs -f deploy/api                # follow logs
kubectl exec -it deploy/api -- sh         # shell inside
kubectl apply -f deployment.yaml          # create or update from a file
kubectl rollout status deploy/api
kubectl rollout undo deploy/api           # roll back
kubectl scale deploy/api --replicas=5
~~~

## Learn locally

Install **minikube**, **kind** or Docker Desktop's Kubernetes and practice with a throwaway cluster before touching a real one.
`
    ),
    lesson(
      'k8s-deployments-services',
      'Deployments and Services',
      'A complete manifest with replicas, probes, resources and a Service. Edit and validate it.',
      10,
      `
Kubernetes is configured with YAML manifests. This one runs three copies of an API and exposes them inside the cluster.

~~~yaml run
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels:
    app: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: ghcr.io/your-user/devops-roadmap:1.0
          ports:
            - containerPort: 5000
          env:
            - name: NODE_ENV
              value: production
            - name: MONGO_URI
              valueFrom:
                secretKeyRef:
                  name: api-secrets
                  key: mongo-uri
          readinessProbe:
            httpGet:
              path: /api/health
              port: 5000
            initialDelaySeconds: 5
          livenessProbe:
            httpGet:
              path: /api/health
              port: 5000
            initialDelaySeconds: 15
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 256Mi
---
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 5000
~~~

## What to notice

- **Labels and selectors** connect objects: the Service finds Pods with {{app: api}}.
- **readinessProbe**: traffic is only sent to a Pod once it answers. **livenessProbe**: a Pod that stops answering is restarted.
- **requests** are what the scheduler reserves, **limits** are the ceiling. Without them one noisy app can starve the others.
- Secrets come from a {{Secret}} object, not from the manifest.
- The two YAML documents are separated by {{---}}.

## Create the secret and deploy

~~~bash
kubectl create secret generic api-secrets --from-literal=mongo-uri="mongodb+srv://..."
kubectl apply -f k8s.yaml
kubectl get pods -w
~~~
`
    ),
  ]
);

export const iac = topic(
  'infrastructure-as-code',
  3,
  '🏗️',
  'Infrastructure as Code',
  'Describe servers, networks and databases in files so environments are repeatable and reviewable.',
  [
    'Explain why infrastructure should live in Git',
    'Write basic Terraform and read a plan',
    'Configure servers with Ansible playbooks',
  ],
  [
    lesson(
      'terraform-basics',
      'Terraform Basics',
      'Providers, resources, variables, plan and apply.',
      10,
      `
Clicking around a cloud console does not scale: nobody remembers what was clicked, and no one can review it. **Infrastructure as Code (IaC)** puts it in text files, in Git, with pull requests.

**Terraform** is the most common tool. You write **declarative** configuration (what you want), and Terraform works out how to get there.

## A small example

~~~hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

variable "region" {
  type    = string
  default = "ap-south-1"
}

resource "aws_s3_bucket" "assets" {
  bucket = "my-devops-roadmap-assets"
}

output "bucket_name" {
  value = aws_s3_bucket.assets.id
}
~~~

## The workflow

~~~bash
terraform init      # download providers
terraform fmt       # format code
terraform validate  # check syntax
terraform plan      # preview what will change (read this carefully!)
terraform apply     # make the change
terraform destroy   # remove everything (be careful)
~~~

## State

Terraform keeps a **state file** that maps your code to real resources. Do not keep it on your laptop for a team. Store it in a **remote backend** (S3 with locking, Terraform Cloud, etc.) and never commit it to Git, because it can contain secrets.

## Good practices

- Run {{plan}} in pull requests and {{apply}} only after review.
- Split code into **modules** for repeated patterns (network, database).
- Use separate state per environment (dev, staging, prod).
- Tag every resource so costs can be traced to a team or project.
`
    ),
    lesson(
      'ansible-basics',
      'Ansible Basics',
      'Inventory, playbooks and idempotent tasks for configuring servers over SSH.',
      9,
      `
Terraform creates infrastructure. **Ansible** configures what runs on it: install packages, copy files, start services. It connects over SSH, with no agent to install.

## Inventory

~~~ini
[web]
203.0.113.10
203.0.113.11

[web:vars]
ansible_user=ubuntu
~~~

## A playbook

~~~yaml run
- name: Set up web servers
  hosts: web
  become: true
  tasks:
    - name: Install nginx
      ansible.builtin.apt:
        name: nginx
        state: present
        update_cache: true

    - name: Copy site config
      ansible.builtin.template:
        src: site.conf.j2
        dest: /etc/nginx/conf.d/site.conf
      notify: Reload nginx

    - name: Ensure nginx is running
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true

  handlers:
    - name: Reload nginx
      ansible.builtin.service:
        name: nginx
        state: reloaded
~~~

## Idempotency

Run the playbook ten times and the result is the same as running it once. Tasks describe a **state** ("nginx is present"), not an action ("install nginx"). Ansible only changes what is different.

~~~bash
ansible-playbook -i inventory.ini site.yml --check   # dry run
ansible-playbook -i inventory.ini site.yml
~~~

## Terraform or Ansible?

| | Terraform | Ansible |
|---|---|---|
| Best at | Creating cloud resources | Configuring machines and deploying apps |
| Style | Declarative with state | Task lists, mostly stateless |

Teams often use both: Terraform builds the servers, Ansible sets them up.
`
    ),
  ]
);

export const monitoring = topic(
  'monitoring-logging',
  4,
  '📈',
  'Monitoring and Logging',
  'Know when your system is unhealthy before your users tell you.',
  [
    'Tell logs, metrics and traces apart',
    'Expose and query metrics with Prometheus',
    'Define SLOs and alerts that wake people up only when it matters',
  ],
  [
    lesson(
      'logs-metrics-traces',
      'Logs, Metrics and Traces',
      'The three pillars of observability and how to use each one.',
      8,
      `
**Observability** means you can understand what your system is doing from the outside. Three kinds of data help:

| Signal | Question it answers | Example |
|---|---|---|
| **Logs** | What happened? | "User 42 failed login at 12:01" |
| **Metrics** | How is it doing over time? | Requests per second, error rate, CPU |
| **Traces** | Where did this request spend its time? | API 40ms, database 310ms, cache 2ms |

## Write logs that help

Use **structured** logs (JSON) so tools can search them, and include a request id.

~~~js
console.log(JSON.stringify({
  level: 'error',
  msg: 'payment failed',
  requestId: req.id,
  userId: req.user.id,
  durationMs: 184,
}));
~~~

- Use levels: debug, info, warn, error.
- Never log passwords, tokens or card numbers.
- In containers, log to **stdout**; the platform collects it.

## The four golden signals

1. **Latency**: how long requests take (watch the 95th and 99th percentile, not the average).
2. **Traffic**: how many requests.
3. **Errors**: how many fail.
4. **Saturation**: how full your resources are (CPU, memory, disk, connections).

## Tools

| Purpose | Common choices |
|---|---|
| Logs | Loki, ELK stack, CloudWatch, Datadog |
| Metrics | Prometheus, Grafana, Datadog |
| Traces | OpenTelemetry with Jaeger or Tempo |
| Uptime | UptimeRobot, Better Stack |
`
    ),
    lesson(
      'prometheus-grafana',
      'Prometheus and Grafana',
      'Expose a /metrics endpoint, scrape it, and graph it.',
      10,
      `
**Prometheus** pulls (scrapes) numbers from your apps at a fixed interval and stores them as time series. **Grafana** turns them into dashboards.

## Expose metrics from Node.js

~~~js
import client from 'prom-client';

client.collectDefaultMetrics(); // CPU, memory, event loop lag

const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Request duration in seconds',
  labelNames: ['method', 'route', 'status'],
});

app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => end({ method: req.method, route: req.path, status: res.statusCode }));
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
~~~

## Prometheus config

~~~yaml run
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: api
    metrics_path: /metrics
    static_configs:
      - targets: ["api:5000"]
~~~

## PromQL examples

~~~text
# requests per second over the last 5 minutes
rate(http_request_duration_seconds_count[5m])

# error percentage
sum(rate(http_request_duration_seconds_count{status=~"5.."}[5m]))
  / sum(rate(http_request_duration_seconds_count[5m])) * 100

# 95th percentile latency
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
~~~

> Do not expose {{/metrics}} to the public internet. Keep it on a private network or protect it.
`
    ),
    lesson(
      'alerts-slos',
      'Alerts, SLOs and Incident Response',
      'Error budgets, good alerts, and a calm process for when things break.',
      9,
      `
## SLI, SLO and error budget

- **SLI** (indicator): a measurement, e.g. percent of requests that succeed.
- **SLO** (objective): your target, e.g. 99.9 percent of requests succeed over 30 days.
- **Error budget**: the amount of failure you are allowed, 100 percent minus the SLO.

## Try it: how much downtime is allowed?

~~~js run
const minutesIn30Days = 30 * 24 * 60;

for (const slo of [99, 99.5, 99.9, 99.99]) {
  const allowed = minutesIn30Days * (1 - slo / 100);
  console.log(slo + '%  ->  ' + allowed.toFixed(1) + ' minutes of downtime per 30 days');
}
~~~

Each extra nine costs far more engineering effort. Choose the SLO your users actually need.

## Alerts that deserve a human

Alert on **symptoms users feel** (error rate high, site slow), not on causes (CPU 80 percent). Every alert should be urgent, actionable and have a runbook link. If an alert fires and nobody needs to do anything, delete it. Alert fatigue makes people ignore the real one.

~~~yaml
groups:
  - name: api
    rules:
      - alert: HighErrorRate
        expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
        for: 10m
        labels:
          severity: page
        annotations:
          summary: "More than 5 percent of requests are failing"
~~~

## When an incident happens

1. **Acknowledge** and say who is leading.
2. **Mitigate first**: roll back, scale up or turn off the feature. Find root cause later.
3. **Communicate** status updates on a regular schedule.
4. **Write a blameless postmortem**: timeline, impact, root cause, what will change. Focus on the system, not on a person.
`
    ),
  ]
);

export const systemDesign = topic(
  'system-design-scaling',
  4,
  '🧭',
  'System Design and Scaling',
  'How to keep an application fast and available as traffic grows.',
  [
    'Scale vertically and horizontally',
    'Place caches and a load balancer correctly',
    'Use queues to move slow work out of the request path',
  ],
  [
    lesson(
      'scaling-load-balancing',
      'Scaling and Load Balancing',
      'Vertical vs horizontal scaling, stateless servers and balancing algorithms.',
      9,
      `
## Two ways to scale

- **Vertical**: a bigger machine (more CPU and RAM). Simple, but has a ceiling and is a single point of failure.
- **Horizontal**: more machines behind a **load balancer**. Almost unlimited, and survives a server dying.

## Stateless servers

Horizontal scaling works when any server can handle any request. Do not keep sessions or uploaded files in server memory or local disk. Put them in a shared store: a database, Redis, or object storage like S3. JWT tokens are handy here because the server needs no session memory.

## Load balancing algorithms

| Algorithm | How it picks | Good for |
|---|---|---|
| Round robin | Next server in turn | Similar servers and requests |
| Least connections | Server with the fewest active requests | Uneven request cost |
| IP hash | Same client goes to the same server | Simple stickiness |

Load balancers also run **health checks** and stop sending traffic to servers that fail them.

## Try it: round robin with health checks

~~~js run
const servers = [
  { name: 'api-1', healthy: true },
  { name: 'api-2', healthy: false },
  { name: 'api-3', healthy: true },
];

let next = 0;
function pick() {
  for (let i = 0; i < servers.length; i++) {
    const s = servers[(next + i) % servers.length];
    if (s.healthy) {
      next = (next + i + 1) % servers.length;
      return s.name;
    }
  }
  return null; // everything is down
}

for (let i = 1; i <= 6; i++) console.log('request ' + i + ' -> ' + pick());
~~~

Notice that api-2 never receives traffic while it is unhealthy.

## The database is usually the next bottleneck

Add indexes, cache reads, then use **read replicas**. Sharding (splitting data across databases) is a last resort because it adds a lot of complexity.
`
    ),
    lesson(
      'caching-cdn',
      'Caching Strategies and CDN',
      'Where to cache, which strategy to use, and how a CDN makes your site feel instant.',
      8,
      `
Caching means keeping a copy of expensive-to-produce data closer to the user.

## Cache layers, from user to database

1. **Browser cache**: controlled by {{Cache-Control}} headers.
2. **CDN**: servers around the world that cache static files and sometimes API responses.
3. **Application cache**: Redis or in-memory.
4. **Database cache**: query cache, buffer pool.

## Strategies

| Strategy | On read | On write |
|---|---|---|
| Cache-aside | App checks cache, then DB, then fills cache | App writes to DB and deletes the cache key |
| Write-through | Always reads from cache | Writes to cache and DB together |
| Write-back | Reads from cache | Writes to cache, DB updated later (fast, risk of loss) |

## HTTP caching headers

~~~text
# fingerprinted assets (app.3f9a1c.js) can be cached for a year
Cache-Control: public, max-age=31536000, immutable

# HTML and API data: always revalidate
Cache-Control: no-cache
~~~

Vite adds a hash to built file names, so a new deploy gives new URLs and old caches never serve stale code.

## CDN

A CDN (Cloudflare, CloudFront, Fastly) stores copies in dozens of cities. A visitor in Mumbai gets files from Mumbai, not from a server in Virginia. It also absorbs traffic spikes and some attacks.

## Remember the two hard problems

Cache **invalidation** (when to delete) and **stampedes** (many requests rebuild the same expired key at once). Use sensible TTLs, and add a little random jitter to expiry times.
`
    ),
    lesson(
      'message-queues',
      'Message Queues and Async Work',
      'Move slow tasks like emails and image processing to background workers.',
      9,
      `
If signing up triggers an email, a welcome PDF and an analytics call, the user should not wait for all three. Put the slow work on a **queue** and let a **worker** process it in the background.

~~~text
API request  ->  save user  ->  push "send_welcome_email" to queue  ->  respond 201
                                      |
                                   worker pulls job -> sends email -> retries if it fails
~~~

## Why queues help

- **Faster responses**: the request returns immediately.
- **Smoothing spikes**: jobs wait in line instead of crashing the server.
- **Retries**: a failed job is tried again later.
- **Decoupling**: producer and worker can be deployed and scaled independently.

## Tools

| Tool | Notes |
|---|---|
| BullMQ (Redis) | Easy choice for Node.js apps |
| RabbitMQ | Flexible routing, classic message broker |
| Kafka | High-throughput event streaming |
| AWS SQS | Fully managed queue |

## Try it: a queue with retries and backoff

~~~js run
const queue = [{ id: 1, attempts: 0 }, { id: 2, attempts: 0 }];
const MAX_ATTEMPTS = 3;

function sendEmail(job) {
  // fake: job 1 fails on its first two attempts
  if (job.id === 1 && job.attempts < 3) throw new Error('SMTP timeout');
  return 'sent';
}

while (queue.length) {
  const job = queue.shift();
  job.attempts++;
  try {
    console.log('job ' + job.id + ' attempt ' + job.attempts + ': ' + sendEmail(job));
  } catch (e) {
    const wait = Math.pow(2, job.attempts) * 100;
    if (job.attempts < MAX_ATTEMPTS) {
      console.log('job ' + job.id + ' failed (' + e.message + '), retry after ' + wait + 'ms');
      queue.push(job);
    } else {
      console.log('job ' + job.id + ' moved to dead-letter queue');
    }
  }
}
~~~

## Make workers safe to retry

Jobs can run more than once, so design them to be **idempotent**: sending the same "charge order 7" job twice must not charge twice. Store a unique job key and skip duplicates.
`
    ),
  ]
);

export const deploy = topic(
  'deploy-mern-app',
  4,
  '🌍',
  'Deploy a MERN App',
  'A hands-on guide to taking a MERN project from your laptop to a public URL.',
  [
    'Prepare a MERN app for production',
    'Deploy with MongoDB Atlas and a hosting platform',
    'Finish with domain, HTTPS and a launch checklist',
  ],
  [
    lesson(
      'prepare-for-production',
      'Prepare Your App for Production',
      'Environment variables, a production build, and one-service deployment.',
      9,
      `
## Production checklist

1. All secrets come from **environment variables**. Nothing sensitive is in Git.
2. The React app is **built** ({{npm run build}}) into static files.
3. The server listens on {{process.env.PORT}}, because hosts choose the port.
4. {{NODE_ENV=production}} is set (faster Express, less verbose errors).
5. CORS allows only your real frontend origin if it lives on another domain.
6. There is a {{/api/health}} endpoint for the host to check.

## One service or two?

| Option | How | Good for |
|---|---|---|
| **One service** | Express serves the API and the built React files | Simplest, one URL, no CORS (this project does it) |
| **Two services** | Frontend on Vercel/Netlify, API on Render/Railway | Separate scaling and CDN-hosted frontend |

For one service, Express serves the build folder and falls back to {{index.html}} so React Router paths work after a refresh:

~~~js
app.use(express.static(path.resolve(__dirname, '../../client/dist')));
app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
~~~

## Scripts

~~~json run
{
  "scripts": {
    "build": "npm --prefix server install && npm --prefix client install --include=dev && npm --prefix client run build",
    "start": "npm --prefix server start"
  }
}
~~~

The host runs the **build** command once and the **start** command to run the app.

## Test the production build locally first

~~~bash
npm run build
NODE_ENV=production PORT=5000 MONGO_URI=... JWT_SECRET=... npm start
~~~
`
    ),
    lesson(
      'atlas-and-hosting',
      'MongoDB Atlas and Hosting',
      'Create a cloud database, set environment variables, and deploy from GitHub.',
      10,
      `
## Step 1: Create the database (MongoDB Atlas)

1. Sign up at mongodb.com/atlas and create a **free (M0) cluster**.
2. **Database Access**: create a database user with a strong password.
3. **Network Access**: allow the IP addresses of your host. Many free hosts use changing IPs, so beginners often allow {{0.0.0.0/0}}. That is convenient but less secure, so use a strong password and tighten it when you can.
4. Click **Connect, Drivers** and copy the connection string.

~~~text
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/devops_roadmap?retryWrites=true&w=majority
~~~

If your password has special characters, URL-encode them.

## Step 2: Push the code to GitHub

~~~bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USER/devops-roadmap.git
git push -u origin main
~~~

## Step 3: Create the web service (example: Render)

- New, Web Service, connect your GitHub repo.
- **Build command**: {{npm run build}}
- **Start command**: {{npm start}}
- **Environment variables**:

| Key | Value |
|---|---|
| NODE_ENV | production |
| MONGO_URI | your Atlas connection string |
| JWT_SECRET | a long random string |
| ADMIN_EMAIL | your email (becomes admin on register) |

- Deploy, then open the URL the platform gives you.

> Free plans may put an idle app to sleep, so the first request after a break can be slow. Check your platform's current free tier rules before you rely on it.

## Other places to host

Railway, Fly.io, an AWS EC2 server with Docker, or Kubernetes. The steps are the same idea: build, set variables, run, check the health endpoint.
`
    ),
    lesson(
      'domain-https-launch',
      'Domain, HTTPS and Launch Checklist',
      'Connect your own domain, confirm HTTPS, and verify everything before sharing the link.',
      7,
      `
## Custom domain

1. Buy a domain from a registrar.
2. In your hosting dashboard, add the custom domain. It tells you which DNS record to create.
3. In your registrar's DNS settings add a **CNAME** (for {{www}}) or the **A/ALIAS** record the host shows.
4. Wait for DNS to propagate, then the platform issues an HTTPS certificate automatically.

Check it with:

~~~bash
dig www.yourdomain.com +short
curl -I https://www.yourdomain.com
~~~

## Launch checklist

- [ ] Open the site on your phone, not only on your laptop.
- [ ] Register a test user and log in.
- [ ] Submit the contact form and confirm it is stored.
- [ ] Refresh a deep link such as {{/learn/docker}} (it must not 404).
- [ ] {{/api/health}} returns ok.
- [ ] Secrets are not visible in the browser or in the Git history.
- [ ] Uptime monitor and billing alert are set.
- [ ] MongoDB backups are enabled.

## After launch

- Add an uptime monitor that pings {{/api/health}} every few minutes.
- Watch logs for the first week.
- Automate deploys: every push to {{main}} runs CI, then deploys. You learned how in the CI/CD topic.

You now have the full path: code, containers, pipelines, cloud, monitoring and a real deployment. Keep building projects and write about what you learn.
`
    ),
  ]
);
