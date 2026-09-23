/**
 * ChromeOS Student Edition - Ultra-Fast School Browser
 *
 * KEY PERFORMANCE DESIGN:
 * - Each tab has ONE persistent <webview> that is NEVER destroyed.
 * - Navigation just sets webview.src — no renderer process respawning.
 * - Start Page is a lightweight HTML overlay shown ON TOP of the webview.
 * - Persistent session partition = cached DNS + SSL across all tabs.
 * - All student restriction enforcement runs before any navigation fires.
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

function newTab(url = null) {
  const id = ++tabCounter;
  tabs.push({ id, url, title: 'New Tab', loading: false });
  return id;
}

/* ═══════════════════════════════════════════════════
   ENTRY POINT
═══════════════════════════════════════════════════ */
export function createBrowserApp() {
  // Reset per-instance state
  tabs = []; activeTabId = null; tabCounter = 0;

  const root = document.createElement('div');
  root.className = 'flex flex-col h-full bg-[#202124] text-white overflow-hidden font-sans';
  root.innerHTML = buildChrome();

  // Wire toolbar before adding tabs so elements exist
  wireChrome(root);

  // Open first tab — no URL means show start page
  openTab(root, null);

  return root;
}

/* ═══════════════════════════════════════════════════
   CHROME SHELL (static, rendered once)
═══════════════════════════════════════════════════ */
function buildChrome() {
  return `
  <!-- Tab Strip -->
  <div id="tab-strip" class="flex items-end bg-[#35363a] px-2 pt-1 gap-0.5 min-h-[38px] overflow-x-auto shrink-0 border-b border-black/30"></div>

  <!-- Toolbar -->
  <div class="bg-[#292a2d] border-b border-black/20 px-2 py-1 flex items-center gap-1.5 shrink-0">
    <button id="btn-back"    class="nb" title="Back"><i class="fas fa-arrow-left text-xs"></i></button>
    <button id="btn-forward" class="nb" title="Forward"><i class="fas fa-arrow-right text-xs"></i></button>
    <button id="btn-reload"  class="nb" title="Reload"><i id="reload-icon" class="fas fa-redo text-xs"></i></button>
    <button id="btn-home"    class="nb" title="Home"><i class="fas fa-home text-xs"></i></button>

    <!-- Engine Selector -->
    <select id="engine-sel" class="bg-[#3c3c3f] text-slate-200 text-xs border border-slate-600/40 rounded-full px-2 py-1 outline-none cursor-pointer">
      <option value="google">🔍 Google</option>
      <option value="bing">🔍 Bing</option>
      <option value="brave">🦁 Brave</option>
    </select>

    <!-- Omnibox -->
    <div class="flex-1 flex items-center gap-1.5 bg-[#3c3c3f] hover:bg-[#484848] focus-within:bg-[#292a2d] focus-within:border-blue-500 border border-transparent rounded-full px-3 py-1">
      <i class="fas fa-lock text-emerald-400 text-[10px]"></i>
      <input id="omnibox" type="text" autocomplete="off" spellcheck="false"
             class="flex-1 bg-transparent outline-none text-[13px] text-white min-w-0"
             placeholder="Search Google or enter a URL...">
      <span class="text-[9px] bg-emerald-900/70 text-emerald-300 border border-emerald-700/40 px-1.5 py-0.5 rounded-full font-bold shrink-0">SAFE</span>
    </div>

    <button id="btn-new-tab" class="nb" title="New Tab"><i class="fas fa-plus text-xs"></i></button>
  </div>

  <!-- Bookmarks Bar -->
  <div id="bm-bar" class="bg-[#292a2d] border-b border-black/10 px-3 py-0.5 flex items-center gap-0.5 text-xs overflow-x-auto shrink-0">
    ${BOOKMARKS.map(b => `
      <button class="bm flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 text-slate-300 hover:text-white shrink-0 transition-colors" data-url="${b.url}">
        <i class="${b.icon} text-[10px]"></i><span class="text-[11px]">${b.label}</span>
      </button>`).join('')}
  </div>

  <!-- Progress Bar -->
  <div id="prog" class="h-0.5 bg-blue-500 w-0 opacity-0 shrink-0 transition-all duration-150"></div>

  <!-- Canvas: holds one wrapper per tab -->
  <div id="canvas" class="flex-1 relative overflow-hidden"></div>

  <!-- Status Bar -->
  <div class="bg-[#292a2d] border-t border-black/10 px-3 py-0.5 flex justify-between shrink-0">
    <span id="status" class="text-[10px] text-slate-400">Lincoln High School Safe Browser</span>
    <span class="text-[10px] text-slate-500">${IS_ELECTRON ? 'Persistent Engine ⚡' : 'Web Mode'}</span>
  </div>

  <style>
    .nb { width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;
          background:transparent;border:none;cursor:pointer;color:#9aa0a6;transition:background .1s; }
    .nb:hover { background:rgba(255,255,255,.1);color:#fff; }
    .nb:active { transform:scale(.9); }
    .tab { display:flex;align-items:center;gap:5px;padding:5px 10px 5px 8px;border-radius:8px 8px 0 0;
           min-width:120px;max-width:200px;cursor:pointer;background:#2d2e32;color:#9aa0a6;font-size:11px;
           border:1px solid transparent;border-bottom:none;transition:background .1s; }
    .tab:hover { background:#3a3b3f;color:#e8eaed; }
    .tab.active { background:#292a2d;color:#e8eaed;border-color:#5f6368;z-index:1; }
    .tab-x { margin-left:auto;width:14px;height:14px;border-radius:50%;display:flex;align-items:center;
              justify-content:center;font-size:9px;color:#9aa0a6;background:transparent;border:none;
              cursor:pointer;opacity:0;transition:opacity .1s; }
    .tab:hover .tab-x,.tab.active .tab-x { opacity:1; }
    .tab-x:hover { background:rgba(255,255,255,.2);color:#fff; }
    .tab-wrap { position:absolute;inset:0; }
    .start-overlay { position:absolute;inset:0;z-index:10;display:flex;align-items:center;justify-content:center; }
    .start-overlay.hidden { display:none; }
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

  // Tab wrapper holds one persistent webview + one start overlay
  const wrap = document.createElement('div');
  wrap.id = `tw-${tabId}`;
  wrap.className = 'tab-wrap hidden';

  if (IS_ELECTRON) {
    // ── PERSISTENT WEBVIEW (never destroyed, just .src changed) ──
    const wv = document.createElement('webview');
    wv.id = `wv-${tabId}`;
    wv.setAttribute('partition', 'persist:school');
    wv.setAttribute('allowpopups', '');
    wv.style.cssText = 'width:100%;height:100%;border:none;display:block;';
    wrap.appendChild(wv);

    wireWebview(root, tabId, wv);
  } else {
    // Web-mode: single persistent iframe
    const fr = document.createElement('iframe');
    fr.id = `wv-${tabId}`;
    fr.style.cssText = 'width:100%;height:100%;border:none;display:block;';
    fr.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals';
    fr.allow = 'fullscreen';
    fr.addEventListener('load', () => progress(root, tabId, false));
    wrap.appendChild(fr);
  }

  // ── START PAGE OVERLAY (lightweight HTML, no network) ──
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
  wv.addEventListener('did-fail-load',      ()  => progress(root, tabId, false));

  wv.addEventListener('did-navigate', e => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) tab.url = e.url;
    if (tabId === activeTabId) {
      root.querySelector('#omnibox').value = e.url;
    }
  });

  wv.addEventListener('page-title-updated', e => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) tab.title = e.title || 'Page';
    renderTabStrip(root);
  });

  wv.addEventListener('update-target-url', e => {
    if (tabId === activeTabId)
      root.querySelector('#status').textContent = e.url || 'Lincoln High School Safe Browser';
  });

  // Block restricted sites before they load
  wv.addEventListener('will-navigate', e => {
    if (!restrictionManager.checkUrlAccess(e.url).allowed) {
      try { wv.stop(); } catch (_) {}
      showBlock(root, tabId, e.url, restrictionManager.checkUrlAccess(e.url).reason);
    }
  });
}

function activateTab(root, tabId) {
  activeTabId = tabId;
  // Hide all wrappers, show active
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
   NAVIGATION  (FAST: just sets .src on existing view)
═══════════════════════════════════════════════════ */
function loadUrl(root, tabId, url) {
  const access = restrictionManager.checkUrlAccess(url);
  if (!access.allowed) { showBlock(root, tabId, url, access.reason); return; }

  // Hide start page overlay, show webview beneath
  const overlay = root.querySelector(`#sp-${tabId}`);
  if (overlay) overlay.classList.add('hidden');

  const view = root.querySelector(`#wv-${tabId}`);
  if (view) view.src = url;   // ← FAST: reuse existing renderer

  const tab = tabs.find(t => t.id === tabId);
  if (tab) { tab.url = url; tab.title = urlTitle(url); }

  if (tabId === activeTabId) root.querySelector('#omnibox').value = url;
  progress(root, tabId, true);
  renderTabStrip(root);
}

function navigate(root, tabId, raw) {
  let url = raw.trim();
  if (!url) return;

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
    // Auto-complete after 3 s so UI never feels stuck
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

  // Show overlay with block message instead of a real page
  const overlay = root.querySelector(`#sp-${tabId}`);
  if (!overlay) return;

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
        <div><b class="text-slate-400">Filter:</b> Lincoln High School Network</div>
      </div>
      <div class="flex justify-center gap-3">
        <button id="blk-req-${tabId}" class="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-2">
          <i class="fas fa-paper-plane"></i> Request Unblock
        </button>
        <button id="blk-home-${tabId}" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-full">
          Return Home
        </button>
      </div>
    </div>`;

  root.querySelector(`#omnibox`).value = blockedUrl;

  root.querySelector(`#blk-home-${tabId}`)?.addEventListener('click', () => {
    showStartPage(root, tabId);
  });
  root.querySelector(`#blk-req-${tabId}`)?.addEventListener('click', e => {
    e.target.innerHTML = '<i class="fas fa-check"></i> Sent!';
    e.target.className = 'bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-full cursor-default';
  });
}

/* ═══════════════════════════════════════════════════
   START PAGE (pure HTML, zero network cost)
═══════════════════════════════════════════════════ */
function showStartPage(root, tabId) {
  const tab = tabs.find(t => t.id === tabId);
  if (tab) { tab.url = null; tab.title = 'New Tab'; }
  if (tabId === activeTabId) root.querySelector('#omnibox').value = '';
  renderTabStrip(root);

  const overlay = root.querySelector(`#sp-${tabId}`);
  if (!overlay) return;
  overlay.classList.remove('hidden');
  overlay.innerHTML = startPageHTML(tabId);
  wireStartPage(root, tabId, overlay);
}

function startPageHTML(tabId) {
  return `
  <div class="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
    <div class="flex items-center gap-3">
      <i class="fab fa-chrome text-5xl text-blue-500"></i>
      <span class="text-3xl font-bold text-white">Google</span>
    </div>
    <p class="text-xs text-slate-400">Lincoln High School Protected Student Browser</p>

    <div class="w-full max-w-lg flex items-center bg-[#303134] hover:bg-[#3c3c3f] border border-slate-700 hover:border-slate-500 focus-within:border-blue-500 rounded-full px-4 py-3 shadow-xl transition-all">
      <i class="fas fa-search text-slate-400 text-sm mr-3 shrink-0"></i>
      <input id="sp-input-${tabId}" type="text"
             class="flex-1 bg-transparent outline-none text-white text-sm min-w-0"
             placeholder="Search Google or enter a web address..."
             autofocus>
      <button id="sp-btn-${tabId}" class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-1.5 rounded-full ml-2 shrink-0">
        Go
      </button>
    </div>

    <div class="grid grid-cols-4 gap-3 max-w-lg w-full mt-4">
      ${[
        { url:'https://www.google.com',          icon:'fab fa-google text-blue-400',         name:'Google' },
        { url:'https://www.bing.com',            icon:'fab fa-microsoft text-cyan-400',       name:'Bing' },
        { url:'https://search.brave.com',        icon:'fas fa-shield-alt text-amber-500',     name:'Brave' },
        { url:'https://www.khanacademy.org',     icon:'fas fa-leaf text-emerald-400',         name:'Khan Academy' },
        { url:'https://www.nasa.gov',            icon:'fas fa-rocket text-indigo-400',        name:'NASA' },
        { url:'https://www.mathsisfun.com',      icon:'fas fa-square-root-alt text-amber-400',name:'Math Is Fun' },
        { url:'https://www.wikipedia.org',       icon:'fab fa-wikipedia-w text-slate-300',    name:'Wikipedia' },
        { url:'https://www.duolingo.com',        icon:'fas fa-language text-green-400',       name:'Duolingo' },
      ].map(c => `
        <button class="sp-card bg-[#292a2d] hover:bg-[#35363a] border border-slate-700/50 p-3 rounded-2xl flex flex-col items-center gap-2 transition-all hover:scale-105" data-url="${c.url}">
          <i class="${c.icon} text-2xl"></i>
          <span class="text-[11px] font-semibold text-slate-200 text-center">${c.name}</span>
        </button>`).join('')}
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

  // Bookmarks bar
  root.querySelector('#bm-bar').addEventListener('click', e => {
    const b = e.target.closest('.bm');
    if (b) navigate(root, activeTabId, b.dataset.url);
  });

  // Initial tab strip render
  renderTabStrip(root);
}

/* ─── helpers ─── */
function urlTitle(url) {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch (_) { return url; }
}
