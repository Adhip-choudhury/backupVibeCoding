export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  bg_primary: string;
  bg_secondary: string;
  bg_tertiary: string;
  text_primary: string;
  text_muted: string;
  border: string;
  canvas_bg: string;
  panel_bg: string;
  panel_header_bg: string;
  node_body: string;
  node_border: string;
  header_text: string;
  selection: string;
  btn_primary: string;
  btn_success: string;
  input_bg: string;
  overlay_bg: string;
  node_category: Record<string, string>;
}

export type NodeCategory =
  | 'people' | 'production' | 'machinery' | 'quality'
  | 'warehouse' | 'logistics' | 'maintenance' | 'kpi'
  | 'planning' | 'safety' | 'customer' | 'finance' | 'data';

export interface NodeDef {
  type: string;
  label: string;
  category: NodeCategory;
  icon: string;
}

export interface SimulateRequest {
  nodes: { id: string; type: string; properties?: Record<string, string> }[];
  edges: { source: string; target: string }[];
}

export interface SimulationMetrics {
  node_id: string;
  label: string;
  completed: number;
  total: number;
  avg_duration: number;
  utilization: number;
}

export interface SimulateResponse {
  workflow_id: string;
  status: string;
  metrics: SimulationMetrics[];
  event_log: { time: number; node_id: string; event: string; details: string }[];
}
