import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import type {
  AppState, Machine, Operator, Job, Order, Shift,
  MaintenanceRecord, QualityRecord, Alert, MachineStatus, JobStatus,
} from '../types';
import {
  seedMachines, seedOperators, seedJobs, seedOrders, seedShifts,
  seedMaintenanceRecords, seedQualityRecords, seedAlerts,
} from './seedData';

type Action =
  | { type: 'SET_MACHINES'; machines: Machine[] }
  | { type: 'UPDATE_MACHINE'; machine: Partial<Machine> & { id: string } }
  | { type: 'SET_OPERATORS'; operators: Operator[] }
  | { type: 'UPDATE_OPERATOR'; operator: Partial<Operator> & { id: string } }
  | { type: 'SET_JOBS'; jobs: Job[] }
  | { type: 'ADD_JOB'; job: Job }
  | { type: 'DELETE_JOB'; id: string }
  | { type: 'UPDATE_JOB'; job: Partial<Job> & { id: string } }
  | { type: 'UPDATE_JOB_STATUS'; id: string; status: JobStatus; progress?: number }
  | { type: 'SET_ORDERS'; orders: Order[] }
  | { type: 'ADD_ORDER'; order: Order }
  | { type: 'UPDATE_ORDER'; order: Partial<Order> & { id: string } }
  | { type: 'SET_SHIFTS'; shifts: Shift[] }
  | { type: 'ADD_SHIFT'; shift: Shift }
  | { type: 'SET_MAINTENANCE'; records: MaintenanceRecord[] }
  | { type: 'ADD_MAINTENANCE'; record: MaintenanceRecord }
  | { type: 'UPDATE_MAINTENANCE'; record: Partial<MaintenanceRecord> & { id: string } }
  | { type: 'SET_QUALITY'; records: QualityRecord[] }
  | { type: 'ADD_QUALITY'; record: QualityRecord }
  | { type: 'SET_ALERTS'; alerts: Alert[] }
  | { type: 'ADD_ALERT'; alert: Alert }
  | { type: 'RESOLVE_ALERT'; id: string }
  | { type: 'AUTO_PLAN' }
  | { type: 'RESET' };

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function checkAndGenerateAlerts(state: AppState): Alert[] {
  const newAlerts: Alert[] = [];
  const now = new Date().toISOString();

  for (const m of state.machines) {
    if (m.status === 'breakdown') {
      newAlerts.push({
        id: generateId('AL'),
        type: 'breakdown',
        severity: 'critical',
        source: m.name,
        message: `${m.name} (${m.id}) has broken down`,
        time: now,
        resolved: false,
      });
    }
    const dueDate = new Date(m.maintenanceDue);
    const diffDays = (dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (diffDays >= 0 && diffDays <= 3) {
      newAlerts.push({
        id: generateId('AL'),
        type: 'maintenance_due',
        severity: 'info',
        source: m.name,
        message: `${m.name} (${m.id}) maintenance due in ${Math.ceil(diffDays)} day(s)`,
        time: now,
        resolved: false,
      });
    }
  }

  for (const j of state.jobs) {
    if (j.status === 'in_progress' || j.status === 'pending') {
      const deadline = new Date(j.deadline);
      const diffHours = (deadline.getTime() - Date.now()) / (1000 * 60 * 60);
      if (diffHours < 0) {
        newAlerts.push({
          id: generateId('AL'),
          type: 'late_job',
          severity: 'critical',
          source: j.description,
          message: `Job ${j.id} (${j.description}) is past deadline`,
          time: now,
          resolved: false,
        });
      } else if (diffHours < 24) {
        newAlerts.push({
          id: generateId('AL'),
          type: 'late_job',
          severity: 'warning',
          source: j.description,
          message: `Job ${j.id} (${j.description}) due within 24 hours`,
          time: now,
          resolved: false,
        });
      }
    }
  }

  for (const j of state.jobs) {
    if (j.status === 'pending' && j.assignedMachine !== null) {
      const machine = state.machines.find(m => m.id === j.assignedMachine);
      if (machine && machine.status === 'breakdown') {
        newAlerts.push({
          id: generateId('AL'),
          type: 'bottleneck',
          severity: 'warning',
          source: machine.name,
          message: `Job ${j.id} assigned to broken machine ${machine.name}`,
          time: now,
          resolved: false,
        });
      }
    }
  }

  return newAlerts;
}

function reAutoPlan(state: AppState): Partial<AppState> {
  const machines = [...state.machines];
  const operators = [...state.operators];
  const jobs = state.jobs.map(j => ({ ...j }));
  const existingAlertSources = new Set(state.alerts.map(a => a.source + a.message));

  const pendingJobs = jobs
    .filter(j => j.status === 'pending' || j.status === 'in_progress')
    .sort((a, b) => {
      const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const diff = pOrder[a.priority] - pOrder[b.priority];
      if (diff !== 0) return diff;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

  for (const job of pendingJobs) {
    if (!job.assignedMachine) {
      const suitable = machines
        .filter(m =>
          job.machineRequirement === m.type &&
          m.status !== 'breakdown' &&
          m.status !== 'maintenance'
        )
        .sort((a, b) => a.setupTime - b.setupTime);

      if (suitable.length > 0) {
        job.assignedMachine = suitable[0].id;
        const machine = machines.find(m => m.id === suitable[0].id);
        if (machine && machine.status === 'idle') {
          machine.status = 'running';
        }
      }
    }

    if (!job.assignedOperator && job.assignedMachine) {
      const availableOperators = operators.filter(o =>
        o.availability &&
        o.assignedMachine === null &&
        job.operatorRequirement.some(s => o.skills.includes(s))
      );

      if (availableOperators.length > 0) {
        const bestOp = availableOperators.sort(
          (a, b) => b.skills.length - a.skills.length
        )[0];
        job.assignedOperator = bestOp.id;
        bestOp.assignedMachine = job.assignedMachine;
      }
    }
  }

  const newAlerts = checkAndGenerateAlerts(state);
  const combinedAlerts = [...state.alerts];
  for (const a of newAlerts) {
    const key = a.source + a.message;
    if (!existingAlertSources.has(key)) {
      combinedAlerts.push(a);
    }
  }

  return { jobs, machines, operators, alerts: combinedAlerts };
}

const initialAppState: AppState = {
  machines: seedMachines,
  operators: seedOperators,
  jobs: seedJobs,
  orders: seedOrders,
  shifts: seedShifts,
  maintenanceRecords: seedMaintenanceRecords,
  qualityRecords: seedQualityRecords,
  alerts: seedAlerts,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_MACHINES':
      return { ...state, machines: action.machines };
    case 'UPDATE_MACHINE': {
      const machines = state.machines.map(m =>
        m.id === action.machine.id ? { ...m, ...action.machine } : m
      );
      return { ...state, machines };
    }
    case 'SET_OPERATORS':
      return { ...state, operators: action.operators };
    case 'UPDATE_OPERATOR': {
      const operators = state.operators.map(o =>
        o.id === action.operator.id ? { ...o, ...action.operator } : o
      );
      return { ...state, operators };
    }
    case 'SET_JOBS':
      return { ...state, jobs: action.jobs };
    case 'ADD_JOB':
      return { ...state, jobs: [...state.jobs, action.job] };
    case 'DELETE_JOB': {
      const jobs = state.jobs.filter(j => j.id !== action.id);
      const qualityRecords = state.qualityRecords.filter(q => q.jobId !== action.id);
      return { ...state, jobs, qualityRecords };
    }
    case 'UPDATE_JOB': {
      const jobs = state.jobs.map(j =>
        j.id === action.job.id ? { ...j, ...action.job } : j
      );
      return { ...state, jobs };
    }
    case 'UPDATE_JOB_STATUS': {
      const { id, status, progress } = action;
      let jobs = state.jobs.map(j =>
        j.id === id ? { ...j, status, progress: progress ?? j.progress } : j
      );
      let machines = state.machines;
      let orders = state.orders;
      if (status === 'completed') {
        const job = state.jobs.find(j => j.id === id);
        if (job?.assignedMachine) {
          machines = machines.map(m =>
            m.id === job.assignedMachine ? { ...m, status: 'idle' as const } : m
          );
        }
        if (job) {
          const order = state.orders.find(o => o.id === job.orderId);
          if (order) {
            const orderJobs = jobs.filter(j => j.orderId === order.id);
            const completedJobs = orderJobs.filter(j => j.status === 'completed');
            const p = orderJobs.length > 0
              ? Math.round((completedJobs.length / orderJobs.length) * 100)
              : 0;
            const os: Order['status'] = p === 100 ? 'completed' : p > 0 ? 'in_production' : order.status;
            orders = orders.map(o => o.id === order.id ? { ...o, progress: p, status: os } : o);
          }
        }
      }
      return { ...state, jobs, machines, orders };
    }
    case 'SET_ORDERS':
      return { ...state, orders: action.orders };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.order] };
    case 'UPDATE_ORDER': {
      const orders = state.orders.map(o =>
        o.id === action.order.id ? { ...o, ...action.order } : o
      );
      return { ...state, orders };
    }
    case 'SET_SHIFTS':
      return { ...state, shifts: action.shifts };
    case 'ADD_SHIFT':
      return { ...state, shifts: [...state.shifts, action.shift] };
    case 'SET_MAINTENANCE':
      return { ...state, maintenanceRecords: action.records };
    case 'ADD_MAINTENANCE':
      return { ...state, maintenanceRecords: [...state.maintenanceRecords, action.record] };
    case 'UPDATE_MAINTENANCE': {
      const maintenanceRecords = state.maintenanceRecords.map(mr =>
        mr.id === action.record.id ? { ...mr, ...action.record } : mr
      );
      return { ...state, maintenanceRecords };
    }
    case 'SET_QUALITY':
      return { ...state, qualityRecords: action.records };
    case 'ADD_QUALITY':
      return { ...state, qualityRecords: [...state.qualityRecords, action.record] };
    case 'SET_ALERTS':
      return { ...state, alerts: action.alerts };
    case 'ADD_ALERT':
      return { ...state, alerts: [...state.alerts, action.alert] };
    case 'RESOLVE_ALERT': {
      const alerts = state.alerts.map(a =>
        a.id === action.id ? { ...a, resolved: true } : a
      );
      return { ...state, alerts };
    }
    case 'AUTO_PLAN':
      return { ...state, ...reAutoPlan(state) };
    case 'RESET':
      return initialAppState;
    default:
      return state;
  }
}

interface StoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  updateMachineStatus: (id: string, status: MachineStatus) => void;
  updateJobStatus: (id: string, status: JobStatus, progress?: number) => void;
  assignJobToMachine: (jobId: string, machineId: string) => void;
  assignOperatorToMachine: (operatorId: string, machineId: string | null) => void;
  resolveAlert: (id: string) => void;
  addJob: (job: Omit<Job, 'id' | 'createdAt'>) => void;
  deleteJob: (id: string) => void;
  autoPlan: () => void;
  reset: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  useEffect(() => {
    dispatch({ type: 'AUTO_PLAN' });
  }, []);

  const updateMachineStatus = useCallback((id: string, status: MachineStatus) => {
    dispatch({ type: 'UPDATE_MACHINE', machine: { id, status } });
  }, []);

  const updateJobStatus = useCallback((id: string, status: JobStatus, progress?: number) => {
    dispatch({ type: 'UPDATE_JOB_STATUS', id, status, progress });
  }, []);

  const assignJobToMachine = useCallback((jobId: string, machineId: string) => {
    dispatch({ type: 'UPDATE_JOB', job: { id: jobId, assignedMachine: machineId, status: 'in_progress' } });
    dispatch({ type: 'UPDATE_MACHINE', machine: { id: machineId, status: 'running' } });
  }, []);

  const assignOperatorToMachine = useCallback((operatorId: string, machineId: string | null) => {
    dispatch({ type: 'UPDATE_OPERATOR', operator: { id: operatorId, assignedMachine: machineId } });
  }, []);

  const resolveAlert = useCallback((id: string) => {
    dispatch({ type: 'RESOLVE_ALERT', id });
  }, []);

  const deleteJob = useCallback((id: string) => {
    dispatch({ type: 'DELETE_JOB', id });
  }, []);

  const addJob = useCallback((jobData: Omit<Job, 'id' | 'createdAt'>) => {
    const job: Job = {
      ...jobData,
      id: generateId('JOB'),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_JOB', job });
    dispatch({ type: 'AUTO_PLAN' });
  }, []);

  const autoPlan = useCallback(() => {
    dispatch({ type: 'AUTO_PLAN' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <StoreContext.Provider value={{
      state, dispatch,
      updateMachineStatus, updateJobStatus,
      assignJobToMachine, assignOperatorToMachine,
      resolveAlert, addJob, deleteJob, autoPlan, reset,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
