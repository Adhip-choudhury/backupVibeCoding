from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID, uuid4

class ResourceBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str
    type: str  # e.g., "Machine", "Worker", "Server"
    capacity: int = Field(default=1, ge=1)
    cost_per_hour: float = Field(default=0.0, ge=0.0)
    setup_time_secs: Optional[float] = None
    maintenance_interval_hours: Optional[float] = None

class Resource(ResourceBase):
    pass