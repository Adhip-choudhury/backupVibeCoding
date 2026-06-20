import { useState, useMemo } from 'react';
import { NodeDef } from '../types';
import { NODE_DEFS, NODE_DEF_MAP, CATEGORY_ORDER, CATEGORY_LABELS } from './nodes/nodeColors';
import { getTheme } from '../theme';

export default function NodePalette() {
  const theme = getTheme();
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return null;
    const result: { cat: string; items: NodeDef[] }[] = [];
    for (const cat of CATEGORY_ORDER) {
      const items = NODE_DEFS.filter(
        (d) => d.category === cat && (d.label.toLowerCase().includes(q) || d.type.toLowerCase().includes(q))
      );
      if (items.length) result.push({ cat, items });
    }
    return result;
  }, [search]);

  const onDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const toggleCat = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const containerStyle: React.CSSProperties = {
    width: 230, background: theme.panel_bg, borderRight: `1px solid ${theme.border}`,
    display: 'flex', flexDirection: 'column', flexShrink: 0,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: theme.input_bg, border: `1px solid ${theme.border}`,
    borderRadius: 8, padding: '7px 10px', color: theme.text_primary,
    fontSize: 13, outline: 'none',
  };

  return (
    <div style={containerStyle}>
      <div style={{ padding: 10, borderBottom: `1px solid ${theme.border}` }}>
        <input placeholder="Search nodes..." value={search} onChange={(e) => setSearch(e.target.value)} style={inputStyle} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 6 }}>
        {(filtered ?? CATEGORY_ORDER).map((cat: string | { cat: string; items: NodeDef[] }) => {
          const catName = typeof cat === 'string' ? cat : cat.cat;
          const items = typeof cat === 'string'
            ? NODE_DEFS.filter((d) => d.category === catName)
            : cat.items;
          const color = theme.node_category[catName] || theme.selection;
          const isCollapsed = collapsed[catName];

          return (
            <div key={catName} style={{ marginBottom: 2 }}>
              <div
                onClick={() => toggleCat(catName)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 6px',
                  borderRadius: 6, cursor: 'pointer', color: theme.text_muted,
                  fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                {CATEGORY_LABELS[catName]}
                {!search && <span style={{ marginLeft: 'auto', fontSize: 10 }}>{items.length}</span>}
              </div>
              {!isCollapsed && items.map((def) => (
                <div
                  key={def.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, def.type)}
                  className="palette-item"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '5px 6px 5px 16px', borderRadius: 6,
                    cursor: 'grab', fontSize: 12, color: theme.text_primary,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = theme.bg_tertiary; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 14 }}>{def.icon}</span>
                  <span>{def.label}</span>
                </div>
              ))}
            </div>
          );
        })}
        {filtered && filtered.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: theme.text_muted, fontSize: 13 }}>
            No nodes found
          </div>
        )}
      </div>
    </div>
  );
}
