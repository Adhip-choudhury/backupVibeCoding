from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID, uuid4

class EdgeBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    source: str
    target: str
    label: Optional[str] = None
    condition: Optional[str] = None

class Edge(EdgeBase):
    pass