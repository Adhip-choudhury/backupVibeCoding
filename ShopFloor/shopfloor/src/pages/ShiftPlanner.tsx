import { useStore } from '../store/store';

export default function ShiftPlanner() {
  const { state } = useStore();

  const getOperatorsByShift = (shiftType: string) =>
    state.operators.filter(o => o.shift === shiftType);

  return (
    <div>
      <div className="page-header">
        <h1>Shift Planner</h1>
      </div>

      <div className="card">
        <h3>Shift Setup & Manpower Planning</h3>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Shift</th>
                <th>Time</th>
                <th>Date</th>
                <th>Operators</th>
              </tr>
            </thead>
            <tbody>
              {state.shifts.map(shift => (
                <tr key={shift.id}>
                  <td>
                    <span className={`shift-badge shift-${shift.type}`}>
                      {shift.type}
                    </span>
                  </td>
                  <td>{shift.startTime} — {shift.endTime}</td>
                  <td>{new Date(shift.date).toLocaleDateString()}</td>
                  <td>
                    <div className="tag-group">
                      {shift.assignedOperators.map(opId => {
                        const op = state.operators.find(o => o.id === opId);
                        return op ? (
                          <span key={opId} className="tag" title={`Skills: ${op.skills.join(', ')}`}>
                            {op.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-grid-3">
        {(['morning', 'afternoon', 'night'] as const).map(shiftType => {
          const ops = getOperatorsByShift(shiftType);
          const shiftInfo = state.shifts.find(s => s.type === shiftType);
          return (
            <div key={shiftType} className="card">
              <h4 className={`shift-badge shift-${shiftType}`} style={{ display: 'inline-block', marginBottom: 12 }}>
                {shiftType} shift
              </h4>
              {shiftInfo && (
                <div className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>
                  {shiftInfo.startTime} — {shiftInfo.endTime}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ops.map(op => (
                  <div key={op.id} className="operator-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{op.name}</strong>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        backgroundColor: op.availability ? '#22c55e' : '#ef4444',
                        display: 'inline-block',
                      }} />
                    </div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      Skills: {op.skills.join(', ')}
                    </div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {op.assignedMachine
                        ? `Assigned to: ${state.machines.find(m => m.id === op.assignedMachine)?.name || op.assignedMachine}`
                        : 'Not assigned'}
                    </div>
                  </div>
                ))}
                {ops.length === 0 && (
                  <div className="text-muted" style={{ fontSize: 13 }}>No operators on this shift</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
