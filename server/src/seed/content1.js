import { lesson, topic } from './helpers.js';

export const backend = topic(
  'backend-fundamentals',
  1,
  '🧱',
  'Backend Fundamentals',
  'How the web works, how to design REST APIs, build servers with Node.js and Express, and protect them with authentication.',
  [
    'Explain what happens between typing a URL and seeing a page',
    'Design clean REST endpoints with correct status codes',
    'Build an Express API with validation and error handling',
    'Implement login with hashed passwords and JWT',
  ],
  [
    lesson(
      'how-the-web-works',
      'How the Web Works',
      'Clients, servers, HTTP requests and responses, and the status codes you will see every day.',
      9,
      `
Every website or app you use is a conversation between a **client** (browser, mobile app) and a **server** (a computer that runs your backend code). The language they speak is **HTTP**.

## The request and response cycle

1. You type a URL. The browser asks DNS to translate the domain name into an IP address.
2. The browser opens a TCP connection to that IP (and negotiates TLS if the URL is https).
3. It sends an HTTP **request**: a method, a path, headers and sometimes a body.
4. The server runs your code, talks to the database if needed, and sends back an HTTP **response**: a status code, headers and a body.

~~~text
GET /api/topics HTTP/1.1
Host: example.com
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

[{"slug":"docker","title":"Docker"}]
~~~

## Status codes you must know

| Code | Meaning | Typical use |
|---|---|---|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST that created something |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | Logged in, but not allowed |
| 404 | Not Found | Resource does not exist |
| 429 | Too Many Requests | Rate limit hit |
| 500 | Server Error | Your code crashed |

## Try it: take a URL apart

~~~js run
const url = new URL('https://api.example.com:8080/v1/users?role=admin&page=2#top');

console.log('protocol :', url.protocol);
console.log('host     :', url.hostname);
console.log('port     :', url.port);
console.log('path     :', url.pathname);
console.log('query    :', Object.fromEntries(url.searchParams));
~~~

> Tip: When something breaks, always ask "which half of the conversation failed?" Was the request wrong, or the response? Browser DevTools, Network tab, shows both.
`
    ),
    lesson(
      'rest-api-design',
      'REST API Design',
      'Resources, HTTP verbs, URL naming and response shapes that other developers will thank you for.',
      10,
      `
REST is a set of conventions for building APIs around **resources** (nouns) and **HTTP methods** (verbs). Following the conventions means any developer can guess how your API works.

## Naming rules

- Use plural nouns: {{/users}}, {{/posts}}, not {{/getUser}}.
- Nest only one level: {{/users/42/posts}} is fine, deeper gets painful.
- Use query strings for filtering and paging: {{/posts?tag=docker&page=2}}.
- Version your API when it becomes public: {{/api/v1/...}}.

## Methods map to actions

| Method | Path | Action |
|---|---|---|
| GET | /posts | List posts |
| GET | /posts/7 | Read one post |
| POST | /posts | Create a post |
| PUT | /posts/7 | Replace a post |
| PATCH | /posts/7 | Update part of a post |
| DELETE | /posts/7 | Delete a post |

GET must never change data. PUT and DELETE are **idempotent**: calling them twice leaves the same result as once.

## A consistent error shape

Pick one error format and use it everywhere:

~~~json
{
  "message": "Email is already registered.",
  "field": "email"
}
~~~

## Try it: a tiny in-memory API

This simulates what an Express controller does, so you can see the logic without a server.

~~~js run
const posts = [];
let nextId = 1;

function handle(method, path, body) {
  const m = path.match(/^\\/posts(?:\\/(\\d+))?$/);
  if (!m) return { status: 404, body: { message: 'Not found' } };
  const id = m[1] ? Number(m[1]) : null;

  if (method === 'GET' && !id) return { status: 200, body: posts };
  if (method === 'POST' && !id) {
    if (!body || !body.title) return { status: 400, body: { message: 'title is required' } };
    const post = { id: nextId++, title: body.title };
    posts.push(post);
    return { status: 201, body: post };
  }
  if (method === 'DELETE' && id) {
    const i = posts.findIndex((p) => p.id === id);
    if (i === -1) return { status: 404, body: { message: 'Post not found' } };
    posts.splice(i, 1);
    return { status: 200, body: { ok: true } };
  }
  return { status: 405, body: { message: 'Method not allowed' } };
}

console.log(handle('POST', '/posts', { title: 'Learn Docker' }));
console.log(handle('POST', '/posts', {}));
console.log(handle('GET', '/posts'));
console.log(handle('DELETE', '/posts/99'));
~~~
`
    ),
    lesson(
      'node-express-basics',
      'Node.js and Express Basics',
      'Create a server, add routes, middleware, validation and a central error handler.',
      11,
      `
**Node.js** runs JavaScript outside the browser. **Express** is a small library on top of it that makes routing and middleware easy.

## Minimal server

~~~js
import express from 'express';

const app = express();
app.use(express.json()); // parse JSON request bodies

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(5000, () => console.log('Listening on 5000'));
~~~

Run it with {{node server.js}} (add {{"type": "module"}} to package.json for the import syntax).

## Middleware

Middleware is a function that runs **between** the request and your route handler. Each one can change the request, end the response, or call {{next()}} to pass control on. Logging, authentication, rate limiting and body parsing are all middleware.

~~~js
function requireApiKey(req, res, next) {
  if (req.headers['x-api-key'] !== process.env.API_KEY) {
    return res.status(401).json({ message: 'Invalid API key' });
  }
  next();
}

app.get('/api/secret', requireApiKey, (req, res) => res.json({ secret: 42 }));
~~~

## Central error handling

An Express error handler has **four** arguments. Register it last.

~~~js
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: 'Something went wrong' });
});
~~~

## Project structure that scales

~~~text
src/
  server.js        # app setup and listen
  routes/          # URL -> controller mapping
  models/          # database schemas
  middleware/      # auth, validation, rate limit
  utils/           # small helpers
~~~

> Tip: Keep configuration (ports, secrets, database URLs) in environment variables, never in code. Locally use a {{.env}} file, in production use your host's settings page.
`
    ),
    lesson(
      'authentication-jwt',
      'Authentication with bcrypt and JWT',
      'Store passwords safely, issue tokens at login, and protect routes.',
      12,
      `
**Authentication** answers "who are you?". **Authorization** answers "what are you allowed to do?". Do not mix them up.

## Never store plain passwords

Hash passwords with a slow, salted algorithm such as **bcrypt**. Even if your database leaks, attackers cannot reverse the hashes quickly.

~~~js
import bcrypt from 'bcryptjs';

const hash = await bcrypt.hash(password, 11);      // on register
const ok = await bcrypt.compare(password, hash);   // on login
~~~

## What is a JWT?

A JSON Web Token has three base64 parts: **header.payload.signature**. The server signs the token with a secret. Anyone can read the payload, but nobody can change it without breaking the signature.

~~~js
import jwt from 'jsonwebtoken';

const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// middleware
const payload = jwt.verify(token, process.env.JWT_SECRET); // throws if invalid or expired
~~~

## Try it: look inside a token

~~~js run
// A sample JWT (header.payload.signature). Nothing secret here.
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJpZCI6IjY0YTEiLCJyb2xlIjoidXNlciIsImV4cCI6MTc5OTk5OTk5OX0.' +
  'signature-goes-here';

const [header, payload] = token.split('.');
const decode = (part) => JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));

console.log('header :', decode(header));
console.log('payload:', decode(payload));
console.log('Anyone can read this. Never put passwords inside a JWT.');
~~~

## Security checklist

- Keep {{JWT_SECRET}} long, random and out of Git.
- Use short expiry times and HTTPS only.
- Return the same error for "wrong email" and "wrong password".
- Add rate limiting on login routes to slow down guessing.
- Store tokens carefully: httpOnly cookies protect against XSS theft, localStorage is simpler but riskier.
`
    ),
  ]
);

export const databases = topic(
  'databases',
  1,
  '🗄️',
  'Databases',
  'SQL and NoSQL, schema design, indexes, transactions and caching with Redis.',
  [
    'Write SQL for creating, reading, joining and aggregating data',
    'Model data in MongoDB with Mongoose',
    'Explain why indexes and transactions matter',
    'Use Redis as a cache in front of a slow database',
  ],
  [
    lesson(
      'sql-basics',
      'SQL Basics',
      'Tables, CRUD, joins and aggregation using PostgreSQL / MySQL style SQL.',
      11,
      `
Relational databases store data in **tables** made of rows and columns. SQL (Structured Query Language) is how you talk to them.

## Create a table

~~~sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(80) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total NUMERIC(10,2) NOT NULL
);
~~~

## CRUD

~~~sql
INSERT INTO users (email, name) VALUES ('a@x.com', 'Asha');

SELECT id, name FROM users WHERE email = 'a@x.com';

UPDATE users SET name = 'Asha K' WHERE id = 1;

DELETE FROM users WHERE id = 1;
~~~

> Always write a WHERE clause on UPDATE and DELETE. Without it you change every row.

## Joins and aggregates

~~~sql
-- total spend per user, highest first
SELECT u.name, COUNT(o.id) AS orders, SUM(o.total) AS spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name
ORDER BY spent DESC
LIMIT 10;
~~~

- **INNER JOIN** keeps only rows that match on both sides.
- **LEFT JOIN** keeps every row from the left table, even without a match.
- **GROUP BY** collapses rows so you can use COUNT, SUM, AVG.

## When to pick SQL

Choose SQL when your data has clear relationships and you need strong consistency: payments, inventory, bookings.
`
    ),
    lesson(
      'mongodb-mongoose',
      'MongoDB and Mongoose',
      'Documents, schemas, queries and the patterns used in MERN apps.',
      11,
      `
**MongoDB** stores flexible JSON-like **documents** in **collections**. **Mongoose** adds schemas and validation on top.

## Define a model

~~~js
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 140 },
    slug: { type: String, unique: true, index: true },
    tags: [String],
    published: { type: Boolean, default: true },
  },
  { timestamps: true } // adds createdAt, updatedAt
);

export default mongoose.model('Post', postSchema);
~~~

## Common queries

~~~js
await Post.create({ title: 'Hello', slug: 'hello', tags: ['docker'] });

const latest = await Post.find({ published: true }).sort('-createdAt').limit(10).lean();

const one = await Post.findOne({ slug: 'hello' });

await Post.updateOne({ slug: 'hello' }, { $set: { published: false } });

await Post.deleteOne({ slug: 'hello' });
~~~

Use {{.lean()}} on read-only queries: it returns plain objects and is faster.

## Embed or reference?

| Embed inside the document | Reference by id |
|---|---|
| Data is read together (a post and its tags) | Data is shared or large (users and their posts) |
| Child data never grows without limit | Child collection can grow forever |

## Connecting safely

~~~js
await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
~~~

Keep {{MONGO_URI}} in an environment variable. For production use MongoDB Atlas and allow only your server's IP address when you can.
`
    ),
    lesson(
      'indexes-transactions',
      'Indexes, Transactions and Normalization',
      'Why queries get slow, how indexes fix it, and how to keep multi-step writes consistent.',
      10,
      `
## Indexes

Without an index, the database reads **every row** to find a match (a full scan). An index is a sorted lookup structure, like the index at the back of a book.

~~~sql
CREATE INDEX idx_orders_user ON orders (user_id);

-- see how the database will run a query
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;
~~~

~~~js
// MongoDB / Mongoose
postSchema.index({ tags: 1, createdAt: -1 });
~~~

Rules of thumb:

- Index columns you filter, join or sort on.
- Do not index everything. Each index slows down writes and uses memory.
- Put the most selective column first in a compound index.

## Transactions

A **transaction** groups several steps so they all succeed or all fail. Classic example: moving money between accounts.

~~~sql
BEGIN;
UPDATE accounts SET balance = balance - 500 WHERE id = 1;
UPDATE accounts SET balance = balance + 500 WHERE id = 2;
COMMIT;   -- or ROLLBACK; if anything failed
~~~

This is **ACID**: Atomicity, Consistency, Isolation, Durability.

## Normalization in one minute

Store each fact once. If a user's name lives in ten tables, one rename means ten updates and ten chances for a mistake. Split data into tables and connect them with ids. Denormalize (copy data) only on purpose, usually to make a read faster.
`
    ),
    lesson(
      'redis-caching',
      'Redis and Caching',
      'Keep hot data in memory with a TTL so your database does less work.',
      9,
      `
**Redis** is an in-memory key-value store. Reading from memory takes microseconds, a database query can take milliseconds or more.

## Cache-aside pattern

1. Look in the cache.
2. On a **hit**, return it.
3. On a **miss**, read from the database, store the result in the cache with a **TTL** (time to live), then return it.

~~~js
// With the 'redis' package
async function getTopics() {
  const cached = await redis.get('topics');
  if (cached) return JSON.parse(cached);

  const topics = await Topic.find().lean();
  await redis.set('topics', JSON.stringify(topics), { EX: 300 }); // 5 minutes
  return topics;
}
~~~

## Try it: a cache with expiry

~~~js run
const cache = new Map();

function cached(key, ttlMs, loader) {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) {
    console.log('HIT ', key);
    return hit.value;
  }
  console.log('MISS', key);
  const value = loader();
  cache.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

const slowQuery = () => ({ topics: 12 });

cached('stats', 1000, slowQuery);
cached('stats', 1000, slowQuery);
cached('stats', 1000, slowQuery);
~~~

## The hard part: invalidation

When the underlying data changes, the cache is wrong. Either delete the key on every write ({{redis.del('topics')}}) or accept stale data for the length of the TTL. Pick based on how much staleness your users can tolerate.
`
    ),
  ]
);

export const linux = topic(
  'linux-shell',
  1,
  '🐧',
  'Linux and Shell',
  'The command line skills every backend and DevOps engineer uses on servers every day.',
  [
    'Move around the filesystem and manage files from the terminal',
    'Understand permissions, users and processes',
    'Write Bash scripts that automate repeated work',
  ],
  [
    lesson(
      'linux-essentials',
      'Linux Essentials',
      'The commands for navigating, searching, reading logs and checking the system.',
      10,
      `
Almost every server runs Linux, and you will usually reach it over **SSH** with no mouse. Learn these commands until they are muscle memory.

## Navigation and files

~~~bash
pwd                    # where am I?
ls -lah                # list files with sizes, including hidden
cd /var/log            # change directory
mkdir -p app/logs      # create nested folders
cp config.yml config.bak
mv old.txt new.txt
rm -r build/           # delete a folder (careful: no recycle bin)
~~~

## Reading and searching

~~~bash
cat file.txt                 # print whole file
less big.log                 # scroll (q to quit)
tail -n 100 app.log          # last 100 lines
tail -f app.log              # follow new lines live
grep -rn "ERROR" /var/log/app   # search recursively with line numbers
find . -name "*.js" -mtime -1   # files changed in the last day
~~~

## Pipes combine small tools

~~~bash
# the 5 most common IPs in an access log
awk '{print $1}' access.log | sort | uniq -c | sort -nr | head -5
~~~

## Check the system

~~~bash
df -h          # disk space
free -m        # memory
top            # live CPU and processes (htop is nicer)
ss -tulpn      # which program listens on which port
curl -I https://example.com   # fetch only the headers
~~~

> Tip: Press the Tab key to autocomplete and the Up arrow to repeat commands. Press Ctrl+R to search your command history.
`
    ),
    lesson(
      'permissions-processes',
      'Permissions, Users and Processes',
      'Read and set file permissions, use sudo wisely, and manage running programs.',
      9,
      `
## Reading permissions

~~~text
-rwxr-xr--  1 anas devs  1204 Oct 18 12:00 deploy.sh
~~~

The first column has ten characters: file type, then three triplets for **owner**, **group** and **others**. Each triplet is read (r), write (w), execute (x).

Numbers are shortcuts: r=4, w=2, x=1. So {{rwx}} = 7, {{r-x}} = 5, {{r--}} = 4.

~~~bash
chmod 755 deploy.sh     # owner: rwx, group: r-x, others: r-x
chmod +x deploy.sh      # make it executable
chown anas:devs app/    # change owner and group
~~~

> Never use {{chmod 777}} to fix a "permission denied" error. Find out who needs access and give only that.

## Users and sudo

{{sudo}} runs one command as root. Use it sparingly and run applications as a normal user with only the permissions they need (principle of least privilege).

## Processes and services

~~~bash
ps aux | grep node        # find a process
kill 1234                 # ask it to stop (SIGTERM)
kill -9 1234              # force stop (last resort)

systemctl status nginx    # is the service running?
systemctl restart nginx
journalctl -u nginx -f    # follow that service's logs
~~~

## Environment variables

~~~bash
export NODE_ENV=production
printenv | grep NODE
~~~

Services started by systemd do not read your shell profile, so set variables in the unit file or an {{EnvironmentFile}}.
`
    ),
    lesson(
      'bash-scripting',
      'Bash Scripting',
      'Variables, conditions, loops and safe defaults for automation scripts.',
      10,
      `
A Bash script is just commands saved in a file. Scripts turn a 10-step manual deployment into one command.

## A safe starting template

~~~bash
#!/usr/bin/env bash
set -euo pipefail   # stop on error, on unset variables, and on pipe failures

APP_DIR="/var/www/app"
BRANCH="\${1:-main}"   # first argument, default "main"

echo "Deploying branch $BRANCH ..."
cd "$APP_DIR"
git pull origin "$BRANCH"
npm ci --omit=dev
npm run build
sudo systemctl restart app
echo "Done."
~~~

Run it with {{chmod +x deploy.sh && ./deploy.sh main}}.

## Conditions and loops

~~~bash
if [ -f ".env" ]; then
  echo ".env found"
else
  echo "Missing .env" >&2
  exit 1
fi

for service in api web worker; do
  if systemctl is-active --quiet "$service"; then
    echo "$service is running"
  else
    echo "$service is DOWN"
  fi
done
~~~

## Exit codes

Every command returns a number: **0 means success**, anything else is failure. CI systems use this to decide whether a step passed. Check the last one with {{echo $?}}.

## A tiny backup script

~~~bash
#!/usr/bin/env bash
set -euo pipefail
STAMP=$(date +%F)
mongodump --uri "$MONGO_URI" --archive="backup-$STAMP.gz" --gzip
find . -name "backup-*.gz" -mtime +7 -delete   # keep one week
~~~

Quote your variables ({{"$VAR"}}). Unquoted variables with spaces are the number one source of Bash bugs.
`
    ),
  ]
);
