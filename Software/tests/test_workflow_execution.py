from src.core.models import (
    Edge,
    Entity,
    EntityStatus,
    Node,
    NodeType,
    SimulationConfig,
    Workflow,
)
from src.core.simulation import SimulationEngine


def test_executable_start_end_workflow():
    start = Node(type=NodeType.SIMULATION_START, label="Start", id="s")
    task = Node(type=NodeType.JOB_ORDER, label="Review", id="t1")
    end = Node(type=NodeType.SIMULATION_END, label="End", id="e")

    edges = [Edge(source_id="s", target_id="t1"), Edge(source_id="t1", target_id="e")]
    wf = Workflow(name="Executable", nodes=[start, task, end], edges=edges)
    config = SimulationConfig(max_entities=10, random_seed=42)

    engine = SimulationEngine(wf, config)
    result = engine.run()

    assert result.status == "completed"
    assert result.metrics.total_entities == 10
    assert result.metrics.completed_entities == 10
    assert result.metrics.failed_entities == 0
    assert result.metrics.avg_cycle_time > 0

    log = engine.get_event_log()
    entity_created = [e for e in log if e.event_type.value == "entity_created"]
    assert len(entity_created) == 10


def test_decision_routing_workflow():
    start = Node(type=NodeType.SIMULATION_START, label="Start", id="s")
    dec = Node(type=NodeType.CHECKPOINT, label="QC Check?", id="d1")
    rework = Node(type=NodeType.REWORK, label="Rework", id="rw")
    approve = Node(type=NodeType.QUALITY, label="Approve", id="ap")
    end = Node(type=NodeType.SIMULATION_END, label="End", id="e")

    edges = [
        Edge(source_id="s", target_id="d1"),
        Edge(source_id="d1", target_id="rw", probability=0.3),
        Edge(source_id="d1", target_id="ap", probability=0.7),
        Edge(source_id="rw", target_id="d1"),
        Edge(source_id="ap", target_id="e"),
    ]
    wf = Workflow(name="QC Loop", nodes=[start, dec, rework, approve, end], edges=edges)
    config = SimulationConfig(max_entities=15, random_seed=42)

    engine = SimulationEngine(wf, config)
    result = engine.run()

    assert result.status == "completed"
    assert result.metrics.completed_entities > 0
    assert result.metrics.avg_cycle_time > 0

    rw_metrics = result.metrics.node_metrics.get("rw")
    assert rw_metrics is not None


def test_parallel_gateway_workflow():
    start = Node(type=NodeType.SIMULATION_START, label="Start", id="s")
    split = Node(type=NodeType.PRIORITY_LEVEL, label="Split", id="sp")
    path_a = Node(type=NodeType.LINE_CELL, label="Path A", id="pa")
    path_b = Node(type=NodeType.LINE_CELL, label="Path B", id="pb")
    merge = Node(type=NodeType.DEADLINE, label="Merge", id="mg")
    end = Node(type=NodeType.SIMULATION_END, label="End", id="e")

    edges = [
        Edge(source_id="s", target_id="sp"),
        Edge(source_id="sp", target_id="pa"),
        Edge(source_id="sp", target_id="pb"),
        Edge(source_id="pa", target_id="mg"),
        Edge(source_id="pb", target_id="mg"),
        Edge(source_id="mg", target_id="e"),
    ]
    wf = Workflow(name="Parallel", nodes=[start, split, path_a, path_b, merge, end], edges=edges)
    config = SimulationConfig(max_entities=8, random_seed=42)

    engine = SimulationEngine(wf, config)
    result = engine.run()

    assert result.status == "completed"
    assert result.metrics.total_entities == 8


def test_multi_node_type_workflow():
    types = [
        Node(type=NodeType.SIMULATION_START, label="Start", id="s"),
        Node(type=NodeType.WAREHOUSE, label="Inbox", id="q"),
        Node(type=NodeType.JOB_ORDER, label="Assign", id="t1"),
        Node(type=NodeType.PRIORITY_LEVEL, label="Priority?", id="d1"),
        Node(type=NodeType.LINE_CELL, label="Process High", id="th"),
        Node(type=NodeType.LINE_CELL, label="Process Low", id="tl"),
        Node(type=NodeType.ALERT_NOTIFICATION, label="Notify", id="em"),
        Node(type=NodeType.SIMULATION_END, label="End", id="e"),
    ]
    edges = [
        Edge(source_id="s", target_id="q"),
        Edge(source_id="q", target_id="t1"),
        Edge(source_id="t1", target_id="d1"),
        Edge(source_id="d1", target_id="th", condition=None),
        Edge(source_id="d1", target_id="tl", condition=None),
        Edge(source_id="th", target_id="em"),
        Edge(source_id="tl", target_id="em"),
        Edge(source_id="em", target_id="e"),
    ]
    wf = Workflow(name="Full Flow", nodes=types, edges=edges)
    config = SimulationConfig(max_entities=5, random_seed=42)

    engine = SimulationEngine(wf, config)
    result = engine.run()

    assert result.status == "completed"
    assert result.metrics.completed_entities == 5

    for nid in ["q", "t1", "d1", "em", "e"]:
        assert nid in result.metrics.node_metrics
        assert result.metrics.node_metrics[nid].entities_processed > 0


def test_canvas_to_simulation_equivalence():
    from src.core.models import Workflow, Node, Edge, NodeType

    nodes = [
        Node(type=NodeType.SIMULATION_START, label="Start", id=str(i))
        for i in range(1)
    ] + [
        Node(type=NodeType.JOB_ORDER, label="Task", id=str(i))
        for i in range(1, 3)
    ] + [
        Node(type=NodeType.SIMULATION_END, label="End", id="99")
    ]
    nodes[0].position_x = 100
    nodes[0].position_y = 200
    nodes[1].position_x = 300
    nodes[1].position_y = 200
    nodes[2].position_x = 500
    nodes[2].position_y = 200
    nodes[3].position_x = 700
    nodes[3].position_y = 200

    edges = [
        Edge(source_id=nodes[0].id, target_id=nodes[1].id),
        Edge(source_id=nodes[1].id, target_id=nodes[2].id),
        Edge(source_id=nodes[2].id, target_id=nodes[3].id),
    ]

    wf = Workflow(name="Canvas WF", nodes=nodes, edges=edges)
    assert len(wf.nodes) == 4
    assert len(wf.edges) == 3

    dump = wf.model_dump(mode="json")
    restored = Workflow.model_validate(dump)

    engine = SimulationEngine(restored, SimulationConfig(max_entities=3, random_seed=42))
    result = engine.run()
    assert result.status == "completed"
    assert result.metrics.total_entities == 3
    assert result.metrics.completed_entities == 3
