"""
Example simulation runner.  Loads a workflow, runs the engine, prints KPIs.
"""
import json, os, sys
from pathlib import Path

# Ensure backend is importable
sys.path.insert(0, str(Path(__file__).parent))

from app.simulation.engine.simulator import Simulator
from app.models.node import Node
from app.models.edge import Edge
from app.models.resource import Resource


def load_workflow(path: str):
    with open(path) as f:
        data = json.load(f)
    nodes = {n["id"]: Node(**n) for n in data["nodes"]}
    edges = [Edge(**e) for e in data["edges"]]
    return nodes, edges, data


def default_resources():
    return {
        "Machine_A": Resource(id="Machine_A", name="CNC Mill",           type="Machine", capacity=2, cost_per_hour=15.0),
        "Worker_1":  Resource(id="Worker_1",  name="Assembly Worker 1",   type="Worker",  capacity=3, cost_per_hour=25.0),
        "Worker_2":  Resource(id="Worker_2",  name="Assembly Worker 2",   type="Worker",  capacity=3, cost_per_hour=25.0),
        "Machine_B": Resource(id="Machine_B", name="Packaging Machine",  type="Machine", capacity=1, cost_per_hour=12.0),
    }


def print_kpis(stats: dict):
    sep = "-" * 60
    print(f"\n{sep}")
    print("  *** KPI REPORT ***")
    print(sep)
    print(f"  Entities created:     {stats.get('entities_created', 0)}")
    print(f"  Entities processed:   {stats.get('entities_processed', 0)}")
    print(f"  Entities exited:      {stats.get('entities_exited', 0)}")
    print(f"  ----")
    print(f"  Avg cycle time:       {stats.get('avg_cycle_time', 0):.1f} sec")
    print(f"  Throughput:           {stats.get('throughput_per_hour', 0):.1f} entities/hour")
    print(f"  Total processing:     {stats.get('total_processing_time', 0):.1f} sec")
    print(f"  ----")
    print(f"  Bottleneck nodes:     {', '.join(stats.get('bottleneck_nodes', []))}")
    print(f"  Resource utilization:")
    for rid, util in stats.get('resource_utilization', {}).items():
        print(f"    {rid:20s}  {util*100:5.1f}%")
    print(f"  Node visits:")
    for nid, cnt in stats.get('node_visit_count', {}).items():
        print(f"    {nid:20s}  {cnt} visits")
    print(f"{sep}\n")


def run_manufacturing():
    """Run the manufacturing workflow and print KPIs."""
    workflow_path = Path(__file__).parent / "test_workflow.json"
    print("-- Manufacturing Assembly Line --")
    nodes, edges, meta = load_workflow(workflow_path)
    resources = default_resources()
    config = {"durationSecs": 3600, "arrivalRatePerHour": 10, "randomSeed": 42}

    sim = Simulator(nodes, edges, resources, config)
    result = sim.run()
    print(f"  Workflow: {meta['name']}  |  Events: {len(result['event_logs'])}")
    print_kpis(result['statistics'])
    return result


def run_healthcare():
    """Hospital patient-flow workflow."""
    workflow = {
        "nodes": [
            {"id":"s",   "type":"Start",     "position":{"x":50,"y":200}, "label":"Arrival",     "properties":{}},
            {"id":"reg", "type":"Task",      "position":{"x":200,"y":200},"label":"Registration","properties":{"durationSecs":{"mean":180,"distribution":"normal","stdDev":30},"resourcesRequired":["Nurse"],"successRate":1.0}},
            {"id":"tri", "type":"Task",      "position":{"x":380,"y":200},"label":"Triage",      "properties":{"durationSecs":{"mean":120,"distribution":"normal","stdDev":20},"resourcesRequired":["Nurse"],"successRate":1.0}},
            {"id":"dr",  "type":"Task",      "position":{"x":560,"y":200},"label":"Examination", "properties":{"durationSecs":{"mean":600,"distribution":"normal","stdDev":120},"resourcesRequired":["Doctor"],"successRate":0.9}},
            {"id":"lab", "type":"Decision",  "position":{"x":740,"y":200},"label":"Labs Needed?","properties":{"successRate":0.65}},
            {"id":"l",   "type":"Delay",     "position":{"x":920,"y":120},"label":"Lab Results", "properties":{"durationSecs":{"mean":1800,"distribution":"exponential"}}},
            {"id":"ph",  "type":"Task",      "position":{"x":920,"y":280},"label":"Pharmacy",    "properties":{"durationSecs":{"mean":240,"distribution":"normal","stdDev":45},"resourcesRequired":["Pharmacist"],"successRate":1.0}},
            {"id":"e",   "type":"End",       "position":{"x":1100,"y":200},"label":"Discharge",  "properties":{}},
        ],
        "edges": [
            {"id":"e1","source":"s","target":"reg"},
            {"id":"e2","source":"reg","target":"tri"},
            {"id":"e3","source":"tri","target":"dr"},
            {"id":"e4","source":"dr","target":"lab"},
            {"id":"e5","source":"lab","target":"l", "label":"Yes"},
            {"id":"e6","source":"lab","target":"ph","label":"No"},
            {"id":"e7","source":"l","target":"ph"},
            {"id":"e8","source":"ph","target":"e"},
        ]
    }
    nodes = {n["id"]: Node(**n) for n in workflow["nodes"]}
    edges = [Edge(**e) for e in workflow["edges"]]
    resources = {
        "Nurse":      Resource(id="Nurse",      name="Registered Nurse",  type="Worker",  capacity=5,  cost_per_hour=40),
        "Doctor":     Resource(id="Doctor",     name="Physician",         type="Worker",  capacity=2,  cost_per_hour=120),
        "Pharmacist": Resource(id="Pharmacist", name="Pharmacist",        type="Worker",  capacity=3,  cost_per_hour=55),
    }
    config = {"durationSecs": 28800, "arrivalRatePerHour": 6, "randomSeed": 42}  # 8-hour shift

    print("-- Hospital Patient Flow --")
    sim = Simulator(nodes, edges, resources, config)
    result = sim.run()
    print(f"  Events: {len(result['event_logs'])}")
    print_kpis(result['statistics'])
    return result


if __name__ == "__main__":
    run_manufacturing()
    run_healthcare()
