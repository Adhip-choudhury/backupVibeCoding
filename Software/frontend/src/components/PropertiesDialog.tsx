import { useState, useEffect, useRef } from 'react';
import { getTheme } from '../theme';

interface Props {
  node: { id: string; type: string; label: string; icon: string; category: string; properties: Record<string, string> } | null;
  onApply: (id: string, label: string, properties: Record<string, string>) => void;
  onClose: () => void;
}

export default function PropertiesDialog({ node, onApply, onClose }: Props) {
  const theme = getTheme();
  const [label, setLabel] = useState('');
  const [props, setProps] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (node) {
      setLabel(node.label);
      setProps({ ...node.properties });
    }
  }, [node]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!node) return null;

  const catColor = (theme as any).node_category?.[node.category] || theme.selection;

  const addProp = () => {
    if (!newKey.trim()) return;
    setProps({ ...props, [newKey.trim()]: newValue });
    setNewKey('');
    setNewValue('');
  };

  const removeProp = (k: string) => {
    const next = { ...props };
    delete next[k];
    setProps(next);
  };

  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const inp: React.CSSProperties = {
    background: theme.input_bg, border: `1px solid ${theme.border}`, borderRadius: 6,
    padding: '6px 10px', color: theme.text_primary, fontSize: 13, outline: 'none', width: '100%',
  };

  return (
    <div ref={overlayRef} onClick={handleOverlay}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: theme.overlay_bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 150ms ease' }}
    >
      <div style={{ background: theme.panel_bg, borderRadius: 14, width: 380,
        maxHeight: '75vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)', border: `1px solid ${theme.border}` }}
      >
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <div style={{ width: 28, height: 28, borderRadius: 6, background: catColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
            {node.icon}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: theme.text_primary, fontSize: 14 }}>{node.label}</div>
            <div style={{ fontSize: 10, color: theme.text_muted, fontFamily: 'monospace' }}>{node.type}</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: theme.text_muted, marginBottom: 4 }}>Label</div>
          <input value={label} onChange={(e) => setLabel(e.target.value)} style={inp} />

          <div style={{ height: 14 }} />
          <div style={{ fontSize: 11, fontWeight: 600, color: theme.text_muted, marginBottom: 4 }}>Properties</div>

          {Object.entries(props).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
              <input value={k} onChange={(e) => {
                const next = { ...props }; delete next[k]; next[e.target.value] = v; setProps(next);
              }} style={{ ...inp, flex: 1 }} />
              <input value={v} onChange={(e) => setProps({ ...props, [k]: e.target.value })} style={{ ...inp, flex: 1 }} />
              <button onClick={() => removeProp(k)}
                style={{ width: 26, height: 26, borderRadius: 4, border: `1px solid ${theme.border}`,
                  background: 'transparent', color: theme.text_muted, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>
                &times;
              </button>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
            <input placeholder="Key" value={newKey} onChange={(e) => setNewKey(e.target.value)} style={{ ...inp, flex: 1 }} />
            <input placeholder="Value" value={newValue} onChange={(e) => setNewValue(e.target.value)} style={{ ...inp, flex: 1 }} />
            <button onClick={addProp}
              style={{ width: 26, height: 26, borderRadius: 4, border: `1px solid ${theme.border}`,
                background: 'transparent', color: theme.text_muted, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>
              +
            </button>
          </div>
        </div>

        <div style={{ padding: '10px 18px', borderTop: `1px solid ${theme.border}`,
          display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose}
            style={{ padding: '7px 16px', borderRadius: 6, border: `1px solid ${theme.border}`,
              background: 'transparent', color: theme.text_primary, fontSize: 12, cursor: 'pointer' }}>
            Close
          </button>
          <button onClick={() => { onApply(node.id, label, props); onClose(); }}
            style={{ padding: '7px 16px', borderRadius: 6, border: 'none',
              background: catColor, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
