from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from uuid import UUID, uuid4

class EventType(str, Enum):
    ENTITY_ENTERED = "entity_entered"
    ENTITY_STARTED_PROCESSING = "entity_started_processing"
    ENTITY_COMPLETED_PROCESSING = "entity_completed_processing"
    ENTITY_EXITED = "entity_exited"
    ENTITY_QUEUED = "entity_queued"
    ENTITY_TRANSITIONED = "entity_transitioned"
    ENTITY_DECIDED = "entity_decided"
    RESOURCE_ALLOCATED = "resource_allocated"
    RESOURCE_RELEASED = "resource_released"

class EventLogBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    timestamp: float
    type: EventType
    node_id: str
    entity_id: str
    duration: Optional[float] = None
    outcome: str = "success"
    resources_used: List[str] = Field(default_factory=list)

class EventLog(EventLogBase):
    pass