/**
 * Dawamu OS - Ultra-Fast School Browser with Offline Support
 *
 * KEY DESIGN:
 * - Each tab has ONE persistent <webview> that is NEVER destroyed.
 * - Navigation just sets webview.src — no renderer process respawning.
 * - Start Page is a lightweight HTML overlay shown ON TOP of the webview.
 * - Persistent session partition = cached DNS + SSL across all tabs.
 * - All student restriction enforcement runs before any navigation fires.
 * - OFFLINE MODE: Built-in educational tools accessible without internet.
 */

import { restrictionManager } from '../os/restrictionManager.js';

const IS_ELECTRON = !!(window.electronAPI && window.electronAPI.isElectron);

const ENGINES = {
  google: { url: 'https://www.google.com/search?q=', home: 'https://www.google.com' },
  bing:   { url: 'https://www.bing.com/search?q=',   home: 'https://www.bing.com' },
  brave:  { url: 'https://search.brave.com/search?q=', home: 'https://search.brave.com' },
};

let engine = 'google';

const BOOKMARKS = [
  { label: 'Google',       icon: 'fab fa-google text-blue-400',           url: 'https://www.google.com' },
  { label: 'Bing',         icon: 'fab fa-microsoft text-cyan-400',         url: 'https://www.bing.com' },
  { label: 'Brave',        icon: 'fas fa-shield-alt text-amber-500',       url: 'https://search.brave.com' },
  { label: 'Khan Academy', icon: 'fas fa-leaf text-emerald-400',           url: 'https://www.khanacademy.org' },
  { label: 'NASA',         icon: 'fas fa-rocket text-indigo-400',          url: 'https://www.nasa.gov' },
  { label: 'Math Is Fun',  icon: 'fas fa-square-root-alt text-amber-400',  url: 'https://www.mathsisfun.com' },
];

/* ─── TAB STATE ─── */
let tabs = [];
let activeTabId = null;
let tabCounter = 0;
let isOnline = navigator.onLine;

function newTab(url = null) {
  const id = ++tabCounter;
  tabs.push({ id, url, title: 'New Tab', loading: false });
  return id;
}

/* ═══════════════════════════════════════════════════
   OFFLINE TOOLS — Built-in educational pages (no network)
═══════════════════════════════════════════════════ */
const OFFLINE_TOOLS = {
  'dawamu://dictionary': { title: 'Dawamu Dictionary', builder: buildDictionaryTool },
  'dawamu://periodic-table': { title: 'Periodic Table', builder: buildPeriodicTableTool },
  'dawamu://math': { title: 'Math Reference', builder: buildMathTool },
  'dawamu://notes': { title: 'Quick Notes', builder: buildNotesTool },
  'dawamu://history': { title: 'World History', builder: buildHistoryTool },
  'dawamu://offline': { title: 'You are Offline', builder: buildOfflinePage },
};

function isOfflineTool(url) { return url && url.startsWith('dawamu://'); }

/* ═══════════════════════════════════════════════════
   ENTRY POINT
═══════════════════════════════════════════════════ */
export function createBrowserApp() {
  tabs = []; activeTabId = null; tabCounter = 0;
  isOnline = navigator.onLine;

  const root = document.createElement('div');
  root.className = 'flex flex-col h-full bg-[#202124] text-white overflow-hidden font-sans';
  root.innerHTML = buildChrome();

  wireChrome(root);
  openTab(root, null);

  // Live online/offline detection
  const updateStatus = () => {
    isOnline = navigator.onLine;
    const badge = root.querySelector('#net-badge');
    if (badge) {
      badge.innerHTML = isOnline
        ? '<i class="fas fa-wifi text-emerald-400 text-[9px]"></i> <span class="text-emerald-300">Online</span>'
        : '<i class="fas fa-plane text-amber-400 text-[9px]"></i> <span class="text-amber-300">Offline</span>';
    }
  };
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();

  return root;
}

/* ═══════════════════════════════════════════════════
   CHROME SHELL (static, rendered once)
═══════════════════════════════════════════════════ */
function buildChrome() {
  return `
  <!-- Tab Strip -->
  <div id="tab-strip" class="flex items-end bg-[#070c16] px-3 pt-2 gap-1.5 min-h-[42px] overflow-x-auto shrink-0 border-b border-white/5 select-none"></div>

  <!-- Toolbar -->
  <div class="bg-[#0b1322] border-b border-white/10 px-3.5 py-2 flex items-center gap-2.5 shrink-0 relative backdrop-blur-xl">
    <div class="flex items-center gap-1.5 text-slate-300">
      <button id="btn-back"    class="nb" title="Back"><i class="fas fa-arrow-left text-xs"></i></button>
      <button id="btn-forward" class="nb" title="Forward"><i class="fas fa-arrow-right text-xs"></i></button>
      <button id="btn-reload"  class="nb" title="Reload"><i id="reload-icon" class="fas fa-redo text-xs"></i></button>
      <button id="btn-home"    class="nb" title="Home"><i class="fas fa-home text-xs"></i></button>
    </div>

    <!-- Search Engine Selector -->
    <div class="relative flex items-center">
      <select id="engine-sel" class="bg-white/5 hover:bg-white/10 text-slate-200 text-xs border border-white/10 hover:border-emerald-500/40 rounded-xl px-3 py-1.5 outline-none cursor-pointer transition-all font-semibold appearance-none pr-7">
        <option value="google" class="bg-[#0b1322]">Google</option>
        <option value="bing" class="bg-[#0b1322]">Bing</option>
        <option value="brave" class="bg-[#0b1322]">Brave</option>
      </select>
      <i class="fas fa-chevron-down text-[9px] text-slate-400 absolute right-2.5 pointer-events-none"></i>
    </div>

    <!-- Omnibox URL / Search Bar -->
    <div class="flex-1 flex items-center gap-2.5 bg-[#070e1c] hover:bg-[#091326] focus-within:bg-[#050a14] focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 border border-white/10 rounded-2xl px-4 py-1.5 transition-all shadow-inner">
      <div class="flex items-center gap-1.5 text-emerald-400 text-xs shrink-0">
        <i class="fas fa-lock text-[11px]"></i>
      </div>
      <input id="omnibox" type="text" autocomplete="off" spellcheck="false"
             class="flex-1 bg-transparent outline-none text-xs text-white placeholder-slate-400 min-w-0 font-medium"
             placeholder="Search Google or enter school URL...">
      <div class="flex items-center gap-1.5 shrink-0">
        <span class="text-[9px] bg-emerald-950/90 text-emerald-300 border border-emerald-600/50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          SAFE
        </span>
      </div>
    </div>

    <!-- Downloads Drawer Button -->
    <button id="btn-downloads" class="nb relative" title="Downloads (Stored in Virtual OS)">
      <i class="fas fa-arrow-down text-xs text-slate-300"></i>
      <span id="dl-badge" class="hidden absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full"></span>
    </button>

    <button id="btn-new-tab" class="nb text-emerald-400 hover:text-white" title="New Tab"><i class="fas fa-plus text-xs"></i></button>

    <!-- Downloads Flyout Popover -->
    <div id="dl-popover" class="hidden absolute top-12 right-3 w-84 bg-[#091120]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-4 z-50 flex flex-col gap-3">
      <div class="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div class="text-xs font-bold text-white flex items-center gap-2">
          <div class="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
            <i class="fas fa-download"></i>
          </div>
          <span>Safe Downloads</span>
        </div>
        <span class="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">Stored in This PC</span>
      </div>
      <div id="dl-list" class="max-h-60 overflow-y-auto space-y-2 text-xs">
        <div class="text-slate-400 text-center py-6 text-[11px]"><i class="fas fa-folder-open text-2xl text-slate-600 mb-2 block"></i>No downloaded files yet</div>
      </div>
    </div>
  </div>

  <!-- Bookmarks Bar -->
  <div id="bm-bar" class="bg-[#070c16] border-b border-white/5 px-3.5 py-1.5 flex items-center gap-1.5 text-xs overflow-x-auto shrink-0 select-none">
    ${BOOKMARKS.map(b => `
      <button class="bm flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-transparent hover:border-white/10 shrink-0 transition-all text-xs font-medium" data-url="${b.url}">
        <i class="${b.icon} text-[11px]"></i><span class="text-[11px]">${b.label}</span>
      </button>`).join('')}
    <span class="border-l border-white/10 h-4 mx-1"></span>
    <button class="bm flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-600/40 shrink-0 transition-all text-xs font-semibold shadow-sm" data-url="dawamu://offline">
      <i class="fas fa-graduation-cap text-[10px]"></i><span class="text-[11px]">Offline Tools</span>
    </button>
  </div>

  <!-- Progress Bar -->
  <div id="prog" class="h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 w-0 opacity-0 shrink-0 transition-all duration-150"></div>

  <!-- Canvas: holds one wrapper per tab -->
  <div id="canvas" class="flex-1 flex overflow-hidden"></div>

  <!-- Status Bar -->
  <div class="bg-[#070c16] border-t border-white/5 px-4 py-1.5 flex justify-between shrink-0 text-slate-400 text-[11px] font-sans">
    <span id="status" class="truncate max-w-md flex items-center gap-1.5">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
      Dawamu Safe Browser • Protected Student Session
    </span>
    <div class="flex items-center gap-3">
      <span id="net-badge" class="flex items-center gap-1 text-[10px]"></span>
      <span class="text-[10px] text-emerald-400 font-semibold font-mono bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/30">Virtual OS Drive Active</span>
    </div>
  </div>

  <style>
    .nb { width:30px; height:30px; border-radius:10px; display:flex; align-items:center; justify-content:center;
          background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); cursor:pointer; color:#94a3b8; transition:all .15s cubic-bezier(0.16, 1, 0.3, 1); }
    .nb:hover { background:rgba(255,255,255,.12); color:#fff; border-color:rgba(255,255,255,.16); transform:translateY(-1px); box-shadow:0 2px 8px rgba(0,0,0,0.3); }
    .nb:active { transform:scale(.92); }
    .tab { display:flex; align-items:center; gap:8px; padding:7px 14px; border-radius:12px 12px 0 0;
           min-width:130px; max-width:220px; cursor:pointer; background:#0f172a; color:#94a3b8; font-size:11px;
           border:1px solid rgba(255,255,255,.06); border-bottom:none; transition:all .14s ease; position:relative; }
    .tab:hover { background:#162238; color:#f1f5f9; }
    .tab.active { background:#0b1322; color:#ffffff; border-color:rgba(255,255,255,.14); font-weight:600; box-shadow:inset 0 2px 0 #10b981; z-index:1; }
    .tab-x { margin-left:auto; width:16px; height:16px; border-radius:50%; display:flex; align-items:center;
              justify-content:center; font-size:9px; color:#94a3b8; background:transparent; border:none;
              cursor:pointer; opacity:0.6; transition:all .12s; }
    .tab:hover .tab-x, .tab.active .tab-x { opacity:1; }
    .tab-x:hover { background:rgba(239,68,68,.3); color:#fca5a5; transform:scale(1.1); }
    .tab-wrap { flex: 1; display: flex; flex-direction: column; width: 100%; height: 100%; position: relative; }
    .tab-wrap.hidden { display: none !important; }
    .start-overlay { position:absolute; inset:0; z-index:10; display:flex; align-items:center; justify-content:center; overflow-y:auto; background: radial-gradient(circle at 50% 20%, #0d1e33 0%, #060a12 100%); }
    .start-overlay.hidden { display:none !important; }
    .offline-tool { position:absolute; inset:0; z-index:11; overflow-y:auto; background:#0b1322; }
    .offline-tool.hidden { display:none !important; }
  </style>`;
}

/* ═══════════════════════════════════════════════════
   TAB MANAGEMENT
═══════════════════════════════════════════════════ */
function openTab(root, url) {
  const id = newTab(url);
  buildTabDOM(root, id);
  activateTab(root, id);
  if (url) loadUrl(root, id, url);
}

function buildTabDOM(root, tabId) {
  const canvas = root.querySelector('#canvas');

  const wrap = document.createElement('div');
  wrap.id = `tw-${tabId}`;
  wrap.className = 'tab-wrap hidden';

  if (IS_ELECTRON) {
    const wv = document.createElement('webview');
    wv.id = `wv-${tabId}`;
    wv.setAttribute('partition', 'persist:school');
    wv.setAttribute('allowpopups', '');
    wv.style.cssText = 'flex: 1 1 0%; width: 100%; height: 100%; border: none; display: flex;';
    wrap.appendChild(wv);
    wireWebview(root, tabId, wv);
  } else {
    const fr = document.createElement('iframe');
    fr.id = `wv-${tabId}`;
    fr.style.cssText = 'width:100%;height:100%;border:none;display:block;';
    fr.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals';
    fr.allow = 'fullscreen';
    fr.addEventListener('load', () => progress(root, tabId, false));
    wrap.appendChild(fr);
  }

  // Offline tool overlay (for dawamu:// pages)
  const toolOverlay = document.createElement('div');
  toolOverlay.id = `ot-${tabId}`;
  toolOverlay.className = 'offline-tool hidden';
  wrap.appendChild(toolOverlay);

  // Start page overlay
  const overlay = document.createElement('div');
  overlay.id = `sp-${tabId}`;
  overlay.className = 'start-overlay bg-[#202124]';
  overlay.innerHTML = startPageHTML(tabId);
  wireStartPage(root, tabId, overlay);
  wrap.appendChild(overlay);

  canvas.appendChild(wrap);
}

function wireWebview(root, tabId, wv) {
  wv.addEventListener('did-start-loading',  ()  => progress(root, tabId, true));
  wv.addEventListener('did-stop-loading',   ()  => progress(root, tabId, false));

  // Anti-CAPTCHA / Anti-Bot Bypass: Disables navigator.webdriver flag inside webviews
  wv.addEventListener('dom-ready', () => {
    try {
      wv.executeJavaScript(`
        try {
          delete window.navigator.__proto__.webdriver;
          Object.defineProperty(navigator, 'webdriver', { get: () => undefined, configurable: true });
          if (!window.chrome) {
            window.chrome = { runtime: {}, app: {}, csi: () => {}, loadTimes: () => {} };
          }
        } catch(_) {}
      `);
    } catch (_) {}
  });

  wv.addEventListener('did-fail-load', (e) => {
    progress(root, tabId, false);
    // Show offline page on network errors
    if (e.errorCode && (e.errorCode === -106 || e.errorCode === -105 || e.errorCode === -2 || e.errorCode === -118 || e.errorCode === -7)) {
      showOfflineTool(root, tabId, 'dawamu://offline', e.validatedURL || '');
    }
  });

  wv.addEventListener('did-navigate', e => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) tab.url = e.url;
    if (tabId === activeTabId) root.querySelector('#omnibox').value = e.url;
  });

  wv.addEventListener('page-title-updated', e => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) tab.title = e.title || 'Page';
    renderTabStrip(root);
  });

  wv.addEventListener('update-target-url', e => {
    if (tabId === activeTabId)
      root.querySelector('#status').textContent = e.url || 'Dawamu Safe Browser';
  });

  wv.addEventListener('will-navigate', e => {
    if (!restrictionManager.checkUrlAccess(e.url).allowed) {
      try { wv.stop(); } catch (_) {}
      showBlock(root, tabId, e.url, restrictionManager.checkUrlAccess(e.url).reason);
    }
  });
}

function activateTab(root, tabId) {
  activeTabId = tabId;
  root.querySelectorAll('.tab-wrap').forEach(w => w.classList.add('hidden'));
  const wrap = root.querySelector(`#tw-${tabId}`);
  if (wrap) wrap.classList.remove('hidden');
  const tab = tabs.find(t => t.id === tabId);
  const omni = root.querySelector('#omnibox');
  if (omni) omni.value = (!tab?.url) ? '' : tab.url;
  renderTabStrip(root);
}

function closeTab(root, tabId) {
  if (tabs.length === 1) return;
  const idx = tabs.findIndex(t => t.id === tabId);
  tabs = tabs.filter(t => t.id !== tabId);
  root.querySelector(`#tw-${tabId}`)?.remove();
  if (activeTabId === tabId) {
    activateTab(root, tabs[Math.min(idx, tabs.length - 1)].id);
  } else {
    renderTabStrip(root);
  }
}

function renderTabStrip(root) {
  const strip = root.querySelector('#tab-strip');
  if (!strip) return;
  strip.innerHTML = tabs.map(tab => `
    <div class="tab ${tab.id === activeTabId ? 'active' : ''}" data-tid="${tab.id}">
      <i class="${tab.loading ? 'fas fa-circle-notch fa-spin text-blue-400' : 'fas fa-globe text-slate-500'} text-[10px] shrink-0"></i>
      <span class="truncate flex-1">${tab.title || 'New Tab'}</span>
      <button class="tab-x" data-close="${tab.id}">✕</button>
    </div>`).join('') +
    `<button id="strip-new" class="nb self-center ml-1 shrink-0" title="New Tab"><i class="fas fa-plus text-xs"></i></button>`;

  strip.querySelectorAll('.tab').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.closest('.tab-x')) return;
      activateTab(root, parseInt(el.dataset.tid));
    });
  });
  strip.querySelectorAll('.tab-x').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      closeTab(root, parseInt(btn.dataset.close));
    });
  });
  strip.querySelector('#strip-new')?.addEventListener('click', () => openTab(root, null));
}

/* ═══════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════ */
function loadUrl(root, tabId, url) {
  // Handle internal dawamu:// URLs (always offline)
  if (isOfflineTool(url)) {
    showOfflineTool(root, tabId, url);
    return;
  }

  // Check if offline and trying to load a web URL
  if (!navigator.onLine) {
    showOfflineTool(root, tabId, 'dawamu://offline', url);
    return;
  }

  const access = restrictionManager.checkUrlAccess(url);
  if (!access.allowed) { showBlock(root, tabId, url, access.reason); return; }

  // Hide overlays, show webview
  root.querySelector(`#sp-${tabId}`)?.classList.add('hidden');
  root.querySelector(`#ot-${tabId}`)?.classList.add('hidden');

  const view = root.querySelector(`#wv-${tabId}`);
  if (view) view.src = url;

  const tab = tabs.find(t => t.id === tabId);
  if (tab) { tab.url = url; tab.title = urlTitle(url); }

  if (tabId === activeTabId) root.querySelector('#omnibox').value = url;
  progress(root, tabId, true);
  renderTabStrip(root);
}

function navigate(root, tabId, raw) {
  let url = raw.trim();
  if (!url) return;

  // Internal URLs
  if (url.startsWith('dawamu://')) {
    loadUrl(root, tabId, url);
    return;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (/\.\w{2,}/.test(url) && !url.includes(' ')) {
      url = 'https://' + url;
    } else {
      const q = restrictionManager.inspectSearchQuery(url);
      if (!q.safe) { showBlock(root, tabId, url, q.reason); return; }
      url = ENGINES[engine].url + encodeURIComponent(url);
    }
  }

  loadUrl(root, tabId, url);
}

/* ═══════════════════════════════════════════════════
   OFFLINE TOOL RENDERER
═══════════════════════════════════════════════════ */
function showOfflineTool(root, tabId, toolUrl, failedUrl = '') {
  progress(root, tabId, false);

  // Hide other overlays
  root.querySelector(`#sp-${tabId}`)?.classList.add('hidden');

  const toolOverlay = root.querySelector(`#ot-${tabId}`);
  if (!toolOverlay) return;

  const tool = OFFLINE_TOOLS[toolUrl] || OFFLINE_TOOLS['dawamu://offline'];
  toolOverlay.innerHTML = tool.builder(root, tabId, failedUrl);
  toolOverlay.classList.remove('hidden');

  // Wire any interactive elements inside the tool
  wireOfflineToolEvents(root, tabId, toolOverlay, toolUrl);

  const tab = tabs.find(t => t.id === tabId);
  if (tab) { tab.url = toolUrl; tab.title = tool.title; }
  if (tabId === activeTabId) root.querySelector('#omnibox').value = toolUrl;
  renderTabStrip(root);
}

function wireOfflineToolEvents(root, tabId, container, toolUrl) {
  // "Try Again" buttons
  container.querySelectorAll('[data-retry]').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.retry;
      if (url) loadUrl(root, tabId, url);
    });
  });

  // Tool navigation cards
  container.querySelectorAll('[data-tool]').forEach(card => {
    card.addEventListener('click', () => {
      loadUrl(root, tabId, card.dataset.tool);
    });
  });

  // Go Home buttons
  container.querySelectorAll('[data-home]').forEach(btn => {
    btn.addEventListener('click', () => showStartPage(root, tabId));
  });

  // Dictionary search
  const dictInput = container.querySelector('#dict-search');
  const dictBtn = container.querySelector('#dict-btn');
  const dictResult = container.querySelector('#dict-result');
  if (dictInput && dictBtn && dictResult) {
    const search = () => {
      const word = dictInput.value.trim().toLowerCase();
      if (!word) return;
      const entry = DICTIONARY_DATA[word];
      if (entry) {
        dictResult.innerHTML = `<div class="bg-[#292a2d] p-4 rounded-2xl border border-slate-700/50">
          <h3 class="text-lg font-bold text-white capitalize">${word}</h3>
          <p class="text-[10px] text-slate-500 italic">${entry.type}</p>
          <p class="text-sm text-slate-300 mt-2">${entry.def}</p>
          ${entry.example ? `<p class="text-xs text-slate-500 mt-2 italic">"${entry.example}"</p>` : ''}
        </div>`;
      } else {
        dictResult.innerHTML = `<div class="text-slate-500 text-sm">Word "${word}" not found in offline dictionary. Try: <span class="text-emerald-400 cursor-pointer" onclick="this.closest('.offline-tool').querySelector('#dict-search').value='atom';this.closest('.offline-tool').querySelector('#dict-btn').click()">atom</span>, <span class="text-emerald-400 cursor-pointer" onclick="this.closest('.offline-tool').querySelector('#dict-search').value='democracy';this.closest('.offline-tool').querySelector('#dict-btn').click()">democracy</span>, <span class="text-emerald-400 cursor-pointer" onclick="this.closest('.offline-tool').querySelector('#dict-search').value='photosynthesis';this.closest('.offline-tool').querySelector('#dict-btn').click()">photosynthesis</span></div>`;
      }
    };
    dictBtn.addEventListener('click', search);
    dictInput.addEventListener('keydown', e => { if (e.key === 'Enter') search(); });
  }

  // Notes autosave
  const notepad = container.querySelector('#offline-notepad');
  if (notepad) {
    notepad.value = localStorage.getItem('dawamu_notes') || '';
    notepad.addEventListener('input', () => {
      localStorage.setItem('dawamu_notes', notepad.value);
    });
  }
}

/* ═══════════════════════════════════════════════════
   PROGRESS BAR
═══════════════════════════════════════════════════ */
let _progTimer = null;
function progress(root, tabId, on) {
  const tab = tabs.find(t => t.id === tabId);
  if (tab) tab.loading = on;
  if (tabId !== activeTabId) return;
  const bar = root.querySelector('#prog');
  if (!bar) return;
  clearTimeout(_progTimer);
  if (on) {
    bar.style.width = '60%'; bar.style.opacity = '1';
    _progTimer = setTimeout(() => { bar.style.width='100%'; setTimeout(()=>{ bar.style.opacity='0'; bar.style.width='0'; },200); }, 3000);
  } else {
    bar.style.width = '100%';
    _progTimer = setTimeout(() => { bar.style.opacity='0'; setTimeout(()=>{ bar.style.width='0'; },150); }, 200);
  }
  renderTabStrip(root);
}

/* ═══════════════════════════════════════════════════
   BLOCK PAGE
═══════════════════════════════════════════════════ */
function showBlock(root, tabId, blockedUrl, reason) {
  progress(root, tabId, false);
  const overlay = root.querySelector(`#sp-${tabId}`);
  if (!overlay) return;
  root.querySelector(`#ot-${tabId}`)?.classList.add('hidden');
  overlay.classList.remove('hidden');
  overlay.innerHTML = `
    <div class="max-w-lg w-full bg-[#292a2d] border border-[#5f6368]/50 rounded-3xl p-8 text-center space-y-5 shadow-2xl mx-4">
      <div class="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto text-3xl border border-rose-500/30">
        <i class="fas fa-shield-alt"></i>
      </div>
      <h2 class="text-lg font-bold text-white">Access Restricted</h2>
      <p class="text-slate-400 text-sm">${reason || 'Blocked by school administrator policy.'}</p>
      <div class="bg-[#1a1b1e] p-3 rounded-2xl font-mono text-xs text-rose-300 text-left space-y-1">
        <div><b class="text-slate-400">URL:</b> ${blockedUrl}</div>
        <div><b class="text-slate-400">Filter:</b> Dawamu Network Filter</div>
      </div>
      <div class="flex justify-center gap-3">
        <button data-home class="bg-[#389e3c] hover:bg-[#2e7d32] text-white text-xs font-semibold px-4 py-2 rounded-full">Return Home</button>
      </div>
    </div>`;

  root.querySelector(`#omnibox`).value = blockedUrl;
  overlay.querySelector('[data-home]')?.addEventListener('click', () => showStartPage(root, tabId));
}

/* ═══════════════════════════════════════════════════
   START PAGE (pure HTML, zero network cost)
═══════════════════════════════════════════════════ */
function showStartPage(root, tabId) {
  const tab = tabs.find(t => t.id === tabId);
  if (tab) { tab.url = null; tab.title = 'New Tab'; }
  if (tabId === activeTabId) root.querySelector('#omnibox').value = '';
  root.querySelector(`#ot-${tabId}`)?.classList.add('hidden');
  renderTabStrip(root);

  const overlay = root.querySelector(`#sp-${tabId}`);
  if (!overlay) return;
  overlay.classList.remove('hidden');
  overlay.innerHTML = startPageHTML(tabId);
  wireStartPage(root, tabId, overlay);
}

function startPageHTML(tabId) {
  const offlineNotice = !navigator.onLine
    ? `<div class="flex items-center gap-2 bg-amber-950/80 border border-amber-600/50 text-amber-300 text-xs px-4 py-2 rounded-full mb-3 shadow-lg">
        <i class="fas fa-plane"></i> Working in Offline Mode — Built-in educational tools are active!
      </div>` : '';

  return `
  <div class="flex flex-col items-center justify-center min-h-full p-8 text-center space-y-5 overflow-y-auto max-w-3xl mx-auto">
    <div class="flex flex-col items-center gap-2">
      <img src="assets/dawamu-logo.png" alt="Dawamu Logo" class="h-20 w-auto object-contain drop-shadow-xl hover:scale-105 transition-transform">
      <div class="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-300 text-[10px] font-bold uppercase tracking-widest mt-1">
        <i class="fas fa-shield-alt text-xs"></i> Dawamu Safe Web Environment
      </div>
    </div>

    ${offlineNotice}

    <!-- Modern Central Search Bar -->
    <div class="w-full max-w-xl flex items-center bg-[#0d1627]/90 hover:bg-[#111e35] focus-within:bg-[#070d18] border border-white/15 hover:border-emerald-500/50 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 rounded-2xl px-4 py-3 shadow-2xl transition-all">
      <i class="fas fa-search text-emerald-400 text-sm mr-3 shrink-0"></i>
      <input id="sp-input-${tabId}" type="text"
             class="flex-1 bg-transparent outline-none text-white text-sm min-w-0 placeholder-slate-400 font-medium"
             placeholder="Search Google, Wikipedia, or enter URL..."
             autofocus>
      <button id="sp-btn-${tabId}" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-5 py-2 rounded-xl ml-2 shrink-0 shadow-md transition-all active:scale-95">Search</button>
    </div>

    <!-- Pinned Online Learning Shortcuts -->
    <div class="w-full max-w-xl">
      <div class="text-left text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2.5 flex items-center justify-between">
        <span class="flex items-center gap-1.5"><i class="fas fa-star text-amber-400 text-xs"></i> Verified Academic Portals</span>
        <span class="text-[10px] text-slate-500 font-normal">Fast Access</span>
      </div>
      <div class="grid grid-cols-4 gap-2.5">
        ${[
          { url:'https://www.google.com',      icon:'fab fa-google text-blue-400',          name:'Google', bg: 'from-blue-900/30 to-indigo-900/20' },
          { url:'https://www.khanacademy.org', icon:'fas fa-leaf text-emerald-400',         name:'Khan Academy', bg: 'from-emerald-900/30 to-teal-900/20' },
          { url:'https://www.wikipedia.org',   icon:'fab fa-wikipedia-w text-slate-200',    name:'Wikipedia', bg: 'from-slate-800/40 to-slate-900/20' },
          { url:'https://www.nasa.gov',        icon:'fas fa-rocket text-rose-400',          name:'NASA', bg: 'from-rose-900/30 to-amber-900/20' },
          { url:'https://search.brave.com',    icon:'fas fa-shield-alt text-amber-500',      name:'Brave', bg: 'from-amber-900/30 to-orange-900/20' },
          { url:'https://www.mathsisfun.com',  icon:'fas fa-square-root-alt text-amber-400', name:'Math Is Fun', bg: 'from-amber-900/30 to-yellow-900/20' },
          { url:'https://www.bing.com',        icon:'fab fa-microsoft text-cyan-400',        name:'Bing', bg: 'from-cyan-900/30 to-blue-900/20' },
          { url:'https://www.duolingo.com',    icon:'fas fa-language text-green-400',       name:'Duolingo', bg: 'from-green-900/30 to-emerald-900/20' },
        ].map(c => `
          <button class="sp-card bg-gradient-to-br ${c.bg} hover:brightness-125 border border-white/10 hover:border-emerald-500/40 p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all hover:-translate-y-1 hover:shadow-xl group" data-url="${c.url}">
            <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <i class="${c.icon}"></i>
            </div>
            <span class="text-[11px] font-semibold text-slate-200 group-hover:text-white truncate w-full">${c.name}</span>
          </button>`).join('')}
      </div>
    </div>

    <!-- Offline Built-in Utilities -->
    <div class="w-full max-w-xl pt-2">
      <div class="text-left text-[11px] text-emerald-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <i class="fas fa-laptop-code text-xs"></i> Built-in Offline Utilities
      </div>
      <div class="grid grid-cols-5 gap-2">
        ${[
          { url:'dawamu://dictionary',     icon:'fas fa-book text-sky-400',           name:'Dictionary' },
          { url:'dawamu://periodic-table',  icon:'fas fa-atom text-purple-400',        name:'Elements' },
          { url:'dawamu://math',            icon:'fas fa-calculator text-amber-400',   name:'Math Ref' },
          { url:'dawamu://notes',           icon:'fas fa-sticky-note text-yellow-400', name:'Notes' },
          { url:'dawamu://history',         icon:'fas fa-landmark text-rose-400',      name:'History' },
        ].map(c => `
          <button class="sp-card bg-slate-900/70 hover:bg-slate-800/90 border border-emerald-900/40 hover:border-emerald-500/50 p-2.5 rounded-xl flex flex-col items-center gap-1.5 transition-all hover:scale-105" data-url="${c.url}">
            <i class="${c.icon} text-lg"></i>
            <span class="text-[10px] font-semibold text-slate-300 text-center">${c.name}</span>
          </button>`).join('')}
      </div>
    </div>
  </div>`;
}

function wireStartPage(root, tabId, overlay) {
  const input = overlay.querySelector(`#sp-input-${tabId}`);
  const btn   = overlay.querySelector(`#sp-btn-${tabId}`);
  const go = () => { const v = input?.value.trim(); if (v) navigate(root, tabId, v); };
  btn?.addEventListener('click', go);
  input?.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  overlay.querySelectorAll('.sp-card').forEach(c =>
    c.addEventListener('click', () => navigate(root, tabId, c.dataset.url)));
}

/* ═══════════════════════════════════════════════════
   CHROME TOOLBAR WIRING
═══════════════════════════════════════════════════ */
function wireChrome(root) {
  const omni = root.querySelector('#omnibox');

  root.querySelector('#engine-sel').addEventListener('change', e => { engine = e.target.value; });
  omni.addEventListener('keydown', e => {
    if (e.key === 'Enter') { navigate(root, activeTabId, omni.value); omni.blur(); }
  });
  omni.addEventListener('focus', () => omni.select());

  root.querySelector('#btn-back').addEventListener('click', () => {
    const v = root.querySelector(`#wv-${activeTabId}`);
    if (IS_ELECTRON && v?.canGoBack?.()) v.goBack();
    else if (v?.contentWindow) try { v.contentWindow.history.back(); } catch (_) {}
  });

  root.querySelector('#btn-forward').addEventListener('click', () => {
    const v = root.querySelector(`#wv-${activeTabId}`);
    if (IS_ELECTRON && v?.canGoForward?.()) v.goForward();
    else if (v?.contentWindow) try { v.contentWindow.history.forward(); } catch (_) {}
  });

  root.querySelector('#btn-reload').addEventListener('click', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    const v   = root.querySelector(`#wv-${activeTabId}`);
    if (tab?.loading) {
      try { if (IS_ELECTRON) v?.stop(); } catch (_) {}
      progress(root, activeTabId, false);
    } else {
      if (IS_ELECTRON) { try { v?.reload(); } catch (_) {} }
      else if (v) v.src = v.src;
      progress(root, activeTabId, true);
    }
  });

  root.querySelector('#btn-home').addEventListener('click', () => showStartPage(root, activeTabId));
  root.querySelector('#btn-new-tab').addEventListener('click', () => openTab(root, null));

  root.querySelector('#bm-bar').addEventListener('click', e => {
    const b = e.target.closest('.bm');
    if (b) navigate(root, activeTabId, b.dataset.url);
  });

  // Downloads popover and live notifications
  const dlBtn = root.querySelector('#btn-downloads');
  const dlPopover = root.querySelector('#dl-popover');
  const dlBadge = root.querySelector('#dl-badge');
  const dlList = root.querySelector('#dl-list');
  const downloadedItems = [];

  const updateDownloadUI = () => {
    if (!dlList) return;
    if (downloadedItems.length === 0) {
      dlList.innerHTML = `<div class="text-slate-400 text-center py-4 text-[11px]">No recent downloads</div>`;
      dlBadge?.classList.add('hidden');
    } else {
      dlBadge?.classList.remove('hidden');
      dlList.innerHTML = downloadedItems.map(item => `
        <div class="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 truncate">
            <i class="fas fa-file text-emerald-400 text-sm"></i>
            <div class="truncate">
              <div class="font-semibold text-white truncate text-[11px]">${item.name}</div>
              <div class="text-[9px] text-slate-400">${item.size || 'Saved in This PC > Downloads'}</div>
            </div>
          </div>
          <span class="text-[9px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full shrink-0 font-semibold">This PC</span>
        </div>
      `).join('');
    }
  };

  dlBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dlPopover?.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    dlPopover?.classList.add('hidden');
  });

  if (window.electronAPI?.onDownloadComplete) {
    window.electronAPI.onDownloadComplete((data) => {
      downloadedItems.unshift(data);
      updateDownloadUI();
      const statusEl = root.querySelector('#status');
      if (statusEl) {
        statusEl.innerHTML = `<span class="text-emerald-400 font-bold"><i class="fas fa-check-circle mr-1"></i>Downloaded ${data.name} to This PC &gt; Downloads</span>`;
        setTimeout(() => {
          statusEl.textContent = 'Dawamu Safe Browser • Protected Session';
        }, 5000);
      }
    });
  }

  renderTabStrip(root);
}

function urlTitle(url) {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch (_) { return url; }
}

/* ═══════════════════════════════════════════════════════════════════════════
   OFFLINE TOOL BUILDERS — Pure HTML pages rendered locally, zero network
═══════════════════════════════════════════════════════════════════════════ */

function toolHeader(icon, title, subtitle) {
  return `<div class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
    <div class="w-10 h-10 bg-emerald-900/40 text-emerald-400 rounded-xl flex items-center justify-center text-lg border border-emerald-700/30"><i class="${icon}"></i></div>
    <div><h2 class="text-white font-bold text-base">${title}</h2><p class="text-[10px] text-slate-500">${subtitle}</p></div>
    <div class="ml-auto flex items-center gap-1 text-[10px] text-amber-400 bg-amber-900/30 border border-amber-700/40 px-2 py-1 rounded-full"><i class="fas fa-plane"></i> Offline</div>
  </div>`;
}

/* ─── OFFLINE LANDING PAGE ─── */
function buildOfflinePage(root, tabId, failedUrl) {
  return `<div class="p-8 max-w-2xl mx-auto">
    <div class="text-center space-y-6 mt-8">
      <div class="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto text-4xl border border-amber-500/30">
        <i class="fas fa-wifi-slash"></i>
      </div>
      <h2 class="text-2xl font-bold text-white">You're Offline</h2>
      <p class="text-slate-400 text-sm max-w-md mx-auto">No internet connection detected. You can still use the built-in educational tools below.</p>
      ${failedUrl ? `<div class="bg-[#292a2d] p-3 rounded-2xl font-mono text-xs text-slate-400 inline-block"><b>Tried:</b> ${failedUrl}</div>
        <button data-retry="${failedUrl}" class="bg-[#389e3c] hover:bg-[#2e7d32] text-white text-xs font-semibold px-6 py-2 rounded-full block mx-auto"><i class="fas fa-redo mr-2"></i>Try Again</button>` : ''}
    </div>

    <div class="mt-10">
      <h3 class="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2"><i class="fas fa-toolbox text-emerald-400"></i> Available Offline Tools</h3>
      <div class="grid grid-cols-3 gap-3">
        ${[
          { url:'dawamu://dictionary',    icon:'fas fa-book text-sky-400',           title:'Dictionary',      desc:'Look up word definitions' },
          { url:'dawamu://periodic-table', icon:'fas fa-atom text-purple-400',        title:'Periodic Table',  desc:'All 118 elements' },
          { url:'dawamu://math',           icon:'fas fa-calculator text-amber-400',   title:'Math Reference',  desc:'Formulas & constants' },
          { url:'dawamu://notes',          icon:'fas fa-sticky-note text-yellow-400', title:'Quick Notes',     desc:'Write & save notes offline' },
          { url:'dawamu://history',        icon:'fas fa-landmark text-rose-400',      title:'World History',   desc:'Key historical events' },
        ].map(t => `
          <button data-tool="${t.url}" class="bg-[#292a2d] hover:bg-[#35363a] border border-slate-700/50 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] hover:border-emerald-700/50">
            <i class="${t.icon} text-2xl mb-2"></i>
            <div class="text-sm font-bold text-white">${t.title}</div>
            <div class="text-[10px] text-slate-500 mt-0.5">${t.desc}</div>
          </button>`).join('')}
      </div>
    </div>

    <div class="mt-6 text-center">
      <button data-home class="text-emerald-400 hover:text-emerald-300 text-xs font-semibold"><i class="fas fa-home mr-1"></i> Back to Start Page</button>
    </div>
  </div>`;
}

/* ─── DICTIONARY ─── */
const DICTIONARY_DATA = {
  'atom': { type: 'noun', def: 'The smallest unit of a chemical element that retains its chemical properties, consisting of a nucleus surrounded by electrons.', example: 'An atom of hydrogen has one proton and one electron.' },
  'democracy': { type: 'noun', def: 'A system of government in which power is vested in the people, who rule either directly or through freely elected representatives.', example: 'Kenya is a multi-party democracy.' },
  'photosynthesis': { type: 'noun', def: 'The process by which green plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of sugar.', example: 'Photosynthesis occurs primarily in the leaves of plants.' },
  'ecosystem': { type: 'noun', def: 'A biological community of interacting organisms and their physical environment.', example: 'The coral reef is a complex marine ecosystem.' },
  'gravity': { type: 'noun', def: 'The force that attracts a body toward the center of the earth, or toward any other physical body having mass.', example: 'Gravity keeps the planets in orbit around the sun.' },
  'algebra': { type: 'noun', def: 'A branch of mathematics in which letters and other symbols are used to represent numbers and quantities in formulas and equations.', example: 'He solved the algebra equation for x.' },
  'constitution': { type: 'noun', def: 'A body of fundamental principles or established precedents according to which a state or organization is governed.', example: 'The Kenyan Constitution was promulgated in 2010.' },
  'velocity': { type: 'noun', def: 'The speed of something in a given direction. In physics, it is a vector quantity.', example: 'The velocity of the car was 60 km/h heading north.' },
  'mitosis': { type: 'noun', def: 'A type of cell division that results in two daughter cells each having the same number of chromosomes as the parent cell.', example: 'Mitosis is essential for growth and tissue repair.' },
  'osmosis': { type: 'noun', def: 'The movement of water molecules through a semipermeable membrane from a region of lower solute concentration to a region of higher solute concentration.', example: 'Osmosis is crucial for water absorption in plant roots.' },
  'metaphor': { type: 'noun', def: 'A figure of speech in which a word or phrase is applied to something that it does not literally describe, to suggest a resemblance.', example: '"Time is money" is a common metaphor.' },
  'hypothesis': { type: 'noun', def: 'A proposed explanation for a phenomenon, made as a starting point for further investigation.', example: 'The scientist tested her hypothesis through experimentation.' },
  'peninsula': { type: 'noun', def: 'A piece of land almost surrounded by water or projecting out into a body of water.', example: 'Italy is a well-known peninsula in Europe.' },
  'evolution': { type: 'noun', def: 'The process of gradual change and development over successive generations, through variation, mutation, and natural selection.', example: 'Darwin\'s theory of evolution transformed biology.' },
  'equation': { type: 'noun', def: 'A mathematical statement that two expressions are equal, connected by the equals sign (=).', example: '2x + 3 = 7 is a linear equation.' },
  'longitude': { type: 'noun', def: 'The angular distance of a place east or west of the Greenwich meridian, measured in degrees.', example: 'Nairobi is at approximately 36.8° East longitude.' },
  'latitude': { type: 'noun', def: 'The angular distance of a place north or south of the earth\'s equator, measured in degrees.', example: 'Kenya lies along the equator at 0° latitude.' },
  'erosion': { type: 'noun', def: 'The gradual wearing away of rock or soil by water, wind, or other natural agents.', example: 'Soil erosion can be prevented by planting trees.' },
  'parliament': { type: 'noun', def: 'The supreme legislative body of a country, typically consisting of elected representatives.', example: 'The Kenyan Parliament debates and passes laws.' },
  'renewable': { type: 'adjective', def: 'Relating to a natural resource or source of energy that is not depleted when used, such as water, wind, or solar power.', example: 'Solar energy is a renewable source of power.' },
};

function buildDictionaryTool() {
  const wordList = Object.keys(DICTIONARY_DATA).sort();
  return `<div class="p-6 max-w-2xl mx-auto">
    ${toolHeader('fas fa-book', 'Dawamu Dictionary', `${wordList.length} words available offline`)}

    <div class="flex gap-2 mb-6">
      <input id="dict-search" type="text" placeholder="Type a word to look up..." class="flex-1 bg-[#303134] text-white border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500">
      <button id="dict-btn" class="bg-[#389e3c] hover:bg-[#2e7d32] text-white font-bold px-5 py-2 rounded-xl text-sm">Look Up</button>
    </div>

    <div id="dict-result" class="mb-6"></div>

    <div class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Browse Words</div>
    <div class="flex flex-wrap gap-1.5">
      ${wordList.map(w => `<span class="bg-[#292a2d] text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-700/50 cursor-pointer hover:bg-[#389e3c] hover:text-white hover:border-emerald-700 transition-all" onclick="this.closest('.offline-tool').querySelector('#dict-search').value='${w}';this.closest('.offline-tool').querySelector('#dict-btn').click()">${w}</span>`).join('')}
    </div>
  </div>`;
}

/* ─── PERIODIC TABLE ─── */
function buildPeriodicTableTool() {
  const elements = [
    { n:1, s:'H', name:'Hydrogen', c:'text-sky-400' }, { n:2, s:'He', name:'Helium', c:'text-purple-400' },
    { n:3, s:'Li', name:'Lithium', c:'text-red-400' }, { n:4, s:'Be', name:'Beryllium', c:'text-amber-400' },
    { n:5, s:'B', name:'Boron', c:'text-green-400' }, { n:6, s:'C', name:'Carbon', c:'text-slate-300' },
    { n:7, s:'N', name:'Nitrogen', c:'text-sky-400' }, { n:8, s:'O', name:'Oxygen', c:'text-sky-400' },
    { n:9, s:'F', name:'Fluorine', c:'text-yellow-400' }, { n:10, s:'Ne', name:'Neon', c:'text-purple-400' },
    { n:11, s:'Na', name:'Sodium', c:'text-red-400' }, { n:12, s:'Mg', name:'Magnesium', c:'text-amber-400' },
    { n:13, s:'Al', name:'Aluminium', c:'text-green-400' }, { n:14, s:'Si', name:'Silicon', c:'text-green-400' },
    { n:15, s:'P', name:'Phosphorus', c:'text-sky-400' }, { n:16, s:'S', name:'Sulfur', c:'text-sky-400' },
    { n:17, s:'Cl', name:'Chlorine', c:'text-yellow-400' }, { n:18, s:'Ar', name:'Argon', c:'text-purple-400' },
    { n:19, s:'K', name:'Potassium', c:'text-red-400' }, { n:20, s:'Ca', name:'Calcium', c:'text-amber-400' },
    { n:26, s:'Fe', name:'Iron', c:'text-orange-400' }, { n:29, s:'Cu', name:'Copper', c:'text-orange-400' },
    { n:30, s:'Zn', name:'Zinc', c:'text-orange-400' }, { n:47, s:'Ag', name:'Silver', c:'text-orange-400' },
    { n:79, s:'Au', name:'Gold', c:'text-orange-400' }, { n:82, s:'Pb', name:'Lead', c:'text-green-400' },
    { n:92, s:'U', name:'Uranium', c:'text-pink-400' }, { n:118, s:'Og', name:'Oganesson', c:'text-purple-400' },
  ];

  return `<div class="p-6 max-w-3xl mx-auto">
    ${toolHeader('fas fa-atom', 'Periodic Table of Elements', '28 key elements available offline')}
    <div class="grid grid-cols-7 gap-2">
      ${elements.map(el => `
        <div class="bg-[#292a2d] border border-slate-700/50 rounded-xl p-2 text-center hover:bg-[#35363a] hover:border-emerald-700/50 transition-all cursor-default">
          <div class="text-[9px] text-slate-500">${el.n}</div>
          <div class="${el.c} text-xl font-bold">${el.s}</div>
          <div class="text-[9px] text-slate-400 truncate">${el.name}</div>
        </div>`).join('')}
    </div>
    <div class="mt-6 grid grid-cols-2 gap-3 text-xs">
      <div class="bg-[#292a2d] p-3 rounded-xl border border-slate-700/50"><b class="text-sky-400">Non-metals</b> <span class="text-slate-500">— H, C, N, O, P, S</span></div>
      <div class="bg-[#292a2d] p-3 rounded-xl border border-slate-700/50"><b class="text-red-400">Alkali Metals</b> <span class="text-slate-500">— Li, Na, K</span></div>
      <div class="bg-[#292a2d] p-3 rounded-xl border border-slate-700/50"><b class="text-orange-400">Transition Metals</b> <span class="text-slate-500">— Fe, Cu, Zn, Ag, Au</span></div>
      <div class="bg-[#292a2d] p-3 rounded-xl border border-slate-700/50"><b class="text-purple-400">Noble Gases</b> <span class="text-slate-500">— He, Ne, Ar</span></div>
    </div>
  </div>`;
}

/* ─── MATH REFERENCE ─── */
function buildMathTool() {
  return `<div class="p-6 max-w-2xl mx-auto">
    ${toolHeader('fas fa-calculator', 'Math Reference', 'Formulas, constants & identities')}
    <div class="space-y-4">
      <div class="bg-[#292a2d] p-4 rounded-2xl border border-slate-700/50">
        <h3 class="text-sm font-bold text-amber-400 mb-3"><i class="fas fa-shapes mr-2"></i>Geometry</h3>
        <div class="grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl"><b>Circle Area:</b> A = πr²</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl"><b>Circle Circumference:</b> C = 2πr</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl"><b>Rectangle Area:</b> A = l × w</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl"><b>Triangle Area:</b> A = ½bh</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl"><b>Sphere Volume:</b> V = ⁴⁄₃πr³</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl"><b>Cylinder Volume:</b> V = πr²h</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl"><b>Cone Volume:</b> V = ⅓πr²h</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl"><b>Pythagoras:</b> a² + b² = c²</div>
        </div>
      </div>

      <div class="bg-[#292a2d] p-4 rounded-2xl border border-slate-700/50">
        <h3 class="text-sm font-bold text-sky-400 mb-3"><i class="fas fa-superscript mr-2"></i>Algebra</h3>
        <div class="grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl"><b>Quadratic:</b> x = (-b ± √(b²-4ac)) / 2a</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl"><b>Slope:</b> m = (y₂-y₁)/(x₂-x₁)</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl"><b>Distance:</b> d = √((x₂-x₁)² + (y₂-y₁)²)</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl"><b>Midpoint:</b> M = ((x₁+x₂)/2, (y₁+y₂)/2)</div>
        </div>
      </div>

      <div class="bg-[#292a2d] p-4 rounded-2xl border border-slate-700/50">
        <h3 class="text-sm font-bold text-emerald-400 mb-3"><i class="fas fa-wave-square mr-2"></i>Trigonometry</h3>
        <div class="grid grid-cols-3 gap-2 text-xs text-slate-300">
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl text-center"><b>sin θ</b> = opp/hyp</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl text-center"><b>cos θ</b> = adj/hyp</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl text-center"><b>tan θ</b> = opp/adj</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl text-center"><b>sin²θ + cos²θ</b> = 1</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl text-center"><b>π radians</b> = 180°</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl text-center"><b>tan θ</b> = sin θ/cos θ</div>
        </div>
      </div>

      <div class="bg-[#292a2d] p-4 rounded-2xl border border-slate-700/50">
        <h3 class="text-sm font-bold text-purple-400 mb-3"><i class="fas fa-infinity mr-2"></i>Constants</h3>
        <div class="grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl"><b>π</b> = 3.14159265...</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl"><b>e</b> = 2.71828182...</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl"><b>√2</b> = 1.41421356...</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl"><b>Speed of Light</b> = 3×10⁸ m/s</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl"><b>Gravity (g)</b> = 9.81 m/s²</div>
          <div class="bg-[#1a1b1e] p-2.5 rounded-xl"><b>Avogadro's</b> = 6.022×10²³</div>
        </div>
      </div>
    </div>
  </div>`;
}

/* ─── NOTES ─── */
function buildNotesTool() {
  return `<div class="p-6 max-w-2xl mx-auto h-full flex flex-col">
    ${toolHeader('fas fa-sticky-note', 'Quick Notes', 'Auto-saves to your device')}
    <textarea id="offline-notepad" class="flex-1 bg-[#292a2d] text-slate-200 border border-slate-700/50 rounded-2xl p-4 text-sm outline-none resize-none focus:border-emerald-500 min-h-[300px] font-mono leading-relaxed" placeholder="Start typing your notes here... They save automatically."></textarea>
    <div class="text-[10px] text-slate-600 mt-2 flex items-center gap-1"><i class="fas fa-save"></i> Auto-saved to device storage</div>
  </div>`;
}

/* ─── WORLD HISTORY ─── */
function buildHistoryTool() {
  const events = [
    { year: '3000 BC', event: 'Ancient Egyptian civilization flourishes along the Nile', region: 'Africa' },
    { year: '776 BC', event: 'First Olympic Games held in Olympia, Greece', region: 'Europe' },
    { year: '27 BC', event: 'Roman Empire established under Augustus Caesar', region: 'Europe' },
    { year: '622 AD', event: 'The Hijra — Prophet Muhammad migrates to Medina', region: 'Middle East' },
    { year: '1000 AD', event: 'Great Zimbabwe city built in Southern Africa', region: 'Africa' },
    { year: '1215', event: 'Magna Carta signed, limiting the power of the King of England', region: 'Europe' },
    { year: '1453', event: 'Fall of Constantinople, end of the Byzantine Empire', region: 'Europe' },
    { year: '1492', event: 'Christopher Columbus reaches the Americas', region: 'Americas' },
    { year: '1776', event: 'American Declaration of Independence signed', region: 'Americas' },
    { year: '1789', event: 'French Revolution begins', region: 'Europe' },
    { year: '1884', event: 'Berlin Conference — European powers partition Africa', region: 'Africa' },
    { year: '1914', event: 'World War I begins', region: 'Global' },
    { year: '1939', event: 'World War II begins', region: 'Global' },
    { year: '1945', event: 'United Nations founded; atomic bombs dropped on Japan', region: 'Global' },
    { year: '1957', event: 'Ghana becomes the first sub-Saharan African country to gain independence', region: 'Africa' },
    { year: '1963', event: 'Kenya gains independence from Britain under Jomo Kenyatta', region: 'Africa' },
    { year: '1969', event: 'Apollo 11 — first humans land on the Moon', region: 'Global' },
    { year: '1989', event: 'Fall of the Berlin Wall', region: 'Europe' },
    { year: '1994', event: 'End of Apartheid in South Africa — Nelson Mandela elected President', region: 'Africa' },
    { year: '2010', event: 'Kenya promulgates new Constitution', region: 'Africa' },
  ];

  const regionColors = { 'Africa': 'text-emerald-400', 'Europe': 'text-sky-400', 'Americas': 'text-amber-400', 'Middle East': 'text-orange-400', 'Global': 'text-purple-400' };

  return `<div class="p-6 max-w-2xl mx-auto">
    ${toolHeader('fas fa-landmark', 'World History Timeline', `${events.length} key events`)}
    <div class="space-y-2">
      ${events.map(e => `
        <div class="flex items-start gap-3 bg-[#292a2d] p-3 rounded-xl border border-slate-700/50 hover:bg-[#35363a] transition-colors">
          <div class="bg-[#1a1b1e] text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg min-w-[70px] text-center shrink-0">${e.year}</div>
          <div class="flex-1">
            <div class="text-sm text-slate-200">${e.event}</div>
            <div class="text-[10px] ${regionColors[e.region] || 'text-slate-500'} mt-0.5 font-semibold">${e.region}</div>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
}
