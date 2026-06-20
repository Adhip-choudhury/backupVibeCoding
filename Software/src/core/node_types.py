from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional

from src.core.models import GenericNodeTemplate, Node, NodeType


class NodeBehavior(ABC):
    @abstractmethod
    def process(self, entity: Any, context: "ProcessingContext") -> "ProcessingResult": ...
    @abstractmethod
    def processing_time(self, entity: Any, context: "ProcessingContext") -> float: ...


@dataclass
class ProcessingContext:
    workflow_id: str
    simulation_time: float
    resources: Dict[str, int]
    random: Any
    config: Any


@dataclass
class ProcessingResult:
    success: bool
    next_node_ids: List[str]
    outputs: Dict[str, Any]
    processing_time: float
    error: Optional[str] = None
    resource_usage: Dict[str, float] = field(default_factory=dict)


class CustomNodeBehavior(NodeBehavior):
    def __init__(self, processing_func=None, time_func=None, properties=None):
        self._processing_func = processing_func
        self._time_func = time_func
        self._properties = properties or {}
    def process(self, entity, context):
        if self._processing_func:
            return self._processing_func(entity, context, self._properties)
        return ProcessingResult(success=True, next_node_ids=[], outputs={}, processing_time=self.processing_time(entity, context))
    def processing_time(self, entity, context):
        if self._time_func:
            return self._time_func(entity, context, self._properties)
        return float(self._properties.get("processing_time", 1.0))


class TaskManualBehavior(NodeBehavior):
    def process(self, entity, context):
        entity.properties["review_count"] = entity.properties.get("review_count", 0) + 1
        return ProcessingResult(success=True, next_node_ids=[], outputs={"done": True}, processing_time=self.processing_time(entity, context), resource_usage={"worker": 1.0})
    def processing_time(self, entity, context):
        return max(1.0, abs(context.random.gauss(4.0, 1.2)))


class TaskAutoBehavior(NodeBehavior):
    def process(self, entity, context):
        return ProcessingResult(success=True, next_node_ids=[], outputs={"auto": True}, processing_time=self.processing_time(entity, context))
    def processing_time(self, entity, context):
        return max(0.3, abs(context.random.gauss(1.0, 0.3)))


class MeetingBehavior(NodeBehavior):
    def process(self, entity, context):
        n = int(entity.properties.get("attendees", 4))
        return ProcessingResult(success=True, next_node_ids=[], outputs={"attendees": n}, processing_time=self.processing_time(entity, context), resource_usage={f"p{i}":1 for i in range(n)})
    def processing_time(self, entity, context):
        return 10.0 + abs(context.random.gauss(0, 3))


class BatchBehavior(NodeBehavior):
    def __init__(self):
        self._b: Dict[str, list] = {}
    def process(self, entity, context):
        w = context.workflow_id
        if w not in self._b: self._b[w] = []
        self._b[w].append(entity.id)
        bs = int(entity.properties.get("batch_size", 5))
        if len(self._b[w]) >= bs:
            self._b[w] = []
            return ProcessingResult(success=True, next_node_ids=[], outputs={"batched": True, "size": bs}, processing_time=3.0)
        return ProcessingResult(success=True, next_node_ids=[], outputs={"batched": False, "waiting": len(self._b[w])}, processing_time=0.1)
    def processing_time(self, entity, context):
        return 3.0


class DecisionRuleBehavior(NodeBehavior):
    def process(self, entity, context):
        val = entity.properties.get("score", entity.properties.get("value", 50))
        passed = val >= 50
        entity.properties["decision"] = "pass" if passed else "fail"
        return ProcessingResult(success=True, next_node_ids=[], outputs={"result": "pass" if passed else "fail"}, processing_time=0.3)
    def processing_time(self, entity, context):
        return 0.3


class DecisionProbBehavior(NodeBehavior):
    def process(self, entity, context):
        pr = float(entity.properties.get("probability", 0.7))
        passed = context.random.random() < pr
        entity.properties["decision"] = "pass" if passed else "fail"
        return ProcessingResult(success=True, next_node_ids=[], outputs={"result": "pass" if passed else "fail"}, processing_time=0.2)
    def processing_time(self, entity, context):
        return 0.2


class SplitBehavior(NodeBehavior):
    def process(self, entity, context):
        entity.properties["branch"] = entity.properties.get("branch", 0) + 1
        return ProcessingResult(success=True, next_node_ids=[], outputs={"branch": entity.properties["branch"]}, processing_time=0.1)
    def processing_time(self, entity, context):
        return 0.1


class MergeBehavior(NodeBehavior):
    def __init__(self):
        self._w: Dict[str, Dict[str, list]] = {}
    def process(self, entity, context):
        wid = context.workflow_id; br = entity.properties.get("branch", 0)
        if wid not in self._w: self._w[wid] = {}
        if br not in self._w[wid]: self._w[wid][br] = []
        self._w[wid][br].append(entity.id)
        exp = int(entity.properties.get("expected_branches", 2))
        if len(self._w[wid].get(br, [])) >= exp:
            self._w[wid][br] = []
            return ProcessingResult(success=True, next_node_ids=[], outputs={"merged": True}, processing_time=0.2)
        return ProcessingResult(success=True, next_node_ids=[], outputs={"merged": False}, processing_time=0.1)
    def processing_time(self, entity, context):
        return 0.2


class QueueBehavior(NodeBehavior):
    def __init__(self):
        self._q: Dict[str, list] = {}
    def process(self, entity, context):
        wid = context.workflow_id
        if wid not in self._q: self._q[wid] = []
        self._q[wid].append(entity.id)
        entity.properties["queue_len"] = len(self._q[wid])
        return ProcessingResult(success=True, next_node_ids=[], outputs={"queue_len": len(self._q[wid])}, processing_time=len(self._q[wid])*0.3)
    def processing_time(self, entity, context):
        wid = context.workflow_id
        return len(self._q.get(wid, [])) * 0.3


class ResourceBehavior(NodeBehavior):
    def process(self, entity, context):
        r = entity.properties.get("resource", "worker")
        return ProcessingResult(success=True, next_node_ids=[], outputs={"resource": r}, processing_time=0.5, resource_usage={r: 1.0})
    def processing_time(self, entity, context):
        return 0.5


class MachineBehavior(NodeBehavior):
    def process(self, entity, context):
        mid = entity.properties.get("machine_id", "M01")
        entity.properties["machine"] = mid
        return ProcessingResult(success=True, next_node_ids=[], outputs={"machine": mid}, processing_time=self.processing_time(entity, context), resource_usage={f"machine_{mid}": 1.0})
    def processing_time(self, entity, context):
        return max(0.5, abs(context.random.gauss(2.0, 0.8)))


class SensorBehavior(NodeBehavior):
    def process(self, entity, context):
        val = round(abs(context.random.gauss(100, 15)), 1)
        entity.properties["sensor_value"] = val
        return ProcessingResult(success=True, next_node_ids=[], outputs={"reading": val}, processing_time=0.1)
    def processing_time(self, entity, context):
        return 0.1


class InspectionBehavior(NodeBehavior):
    def process(self, entity, context):
        ok = context.random.random() > 0.08
        if not ok:
            entity.properties["defect"] = True
            return ProcessingResult(success=False, next_node_ids=[], outputs={"inspected": False, "defect": True}, processing_time=2.0, error="Defect found")
        entity.properties["defect"] = False
        return ProcessingResult(success=True, next_node_ids=[], outputs={"inspected": True}, processing_time=2.0)
    def processing_time(self, entity, context):
        return 2.0


class KpiBehavior(NodeBehavior):
    def process(self, entity, context):
        k = entity.properties.get("metric", "oee")
        v = entity.properties.get("value", context.simulation_time)
        entity.properties[f"kpi_{k}"] = v
        return ProcessingResult(success=True, next_node_ids=[], outputs={"metric": k, "value": v}, processing_time=0.2)
    def processing_time(self, entity, context):
        return 0.2


class AlertBehavior(NodeBehavior):
    def process(self, entity, context):
        level = entity.properties.get("level", "info")
        entity.properties["alert_triggered"] = level
        return ProcessingResult(success=True, next_node_ids=[], outputs={"alert": level}, processing_time=0.3)
    def processing_time(self, entity, context):
        return 0.3


class BudgetBehavior(NodeBehavior):
    def process(self, entity, context):
        c = float(entity.properties.get("cost", 100))
        entity.properties["total_cost"] = entity.properties.get("total_cost", 0.0) + c
        return ProcessingResult(success=True, next_node_ids=[], outputs={"cost": c, "running": entity.properties["total_cost"]}, processing_time=0.3, resource_usage={"budget": c})
    def processing_time(self, entity, context):
        return 0.3


class StartBehavior(NodeBehavior):
    def process(self, entity, context):
        entity.properties["start_time"] = context.simulation_time
        return ProcessingResult(success=True, next_node_ids=[], outputs={"started": True}, processing_time=0.0)
    def processing_time(self, entity, context):
        return 0.0


class EndBehavior(NodeBehavior):
    def process(self, entity, context):
        st = entity.properties.get("start_time", 0)
        entity.properties["total_time"] = context.simulation_time - st
        entity.properties["completed"] = True
        return ProcessingResult(success=True, next_node_ids=[], outputs={"ended": True, "total": context.simulation_time - st}, processing_time=0.0)
    def processing_time(self, entity, context):
        return 0.0


def _map_behaviors() -> Dict[NodeType, NodeBehavior]:
    m = {}
    m[NodeType.SIMULATION_START] = StartBehavior()
    m[NodeType.SIMULATION_END] = EndBehavior()

    for nt in [NodeType.MEETING]: m[nt] = MeetingBehavior()
    for nt in [NodeType.TEAM, NodeType.SHIFT, NodeType.SUPERVISOR, NodeType.OPERATOR, NodeType.MANAGER, NodeType.ENGINEER, NodeType.TECHNICIAN, NodeType.MAINTENANCE_CREW, NodeType.SAFETY_OFFICER, NodeType.HR, NodeType.ADMIN, NodeType.IT_SUPPORT]: m[nt] = ResourceBehavior()
    for nt in [NodeType.PRODUCTION, NodeType.LINE_CELL, NodeType.WORKSTATION]: m[nt] = MachineBehavior()
    for nt in [NodeType.BATCH]: m[nt] = BatchBehavior()
    for nt in [NodeType.JOB_ORDER, NodeType.CUSTOMER_ORDER, NodeType.PRIORITY_LEVEL, NodeType.DEADLINE]: m[nt] = TaskManualBehavior()
    for nt in [NodeType.MACHINERY, NodeType.MACHINE_TYPE, NodeType.ROBOT, NodeType.CONVEYOR, NodeType.MOLD_TOOL]: m[nt] = MachineBehavior()
    for nt in [NodeType.SENSOR, NodeType.PLC_CONTROLLER, NodeType.SCADA_SYSTEM, NodeType.CAMERA_VISION, NodeType.ACTUATOR, NodeType.MOTOR, NodeType.PUMP_COMPRESSOR]: m[nt] = SensorBehavior()
    for nt in [NodeType.HUMAN, NodeType.SKILL_LEVEL, NodeType.TRAINING, NodeType.FATIGUE_AVAILABILITY, NodeType.ROLE, NodeType.ATTENDANCE, NodeType.ID_BADGE]: m[nt] = ResourceBehavior()
    for nt in [NodeType.TIMER, NodeType.CYCLE_TIME, NodeType.DOWNTIME, NodeType.SETUP_TIME, NodeType.BREAK_TIME, NodeType.SHIFT_DURATION, NodeType.OVERTIME]: m[nt] = TaskAutoBehavior()
    for nt in [NodeType.QUALITY, NodeType.INSPECTION, NodeType.DEFECT_TYPE, NodeType.SCRAP_RATE, NodeType.REWORK, NodeType.CHECKPOINT, NodeType.SOP_STANDARD, NodeType.QUALITY_ENGINEER]: m[nt] = InspectionBehavior()
    for nt in [NodeType.WAREHOUSE, NodeType.RACK_SHELF, NodeType.BIN_CONTAINER, NodeType.STACK_LEVEL, NodeType.INBOUND, NodeType.OUTBOUND, NodeType.INVENTORY_COUNT, NodeType.FIFO_LIFO]: m[nt] = QueueBehavior()
    for nt in [NodeType.VEHICLE_LOGISTICS, NodeType.TRUCK_FORKLIFT, NodeType.ROUTE, NodeType.LOADING_BAY, NodeType.DELIVERY_TIME, NodeType.GATE_PASS, NodeType.FUEL_CHARGE]: m[nt] = TaskAutoBehavior()
    for nt in [NodeType.DATA, NodeType.SENSOR_DATA, NodeType.MACHINE_LOG, NodeType.EVENT_LOG, NodeType.ALARM_LOG, NodeType.PRODUCTION_COUNT, NodeType.REJECT_COUNT, NodeType.SCRAP_LOG]: m[nt] = SensorBehavior()
    for nt in [NodeType.ALERT_NOTIFICATION, NodeType.WARNING, NodeType.CRITICAL_ALARM, NodeType.MAINTENANCE_ALERT, NodeType.QUALITY_ALERT, NodeType.SAFETY_ALERT, NodeType.EMAIL_SMS_PUSH]: m[nt] = AlertBehavior()
    for nt in [NodeType.MAINTENANCE, NodeType.PM_SCHEDULE, NodeType.CM_SCHEDULE, NodeType.BREAKDOWN, NodeType.SPARE_PART, NodeType.VENDOR, NodeType.WORK_ORDER]: m[nt] = TaskManualBehavior()
    for nt in [NodeType.KPI_METRIC, NodeType.OEE, NodeType.UPTIME, NodeType.THROUGHPUT, NodeType.TAKT_TIME, NodeType.EFFICIENCY, NodeType.YIELD, NodeType.COST_PER_UNIT]: m[nt] = KpiBehavior()
    for nt in [NodeType.CUSTOMER, NodeType.CUSTOMER_ID, NodeType.DEMAND_FORECAST, NodeType.ORDER_HISTORY, NodeType.FEEDBACK, NodeType.SLA]: m[nt] = TaskManualBehavior()
    for nt in [NodeType.SUPPLIER, NodeType.RAW_MATERIAL, NodeType.DELIVERY_TIME_SUPPLIER, NodeType.QUALITY_RATING, NodeType.CONTRACT, NodeType.LEAD_TIME]: m[nt] = TaskManualBehavior()
    for nt in [NodeType.ENVIRONMENT, NodeType.TEMPERATURE, NodeType.HUMIDITY, NodeType.PRESSURE, NodeType.VIBRATION, NodeType.NOISE]: m[nt] = SensorBehavior()
    for nt in [NodeType.SAFETY, NodeType.PPE_CHECK, NodeType.EMERGENCY_STOP, NodeType.INCIDENT, NodeType.NEAR_MISS, NodeType.SAFETY_AUDIT]: m[nt] = AlertBehavior()
    for nt in [NodeType.FINANCE, NodeType.COST_CENTER, NodeType.BUDGET, NodeType.VARIANCE, NodeType.BILLING, NodeType.INVOICE]: m[nt] = BudgetBehavior()
    for nt in [NodeType.PLANNING, NodeType.MRP_PRODUCTION_PLAN, NodeType.CAPACITY, NodeType.BOTTLENECK, NodeType.RESOURCE_ALLOCATION]: m[nt] = DecisionRuleBehavior()
    return m


BEHAVIOR_REGISTRY = _map_behaviors()


def get_behavior_for_node(node: Node) -> NodeBehavior:
    if node.custom_fields:
        props = {f.key: f.value for f in node.custom_fields}
        return CustomNodeBehavior(properties=props)
    return BEHAVIOR_REGISTRY.get(node.type, TaskManualBehavior())


def behavior_for_template(template: GenericNodeTemplate) -> NodeBehavior:
    return {
        GenericNodeTemplate.TASK_LIKE: TaskManualBehavior(),
        GenericNodeTemplate.DECISION_LIKE: DecisionRuleBehavior(),
        GenericNodeTemplate.QUEUE_LIKE: QueueBehavior(),
        GenericNodeTemplate.RESOURCE_LIKE: ResourceBehavior(),
        GenericNodeTemplate.GATEWAY_LIKE: SplitBehavior(),
        GenericNodeTemplate.EVENT_LIKE: TaskAutoBehavior(),
        GenericNodeTemplate.MONITOR_LIKE: KpiBehavior(),
    }.get(template, TaskManualBehavior())
