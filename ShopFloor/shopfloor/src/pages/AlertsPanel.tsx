import { useStore } from '../store/store';
import { AlertSeverityBadge } from '../components/StatusBadge';

export default function AlertsPanel() {
  const { state, resolveAlert } = useStore();

  const unresolved = state.alerts.filter(a => !a.resolved);
  const resolved = state.alerts.filter(a => a.resolved);

  return (
    <div>
      <div className="page-header">
        <h1>Alerts Panel</h1>
        <div className="text-muted">{unresolved.length} active, {resolved.length} resolved</div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Active Alerts</h3>
        <div className="alert-list">
          {unresolved.length === 0 && (
            <p className="text-muted">No active alerts. All clear!</p>
          )}
          {unresolved.map(alert => (
            <div key={alert.id} className={`alert-item alert-severity-${alert.severity}`}>
              <AlertSeverityBadge severity={alert.severity} />
              <div className="alert-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{alert.source}</strong>
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    {new Date(alert.time).toLocaleString()}
                  </span>
                </div>
                <p>{alert.message}</p>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  Type: {alert.type.replace('_', ' ')}
                </div>
              </div>
              <button className="btn btn-sm" onClick={() => resolveAlert(alert.id)}>
                Resolve
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Resolved Alerts</h3>
        <div className="alert-list">
          {resolved.length === 0 && (
            <p className="text-muted">No resolved alerts</p>
          )}
          {resolved.map(alert => (
            <div key={alert.id} className="alert-item resolved" style={{ opacity: 0.6 }}>
              <AlertSeverityBadge severity={alert.severity} />
              <div className="alert-content">
                <strong>{alert.source}</strong>
                <p>{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
