import { useState } from 'react';
import { useStore } from '../store/store';
import { PriorityBadge } from '../components/StatusBadge';
import type { Job } from '../types';
import { Trash2, Plus, Sparkles } from 'lucide-react';

export default function PlanningBoard() {
  const { state, assignJobToMachine, addJob, autoPlan, deleteJob } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: '',
    orderId: '',
    machineRequirement: 'lathe',
    operatorRequirement: '',
    priority: 'medium' as Job['priority'],
    deadline: '',
  });

  const handleAssign = (jobId: string, machineId: string) => {
    assignJobToMachine(jobId, machineId);
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    const order = state.orders.find(o => o.id === form.orderId);
    if (!order) return;
    addJob({
      orderId: form.orderId,
      description: form.description,
      machineRequirement: form.machineRequirement,
      operatorRequirement: form.operatorRequirement.split(',').map(s => s.trim()).filter(Boolean),
      priority: form.priority,
      status: 'pending',
      deadline: form.deadline,
      assignedMachine: null,
      assignedOperator: null,
      progress: 0,
    });
    setForm({ description: '', orderId: '', machineRequirement: 'lathe', operatorRequirement: '', priority: 'medium', deadline: '' });
    setShowForm(false);
  };

  const statusGroups = ['pending', 'in_progress', 'completed', 'delayed'] as const;

  return (
    <div>
      <div className="page-header">
        <h1>Planning Board</h1>
        <div className="page-header-right">
          <button className="btn btn-secondary" onClick={autoPlan}>
            <Sparkles size={14} /> Auto-Plan
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={14} /> {showForm ? 'Cancel' : 'New Job'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3>Create New Job</h3>
          <form onSubmit={handleAddJob} className="form">
            <div className="form-row">
              <div className="form-group">
                <label>Description</label>
                <input required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Order ID</label>
                <select required value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })}>
                  <option value="">Select order</option>
                  {state.orders.filter(o => o.status !== 'completed').map(o => (
                    <option key={o.id} value={o.id}>{o.id} — {o.customer}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Machine Type Required</label>
                <select value={form.machineRequirement} onChange={e => setForm({ ...form, machineRequirement: e.target.value })}>
                  {[...new Set(state.machines.map(m => m.type))].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Required Skills (comma-separated)</label>
                <input value={form.operatorRequirement} onChange={e => setForm({ ...form, operatorRequirement: e.target.value })} placeholder="e.g. turning, milling" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Job['priority'] })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" required value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Create Job</button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {statusGroups.map(group => {
          const groupJobs = state.jobs.filter(j => j.status === group);
          return (
            <div key={group} className="card">
              <h4 style={{ textTransform: 'capitalize', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>{group.replace('_', ' ')}</span>
                <span className="text-muted" style={{ fontWeight: 400, fontSize: 12 }}>{groupJobs.length}</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {groupJobs.map(job => {
                  const machine = job.assignedMachine ? state.machines.find(m => m.id === job.assignedMachine) : null;
                  const op = job.assignedOperator ? state.operators.find(o => o.id === job.assignedOperator) : null;
                  return (
                    <div key={job.id} className="kanban-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div>
                          <strong>{job.id}</strong>
                          <div className="text-muted" style={{ fontSize: 11, marginTop: 1 }}>{job.description}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <PriorityBadge priority={job.priority} />
                          <button
                            className="btn-icon"
                            onClick={() => deleteJob(job.id)}
                            title="Delete job"
                            style={{ color: 'var(--text-muted)', fontSize: 12, padding: 2 }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {machine ? `Machine: ${machine.name}` : 'No machine'} | {op ? `Op: ${op.name}` : 'No operator'}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                        Due: {new Date(job.deadline).toLocaleDateString()}
                      </div>
                      {job.status === 'pending' && (
                        <div style={{ marginTop: 6 }}>
                          <select
                            className="select-sm"
                            style={{ width: '100%' }}
                            value=""
                            onChange={e => e.target.value && handleAssign(job.id, e.target.value)}
                          >
                            <option value="">Assign machine...</option>
                            {state.machines
                              .filter(m => m.type === job.machineRequirement && m.status !== 'breakdown' && m.status !== 'maintenance')
                              .map(m => (
                                <option key={m.id} value={m.id}>{m.name} ({m.status})</option>
                              ))}
                          </select>
                        </div>
                      )}
                      {job.status === 'in_progress' && (
                        <div className="progress-bar" style={{ marginTop: 6 }}>
                          <div className="progress-fill" style={{ width: `${job.progress}%` }}></div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {groupJobs.length === 0 && (
                  <div className="text-muted" style={{ fontSize: 12, textAlign: 'center', padding: 16 }}>No jobs</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
