export type MachineStatus = 'running' | 'idle' | 'stopped' | 'maintenance' | 'breakdown';

export interface Machine {
  id: string;
  name: string;
  type: string;
  status: MachineStatus;
  location: string;
  maintenanceDue: string;
  capabilities: string[];
  setupTime: number;
}

export type ShiftType = 'morning' | 'afternoon' | 'night';

export interface Operator {
  id: string;
  name: string;
  skills: string[];
  shift: ShiftType;
  availability: boolean;
  assignedMachine: string | null;
}

export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';

export interface Job {
  id: string;
  orderId: string;
  description: string;
  machineRequirement: string;
  operatorRequirement: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: JobStatus;
  deadline: string;
  assignedMachine: string | null;
  assignedOperator: string | null;
  createdAt: string;
  progress: number;
}

export interface Order {
  id: string;
  customer: string;
  dueDate: string;
  quantity: number;
  progress: number;
  status: 'new' | 'in_production' | 'completed' | 'delayed';
}

export interface Shift {
  id: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  assignedOperators: string[];
  date: string;
}

export interface MaintenanceRecord {
  id: string;
  machineId: string;
  issue: string;
  startTime: string;
  endTime: string | null;
  status: 'scheduled' | 'in_progress' | 'completed';
  type: 'preventive' | 'repair';
}

export interface QualityRecord {
  id: string;
  jobId: string;
  defectType: string;
  result: 'pass' | 'fail' | 'rework';
  remarks: string;
  timestamp: string;
}

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertType = 'breakdown' | 'shortage' | 'late_job' | 'bottleneck' | 'maintenance_due';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  source: string;
  message: string;
  time: string;
  resolved: boolean;
}

export interface AppState {
  machines: Machine[];
  operators: Operator[];
  jobs: Job[];
  orders: Order[];
  shifts: Shift[];
  maintenanceRecords: MaintenanceRecord[];
  qualityRecords: QualityRecord[];
  alerts: Alert[];
}
