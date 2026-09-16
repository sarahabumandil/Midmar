<div align="center">

# ⚽ FOOTBRAIN

### the football brain your scouting department wishes it had

<img src="https://img.shields.io/badge/status-actively%20cooking-brightgreen?style=for-the-badge" />
<img src="https://img.shields.io/badge/stack-MERN%20%2B%20Python%20AI-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/vibe-immaculate-ff69b4?style=for-the-badge" />

<img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/Python-Flask-3776AB?style=flat-square&logo=python&logoColor=white" />
<img src="https://img.shields.io/badge/XGBoost-ML-red?style=flat-square" />
<img src="https://img.shields.io/badge/YOLO-CV-yellow?style=flat-square" />

**stats. predictions. video analysis. all in one app.**
**no cap, it's basically Football Manager meets Moneyball.**

<!--
  📸 DROP YOUR SCREENSHOTS/GIFS HERE
  record a quick screen capture of the dashboard (Kap / ScreenToGif / Peek all work great,
  free, no watermark), save it as a .gif in a /docs or /assets folder, then point the tag below at it.
  keep gifs under ~5MB and under 10s so the README doesn't lag on load.
-->
<img src="./docs/demo.gif" width="800" alt="FootBrain dashboard demo — replace with your own recording" />

</div>

---

## TL;DR 🧠

FootBrain is a full-stack platform that helps football (soccer) clubs make data-backed decisions:

- 📊 **Player stats & performance tracking**
- 💰 **Market value prediction** (goals, assists, position, age → € estimate, via ML)
- 🩹 **Injury risk prediction** (physical stats → risk score)
- 🎥 **Video analysis** — upload match footage, get player tracking + distance-covered breakdowns
- 🛡️ **Admin panel** — user management, activity logs, analytics

It's three apps wearing a trenchcoat: a **React frontend**, a **Node/Express + MongoDB backend**, and a **Python/Flask AI microservice**. They talk to each other over HTTP. That's it, that's the whole plot.

---

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Features, in Detail](#-features-in-detail)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Data Models](#-data-models)
- [Known Issues & Roadmap](#-known-issues--roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🏗 Architecture

Three services, three jobs, zero drama (when it's all running):

```mermaid
flowchart LR
    subgraph Client["🖥️ Browser"]
        FE["React + Vite<br/>(port 8080)"]
    end

    subgraph Backend["🟢 Node/Express API<br/>(port 3000/3001)"]
        Auth["Auth<br/>JWT + bcrypt"]
        CRUD["Players / Matches /<br/>Teams / Admin"]
        Proxy["AI Proxy Layer"]
    end

    subgraph AI["🐍 Python/Flask AI Service<br/>(port 5000)"]
        MV["Market Value Model<br/>(XGBoost)"]
        Injury["Injury Risk Model<br/>(XGBoost)"]
        CV["Video Analysis<br/>(OpenCV + YOLO/Torch)"]
    end

    DB[("🍃 MongoDB Atlas")]

    FE -->|"/api/*"| Auth
    FE -->|"/api/*"| CRUD
    Auth --> DB
    CRUD --> DB
    CRUD -->|"video, predictions"| Proxy
    Proxy -->|"REST calls"| AI
    AI -->|"analyzed .mp4"| Proxy
```

**Why split it this way?** Node is great at CRUD + auth + talking to a database. Python is where the ML/CV ecosystem (scikit-learn, XGBoost, OpenCV, PyTorch) actually lives. So the Node server handles everything "app-shaped," and forwards anything "model-shaped" to the Python service, then relays the result back to the browser. The frontend never talks to Python directly.

---

## 🧰 Tech Stack

| Layer | Tech | Why |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite, React Router, TanStack Query | fast dev server, typed, industry-standard routing/data-fetching |
| **UI** | shadcn/ui (Radix primitives) + Tailwind CSS | accessible components, fully stylable, no design-system lock-in |
| **Forms** | React Hook Form + Zod | typed, validated forms without the boilerplate |
| **Backend** | Node.js, Express | simple, unopinionated REST API |
| **Auth** | JWT + bcryptjs | stateless sessions, salted+hashed passwords |
| **Database** | MongoDB Atlas (via Mongoose) | flexible schema for evolving player/match data |
| **File uploads** | Multer | handles match-video uploads |
| **AI service** | Python, Flask, Flask-CORS | lightweight API for serving ML models |
| **ML models** | XGBoost, scikit-learn | market value & injury-risk prediction |
| **Computer vision** | OpenCV, PyTorch, Ultralytics (YOLO) | player detection/tracking in match video |
| **Testing** | Vitest + Testing Library | frontend unit tests |
| **Linting** | ESLint + typescript-eslint | keeps the codebase from turning into spaghetti |

---

## ✨ Features, in Detail

### 1. Auth & Accounts
Email/password signup and login. Passwords are salted and hashed with bcrypt (never stored in plain text — checked, confirmed). JWTs expire after 7 days. There's a dedicated `admin` role, gated by a `ProtectedRoute` / `AdminRoute` wrapper in the frontend router.

### 2. Player Management
CRUD for players, bulk import (CSV-based import script in `/scripts`), performance trend tracking over time (`PlayerAggregate`, `PlayerMatchStat` models), per-player reset logs for when a player's prediction data needs to be recalculated.

### 3. Market Value Prediction
Feed it age, goals, assists, minutes played, position, league, nationality — get back a predicted transfer value in euros. There are **separate models per role**: a general model, a defender-specific model, and a goalkeeper-specific model (each trained on role-appropriate features, because a goalkeeper's value doesn't depend on goals scored).

### 4. Injury Risk Prediction
Takes physical attributes (height, weight, age, BMI, sprint speed, training load) — deliberately **not** the same features as the value model, since injury risk is a physical question, not a performance one — and returns a risk score.

### 5. Video Analysis
Upload match footage → the Python service runs computer vision (OpenCV + a YOLO-based model, `goalnet.pt`) to track players and compute distance covered, then writes an annotated output video. The Node backend streams that video back to the browser with proper range-request support (so scrubbing/seeking actually works).

### 6. Admin Dashboard
User management, activity logs (who did what, when — every login, signup, and prediction is logged), analytics, report requests via email, and app-wide settings.

---

## 📁 Project Structure

```
FOOTBRAIN/
├── src/                      # React frontend
│   ├── Components/           # UI components (shadcn/ui in Components/ui)
│   ├── pages/                # route-level pages (+ pages/admin/*)
│   ├── contexts/             # AuthContext
│   ├── services/             # api.ts — all backend calls live here
│   └── hooks/
├── server/                   # Node/Express backend
│   ├── controllers/          # request handlers
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express routers
│   ├── middleware/            # auth, error handling
│   ├── services/              # business logic (activity log, admin init, age sync)
│   └── python-api/            # 🐍 the AI microservice lives HERE (see below)
└── python-api/                 # ⚠️ legacy/duplicate copy — see Known Issues
```

> **Heads up:** there are currently *two* Python API folders (`/python-api` and `/server/python-api`). The one under `server/` is the real, current one. See [Known Issues](#-known-issues--roadmap).

---

## 🚀 Getting Started

You'll be running **three processes** at once. `concurrently` is already wired up to do this in one command, but here's the breakdown either way.

### Prereqs
- Node.js 18+
- Python 3.11 (the venv in this repo was built against 3.11 — newer versions may fight with `numpy`/`opencv` pins)
- A MongoDB Atlas cluster (or local MongoDB)

### 1. Clone & install
```bash
git clone https://github.com/Abdelrahmann23/FOOTBRAIN.git
cd FOOTBRAIN

# frontend deps
npm install

# backend deps
cd server && npm install && cd ..
```

### 2. Set up your environment variables
```bash
cd server
cp .env.example .env
```
Then fill in `.env` — see [Environment Variables](#-environment-variables) below for what each one does. **Do not commit this file.**

### 3. Install the Python AI service
```bash
cd server/python-api
pip install -r requirements.txt
```
> ⚠️ `requirements.txt` is currently missing `torch` and `ultralytics`, which the video-analysis pipeline needs. Add them yourself for now:
> ```bash
> pip install torch ultralytics
> ```

### 4. Run everything at once
```bash
npm run dev:all
```
This spins up:
- 🎨 frontend → `http://localhost:8080`
- 🟢 backend → `http://localhost:3000` (or `3001`, check your `.env`)
- 🐍 Python AI → `http://localhost:5000`

Or run them separately in three terminals with `npm run dev`, `npm run dev:server`, and `npm run dev:python`.

### 5. Build for production
```bash
npm run build
```
Outputs static files to `/dist`.

---

## 🔑 Environment Variables

All of these live in `server/.env` (copy from `server/.env.example`):

| Variable | What it does | Example |
|---|---|---|
| `MONGODB_URI` | Your Atlas (or local) connection string | `mongodb+srv://user:pass@cluster.mongodb.net/FOOTBRAIN` |
| `MONGODB_DB` | Database name to force (avoids Atlas defaulting to `test`) | `FOOTBRAIN` |
| `JWT_SECRET` | Signs auth tokens — **must** be a long random string in production | `openssl rand -hex 32` |
| `PORT` | Backend server port | `3000` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed admin account created on first run | change these immediately |
| `PYTHON_API_URL` | Where the backend finds the AI service | `http://127.0.0.1:5000` |

For the **frontend**, create a `.env` in the repo root with:

| Variable | What it does |
|---|---|
| `VITE_API_URL` | Base URL the frontend uses to hit the backend |
| `VITE_BACKEND_PORT` | Used by the Vite dev proxy for `/api` requests |

---

## 📡 API Reference

Base path: `/api`

| Method | Endpoint | What it does |
|---|---|---|
| `POST` | `/auth/signup` | create account |
| `POST` | `/auth/login` | log in, get JWT |
| `GET` | `/auth/verify` | validate a token |
| `GET` | `/players/:globalId` | get one player |
| `GET` | `/players/:globalId/trends` | performance trends over time |
| `POST` | `/players/bulk` | bulk import players |
| `POST` | `/matches/:matchId/raw-insights` | ingest raw match data |
| `POST` | `/matches/:matchId/map-ids` | reconcile player IDs across sources |
| `POST` | `/matches/:matchId/finalize` | finalize match processing |
| `POST` | `/ai/predict/market-value` | 💰 predict a player's transfer value |
| `POST` | `/ai/predict/injury` | 🩹 predict injury risk |
| `POST` | `/ai/analyze-video` | 🎥 upload + analyze match footage |
| `POST` | `/ai/commit-video-analysis` | save analysis results |
| `GET` | `/ai/analysis-output/:filename` | stream back the annotated video |
| `GET` | `/ai/health` | is the AI service alive? |
| `GET` | `/dashboard/stats` | dashboard summary numbers |
| `GET` | `/dashboard/recent-activity` | recent activity feed |
| `GET` | `/dashboard/risk-overview` | injury risk overview |
| `GET` | `/dashboard/performance-trends` | league/team-wide trends |
| `GET` | `/admin/users` · `POST /admin/users` · `PUT/DELETE /admin/users/:email` | user management |
| `GET` | `/admin/activity-logs` | full audit log |
| `GET` | `/admin/analytics` | admin-level analytics |
| `PUT` | `/account/me` · `/me/email` · `/me/password` · `/me/preferences` · `/me/team-settings` | self-service account settings |
| `POST` | `/reports/email` · `GET/POST /reports/requests` | request/send reports |
| `POST` | `/setup/setup-bulk` | initial data seeding |

All `/ai/*`, `/players/*`, and `/matches/*` routes require a valid JWT (`Authorization: Bearer <token>`), plus an "analyst" role check on the AI prediction endpoints.

---

## 🗄 Data Models

| Model | Purpose |
|---|---|
| `User` | account, role, team info, hashed password |
| `Player` | core player record |
| `PlayerAggregate` | rolled-up season/career stats |
| `PlayerMatchStat` | per-match stat lines |
| `PlayerResetLog` | audit trail for prediction-data resets |
| `Match` | match metadata |
| `Team` | club/team info |
| `MarketValuePrediction` / `InjuryPrediction` | stored model outputs |
| `IdMapping` | reconciles player IDs across different data sources |
| `ActivityLog` | every significant action, for the audit trail |
| `UserPreference` | per-user settings |
| `ReportEmailRequest` | tracks report-by-email requests |

---

## 🐛 Known Issues & Roadmap

Being real with you — here's what still needs work before this is production-clean:

- [ ] **🔴 Rotate secrets.** `server/.env` is (or has been) committed to git history with real MongoDB/JWT/admin credentials. Rotate them and make sure `.env` is gitignored going forward.
- [ ] **🔴 Clean up repo bloat.** A full Python virtualenv, the `dist/` build output, and uploaded/generated videos have ended up tracked in git. Needs a `.gitignore` pass + history rewrite (`git filter-repo`/BFG) to shrink the repo.
- [ ] **🟡 Merge the duplicate Python API.** `/python-api` (root) is a stale copy of `/server/python-api`. Pick one, delete the other.
- [ ] **🟡 Fix `requirements.txt`.** Missing `torch` and `ultralytics`, which video analysis actually depends on.
- [ ] **🟡 Remove hardcoded personal file paths** (`C:\Users\Dell\Downloads\...`) from `app.py` — use env vars with no machine-specific default.
- [ ] **🟢 ESLint cleanup.** Mostly `any` types in `src/services/api.ts` — tighten these up for real type safety.
- [ ] **🟢 Code-split the frontend bundle.** Main JS chunk is ~926KB — dynamic `import()` for heavy pages (Admin, VideoAnalysis) would help load time.

Bigger picture ideas for where this could go:
- Real-time match tracking (WebSocket live stats)
- Multi-camera video stitching for full-pitch coverage
- Team-vs-team tactical comparison views
- Mobile app (React Native shares a lot of the API surface already)

---

## 🤝 Contributing

1. Fork it
2. Branch off (`git checkout -b feat/your-idea`)
3. Commit with a message that isn't just "fix" (we've all been there, do better)
4. Open a PR

Run `npm run lint` and `npm test` before you push. Please.

---

## 📄 License

Not yet specified — add a `LICENSE` file (MIT is a solid default for a project like this) before treating this as open source.

<div align="center">

made with ⚽, ☕, and way too many `console.log`s

</div>
