from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from uuid import UUID, uuid4

class NodeBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    type: str
    position: Dict[str, float] = Field(default_factory=lambda: {"x": 0, "y": 0})
    label: Optional[str] = None
    properties: Dict[str, Any] = Field(default_factory=dict)

class Node(NodeBase):
    pass

class EdgeBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    source: str
    target: str
    label: Optional[str] = None
    condition: Optional[str] = None

class Edge(EdgeBase):
    pass