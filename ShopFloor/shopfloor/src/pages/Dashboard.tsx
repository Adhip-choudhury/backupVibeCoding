import { useStore } from '../store/store';
import { MachineStatusBadge, PriorityBadge, AlertSeverityBadge } from '../components/StatusBadge';
import { CheckCircle, Bell, Cpu, Users, FileText, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { state, autoPlan, updateJobStatus, resolveAlert } = useStore();

  const totalMachines = state.machines.length;
  const runningMachines = state.machines.filter(m => m.status === 'running').length;
  const idleMachines = state.machines.filter(m => m.status === 'idle').length;
  const brokenMachines = state.machines.filter(m => m.status === 'breakdown' || m.status === 'stopped').length;

  const totalOperators = state.operators.length;
  const availableOperators = state.operators.filter(o => o.availability).length;
  const assignedOperators = state.operators.filter(o => o.assignedMachine !== null).length;

  const activeJobs = state.jobs.filter(j => j.status === 'in_progress').length;
  const pendingJobs = state.jobs.filter(j => j.status === 'pending').length;
  const delayedJobs = state.jobs.filter(j => j.status === 'delayed').length;
  const completedJobs = state.jobs.filter(j => j.status === 'completed').length;

  const activeAlerts = state.alerts.filter(a => !a.resolved).length;
  const criticalAlerts = state.alerts.filter(a => !a.resolved && a.severity === 'critical').length;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const handleComplete = (jobId: string) => {
    updateJobStatus(jobId, 'completed', 100);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">{today}</p>
        </div>
        <button className="btn btn-primary" onClick={autoPlan}>
          <Sparkles size={14} /> Run Auto-Plan
        </button>
      </div>

      <div className="card-grid">
        <div className="card card-stat">
          <div className="stat-value">{totalMachines}</div>
          <div className="stat-label">
            <Cpu size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> Machines
          </div>
          <div className="stat-detail">
            <span style={{ color: '#16a34a' }}>● {runningMachines} Running</span>
            <span style={{ color: '#94a3b8' }}>● {idleMachines} Idle</span>
            <span style={{ color: '#ef4444' }}>● {brokenMachines} Down</span>
          </div>
        </div>
        <div className="card card-stat">
          <div className="stat-value">{totalOperators}</div>
          <div className="stat-label">
            <Users size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> Operators
          </div>
          <div className="stat-detail">
            <span style={{ color: '#16a34a' }}>● {availableOperators} Available</span>
            <span style={{ color: '#2563eb' }}>● {assignedOperators} Assigned</span>
          </div>
        </div>
        <div className="card card-stat">
          <div className="stat-value">{activeJobs}</div>
          <div className="stat-label">
            <FileText size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> Active Jobs
          </div>
          <div className="stat-detail">
            <span style={{ color: '#d97706' }}>● {pendingJobs} Pending</span>
            <span style={{ color: '#ef4444' }}>● {delayedJobs} Delayed</span>
            <span>{completedJobs} Done</span>
          </div>
        </div>
        <div className="card card-stat">
          <div className="stat-value" style={{ color: criticalAlerts > 0 ? '#ef4444' : activeAlerts > 0 ? '#d97706' : undefined }}>
            {activeAlerts}
          </div>
          <div className="stat-label">
            <Bell size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> Alerts
          </div>
          <div className="stat-detail">
            <span style={{ color: '#ef4444' }}>● {criticalAlerts} Critical</span>
            <span style={{ color: '#d97706' }}>● {activeAlerts - criticalAlerts} Warnings</span>
          </div>
        </div>
      </div>

      <div className="card-grid-2">
        <div className="card">
          <h3>Active Alerts</h3>
          <div className="alert-list">
            {state.alerts.filter(a => !a.resolved).slice(0, 4).map(alert => (
              <div key={alert.id} className={`alert-item alert-severity-${alert.severity}`}>
                <AlertSeverityBadge severity={alert.severity} />
                <div className="alert-content">
                  <strong>{alert.source}</strong>
                  <p>{alert.message}</p>
                </div>
                <button className="btn btn-sm" onClick={() => resolveAlert(alert.id)}>
                  Resolve
                </button>
              </div>
            ))}
            {state.alerts.filter(a => !a.resolved).length === 0 && (
              <p className="text-muted" style={{ padding: 8 }}>No active alerts</p>
            )}
          </div>
        </div>
        <div className="card">
          <h3>In-Progress Jobs</h3>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Priority</th>
                  <th>Progress</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {state.jobs.filter(j => j.status === 'in_progress').slice(0, 6).map(job => (
                  <tr key={job.id}>
                    <td>
                      <strong>{job.id}</strong><br />
                      <span className="text-muted">{job.description}</span>
                    </td>
                    <td><PriorityBadge priority={job.priority} /></td>
                    <td style={{ minWidth: 100 }}>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: `${job.progress}%`,
                          backgroundColor: job.progress > 80 ? '#16a34a' : job.progress > 40 ? '#f97316' : '#2563eb'
                        }}></div>
                      </div>
                      <span className="text-muted" style={{ fontSize: 11 }}>{job.progress}%</span>
                    </td>
                    <td>
                      <button className="btn btn-sm" onClick={() => handleComplete(job.id)} title="Mark complete">
                        <CheckCircle size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {state.jobs.filter(j => j.status === 'in_progress').length === 0 && (
                  <tr><td colSpan={4} className="text-muted" style={{ textAlign: 'center', padding: 16 }}>No jobs in progress</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Machine Overview</h3>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Machine</th>
                <th>Type</th>
                <th>Status</th>
                <th>Location</th>
                <th>Operator</th>
                <th>Maintenance Due</th>
              </tr>
            </thead>
            <tbody>
              {state.machines.map(machine => {
                const op = state.operators.find(o => o.assignedMachine === machine.id);
                return (
                  <tr key={machine.id}>
                    <td><strong>{machine.name}</strong></td>
                    <td>{machine.type}</td>
                    <td><MachineStatusBadge status={machine.status} /></td>
                    <td>{machine.location}</td>
                    <td>{op ? op.name : <span className="text-muted">—</span>}</td>
                    <td>{new Date(machine.maintenanceDue).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
