import { useStore } from '../store/store';
import { MachineStatusBadge } from '../components/StatusBadge';
import type { MachineStatus } from '../types';

export default function MachineView() {
  const { state, updateMachineStatus } = useStore();

  const handleStatusChange = (id: string, status: MachineStatus) => {
    updateMachineStatus(id, status);
  };

  const statusOptions: MachineStatus[] = ['running', 'idle', 'stopped', 'maintenance', 'breakdown'];

  return (
    <div>
      <div className="page-header">
        <h1>Machine View</h1>
      </div>

      <div className="card">
        <h3>Machine Status & History</h3>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Machine</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
                <th>Capabilities</th>
                <th>Setup Time</th>
                <th>Maintenance Due</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.machines.map(machine => {
                const op = state.operators.find(o => o.assignedMachine === machine.id);
                const jobs = state.jobs.filter(j => j.assignedMachine === machine.id);
                return (
                  <tr key={machine.id}>
                    <td><strong>{machine.name}</strong><br /><span className="text-muted">{machine.id}</span></td>
                    <td>{machine.type}</td>
                    <td>{machine.location}</td>
                    <td><MachineStatusBadge status={machine.status} /></td>
                    <td>
                      <div className="tag-group">
                        {machine.capabilities.map(cap => (
                          <span key={cap} className="tag">{cap}</span>
                        ))}
                      </div>
                    </td>
                    <td>{machine.setupTime} min</td>
                    <td>{new Date(machine.maintenanceDue).toLocaleDateString()}</td>
                    <td>
                      <select
                        className="select-sm"
                        value={machine.status}
                        onChange={e => handleStatusChange(machine.id, e.target.value as MachineStatus)}
                      >
                        {statusOptions.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>
                        {op ? `Op: ${op.name}` : 'No operator'}
                        {jobs.length > 0 ? ` | ${jobs.length} job(s)` : ''}
                      </div>
                    </td>
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
