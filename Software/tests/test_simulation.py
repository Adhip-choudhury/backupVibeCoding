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


def test_simple_linear_workflow():
    start = Node(type=NodeType.SIMULATION_START, label="Start", id="start")
    task = Node(type=NodeType.JOB_ORDER, label="Review Document", id="task1")
    end = Node(type=NodeType.SIMULATION_END, label="End", id="end")

    edges = [
        Edge(source_id="start", target_id="task1"),
        Edge(source_id="task1", target_id="end"),
    ]

    workflow = Workflow(name="Simple Review", nodes=[start, task, end], edges=edges)
    config = SimulationConfig(max_entities=5, arrival_rate=2.0, random_seed=42)

    engine = SimulationEngine(workflow, config)
    result = engine.run()

    assert result.status == "completed"
    assert result.metrics.total_entities == 5
    assert result.metrics.completed_entities == 5
    assert result.metrics.failed_entities == 0
    assert result.metrics.avg_cycle_time > 0
    assert result.metrics.throughput > 0

    log = engine.get_event_log()
    assert len(log) > 0
    entity_created_events = [e for e in log if e.event_type.value == "entity_created"]
    assert len(entity_created_events) == 5


def test_decision_workflow():
    start = Node(type=NodeType.SIMULATION_START, label="Start", id="start")
    decision = Node(
        type=NodeType.BOTTLENECK, label="Quality Check?", id="dec1"
    )
    rework = Node(type=NodeType.REWORK, label="Rework", id="rework")
    end = Node(type=NodeType.SIMULATION_END, label="End", id="end")

    edges = [
        Edge(source_id="start", target_id="dec1"),
        Edge(source_id="dec1", target_id="rework", probability=0.3),
        Edge(source_id="dec1", target_id="end", probability=0.7),
        Edge(source_id="rework", target_id="end"),
    ]

    workflow = Workflow(
        name="Decision Flow", nodes=[start, decision, rework, end], edges=edges
    )
    config = SimulationConfig(max_entities=20, random_seed=42)

    engine = SimulationEngine(workflow, config)
    result = engine.run()

    assert result.status == "completed"
    assert result.metrics.total_entities == 20
    assert result.metrics.avg_cycle_time > 0


def test_parallel_split_workflow():
    start = Node(type=NodeType.SIMULATION_START, label="Start", id="start")
    split = Node(type=NodeType.PRIORITY_LEVEL, label="Split", id="split1")
    task_a = Node(type=NodeType.LINE_CELL, label="Task A", id="ta")
    task_b = Node(type=NodeType.LINE_CELL, label="Task B", id="tb")
    merge = Node(type=NodeType.DEADLINE, label="Merge", id="merge1")
    end = Node(type=NodeType.SIMULATION_END, label="End", id="end")

    edges = [
        Edge(source_id="start", target_id="split1"),
        Edge(source_id="split1", target_id="ta"),
        Edge(source_id="split1", target_id="tb"),
        Edge(source_id="ta", target_id="merge1"),
        Edge(source_id="tb", target_id="merge1"),
        Edge(source_id="merge1", target_id="end"),
    ]

    workflow = Workflow(
        name="Parallel Workflow",
        nodes=[start, split, task_a, task_b, merge, end],
        edges=edges,
    )
    config = SimulationConfig(max_entities=5, random_seed=42)

    engine = SimulationEngine(workflow, config)
    result = engine.run()

    assert result.status == "completed"
    assert result.metrics.total_entities == 5


def test_no_edges_workflow():
    start = Node(type=NodeType.SIMULATION_START, label="Start", id="start")
    end = Node(type=NodeType.SIMULATION_END, label="End", id="end")

    workflow = Workflow(name="Empty", nodes=[start, end], edges=[])
    config = SimulationConfig(max_entities=3, random_seed=42)

    engine = SimulationEngine(workflow, config)
    result = engine.run()

    assert result.status == "completed"
    assert result.metrics.total_entities == 3


def test_multiple_start_nodes():
    start_a = Node(type=NodeType.SIMULATION_START, label="Start A", id="sa")
    start_b = Node(type=NodeType.SIMULATION_START, label="Start B", id="sb")
    task = Node(type=NodeType.JOB_ORDER, label="Task", id="task1")
    end = Node(type=NodeType.SIMULATION_END, label="End", id="end")

    edges = [
        Edge(source_id="sa", target_id="task1"),
        Edge(source_id="sb", target_id="task1"),
        Edge(source_id="task1", target_id="end"),
    ]

    workflow = Workflow(
        name="Multi Start", nodes=[start_a, start_b, task, end], edges=edges
    )
    config = SimulationConfig(max_entities=10, random_seed=42)

    engine = SimulationEngine(workflow, config)
    result = engine.run()

    assert result.status == "completed"
    assert result.metrics.total_entities == 10


def test_node_metrics():
    start = Node(type=NodeType.SIMULATION_START, label="Start", id="start")
    task = Node(type=NodeType.JOB_ORDER, label="Task", id="task1")
    end = Node(type=NodeType.SIMULATION_END, label="End", id="end")

    edges = [
        Edge(source_id="start", target_id="task1"),
        Edge(source_id="task1", target_id="end"),
    ]

    workflow = Workflow(name="Metrics Test", nodes=[start, task, end], edges=edges)
    config = SimulationConfig(max_entities=10, random_seed=42)

    engine = SimulationEngine(workflow, config)
    result = engine.run()

    task_metrics = result.metrics.node_metrics.get("task1")
    assert task_metrics is not None
    assert task_metrics.entities_processed == 10
    assert task_metrics.total_busy_time > 0
