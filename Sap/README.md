# System Simulation Software

A modular, extendable system-simulation software where different kinds of industries and workflows can be simulated visually on a canvas.

## Project Structure

```
app/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/             # API endpoints
│   │   ├── core/            # Core configurations
│   │   ├── models/          # Pydantic models
│   │   ├── schemas/         # API schemas
│   │   ├── simulation/      # Simulation engine
│   │   │   ├── engine/      # Core simulation logic
│   │   │   ├── nodes/       # Node type implementations
│   │   │   └── resources/   # Resource implementations
│   │   └── db_models.py     # SQLAlchemy database models
│   ├── requirements.txt     # Python dependencies
│   └── main.py              # FastAPI application entry point
├── frontend/                # React/TypeScript frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── store/           # State management (Zustand)
│   │   └── utils/           # Utility functions
│   ├── package.json         # Node.js dependencies
│   └── tsconfig.json        # TypeScript configuration
├── test_workflow.json       # Example workflow for testing
├── example_simulation.py    # Example script to run simulation
└── README.md                # This file
```

## Features Implemented

### Backend (Python/FastAPI)
- **Data Models**: Pydantic models for Workflow, Node, Edge, Resource, Entity, EventLog
- **Simulation Engine**: Discrete-event simulator using SimPy with priority queue
- **Database Integration**: SQLAlchemy models for persistence
- **API Endpoints**: CRUD operations for workflows and simulation runs
- **Example Workflow**: Predefined manufacturing workflow in `test_workflow.json`

### Frontend (React/TypeScript)
- **Workflow Canvas**: Interactive canvas using React Flow
- **Node Palette**: Drag-and-drop palette for adding nodes
- **Basic UI Components**: Foundation for properties panel and simulation controls

## How to Run

### Backend
1. Navigate to the backend directory:
   ```bash
   cd app/backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the example simulation:
   ```bash
   python example_simulation.py
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will be available at http://localhost:8000

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd app/frontend
   ```
2. Start the development server:
   ```bash
   npm start
   ```
   The frontend will be available at http://localhost:3000

## Example Simulation Output

Running `example_simulation.py` will:
1. Load the test workflow (manufacturing line)
2. Create default resources (machines, workers)
3. Configure a simulation run (1 hour duration, 10 entities/hour arrival rate)
4. Execute the discrete-event simulation
5. Print statistics including:
   - Number of events logged
   - Average cycle time
   - Throughput per hour
   - Sample events from the simulation

## Extensibility

The system is designed to be extended in several ways:
- **New Node Types**: Add new node types in `backend/app/simulation/nodes/`
- **New Industries**: Create new workflow templates in JSON format
- **Custom Analytics**: Extend the simulation engine to collect additional metrics
- **UI Enhancements**: Add more React components for properties panels, charts, etc.

## Next Steps

To complete the system as outlined in the design:
1. Implement remaining node types (Decision, Gateway, etc.) with proper logic
2. Add properties panel for configuring node attributes
3. Implement simulation controls (play, pause, stop, speed)
4. Add analytics dashboard with charts and KPI visualization
5. Enhance the frontend with industry-specific templates
6. Implement proper condition evaluation for gateways
7. Add support for custom script nodes
8. Improve resource management and utilization tracking