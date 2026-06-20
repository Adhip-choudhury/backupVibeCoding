from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID, uuid4
from .node import Node
from .edge import Edge

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