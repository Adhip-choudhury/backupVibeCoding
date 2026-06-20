from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
import json
import uuid
import os
from pathlib import Path
from app.simulation.engine.simulator import Simulator
from app.models.node import Node, Edge
from app.models.resource import Resource
from app.models.workflow import WorkflowCreate, WorkflowUpdate

app = FastAPI(
    title="System Simulation Software",
    description="Modular workflow simulation engine",
    version="0.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store
workflows: Dict[str, dict] = {}

@app.get("/")
async def root():
    return {"message": "System Simulation API", "version": "0.2.0"}

# ── Workflow CRUD ──

@app.post("/workflows/")
def create_workflow(wf: WorkflowCreate):
    wf_id = str(uuid.uuid4())
    entry = {
        "id": wf_id,
        "name": wf.name,
        "description": wf.description,
        "version": wf.version,
        "nodes": [n.dict() for n in wf.nodes],
        "edges": [e.dict() for e in wf.edges],
    }
    workflows[wf_id] = entry
    return entry

@app.get("/workflows/")
def list_workflows():
    return list(workflows.values())

@app.get("/workflows/{wf_id}")
def get_workflow(wf_id: str):
    wf = workflows.get(wf_id)
    if not wf:
        raise HTTPException(404, "Workflow not found")
    return wf

@app.put("/workflows/{wf_id}")
def update_workflow(wf_id: str, update: WorkflowUpdate):
    wf = workflows.get(wf_id)
    if not wf:
        raise HTTPException(404, "Workflow not found")
    if update.name is not None:
        wf["name"] = update.name
    if update.description is not None:
        wf["description"] = update.description
    if update.nodes is not None:
        wf["nodes"] = [n.dict() for n in update.nodes]
    if update.edges is not None:
        wf["edges"] = [e.dict() for e in update.edges]
    return wf

@app.delete("/workflows/{wf_id}")
def delete_workflow(wf_id: str):
    if wf_id not in workflows:
        raise HTTPException(404, "Workflow not found")
    del workflows[wf_id]
    return {"message": "Deleted"}

# ── Simulation ──

@app.post("/workflows/{wf_id}/simulate")
def run_simulation(wf_id: str, config: Dict[str, Any] = None):
    wf = workflows.get(wf_id)
    if not wf:
        raise HTTPException(404, "Workflow not found")

    nodes = {n["id"]: Node(**n) for n in wf["nodes"]}
    edges = [Edge(**e) for e in wf["edges"]]
    cfg = config or {"durationSecs": 3600, "arrivalRatePerHour": 10, "randomSeed": 42}

    # Build default resources from node requirements
    resources = {}
    resource_id_counter = 0
    for n in nodes.values():
        for rid in n.properties.get("resourcesRequired", []):
            if rid not in resources:
                resource_id_counter += 1
                resources[rid] = Resource(
                    id=rid,
                    name=rid.replace("_", " "),
                    type="Machine" if "Machine" in rid else "Worker",
                    capacity=2,
                    cost_per_hour=20.0
                )

    if not resources:
        resources["default_worker"] = Resource(
            id="default_worker", name="Default Worker", type="Worker",
            capacity=5, cost_per_hour=15.0
        )

    sim = Simulator(nodes, edges, resources, cfg)
    result = sim.run()
    return {"workflow_id": wf_id, **result}

@app.get("/health")
def health():
    return {"status": "healthy"}

# ── Templates ──

TEMPLATES_DIR = Path(__file__).parent / "templates"
TEMPLATES_DIR.mkdir(exist_ok=True)

@app.get("/templates/")
def list_templates():
    files = sorted(TEMPLATES_DIR.glob("*.json"))
    result = []
    for fp in files:
        with open(fp) as f:
            data = json.load(f)
        result.append({
            "file": fp.name,
            "name": data.get("name", fp.stem),
            "description": data.get("description", ""),
            "node_count": len(data.get("nodes", [])),
            "edge_count": len(data.get("edges", []))
        })
    return result

@app.post("/templates/{template_name}/load")
def load_template(template_name: str):
    fp = TEMPLATES_DIR / f"{template_name}.json"
    if not fp.exists():
        raise HTTPException(404, f"Template '{template_name}' not found")
    with open(fp) as f:
        data = json.load(f)
    wf_id = str(uuid.uuid4())
    entry = {"id": wf_id, **data}
    workflows[wf_id] = entry
    return {"workflow_id": wf_id, "workflow": entry}
