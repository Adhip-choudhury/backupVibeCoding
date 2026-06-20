from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from uuid import UUID, uuid4

class EntityBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    type: str
    creation_time: float
    current_status: str = "Created"
    attributes: Dict[str, Any] = Field(default_factory=dict)

class Entity(EntityBase):
    pass