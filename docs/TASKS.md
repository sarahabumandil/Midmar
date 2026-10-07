# Midmar — Task Breakdown (GitHub Issues)

Each row below is meant to become **one GitHub Issue**. Suggested `labels`, `assignee`, and `milestone` are included so you can create them consistently — either by hand or with the script in `scripts/create_issues.sh`.

**Suggested milestones to create first:** `Phase 0 — Foundation`, `Phase 1 — Core Features`, `Phase 2 — ML & CV`, `Phase 3 — Testing & Deployment`, `Phase 4 — Final Delivery`

**Suggested labels to create first:** `phase-0` `phase-1` `phase-2` `phase-3` `phase-4` `security` `bug` `feature` `chore` `docs` `ml` `frontend` `backend` `devops` `priority-high` `priority-medium` `priority-low`

---

## Phase 0 — Foundation & Technical Debt Cleanup

- [ ] **Rotate leaked MongoDB/JWT/admin credentials**
  `labels: security, priority-high, phase-0` · `assignee: Sarah` · `milestone: Phase 0`
  Generate new MongoDB Atlas credentials and a new JWT secret, invalidate the old ones, update `.env` locally (never commit it).

- [ ] **Remove `.env`, `dist/`, and `.venv311_new` from git history**
  `labels: security, chore, priority-high, phase-0` · `assignee: Mohamed` · `milestone: Phase 0`
  Add proper `.gitignore` rules, then use `git filter-repo` (or BFG) to strip these from history and shrink the repo.

- [ ] **Merge duplicate `/python-api` and `/server/python-api` folders**
  `labels: chore, ml, phase-0` · `assignee: Asala` · `milestone: Phase 0`
  Confirm `server/python-api` is the current version, delete the root-level duplicate, update any references.

- [ ] **Fix `requirements.txt` — add `torch` and `ultralytics`**
  `labels: bug, ml, phase-0` · `assignee: Asala` · `milestone: Phase 0`
  Pin versions so `pip install -r requirements.txt` fully reproduces the environment.

- [ ] **Remove hardcoded personal file paths from `app.py`**
  `labels: bug, chore, phase-0` · `assignee: Asala` · `milestone: Phase 0`
  Replace `C:\Users\Dell\...` style defaults with required environment variables (fail loudly if unset, don't silently fall back to a path that only exists on one laptop).

- [ ] **Set up GitHub Actions CI (lint + test on every PR)**
  `labels: devops, phase-0` · `assignee: Mohamed` · `milestone: Phase 0`

- [ ] **Publish `README.md` and this roadmap to the repo**
  `labels: docs, phase-0` · `assignee: Sarah` · `milestone: Phase 0`

---

## Phase 1 — Core Feature Stabilization

- [ ] **Audit role-based route protection (user / analyst / admin)**
  `labels: backend, security, phase-1` · `assignee: Sarah`

- [ ] **Polish player CRUD + bulk import flow**
  `labels: backend, frontend, phase-1` · `assignee: Sarah, Hala`

- [ ] **Build out dashboard analytics (stats, recent activity, trends)**
  `labels: frontend, phase-1` · `assignee: Hala`

- [ ] **Complete admin panel (user management, activity logs)**
  `labels: frontend, backend, phase-1` · `assignee: Hala, Sarah`

- [ ] **Frontend lint cleanup — remove `any` types in `src/services/api.ts`**
  `labels: frontend, chore, phase-1` · `assignee: Hala`

- [ ] **Write unit tests for auth + player API routes**
  `labels: backend, phase-1` · `assignee: Mohamed`

---

## Phase 2 — Machine Learning & Computer Vision

- [ ] **Collect and clean training data for market value models**
  `labels: ml, phase-2` · `assignee: Asala`

- [ ] **Train/validate general market value model**
  `labels: ml, phase-2` · `assignee: Asala`

- [ ] **Train/validate defender-specific market value model**
  `labels: ml, phase-2` · `assignee: Asala`

- [ ] **Train/validate goalkeeper-specific market value model**
  `labels: ml, phase-2` · `assignee: Asala`

- [ ] **Train/validate injury-risk model**
  `labels: ml, phase-2` · `assignee: Asala`

- [ ] **Stabilize video analysis pipeline (OpenCV + YOLO tracking)**
  `labels: ml, phase-2` · `assignee: Asala, Mohamed`

- [ ] **Integration test: Node backend ↔ Flask prediction round-trip**
  `labels: backend, ml, phase-2` · `assignee: Sarah, Asala`

- [ ] **Document model methodology, accuracy, and known limitations**
  `labels: docs, ml, phase-2` · `assignee: Asala`

---

## Phase 3 — Testing, Hardening & Deployment

- [ ] **Write end-to-end tests for critical user flows (login → predict → view result)**
  `labels: devops, phase-3` · `assignee: Mohamed`

- [ ] **Security review: auth, input validation, file upload handling**
  `labels: security, phase-3` · `assignee: Mohamed, Sarah`

- [ ] **Frontend bundle size / performance pass**
  `labels: frontend, phase-3` · `assignee: Hala`

- [ ] **Deploy frontend to Vercel**
  `labels: devops, phase-3` · `assignee: Mohamed`

- [ ] **Deploy backend + ML service to Render/Railway**
  `labels: devops, phase-3` · `assignee: Mohamed, Sarah`

- [ ] **Set up basic uptime/error monitoring in production**
  `labels: devops, phase-3` · `assignee: Mohamed`

- [ ] **Run user acceptance testing and log feedback**
  `labels: phase-3` · `assignee: all`

---

## Phase 4 — Final Delivery

- [ ] **Fix bugs surfaced during UAT**
  `labels: bug, phase-4` · `assignee: all`

- [ ] **Write final project report / thesis documentation**
  `labels: docs, phase-4` · `assignee: all`

- [ ] **Prepare final presentation and live demo**
  `labels: phase-4` · `assignee: all`

- [ ] **Conduct team post-mortem / lessons-learned session**
  `labels: docs, phase-4` · `assignee: all`

- [ ] **Publish forward roadmap for future contributors**
  `labels: docs, phase-4` · `assignee: Sarah`
