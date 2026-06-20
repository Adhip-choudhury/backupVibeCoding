import { useStore } from '../store/store';
import { MachineStatusBadge, JobStatusBadge, PriorityBadge } from '../components/StatusBadge';

export default function Reports() {
  const { state } = useStore();

  const runningCount = state.machines.filter(m => m.status === 'running').length;
  const idleCount = state.machines.filter(m => m.status === 'idle').length;
  const downCount = state.machines.filter(m => m.status === 'breakdown' || m.status === 'stopped' || m.status === 'maintenance').length;
  const utilizationRate = state.machines.length > 0
    ? Math.round((runningCount / state.machines.length) * 100)
    : 0;

  const completedJobs = state.jobs.filter(j => j.status === 'completed').length;
  const totalJobs = state.jobs.length;
  const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

  const avgProgress = state.jobs.filter(j => j.status === 'in_progress').reduce((sum, j) => sum + j.progress, 0);
  const inProgressCount = state.jobs.filter(j => j.status === 'in_progress').length;
  const avgProgressVal = inProgressCount > 0 ? Math.round(avgProgress / inProgressCount) : 0;

  return (
    <div>
      <div className="page-header">
        <h1>Reports</h1>
        <p className="text-muted">Utilization, Downtime, Output & Efficiency</p>
      </div>

      <div className="card-grid">
        <div className="card card-stat">
          <div className="stat-value">{utilizationRate}%</div>
          <div className="stat-label">Machine Utilization</div>
          <div className="stat-detail">
            <span style={{ color: '#22c55e' }}>● {runningCount} Running</span>
            <span style={{ color: '#64748b' }}>● {idleCount} Idle</span>
            <span style={{ color: '#ef4444' }}>● {downCount} Down</span>
          </div>
        </div>
        <div className="card card-stat">
          <div className="stat-value">{completionRate}%</div>
          <div className="stat-label">Job Completion Rate</div>
          <div className="stat-detail">
            <span style={{ color: '#22c55e' }}>● {completedJobs} Completed</span>
            <span style={{ color: '#3b82f6' }}>● {totalJobs - completedJobs} Remaining</span>
          </div>
        </div>
        <div className="card card-stat">
          <div className="stat-value">{avgProgressVal}%</div>
          <div className="stat-label">Avg In-Progress Progress</div>
          <div className="stat-detail">
            <span>{inProgressCount} active jobs</span>
          </div>
        </div>
        <div className="card card-stat">
          <div className="stat-value">{state.alerts.filter(a => !a.resolved).length}</div>
          <div className="stat-label">Active Issues</div>
          <div className="stat-detail">
            <span style={{ color: '#ef4444' }}>
              {state.alerts.filter(a => !a.resolved && a.severity === 'critical').length} Critical
            </span>
            <span style={{ color: '#f59e0b' }}>
              {state.alerts.filter(a => !a.resolved && a.severity === 'warning').length} Warnings
            </span>
          </div>
        </div>
      </div>

      <div className="card-grid-2">
        <div className="card">
          <h3>Machine Utilization Breakdown</h3>
          <div className="report-list">
            {state.machines.map(m => (
              <div key={m.id} className="report-row">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong>{m.name}</strong>
                  <MachineStatusBadge status={m.status} />
                </div>
                <div className="text-muted" style={{ fontSize: 13 }}>
                  Type: {m.type} | Location: {m.location} | Jobs: {state.jobs.filter(j => j.assignedMachine === m.id).length}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Order Progress</h3>
          <div className="report-list">
            {state.orders.map(order => (
              <div key={order.id} className="report-row">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong>{order.id}</strong>
                  <span>{order.customer}</span>
                </div>
                <div className="progress-bar" style={{ marginBottom: 4 }}>
                  <div className="progress-fill" style={{
                    width: `${order.progress}%`,
                    backgroundColor: order.status === 'delayed' ? '#ef4444' : order.status === 'completed' ? '#22c55e' : '#3b82f6',
                  }}></div>
                </div>
                <div className="text-muted" style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{order.progress}% complete</span>
                  <span>Due: {new Date(order.dueDate).toLocaleDateString()}</span>
                  <span>Qty: {order.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>All Jobs Status</h3>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Description</th>
                <th>Order</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {state.jobs.map(job => (
                <tr key={job.id}>
                  <td><strong>{job.id}</strong></td>
                  <td>{job.description}</td>
                  <td>{job.orderId}</td>
                  <td><PriorityBadge priority={job.priority} /></td>
                  <td><JobStatusBadge status={job.status} /></td>
                  <td>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${job.progress}%` }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
