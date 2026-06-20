const isElectron = window.electronAPI?.isElectron || false;

// ─── State ────────────────────────────────────────────────────
let tabs = [];
let activeTabId = null;
let tabIdCounter = 0;
let commandsRegistry = null;

function uid() { return 't' + (++tabIdCounter); }

// ─── Tab Management ────────────────────────────────────────────
function createTab(type, url) {
  const id = uid();
  const view = document.createElement('div');
  view.className = 'content-view';
  view.id = 'view-' + id;

  const permanent = type === 'welcome' || type === 'terminal';
  const tab = { id, type, title: '...', url: url || '', view, permanent };

  if (type === 'web' && isElectron) {
    tab.title = url || 'New Tab';
    const wv = document.createElement('webview');
    wv.className = 'webview';
    wv.src = url || 'about:blank';
    wv.setAttribute('allowpopups', '');
    view.appendChild(wv);
    tab.webview = wv;
    setupWebview(tab, wv);
  } else if (type === 'terminal') {
    tab.title = 'Terminal';
    view.className = 'content-view terminal-view active';
    setupTerminal(tab, view);
  } else {
    tab.title = 'Home';
    setupWelcomeCLI(tab, view);
  }

  document.getElementById('content').appendChild(view);
  tabs.push(tab);
  activateTab(id);
  renderTabBar();
  return tab;
}

function activateTab(id) {
  activeTabId = id;
  tabs.forEach((t) => {
    t.view.classList.toggle('active', t.id === id);
  });
  renderTabBar();
  updateNavState();

  const tab = tabs.find((t) => t.id === id);
  if (!tab) return;

  const nav = document.getElementById('navbar');
  nav.style.display = (tab.type === 'web' || tab.type === 'welcome') ? 'flex' : 'none';

  if (tab.type === 'web' && tab.webview) {
    document.getElementById('url-bar').value = tab.webview.getURL() || tab.url || '';
  } else if (tab.type === 'welcome') {
    document.getElementById('url-bar').value = '';
  }

  if (tab.type === 'terminal' && tab.term) {
    setTimeout(() => tab.fit?.(), 50);
    setTimeout(() => tab.term?.focus(), 100);
  }
  if (tab.type === 'welcome') {
    setTimeout(() => {
      const inp = tab.view.querySelector('.cli-input');
      if (inp) inp.focus();
    }, 50);
  }
}

function closeTab(id) {
  const idx = tabs.findIndex((t) => t.id === id);
  if (idx === -1) return;
  const tab = tabs[idx];

  if (tab.permanent) return;

  if (tab.type === 'terminal' && tab.ws) {
    try { tab.ws.close(); } catch {}
  }
  if (tab.type === 'terminal' && tab.term) {
    tab.term.dispose();
  }
  if (tab.webview) {
    tab.webview.remove();
  }

  tab.view.remove();
  tabs.splice(idx, 1);

  if (tabs.length === 0) createTab('welcome');
  if (id === activeTabId) {
    activateTab(tabs[Math.min(idx, tabs.length - 1)].id);
  } else {
    renderTabBar();
  }
}

// ─── Tab Bar ────────────────────────────────────────────────────
function renderTabBar() {
  const list = document.getElementById('tab-list');
  list.innerHTML = '';
  tabs.forEach((t) => {
    const el = document.createElement('div');
    el.className = 'tab' + (t.id === activeTabId ? ' active' : '') + (t.permanent ? ' tab-permanent' : '');
    el.dataset.id = t.id;

    const icon = t.type === 'terminal' ? '\u25B8' : t.type === 'web' ? '\u25C9' : '\u2605';
    el.innerHTML = `
      <span class="tab-icon">${icon}</span>
      <span class="tab-title">${escHtml(t.title)}</span>
      ${t.permanent ? '' : `<button class="tab-close" data-id="${t.id}">\u2715</button>`}
    `;

    el.addEventListener('click', (e) => {
      if (e.target.closest('.tab-close')) return;
      activateTab(t.id);
    });
    if (!t.permanent) {
      el.querySelector('.tab-close').addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(t.id);
      });
    }

    list.appendChild(el);
  });
}

// ─── CLI Welcome Page ──────────────────────────────────────────
const CLI_HISTORY_KEY = 'nucluscli_history';
let cliHistory = [];
try {
  const saved = localStorage.getItem(CLI_HISTORY_KEY);
  if (saved) cliHistory = JSON.parse(saved);
} catch {}

const CLI_COMMANDS = [
  { cmd: 'google', desc: 'Search Google', arg: '<query>' },
  { cmd: 'github', desc: 'Open GitHub', arg: '<repo>' },
  { cmd: 'open', desc: 'Open a URL', arg: '<url>' },
  { cmd: 'terminal', desc: 'Open terminal tab' },
  { cmd: 'help', desc: 'Show available commands' },
  { cmd: 'clear', desc: 'Clear history' },
];

const PREDEFINED_URLS = [
  { label: 'Google', url: 'https://google.com', icon: '\uD83D\uDD0D', tag: 'Search', tagClass: 'tag-search' },
  { label: 'GitHub', url: 'https://github.com', icon: '\uD83D\uDCBB', tag: 'Dev', tagClass: 'tag-dev' },
  { label: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '\uD83D\uDCDA', tag: 'Dev', tagClass: 'tag-dev' },
  { label: 'npm', url: 'https://npmjs.com', icon: '\uD83D\uDCE6', tag: 'Dev', tagClass: 'tag-dev' },
  { label: 'ChatGPT', url: 'https://chat.openai.com', icon: '\uD83E\uDD16', tag: 'AI', tagClass: 'tag-ai' },
  { label: 'Claude', url: 'https://claude.ai', icon: '\uD83E\uDDD0', tag: 'AI', tagClass: 'tag-ai' },
  { label: 'Gemini', url: 'https://gemini.google.com', icon: '\u2604\uFE0F', tag: 'AI', tagClass: 'tag-ai' },
  { label: 'YouTube', url: 'https://youtube.com', icon: '\uD83C\uDFA5', tag: 'Social', tagClass: 'tag-social' },
  { label: 'Reddit', url: 'https://reddit.com', icon: '\uD83D\uDCAC', tag: 'Social', tagClass: 'tag-social' },
  { label: 'Wikipedia', url: 'https://wikipedia.org', icon: '\uD83C\uDF0D', tag: 'Search', tagClass: 'tag-search' },
  { label: 'Gmail', url: 'https://mail.google.com', icon: '\u2709\uFE0F', tag: 'Tools', tagClass: 'tag-tools' },
  { label: 'Drive', url: 'https://drive.google.com', icon: '\uD83D\uDCC1', tag: 'Tools', tagClass: 'tag-tools' },
  { label: 'Notion', url: 'https://notion.so', icon: '\uD83D\uDCDD', tag: 'Tools', tagClass: 'tag-tools' },
  { label: 'Figma', url: 'https://figma.com', icon: '\uD83C\uDFA8', tag: 'Dev', tagClass: 'tag-dev' },
  { label: 'Hacker News', url: 'https://news.ycombinator.com', icon: '\uD83D\uDCF0', tag: 'News', tagClass: 'tag-news' },
  { label: 'Dev.to', url: 'https://dev.to', icon: '\uD83D\uDC4D', tag: 'Dev', tagClass: 'tag-dev' },
];

function saveCliHistory() {
  try { localStorage.setItem(CLI_HISTORY_KEY, JSON.stringify(cliHistory.slice(-100))); } catch {}
}

function setupWelcomeCLI(tab, view) {
  view.innerHTML = `
    <div class="cli-view active">
      <div class="cli-header">
        <div class="cli-logo"><span class="hl">N</span>uclus<span class="hl">C</span>li</div>
        <div class="cli-sub">Browser + Terminal with AI \u2014 type a command or click a link below</div>
      </div>
      <div class="cli-body">
        <div class="cli-prompt-line">
          <span class="cli-prompt">\u2192</span>
          <input class="cli-input" type="text" spellcheck="false" autocomplete="off" placeholder="google, github, open, terminal, help...">
        </div>
        <div class="cli-url-grid">
          ${PREDEFINED_URLS.map(u => `<div class="cli-url-card" data-url="${u.url}">
            <span class="url-icon">${u.icon}</span>
            <span class="url-label">${u.label}</span>
            <span class="url-tag ${u.tagClass}">${u.tag}</span>
          </div>`).join('')}
        </div>
        <div class="cli-section-title">Recent Commands</div>
        <div class="cli-history"></div>
      </div>
    </div>
  `;

  const input = view.querySelector('.cli-input');
  const historyDiv = view.querySelector('.cli-history');

  renderCliHistory(historyDiv);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = input.value.trim();
      input.value = '';
      if (val) handleCliCommand(val);
    }
  });

  view.addEventListener('click', (e) => {
    const card = e.target.closest('.cli-url-card');
    if (card) {
      const url = card.dataset.url;
      if (url) {
        if (isElectron) {
          createTab('web', url);
        } else {
          window.open(url, '_blank');
        }
      }
    }
    const hint = e.target.closest('.cli-footer-hint');
    if (hint) {
      input.value = hint.dataset.cmd + ' ';
      input.focus();
    }
  });
}

function renderCliHistory() {
  const container = document.querySelector('.active .cli-history');
  if (!container) return;
  const cliInput = document.querySelector('.active .cli-input');

  if (cliHistory.length === 0) {
    container.innerHTML = `<div style="color:var(--text-dim);opacity:0.5;padding:4px 0;font-size:13px">No commands yet</div>`;
    return;
  }

  const recent = cliHistory.slice(-15).reverse();
  container.innerHTML = recent.map((entry) => {
    const isWeb = ['google', 'github', 'open'].includes(entry.cmd);
    return `<div class="cli-entry" data-cmd="${entry.cmd}" data-arg="${escHtml(entry.arg || '')}">
      <span class="cli-entry-cmd" style="color:${isWeb ? 'var(--accent)' : 'var(--accent2)'}">${entry.cmd}</span>
      <span class="cli-entry-arg">${escHtml(entry.arg || '')}</span>
    </div>`;
  }).join('');

  container.querySelectorAll('.cli-entry').forEach(el => {
    el.addEventListener('click', () => {
      const cmd = el.dataset.cmd;
      const arg = el.dataset.arg;
      if (cmd === 'terminal') {
        createTab('terminal');
      } else if (['google', 'github', 'open'].includes(cmd)) {
        const url = resolveWebUrl(cmd, arg);
        if (url) createTab('web', url);
      } else if (cliInput) {
        cliInput.value = cmd + (arg ? ' ' + arg : '');
        cliInput.focus();
      }
    });
  });
}

function handleCliCommand(val) {
  const parts = val.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const arg = parts.slice(1).join(' ');

  if (cmd === 'help') {
    addCliHistory('help', '');
    renderCliHistory();
    return;
  }

  if (cmd === 'clear') {
    cliHistory = [];
    saveCliHistory();
    renderCliHistory();
    return;
  }

  if (cmd === 'terminal') {
    addCliHistory('terminal', '');
    createTab('terminal');
    renderCliHistory();
    return;
  }

  if (['google', 'github', 'open'].includes(cmd)) {
    addCliHistory(cmd, arg);
    renderCliHistory();
    const url = resolveWebUrl(cmd, arg);
    if (url) createTab('web', url);
    return;
  }

  addCliHistory('open', val);
  renderCliHistory();
  const url = resolveWebUrl('open', val);
  if (url) createTab('web', url);
}

function addCliHistory(cmd, arg) {
  cliHistory.push({ cmd, arg, ts: Date.now() });
  saveCliHistory();
}

function resolveWebUrl(cmd, arg) {
  if (cmd === 'google') {
    return 'https://google.com/search?q=' + encodeURIComponent(arg || '');
  }
  if (cmd === 'github') {
    if (arg && /^[\w.-]+\/[\w.-]+/.test(arg)) {
      return 'https://github.com/' + arg;
    }
    return 'https://github.com/' + (arg ? encodeURIComponent(arg) : '');
  }
  if (cmd === 'open') {
    if (!arg) return null;
    let u = arg.trim();
    if (u.startsWith('google')) {
      const q = u.replace(/^google\s*/, '');
      return 'https://google.com/search?q=' + encodeURIComponent(q || '');
    }
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    return u;
  }
  return null;
}

// ─── Web Tabs ──────────────────────────────────────────────────
function setupWebview(tab, wv) {
  wv.addEventListener('did-navigate', () => {
    if (tab.id !== activeTabId) return;
    document.getElementById('url-bar').value = wv.getURL() || '';
    tab.title = wv.getTitle() || wv.getURL() || 'Web';
    renderTabBar();
    updateNavState();
  });
  wv.addEventListener('did-navigate-in-page', () => {
    if (tab.id !== activeTabId) return;
    document.getElementById('url-bar').value = wv.getURL() || '';
    updateNavState();
  });
  wv.addEventListener('page-title-updated', (e) => {
    tab.title = e.title || 'Web';
    renderTabBar();
  });
  wv.addEventListener('will-navigate', (e) => {
    if (tab.id !== activeTabId) return;
    document.getElementById('url-bar').value = e.url;
  });
}

function navigateActiveTab(url) {
  const tab = tabs.find((t) => t.id === activeTabId);
  if (!tab) return;
  if (tab.type === 'web' && tab.webview) {
    let u = url.trim();
    if (u && !/^https?:\/\//i.test(u)) u = 'https://' + u;
    tab.webview.loadURL(u);
  } else if (tab.type === 'welcome') {
    let u = url.trim();
    if (u) {
      if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
      createTab('web', u);
    }
  }
}

function updateNavState() {
  const tab = tabs.find((t) => t.id === activeTabId);
  const back = document.getElementById('nav-back');
  const fwd = document.getElementById('nav-fwd');
  if (tab?.type === 'web' && tab.webview) {
    tab.webview.canGoBack().then((v) => { back.disabled = !v; });
    tab.webview.canGoForward().then((v) => { fwd.disabled = !v; });
  } else {
    back.disabled = true;
    fwd.disabled = true;
  }
}

// ─── Commands Registry ────────────────────────────────────────
function loadCommandsRegistry() {
  return fetch('/commands.json')
    .then(r => r.json())
    .then(data => { commandsRegistry = data; return data; })
    .catch(() => { commandsRegistry = null; return null; });
}

function formatHelpOutput(term, cmdName) {
  if (!commandsRegistry) {
    term.write('\r\n\x1b[31m\u2717 Command registry not loaded. Refresh the page.\x1b[0m\r\n');
    return;
  }

  let found = null;
  let foundCategory = '';
  for (const cat of commandsRegistry.categories) {
    for (const cmd of cat.commands) {
      if (cmd.name.toLowerCase() === cmdName.toLowerCase() || cmd.aliases.some(a => a.toLowerCase() === cmdName.toLowerCase())) {
        found = cmd;
        foundCategory = cat.name;
        break;
      }
    }
    if (found) break;
  }

  if (!found) {
    term.write('\r\n\x1b[33m\u26A0 No documentation found for "' + cmdName + '"\x1b[0m\r\n');
    return;
  }

  const W = Math.min(term.cols, 72);
  const sep = '\u2500'.repeat(W - 2);

  term.write('\r\n\x1b[1;36m\u250C' + sep + '\u2510\x1b[0m');
  term.write('\r\n\x1b[1;36m\u2502\x1b[0m \x1b[1;33m' + found.name + '\x1b[0m' + ' '.repeat(Math.max(0, W - 4 - found.name.length)) + '\x1b[1;36m\u2502\x1b[0m');
  if (found.aliases && found.aliases.length) {
    const aliasStr = '\x1b[90mAliases:\x1b[0m ' + found.aliases.join(', ');
    const pad = Math.max(0, W - 4 - aliasStr.length);
    term.write('\r\n\x1b[36m\u2502\x1b[0m ' + aliasStr + ' '.repeat(pad) + '\x1b[36m\u2502\x1b[0m');
  }
  term.write('\r\n\x1b[36m\u2502\x1b[0m \x1b[90m' + foundCategory + '\x1b[0m' + ' '.repeat(Math.max(0, W - 4 - foundCategory.length - 7)) + '\x1b[36m\u2502\x1b[0m');
  term.write('\r\n\x1b[36m\u2502\x1b[0m ' + ''.repeat(W - 4) + ' \x1b[36m\u2502\x1b[0m');
  term.write('\r\n\x1b[36m\u2502\x1b[0m \x1b[90m' + found.description + '\x1b[0m' + ' '.repeat(Math.max(0, W - 4 - found.description.length)) + '\x1b[36m\u2502\x1b[0m');
  term.write('\r\n\x1b[36m\u2502\x1b[0m ' + ''.repeat(W - 4) + ' \x1b[36m\u2502\x1b[0m');
  term.write('\r\n\x1b[36m\u2502\x1b[0m \x1b[1mSyntax:\x1b[0m ' + ' '.repeat(Math.max(0, W - 12 - found.syntax.length)) + '\x1b[36m\u2502\x1b[0m');
  term.write('\r\n\x1b[36m\u2502\x1b[0m \x1b[90m' + found.syntax + '\x1b[0m' + ' '.repeat(Math.max(0, W - 4 - found.syntax.length)) + '\x1b[36m\u2502\x1b[0m');
  if (found.examples && found.examples.length) {
    term.write('\r\n\x1b[36m\u2502\x1b[0m ' + ''.repeat(W - 4) + ' \x1b[36m\u2502\x1b[0m');
    term.write('\r\n\x1b[36m\u2502\x1b[0m \x1b[1mExamples:\x1b[0m' + ' '.repeat(Math.max(0, W - 14)) + '\x1b[36m\u2502\x1b[0m');
    for (const ex of found.examples.slice(0, 4)) {
      const display = '  $ \x1b[33m' + ex + '\x1b[0m';
      const rawLen = ex.length + 4;
      term.write('\r\n\x1b[36m\u2502\x1b[0m ' + display + ' '.repeat(Math.max(0, W - 4 - rawLen)) + '\x1b[36m\u2502\x1b[0m');
    }
  }
  if (found.notes) {
    term.write('\r\n\x1b[36m\u2502\x1b[0m ' + ''.repeat(W - 4) + ' \x1b[36m\u2502\x1b[0m');
    const notesDisplay = '\x1b[90m\u2139\uFE0F ' + found.notes + '\x1b[0m';
    const notesClean = found.notes.length + 2;
    term.write('\r\n\x1b[36m\u2502\x1b[0m ' + notesDisplay + ' '.repeat(Math.max(0, W - 4 - notesClean)) + '\x1b[36m\u2502\x1b[0m');
  }
  term.write('\r\n\x1b[1;36m\u2514' + sep + '\u2518\x1b[0m\r\n');
}

function showAllCommandsHelp(term) {
  if (!commandsRegistry) {
    term.write('\r\n\x1b[31m\u2717 Registry not loaded.\x1b[0m\r\n');
    return;
  }

  const W = Math.min(term.cols, 72);
  const sep = '\u2500'.repeat(W - 2);

  term.write('\r\n\x1b[1;36m\u250C' + sep + '\u2510\x1b[0m');
  term.write('\r\n\x1b[1;36m\u2502\x1b[0m \x1b[1;33mNuclusCli Help\x1b[0m' + ' '.repeat(Math.max(0, W - 20)) + '\x1b[1;36m\u2502\x1b[0m');
  term.write('\r\n\x1b[36m\u2502\x1b[0m \x1b[90mType' + ' help <command> \u2014 for details on any command\x1b[0m' + ' '.repeat(Math.max(0, W - 40)) + '\x1b[36m\u2502\x1b[0m');
  term.write('\r\n\x1b[36m\u251C' + sep + '\u2524\x1b[0m');

  for (const cat of commandsRegistry.categories) {
    const header = ' \x1b[1m' + (cat.icon || '') + ' ' + cat.name + '\x1b[0m';
    const headerClean = cat.name.length + 2 + (cat.icon ? 2 : 0);
    term.write('\r\n\x1b[36m\u2502\x1b[0m' + header + ' '.repeat(Math.max(0, W - 4 - headerClean)) + '\x1b[36m\u2502\x1b[0m');
    for (const cmd of cat.commands.slice(0, 4)) {
      const display = '  \x1b[36m\u25B8\x1b[0m \x1b[33m' + cmd.name + '\x1b[0m  \x1b[90m' + cmd.description.slice(0, 45) + '\x1b[0m';
      const rawLen = cmd.name.length + cmd.description.slice(0, 45).length + 6;
      term.write('\r\n\x1b[36m\u2502\x1b[0m' + display + ' '.repeat(Math.max(0, W - 4 - rawLen)) + '\x1b[36m\u2502\x1b[0m');
    }
    if (cat.commands.length > 4) {
      const more = '\x1b[90m  ... ' + (cat.commands.length - 4) + ' more\x1b[0m';
      term.write('\r\n\x1b[36m\u2502\x1b[0m' + more + ' '.repeat(Math.max(0, W - 4 - 14)) + '\x1b[36m\u2502\x1b[0m');
    }
    term.write('\r\n\x1b[36m\u2502\x1b[0m ' + ''.repeat(W - 4) + ' \x1b[36m\u2502\x1b[0m');
  }

  term.write('\r\n\x1b[36m\u2502\x1b[0m \x1b[1mBuilt-in Commands:\x1b[0m' + ' '.repeat(Math.max(0, W - 22)) + '\x1b[36m\u2502\x1b[0m');
  const builtins = [
    '  \x1b[36m\u25B8\x1b[0m \x1b[33mhelp\x1b[0m       \x1b[90mShow this help or details for a command\x1b[0m',
    '  \x1b[36m\u25B8\x1b[0m \x1b[33m<ELECTRON>\x1b[0m  \x1b[90mAI command mode: <ELECTRON> list files\x1b[0m',
    '  \x1b[36m\u25B8\x1b[0m \x1b[33m/config\x1b[0m     \x1b[90mOpen AI configuration dialog\x1b[0m',
    '  \x1b[36m\u25B8\x1b[0m \x1b[33m/ask <q>\x1b[0m    \x1b[90mAsk AI a question\x1b[0m',
    '  \x1b[36m\u25B8\x1b[0m \x1b[33m/why\x1b[0m        \x1b[90mExplain last error\x1b[0m',
    '  \x1b[36m\u25B8\x1b[0m \x1b[33mgoogle <q>\x1b[0m  \x1b[90mSearch Google in web tab\x1b[0m',
    '  \x1b[36m\u25B8\x1b[0m \x1b[33mgithub <r>\x1b[0m  \x1b[90mOpen GitHub repo in web tab\x1b[0m',
    '  \x1b[36m\u25B8\x1b[0m \x1b[33mopen <url>\x1b[0m  \x1b[90mOpen URL in web tab\x1b[0m',
  ];
  for (const b of builtins) {
    term.write('\r\n\x1b[36m\u2502\x1b[0m' + b + ' '.repeat(Math.max(0, W - 4 - 35)) + '\x1b[36m\u2502\x1b[0m');
  }
  term.write('\r\n\x1b[1;36m\u2514' + sep + '\u2518\x1b[0m\r\n');
}

// ─── Terminal Tabs ─────────────────────────────────────────────
function setupTerminal(tab, view) {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const term = new Terminal({
    cursorBlink: true,
    cursorStyle: 'bar',
    fontSize: 14,
    fontFamily: 'Consolas, "SF Mono", "Fira Code", "Courier New", monospace',
    theme: {
      background: isLight ? '#fafafa' : '#0d0d14',
      foreground: isLight ? '#1a1a2e' : '#e0e0e8',
      cursor: isLight ? '#2563eb' : '#5b9cf5',
      selectionBackground: isLight ? '#2563eb33' : '#5b9cf533',
      black: '#1a1a2e', red: isLight ? '#dc2626' : '#f05050',
      green: isLight ? '#16a34a' : '#4cd964', yellow: isLight ? '#d97706' : '#f0a030',
      blue: isLight ? '#2563eb' : '#5b9cf5', magenta: isLight ? '#7c3aed' : '#a78bfa',
      cyan: isLight ? '#0891b2' : '#22d3ee', white: isLight ? '#e0e0e8' : '#e0e0e8',
      brightBlack: '#78789a', brightWhite: isLight ? '#1a1a2e' : '#ffffff',
    },
  });
  const fitAddon = new FitAddon.FitAddon();
  term.loadAddon(fitAddon);

  const termDiv = document.createElement('div');
  termDiv.style.height = '100%';
  termDiv.style.padding = '2px';
  view.appendChild(termDiv);
  term.open(termDiv);
  fitAddon.fit();

  tab.term = term;
  tab.fit = () => fitAddon.fit();

  const ro = new ResizeObserver(() => fitAddon.fit());
  ro.observe(view);
  tab.ro = ro;

  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(`${protocol}//${location.host}`);
  tab.ws = ws;

  ws.onopen = () => {
    const { cols, rows } = term;
    ws.send(JSON.stringify({ type: 'resize', cols, rows }));
    // Set custom NuclusCli prompt
    ws.send(JSON.stringify({ type: 'input', payload: "function prompt { 'NuclusCli> ' }\r\n" }));
    term.focus();
  };

  ws.onmessage = (e) => {
    term.write(e.data);
  };

  tab.mode = 'normal';
  tab.aiBuffer = '';
  tab.aiCommand = '';
  tab.lineBuffer = '';

  // ── Terminal key handler ────────────────────────────────
  term.onKey(({ key, domEvent }) => {
    if (tab.mode === 'ai-cmd') {
      if (key === '\r') { triggerAI(tab, 'command', tab.aiBuffer); return; }
      if (key === '\x1b') { cancelAIMode(tab); return; }
      if (key === '\x7f') {
        if (tab.aiBuffer.length) { tab.aiBuffer = tab.aiBuffer.slice(0, -1); term.write('\b \b'); }
        return;
      }
      if (!domEvent.ctrlKey && !domEvent.altKey) { tab.aiBuffer += key; term.write(key); }
      return;
    }

    if (tab.mode === 'ai-chat') {
      if (key === '\r') { triggerAI(tab, 'chat', tab.aiBuffer); return; }
      if (key === '\x1b') { cancelAIMode(tab); return; }
      if (key === '\x7f') {
        if (tab.aiBuffer.length) { tab.aiBuffer = tab.aiBuffer.slice(0, -1); term.write('\b \b'); }
        return;
      }
      if (!domEvent.ctrlKey && !domEvent.altKey) { tab.aiBuffer += key; term.write(key); }
      return;
    }

    if (tab.mode === 'confirm-cmd') {
      if (key === '\r') {
        tab.mode = 'normal';
        term.write('\r\n');
        ws.send(JSON.stringify({ type: 'input', payload: tab.aiCommand + '\r' }));
      } else if (key === '\x1b') {
        tab.mode = 'normal';
        term.write('\r\n');
      }
      return;
    }

    // Normal mode - Enter
    if (key === '\r') {
      const cmd = tab.lineBuffer.trim();
      tab.lineBuffer = '';

      // <ELECTRON> AI trigger
      if (cmd.startsWith('<ELECTRON>') || cmd.startsWith('<electron>')) {
        const prompt = cmd.replace(/^<[eE][lL][eE][cC][tT][rR][oO][nN]>\s*/, '');
        if (prompt) {
          ws.send(JSON.stringify({ type: 'input', payload: '\x03' }));
          cancelAIMode(tab);
          enterAIMode(tab, 'ai-cmd', '\x1b[36m\u25C7  AI >\x1b[0m ');
          tab.aiBuffer = prompt;
          term.write(prompt);
          triggerAI(tab, 'command', prompt);
        } else {
          term.write('\r\n\x1b[33m\u26A0 Usage: <ELECTRON> your prompt here\x1b[0m\r\n');
        }
        return;
      }

      // Web commands from terminal
      if (cmd.startsWith('google ') || cmd === 'google') {
        const q = cmd.replace(/^google\s*/, '');
        term.write('\r\n\x1b[34m\u25B6 Opening Google' + (q ? ': ' + q : '') + '\x1b[0m\r\n');
        createTab('web', resolveWebUrl('google', q));
        return;
      }
      if (cmd.startsWith('github ') || cmd === 'github') {
        const q = cmd.replace(/^github\s*/, '');
        term.write('\r\n\x1b[34m\u25B6 Opening GitHub' + (q ? ': ' + q : '') + '\x1b[0m\r\n');
        createTab('web', resolveWebUrl('github', q));
        return;
      }
      if (cmd.startsWith('open ')) {
        const q = cmd.replace(/^open\s*/, '');
        const url = resolveWebUrl('open', q);
        if (url) {
          term.write('\r\n\x1b[34m\u25B6 Opening ' + url + '\x1b[0m\r\n');
          createTab('web', url);
        } else {
          term.write('\r\n\x1b[33m\u26A0 Usage: open <url>\x1b[0m\r\n');
        }
        return;
      }

      // Help command
      if (cmd === 'help') {
        showAllCommandsHelp(term);
        return;
      }
      if (cmd.startsWith('help ')) {
        const cmdName = cmd.replace(/^help\s+/, '');
        formatHelpOutput(term, cmdName);
        return;
      }

      // AI commands
      if (cmd === '/config') {
        showConfigModal();
        term.write('\r\n');
        return;
      }

      if (cmd.startsWith('/ask')) {
        const q = cmd.replace(/^\/ask\s*/, '');
        if (q) {
          ws.send(JSON.stringify({ type: 'input', payload: '\x03' }));
          enterAIMode(tab, 'ai-chat', '\x1b[36m\u25C7  Ask >\x1b[0m ');
          tab.aiBuffer = q;
          term.write(q);
          triggerAI(tab, 'chat', q);
          return;
        }
      }

      if (cmd.startsWith('/why')) {
        const extra = cmd.replace(/^\/why\s*/, '');
        ws.send(JSON.stringify({ type: 'input', payload: '\x03' }));
        fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'why', prompt: extra || 'What went wrong?' }),
        })
          .then((r) => r.json())
          .then((res) => {
            if (res.error) throw new Error(res.error);
            showAIResponse(tab, 'chat', res);
          })
          .catch((err) => {
            term.write('\r\n\x1b[31m\u2717 ' + err.message + '\x1b[0m\r\n');
            tab.mode = 'normal';
          });
        return;
      }

      ws.send(JSON.stringify({ type: 'input', payload: '\r' }));
      return;
    }

    if (key === '\x7f') {
      if (tab.lineBuffer.length) tab.lineBuffer = tab.lineBuffer.slice(0, -1);
      ws.send(JSON.stringify({ type: 'input', payload: '\x7f' }));
      return;
    }

    if (key === '\x1b') {
      ws.send(JSON.stringify({ type: 'input', payload: '\x1b' }));
      return;
    }

    if (!domEvent.ctrlKey && !domEvent.altKey && !domEvent.metaKey) {
      tab.lineBuffer += key;
      ws.send(JSON.stringify({ type: 'input', payload: key }));
    }
  });

  term.onResize(({ cols, rows }) => {
    ws.send(JSON.stringify({ type: 'resize', cols, rows }));
  });
}

// ─── Terminal AI helpers ───────────────────────────────────────
function enterAIMode(tab, mode, prefix) {
  tab.mode = mode;
  tab.aiBuffer = '';
  tab.term.write('\r\n' + prefix);
}

function cancelAIMode(tab) {
  if (tab.mode !== 'normal') {
    tab.mode = 'normal';
    tab.term.write('\r\n');
  }
}

function triggerAI(tab, type, text) {
  if (!text) { cancelAIMode(tab); return; }
  tab.term.write('\r\n\x1b[90m\u25C7 AI thinking...\x1b[0m');
  fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, prompt: text }),
  })
    .then((r) => r.json())
    .then((res) => {
      if (res.error) throw new Error(res.error);
      tab.term.write('\r\x1b[K');
      showAIResponse(tab, type, res);
    })
    .catch((err) => {
      tab.term.write('\r\x1b[K\x1b[31m\u2717 ' + err.message + '\x1b[0m\r\n');
      tab.mode = 'normal';
    });
}

function showAIResponse(tab, type, res) {
  const t = tab.term;
  if (type === 'command' && res.command) {
    tab.aiCommand = res.command;
    t.write('\x1b[36m\u2554\u2550\u2550 AI \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\x1b[0m');
    t.write('\r\n\x1b[36m\u2551\x1b[0m $ \x1b[33m' + res.command + '\x1b[0m');
    if (res.explanation) t.write('\r\n\x1b[36m\u2551\x1b[0m \x1b[90m' + res.explanation + '\x1b[0m');
    t.write('\r\n\x1b[36m\u2551\x1b[0m');
    t.write('\r\n\x1b[36m\u2551\x1b[0m \x1b[90m[Enter] run  [Esc] cancel\x1b[0m');
    t.write('\r\n\x1b[36m\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d\x1b[0m');
    tab.mode = 'confirm-cmd';
  } else {
    t.write('\x1b[36m\u2554\u2550\u2550 AI \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\x1b[0m');
    for (const line of res.text.split('\n')) {
      t.write('\r\n\x1b[36m\u2551\x1b[0m ' + line);
    }
    t.write('\r\n\x1b[36m\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d\x1b[0m\r\n');
    tab.mode = 'normal';
  }
}

// ─── Config Modal ──────────────────────────────────────────────
function showConfigModal() {
  const modal = document.getElementById('config-modal');
  const status = document.getElementById('cfg-status');
  status.className = 'cfg-status hidden';
  modal.classList.remove('hidden');

  fetch('/api/ai/config')
    .then(r => r.json())
    .then(cfg => {
      document.getElementById('cfg-provider').value = cfg.provider || 'openai';
      document.getElementById('cfg-model').value = cfg.model || 'gpt-4o-mini';
      document.getElementById('cfg-key').value = cfg.apiKey || '';
      document.getElementById('cfg-url').value = cfg.baseUrl || '';
    })
    .catch(() => {
      document.getElementById('cfg-provider').value = 'openai';
      document.getElementById('cfg-model').value = 'gpt-4o-mini';
      document.getElementById('cfg-key').value = '';
      document.getElementById('cfg-url').value = '';
    });
}

function hideConfigModal() {
  document.getElementById('config-modal').classList.add('hidden');
}

function saveConfig() {
  const status = document.getElementById('cfg-status');
  const provider = document.getElementById('cfg-provider').value;
  const model = document.getElementById('cfg-model').value.trim();
  const apiKey = document.getElementById('cfg-key').value.trim();
  const baseUrl = document.getElementById('cfg-url').value.trim();

  status.className = 'cfg-status info';
  status.textContent = 'Saving & testing...';

  fetch('/api/ai/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, model, apiKey, baseUrl }),
  })
    .then(r => r.json())
    .then(d => {
      if (d.error) throw new Error(d.error);
      return fetch('/api/ai/test');
    })
    .then(r => r.json())
    .then(td => {
      if (td.ok) {
        status.className = 'cfg-status success';
        status.textContent = 'Config saved and connection OK \u2014 AI is ready!';
        setTimeout(hideConfigModal, 1500);
      } else {
        status.className = 'cfg-status error';
        status.textContent = 'Saved but test failed: ' + (td.error || 'unknown');
      }
    })
    .catch(err => {
      status.className = 'cfg-status error';
      status.textContent = 'Save failed: ' + err.message;
    });
}

// ─── Theme ──────────────────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('nucluscli_theme', next);

  tabs.filter(t => t.type === 'terminal' && t.term).forEach(t => {
    const isLight = next === 'light';
    t.term.setOption('theme', {
      background: isLight ? '#fafafa' : '#0d0d14',
      foreground: isLight ? '#1a1a2e' : '#e0e0e8',
      cursor: isLight ? '#2563eb' : '#5b9cf5',
      selectionBackground: isLight ? '#2563eb33' : '#5b9cf533',
    });
  });

  document.querySelector('meta[name="theme-color"]').content = next === 'dark' ? '#111118' : '#f0f0f4';
  document.getElementById('theme-btn').textContent = next === 'dark' ? '\u2600' : '\u25D0';
}

function loadTheme() {
  const saved = localStorage.getItem('nucluscli_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  document.querySelector('meta[name="theme-color"]').content = saved === 'dark' ? '#111118' : '#f0f0f4';
  document.getElementById('theme-btn').textContent = saved === 'dark' ? '\u2600' : '\u25D0';
}

// ─── Helpers ───────────────────────────────────────────────────
function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ─── Event Handlers ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadCommandsRegistry();

  if (isElectron) {
    document.getElementById('min-btn').addEventListener('click', () => window.electronAPI.minimize());
    document.getElementById('max-btn').addEventListener('click', () => window.electronAPI.maximize());
    document.getElementById('close-btn').addEventListener('click', () => window.electronAPI.close());
  } else {
    document.getElementById('window-controls').style.display = 'none';
  }

  document.getElementById('theme-btn').addEventListener('click', toggleTheme);
  document.getElementById('settings-btn').addEventListener('click', showConfigModal);
  document.getElementById('new-tab-btn').addEventListener('click', () => createTab('welcome'));

  const urlBar = document.getElementById('url-bar');
  urlBar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') navigateActiveTab(urlBar.value);
  });
  document.getElementById('nav-go').addEventListener('click', () => navigateActiveTab(urlBar.value));

  document.getElementById('nav-back').addEventListener('click', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab?.webview) tab.webview.goBack();
  });
  document.getElementById('nav-fwd').addEventListener('click', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab?.webview) tab.webview.goForward();
  });
  document.getElementById('nav-refresh').addEventListener('click', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab?.webview) tab.webview.reload();
  });

  // Config modal - ONLY close via explicit buttons, never on overlay click
  document.getElementById('cfg-cancel').addEventListener('click', hideConfigModal);
  document.getElementById('cfg-modal-close').addEventListener('click', hideConfigModal);
  document.getElementById('cfg-save').addEventListener('click', saveConfig);
  document.querySelectorAll('#config-modal .field input').forEach(el => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveConfig();
    });
  });
  // ESC key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('config-modal');
      if (!modal.classList.contains('hidden')) hideConfigModal();
    }
  });

  createTab('welcome');
  createTab('terminal');
});
