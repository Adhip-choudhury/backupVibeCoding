from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Enum as SAEnum
from sqlalchemy.orm import relationship
from .database import Base
import enum


class UserRole(str, enum.Enum):
    OPERATOR = "operator"
    ENGINEER = "engineer"
    MANAGER = "manager"
    ADMIN = "admin"


class MachineStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"


class AlertSeverity(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.OPERATOR, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Machine(Base):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    location = Column(String, default="")
    status = Column(SAEnum(MachineStatus), default=MachineStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    samples = relationship("Sample", back_populates="machine")
    alerts = relationship("Alert", back_populates="machine")


class SampleType(Base):
    __tablename__ = "sample_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    unit = Column(String, default="")
    lower_spec_limit = Column(Float, default=0.0)
    upper_spec_limit = Column(Float, default=0.0)
    target = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    samples = relationship("Sample", back_populates="sample_type")


class Sample(Base):
    __tablename__ = "samples"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=False)
    sample_type_id = Column(Integer, ForeignKey("sample_types.id"), nullable=False)
    value = Column(Float, nullable=False)
    operator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    measured_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    notes = Column(String, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    machine = relationship("Machine", back_populates="samples")
    sample_type = relationship("SampleType", back_populates="samples")
    operator = relationship("User")
    alerts = relationship("Alert", back_populates="sample")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=False)
    sample_id = Column(Integer, ForeignKey("samples.id"), nullable=True)
    severity = Column(SAEnum(AlertSeverity), nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    machine = relationship("Machine", back_populates="alerts")
    sample = relationship("Sample", back_populates="alerts")
