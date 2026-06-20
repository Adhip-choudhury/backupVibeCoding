import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NODE_TYPE_CATEGORY, CATEGORY_LABELS } from './nodeColors';
import { getTheme } from '../../theme';

const NODE_W = 210;

function CustomNode({ data, selected }: NodeProps) {
  const theme = getTheme();
  const cat = (data.category as string) || NODE_TYPE_CATEGORY[data.type as string] || 'data';
  const catColor = theme.node_category[cat] || theme.selection;
  const catLabel = CATEGORY_LABELS[cat] || cat;

  return (
    <div style={{
      width: NODE_W,
      background: theme.node_body,
      border: `1px solid ${selected ? catColor : theme.node_border}`,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: selected
        ? `0 0 0 2.5px ${catColor}33, 0 4px 16px rgba(0,0,0,0.18)`
        : '0 1px 4px rgba(0,0,0,0.06)',
      transition: 'box-shadow 180ms, border-color 180ms, transform 180ms',
      cursor: 'pointer',
    }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Accent bar */}
      <div style={{ height: 4, background: catColor, width: '100%' }} />

      {/* Content */}
      <div style={{ padding: '10px 14px 12px', position: 'relative' }}>
        <Handle type="target" position={Position.Left}
          style={{
            width: 10, height: 10, borderRadius: '50%', background: theme.node_body,
            border: `2px solid ${catColor}`, left: -5, top: 26,
            transition: 'transform 150ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        />
        <Handle type="source" position={Position.Right}
          style={{
            width: 10, height: 10, borderRadius: '50%', background: catColor,
            border: `2px solid ${catColor}`, right: -5, top: 26,
            transition: 'transform 150ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        />

        {/* Label */}
        <div style={{
          fontSize: 14, fontWeight: 600, color: theme.text_primary,
          lineHeight: 1.3, marginBottom: 3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {data.label as string}
        </div>

        {/* Category tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10, color: catColor, fontWeight: 500,
          letterSpacing: '0.02em',
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%', background: catColor, flexShrink: 0,
          }} />
          {catLabel}
        </div>
      </div>
    </div>
  );
}

export default memo(CustomNode);
