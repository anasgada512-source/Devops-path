# DevOps Path - Backend + DevOps Roadmap (MERN)

W3Schools jaisa tutorial platform: **12 topics, 35 lessons**, har lesson me examples, browser me chalne wala **code playground**, **blog**, **login/signup (unique User ID)**, progress tracking, contact form, aur admin panel.

**Founder:** MOHD ANAS | **Phone:** +91 95205 00284 | **Email:** anasgada512@gmail.com

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, React Router |
| Backend | Node.js, Express, JWT, bcrypt, helmet, rate limiting |
| Database | MongoDB + Mongoose |
| DevOps | Dockerfile (multi-stage), docker-compose, GitHub Actions, Render blueprint |

## Features

- **Roadmap page**: 4 stages (Foundations, Core DevOps, Cloud and Scale, Operate and Ship) with a pipeline track.
- **Tutorials**: sidebar, previous/next, "Mark complete", search. Topics: Backend, Databases, Linux, Git, Networking/Security, Docker, CI/CD, Cloud/Kubernetes, IaC, Monitoring, System Design, MERN Deploy.
- **Code playground**: JavaScript chalta hai browser ke Web Worker me (4 sec limit, no network); YAML aur JSON validate/format hota hai. Lessons me "run" wale blocks editable hain.
- **Auth**: register/login, har user ko `DEV-00001` jaisa User ID, password bcrypt se hash, JWT 7 din.
- **Blog**: public list/search/tags. Admin ke liye write/edit/delete/draft.
- **Contact**: form database me save hota hai; admin dashboard me messages dikhte hain.
- **API fetch**: frontend poora data `/api/...` se fetch karta hai (topics, lessons, posts, progress, stats).
- Light/Dark theme, mobile responsive.

## 1. Local me chalana

Requirements: Node.js 18+ aur MongoDB (local ya Atlas).

```bash
# 1) dependencies
npm run install:all

# 2) server config
cp server/.env.example server/.env      # Windows: copy server\.env.example server\.env
#    server/.env kholo: MONGO_URI aur JWT_SECRET set karo

# 3) do terminals me:
npm run dev:server     # API  -> http://localhost:5000
npm run dev:client     # Site -> http://localhost:5173
```

Pehli baar server start hone par topics aur blog posts **apne aap database me seed** ho jate hain.

**Admin banne ke liye:** `server/.env` me `ADMIN_EMAIL` jis email par hai, usi email se **Register** karo. Wo account admin ban jata hai (blog likh sakta hai, contact messages dekh sakta hai).

## 2. Docker se (website + API + MongoDB ek command me)

```bash
docker compose up -d --build
# open http://localhost:5000
```

`docker-compose.yml` me `JWT_SECRET` badalna mat bhoolo.

## 3. Deploy karna (internet par live)

Sabse aasan: **ek hi service** (Express API + React build dono), database **MongoDB Atlas**.

### Step A: MongoDB Atlas (free database)

1. mongodb.com/atlas par account banao, **Free (M0) cluster** create karo.
2. **Database Access**: user banao (username + strong password).
3. **Network Access**: Add IP address. Free hosts ke IP change hote hain, isliye shuruat me `0.0.0.0/0` allow karte hain (password strong rakho).
4. **Connect > Drivers** se connection string copy karo. Database name add karo:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/devops_roadmap?retryWrites=true&w=majority`
   (Password me special characters hon to URL-encode karo.)

### Step B: Code GitHub par daalo

```bash
git init
git add .
git commit -m "DevOps Path MERN app"
git branch -M main
git remote add origin https://github.com/<your-username>/devops-path.git
git push -u origin main
```

`.env` file Git me nahi jati (`.gitignore` me hai). Secrets kabhi commit mat karo.

### Step C: Render par deploy

**Option 1 (Blueprint, sabse tez):** Render > New > **Blueprint** > apna repo select karo. `render.yaml` apne aap settings bhar dega. Sirf `MONGO_URI` paste karo.

**Option 2 (manual):** New > Web Service > repo select karo:

| Setting | Value |
|---|---|
| Build Command | `npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

Environment variables:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Atlas connection string |
| `JWT_SECRET` | lamba random string: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ADMIN_EMAIL` | anasgada512@gmail.com |

Deploy hone ke baad Render ka URL kholo, apne admin email se register karo. Done.

> Free plans par app idle hone par sleep ho sakta hai (pehla request slow). Platform ki current free-tier rules check kar lena.

### Option: Frontend aur backend alag (Vercel + Render)

1. Backend Render par deploy karo (upar jaisa) aur env me `CLIENT_URL=https://your-site.vercel.app` add karo.
2. Frontend Vercel par: Root Directory `client`, Build `npm run build`, Output `dist`, env `VITE_API_URL=https://your-api.onrender.com`.
   (`client/vercel.json` refresh par 404 hone se bachata hai.)

### Custom domain + HTTPS

Hosting dashboard me domain add karo, registrar me wahi CNAME/A record daalo jo dashboard dikhaye. HTTPS certificate platform khud deta hai.

## 4. Content badalna

- Lessons: `server/src/seed/content1.js`, `content2.js`, `content3.js`
- Blog posts (default): `server/src/seed/posts.js`
- Site naam, phone, email: `client/src/config.js`
- Colors/fonts: `client/src/styles.css` (top par `:root` tokens)

Seed sirf **khali collection** par chalta hai. Lesson files edit karne ke baad nayi content load karne ke liye: `npm run seed` (topics replace hote hain, users kabhi delete nahi hote).

Lesson/blog markup: `## Heading`, `**bold**`, `` `code` `` ya `{{code}}`, `- list`, `1. list`, `> tip`, `| table |`, `[link](https://...)`, aur code block `~~~bash ... ~~~`. Runnable block: `~~~js run`, `~~~yaml run`, `~~~json run`.

## 5. API reference

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | public |
| GET | `/api/auth/me` | user |
| GET | `/api/topics`, `/api/topics/:slug`, `/api/topics/:topic/lessons/:lesson` | public |
| GET | `/api/topics/search/all?q=` | public |
| GET / POST | `/api/progress` | user |
| GET | `/api/posts`, `/api/posts/:slug` | public (admin sees drafts) |
| POST / PUT / DELETE | `/api/posts`, `/api/posts/:id` | admin |
| POST | `/api/contact` | public (rate limited) |
| GET | `/api/contact` | admin |
| GET | `/api/stats`, `/api/health` | public |

## 6. Security notes

- Passwords bcrypt hash; login error generic; auth routes rate limited.
- helmet + strict Content-Security-Policy. Playground worker ko alag CSP milti hai: eval allowed lekin network blocked.
- React text ko escape karta hai; lesson/blog renderer `dangerouslySetInnerHTML` use nahi karta, unsafe links drop hote hain.
- Token `localStorage` me hai (simple). Zyada security chahiye to httpOnly cookie par shift karo.
- Production me strong `JWT_SECRET` zaroori hai (server bina uske start nahi hota).

## 7. Troubleshooting

| Problem | Fix |
|---|---|
| `MONGO_URI is missing` | `server/.env` banao ya host par env var set karo |
| Atlas connect nahi ho raha | Network Access me IP allow karo; password URL-encode karo |
| Refresh par 404 | Single-service deploy me Express khud handle karta hai. Vercel/Netlify par `vercel.json` / `_redirects` use hota hai |
| Admin nahi ban raha | `ADMIN_EMAIL` wahi email ho jisse register kiya; ye sirf **register** ke time check hota hai |
| Playground "Run" nahi chal raha | Site HTTPS/localhost par kholo; browser Web Workers allow kare |
