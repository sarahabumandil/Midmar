#!/usr/bin/env bash
# ------------------------------------------------------------------
# Midmar — bulk-create GitHub issues from TASKS.md and add each one
# to the "Roadmap" project board.
#
# WHAT THIS DOES:
#   1. Creates labels (if they don't already exist)
#   2. Creates milestones Phase 0..4 (if they don't already exist)
#   3. Creates one GitHub Issue per task below, with labels + milestone
#   4. Adds each created issue to the user Project board (#8)
#
# BEFORE YOU RUN THIS:
#   - Install the GitHub CLI: https://cli.github.com
#   - Run:  gh auth login                     (log in with your account)
#   - Run:  gh auth refresh -s project         (grants permission to edit Projects)
#   - Fill in REPO, PROJECT_OWNER, PROJECT_NUMBER, and the GH_* usernames below
#   - Run this script from inside your cloned repo: bash scripts/create_issues.sh
# ------------------------------------------------------------------

set -e

# --- CONFIG: fill these in -----------------------------------------
REPO="Abdelrahmann23/FOOTBRAIN"        # owner/repo
PROJECT_OWNER="sarahabumandil"         # the account that owns the Project
PROJECT_NUMBER="8"                     # from the project URL .../projects/8

# Replace these with each teammate's actual GitHub username (not display name)
GH_SARAH="sarahabumandil"
GH_HALA="REPLACE_WITH_HALA_GITHUB_USERNAME"
GH_ASALA="REPLACE_WITH_ASALA_GITHUB_USERNAME"
GH_MOHAMED="REPLACE_WITH_MOHAMED_GITHUB_USERNAME"
# ---------------------------------------------------------------------

echo "==> Creating labels..."
create_label () {
  gh label create "$1" --repo "$REPO" --color "$2" --force
}
create_label "phase-0" "D4C5F9"
create_label "phase-1" "C5D9F9"
create_label "phase-2" "C5F9D4"
create_label "phase-3" "F9EFC5"
create_label "phase-4" "F9C5C5"
create_label "security" "B60205"
create_label "bug" "D73A4A"
create_label "feature" "0E8A16"
create_label "chore" "CCCCCC"
create_label "docs" "0075CA"
create_label "ml" "5319E7"
create_label "frontend" "1D76DB"
create_label "backend" "0E8A16"
create_label "devops" "FBCA04"

echo "==> Creating milestones..."
create_milestone () {
  gh api "repos/$REPO/milestones" -f title="$1" -f state="open" >/dev/null 2>&1 || true
}
create_milestone "Phase 0 — Foundation"
create_milestone "Phase 1 — Core Features"
create_milestone "Phase 2 — ML & CV"
create_milestone "Phase 3 — Testing & Deployment"
create_milestone "Phase 4 — Final Delivery"

# Helper: create an issue, assign it, add it to the project
make_issue () {
  local title="$1" body="$2" labels="$3" assignee="$4" milestone="$5"

  url=$(gh issue create --repo "$REPO" \
    --title "$title" \
    --body "$body" \
    --label "$labels" \
    --assignee "$assignee" \
    --milestone "$milestone")

  echo "Created: $url"
  gh project item-add "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --url "$url"
}

echo "==> Creating Phase 0 issues..."
make_issue "Rotate leaked MongoDB/JWT/admin credentials" \
  "Generate new MongoDB Atlas credentials and a new JWT secret, invalidate the old ones, update .env locally (never commit it)." \
  "security,priority-high,phase-0" "$GH_SARAH" "Phase 0 — Foundation"

make_issue "Remove .env, dist/, and .venv311_new from git history" \
  "Add proper .gitignore rules, then use git filter-repo (or BFG) to strip these from history and shrink the repo." \
  "security,chore,priority-high,phase-0" "$GH_MOHAMED" "Phase 0 — Foundation"

make_issue "Merge duplicate /python-api and /server/python-api folders" \
  "Confirm server/python-api is the current version, delete the root-level duplicate, update any references." \
  "chore,ml,phase-0" "$GH_ASALA" "Phase 0 — Foundation"

make_issue "Fix requirements.txt — add torch and ultralytics" \
  "Pin versions so pip install -r requirements.txt fully reproduces the environment." \
  "bug,ml,phase-0" "$GH_ASALA" "Phase 0 — Foundation"

make_issue "Remove hardcoded personal file paths from app.py" \
  "Replace C:\\Users\\Dell\\... style defaults with required environment variables." \
  "bug,chore,phase-0" "$GH_ASALA" "Phase 0 — Foundation"

make_issue "Set up GitHub Actions CI (lint + test on every PR)" \
  "Add a workflow that runs npm run lint and tests on every pull request." \
  "devops,phase-0" "$GH_MOHAMED" "Phase 0 — Foundation"

echo "==> Creating Phase 1 issues..."
make_issue "Audit role-based route protection (user / analyst / admin)" \
  "Verify every protected route correctly enforces its required role." \
  "backend,security,phase-1" "$GH_SARAH" "Phase 1 — Core Features"

make_issue "Polish player CRUD + bulk import flow" \
  "Stabilize create/edit/delete and bulk-import for players, frontend and backend." \
  "backend,frontend,phase-1" "$GH_SARAH" "Phase 1 — Core Features"

make_issue "Build out dashboard analytics" \
  "Stats, recent activity, and performance trends, connected to live data." \
  "frontend,phase-1" "$GH_HALA" "Phase 1 — Core Features"

make_issue "Complete admin panel (user management, activity logs)" \
  "Finish admin workflows for managing users and reviewing the activity audit log." \
  "frontend,backend,phase-1" "$GH_HALA" "Phase 1 — Core Features"

make_issue "Frontend lint cleanup — remove any types in src/services/api.ts" \
  "Replace loose 'any' types with real interfaces for API responses." \
  "frontend,chore,phase-1" "$GH_HALA" "Phase 1 — Core Features"

make_issue "Write unit tests for auth + player API routes" \
  "Cover signup/login/verify and core player CRUD endpoints." \
  "backend,phase-1" "$GH_MOHAMED" "Phase 1 — Core Features"

echo "==> Creating Phase 2 issues..."
make_issue "Collect and clean training data for market value models" \
  "Prepare a documented, versioned dataset for model training." \
  "ml,phase-2" "$GH_ASALA" "Phase 2 — ML & CV"

make_issue "Train/validate general market value model" \
  "Train and evaluate the general-position market value model, document MAE/RMSE." \
  "ml,phase-2" "$GH_ASALA" "Phase 2 — ML & CV"

make_issue "Train/validate defender-specific market value model" \
  "Train and evaluate the defender market value model." \
  "ml,phase-2" "$GH_ASALA" "Phase 2 — ML & CV"

make_issue "Train/validate goalkeeper-specific market value model" \
  "Train and evaluate the goalkeeper market value model." \
  "ml,phase-2" "$GH_ASALA" "Phase 2 — ML & CV"

make_issue "Train/validate injury-risk model" \
  "Train and evaluate the injury-risk classifier, document precision/recall/AUC." \
  "ml,phase-2" "$GH_ASALA" "Phase 2 — ML & CV"

make_issue "Stabilize video analysis pipeline (OpenCV + YOLO tracking)" \
  "Get the upload-to-annotated-output pipeline reliably working end to end." \
  "ml,phase-2" "$GH_ASALA" "Phase 2 — ML & CV"

make_issue "Integration test: Node backend <-> Flask prediction round-trip" \
  "Verify prediction requests/responses work correctly under realistic load." \
  "backend,ml,phase-2" "$GH_SARAH" "Phase 2 — ML & CV"

make_issue "Document model methodology, accuracy, and known limitations" \
  "Write up how each model was trained and what its limitations are." \
  "docs,ml,phase-2" "$GH_ASALA" "Phase 2 — ML & CV"

echo "==> Creating Phase 3 issues..."
make_issue "Write end-to-end tests for critical user flows" \
  "Cover login -> predict -> view result as an automated E2E test." \
  "devops,phase-3" "$GH_MOHAMED" "Phase 3 — Testing & Deployment"

make_issue "Security review: auth, input validation, file upload handling" \
  "Checklist-based review of the app's main attack surfaces." \
  "security,phase-3" "$GH_MOHAMED" "Phase 3 — Testing & Deployment"

make_issue "Frontend bundle size / performance pass" \
  "Code-split heavy pages, measure before/after load time." \
  "frontend,phase-3" "$GH_HALA" "Phase 3 — Testing & Deployment"

make_issue "Deploy frontend to Vercel" \
  "Set up production deployment with correct environment variables." \
  "devops,phase-3" "$GH_MOHAMED" "Phase 3 — Testing & Deployment"

make_issue "Deploy backend + ML service to Render/Railway" \
  "Set up production deployment for both services, wire up env vars." \
  "devops,phase-3" "$GH_MOHAMED" "Phase 3 — Testing & Deployment"

make_issue "Set up basic uptime/error monitoring in production" \
  "Minimal visibility into whether the deployed app is healthy." \
  "devops,phase-3" "$GH_MOHAMED" "Phase 3 — Testing & Deployment"

echo "==> Creating Phase 4 issues..."
make_issue "Write final project report / thesis documentation" \
  "Compile the final written deliverable for submission." \
  "docs,phase-4" "$GH_SARAH" "Phase 4 — Final Delivery"

make_issue "Prepare final presentation and live demo" \
  "Slides + rehearsed demo of the live application." \
  "phase-4" "$GH_SARAH" "Phase 4 — Final Delivery"

make_issue "Conduct team post-mortem / lessons-learned session" \
  "Internal retrospective: what worked, what didn't, what to carry forward." \
  "docs,phase-4" "$GH_SARAH" "Phase 4 — Final Delivery"

echo "==> Done. Check your Project board — all issues should now be there."
