import { useState } from 'react';
import { getTheme } from '../theme';
import { SimulationMetrics } from '../types';

interface Props {
  onSimulate: () => Promise<void>;
  running: boolean;
  metrics: SimulationMetrics[];
  eventLog: { time: number; node_id: string; event: string; details: string }[];
}

export default function SimulationPanel({ onSimulate, running, metrics, eventLog }: Props) {
  const theme = getTheme();
  const [tab, setTab] = useState<'results' | 'log'>('results');

  const containerStyle: React.CSSProperties = {
    width: 300, background: theme.panel_bg, borderLeft: `1px solid ${theme.border}`,
    display: 'flex', flexDirection: 'column', flexShrink: 0,
  };

  return (
    <div style={containerStyle}>
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
        <button
          onClick={onSimulate}
          disabled={running}
          style={{
            width: '100%', padding: '9px 0', borderRadius: 8, border: 'none',
            background: running ? `${theme.text_muted}44` : theme.btn_success,
            color: running ? theme.text_muted : '#fff',
            fontSize: 13, fontWeight: 600, cursor: running ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {running && (
            <span style={{
              width: 14, height: 14, borderRadius: '50%',
              border: '2px solid #fff', borderTopColor: 'transparent',
              animation: 'spin 0.7s linear infinite', display: 'inline-block',
            }} />
          )}
          {running ? 'Simulating...' : 'Run Simulation'}
        </button>
      </div>

      {running && (
        <div style={{ height: 3, background: theme.bg_tertiary, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: '30%',
            background: `linear-gradient(90deg, ${theme.btn_success}, ${theme.btn_primary})`,
            borderRadius: 2, animation: 'pulse 1.2s ease-in-out infinite',
          }} />
        </div>
      )}

      <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}` }}>
        {(['results', 'log'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '7px 0', border: 'none', background: 'transparent',
              color: tab === t ? theme.text_primary : theme.text_muted,
              fontSize: 11, fontWeight: tab === t ? 600 : 400, cursor: 'pointer',
              borderBottom: tab === t ? `2px solid ${theme.btn_primary}` : '2px solid transparent',
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
        {tab === 'results' ? (
          metrics.length === 0 ? (
            <Empty text="Run a simulation to see results" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ background: theme.bg_tertiary, borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 11, color: theme.text_muted, marginBottom: 2 }}>Nodes</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: theme.text_primary }}>{metrics.length}</div>
              </div>
              {metrics.map((m: SimulationMetrics) => (
                <div key={m.node_id} style={{ background: theme.bg_tertiary, borderRadius: 8, padding: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: theme.text_primary }}>{m.label}</span>
                    <span style={{ fontSize: 11, color: theme.text_muted }}>{m.completed}/{m.total}</span>
                  </div>
                  <div style={{ height: 5, background: theme.bg_secondary, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${Math.round(m.utilization * 100)}%`,
                      background: `linear-gradient(90deg, ${theme.btn_success}, ${theme.btn_primary})`,
                      borderRadius: 3, transition: 'width 400ms ease',
                    }} />
                  </div>
                  <div style={{ fontSize: 10, color: theme.text_muted, marginTop: 3 }}>
                    {Math.round(m.utilization * 100)}% &middot; avg {m.avg_duration?.toFixed(2)}s
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          eventLog.length === 0 ? (
            <Empty text="Run a simulation to see events" />
          ) : (
            <div style={{ fontFamily: 'monospace', fontSize: 10, lineHeight: 1.5, color: theme.text_muted }}>
              {eventLog.map((ev, i) => (
                <div key={i} style={{ padding: '2px 0', borderBottom: `1px solid ${theme.border}44` }}>
                  <span style={{ color: theme.btn_primary }}>t={ev.time.toFixed(1)}</span>
                  {' '}[<span style={{ color: theme.text_primary }}>{ev.node_id}</span>] {ev.event}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  const theme = getTheme();
  return (
    <div style={{ padding: 20, textAlign: 'center', color: theme.text_muted, fontSize: 12 }}>
      {text}
    </div>
  );
}
