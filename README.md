# ReSlot

**Minimum-Disruption Timetable Recovery**

**[Round 1 Submission — Ideation & Initial Submission](./docs/ROUND1_SUBMISSION.md)**

Individual Participation · Web-A-Thone 2.0 — Nexus Spring Of Code

> **Round 1 repository scope:** This submission contains this README and the Round 1 document only. The existing implementation, tests, screenshots and detailed supporting documents remain in the local project and are not uploaded here. Setup commands and supporting links below describe that full project; they require its source and will not work from this documentation-only checkout.

Generate conflict-free academic timetables and repair disruptions while changing as little of the published schedule as possible.

Built for **Web-A-Thone 2.0 — Nexus Spring Of Code**, Problem Statement #14: AI-Based Timetable Generation System.

## The problem
Academic schedules coordinate teachers, student cohorts, classrooms, laboratories and availability. After publication, an absent teacher or closed room can trigger a cascade of changes. Regenerating an entire week may solve conflicts while disrupting everyone else.

## Our solution — and why it is different
**Traditional:** Generate → Publish

**ReSlot:** Generate → Publish → Disruption → Minimum-Change Repair → Compare → Approve

ReSlot treats the published timetable as a baseline, minimizes changed classes, explains the differences and requires human approval before replacing it. This is a working constraint solver and persisted workflow, not an LLM-generated timetable or a static demo.

**Verified demo run:** 72 sessions → teacher unavailable → **1 changed, 71 unchanged, 98.6% stability, 0 hard conflicts**. CP-SAT returned OPTIMAL for that repair. Results are computed from actual assignments; counts may vary with inputs and environment.

## Demo
- Live application: **not deployed — add URL after deployment**
- Demo video: **not recorded — add URL after recording**
- [3–5 minute presentation and exact demo steps](docs/DEMO_GUIDE.md)

## Screenshots
![Recovery comparison with 71 preserved classes](docs/screenshots/recovery-desktop.png)

[Timetable](docs/screenshots/timetable-desktop.png) · [Explanation](docs/screenshots/explanation-desktop.png) · [Mobile](docs/screenshots/timetable-mobile.png) · [Tablet](docs/screenshots/timetable-tablet.png). All displayed values come from the solver.

## Core workflow
1. Open Setup and load the 72-session demo, or add/import your own academic resources.
2. Generate a candidate and inspect its timetable, solver status and hard-conflict count.
3. An administrator approves and publishes the baseline.
4. Report teacher, room/lab or timeslot unavailability.
5. Run repair; compare actual before/after assignments and open a changed class's explanation.
6. Approve the recovery; inspect the preserved previous version in history.

Faculty, room and cohort filters, duration continuation rows, CSV preview/row errors, constraint editing, real request states and safe API errors are included.

## Architecture
```mermaid
flowchart LR
  Browser --> Next[Next.js interface]
  Browser -->|Authenticated JSON| API[FastAPI]
  API --> Services[Scheduling services]
  Services --> Solver[OR-Tools CP-SAT]
  Solver --> Validator[Independent validator]
  Services --> DB[(PostgreSQL)]
  API --> Auth[Supabase JWT verification]
```
One backend service, one frontend, one database. No microservices, Kafka, RAG or LLM agents.

## Optimization strategy
Hard constraints enforce teacher/cohort/room non-overlap, availability, capacity, room type, all required sessions and duration/day boundaries. Integer start/room choices and intervals feed CP-SAT. The repair objective prioritizes **changed-class count → change severity → earlier-period preference** using mathematically bounded weights. The baseline is hinted but never forced. A separate validator checks solver output and checks persisted entries again before publication.

Only OPTIMAL means proven optimal. FEASIBLE is a valid incumbent without that proof; INFEASIBLE and UNKNOWN are distinct. [Read the objective proof](docs/OPTIMIZATION_ENGINE.md).

## Tech stack
Next.js App Router, strict TypeScript, Tailwind CSS, Lucide, FastAPI, Pydantic, SQLAlchemy, Alembic, OR-Tools CP-SAT, PostgreSQL, Supabase Auth integration, pytest and Vitest/Testing Library. Explicit local demo authentication and SQLite fallback allow development without credentials.

## Repository structure
```text
apps/web/             Next.js views, components, API client and tests
apps/api/app/         HTTP, auth, persistence, services and pure solver
apps/api/migrations/  Alembic schema revisions
apps/api/tests/       Solver, API and authentication regressions
sample-data/          Institution JSON, four CSV catalogs and constraints
scripts/              Demo validation, API seed, provisioning, PostgreSQL check
docs/                 Product, engineering, operations and demo references
.github/workflows/    CI with PostgreSQL integration
```
The repository root is the project root; no redundant `reslot/` wrapper directory. Class sessions are derived from course requirements and snapshotted rather than duplicated in a mutable catalog table. Resource references are application-validated within organization snapshots.

## Getting started
Requires Python 3.11+ and Node 22+.
```bash
npm install
python3 -m venv .venv
.venv/bin/pip install -r apps/api/requirements.txt
cp .env.example .env
PYTHONPATH=apps/api .venv/bin/alembic -c apps/api/alembic.ini upgrade head
PYTHONPATH=apps/api .venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
In a second terminal:
```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```
Open **http://localhost:3000/setup**. The example enables local demo mode and SQLite. It must not be exposed publicly. No external secrets are needed for this local workflow.

## PostgreSQL and environment variables
```bash
docker compose up -d db
```
Set DATABASE_URL in root `.env` to `postgresql+psycopg://reslot:reslot@localhost:5432/reslot`, rerun the migration, and restart the API. Supabase PostgreSQL works through the same SQLAlchemy connection layer.

Root backend settings: DATABASE_URL, DEMO_MODE, ENVIRONMENT, SUPABASE_URL, CORS_ORIGINS, SOLVER_SECONDS. Frontend settings, when needed, go in `apps/web/.env.local`: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY. See [.env.example](.env.example) and [full configuration reference](docs/TECHNICAL_DOCUMENTATION.md). Never commit populated environment files.

## Running tests and builds
```bash
.venv/bin/ruff check apps/api
.venv/bin/python -m pytest apps/api/tests
npm run lint
npm run typecheck
npm test
npm run build
PYTHONPATH=apps/api .venv/bin/python scripts/validate-demo.py
```
Verified: **32 backend tests and 7 frontend tests pass**, production build passes, PostgreSQL migration and persisted lifecycle pass. See [verification details and measured latency](docs/TESTING.md). Generation used about 5.0–5.2 seconds; repair about 0.7–0.8 seconds in representative runs. The initial-generation sub-five-second target is not yet met with the default budget.

## Demo dataset
10 teachers, 8 rooms (3 laboratories), 6 cohorts, 12 courses and 72 class sessions across a five-day, seven-period week. Availability and blocked slots are real constraints. `scripts/validate-demo.py` generates a baseline and selects a genuinely occupied teacher slot to disrupt. `scripts/seed-demo-data.py` loads the same catalog through the running API.

## API documentation
FastAPI interactive documentation: **http://localhost:8000/docs**. [Endpoint contracts and examples](docs/API_DOCUMENTATION.md) cover generation, repair, publication, diff, resources, constraints and CSV imports.

## Documentation index
- [Round 1 submission](docs/ROUND1_SUBMISSION.md)
- [Product description](docs/PRODUCT_DESCRIPTION.md)
- [Design and UX](docs/DESIGN_DOCUMENT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Developer reference](docs/TECHNICAL_DOCUMENTATION.md)
- [API reference](docs/API_DOCUMENTATION.md)
- [Database design](docs/DATABASE_DESIGN.md)
- [Optimization engine](docs/OPTIMIZATION_ENGINE.md)
- [Security](docs/SECURITY.md)
- [Testing and results](docs/TESTING.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Production readiness](docs/PRODUCTION_READINESS.md)
- [Demo guide](docs/DEMO_GUIDE.md)
- [Contributing](docs/CONTRIBUTING.md)
- [Agent instructions](AGENTS.md) / [documentation reference](docs/AGENTS.md)
- [Execution plan](docs/EXECUTION_PLAN.md)
- ADRs: [monorepo](docs/DECISIONS/ADR-001-monorepo.md), [CP-SAT](docs/DECISIONS/ADR-002-ortools.md), [PostgreSQL](docs/DECISIONS/ADR-003-postgresql.md)
- [Changelog](CHANGELOG.md)

## Security and deployment
Authenticated tenant-scoped access, server-side roles, signature/issuer/audience/expiry verification, bounded uploads and models, safe queries and errors, independent validation and stale-version rejection are implemented. Production refuses demo auth. Provision memberships with the operator script. Deployment needs a Supabase database/Auth project and frontend/API hosting configuration; no live deployment is claimed. Follow [DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Known limits and future scope
Weekly recurring periods, fixed assigned teachers/cohorts, one organization membership per user and synchronous bounded solves. No public rate limiter, durable jobs, holiday calendar, substitute-teacher search or emergency-session insertion UI. JSON resource references are application-enforced, not fully normalized foreign keys. Supabase hosted sign-in requires credentials and has not been exercised against a live project. Production hardening is documented explicitly.

P2: PDF/calendar export, notifications, natural-language constraint assistance and richer analytics. None are presented as completed features.

## Team
Add team members, roles and contact links before submission.

## License
[MIT](LICENSE).
