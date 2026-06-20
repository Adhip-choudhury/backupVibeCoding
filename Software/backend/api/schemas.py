from pydantic import BaseModel
from typing import Any, Dict, List, Optional


class WorkflowData(BaseModel):
    id: str
    name: str
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    version: int = 1


class SimulateRequest(BaseModel):
    workflow: WorkflowData
    max_entities: int = 25
    arrival_rate: float = 1.0
    random_seed: Optional[int] = 42


class SimulateResponse(BaseModel):
    status: str
    run_id: str
    metrics: Dict[str, Any]
    event_log: List[Dict[str, Any]]
