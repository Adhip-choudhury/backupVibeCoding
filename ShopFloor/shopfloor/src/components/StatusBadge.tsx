export function MachineStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    running: '#22c55e',
    idle: '#64748b',
    stopped: '#ef4444',
    maintenance: '#f59e0b',
    breakdown: '#dc2626',
  };
  return (
    <span className="badge" style={{ backgroundColor: colors[status] || '#64748b' }}>
      {status}
    </span>
  );
}

export function JobStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: '#64748b',
    in_progress: '#3b82f6',
    completed: '#22c55e',
    delayed: '#ef4444',
  };
  return (
    <span className="badge" style={{ backgroundColor: colors[status] || '#64748b' }}>
      {status === 'in_progress' ? 'in progress' : status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    low: '#64748b',
    medium: '#3b82f6',
    high: '#f59e0b',
    critical: '#ef4444',
  };
  return (
    <span className="badge badge-sm" style={{ backgroundColor: colors[priority] || '#64748b' }}>
      {priority}
    </span>
  );
}

export function AlertSeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    info: '#3b82f6',
    warning: '#f59e0b',
    critical: '#ef4444',
  };
  return (
    <span className="badge badge-sm" style={{ backgroundColor: colors[severity] || '#64748b' }}>
      {severity}
    </span>
  );
}
