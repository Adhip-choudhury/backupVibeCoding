import type { Machine, Operator, Job, Order, Shift, MaintenanceRecord, QualityRecord, Alert } from '../types';

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function isoDaysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

export const seedMachines: Machine[] = [
  { id: 'M001', name: 'CNC Lathe 1', type: 'lathe', status: 'running', location: 'Bay A-1', maintenanceDue: daysFromNow(15), capabilities: ['turning', 'threading'], setupTime: 15 },
  { id: 'M002', name: 'CNC Lathe 2', type: 'lathe', status: 'idle', location: 'Bay A-2', maintenanceDue: daysFromNow(20), capabilities: ['turning', 'threading'], setupTime: 20 },
  { id: 'M003', name: 'Milling Machine 1', type: 'mill', status: 'running', location: 'Bay B-1', maintenanceDue: daysFromNow(10), capabilities: ['milling', 'drilling'], setupTime: 10 },
  { id: 'M004', name: 'Milling Machine 2', type: 'mill', status: 'maintenance', location: 'Bay B-2', maintenanceDue: daysFromNow(-2), capabilities: ['milling', 'drilling'], setupTime: 12 },
  { id: 'M005', name: 'Grinding Machine', type: 'grinder', status: 'idle', location: 'Bay C-1', maintenanceDue: daysFromNow(30), capabilities: ['grinding', 'finishing'], setupTime: 25 },
  { id: 'M006', name: 'Drill Press', type: 'drill', status: 'running', location: 'Bay C-2', maintenanceDue: daysFromNow(25), capabilities: ['drilling', 'tapping'], setupTime: 5 },
  { id: 'M007', name: 'Press Brake', type: 'press', status: 'breakdown', location: 'Bay D-1', maintenanceDue: daysFromNow(-2), capabilities: ['bending', 'forming'], setupTime: 30 },
  { id: 'M008', name: 'Welding Station 1', type: 'welder', status: 'running', location: 'Bay D-2', maintenanceDue: daysFromNow(18), capabilities: ['welding', 'cutting'], setupTime: 10 },
  { id: 'M009', name: 'CNC Lathe 3', type: 'lathe', status: 'stopped', location: 'Bay A-3', maintenanceDue: daysFromNow(22), capabilities: ['turning', 'threading', 'grooving'], setupTime: 18 },
  { id: 'M010', name: 'Assembly Station', type: 'assembly', status: 'running', location: 'Bay E-1', maintenanceDue: daysFromNow(35), capabilities: ['assembly', 'testing'], setupTime: 8 },
];

export const seedOperators: Operator[] = [
  { id: 'OP001', name: 'Rajesh Kumar', skills: ['turning', 'threading'], shift: 'morning', availability: true, assignedMachine: 'M001' },
  { id: 'OP002', name: 'Priya Sharma', skills: ['milling', 'drilling'], shift: 'morning', availability: true, assignedMachine: 'M003' },
  { id: 'OP003', name: 'Amit Singh', skills: ['welding', 'cutting'], shift: 'morning', availability: false, assignedMachine: 'M008' },
  { id: 'OP004', name: 'Sunil Patel', skills: ['grinding', 'finishing'], shift: 'afternoon', availability: true, assignedMachine: null },
  { id: 'OP005', name: 'Deepa Verma', skills: ['turning', 'grooving'], shift: 'afternoon', availability: true, assignedMachine: null },
  { id: 'OP006', name: 'Vikram Joshi', skills: ['drilling', 'tapping'], shift: 'afternoon', availability: true, assignedMachine: 'M006' },
  { id: 'OP007', name: 'Anita Desai', skills: ['assembly', 'testing'], shift: 'morning', availability: true, assignedMachine: 'M010' },
  { id: 'OP008', name: 'Ravi Gupta', skills: ['bending', 'forming'], shift: 'night', availability: true, assignedMachine: null },
  { id: 'OP009', name: 'Meena Reddy', skills: ['milling', 'drilling', 'turning'], shift: 'night', availability: true, assignedMachine: null },
  { id: 'OP010', name: 'Suresh Nair', skills: ['welding', 'cutting', 'assembly'], shift: 'night', availability: false, assignedMachine: null },
  { id: 'OP011', name: 'Kavita Jain', skills: ['turning', 'threading', 'grooving'], shift: 'morning', availability: true, assignedMachine: null },
  { id: 'OP012', name: 'Manoj Tiwari', skills: ['milling', 'drilling'], shift: 'afternoon', availability: true, assignedMachine: null },
];

export const seedOrders: Order[] = [
  { id: 'ORD-1001', customer: 'AutoParts Inc.', dueDate: daysFromNow(7), quantity: 500, progress: 60, status: 'in_production' },
  { id: 'ORD-1002', customer: 'MachineBuild Co.', dueDate: daysFromNow(14), quantity: 200, progress: 30, status: 'in_production' },
  { id: 'ORD-1003', customer: 'IndustrialGear Ltd.', dueDate: daysFromNow(10), quantity: 1000, progress: 0, status: 'new' },
  { id: 'ORD-1004', customer: 'PrecisionParts LLC', dueDate: daysFromNow(-2), quantity: 150, progress: 100, status: 'completed' },
  { id: 'ORD-1005', customer: 'SteelFabricators', dueDate: daysFromNow(16), quantity: 750, progress: 20, status: 'in_production' },
  { id: 'ORD-1006', customer: 'AeroComponents', dueDate: daysFromNow(-3), quantity: 50, progress: 40, status: 'delayed' },
  { id: 'ORD-1007', customer: 'HydraulicSys Co.', dueDate: daysFromNow(21), quantity: 300, progress: 0, status: 'new' },
];

export const seedJobs: Job[] = [
  { id: 'JOB-1001', orderId: 'ORD-1001', description: 'Turn shaft ends', machineRequirement: 'lathe', operatorRequirement: ['turning'], priority: 'high', status: 'in_progress', deadline: daysFromNow(5), assignedMachine: 'M001', assignedOperator: 'OP001', createdAt: daysFromNow(-7), progress: 70 },
  { id: 'JOB-1002', orderId: 'ORD-1001', description: 'Thread shaft ends', machineRequirement: 'lathe', operatorRequirement: ['threading'], priority: 'high', status: 'pending', deadline: daysFromNow(6), assignedMachine: null, assignedOperator: null, createdAt: daysFromNow(-7), progress: 0 },
  { id: 'JOB-1003', orderId: 'ORD-1002', description: 'Mill base plate', machineRequirement: 'mill', operatorRequirement: ['milling'], priority: 'medium', status: 'in_progress', deadline: daysFromNow(12), assignedMachine: 'M003', assignedOperator: 'OP002', createdAt: daysFromNow(-5), progress: 40 },
  { id: 'JOB-1004', orderId: 'ORD-1002', description: 'Drill mounting holes', machineRequirement: 'drill', operatorRequirement: ['drilling'], priority: 'medium', status: 'pending', deadline: daysFromNow(13), assignedMachine: null, assignedOperator: null, createdAt: daysFromNow(-5), progress: 0 },
  { id: 'JOB-1005', orderId: 'ORD-1003', description: 'Cut and form brackets', machineRequirement: 'press', operatorRequirement: ['bending', 'forming'], priority: 'low', status: 'pending', deadline: daysFromNow(9), assignedMachine: null, assignedOperator: null, createdAt: daysFromNow(-2), progress: 0 },
  { id: 'JOB-1006', orderId: 'ORD-1004', description: 'Grind bearing surfaces', machineRequirement: 'grinder', operatorRequirement: ['grinding', 'finishing'], priority: 'medium', status: 'completed', deadline: daysFromNow(-2), assignedMachine: 'M005', assignedOperator: 'OP004', createdAt: daysFromNow(-9), progress: 100 },
  { id: 'JOB-1007', orderId: 'ORD-1005', description: 'Weld frame assembly', machineRequirement: 'welder', operatorRequirement: ['welding', 'cutting'], priority: 'high', status: 'pending', deadline: daysFromNow(14), assignedMachine: null, assignedOperator: null, createdAt: daysFromNow(-1), progress: 0 },
  { id: 'JOB-1008', orderId: 'ORD-1005', description: 'Final assembly', machineRequirement: 'assembly', operatorRequirement: ['assembly', 'testing'], priority: 'high', status: 'pending', deadline: daysFromNow(16), assignedMachine: null, assignedOperator: null, createdAt: daysFromNow(-1), progress: 0 },
  { id: 'JOB-1009', orderId: 'ORD-1006', description: 'Turn precision components', machineRequirement: 'lathe', operatorRequirement: ['turning', 'grooving'], priority: 'critical', status: 'delayed', deadline: daysFromNow(-5), assignedMachine: 'M002', assignedOperator: 'OP005', createdAt: daysFromNow(-12), progress: 45 },
  { id: 'JOB-1010', orderId: 'ORD-1007', description: 'Mill gear housings', machineRequirement: 'mill', operatorRequirement: ['milling', 'drilling'], priority: 'low', status: 'pending', deadline: daysFromNow(20), assignedMachine: null, assignedOperator: null, createdAt: daysFromNow(0), progress: 0 },
];

const today = new Date().toISOString().split('T')[0];

export const seedShifts: Shift[] = [
  { id: 'SFT-M-01', type: 'morning', startTime: '06:00', endTime: '14:00', assignedOperators: ['OP001', 'OP002', 'OP003', 'OP007', 'OP011'], date: today },
  { id: 'SFT-A-01', type: 'afternoon', startTime: '14:00', endTime: '22:00', assignedOperators: ['OP004', 'OP005', 'OP006', 'OP012'], date: today },
  { id: 'SFT-N-01', type: 'night', startTime: '22:00', endTime: '06:00', assignedOperators: ['OP008', 'OP009', 'OP010'], date: today },
];

export const seedMaintenanceRecords: MaintenanceRecord[] = [
  { id: 'MT-001', machineId: 'M004', issue: 'Spindle bearing replacement', startTime: isoDaysFromNow(-1), endTime: null, status: 'in_progress', type: 'repair' },
  { id: 'MT-002', machineId: 'M007', issue: 'Hydraulic leak - pump failure', startTime: isoDaysFromNow(-1), endTime: null, status: 'in_progress', type: 'repair' },
  { id: 'MT-003', machineId: 'M001', issue: 'Routine oil change and calibration', startTime: isoDaysFromNow(15), endTime: null, status: 'scheduled', type: 'preventive' },
];

export const seedQualityRecords: QualityRecord[] = [
  { id: 'QC-001', jobId: 'JOB-1006', defectType: 'surface_roughness', result: 'pass', remarks: 'Within tolerance', timestamp: isoDaysFromNow(-1) },
  { id: 'QC-002', jobId: 'JOB-1001', defectType: 'dimensional', result: 'rework', remarks: '0.05mm oversize on diameter', timestamp: isoDaysFromNow(0) },
];

export const seedAlerts: Alert[] = [
  { id: 'AL-001', type: 'breakdown', severity: 'critical', source: 'Press Brake', message: 'Press Brake (M007) has a hydraulic leak and is stopped', time: isoDaysFromNow(-1), resolved: false },
  { id: 'AL-002', type: 'maintenance_due', severity: 'info', source: 'Milling Machine 2', message: 'Milling Machine 2 (M004) maintenance is overdue', time: isoDaysFromNow(-2), resolved: false },
  { id: 'AL-003', type: 'late_job', severity: 'warning', source: 'ORD-1006', message: 'Order ORD-1006 (AeroComponents) is delayed', time: isoDaysFromNow(-1), resolved: false },
  { id: 'AL-004', type: 'shortage', severity: 'warning', source: 'Welding Station 1', message: 'No available operator for Welding Station 1 on night shift', time: isoDaysFromNow(-1), resolved: false },
];
