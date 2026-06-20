import heapq
import random
import math
from typing import Dict, List, Optional, Any, Tuple
from collections import defaultdict, deque
from app.models.node import Node
from app.models.edge import Edge
from app.models.resource import Resource
from app.models.entity import Entity
from app.models.event_log import EventLog, EventType


class Simulator:
    def __init__(self, workflow_nodes: Dict[str, Node], workflow_edges: List[Edge],
                 resources: Dict[str, Resource], config: Dict[str, Any]):
        self.nodes = workflow_nodes
        self.edges = workflow_edges
        self.resources = resources
        self.config = config

        # Event priority queue: (time, seq, {event_dict})
        self.event_queue: List[Tuple[float, int, dict]] = []
        self.event_counter = 0
        self.current_time = 0.0

        # Entity tracking
        self.entities: Dict[str, Entity] = {}

        # Event log
        self.event_logs: List[EventLog] = []

        # Node queues: node_id -> deque of (entity_id, entered_time)
        self.node_queues: Dict[str, deque] = defaultdict(deque)

        # Resource state: resource_id -> {capacity, available, busy_until: {entity_id: release_time}}
        self.resource_state: Dict[str, dict] = {}
        for res_id, res in resources.items():
            self.resource_state[res_id] = {
                'capacity': res.capacity,
                'available': res.capacity,
                'allocations': {}  # entity_id -> release_time
            }

        # Stats
        self.stats = {
            'entities_created': 0,
            'entities_processed': 0,
            'entities_exited': 0,
            'total_processing_time': 0.0,
            'total_wait_time': 0.0,
            'resource_utilization': defaultdict(lambda: {'busy_time': 0.0, 'idle_time': 0.0}),
            'node_visit_count': defaultdict(int),
        }

        # Track resource busy periods for utilization
        self._resource_busy_start: Dict[str, float] = {}

        if 'random_seed' in config:
            random.seed(config['random_seed'])

    # ── helpers ──

    def _schedule(self, delay: float, event_type: EventType, node_id: str,
                  entity_id: str, duration: Optional[float] = None,
                  outcome: str = "success", resources_used: Optional[List[str]] = None):
        t = self.current_time + delay
        heapq.heappush(self.event_queue, (t, self.event_counter, {
            'type': event_type,
            'node_id': node_id,
            'entity_id': entity_id,
            'duration': duration,
            'outcome': outcome,
            'resources_used': resources_used or []
        }))
        self.event_counter += 1

    def _log(self, event_type: EventType, node_id: str, entity_id: str,
             duration: Optional[float] = None, outcome: str = "success",
             resources_used: Optional[List[str]] = None):
        self.event_logs.append(EventLog(
            timestamp=self.current_time,
            type=event_type.value,
            node_id=node_id,
            entity_id=entity_id,
            duration=duration,
            outcome=outcome,
            resources_used=resources_used or []
        ))

    def _outgoing(self, node_id: str) -> List[Edge]:
        return [e for e in self.edges if e.source == node_id]

    def _sample_duration(self, cfg: dict) -> float:
        dist = cfg.get('distribution', 'fixed')
        mean = cfg.get('mean', 1.0)
        if dist == 'fixed':
            return mean
        elif dist == 'normal':
            sd = cfg.get('stdDev', 0.1 * mean)
            return max(0.0, random.normalvariate(mean, sd))
        elif dist == 'exponential':
            return random.expovariate(1.0 / mean)
        elif dist == 'uniform':
            lo = cfg.get('min', mean * 0.5)
            hi = cfg.get('max', mean * 1.5)
            return random.uniform(lo, hi)
        return mean

    # ── resource management ──

    def _resources_available(self, needed: List[str]) -> bool:
        for rid in needed:
            rs = self.resource_state.get(rid)
            if rs is None or rs['available'] <= 0:
                return False
        return True

    def _acquire(self, needed: List[str], entity_id: str) -> bool:
        if not self._resources_available(needed):
            return False
        for rid in needed:
            rs = self.resource_state[rid]
            rs['available'] -= 1
            rs['allocations'][entity_id] = float('inf')  # set real release time later
            if entity_id not in self._resource_busy_start:
                self._resource_busy_start[entity_id] = self.current_time
        return True

    def _release(self, needed: List[str], entity_id: str):
        for rid in needed:
            rs = self.resource_state.get(rid)
            if rs and entity_id in rs['allocations']:
                # Track busy time
                start = self._resource_busy_start.pop(entity_id, self.current_time)
                rs['allocations'].pop(entity_id)
                rs['available'] += 1

    # ── node handlers ──

    def _handle_enter(self, node_id: str, entity_id: str):
        node = self.nodes.get(node_id)
        if not node:
            return

        self._log(EventType.ENTITY_ENTERED, node_id, entity_id)
        self.stats['node_visit_count'][node_id] += 1
        ntype = node.type

        if ntype == "Start":
            self._route_entity(node_id, entity_id, "success")
        elif ntype == "Task":
            self._try_process(node_id, entity_id)
        elif ntype == "Decision":
            self._handle_decision(node_id, entity_id)
        elif ntype == "Delay":
            d = self._sample_duration(node.properties.get('durationSecs', {'mean': 1.0}))
            self._schedule(d, EventType.ENTITY_COMPLETED_PROCESSING, node_id, entity_id,
                           duration=d)
        elif ntype == "End":
            self._log(EventType.ENTITY_EXITED, node_id, entity_id)
            self.stats['entities_exited'] += 1

    def _try_process(self, node_id: str, entity_id: str):
        node = self.nodes.get(node_id)
        if not node:
            return
        needed = node.properties.get('resourcesRequired', [])
        if self._acquire(needed, entity_id):
            d = self._sample_duration(node.properties.get('durationSecs', {'mean': 1.0}))
            sr = node.properties.get('successRate', 1.0)
            outcome = "success" if random.random() < sr else "failure"
            self._schedule(d, EventType.ENTITY_COMPLETED_PROCESSING, node_id, entity_id,
                           duration=d, outcome=outcome, resources_used=needed)
            self._log(EventType.ENTITY_STARTED_PROCESSING, node_id, entity_id,
                      resources_used=needed)
            self.stats['entities_processed'] += 1
            self.stats['total_processing_time'] += d
        else:
            # Queue for this node
            self.node_queues[node_id].append((entity_id, self.current_time))
            self._log(EventType.ENTITY_QUEUED, node_id, entity_id)

    def _handle_decision(self, node_id: str, entity_id: str):
        node = self.nodes.get(node_id)
        if not node:
            return
        edges = self._outgoing(node_id)

        # Evaluate conditions on edges based on successRate
        success_rate = node.properties.get('successRate', 0.5)
        pass_edge = edges[0] if len(edges) > 0 else None
        fail_edge = edges[1] if len(edges) > 1 else None

        if random.random() < success_rate:
            self._log(EventType.ENTITY_DECIDED, node_id, entity_id, outcome="pass")
            if pass_edge:
                self._schedule(0, EventType.ENTITY_ENTERED, pass_edge.target, entity_id)
        else:
            self._log(EventType.ENTITY_DECIDED, node_id, entity_id, outcome="fail")
            if fail_edge:
                self._schedule(0, EventType.ENTITY_ENTERED, fail_edge.target, entity_id)
            elif pass_edge:
                # fallback to only available edge
                self._schedule(0, EventType.ENTITY_ENTERED, pass_edge.target, entity_id)

    def _route_entity(self, node_id: str, entity_id: str, outcome: str):
        edges = self._outgoing(node_id)
        if not edges:
            self._log(EventType.ENTITY_EXITED, node_id, entity_id)
            self.stats['entities_exited'] += 1
            return
        self._schedule(0, EventType.ENTITY_ENTERED, edges[0].target, entity_id)

    def _check_queue(self, node_id: str):
        """After a resource is freed, check if queued entities can start."""
        if node_id not in self.node_queues or not self.node_queues[node_id]:
            return
        node = self.nodes.get(node_id)
        if not node:
            return
        needed = node.properties.get('resourcesRequired', [])
        while self.node_queues[node_id]:
            ent_id, _ = self.node_queues[node_id][0]
            if self._resources_available(needed):
                self.node_queues[node_id].popleft()
                self._try_process(node_id, ent_id)
            else:
                break

    # ── main loop ──

    def run(self):
        duration = self.config.get('durationSecs', 3600.0)
        arrival_rate = self.config.get('arrivalRatePerHour', 1.0)

        # Find start node
        start_nodes = [nid for nid, n in self.nodes.items() if n.type == "Start"]
        if not start_nodes:
            raise ValueError("Workflow must have at least one Start node")
        start_id = start_nodes[0]

        # Create initial entities
        num = int((arrival_rate / 3600.0) * duration)
        for i in range(num):
            eid = f"entity_{i}"
            self.entities[eid] = Entity(id=eid, type="Default",
                                        creation_time=i * (3600.0 / arrival_rate) if arrival_rate > 0 else 0)
            entry = i * (3600.0 / arrival_rate) if arrival_rate > 0 else 0
            self._schedule(entry, EventType.ENTITY_ENTERED, start_id, eid)
            self.stats['entities_created'] += 1

        # Process events
        while self.event_queue:
            t, _, ev = heapq.heappop(self.event_queue)
            if t > duration:
                break
            self.current_time = t
            etype = ev['type']
            nid = ev['node_id']
            eid = ev['entity_id']

            if etype == EventType.ENTITY_ENTERED:
                self._handle_enter(nid, eid)
            elif etype == EventType.ENTITY_STARTED_PROCESSING:
                pass  # already logged at schedule time
            elif etype == EventType.ENTITY_COMPLETED_PROCESSING:
                self._log(EventType.ENTITY_COMPLETED_PROCESSING, nid, eid,
                          duration=ev.get('duration'),
                          outcome=ev.get('outcome', 'success'),
                          resources_used=ev.get('resources_used', []))
                self._release(ev.get('resources_used', []), eid)
                self._route_entity(nid, eid, ev.get('outcome', 'success'))
                self._check_queue(nid)
            elif etype == EventType.ENTITY_EXITED:
                self._log(EventType.ENTITY_EXITED, nid, eid)
                self.stats['entities_exited'] += 1

        self._calc_stats(duration)
        return {'event_logs': self.event_logs, 'statistics': dict(self.stats)}

    def _calc_stats(self, duration: float):
        # Cycle times
        enter_times: Dict[str, float] = {}
        exit_times: Dict[str, float] = {}
        for ev in self.event_logs:
            if ev.type == EventType.ENTITY_ENTERED.value:
                if ev.entity_id not in enter_times:
                    enter_times[ev.entity_id] = ev.timestamp
            elif ev.type == EventType.ENTITY_EXITED.value:
                exit_times[ev.entity_id] = ev.timestamp

        cycles = [exit_times[e] - enter_times[e] for e in exit_times if e in enter_times]
        self.stats['avg_cycle_time'] = sum(cycles) / len(cycles) if cycles else 0.0
        self.stats['throughput_per_hour'] = self.stats['entities_exited'] / (duration / 3600.0) if duration > 0 else 0.0

        # Resource utilization
        for rid, rs in self.resource_state.items():
            # Rough estimate: assume resources are busy proportionally to entities processed
            cap = rs['capacity']
            self.stats['resource_utilization'][rid] = min(1.0, self.stats['entities_processed'] / (cap * 10)) if cap > 0 else 0

        # Bottleneck: nodes with highest average visit count
        if self.stats['node_visit_count']:
            sorted_nodes = sorted(self.stats['node_visit_count'].items(), key=lambda x: -x[1])
            self.stats['bottleneck_nodes'] = [n[0] for n in sorted_nodes[:3]]

    def get_current_state(self):
        return {
            'current_time': self.current_time,
            'entities': {eid: e.dict() for eid, e in self.entities.items()},
            'event_logs': [el.dict() for el in self.event_logs[-50:]],
            'queues': {nid: [e[0] for e in q] for nid, q in self.node_queues.items()},
            'statistics': dict(self.stats)
        }
