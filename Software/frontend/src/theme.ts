import { ThemeColors, ThemeMode } from './types';

const LIGHT: ThemeColors = {
  bg_primary: '#F8F9FC', bg_secondary: '#FFFFFF', bg_tertiary: '#EEF0F5',
  text_primary: '#1A1D26', text_muted: '#7C8293', border: '#E2E5EC',
  canvas_bg: '#F0F2F6', panel_bg: '#FFFFFF', panel_header_bg: '#F4F5F8',
  node_body: '#FFFFFF', node_border: '#D8DCE6', header_text: '#FFFFFF',
  selection: '#7C4DFF', btn_primary: '#7C4DFF', btn_success: '#34A853',
  input_bg: '#F4F5F8', overlay_bg: 'rgba(0,0,0,0.25)',
  node_category: {
    people: '#E91E63', production: '#34A853', machinery: '#4285F4',
    quality: '#FBBC04', warehouse: '#795548', logistics: '#009688',
    maintenance: '#9C27B0', kpi: '#EA4335', planning: '#607D8B',
    safety: '#FF5722', customer: '#00BCD4', finance: '#3F51B5', data: '#9E9E9E',
  },
};

const DARK: ThemeColors = {
  bg_primary: '#0F1118', bg_secondary: '#1A1D2A', bg_tertiary: '#242738',
  text_primary: '#E8EAED', text_muted: '#8A8FA6', border: '#2A2D3E',
  canvas_bg: '#0F1118', panel_bg: '#151724', panel_header_bg: '#1A1D2A',
  node_body: '#1E2132', node_border: '#2A2D3E', header_text: '#FFFFFF',
  selection: '#8B6CFF', btn_primary: '#7C4DFF', btn_success: '#34A853',
  input_bg: '#1A1D2A', overlay_bg: 'rgba(0,0,0,0.5)',
  node_category: {
    people: '#F06292', production: '#81C784', machinery: '#64B5F6',
    quality: '#FFD54F', warehouse: '#A1887F', logistics: '#4DB6AC',
    maintenance: '#CE93D8', kpi: '#E57373', planning: '#90A4AE',
    safety: '#FF8A65', customer: '#4DD0E1', finance: '#7986CB', data: '#BDBDBD',
  },
};

let currentMode: ThemeMode = 'dark';
let listeners: Array<(mode: ThemeMode) => void> = [];

export function getTheme(): ThemeColors {
  return currentMode === 'light' ? LIGHT : DARK;
}
export function getMode(): ThemeMode { return currentMode; }

export function toggleTheme(): ThemeMode {
  currentMode = currentMode === 'light' ? 'dark' : 'light';
  listeners.forEach((fn) => fn(currentMode));
  return currentMode;
}

export function listenTheme(fn: (mode: ThemeMode) => void) {
  listeners.push(fn);
  return () => { listeners = listeners.filter((l) => l !== fn); };
}
