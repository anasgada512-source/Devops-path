import { lesson, topic } from './helpers.js';

export const git = topic(
  'git-github',
  1,
  '🌿',
  'Git and GitHub',
  'Version control, branching and the pull request workflow used by every engineering team.',
  [
    'Track, commit and undo changes confidently',
    'Work on branches and merge without fear',
    'Open pull requests and follow a clean team workflow',
  ],
  [
    lesson(
      'git-basics',
      'Git Basics',
      'Init, add, commit, status, log and how to undo mistakes.',
      9,
      `
**Git** records snapshots of your project so you can see history, go back in time, and work with others without overwriting each other's files.

## The three areas

1. **Working directory**: the files you edit.
2. **Staging area**: changes you have chosen to include in the next commit ({{git add}}).
3. **Repository**: saved commits ({{git commit}}).

## First steps

~~~bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

git init                       # start tracking this folder
git status                     # what changed?
git add .                      # stage everything
git commit -m "Add login API"  # save a snapshot
git log --oneline --graph      # see history
~~~

## Ignore what should not be tracked

Create a {{.gitignore}} file:

~~~text
node_modules/
.env
dist/
*.log
~~~

> Never commit {{.env}} files or secrets. If you did, rotate the secret immediately. Deleting the file later does not remove it from history.

## Undoing things

~~~bash
git restore file.js            # discard unstaged edits in a file
git restore --staged file.js   # unstage
git commit --amend             # fix the last commit message or add a forgotten file
git revert <commit>            # create a new commit that undoes an old one (safe for shared branches)
~~~

Write commit messages in the imperative: "Fix token expiry bug", not "fixed stuff".
`
    ),
    lesson(
      'branching-pull-requests',
      'Branching, Merging and Pull Requests',
      'Feature branches, resolving conflicts and a simple team workflow on GitHub.',
      10,
      `
A **branch** is a separate line of work. You build a feature on a branch so {{main}} always stays deployable.

## Everyday flow

~~~bash
git switch main
git pull                          # get the latest
git switch -c feature/contact-form

# ...edit, then:
git add .
git commit -m "Add contact form with validation"
git push -u origin feature/contact-form
~~~

Now open a **pull request** (PR) on GitHub: a request to merge your branch into {{main}}, with a place for teammates to review and discuss the code.

## A good pull request

- Small and focused on one change.
- A title that says what and why.
- Tests pass in CI before anyone reviews it.
- Screenshots when the UI changes.

## Merge conflicts

A conflict happens when two branches changed the same lines. Git marks the file:

~~~text
<<<<<<< HEAD
const PORT = 5000;
=======
const PORT = process.env.PORT || 5000;
>>>>>>> feature/env-port
~~~

Edit the file to the version you want, remove the markers, then:

~~~bash
git add server.js
git commit
~~~

## Branch strategies

| Strategy | Idea | Fits |
|---|---|---|
| GitHub Flow | Short branches off main, PR, merge, deploy | Most web teams |
| Trunk-based | Tiny changes merged to main many times a day | Teams with strong CI and feature flags |
| Git Flow | develop, release, hotfix branches | Versioned software with slow releases |

Protect {{main}} in repository settings: require a pull request and passing checks before merging.
`
    ),
  ]
);

export const networking = topic(
  'networking-security',
  2,
  '🔐',
  'Networking and Security',
  'DNS, TCP/IP, ports, HTTPS and the security mistakes that cause most real incidents.',
  [
    'Trace how a domain name becomes a connection to your server',
    'Explain HTTPS and certificates',
    'Avoid the most common web vulnerabilities (OWASP Top 10 mindset)',
  ],
  [
    lesson(
      'dns-tcp-ports',
      'DNS, TCP/IP and Ports',
      'IP addresses, ports, DNS record types and how to debug connectivity.',
      9,
      `
## IP addresses and ports

An **IP address** identifies a machine on a network. A **port** identifies a program on that machine. Think of the IP as the building and the port as the flat number.

| Port | Service |
|---|---|
| 22 | SSH |
| 80 | HTTP |
| 443 | HTTPS |
| 5432 | PostgreSQL |
| 27017 | MongoDB |
| 6379 | Redis |

## DNS

**DNS** turns {{example.com}} into an IP address. Records you will set often:

| Record | Purpose | Example |
|---|---|---|
| A | Name to IPv4 | example.com to 203.0.113.10 |
| AAAA | Name to IPv6 | |
| CNAME | Name to another name | www to example.com |
| MX | Mail servers | |
| TXT | Verification, SPF, etc. | |

DNS changes are cached, so updates can take from minutes up to a day (the **TTL**).

## TCP in one paragraph

TCP gives reliable, ordered delivery. It starts with a three-way handshake (SYN, SYN-ACK, ACK), then data flows, and lost packets are re-sent. UDP skips all that for speed (video calls, DNS queries, games).

## Debugging toolbox

~~~bash
ping example.com                      # is it reachable?
nslookup example.com                  # what IP does DNS return?
dig example.com +short
curl -v https://example.com           # see the full request/response and TLS
traceroute example.com                # where does the path break?
nc -zv db.internal 5432               # is that port open?
~~~

Common error: "connection refused" means nothing is listening on that port. "Timeout" usually means a firewall or wrong IP.
`
    ),
    lesson(
      'https-tls',
      'HTTPS, TLS and Certificates',
      'How encryption in transit works and how to get a free certificate.',
      8,
      `
**HTTPS** is HTTP inside an encrypted **TLS** tunnel. It protects against eavesdropping and tampering, and proves that you are talking to the real server.

## How a TLS handshake works (simplified)

1. The client says hello and lists the encryption methods it supports.
2. The server answers with its **certificate**, which contains its public key and is signed by a trusted **Certificate Authority** (CA).
3. The client checks the signature, domain name and expiry date.
4. Both sides agree on a temporary session key and switch to fast symmetric encryption.

## Getting a certificate

Let's Encrypt issues free certificates automatically.

~~~bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
sudo certbot renew --dry-run     # test auto-renewal
~~~

Platforms like Render, Vercel, Netlify and Cloudflare issue and renew certificates for you.

## Redirect HTTP to HTTPS

~~~nginx
server {
  listen 80;
  server_name example.com;
  return 301 https://$host$request_uri;
}
~~~

## Headers worth adding

- {{Strict-Transport-Security}}: browsers must use HTTPS for this site.
- {{Content-Security-Policy}}: limit where scripts and styles can load from.
- {{X-Content-Type-Options: nosniff}}.

In Express, the {{helmet}} package sets these for you.

> An expired certificate takes your site down for every user. Monitor expiry dates and alert 14 days ahead.
`
    ),
    lesson(
      'web-security-essentials',
      'Web Security Essentials',
      'Injection, XSS, broken access control and the habits that prevent them.',
      11,
      `
Most breaches use boring, well-known mistakes. Learn these and you stop most attacks.

## 1. Injection

User input gets treated as code. The classic is SQL injection.

~~~js
// BAD: input is glued into the query
db.query("SELECT * FROM users WHERE email = '" + email + "'");
// an attacker sends: ' OR '1'='1

// GOOD: parameterized query
db.query('SELECT * FROM users WHERE email = $1', [email]);
~~~

NoSQL injection is similar: validate that fields are strings before passing them to MongoDB queries, because an object that contains the {{$ne}} operator changes the meaning of a filter (for example, a login that accepts any password).

## 2. Cross-site scripting (XSS)

Attacker-controlled text runs as JavaScript in another user's browser. React escapes text by default. The danger is {{dangerouslySetInnerHTML}} or building HTML strings by hand. If you must render user HTML, sanitize it first.

## 3. Broken access control

Logging in is not the same as being allowed. Check ownership on **every** request.

~~~js
const post = await Post.findById(req.params.id);
if (!post) return res.status(404).end();
if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
  return res.status(403).json({ message: 'Not allowed' });
}
~~~

## 4. Secrets and dependencies

- Keep secrets in environment variables or a secret manager, never in Git.
- Run {{npm audit}} and keep dependencies updated.
- Turn on GitHub Dependabot alerts.

## 5. Defense in depth

| Layer | Example |
|---|---|
| Edge | HTTPS, rate limiting, WAF |
| App | Input validation, helmet, CORS allowlist |
| Data | Least-privilege database user, backups |
| People | 2FA on GitHub and cloud accounts |
`
    ),
  ]
);

export const docker = topic(
  'docker',
  2,
  '🐳',
  'Docker',
  'Package your application and its dependencies into containers that run the same everywhere.',
  [
    'Explain containers versus virtual machines',
    'Write an efficient multi-stage Dockerfile',
    'Run multi-container apps with Docker Compose',
  ],
  [
    lesson(
      'containers-vs-vms',
      'Containers vs Virtual Machines',
      'What a container really is and the Docker commands you will use daily.',
      8,
      `
"It works on my machine" happens because machines differ: operating system, Node version, installed libraries. A **container** bundles your app and everything it needs, so it runs the same on a laptop, a CI server and production.

## Containers vs VMs

| | Virtual machine | Container |
|---|---|---|
| Includes | Full guest operating system | Only app and libraries |
| Shares | Hardware (via hypervisor) | The host's kernel |
| Start time | Minutes | Seconds or less |
| Size | Gigabytes | Megabytes to a few hundred MB |

## Key words

- **Image**: a read-only template (your app plus its dependencies).
- **Container**: a running instance of an image.
- **Registry**: a place to store images (Docker Hub, GitHub Container Registry, AWS ECR).

## Commands you will use daily

~~~bash
docker run -d -p 8080:80 --name web nginx   # run in background, map port
docker ps                                    # running containers
docker logs -f web                           # follow logs
docker exec -it web sh                       # open a shell inside
docker stop web && docker rm web             # stop and remove
docker images                                # local images
docker system prune                          # clean unused data
~~~

{{-p 8080:80}} means "host port 8080 forwards to container port 80".

Data inside a container disappears when it is removed. Keep data in **volumes**:

~~~bash
docker run -d -v mongo_data:/data/db -p 27017:27017 mongo:7
~~~
`
    ),
    lesson(
      'writing-a-dockerfile',
      'Writing a Dockerfile',
      'Layers, caching, multi-stage builds and running as a non-root user.',
      10,
      `
A **Dockerfile** is the recipe for an image. Each instruction creates a **layer**, and Docker caches layers, so order matters: put things that change rarely (dependencies) before things that change often (your source code).

## A MERN production Dockerfile

~~~dockerfile
# ---- stage 1: build the React app ----
FROM node:22-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---- stage 2: small runtime image ----
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev
COPY server/ ./server/
COPY --from=client-build /app/client/dist ./client/dist

EXPOSE 5000
USER node
CMD ["node", "server/src/server.js"]
~~~

## Why this is good

- **Multi-stage**: build tools stay in stage 1, the final image only has what it needs to run.
- **Dependency layer first**: if only your code changed, {{npm ci}} is served from cache.
- **Non-root user**: {{USER node}} means the app does not run as root.
- **Alpine base**: a small image means faster pulls and a smaller attack surface.

## .dockerignore

Keep junk out of the build context:

~~~text
node_modules
.git
.env
*.log
client/dist
~~~

## Build and run

~~~bash
docker build -t devops-roadmap:1.0 .
docker run -p 5000:5000 --env-file server/.env devops-roadmap:1.0
~~~

Pin versions ({{node:22-alpine}}), never rely on {{latest}} for production.
`
    ),
    lesson(
      'docker-compose',
      'Docker Compose',
      'Run your app, database and cache together from a single YAML file.',
      9,
      `
Real apps need several containers: web, database, cache. **Docker Compose** describes them all in one file and starts everything with one command.

## Edit and validate it here

Change the YAML below and press **Validate**. A common bug is wrong indentation, which this will catch.

~~~yaml run
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      MONGO_URI: mongodb://mongo:27017/devops_roadmap
      JWT_SECRET: change-me
      NODE_ENV: production
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

volumes:
  mongo_data:
~~~

## Things to notice

- Containers on the same Compose network reach each other by **service name**: the app connects to {{mongo}}, not {{localhost}}.
- {{depends_on}} controls start order, not "database is ready". Use a healthcheck if you need readiness.
- A named **volume** keeps database files when containers are recreated.

## Commands

~~~bash
docker compose up -d --build   # build and start in background
docker compose ps
docker compose logs -f app
docker compose down            # stop and remove containers (volumes stay)
docker compose down -v         # also delete volumes (data loss!)
~~~

> Do not put real secrets in a Compose file you commit. Use an {{env_file}} that is git-ignored, or your platform's secret store.
`
    ),
  ]
);

export const cicd = topic(
  'ci-cd',
  2,
  '🚀',
  'CI/CD Pipelines',
  'Automatically test, build and deploy every change so releases are boring.',
  [
    'Explain continuous integration, delivery and deployment',
    'Write a GitHub Actions workflow that tests and builds your app',
    'Use secrets and deployment strategies safely',
  ],
  [
    lesson(
      'cicd-concepts',
      'CI/CD Concepts',
      'What the pipeline stages are and why teams automate them.',
      8,
      `
**CI (Continuous Integration)**: every push is automatically built and tested, so broken code is caught in minutes.

**CD** has two meanings:

- **Continuous Delivery**: every passing change is ready to release; a human clicks the button.
- **Continuous Deployment**: every passing change goes to production automatically.

## A typical pipeline

~~~text
push -> install -> lint -> test -> build -> docker image -> deploy to staging -> deploy to production
~~~

If any step fails, the pipeline stops and the team is notified.

## Why it matters

- Small, frequent releases are less risky than big, rare ones.
- The same steps run every time, so no more "I forgot to run the tests".
- Rollbacks are easy because every version is built and stored.

## Deployment strategies

| Strategy | How it works | Trade-off |
|---|---|---|
| Rolling | Replace instances a few at a time | Simple, both versions live briefly |
| Blue/Green | Run old and new side by side, switch traffic | Instant rollback, double capacity |
| Canary | Send 5 percent of traffic to the new version first | Safest, needs good monitoring |

## Good habits

- Keep the pipeline fast (under 10 minutes), or people will skip it.
- Build once, deploy the **same artifact** to every environment.
- Keep configuration outside the artifact (environment variables).
- Always have a rollback plan before you deploy.
`
    ),
    lesson(
      'github-actions',
      'GitHub Actions',
      'A real workflow file that installs, builds, and deploys with secrets.',
      10,
      `
**GitHub Actions** runs workflows defined in {{.github/workflows/*.yml}}. A workflow has **jobs**, jobs have **steps**, and steps run commands or reusable **actions**.

## A CI workflow for this MERN project

Paste your own workflow here and press **Validate** to catch YAML mistakes before you push.

~~~yaml run
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: |
            server/package-lock.json
            client/package-lock.json

      - name: Install server dependencies
        run: npm ci --prefix server

      - name: Install and build client
        run: |
          npm ci --prefix client
          npm run build --prefix client

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger deploy hook
        run: curl -fsS -X POST "\${{ secrets.DEPLOY_HOOK_URL }}"
~~~

## Reading it

- {{on}}: what triggers the workflow.
- {{needs: build}}: the deploy job only runs if build passed.
- {{secrets.DEPLOY_HOOK_URL}}: stored in the repository under Settings, Secrets and variables, Actions. Secrets are masked in logs.
- {{cache: npm}} speeds up repeated installs.

## Tips

- Pin third-party actions to a version tag (or a commit SHA for sensitive repos).
- Give the workflow the minimum permissions it needs with a {{permissions:}} block.
- Use **environments** with required reviewers to gate production deploys.
`
    ),
  ]
);
