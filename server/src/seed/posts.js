export const posts = [
  {
    slug: 'backend-devops-roadmap-where-to-start',
    title: 'Backend to DevOps Roadmap: Where to Start',
    excerpt:
      'A practical order for learning backend development and DevOps, with the reason behind each step.',
    tags: ['roadmap', 'career', 'beginners'],
    content: `
Most beginners lose months jumping between tools. The fix is to learn in an order where each step makes the next one easy.

## The order that works

1. **Backend fundamentals**: HTTP, REST, Node.js, a database, authentication. You cannot operate a system you have never built.
2. **Linux and Git**: servers run Linux, teams run Git. Both are used every day.
3. **Networking and security basics**: DNS, ports, HTTPS, common vulnerabilities.
4. **Docker**: package your own project so it runs the same everywhere.
5. **CI/CD**: automate test, build and deploy with GitHub Actions.
6. **Cloud and Kubernetes**: pick one cloud, then learn how containers run at scale.
7. **Infrastructure as Code**: Terraform and Ansible.
8. **Monitoring**: logs, metrics, alerts.

## One rule for every step

Do not just watch tutorials. After each topic, apply it to **one project** that you keep improving. For example: build an API, dockerize it, add CI, deploy it, then add monitoring. By the end you have a portfolio piece and real stories for interviews.

## What to do this week

- Pick the first topic you are not comfortable with and open its lessons on this site.
- Run the code examples in the browser and change them.
- Write down three things you learned. Teaching others is the fastest way to find gaps.

Follow the full [roadmap](/roadmap) when you are ready for the big picture.
`,
  },
  {
    slug: 'docker-commands-backend-developers-use-daily',
    title: 'Docker for Backend Developers: Commands You Will Use Daily',
    excerpt: 'Skip the theory overload. These are the Docker commands and habits that cover most daily work.',
    tags: ['docker', 'devops', 'cheatsheet'],
    content: `
You do not need to memorize every Docker flag. This short list covers most of your day.

## Running things

~~~bash
docker run -d --name db -p 27017:27017 -v mongo_data:/data/db mongo:7
docker ps
docker logs -f db
docker exec -it db mongosh
docker stop db && docker rm db
~~~

## Building your own image

~~~bash
docker build -t my-api:dev .
docker run --rm -p 5000:5000 --env-file .env my-api:dev
~~~

{{--rm}} removes the container when it stops, which keeps your machine clean.

## Compose for the whole stack

~~~bash
docker compose up -d --build
docker compose logs -f app
docker compose down
~~~

## Habits that save time

- Order Dockerfile steps so dependencies are cached and code changes are last.
- Add a {{.dockerignore}} so {{node_modules}} and {{.git}} are not sent to the build.
- Never bake secrets into an image. Pass them at runtime.
- Run {{docker system prune}} once in a while to free disk space.

Want the full picture? Read the [Docker topic](/learn/docker).
`,
  },
  {
    slug: 'deploy-mern-app-atlas-render',
    title: 'How to Deploy a MERN App with MongoDB Atlas and Render',
    excerpt: 'A step-by-step path from localhost to a public URL, with the mistakes beginners usually make.',
    tags: ['mern', 'deployment', 'tutorial'],
    content: `
Deploying is where many learners get stuck. Here is the path with the traps marked.

## 1. Get the app production-ready

- Read the port from {{process.env.PORT}}.
- Keep secrets in environment variables.
- Build React with {{npm run build}} and let Express serve the {{dist}} folder.

## 2. Create the database

Create a free Atlas cluster, add a database user, allow network access for your host, and copy the connection string.

**Trap:** special characters in the password break the connection string unless they are URL-encoded.

## 3. Push to GitHub

Make sure {{.env}} and {{node_modules}} are in {{.gitignore}}. If a secret was ever committed, rotate it.

## 4. Create the web service

On your host, connect the repo, set the build command ({{npm run build}}) and start command ({{npm start}}), then add your environment variables.

**Trap:** "Cannot GET /some-page" after refresh means the server is not returning {{index.html}} for unknown routes.

## 5. Verify

Open the {{/api/health}} URL, register a user, and check that data appears in Atlas.

Free tiers change over time and idle apps may sleep, so read your platform's current rules. The lesson [Deploy a MERN App](/learn/deploy-mern-app/atlas-and-hosting) has the full walkthrough.
`,
  },
  {
    slug: 'rest-api-best-practices-checklist',
    title: 'REST API Best Practices: A Checklist You Can Reuse',
    excerpt: 'Twelve checks to run before you call an API finished.',
    tags: ['api', 'backend', 'checklist'],
    content: `
Before you ship an endpoint, walk through this list.

## Design

1. Use plural nouns for resources ({{/users}}), and verbs only through HTTP methods.
2. Return the right status code: 201 for created, 400 for validation, 401 vs 403 correctly, 404 when missing.
3. Use one consistent error format for the whole API.
4. Support pagination ({{?page=2&limit=20}}) on any list that can grow.

## Safety

5. Validate every input on the server, even if the frontend validates too.
6. Check authorization on every route, including ownership of the resource.
7. Rate limit login, signup and contact routes.
8. Never return password hashes or internal fields.

## Operations

9. Add a health endpoint ({{/api/health}}).
10. Log errors with enough context (request id, route) but no secrets.
11. Keep configuration in environment variables.
12. Write at least a few tests for the main flows, and run them in CI.

Print this list and tick it off for every new project. The [REST API Design](/learn/backend-fundamentals/rest-api-design) lesson explains the thinking behind it.
`,
  },
  {
    slug: 'developer-to-devops-engineer-six-month-plan',
    title: 'From Developer to DevOps Engineer: A Six Month Plan',
    excerpt: 'A realistic schedule with one deliverable per month, so you always have something to show.',
    tags: ['career', 'plan', 'devops'],
    content: `
This plan assumes you can already build a basic backend and can study about ten hours a week. Adjust the pace to your life, and keep the deliverables.

## Month 1: Linux, Git and networking

Work on a Linux machine or WSL. Write three Bash scripts that solve real problems (backup, log summary, deploy). **Deliverable:** a GitHub repo of useful scripts with a good README.

## Month 2: Docker

Dockerize your own API with a multi-stage Dockerfile and a Compose file with the database. **Deliverable:** one command ({{docker compose up}}) starts your whole project.

## Month 3: CI/CD

Add a GitHub Actions pipeline that tests, builds an image and pushes it to a registry. **Deliverable:** a green pipeline badge in your README.

## Month 4: Cloud and deployment

Pick one cloud. Deploy the container to a managed service or a small VM, put a domain and HTTPS in front. **Deliverable:** a live URL.

## Month 5: Infrastructure as Code and Kubernetes basics

Recreate your infrastructure with Terraform. Run the app on a local Kubernetes cluster. **Deliverable:** infrastructure code in Git that anyone can apply.

## Month 6: Monitoring and polish

Add Prometheus metrics, a Grafana dashboard, an uptime check and one meaningful alert. Write a short postmortem of something you broke on purpose. **Deliverable:** a case study you can talk through in interviews.

## Keep it honest

Interviewers care more about what you understand and have actually run than about how many tools are on your CV. Use the [roadmap](/roadmap) to track progress and write about what you learn.
`,
  },
];
