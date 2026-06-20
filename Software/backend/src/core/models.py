from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class NodeType(str, Enum):
    SIMULATION_START = "simulation_start"
    SIMULATION_END = "simulation_end"
    MEETING = "meeting"
    TEAM = "team"
    SHIFT = "shift"
    SUPERVISOR = "supervisor"
    OPERATOR = "operator"
    MANAGER = "manager"
    ENGINEER = "engineer"
    TECHNICIAN = "technician"
    MAINTENANCE_CREW = "maintenance_crew"
    SAFETY_OFFICER = "safety_officer"
    HR = "hr"
    ADMIN = "admin"
    IT_SUPPORT = "it_support"
    PRODUCTION = "production"
    LINE_CELL = "line_cell"
    WORKSTATION = "workstation"
    BATCH = "batch"
    JOB_ORDER = "job_order"
    CUSTOMER_ORDER = "customer_order"
    PRIORITY_LEVEL = "priority_level"
    DEADLINE = "deadline"
    MACHINERY = "machinery"
    MACHINE_TYPE = "machine_type"
    ROBOT = "robot"
    CONVEYOR = "conveyor"
    MOLD_TOOL = "mold_tool"
    SENSOR = "sensor"
    PLC_CONTROLLER = "plc_controller"
    SCADA_SYSTEM = "scada_system"
    CAMERA_VISION = "camera_vision"
    ACTUATOR = "actuator"
    MOTOR = "motor"
    PUMP_COMPRESSOR = "pump_compressor"
    HUMAN = "human"
    SKILL_LEVEL = "skill_level"
    TRAINING = "training"
    FATIGUE_AVAILABILITY = "fatigue_availability"
    ROLE = "role"
    ATTENDANCE = "attendance"
    ID_BADGE = "id_badge"
    TIMER = "timer"
    CYCLE_TIME = "cycle_time"
    DOWNTIME = "downtime"
    SETUP_TIME = "setup_time"
    BREAK_TIME = "break_time"
    SHIFT_DURATION = "shift_duration"
    OVERTIME = "overtime"
    QUALITY = "quality"
    INSPECTION = "inspection"
    DEFECT_TYPE = "defect_type"
    SCRAP_RATE = "scrap_rate"
    REWORK = "rework"
    CHECKPOINT = "checkpoint"
    SOP_STANDARD = "sop_standard"
    QUALITY_ENGINEER = "quality_engineer"
    WAREHOUSE = "warehouse"
    RACK_SHELF = "rack_shelf"
    BIN_CONTAINER = "bin_container"
    STACK_LEVEL = "stack_level"
    INBOUND = "inbound"
    OUTBOUND = "outbound"
    INVENTORY_COUNT = "inventory_count"
    FIFO_LIFO = "fifo_lifo"
    VEHICLE_LOGISTICS = "vehicle_logistics"
    TRUCK_FORKLIFT = "truck_forklift"
    ROUTE = "route"
    LOADING_BAY = "loading_bay"
    DELIVERY_TIME = "delivery_time"
    GATE_PASS = "gate_pass"
    FUEL_CHARGE = "fuel_charge"
    DATA = "data"
    SENSOR_DATA = "sensor_data"
    MACHINE_LOG = "machine_log"
    EVENT_LOG = "event_log"
    ALARM_LOG = "alarm_log"
    PRODUCTION_COUNT = "production_count"
    REJECT_COUNT = "reject_count"
    SCRAP_LOG = "scrap_log"
    ALERT_NOTIFICATION = "alert_notification"
    WARNING = "warning"
    CRITICAL_ALARM = "critical_alarm"
    MAINTENANCE_ALERT = "maintenance_alert"
    QUALITY_ALERT = "quality_alert"
    SAFETY_ALERT = "safety_alert"
    EMAIL_SMS_PUSH = "email_sms_push"
    MAINTENANCE = "maintenance"
    PM_SCHEDULE = "pm_schedule"
    CM_SCHEDULE = "cm_schedule"
    BREAKDOWN = "breakdown"
    SPARE_PART = "spare_part"
    VENDOR = "vendor"
    WORK_ORDER = "work_order"
    KPI_METRIC = "kpi_metric"
    OEE = "oee"
    UPTIME = "uptime"
    THROUGHPUT = "throughput"
    TAKT_TIME = "takt_time"
    EFFICIENCY = "efficiency"
    YIELD = "yield"
    COST_PER_UNIT = "cost_per_unit"
    CUSTOMER = "customer"
    CUSTOMER_ID = "customer_id"
    DEMAND_FORECAST = "demand_forecast"
    ORDER_HISTORY = "order_history"
    FEEDBACK = "feedback"
    SLA = "sla"
    SUPPLIER = "supplier"
    RAW_MATERIAL = "raw_material"
    DELIVERY_TIME_SUPPLIER = "delivery_time_supplier"
    QUALITY_RATING = "quality_rating"
    CONTRACT = "contract"
    LEAD_TIME = "lead_time"
    ENVIRONMENT = "environment"
    TEMPERATURE = "temperature"
    HUMIDITY = "humidity"
    PRESSURE = "pressure"
    VIBRATION = "vibration"
    NOISE = "noise"
    SAFETY = "safety"
    PPE_CHECK = "ppe_check"
    EMERGENCY_STOP = "emergency_stop"
    INCIDENT = "incident"
    NEAR_MISS = "near_miss"
    SAFETY_AUDIT = "safety_audit"
    FINANCE = "finance"
    COST_CENTER = "cost_center"
    BUDGET = "budget"
    VARIANCE = "variance"
    BILLING = "billing"
    INVOICE = "invoice"
    PLANNING = "planning"
    MRP_PRODUCTION_PLAN = "mrp_production_plan"
    CAPACITY = "capacity"
    BOTTLENECK = "bottleneck"
    RESOURCE_ALLOCATION = "resource_allocation"


class GenericNodeTemplate(str, Enum):
    TASK_LIKE = "task_like"
    DECISION_LIKE = "decision_like"
    QUEUE_LIKE = "queue_like"
    RESOURCE_LIKE = "resource_like"
    GATEWAY_LIKE = "gateway_like"
    EVENT_LIKE = "event_like"
    MONITOR_LIKE = "monitor_like"


class Port(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    label: str
    port_type: str = "data"


class NodeProperty(BaseModel):
    key: str
    label: str
    value_type: str = "text"
    default_value: Any = None
    value: Any = None


class Node(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: NodeType
    label: str = "Node"
    position_x: float = 0.0
    position_y: float = 0.0
    properties: Dict[str, Any] = Field(default_factory=dict)
    custom_fields: List[NodeProperty] = Field(default_factory=list)
    input_ports: List[Port] = Field(default_factory=list)
    output_ports: List[Port] = Field(default_factory=list)


class EdgeCondition(BaseModel):
    field: str = ""
    operator: str = "=="
    value: Any = None


class Edge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source_id: str
    target_id: str
    source_port: str = "default"
    target_port: str = "default"
    label: str = ""
    condition: Optional[EdgeCondition] = None
    probability: float = 1.0


class Workflow(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "Untitled Workflow"
    nodes: List[Node] = Field(default_factory=list)
    edges: List[Edge] = Field(default_factory=list)
    version: int = 1


class EntityStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"


class Entity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    label: str = "Entity"
    entity_type: str = "generic"
    current_node_id: Optional[str] = None
    status: EntityStatus = EntityStatus.QUEUED
    properties: Dict[str, Any] = Field(default_factory=dict)
    created_at: float = 0.0
    completed_at: Optional[float] = None
    history: List["EntityHistoryEntry"] = Field(default_factory=list)


class EntityHistoryEntry(BaseModel):
    node_id: str
    node_label: str
    entered_at: float = 0.0
    exited_at: Optional[float] = None


class SimulationConfig(BaseModel):
    max_entities: int = 100
    arrival_rate: float = 1.0
    random_seed: Optional[int] = None


class NodeMetrics(BaseModel):
    node_id: str
    node_label: str
    entities_processed: int = 0
    avg_processing_time: float = 0.0
    total_busy_time: float = 0.0
    utilization: float = 0.0
    errors: int = 0
    cost: float = 0.0


class SimulationMetrics(BaseModel):
    total_entities: int = 0
    completed_entities: int = 0
    failed_entities: int = 0
    avg_cycle_time: float = 0.0
    min_cycle_time: float = 0.0
    max_cycle_time: float = 0.0
    throughput: float = 0.0
    resource_utilization: Dict[str, float] = Field(default_factory=dict)
    node_metrics: Dict[str, NodeMetrics] = Field(default_factory=dict)


class SimulationRun(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workflow_id: str = ""
    config: SimulationConfig = Field(default_factory=SimulationConfig)
    started_at: Optional[float] = None
    ended_at: Optional[float] = None
    status: str = "pending"
    metrics: SimulationMetrics = Field(default_factory=SimulationMetrics)
    scenario_label: str = "Baseline"


class EventType(str, Enum):
    ENTITY_CREATED = "entity_created"
    ENTITY_ENTERED = "entity_entered"
    STARTED_PROCESSING = "started_processing"
    COMPLETED = "completed"
    FAILED = "failed"
    RESOURCE_ACQUIRED = "resource_acquired"
    RESOURCE_RELEASED = "resource_released"
    DECISION_MADE = "decision_made"
    SPLIT_OCCURRED = "split_occurred"
    MERGE_OCCURRED = "merge_occurred"


class EventLogEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.now)
    simulation_run_id: str = ""
    event_type: EventType
    entity_id: str = ""
    node_id: str = ""
    node_label: str = ""
    details: Dict[str, Any] = Field(default_factory=dict)
