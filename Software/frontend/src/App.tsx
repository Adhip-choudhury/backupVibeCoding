import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider, Controls, Background, BackgroundVariant,
  addEdge, useNodesState, useEdgesState,
  Node, Edge, Connection, MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getTheme, toggleTheme, listenTheme, getMode } from './theme';
import { NODE_DEF_MAP, NODE_TYPE_CATEGORY, ICON_MAP } from './components/nodes/nodeColors';
import CustomNode from './components/nodes/CustomNode';
import NodePalette from './components/NodePalette';
import PropertiesDialog from './components/PropertiesDialog';
import SimulationPanel from './components/SimulationPanel';
import { SimulateResponse, SimulationMetrics } from './types';

const nodeTypes = { custom: CustomNode };
let nodeIdCounter = 0;
function newNodeId() { return `n${++nodeIdCounter}`; }

export default function App() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [propsNode, setPropsNode] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [metrics, setMetrics] = useState<SimulationMetrics[]>([]);
  const [eventLog, setEventLog] = useState<any[]>([]);
  const [theme, setTheme] = useState(getTheme());
  const [mode, setMode] = useState(getMode());

  useEffect(() => {
    return listenTheme((m) => { setMode(m); setTheme(getTheme()); });
  }, []);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({
      ...params,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: theme.selection, strokeWidth: 2 },
      animated: false,
    }, eds));
  }, [setEdges, theme]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow');
    if (!type || !NODE_DEF_MAP.has(type)) return;
    const position = reactFlowInstance!.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const def = NODE_DEF_MAP.get(type)!;
    const newNode: Node = {
      id: newNodeId(),
      type: 'custom',
      position,
      data: { label: def.label, type: def.type, icon: def.icon, category: def.category, properties: {} },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes]);

  const onNodeClick = useCallback((_e: React.MouseEvent, node: Node) => {
    setPropsNode(node);
  }, []);

  const applyProperties = useCallback((id: string, label: string, properties: Record<string, string>) => {
    setNodes((nds) => nds.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, label, properties } } : n
    ));
  }, [setNodes]);

  const onSave = useCallback(() => {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'workflow.json'; a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const onClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setMetrics([]);
    setEventLog([]);
  }, [setNodes, setEdges]);

  const onSimulate = useCallback(async () => {
    setRunning(true);
    setMetrics([]);
    setEventLog([]);
    try {
      const payload = {
        nodes: nodes.map((n) => ({ id: n.id, type: n.data.type, properties: n.data.properties || {} })),
        edges: edges.map((e: Edge) => ({ source: e.source, target: e.target })),
      };
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Simulation failed');
      const data: SimulateResponse = await res.json();
      setMetrics(data.metrics || []);
      setEventLog(data.event_log || []);
      setEdges((eds: Edge[]) => eds.map((e: Edge) => ({ ...e, animated: true })));
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  }, [nodes, edges, setEdges]);

  const flowStyle: React.CSSProperties = { background: theme.canvas_bg };
  const btnBase: React.CSSProperties = {
    background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 6,
    padding: '5px 12px', color: theme.text_primary, fontSize: 12, fontWeight: 500,
    cursor: 'pointer',
  };

  return (
    <ReactFlowProvider>
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: theme.bg_primary, color: theme.text_primary }}>
        {/* Toolbar */}
        <div style={{
          height: 46, background: theme.panel_bg, borderBottom: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, flexShrink: 0,
        }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: theme.text_primary }}>
            <span style={{ color: theme.btn_primary }}>Org</span>Flow
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={onClear} style={btnBase}>New</button>
          <button onClick={onSave} style={btnBase}>Save</button>
          <button onClick={toggleTheme} style={btnBase}>{mode === 'dark' ? 'Light' : 'Dark'}</button>
        </div>

        {/* Main area */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <NodePalette />
          <div ref={reactFlowWrapper} style={{ flex: 1, position: 'relative' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onInit={setReactFlowInstance}
              nodeTypes={nodeTypes}
              fitView
              style={flowStyle}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1}
                color={theme.border} style={{ opacity: 0.5 }} />
              <Controls showInteractive={false}
                style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
            </ReactFlow>
          </div>
          <SimulationPanel
            onSimulate={onSimulate}
            running={running}
            metrics={metrics}
            eventLog={eventLog}
          />
        </div>

        {propsNode && (
          <PropertiesDialog
            node={{ ...propsNode.data, id: propsNode.id }}
            onApply={applyProperties}
            onClose={() => setPropsNode(null)}
          />
        )}
      </div>
    </ReactFlowProvider>
  );
}
