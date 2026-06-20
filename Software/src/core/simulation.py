from __future__ import annotations

import heapq
import random
import time as time_module
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

from src.core.models import (
    Edge,
    Entity,
    EntityHistoryEntry,
    EntityStatus,
    EventLogEntry,
    EventType,
    Node,
    NodeMetrics,
    SimulationConfig,
    SimulationMetrics,
    SimulationRun,
    Workflow,
)
from src.core.node_types import (
    BEHAVIOR_REGISTRY,
    ProcessingContext,
    get_behavior_for_node,
)


@dataclass(order=True)
class SimulationEvent:
    time: float
    priority: int = field(default=0, compare=True)
    event_id: str = field(default="", compare=False)
    event_type: str = field(default="", compare=False)
    entity_id: str = field(default="", compare=False)
    node_id: str = field(default="", compare=False)


class SimulationEngine:
    def __init__(self, workflow: Workflow, config: Optional[SimulationConfig] = None):
        self.workflow = workflow
        self.config = config or SimulationConfig()
        self._run_result = SimulationRun(
            workflow_id=workflow.id,
            config=self.config,
        )
        self._rng = random.Random(self.config.random_seed)
        self._event_queue: List[SimulationEvent] = []
        self._entities: Dict[str, Entity] = {}
        self._event_log: List[EventLogEntry] = []
        self._current_time: float = 0.0
        self._node_metrics: Dict[str, NodeMetrics] = {}
        self._resource_usage: Dict[str, float] = {}
        self._merge_trackers: Dict[str, Dict[str, List[str]]] = {}
        self._node_map: Dict[str, Node] = {}
        self._adjacency: Dict[str, List[Edge]] = {}
        self._reverse_adjacency: Dict[str, List[Edge]] = {}

        for node in workflow.nodes:
            self._node_map[node.id] = node
            self._node_metrics[node.id] = NodeMetrics(
                node_id=node.id, node_label=node.label
            )

        for edge in workflow.edges:
            if edge.source_id not in self._adjacency:
                self._adjacency[edge.source_id] = []
            self._adjacency[edge.source_id].append(edge)
            if edge.target_id not in self._reverse_adjacency:
                self._reverse_adjacency[edge.target_id] = []
            self._reverse_adjacency[edge.target_id].append(edge)

    def _log_event(
        self,
        event_type: EventType,
        entity_id: str,
        node_id: str,
        details: Optional[Dict[str, Any]] = None,
    ):
        node = self._node_map.get(node_id)
        entry = EventLogEntry(
            simulation_run_id=self._run_result.id,
            event_type=event_type,
            entity_id=entity_id,
            node_id=node_id,
            node_label=node.label if node else "",
            details=details or {},
        )
        self._event_log.append(entry)

    def _find_start_nodes(self) -> List[Node]:
        start_nodes = []
        for node in self.workflow.nodes:
            edges_to = self._reverse_adjacency.get(node.id, [])
            if not edges_to:
                start_nodes.append(node)
        return start_nodes

    def _find_end_nodes(self) -> List[Node]:
        return [
            n
            for n in self.workflow.nodes
            if n.id not in self._adjacency
            or not self._adjacency[n.id]
        ]

    def _schedule_event(
        self, time_offset: float, event_type: str, entity_id: str, node_id: str, priority: int = 0
    ):
        event_time = self._current_time + time_offset
        event_id = f"{event_type}_{entity_id}_{node_id}_{event_time}"
        heapq.heappush(
            self._event_queue,
            SimulationEvent(
                time=event_time,
                priority=priority,
                event_id=event_id,
                event_type=event_type,
                entity_id=entity_id,
                node_id=node_id,
            ),
        )

    def _get_outgoing_edges(self, node_id: str) -> List[Edge]:
        return self._adjacency.get(node_id, [])

    def _get_successor_ids(self, node_id: str, entity: Entity) -> List[str]:
        edges = self._get_outgoing_edges(node_id)
        if not edges:
            return []

        result = []
        for edge in edges:
            if edge.condition:
                entity_val = entity.properties.get(edge.condition.field)
                condition_val = edge.condition.value
                op = edge.condition.operator
                if op == "==" and entity_val == condition_val:
                    result.append(edge.target_id)
                elif op == "!=" and entity_val != condition_val:
                    result.append(edge.target_id)
                elif op == ">" and entity_val is not None and entity_val > condition_val:
                    result.append(edge.target_id)
                elif op == "<" and entity_val is not None and entity_val < condition_val:
                    result.append(edge.target_id)
            elif edge.probability < 1.0:
                if self._rng.random() < edge.probability:
                    result.append(edge.target_id)
            else:
                result.append(edge.target_id)

        return result

    def _create_entity(self, label: str = "Entity") -> Entity:
        entity = Entity(label=label)
        self._entities[entity.id] = entity
        self._log_event(EventType.ENTITY_CREATED, entity.id, "", {"label": label})
        return entity

    def _send_entity_to_node(self, entity: Entity, node_id: str):
        node = self._node_map.get(node_id)
        if not node:
            return

        entity.current_node_id = node_id
        entity.status = EntityStatus.PROCESSING

        entry = EntityHistoryEntry(
            node_id=node_id,
            node_label=node.label if node else "",
            entered_at=self._current_time,
        )
        entity.history.append(entry)

        self._log_event(
            EventType.ENTITY_ENTERED, entity.id, node_id, {"node_label": node.label}
        )

        self._process_entity_at_node(entity, node)

    def _process_entity_at_node(self, entity: Entity, node: Node):
        behavior = get_behavior_for_node(node)
        context = ProcessingContext(
            workflow_id=self.workflow.id,
            simulation_time=self._current_time,
            resources=self._resource_usage,
            random=self._rng,
            config=self.config,
        )

        pt = behavior.processing_time(entity, context)
        self._node_metrics[node.id].total_busy_time += pt

        self._log_event(
            EventType.STARTED_PROCESSING,
            entity.id,
            node.id,
            {"processing_time": pt},
        )

        self._schedule_event(
            pt, "processing_complete", entity.id, node.id, priority=1
        )

    def _on_processing_complete(self, entity_id: str, node_id: str):
        entity = self._entities.get(entity_id)
        node = self._node_map.get(node_id)
        if not entity or not node:
            return

        behavior = get_behavior_for_node(node)
        context = ProcessingContext(
            workflow_id=self.workflow.id,
            simulation_time=self._current_time,
            resources=self._resource_usage,
            random=self._rng,
            config=self.config,
        )

        result = behavior.process(entity, context)

        metrics = self._node_metrics[node_id]
        metrics.entities_processed += 1

        for resource_id, amount in result.resource_usage.items():
            self._resource_usage[resource_id] = (
                self._resource_usage.get(resource_id, 0) + amount
            )

        if entity.history:
            entity.history[-1].exited_at = self._current_time

        if result.success:
            entity.status = EntityStatus.COMPLETED
            self._log_event(EventType.COMPLETED, entity_id, node_id)
        else:
            entity.status = EntityStatus.FAILED
            metrics.errors += 1
            self._log_event(
                EventType.FAILED, entity_id, node_id, {"error": result.error}
            )

        successor_ids = self._get_successor_ids(node_id, entity)
        if not successor_ids:
            end_nodes = self._find_end_nodes()
            if node_id in [n.id for n in end_nodes]:
                entity.status = EntityStatus.COMPLETED
                entity.completed_at = self._current_time
                return
            return

        for succ_id in successor_ids:
            self._send_entity_to_node(entity, succ_id)

    def _generate_entity_arrivals(self):
        start_nodes = self._find_start_nodes()
        if not start_nodes:
            return

        num_entities = min(self.config.max_entities, 20)

        for i in range(num_entities):
            arrival_time = i * (1.0 / max(self.config.arrival_rate, 0.1))
            entity = self._create_entity(label=f"Entity_{i}")
            for start_node in start_nodes:
                self._schedule_event(
                    arrival_time,
                    "entity_arrival",
                    entity.id,
                    start_node.id,
                    priority=0,
                )

    def run(self) -> SimulationRun:
        self._run_result.started_at = 0.0
        self._run_result.status = "running"

        self._generate_entity_arrivals()

        while self._event_queue:
            event = heapq.heappop(self._event_queue)
            self._current_time = event.time

            if event.event_type == "entity_arrival":
                self._send_entity_to_node(
                    self._entities[event.entity_id], event.node_id
                )
            elif event.event_type == "processing_complete":
                self._on_processing_complete(event.entity_id, event.node_id)

        self._run_result.ended_at = self._current_time
        self._run_result.status = "completed"
        self._run_result.metrics = self._compute_metrics()

        return self._run_result

    def _compute_metrics(self) -> SimulationMetrics:
        completed = [
            e for e in self._entities.values() if e.status == EntityStatus.COMPLETED
        ]
        failed = [
            e for e in self._entities.values() if e.status == EntityStatus.FAILED
        ]

        cycle_times = []
        for entity in completed:
            if entity.history:
                first = entity.history[0].entered_at
                last = entity.history[-1].exited_at or self._current_time
                ct = last - first
                cycle_times.append(ct)

        total_time = (
            self._run_result.ended_at - self._run_result.started_at
        ) if self._run_result.ended_at is not None and self._run_result.started_at is not None else 1.0

        for node_id, metrics in self._node_metrics.items():
            metrics.utilization = (
                metrics.total_busy_time / total_time if total_time > 0 else 0.0
            )

        metrics = SimulationMetrics(
            total_entities=len(self._entities),
            completed_entities=len(completed),
            failed_entities=len(failed),
            avg_cycle_time=sum(cycle_times) / len(cycle_times) if cycle_times else 0.0,
            min_cycle_time=min(cycle_times) if cycle_times else 0.0,
            max_cycle_time=max(cycle_times) if cycle_times else 0.0,
            throughput=len(completed) / total_time if total_time > 0 else 0.0,
            resource_utilization={
                k: v / total_time if total_time > 0 else 0.0
                for k, v in self._resource_usage.items()
            },
            node_metrics=self._node_metrics,
        )
        return metrics

    def get_event_log(self) -> List[EventLogEntry]:
        return self._event_log

    def get_run_results(self) -> SimulationRun:
        return self._run_result
