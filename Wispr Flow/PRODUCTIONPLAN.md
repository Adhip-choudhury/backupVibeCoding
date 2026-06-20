# Production Plan — Wispr Flow

> AI-Powered Shopfloor Optimization System (Automotive / Metalworking)

---

## Phase 1: Backend Foundation (Week 1)

- **FastAPI project** with PostgreSQL models: `Machine`, `Sample`, `SampleType`, `User`, `Alert`
- **REST API**: CRUD for machines & samples, CSV import endpoint, user auth (simple JWT)
- **Generate synthetic sample data** — realistic automotive quality measurements (e.g., shaft diameter, surface roughness, hardness, torque)
- **Seed script** to populate dev DB with sample machines + historical samples

## Phase 2: Dashboard UI (Week 2–3)

- **HTML + CSS + Vanilla JS** project (no framework — lightweight, offline-first)
- **Role-based views**:
  - **Operator**: Quality sample entry form (select machine, enter measurements)
  - **Quality Engineer**: Sample history table, trend charts, configure sample types
  - **Production Manager**: Live KPIs (defect rate, OEE, throughput), bottleneck highlights
- **Charts**: Chart.js for control charts, defect trend lines
- **WebSocket** for real-time updates on new sample entries

## Phase 3: Quality Rules Engine (Week 3–4)

- **Statistical Process Control (SPC)** module:
  - Mean, std-dev, upper/lower control limits per sample type
  - X-bar and R charts
  - Rule-based alerts (e.g., 3 points beyond 2σ, 7 points on one side)
- **Alert service**: Trigger `WARNING` / `CRITICAL` alerts, log to DB, push to dashboard
- **Configurable limits** per machine/sample type (engineers can tune thresholds)

## Phase 4: Scheduling Engine (Week 4–5)

- **State machine**: `QUEUED → RUNNING → PAUSED → COMPLETED | FAILED`
- **Constraint-based scheduler**: OR-Tools for job sequencing on machines
- **Quality-aware scheduling**: Flag machines that are in "quality drift" state as unavailable

## Phase 5: Deployment & Polish (Week 5–6)

- **Docker Compose** — `backend`, `dashboard`, `postgres` services
- **Offline-first**: All assets bundled, no external CDN dependencies
- **Startup script** for on-prem Windows/Linux deployment
- **Sample data generator** for demo/training mode
