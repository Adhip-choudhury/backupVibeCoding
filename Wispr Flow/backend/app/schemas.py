from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "operator"


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str


class MachineCreate(BaseModel):
    name: str
    code: str
    location: str = ""
    status: str = "active"


class MachineUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None


class MachineOut(BaseModel):
    id: int
    name: str
    code: str
    location: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class SampleTypeCreate(BaseModel):
    name: str
    unit: str = ""
    lower_spec_limit: float = 0.0
    upper_spec_limit: float = 0.0
    target: float = 0.0


class SampleTypeOut(BaseModel):
    id: int
    name: str
    unit: str
    lower_spec_limit: float
    upper_spec_limit: float
    target: float
    created_at: datetime

    model_config = {"from_attributes": True}


class SampleCreate(BaseModel):
    machine_id: int
    sample_type_id: int
    value: float
    measured_at: Optional[datetime] = None
    notes: str = ""


class SampleOut(BaseModel):
    id: int
    machine_id: int
    sample_type_id: int
    value: float
    operator_id: Optional[int] = None
    measured_at: datetime
    notes: str
    created_at: datetime
    machine_name: Optional[str] = None
    sample_type_name: Optional[str] = None

    model_config = {"from_attributes": True}


class AlertOut(BaseModel):
    id: int
    machine_id: int
    sample_id: Optional[int] = None
    severity: str
    message: str
    is_read: bool
    created_at: datetime
    machine_name: Optional[str] = None

    model_config = {"from_attributes": True}


class DashboardKPIs(BaseModel):
    total_samples: int
    defect_count: int
    defect_rate: float
    active_machines: int
    unread_alerts: int
