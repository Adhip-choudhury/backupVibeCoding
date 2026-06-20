import csv
import random
import os
from datetime import datetime, timedelta, timezone

MACHINES = [
    {"name": "CNC Lathe A1", "code": "CNC-001", "location": "Bay 1"},
    {"name": "CNC Lathe A2", "code": "CNC-002", "location": "Bay 1"},
    {"name": "Milling Machine B1", "code": "MIL-001", "location": "Bay 2"},
    {"name": "Milling Machine B2", "code": "MIL-002", "location": "Bay 2"},
    {"name": "Grinder C1", "code": "GRN-001", "location": "Bay 3"},
    {"name": "Drill Press D1", "code": "DRL-001", "location": "Bay 1"},
    {"name": "Hydraulic Press E1", "code": "PRS-001", "location": "Bay 3"},
    {"name": "Welding Station F1", "code": "WLD-001", "location": "Bay 2"},
]

SAMPLE_TYPES = [
    {"name": "Shaft Diameter", "unit": "mm", "lsl": 49.85, "usl": 50.15, "target": 50.0},
    {"name": "Surface Roughness", "unit": "Ra", "lsl": 0.0, "usl": 1.6, "target": 0.8},
    {"name": "Hardness (HRC)", "unit": "HRC", "lsl": 38.0, "usl": 42.0, "target": 40.0},
    {"name": "Torque", "unit": "Nm", "lsl": 88.0, "usl": 92.0, "target": 90.0},
    {"name": "Thickness", "unit": "mm", "lsl": 4.85, "usl": 5.15, "target": 5.0},
]

USERS = [
    {"username": "operator1", "email": "op1@wispr.local", "password": "pass123", "role": "operator"},
    {"username": "operator2", "email": "op2@wispr.local", "password": "pass123", "role": "operator"},
    {"username": "engineer1", "email": "eng1@wispr.local", "password": "pass123", "role": "engineer"},
    {"username": "manager1", "email": "mgr1@wispr.local", "password": "pass123", "role": "manager"},
    {"username": "admin", "email": "admin@wispr.local", "password": "admin123", "role": "admin"},
]


def generate_sample_csv(path: str, num_samples: int = 200):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    now = datetime.now(timezone.utc)
    rows = []
    for i in range(num_samples):
        machine = random.choice(MACHINES)
        st = random.choice(SAMPLE_TYPES)
        center = (st["lsl"] + st["usl"]) / 2
        spread = (st["usl"] - st["lsl"]) / 6
        value = random.gauss(center, spread)
        value = round(max(st["lsl"] - 0.05, min(st["usl"] + 0.05, value)), 3)
        measured_at = now - timedelta(hours=random.randint(0, 720))
        rows.append({
            "machine_code": machine["code"],
            "sample_type": st["name"],
            "value": value,
            "measured_at": measured_at.isoformat(),
            "notes": "",
        })
    with open(path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["machine_code", "sample_type", "value", "measured_at", "notes"])
        w.writeheader()
        w.writerows(rows)
    return path
