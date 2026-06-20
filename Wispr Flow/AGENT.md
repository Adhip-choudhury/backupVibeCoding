# AI-Powered Shopfloor Optimization System

An intelligent manufacturing platform that collects quality sampling data from the shopfloor (defect rates, dimensions, tolerances, output measurements), analyzes it with AI/ML models to predict bottlenecks and quality drift, and surfaces recommendations via a live operations dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|---|
| Quality Sampling | Manual entry forms, batch CSV/Excel import, or API ingestion |
| Backend / API | Python (FastAPI) |
| AI / ML | scikit-learn, PyTorch (or TensorFlow) for anomaly detection & predictive quality |
| Data Pipeline | Batch import → validation layer → relational store |
| Relational DB | PostgreSQL (sample records, machine registry, maintenance logs) |
| Dashboard | React + TypeScript (real-time via WebSockets) |
| Scheduling Engine | Python (custom constraint-based or OR-Tools) |
| Containerization | Docker + Docker Compose |

---

## Getting Started

```bash
# Clone and enter project
git clone <repo-url> && cd shopfloor-optimizer

# Copy env template
cp .env.example .env

# Start all services (DB, backend, dashboard)
docker compose up --build

# Backend only (development)
cd backend && pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Dashboard (development)
cd dashboard && npm install && npm run dev
```

---

## Build & Test

```bash
# Backend — install deps
pip install -r backend/requirements.txt

# Backend — run all tests
cd backend && pytest

# Backend — run with coverage
cd backend && pytest --cov=app tests/

# Backend — lint & format
cd backend && ruff check . && black --check .

# ML models — retrain pipeline
cd backend && python scripts/train_models.py

# Dashboard — install deps
cd dashboard && npm install

# Dashboard — unit tests
cd dashboard && npm test

# Dashboard — build for production
cd dashboard && npm run build

# Dashboard — lint
cd dashboard && npm run lint

# Integration tests (requires Docker services running)
cd tests && pytest integration/
```

---

## Project Structure

| Path | Purpose |
|---|---|---|
| `backend/` | FastAPI application — all Python source |
| `backend/app/` | Core app: routes, services, models |
| `backend/app/sampling/` | Sample data parsers, importers, and validation logic |
| `backend/app/ai/` | ML model definitions, inference, anomaly detection |
| `backend/app/scheduling/` | Job rescheduling engine and constraint logic |
| `backend/app/alerts/` | Alert rule engine and notification dispatch |
| `backend/scripts/` | Model training, data seeding, migration scripts |
| `dashboard/src/` | React app — pages, components, WebSocket hooks |
| `dashboard/src/components/shopfloor/` | Live floor-map, machine cards, quality indicators |
| `infra/` | Docker Compose, PostgreSQL setup |
| `data/` | Sample quality datasets, fixture files for testing |
| `tests/integration/` | End-to-end tests that require running services |
| `docs/` | Architecture diagrams, sampling schema, API reference |

---

## Architecture Overview

```
Sample Data (manual entry / batch import) → Sampling Service → PostgreSQL
                                              ↓
                                        AI Engine (anomaly detection,
                                        bottleneck prediction,
                                        quality drift forecast)
                                              ↓
                                        Scheduling Engine (job replan)
                                              ↓
                                        PostgreSQL (decisions, logs)
                                              ↓
                                        FastAPI  ←→  Dashboard (WebSocket)
                                              ↓
                                        Alert Service → Operators
```

---

## Coding Conventions

- All sample data timestamps must be stored in **UTC**. Convert to local time only at the dashboard layer.
- ML model versions are tracked in `backend/app/ai/registry.py`. Never load a model file by hardcoded path; always go through the registry.
- Alert severity levels are `INFO`, `WARNING`, `CRITICAL`. Use only these — do not invent new levels.
- Scheduled job state machine: `QUEUED → RUNNING → PAUSED → COMPLETED | FAILED`. No direct jumps outside this sequence.
- WebSocket events follow the schema in `docs/ws-event-schema.json`. Add new event types there before implementing them.
- All ML inference calls must be wrapped in `try/except` with a graceful degradation fallback (log + continue, never hard crash the API).
- Use `pytest` fixtures for test data; do not write tests that hit real databases outside `tests/integration/`.

---

## Important Constraints

- **Never write to the database directly from the dashboard or scheduling engine.** All writes must go through `backend/app/sampling/`.
- **Do not retrain ML models inside the API request cycle.** Training runs via `scripts/train_models.py` on a scheduled job.
- **Do not hardcode machine IDs or sample type strings** in application logic. They live in `infra/machine-registry.json` and are loaded at startup.
- **Never send raw sample payloads to the dashboard** — apply the normalization layer in `backend/app/sampling/normalizer.py` first.
- The `backend/app/ai/` directory contains trained model artifacts (`.pkl`, `.pt`). Do not delete or overwrite them without versioning via the registry.

---

## Environment Variables

```env
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/shopfloor
ALERT_WEBHOOK_URL=<operator-notification-endpoint>
MODEL_REGISTRY_PATH=./backend/app/ai/registry.json

# Dashboard
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

---

## Agents

### sampling-data-analyst

description: Analyzes sampling ingestion code, import schemas, and batch validation logic in `backend/app/sampling/`. Reviews normalizer logic, validates that timestamp handling is UTC-correct, and flags any raw payload leaks to downstream layers. Invoke when adding new sample types, modifying the normalizer, or debugging data quality issues.
tools: read
model: claude-sonnet-4-6

---

### ml-model-reviewer

description: Reviews AI/ML code in `backend/app/ai/` — model architecture choices, feature engineering, anomaly detection thresholds, and model registry usage. Checks that inference paths have graceful degradation fallbacks and that no training logic runs inside request handlers. Invoke when modifying prediction models, adding new ML features, or before any model retraining run.
tools: read, bash
model: claude-opus-4-6

---

### scheduling-engine-developer

description: Implements and tests changes to the job rescheduling engine in `backend/app/scheduling/`. Understands the `QUEUED → RUNNING → PAUSED → COMPLETED | FAILED` state machine and constraint-based replanning logic. Invoke when adding new rescheduling rules, handling new failure modes, or integrating AI recommendations into the scheduler.
tools: read, write, bash
model: claude-sonnet-4-6

---

### dashboard-developer

description: Builds and maintains the React/TypeScript dashboard in `dashboard/src/`. Knows the WebSocket event schema in `docs/ws-event-schema.json`, the live shopfloor map components, and the rule that time conversion from UTC happens only at this layer. Invoke for all frontend work including new dashboard panels, alert UI, and real-time data binding.
tools: read, write, bash
model: claude-sonnet-4-6

---

### alert-and-integration-tester

description: Writes and runs integration tests in `tests/integration/` covering the full alert pipeline — from sample event to operator notification. Validates alert severity logic, webhook dispatch, and end-to-end flow with live Docker services. Invoke when adding new alert rules, testing notification delivery, or before any production deployment.
tools: read, write, bash
model: claude-sonnet-4-6