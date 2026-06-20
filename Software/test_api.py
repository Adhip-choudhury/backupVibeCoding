import json, urllib.request

def test(name, data):
    req = urllib.request.Request('http://localhost:8000/api/simulate',
        data=json.dumps(data).encode(),
        headers={'Content-Type': 'application/json'})
    res = json.loads(urllib.request.urlopen(req).read())
    ok = res['status'] == 'completed' and res['metrics']['completed_entities'] > 0
    m = res['metrics']
    line = f"  {name}: {'PASS' if ok else 'FAIL'} ({m['completed_entities']}/{m['total_entities']} completed, {m['avg_cycle_time']:.2f}s avg)"
    print(line)
    return ok

results = []

# 1. Simple linear workflow
w1 = {
    'id': 'w1', 'name': 'Linear', 'version': 1,
    'nodes': [
        {'id': 's', 'type': 'simulation_start', 'label': 'Start', 'position_x': 0, 'position_y': 0,
         'properties': {}, 'custom_fields': [], 'input_ports': [], 'output_ports': [{'id': 'p1', 'label': 'out', 'port_type': 'data'}]},
        {'id': 't', 'type': 'job_order', 'label': 'Process', 'position_x': 200, 'position_y': 0,
         'properties': {}, 'custom_fields': [], 'input_ports': [{'id': 'p2', 'label': 'in', 'port_type': 'data'}],
         'output_ports': [{'id': 'p3', 'label': 'out', 'port_type': 'data'}]},
        {'id': 'e', 'type': 'simulation_end', 'label': 'End', 'position_x': 400, 'position_y': 0,
         'properties': {}, 'custom_fields': [], 'input_ports': [{'id': 'p4', 'label': 'in', 'port_type': 'data'}], 'output_ports': []}
    ],
    'edges': [
        {'id': 'e1', 'source_id': 's', 'target_id': 't', 'source_port': 'p1', 'target_port': 'p2', 'label': '', 'condition': None, 'probability': 1.0},
        {'id': 'e2', 'source_id': 't', 'target_id': 'e', 'source_port': 'p3', 'target_port': 'p4', 'label': '', 'condition': None, 'probability': 1.0}
    ]
}
results.append(test('Linear workflow', {'workflow': w1, 'max_entities': 10}))

# 2. Decision workflow
w2 = {
    'id': 'w2', 'name': 'Decision', 'version': 1,
    'nodes': [
        {'id': 's', 'type': 'simulation_start', 'label': 'Start', 'position_x': 0, 'position_y': 0,
         'properties': {}, 'custom_fields': [], 'input_ports': [], 'output_ports': [{'id': 'p1', 'label': 'out', 'port_type': 'data'}]},
        {'id': 'd', 'type': 'checkpoint', 'label': 'QC Check', 'position_x': 200, 'position_y': 0,
         'properties': {}, 'custom_fields': [], 'input_ports': [{'id': 'p2', 'label': 'in', 'port_type': 'data'}],
         'output_ports': [{'id': 'p3', 'label': 'ok', 'port_type': 'data'}, {'id': 'p4', 'label': 'fail', 'port_type': 'data'}]},
        {'id': 'rw', 'type': 'rework', 'label': 'Rework', 'position_x': 200, 'position_y': 100,
         'properties': {}, 'custom_fields': [], 'input_ports': [{'id': 'p5', 'label': 'in', 'port_type': 'data'}],
         'output_ports': [{'id': 'p6', 'label': 'out', 'port_type': 'data'}]},
        {'id': 'e', 'type': 'simulation_end', 'label': 'End', 'position_x': 400, 'position_y': 0,
         'properties': {}, 'custom_fields': [], 'input_ports': [{'id': 'p7', 'label': 'in', 'port_type': 'data'}], 'output_ports': []}
    ],
    'edges': [
        {'id': 'e1', 'source_id': 's', 'target_id': 'd', 'source_port': 'p1', 'target_port': 'p2', 'label': '', 'condition': None, 'probability': 1.0},
        {'id': 'e2', 'source_id': 'd', 'target_id': 'e', 'source_port': 'p3', 'target_port': 'p7', 'label': '', 'condition': None, 'probability': 0.7},
        {'id': 'e3', 'source_id': 'd', 'target_id': 'rw', 'source_port': 'p4', 'target_port': 'p5', 'label': '', 'condition': None, 'probability': 0.3},
        {'id': 'e4', 'source_id': 'rw', 'target_id': 'd', 'source_port': 'p6', 'target_port': 'p2', 'label': '', 'condition': None, 'probability': 1.0}
    ]
}
results.append(test('Decision workflow', {'workflow': w2, 'max_entities': 20, 'random_seed': 42}))

# 3. Parallel workflow
w3 = {
    'id': 'w3', 'name': 'Parallel', 'version': 1,
    'nodes': [
        {'id': 's', 'type': 'simulation_start', 'label': 'Start', 'position_x': 0, 'position_y': 0,
         'properties': {}, 'custom_fields': [], 'input_ports': [], 'output_ports': [{'id': 'p1', 'label': 'out', 'port_type': 'data'}]},
        {'id': 'sp', 'type': 'priority_level', 'label': 'Split', 'position_x': 200, 'position_y': 0,
         'properties': {}, 'custom_fields': [], 'input_ports': [{'id': 'p2', 'label': 'in', 'port_type': 'data'}],
         'output_ports': [{'id': 'p3', 'label': 'a', 'port_type': 'data'}, {'id': 'p4', 'label': 'b', 'port_type': 'data'}]},
        {'id': 'a', 'type': 'line_cell', 'label': 'Path A', 'position_x': 400, 'position_y': -50,
         'properties': {}, 'custom_fields': [], 'input_ports': [{'id': 'p5', 'label': 'in', 'port_type': 'data'}],
         'output_ports': [{'id': 'p6', 'label': 'out', 'port_type': 'data'}]},
        {'id': 'b', 'type': 'line_cell', 'label': 'Path B', 'position_x': 400, 'position_y': 50,
         'properties': {}, 'custom_fields': [], 'input_ports': [{'id': 'p7', 'label': 'in', 'port_type': 'data'}],
         'output_ports': [{'id': 'p8', 'label': 'out', 'port_type': 'data'}]},
        {'id': 'mg', 'type': 'deadline', 'label': 'Merge', 'position_x': 600, 'position_y': 0,
         'properties': {}, 'custom_fields': [], 'input_ports': [{'id': 'p9', 'label': 'in', 'port_type': 'data'}, {'id': 'p10', 'label': 'in2', 'port_type': 'data'}],
         'output_ports': [{'id': 'p11', 'label': 'out', 'port_type': 'data'}]},
        {'id': 'e', 'type': 'simulation_end', 'label': 'End', 'position_x': 800, 'position_y': 0,
         'properties': {}, 'custom_fields': [], 'input_ports': [{'id': 'p12', 'label': 'in', 'port_type': 'data'}], 'output_ports': []}
    ],
    'edges': [
        {'id': 'e1', 'source_id': 's', 'target_id': 'sp', 'source_port': 'p1', 'target_port': 'p2', 'label': '', 'condition': None, 'probability': 1.0},
        {'id': 'e2', 'source_id': 'sp', 'target_id': 'a', 'source_port': 'p3', 'target_port': 'p5', 'label': '', 'condition': None, 'probability': 1.0},
        {'id': 'e3', 'source_id': 'sp', 'target_id': 'b', 'source_port': 'p4', 'target_port': 'p7', 'label': '', 'condition': None, 'probability': 1.0},
        {'id': 'e4', 'source_id': 'a', 'target_id': 'mg', 'source_port': 'p6', 'target_port': 'p9', 'label': '', 'condition': None, 'probability': 1.0},
        {'id': 'e5', 'source_id': 'b', 'target_id': 'mg', 'source_port': 'p8', 'target_port': 'p10', 'label': '', 'condition': None, 'probability': 1.0},
        {'id': 'e6', 'source_id': 'mg', 'target_id': 'e', 'source_port': 'p9', 'target_port': 'p12', 'label': '', 'condition': None, 'probability': 1.0}
    ]
}
results.append(test('Parallel workflow', {'workflow': w3, 'max_entities': 5}))

# 4. Multi-node end-to-end
w4 = {
    'id': 'w4', 'name': 'Full Flow', 'version': 1,
    'nodes': [
        {'id': 's', 'type': 'simulation_start', 'label': 'Start', 'position_x': 0, 'position_y': 0,
         'properties': {}, 'custom_fields': [], 'input_ports': [], 'output_ports': [{'id': 'p1', 'label': 'out', 'port_type': 'data'}]},
        {'id': 'q', 'type': 'warehouse', 'label': 'Inbox', 'position_x': 200, 'position_y': 0,
         'properties': {}, 'custom_fields': [], 'input_ports': [{'id': 'p2', 'label': 'in', 'port_type': 'data'}],
         'output_ports': [{'id': 'p3', 'label': 'out', 'port_type': 'data'}]},
        {'id': 't1', 'type': 'job_order', 'label': 'Assign', 'position_x': 400, 'position_y': 0,
         'properties': {}, 'custom_fields': [], 'input_ports': [{'id': 'p4', 'label': 'in', 'port_type': 'data'}],
         'output_ports': [{'id': 'p5', 'label': 'out', 'port_type': 'data'}]},
        {'id': 'd1', 'type': 'priority_level', 'label': 'Priority?', 'position_x': 600, 'position_y': 0,
         'properties': {}, 'custom_fields': [], 'input_ports': [{'id': 'p6', 'label': 'in', 'port_type': 'data'}],
         'output_ports': [{'id': 'p7', 'label': 'high', 'port_type': 'data'}, {'id': 'p8', 'label': 'low', 'port_type': 'data'}]},
        {'id': 'th', 'type': 'line_cell', 'label': 'Process High', 'position_x': 800, 'position_y': -50,
         'properties': {}, 'custom_fields': [], 'input_ports': [{'id': 'p9', 'label': 'in', 'port_type': 'data'}],
         'output_ports': [{'id': 'p10', 'label': 'out', 'port_type': 'data'}]},
        {'id': 'tl', 'type': 'line_cell', 'label': 'Process Low', 'position_x': 800, 'position_y': 50,
         'properties': {}, 'custom_fields': [], 'input_ports': [{'id': 'p11', 'label': 'in', 'port_type': 'data'}],
         'output_ports': [{'id': 'p12', 'label': 'out', 'port_type': 'data'}]},
        {'id': 'em', 'type': 'alert_notification', 'label': 'Notify', 'position_x': 1000, 'position_y': 0,
         'properties': {}, 'custom_fields': [], 'input_ports': [{'id': 'p13', 'label': 'in', 'port_type': 'data'}],
         'output_ports': [{'id': 'p14', 'label': 'out', 'port_type': 'data'}]},
        {'id': 'e', 'type': 'simulation_end', 'label': 'End', 'position_x': 1200, 'position_y': 0,
         'properties': {}, 'custom_fields': [], 'input_ports': [{'id': 'p15', 'label': 'in', 'port_type': 'data'}], 'output_ports': []}
    ],
    'edges': [
        {'id': 'e1', 'source_id': 's', 'target_id': 'q', 'source_port': 'p1', 'target_port': 'p2', 'label': '', 'condition': None, 'probability': 1.0},
        {'id': 'e2', 'source_id': 'q', 'target_id': 't1', 'source_port': 'p3', 'target_port': 'p4', 'label': '', 'condition': None, 'probability': 1.0},
        {'id': 'e3', 'source_id': 't1', 'target_id': 'd1', 'source_port': 'p5', 'target_port': 'p6', 'label': '', 'condition': None, 'probability': 1.0},
        {'id': 'e4', 'source_id': 'd1', 'target_id': 'th', 'source_port': 'p7', 'target_port': 'p9', 'label': '', 'condition': None, 'probability': 0.5},
        {'id': 'e5', 'source_id': 'd1', 'target_id': 'tl', 'source_port': 'p8', 'target_port': 'p11', 'label': '', 'condition': None, 'probability': 0.5},
        {'id': 'e6', 'source_id': 'th', 'target_id': 'em', 'source_port': 'p10', 'target_port': 'p13', 'label': '', 'condition': None, 'probability': 1.0},
        {'id': 'e7', 'source_id': 'tl', 'target_id': 'em', 'source_port': 'p12', 'target_port': 'p13', 'label': '', 'condition': None, 'probability': 1.0},
        {'id': 'e8', 'source_id': 'em', 'target_id': 'e', 'source_port': 'p14', 'target_port': 'p15', 'label': '', 'condition': None, 'probability': 1.0}
    ]
}
results.append(test('Multi-node workflow', {'workflow': w4, 'max_entities': 8, 'random_seed': 42}))

print(f'\n{sum(results)}/{len(results)} tests passed')
if not all(results):
    exit(1)
