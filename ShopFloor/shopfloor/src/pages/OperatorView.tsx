import { useStore } from '../store/store';

export default function OperatorView() {
  const { state, assignOperatorToMachine } = useStore();

  const handleAssign = (operatorId: string, machineId: string) => {
    assignOperatorToMachine(operatorId, machineId || null);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Operator View</h1>
      </div>

      <div className="card">
        <h3>Skills, Shifts, and Assignments</h3>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Operator</th>
                <th>Skills</th>
                <th>Shift</th>
                <th>Availability</th>
                <th>Assigned Machine</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.operators.map(op => {
                const machine = op.assignedMachine
                  ? state.machines.find(m => m.id === op.assignedMachine)
                  : null;
                return (
                  <tr key={op.id}>
                    <td>
                      <strong>{op.name}</strong><br />
                      <span className="text-muted">{op.id}</span>
                    </td>
                    <td>
                      <div className="tag-group">
                        {op.skills.map(skill => (
                          <span key={skill} className="tag">{skill}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`shift-badge shift-${op.shift}`}>
                        {op.shift}
                      </span>
                    </td>
                    <td>
                      <span className={`availability-dot ${op.availability ? 'available' : 'unavailable'}`}>
                        {op.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      {machine ? (
                        <span>{machine.name} <span className="text-muted">({machine.id})</span></span>
                      ) : (
                        <span className="text-muted">Not assigned</span>
                      )}
                    </td>
                    <td>
                      <select
                        className="select-sm"
                        value={op.assignedMachine || ''}
                        onChange={e => handleAssign(op.id, e.target.value)}
                      >
                        <option value="">— Unassign —</option>
                        {state.machines.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.status})
                          </option>
                        ))}
                      </select>
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
