# AGENTS.md – Organization‑Level Simulation System

This project is an industry‑level simulation platform to model **entire organizations** as node‑based workflows on a visual canvas. The user will define specific industries via **custom nodes and workflows**, so no deep‑dive into any particular industry is required from the implementation side.

## Project overview

- **Goal**: Build a modular, node‑based simulator that can model:
  - Departments, roles, teams, machines, and processes.
  - Workflows, decisions, and communication across the organization.
- Users can:
  - Drag and drop nodes onto a canvas.
  - Connect nodes into end‑to‑end organization‑wide processes.
  - Run simulations to see:
    - Cycle times, throughput, bottlenecks.
    - Resource utilization, cost, and error rates.
- **User‑driven industries**: The user creates their own workflows and custom nodes for each industry (e.g., manufacturing, hospital, software company) — the engine does **not hard‑code any industry**.

## UI implementation options

### Option 1: Python + PyQt (desktop app)

- Stack:
  - GUI: PyQt5/PySide6 with a custom diagram/canvas widget.
  - Backend logic: Python (models, simulation engine, data persistence).
- Responsibilities:
  - Canvas handles:
    - Dragging nodes from a palette.
    - Connecting nodes via rubber‑band lines.
    - Zoom/pan, grid, selection.
  - Right‑side panel:
    - Properties editor for selected node.
    - Node editor for creating custom nodes (name, ports, properties).
  - Simulation tab:
    - “Run”, “Pause”, “Stop” buttons.
    - Charts and logs (Matplotlib or similar).

### Option 2: React + React Flow (web app)

- Stack:
  - Frontend: React + TypeScript + React Flow.
  - Styling: Tailwind CSS or similar.
  - Backend: FastAPI (Python) for simulation logic and API.
- Responsibilities:
  - React Flow provides:
    - Nodes, edges, zoom/pan, minimap.
  - Extra UI:
    - Node palette (left panel).
    - Properties panel (right panel).
    - “Create Custom Node” UI.
    - Simulation controls and analytics tab.
  - FastAPI exposes:
    - `/simulate` (POST workflow JSON, returns run ID + metrics).
    - `/workflows` (save/load workflows).

Pick **one** stack (or later support both) and keep the node‑type logic and simulation engine **stack‑agnostic**.

## Core node types (no industries specified)

Define **generic node types** that can be reused for any organization:

### 1. Execution / Work nodes

- `Task (Manual)` – Human task.
- `Task (Automated)` – System/bot/script task.
- `Batch Task` – Batch processing (e.g., reports, prints).
- `Meeting / Workshop` – Group activity.

### 2. Decision & control nodes

- `Decision (Rule‑based)` – Condition on numeric/boolean properties.
- `Decision (Probabilistic)` – Random success/failure.
- `Split / Gateway` – Parallel paths (AND, XOR).
- `Merge / Join` – Rejoin parallel paths.

### 3. Resource & people nodes

- `Human Role` – e.g., “Engineer”, “Manager”.
- `Team` – Group of roles.
- `Machine / Server / Tool` – Equipment, servers, tools.
- `Queue / Buffer` – Holding area (inbox, backlog, pending QC).

### 4. Communication & integration nodes

- `Email / Notification` – Internal/external comms.
- `API / External System` – CRM, ERP, HRIS, etc.
- `Document / Form` – Data container (invoice, ticket, etc.).
- `Event (Trigger)` – Time‑based or external trigger.

### 5. Management & analytics nodes

- `KPI Monitor` – Tracks metrics (cycle time, utilization, error).
- `Budget Node` – Tracks cost (salary, machine, overhead).
- `Policy / Rulebook` – Organizational rules (SLA, approvals).
- `Simulation Start / End` – Global entry/exit points.

Do **not** specialize these nodes for any industry (e.g., “manufacturing‑only” or “hospital‑only”). They must be **generic and reusable**.

## Custom node creation

Enable users to **create their own custom node types**:

- Via a “Create Custom Node” UI panel.
- Users can:
  - Choose a **template** (e.g., “Task‑like”, “Decision‑like”, “Queue‑like”).
  - Define:
    - Input/output ports.
    - Form fields (text, number, dropdown, boolean).
  - Attach behavior:
    - Through configuration (e.g., “uses a Human Role”, “has a queue”).
    - Or via a small script (Python/JS) that runs when the node is triggered (sandboxed).
- All custom nodes appear in the **“My Nodes”** section of the palette.

Implementation should be **UI‑agnostic**:
- In PyQt, define node descriptors in a Python class.
- In React + React Flow, define node types as React components + config objects.

## Simulation engine (UI‑agnostic)

The engine should:

- Treat **all nodes uniformly** (built‑in and custom).
- Run in **discrete‑event style**:
  - Events: `EntityEntered`, `StartedProcessing`, `Completed`, `Failed`, `ResourceAcquired`, etc.
- Track:
  - Cycle time per entity.
  - Throughput per unit time.
  - Resource utilization (roles, teams, machines).
  - Cost and error/rework rate.
- Support experiments:
  - “Baseline” vs “What‑if” scenarios.

The engine should **not** know about industries either; it knows only:
- Node types, properties, and templates.
- Queues, resources, events, and metrics.

## Data model (core entities)

Define at least:

- `Workflow` – organization process (ID, name, nodes, edges, version).
- `Node` – id, type, position, properties.
- `Edge` – source, target, condition.
- `Entity` – moving object (e.g., “Order”, “Ticket”).
- `SimulationRun` – start/end, config, metrics.
- `EventLog` – timestamped events for analysis.

These should be serializable to JSON so they can be loaded by either the PyQt or React app.

## Agent‑specific instructions

When adding or modifying code:

- **Do not** implement any industry‑specific logic at the engine level.
- When adding a node type:
  - Keep it generic (e.g., “Task‑like”, “Queue‑like”).
  - Let the user configure it via the UI.
- When working on UI:
  - In **Python + PyQt**:
    - Keep canvas logic in `ui/canvas` and node drawing in `ui/nodes`.
    - Keep simulation engine in `core/simulation`.
  - In **React + React Flow**:
    - Keep node components in `components/Nodes/`.
    - Keep workflow state in `stores/` or similar.
    - Keep simulation API calls in `services/`.
- When the user creates a new custom node:
  - Persist its definition alongside the workflow (in JSON).
  - Ensure the simulation engine can recognize its template and behavior.

## Extensibility roadmap

Help the project evolve by:

- Making **custom node templates** easily reusable across projects.
- Improving **analytics** (dashboards, comparison of simulation runs).
- Supporting **AI‑enhanced nodes** (optional, e.g., “AI Validator” as a custom node).
- Eventually allowing the user to **save/share node templates** (org‑wide or community library).



python -m src.ui.app