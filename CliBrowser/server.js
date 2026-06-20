require('dotenv').config();
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const { spawn } = require('node-pty');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// ─── Config persistence ──────────────────────────────────────
const CONFIG_PATH = path.join(__dirname, 'config.json');

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function saveConfig(data) {
  const existing = loadConfig();
  const merged = { ...existing, ...data };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  // Also update process.env for current session
  if (data.aiProvider) process.env.AI_PROVIDER = data.aiProvider;
  if (data.aiModel) process.env.AI_MODEL = data.aiModel;
  if (data.aiApiKey) process.env.AI_API_KEY = data.aiApiKey;
  if (data.aiBaseUrl) process.env.AI_BASE_URL = data.aiBaseUrl;
}

// ─── AI Setup ─────────────────────────────────────────────────
const MODELS_BY_PROVIDER = {
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'o1-mini', 'o1', 'gpt-3.5-turbo'],
  openrouter: ['openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet', 'google/gemini-2.0-flash', 'meta-llama/llama-3.2-90b', 'mistralai/mixtral-8x22b'],
  anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-latest', 'claude-3-haiku-20240307', 'claude-3-opus-latest'],
  ollama: ['llama3.2', 'llama3.1', 'qwen2.5', 'mistral', 'phi4', 'deepseek-coder', 'codellama', 'gemma2'],
  custom: [],
};

let aiClient = null;
let aiAvailable = false;
let currentConfig = {};

function reinitAI() {
  const cfg = loadConfig();
  currentConfig = {
    provider: (cfg.aiProvider || process.env.AI_PROVIDER || 'openai').toLowerCase(),
    model: cfg.aiModel || process.env.AI_MODEL || 'gpt-4o-mini',
    apiKey: cfg.aiApiKey || process.env.AI_API_KEY || '',
    baseUrl: cfg.aiBaseUrl || process.env.AI_BASE_URL || '',
  };

  aiClient = null;
  aiAvailable = false;

  const { provider, model, apiKey, baseUrl } = currentConfig;

  try {
    if (provider === 'ollama') {
      const url = baseUrl || 'http://localhost:11434/v1';
      aiClient = new OpenAI({ baseURL: url });
      aiAvailable = true;
      console.log(`AI: Ollama @ ${url} [${model}]`);
    } else if (provider === 'openrouter') {
      if (!apiKey || apiKey === 'sk-your-key-here') { console.warn('AI: OpenRouter — missing API key'); return; }
      aiClient = new OpenAI({ apiKey, baseURL: baseUrl || 'https://openrouter.ai/api/v1' });
      aiAvailable = true;
      console.log(`AI: OpenRouter [${model}]`);
    } else if (provider === 'custom') {
      if (!baseUrl) { console.warn('AI: Custom — missing Base URL'); return; }
      aiClient = new OpenAI({ apiKey: apiKey || '', baseURL: baseUrl });
      aiAvailable = true;
      console.log(`AI: Custom @ ${baseUrl} [${model}]`);
    } else if (provider === 'anthropic') {
      if (!apiKey || apiKey === 'sk-your-key-here') { console.warn('AI: Anthropic — missing API key'); return; }
      aiClient = { provider: 'anthropic', apiKey, model };
      aiAvailable = true;
      console.log(`AI: Anthropic [${model}]`);
    } else {
      if (!apiKey || apiKey === 'sk-your-key-here') { console.warn('AI: OpenAI — missing API key'); return; }
      aiClient = new OpenAI({ apiKey });
      aiAvailable = true;
      console.log(`AI: OpenAI [${model}]`);
    }
  } catch (e) {
    console.warn('AI: init error:', e.message);
  }
}

async function askAI(type, prompt) {
  if (!aiClient) throw new Error('AI not configured');

  const systemPrompts = {
    command: `You are a terminal assistant. Convert natural language into a shell command.
OS: Windows, Shell: PowerShell.
Return ONLY valid JSON: {"command": "...", "explanation": "..."}
Keep commands safe and non-destructive.`,
    chat: 'You are a helpful AI inside a terminal. Answer concisely in plain text (no markdown).',
    why: 'Explain the error below and suggest a fix:\n\n' + prompt,
  };

  const system = systemPrompts[type] || systemPrompts.chat;
  const userMsg = type === 'command' ? prompt : type === 'why' ? '' : prompt;

  if (aiClient.provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': aiClient.apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: aiClient.model || currentConfig.model, max_tokens: 1024, system, messages: [{ role: 'user', content: userMsg }] }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || JSON.stringify(data);
    if (type === 'command') {
      try { return JSON.parse(text.replace(/```(?:json)?\s*|```/g, '').trim()); } catch { return { command: text, explanation: '' }; }
    }
    return { text };
  }

  const messages = [{ role: 'system', content: system }, { role: 'user', content: userMsg }];
  const res = await aiClient.chat.completions.create({ model: currentConfig.model, messages, temperature: type === 'command' ? 0.1 : 0.7 });
  const text = res.choices?.[0]?.message?.content || '';
  if (type === 'command') {
    try { return JSON.parse(text.replace(/```(?:json)?\s*|```/g, '').trim()); } catch { return { command: text, explanation: '' }; }
  }
  return { text };
}

reinitAI();

// ─── API routes ───────────────────────────────────────────────
app.get('/api/ai/config', (_, res) => {
  res.json({ ...currentConfig, available: aiAvailable, models: MODELS_BY_PROVIDER });
});

app.post('/api/ai/config', (req, res) => {
  try {
    const { provider, model, apiKey, baseUrl } = req.body;
    saveConfig({
      aiProvider: provider,
      aiModel: model,
      aiApiKey: apiKey || '',
      aiBaseUrl: baseUrl || '',
    });
    reinitAI();
    res.json({ ok: true, available: aiAvailable, ...currentConfig });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/ai', async (req, res) => {
  if (!aiAvailable) return res.status(400).json({ error: 'AI not configured. Type /config to set up.' });
  try {
    res.json(await askAI(req.body.type || 'chat', req.body.prompt || ''));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ai/test', async (_, res) => {
  if (!aiAvailable) return res.json({ ok: false, error: 'AI not configured' });
  try {
    const result = await askAI('chat', 'Reply with exactly: OK');
    res.json({ ok: true, response: result.text });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// ─── Terminal ─────────────────────────────────────────────────
wss.on('connection', (ws) => {
  let pty = null;

  function startPty(cols, rows) {
    const shell = process.env.SHELL || (process.platform === 'win32' ? 'powershell.exe' : 'bash');
    pty = spawn(shell, [], {
      name: 'xterm-256color',
      cols, rows,
      cwd: process.env.HOME || process.env.USERPROFILE,
      env: { ...process.env, TERM: 'xterm-256color' },
    });
    pty.onData((data) => { try { ws.send(data); } catch {} });
  }

  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    if (data.type === 'input' && pty) pty.write(data.payload);
    else if (data.type === 'resize') {
      if (pty) pty.resize(data.cols, data.rows);
      else if (data.cols && data.rows) startPty(data.cols, data.rows);
    }
  });

  ws.on('close', () => { if (pty) pty.kill(); });
});

async function startServer(port) {
  return new Promise((resolve) => {
    const PORT = port || process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`NuclusCli running on http://localhost:${PORT}`);
      if (!aiAvailable) console.log('AI: not configured — type /config in the terminal to set up');
      resolve(server);
    });
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, server, startServer, wss };
