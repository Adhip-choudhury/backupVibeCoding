from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID, uuid4
from .models.node import Node
from .models.edge import Edge
from .models.resource import Resource
from .models.entity import Entity
from .models.event_log import EventLog, EventType

# Workflow schemas
class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    version: int = Field(default=1, ge=1)

class WorkflowCreate(WorkflowBase):
    nodes: List[Node] = Field(default_factory=list)
    edges: List[Edge] = Field(default_factory=list)

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    version: Optional[int] = None
    nodes: Optional[List[Node]] = None
    edges: Optional[List[Edge]] = None

class WorkflowInDBBase(WorkflowBase):
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_at: datetime
    updated_at: datetime
    nodes: List[Node] = Field(default_factory=list)
    edges: List[Edge] = Field(default_factory=list)

class Workflow(WorkflowInDBBase):
    pass

class WorkflowInDB(WorkflowInDBBase):
    pass

# Simulation schemas
class SimulationConfig(BaseModel):
    durationSecs: float = Field(default=3600.0, gt=0)
    arrivalRatePerHour: float = Field(default=1.0, ge=0)
    randomSeed: Optional[int] = None
    resourceOverrides: Optional[Dict[str, int]] = None  # resource_id -> capacity

class SimulationRunBase(BaseModel):
    workflowId: str
    startTime: float
    endTime: Optional[float] = None
    status: str  # running, completed, failed
    config: SimulationConfig

class SimulationRunCreate(SimulationRunBase):
    pass

class SimulationRun(SimulationRunBase):
    id: str = Field(default_factory=lambda: str(uuid4()))
    kpis: Optional[Dict[str, Any]] = None

# KPI schemas
class KPIResponse(BaseModel):
    avgCycleTimeSecs: Optional[float] = None
    throughputPerHour: Optional[float] = None
    bottleneckNodes: List[str] = Field(default_factory=list)
    resourceUtilization: Dict[str, float] = Field(default_factory=dict)
    entitiesProcessed: int = 0
    entitiesExited: int = 0
    totalWaitTime: float = 0.0

# Event log schemas
class EventLogResponse(BaseModel):
    id: str
    timestamp: float
    type: EventType
    nodeId: str
    entityId: str
    duration: Optional[float] = None
    outcome: str = "success"
    resourcesUsed: List[str] = Field(default_factory=list)

# Health check
class HealthCheck(BaseModel):
    status: str