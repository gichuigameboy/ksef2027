/**
 * Dawamu OS - Ultra-Fast School Browser with Offline Support
 *
 * KEY DESIGN:
 * - Each tab has ONE persistent <webview> (in Electron) or sandboxed proxy <iframe> (in Web mode).
 * - Navigation just sets webview/iframe.src — no renderer process respawning.
 * - Start Page is a lightweight HTML overlay shown ON TOP of the webview.
 * - Encached Curriculum Knowledgebase: 30+ KCSE offline articles, Wikipedia portals,
 *   Khan Academy STEM lessons, NASA space guides, and offline educational search.
 * - In Web Mode, external web requests route through EduGuard Safe Proxy (port 8000),
 *   bypassing X-Frame-Options blocks while enforcing school safety filters.
 * - Persistent session partition = cached DNS + SSL across all tabs.
 * - All student restriction enforcement runs before any navigation fires.
 */

import { restrictionManager } from '../os/restrictionManager.js';
import { stateStore } from '../os/state.js';
import { dawamuDialogs } from '../os/dialogs.js';
import { OFFLINE_ARTICLES, STUDY_QUIZZES } from './offlineContent.js';
import { OFFLINE_WEB_DB } from './offlineBrowser.js';

const IS_ELECTRON = !!(window.electronAPI && window.electronAPI.isElectron);

const ENGINES = {
  google: { url: 'https://www.google.com/search?q=', home: 'https://www.google.com' },
  bing:   { url: 'https://www.bing.com/search?q=',   home: 'https://www.bing.com' },
  brave:  { url: 'https://search.brave.com/search?q=', home: 'https://search.brave.com' },
};

let engine = 'google';

const BOOKMARKS = [
  { label: 'Google',       icon: 'fab fa-google text-blue-400',           url: 'https://www.google.com' },
  { label: 'Wikipedia',    icon: 'fab fa-wikipedia-w text-slate-200',     url: 'https://www.wikipedia.org' },
  { label: 'Khan Academy', icon: 'fas fa-leaf text-emerald-400',           url: 'https://www.khanacademy.org' },
  { label: 'NASA Space',   icon: 'fas fa-rocket text-rose-400',           url: 'https://www.nasa.gov' },
  { label: 'Math Is Fun',  icon: 'fas fa-square-root-alt text-amber-400',  url: 'https://www.mathsisfun.com' },
  { label: 'Brave Safe',   icon: 'fas fa-shield-alt text-amber-500',       url: 'https://search.brave.com' },
];

/* ─── TAB STATE ─── */
let tabs = [];
let activeTabId = null;
let tabCounter = 0;
let isOnline = navigator.onLine;

function newTab(url = null) {
  const id = ++tabCounter;
  tabs.push({ id, url, title: 'New Tab', loading: false, history: url ? [url] : [], historyIdx: url ? 0 : -1 });
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

function isOfflineTool(url) { return url && url.startsWith('dawamu://') && !url.startsWith('dawamu://search'); }

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ═══════════════════════════════════════════════════
   OFFLINE KNOWLEDGEBASE & PORTAL RESOLUTION
═══════════════════════════════════════════════════ */
function findOfflineArticleOrPage(url) {
  if (!url) return null;
  const clean = url.trim();

  const db = (typeof OFFLINE_WEB_DB !== 'undefined') ? OFFLINE_WEB_DB : {};
  const art = (typeof OFFLINE_ARTICLES !== 'undefined') ? OFFLINE_ARTICLES : {};

  // Exact match
  if (db[clean]) return db[clean];
  if (art[clean]) return art[clean];

  // Match without trailing slash
  const noSlash = clean.replace(/\/$/, '');
  if (db[noSlash]) return db[noSlash];
  if (art[noSlash]) return art[noSlash];

  // Match https vs http
  const withHttps = clean.replace(/^http:\/\//, 'https://');
  if (db[withHttps]) return db[withHttps];
  if (art[withHttps]) return art[withHttps];

  // Match Wikipedia Portals
  if (clean === 'https://www.wikipedia.org' || clean === 'https://www.wikipedia.org/' ||
      clean === 'https://en.wikipedia.org' || clean === 'https://en.wikipedia.org/' ||
      clean === 'http://www.wikipedia.org' || clean === 'http://en.wikipedia.org') {
    return {
      title: 'Wikipedia - Educational Library',
      render: renderWikipediaPortal
    };
  }

  // Match Khan Academy Portal
  if (clean === 'https://www.khanacademy.org' || clean === 'https://www.khanacademy.org/' ||
      clean === 'https://khanacademy.org' || clean === 'http://www.khanacademy.org') {
    return {
      title: 'Khan Academy - Secondary Curriculum Hub',
      render: renderKhanAcademyPortal
    };
  }

  // Match NASA Space Exploration Portal
  if (clean === 'https://www.nasa.gov' || clean === 'https://www.nasa.gov/' ||
      clean === 'https://nasa.gov' || clean === 'http://www.nasa.gov') {
    return {
      title: 'NASA Space Exploration Hub',
      render: renderNasaPortal
    };
  }

  // Match path slug (e.g. /wiki/Cell_biology)
  try {
    const parsed = new URL(clean.startsWith('http') ? clean : 'https://' + clean);
    const pathSlug = parsed.pathname.toLowerCase().replace(/\/$/, '');
    if (pathSlug && pathSlug.length > 2) {
      const combined = { ...db, ...art };
      for (const [key, item] of Object.entries(combined)) {
        try {
          const itemUrl = new URL(key);
          if (itemUrl.pathname.toLowerCase().replace(/\/$/, '') === pathSlug) {
            return item;
          }
        } catch (_) {}
      }
    }
  } catch (_) {}

  return null;
}

function searchAllOfflineArticles(query) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  const combined = {
    ...(typeof OFFLINE_WEB_DB !== 'undefined' ? OFFLINE_WEB_DB : {}),
    ...(typeof OFFLINE_ARTICLES !== 'undefined' ? OFFLINE_ARTICLES : {})
  };

  const results = [];
  for (const [url, item] of Object.entries(combined)) {
    if (url === 'dawamu://home' || url === 'dawamu://search') continue;
    let score = 0;
    const title = (item.title || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    const sum = (item.summary || '').toLowerCase();
    const u = url.toLowerCase();

    for (const term of terms) {
      if (title.includes(term)) score += 6;
      if (cat.includes(term)) score += 3;
      if (sum.includes(term)) score += 2;
      if (u.includes(term)) score += 2;
    }

    if (score > 0) {
      results.push({
        url,
        title: item.title || urlTitle(url),
        category: item.category || 'Curriculum',
        summary: item.summary || 'Verified KCSE syllabus revision resource.',
        score
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

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
             placeholder="Search Google, Wikipedia, or enter URL...">
      <div class="flex items-center gap-1.5 shrink-0">
        <span class="text-[9px] bg-emerald-950/90 text-emerald-300 border border-emerald-600/50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          SAFE
        </span>
      </div>
    </div>

    <!-- Save Page & Downloads Drawer Button -->
    <button id="btn-save-page" class="px-2.5 h-[30px] rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 hover:text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shrink-0" title="Save Current Web Page to This PC > Downloads"><i class="fas fa-file-download text-xs"></i><span>Save Page</span></button>
    <button id="btn-downloads" class="nb relative" title="Downloads (Stored in This PC > Downloads)">
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
    .offline-article-body { color:#e2e8f0; line-height:1.7; }
    .offline-article-body a { color:#38bdf8; text-decoration:underline; }
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

  // 1. External website sandbox diagnostic banner (rendered at the top of tab)
  const banner = document.createElement('div');
  banner.id = `ext-banner-${tabId}`;
  banner.className = 'hidden shrink-0 z-20';
  wrap.appendChild(banner);

  // 2. Main web renderer (webview in Electron, iframe in Web mode)
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
    fr.style.cssText = 'flex: 1 1 0%; width: 100%; height: 100%; border: none; display: block;';
    fr.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals';
    fr.allow = 'fullscreen';
    fr.addEventListener('load', () => progress(root, tabId, false));
    wrap.appendChild(fr);
  }

  // 3. Offline tool / article overlay (absolute overlay for dawamu:// and offline articles)
  const toolOverlay = document.createElement('div');
  toolOverlay.id = `ot-${tabId}`;
  toolOverlay.className = 'offline-tool hidden';
  wrap.appendChild(toolOverlay);

  // 4. Start page overlay
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
    const access = restrictionManager.checkUrlAccess(e.url);
    if (!access.allowed) {
      try { wv.stop(); } catch (_) {}
      showBlock(root, tabId, e.url, access.reason);
    }
  });

  // Security: Intercept popup/new-window attempts inside the webview
  wv.addEventListener('new-window', e => {
    e.preventDefault();
    const targetUrl = e.url;
    if (targetUrl) {
      const access = restrictionManager.checkUrlAccess(targetUrl);
      if (access.allowed) {
        openTab(root, targetUrl);
      } else {
        showBlock(root, tabId, targetUrl, access.reason);
      }
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
function loadUrl(root, tabId, url, pushHistory = true) {
  // 1. Internal dawamu:// URLs (always offline tools)
  if (isOfflineTool(url)) {
    showOfflineTool(root, tabId, url);
    return;
  }

  // 2. Search query route
  if (url.startsWith('dawamu://search')) {
    const q = decodeURIComponent(url.split('?q=')[1] || '').trim();
    showSearchResults(root, tabId, q);
    return;
  }

  // 3. Offline Encyclopedia / Educational Article match
  const offlineMatch = findOfflineArticleOrPage(url);
  if (offlineMatch) {
    showOfflineArticle(root, tabId, url, offlineMatch);
    return;
  }

  // 4. Policy Access Check (Restrictions, Blocklists, Curfew)
  const access = restrictionManager.checkUrlAccess(url);
  if (!access.allowed) {
    showBlock(root, tabId, url, access.reason);
    return;
  }

  // 5. Offline network check
  if (!navigator.onLine) {
    showOfflineTool(root, tabId, 'dawamu://offline', url);
    return;
  }

  // 6. Online Live Web Browsing
  root.querySelector(`#sp-${tabId}`)?.classList.add('hidden');
  root.querySelector(`#ot-${tabId}`)?.classList.add('hidden');

  const tab = tabs.find(t => t.id === tabId);
  if (tab) {
    tab.url = url;
    tab.title = urlTitle(url);
    if (!tab.history) { tab.history = []; tab.historyIdx = -1; }
    if (pushHistory) {
      tab.history = tab.history.slice(0, tab.historyIdx + 1);
      tab.history.push(url);
      tab.historyIdx = tab.history.length - 1;
    }
  }

  const banner = root.querySelector(`#ext-banner-${tabId}`);

  if (IS_ELECTRON) {
    // Native Electron <webview>
    const wv = root.querySelector(`#wv-${tabId}`);
    if (wv) {
      wv.classList.remove('hidden');
      wv.src = url;
    }
    banner?.classList.add('hidden');
  } else {
    // Web Application Mode (Chrome / Edge / Safari / Browser)
    const fr = root.querySelector(`#wv-${tabId}`);
    if (fr) {
      fr.classList.remove('hidden');
      // Route through local EduGuard Safe Proxy on port 8000
      const proxyUrl = `http://127.0.0.1:8000/api/v1/proxy?url=${encodeURIComponent(url)}`;
      fr.src = proxyUrl;
    }

    if (banner) {
      try {
        const parsed = new URL(url);
        banner.innerHTML = `
          <div class="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-900/95 border-b border-emerald-500/30 text-slate-300">
            <span class="flex items-center gap-2 truncate">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-white font-semibold">${parsed.hostname}</span>
              <span class="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/40 px-2 py-0.5 rounded-full font-mono">Safe Web Active</span>
            </span>
            <div class="flex items-center gap-2 shrink-0">
              <button class="ext-wiki-btn px-2.5 py-1 rounded-lg bg-emerald-900/50 hover:bg-emerald-800 text-emerald-300 hover:text-white font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition-all">
                <i class="fas fa-book-open"></i> Offline Library
              </button>
              <button class="ext-open-btn px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-sm">
                <i class="fas fa-external-link-alt"></i> Open in External Window
              </button>
            </div>
          </div>
        `;
        banner.classList.remove('hidden');
        banner.querySelector('.ext-open-btn')?.addEventListener('click', (e) => {
          e.stopPropagation();
          window.open(url, '_blank');
        });
        banner.querySelector('.ext-wiki-btn')?.addEventListener('click', (e) => {
          e.stopPropagation();
          loadUrl(root, tabId, 'https://www.wikipedia.org');
        });
      } catch (_) {
        banner.classList.add('hidden');
      }
    }
  }

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

  // Check if it matches an offline educational article or topic
  if (findOfflineArticleOrPage(url)) {
    loadUrl(root, tabId, url);
    return;
  }

  // Check if it's a URL (contains a dot with no spaces, or starts with http:// or https://)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (/\.\w{2,}/.test(url) && !url.includes(' ')) {
      url = 'https://' + url;
    } else {
      // It's a search query! Check policy
      const q = restrictionManager.inspectSearchQuery(url);
      if (!q.safe) { showBlock(root, tabId, url, q.reason); return; }

      loadUrl(root, tabId, `dawamu://search?q=${encodeURIComponent(url)}`);
      return;
    }
  }

  loadUrl(root, tabId, url);
}

/* ═══════════════════════════════════════════════════
   OFFLINE ARTICLE & SEARCH RENDERING
═══════════════════════════════════════════════════ */
function showOfflineArticle(root, tabId, url, article) {
  progress(root, tabId, false);
  root.querySelector(`#sp-${tabId}`)?.classList.add('hidden');
  root.querySelector(`#ext-banner-${tabId}`)?.classList.add('hidden');
  const view = root.querySelector(`#wv-${tabId}`);
  if (view) view.classList.add('hidden');

  const toolOverlay = root.querySelector(`#ot-${tabId}`);
  if (!toolOverlay) return;

  const contentHtml = typeof article.render === 'function' ? article.render() : article.render;
  toolOverlay.innerHTML = `
    <div class="p-6 max-w-4xl mx-auto">
      <div class="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs">
        <div class="flex items-center gap-2 truncate">
          <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
          <span class="text-emerald-400 font-bold uppercase text-[10px] tracking-wider font-mono shrink-0">Encached Resource</span>
          <span class="text-slate-500 font-mono text-[11px] truncate">${escapeHtml(url)}</span>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button class="art-back-btn px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-semibold cursor-pointer">
            <i class="fas fa-home mr-1"></i> Start
          </button>
          <a href="${url}" target="_blank" class="px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-[11px] font-semibold transition-all">
            <i class="fas fa-external-link-alt mr-1"></i> External
          </a>
        </div>
      </div>
      <div class="offline-article-body">
        ${contentHtml}
      </div>
    </div>
  `;
  toolOverlay.classList.remove('hidden');

  // Wire links inside the rendered article
  toolOverlay.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href && !href.startsWith('#') && a.getAttribute('target') !== '_blank') {
        e.preventDefault();
        loadUrl(root, tabId, href);
      }
    });
  });

  toolOverlay.querySelector('.art-back-btn')?.addEventListener('click', () => {
    showStartPage(root, tabId);
  });

  const tab = tabs.find(t => t.id === tabId);
  if (tab) {
    tab.url = url;
    tab.title = article.title || 'Educational Resource';
  }
  if (tabId === activeTabId) root.querySelector('#omnibox').value = url;
  renderTabStrip(root);
}

function showSearchResults(root, tabId, query) {
  progress(root, tabId, false);
  root.querySelector(`#sp-${tabId}`)?.classList.add('hidden');
  root.querySelector(`#ext-banner-${tabId}`)?.classList.add('hidden');
  const view = root.querySelector(`#wv-${tabId}`);
  if (view) view.classList.add('hidden');

  const toolOverlay = root.querySelector(`#ot-${tabId}`);
  if (!toolOverlay) return;

  const results = searchAllOfflineArticles(query);
  const liveEngineUrl = ENGINES[engine].url + encodeURIComponent(query);

  toolOverlay.innerHTML = `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <div class="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <div class="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">Dawamu Safe Search</div>
          <h2 class="text-xl font-bold text-white mt-0.5">Results for: <span class="text-emerald-400">"${escapeHtml(query)}"</span></h2>
        </div>
        <div class="text-xs text-slate-400 font-mono">${results.length} verified curriculum matches</div>
      </div>

      <!-- Quick Action: Search Live Web via Safe Proxy / Webview -->
      <div class="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 p-4 rounded-2xl flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-lg">
            <i class="fas fa-globe"></i>
          </div>
          <div>
            <div class="text-xs font-bold text-white">Live Safe Web Search</div>
            <div class="text-[11px] text-slate-400">Query Google / Bing with automated school policy & SafeSearch filtering</div>
          </div>
        </div>
        <button id="srch-live-btn" class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl shrink-0 transition-all cursor-pointer shadow-md">
          Search Live Web &rarr;
        </button>
      </div>

      <!-- Offline Matched Articles List -->
      ${results.length === 0 ? `
        <div class="bg-slate-900/60 p-8 rounded-2xl text-center space-y-3 border border-slate-800">
          <i class="fas fa-search text-3xl text-slate-600"></i>
          <h3 class="text-sm font-bold text-white">No local curriculum match for "${escapeHtml(query)}"</h3>
          <p class="text-xs text-slate-400 max-w-md mx-auto">
            Try searching for fundamental topics like <b>Photosynthesis</b>, <b>Cell Biology</b>, <b>History of Kenya</b>, <b>Solar System</b>, <b>Electricity</b>, or <b>Algebra</b>.
          </p>
        </div>
      ` : `
        <div class="space-y-3">
          ${results.map(r => `
            <div class="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer srch-result-card" data-url="${r.url}">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">${r.category || 'Curriculum'}</span>
                <span class="text-[10px] text-slate-400 font-mono truncate">${r.url}</span>
              </div>
              <h3 class="text-sm font-bold text-white group-hover:text-emerald-400">${r.title}</h3>
              <p class="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">${r.summary || 'Click to view the complete lesson and curriculum article.'}</p>
            </div>
          `).join('')}
        </div>
      `}

      <div class="pt-4 border-t border-white/10 flex justify-between items-center text-xs">
        <button id="srch-home-btn" class="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
          <i class="fas fa-home"></i> Return to Browser Start Page
        </button>
        <span class="text-[10px] text-emerald-400 font-mono">Protected Student Session</span>
      </div>
    </div>
  `;
  toolOverlay.classList.remove('hidden');

  toolOverlay.querySelector('#srch-live-btn')?.addEventListener('click', () => {
    loadUrl(root, tabId, liveEngineUrl);
  });
  toolOverlay.querySelector('#srch-home-btn')?.addEventListener('click', () => {
    showStartPage(root, tabId);
  });
  toolOverlay.querySelectorAll('.srch-result-card').forEach(card => {
    card.addEventListener('click', () => {
      loadUrl(root, tabId, card.dataset.url);
    });
  });

  const tab = tabs.find(t => t.id === tabId);
  if (tab) {
    tab.url = `dawamu://search?q=${encodeURIComponent(query)}`;
    tab.title = `Search: ${query}`;
  }
  if (tabId === activeTabId) root.querySelector('#omnibox').value = query;
  renderTabStrip(root);
}

/* ═══════════════════════════════════════════════════
   EDUCATIONAL PORTALS (WIKIPEDIA, KHAN, NASA)
═══════════════════════════════════════════════════ */
function renderWikipediaPortal() {
  const articles = [
    { title: 'Photosynthesis', cat: 'Biology', url: 'https://en.wikipedia.org/wiki/Photosynthesis', desc: 'Light-dependent reactions, Calvin cycle & chemical equation.', icon: 'fa-leaf text-emerald-400' },
    { title: 'Cell Biology', cat: 'Biology', url: 'https://en.wikipedia.org/wiki/Cell_biology', desc: 'Cellular ultrastructure, organelles, membranes & mitosis.', icon: 'fa-dna text-teal-400' },
    { title: 'Circulatory System', cat: 'Biology', url: 'https://en.wikipedia.org/wiki/Circulatory_system', desc: 'Heart anatomy, pulmonary circulation & blood vessels.', icon: 'fa-heart-pulse text-rose-400' },
    { title: 'History of Kenya', cat: 'History', url: 'https://en.wikipedia.org/wiki/History_of_Kenya', desc: 'From Cradle of Humankind to 1963 Independence & 2010 Constitution.', icon: 'fa-landmark text-amber-400' },
    { title: 'Constitution of Kenya', cat: 'Government', url: 'https://en.wikipedia.org/wiki/Constitution_of_Kenya', desc: 'Bill of Rights, devolution & governance structure.', icon: 'fa-scale-balanced text-yellow-400' },
    { title: 'Solar System', cat: 'Astronomy', url: 'https://en.wikipedia.org/wiki/Solar_System', desc: 'Planetary mechanics, inner/outer planets & orbital laws.', icon: 'fa-sun text-orange-400' },
    { title: 'Electricity & Ohm\'s Law', cat: 'Physics', url: 'https://en.wikipedia.org/wiki/Electricity', desc: 'Charge, voltage, current, resistance & series/parallel circuits.', icon: 'fa-bolt text-yellow-400' },
    { title: 'Periodic Table & Trends', cat: 'Chemistry', url: 'https://en.wikipedia.org/wiki/Periodic_table', desc: 'Electronegativity, ionization energy & atomic radii trends.', icon: 'fa-atom text-purple-400' },
    { title: 'Chemical Bonding', cat: 'Chemistry', url: 'https://en.wikipedia.org/wiki/Chemical_bonding', desc: 'Ionic, covalent, metallic & hydrogen bonding.', icon: 'fa-flask text-sky-400' },
    { title: 'Plate Tectonics & Rift Valley', cat: 'Geography', url: 'https://en.wikipedia.org/wiki/Plate_tectonics', desc: 'Continental drift, faulting & East African Rift System.', icon: 'fa-mountain text-emerald-400' },
    { title: 'Computer Programming', cat: 'Computer Science', url: 'https://en.wikipedia.org/wiki/Computer_programming', desc: 'Logic, data structures, variables & control flow.', icon: 'fa-code text-blue-400' },
    { title: 'Algorithms & Big-O', cat: 'Computer Science', url: 'https://en.wikipedia.org/wiki/Algorithms_and_complexity', desc: 'Searching, sorting & computational complexity.', icon: 'fa-network-wired text-indigo-400' },
  ];

  return `
    <div class="max-w-4xl mx-auto py-8 px-4 font-sans">
      <div class="border-b border-white/10 pb-5 mb-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl text-slate-100">
            <i class="fab fa-wikipedia-w"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-white">Wikipedia Educational Library</h1>
            <p class="text-xs text-slate-400">Curated, syllabus-aligned encyclopedia articles for secondary school studies</p>
          </div>
        </div>
        <span class="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-2.5 py-1 rounded-full font-bold">100% Offline Ready</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        ${articles.map(a => `
          <a href="${a.url}" class="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/40 transition-all flex items-start gap-3.5 no-underline group">
            <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
              <i class="fas ${a.icon}"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-0.5">
                <span class="text-[9px] font-bold uppercase tracking-wider text-emerald-400 font-mono">${a.cat}</span>
              </div>
              <h3 class="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">${a.title}</h3>
              <p class="text-xs text-slate-400 mt-1 leading-relaxed">${a.desc}</p>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

function renderKhanAcademyPortal() {
  const courses = [
    { title: 'Algebra & Linear Equations', cat: 'Mathematics', url: 'https://www.khanacademy.org/math/algebra', desc: 'Equations, inequalities, quadratic formula & systems.', icon: 'fa-square-root-alt text-amber-400' },
    { title: 'High School Physics', cat: 'Physics', url: 'https://www.khanacademy.org/science/physics', desc: 'Kinematics, forces, energy, momentum & waves.', icon: 'fa-wave-square text-cyan-400' },
    { title: 'Plane Geometry & Trigonometry', cat: 'Mathematics', url: 'https://en.wikipedia.org/wiki/Plane_geometry', desc: 'Circles, polygons, Pythagoras theorem & trigonometric ratios.', icon: 'fa-shapes text-emerald-400' },
    { title: 'Differential Calculus', cat: 'Mathematics', url: 'https://en.wikipedia.org/wiki/Differential_calculus', desc: 'Limits, derivatives, rate of change & tangents.', icon: 'fa-chart-line text-purple-400' },
    { title: 'Acids, Bases & pH Calculations', cat: 'Chemistry', url: 'https://en.wikipedia.org/wiki/Acids_and_bases', desc: 'Bronsted-Lowry, titration & pH scale.', icon: 'fa-flask text-rose-400' },
  ];

  return `
    <div class="max-w-4xl mx-auto py-8 px-4 font-sans">
      <div class="border-b border-white/10 pb-5 mb-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl">
            <i class="fas fa-leaf"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-white">Khan Academy KCSE Revision Hub</h1>
            <p class="text-xs text-slate-400">Interactive STEM lessons, problem solving & step-by-step masteries</p>
          </div>
        </div>
        <span class="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-2.5 py-1 rounded-full font-bold">Verified Academic</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        ${courses.map(c => `
          <a href="${c.url}" class="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/40 transition-all flex items-start gap-3.5 no-underline group">
            <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
              <i class="fas ${c.icon}"></i>
            </div>
            <div>
              <span class="text-[9px] font-bold uppercase tracking-wider text-emerald-400 font-mono">${c.cat}</span>
              <h3 class="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">${c.title}</h3>
              <p class="text-xs text-slate-400 mt-1 leading-relaxed">${c.desc}</p>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

function renderNasaPortal() {
  return `
    <div class="max-w-4xl mx-auto py-8 px-4 font-sans">
      <div class="border-b border-white/10 pb-5 mb-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl">
            <i class="fas fa-rocket"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-white">NASA Space Exploration Center</h1>
            <p class="text-xs text-slate-400">Solar system exploration, planetary science, and Mars rover missions</p>
          </div>
        </div>
        <span class="text-[10px] bg-rose-950 text-rose-300 border border-rose-700/50 px-2.5 py-1 rounded-full font-bold">NASA Science</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <a href="https://www.nasa.gov/mars" class="p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-800/40 hover:border-rose-500 transition-all flex items-start gap-3.5 no-underline group">
          <div class="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
            <i class="fas fa-satellite"></i>
          </div>
          <div>
            <span class="text-[9px] font-bold uppercase text-rose-400 font-mono">Mission to Mars</span>
            <h3 class="text-base font-bold text-white group-hover:text-rose-300">Mars Exploration Rover & Perseverance</h3>
            <p class="text-xs text-slate-400 mt-1">Geology, atmospheric composition, biosignatures, and the search for ancient water.</p>
          </div>
        </a>

        <a href="https://en.wikipedia.org/wiki/Solar_System" class="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-800/40 hover:border-indigo-500 transition-all flex items-start gap-3.5 no-underline group">
          <div class="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
            <i class="fas fa-sun"></i>
          </div>
          <div>
            <span class="text-[9px] font-bold uppercase text-indigo-400 font-mono">Astronomy</span>
            <h3 class="text-base font-bold text-white group-hover:text-indigo-300">The Solar System</h3>
            <p class="text-xs text-slate-400 mt-1">Eight planets, orbital mechanics, asteroid belts, and gravitational physics.</p>
          </div>
        </a>
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════
   OFFLINE TOOL RENDERER
═══════════════════════════════════════════════════ */
function showOfflineTool(root, tabId, toolUrl, failedUrl = '') {
  progress(root, tabId, false);
  root.querySelector(`#sp-${tabId}`)?.classList.add('hidden');
  root.querySelector(`#ext-banner-${tabId}`)?.classList.add('hidden');
  const view = root.querySelector(`#wv-${tabId}`);
  if (view) view.classList.add('hidden');

  const toolOverlay = root.querySelector(`#ot-${tabId}`);
  if (!toolOverlay) return;

  const tool = OFFLINE_TOOLS[toolUrl] || OFFLINE_TOOLS['dawamu://offline'];
  toolOverlay.innerHTML = tool.builder(root, tabId, failedUrl);
  toolOverlay.classList.remove('hidden');

  wireOfflineToolEvents(root, tabId, toolOverlay, toolUrl);

  const tab = tabs.find(t => t.id === tabId);
  if (tab) { tab.url = toolUrl; tab.title = tool.title; }
  if (tabId === activeTabId) root.querySelector('#omnibox').value = toolUrl;
  renderTabStrip(root);
}

function wireOfflineToolEvents(root, tabId, container, toolUrl) {
  // Wire links inside container so navigation works
  container.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href && !href.startsWith('#') && a.getAttribute('target') !== '_blank') {
        e.preventDefault();
        loadUrl(root, tabId, href);
      }
    });
  });

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
  root.querySelector(`#ext-banner-${tabId}`)?.classList.add('hidden');
  const view = root.querySelector(`#wv-${tabId}`);
  if (view) view.classList.add('hidden');

  overlay.classList.remove('hidden');
  overlay.innerHTML = `
    <div class="max-w-lg w-full bg-[#292a2d] border border-rose-500/40 rounded-3xl p-8 text-center space-y-5 shadow-2xl mx-4">
      <div class="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto text-3xl border border-rose-500/30">
        <i class="fas fa-shield-alt"></i>
      </div>
      <h2 class="text-lg font-bold text-white">Access Restricted</h2>
      <p class="text-slate-400 text-sm">${reason || 'Blocked by school administrator policy.'}</p>
      <div class="bg-[#1a1b1e] p-3 rounded-2xl font-mono text-xs text-rose-300 text-left space-y-1">
        <div><b class="text-slate-400">URL:</b> ${escapeHtml(blockedUrl)}</div>
        <div><b class="text-slate-400">Filter:</b> Dawamu Network Safety Policy</div>
      </div>
      <div class="flex justify-center gap-3">
        <button data-home class="bg-[#059669] hover:bg-[#10b981] text-white text-xs font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-all">Return to Browser Home</button>
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
  root.querySelector(`#ext-banner-${tabId}`)?.classList.add('hidden');
  const view = root.querySelector(`#wv-${tabId}`);
  if (view) view.classList.add('hidden');
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
  <div class="flex flex-col items-center justify-center min-h-full p-8 text-center space-y-4 overflow-y-auto max-w-3xl mx-auto">
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
             placeholder="Search Google, Wikipedia, or enter curriculum topic..."
             autofocus>
      <button id="sp-btn-${tabId}" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-5 py-2 rounded-xl ml-2 shrink-0 shadow-md transition-all active:scale-95 cursor-pointer">Search</button>
    </div>

    <!-- Curriculum Fast-Access Chips -->
    <div class="w-full max-w-xl flex items-center justify-center gap-1.5 flex-wrap pt-0.5">
      <button class="topic-chip px-2.5 py-1 rounded-full bg-white/5 hover:bg-emerald-900/60 border border-white/10 hover:border-emerald-500/50 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer" data-url="https://en.wikipedia.org/wiki/Photosynthesis">🌿 Photosynthesis</button>
      <button class="topic-chip px-2.5 py-1 rounded-full bg-white/5 hover:bg-emerald-900/60 border border-white/10 hover:border-emerald-500/50 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer" data-url="https://en.wikipedia.org/wiki/Cell_biology">🧬 Cell Biology</button>
      <button class="topic-chip px-2.5 py-1 rounded-full bg-white/5 hover:bg-emerald-900/60 border border-white/10 hover:border-emerald-500/50 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer" data-url="https://en.wikipedia.org/wiki/History_of_Kenya">🇰🇪 Kenya History</button>
      <button class="topic-chip px-2.5 py-1 rounded-full bg-white/5 hover:bg-emerald-900/60 border border-white/10 hover:border-emerald-500/50 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer" data-url="https://www.khanacademy.org/math/algebra">📐 Algebra</button>
      <button class="topic-chip px-2.5 py-1 rounded-full bg-white/5 hover:bg-emerald-900/60 border border-white/10 hover:border-emerald-500/50 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer" data-url="https://en.wikipedia.org/wiki/Electricity">⚡ Ohm's Law</button>
      <button class="topic-chip px-2.5 py-1 rounded-full bg-white/5 hover:bg-emerald-900/60 border border-white/10 hover:border-emerald-500/50 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer" data-url="https://www.nasa.gov/mars">🚀 NASA Mars</button>
      <button class="topic-chip px-2.5 py-1 rounded-full bg-white/5 hover:bg-emerald-900/60 border border-white/10 hover:border-emerald-500/50 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer" data-url="https://en.wikipedia.org/wiki/Computer_programming">💻 Coding</button>
    </div>

    <!-- Pinned Online Learning Shortcuts -->
    <div class="w-full max-w-xl pt-1">
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
          <button class="sp-card bg-gradient-to-br ${c.bg} hover:brightness-125 border border-white/10 hover:border-emerald-500/40 p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all hover:-translate-y-1 hover:shadow-xl group cursor-pointer" data-url="${c.url}">
            <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <i class="${c.icon}"></i>
            </div>
            <span class="text-[11px] font-semibold text-slate-200 group-hover:text-white truncate w-full">${c.name}</span>
          </button>`).join('')}
      </div>
    </div>

    <!-- Offline Built-in Utilities -->
    <div class="w-full max-w-xl pt-1">
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
          <button class="sp-card bg-slate-900/70 hover:bg-slate-800/90 border border-emerald-900/40 hover:border-emerald-500/50 p-2.5 rounded-xl flex flex-col items-center gap-1.5 transition-all hover:scale-105 cursor-pointer" data-url="${c.url}">
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
  overlay.querySelectorAll('.topic-chip').forEach(c =>
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
    const tab = tabs.find(t => t.id === activeTabId);
    const v = root.querySelector(`#wv-${activeTabId}`);
    if (IS_ELECTRON && v?.canGoBack?.()) {
      v.goBack();
    } else if (tab && tab.history && tab.historyIdx > 0) {
      tab.historyIdx--;
      loadUrl(root, activeTabId, tab.history[tab.historyIdx], false);
    } else if (v?.contentWindow) {
      try { v.contentWindow.history.back(); } catch (_) {}
    }
  });

  root.querySelector('#btn-forward').addEventListener('click', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    const v = root.querySelector(`#wv-${activeTabId}`);
    if (IS_ELECTRON && v?.canGoForward?.()) {
      v.goForward();
    } else if (tab && tab.history && tab.historyIdx < tab.history.length - 1) {
      tab.historyIdx++;
      loadUrl(root, activeTabId, tab.history[tab.historyIdx], false);
    } else if (v?.contentWindow) {
      try { v.contentWindow.history.forward(); } catch (_) {}
    }
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
  const downloadedItems = [...stateStore.getFolderFiles('downloads').filter(f => f.type !== 'folder')];
  const savePageBtn = root.querySelector('#btn-save-page');
  savePageBtn?.addEventListener('click', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    const currentUrl = root.querySelector('#omnibox')?.value.trim() || tab?.url || 'dawamu://start';
    const rawTitle = (tab?.title && tab.title !== 'New Tab') ? tab.title : (urlTitle(currentUrl) || 'Web_Research_Article');
    const cleanFileName = rawTitle.replace(/[^a-zA-Z0-9 _-]/g, '').trim().replace(/\s+/g, '_') + '_WebClip.docx';
    const toolEl = root.querySelector(`#ot-${activeTabId}`);
    const bodyHtml = (toolEl && !toolEl.classList.contains('hidden'))
      ? toolEl.innerHTML
      : `<p><b>Source URL:</b> ${currentUrl}</p><p>Saved from Dawamu Safe Browser on ${new Date().toLocaleString()}.</p>`;
    const savedDocHtml = `<h1>${rawTitle}</h1><p style="font-size:12px;color:#64748b;"><b>Saved from Dawamu Browser:</b> ${currentUrl}</p><hr>${bodyHtml}`;
    const savedFile = stateStore.saveFileToVFS('downloads', {
      name: cleanFileName,
      type: 'doc',
      icon: 'fa-file-word',
      color: 'text-blue-400',
      content: savedDocHtml
    });
    downloadedItems.unshift(savedFile || { name: cleanFileName, size: '24 KB' });
    updateDownloadUI();
    dawamuDialogs.toast(`Saved "${cleanFileName}" to This PC > Downloads`, 'success');
  });

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
      ${failedUrl ? `<div class="bg-[#292a2d] p-3 rounded-2xl font-mono text-xs text-slate-400 inline-block"><b>Tried:</b> ${escapeHtml(failedUrl)}</div>
        <button data-retry="${escapeHtml(failedUrl)}" class="bg-[#389e3c] hover:bg-[#2e7d32] text-white text-xs font-semibold px-6 py-2 rounded-full block mx-auto cursor-pointer"><i class="fas fa-redo mr-2"></i>Try Again</button>` : ''}
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
          <button data-tool="${t.url}" class="bg-[#292a2d] hover:bg-[#35363a] border border-slate-700/50 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] hover:border-emerald-700/50 cursor-pointer">
            <i class="${t.icon} text-2xl mb-2"></i>
            <div class="text-sm font-bold text-white">${t.title}</div>
            <div class="text-[10px] text-slate-500 mt-0.5">${t.desc}</div>
          </button>`).join('')}
      </div>
    </div>

    <div class="mt-6 text-center">
      <button data-home class="text-emerald-400 hover:text-emerald-300 text-xs font-semibold cursor-pointer"><i class="fas fa-home mr-1"></i> Back to Start Page</button>
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
      <button id="dict-btn" class="bg-[#389e3c] hover:bg-[#2e7d32] text-white font-bold px-5 py-2 rounded-xl text-sm cursor-pointer">Look Up</button>
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
