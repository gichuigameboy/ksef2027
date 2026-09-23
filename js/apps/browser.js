/**
 * ChromeOS Student Edition - Chrome-like School Web Browser
 * Uses Electron <webview> for real multi-tab native browsing.
 * Falls back to <iframe> gracefully for web-only mode.
 */

import { restrictionManager } from '../os/restrictionManager.js';

const IS_ELECTRON = !!(window.electronAPI && window.electronAPI.isElectron);

const DEFAULT_HOME = 'https://en.m.wikipedia.org/wiki/Main_Page';

const BOOKMARKS = [
  { label: 'Wikipedia',    icon: 'fab fa-wikipedia-w text-gray-300',  url: 'https://en.m.wikipedia.org' },
  { label: 'Khan Academy', icon: 'fas fa-leaf text-emerald-400',      url: 'https://www.khanacademy.org' },
  { label: 'NASA',         icon: 'fas fa-rocket text-indigo-400',     url: 'https://www.nasa.gov' },
  { label: 'Math Is Fun',  icon: 'fas fa-square-root-alt text-amber-400', url: 'https://www.mathsisfun.com' },
  { label: 'Free Library', icon: 'fas fa-book text-blue-300',         url: 'https://www.gutenberg.org' },
  { label: 'Duolingo',     icon: 'fas fa-language text-green-400',    url: 'https://www.duolingo.com' },
];

/* ─────────────────────────────────────────
   TAB MODEL
───────────────────────────────────────── */
let tabs = [];
let activeTabId = null;
let tabCounter = 0;

function createTab(url = DEFAULT_HOME) {
  const id = ++tabCounter;
  tabs.push({ id, url, title: 'New Tab', loading: false, favicon: null });
  return id;
}

/* ─────────────────────────────────────────
   MAIN APP FACTORY
───────────────────────────────────────── */
export function createBrowserApp() {
  const container = document.createElement('div');
  container.className = 'flex flex-col h-full bg-[#202124] text-slate-100 font-sans overflow-hidden';

  // Start with one tab
  const firstTabId = createTab(DEFAULT_HOME);
  activeTabId = firstTabId;

  container.innerHTML = buildShell();
  mountWebviews(container);

  // Wire interactive events
  wireToolbar(container);
  wireBookmarks(container);
  wireTabs(container);

  // Initial render
  renderTabs(container);
  setActiveTab(container, activeTabId);

  return container;
}

/* ─────────────────────────────────────────
   SHELL HTML SKELETON
───────────────────────────────────────── */
function buildShell() {
  return `
    <!-- ══ Tab Bar ══ -->
    <div id="tab-bar"
         class="flex items-end bg-[#35363a] border-b border-[#5f6368]/40 px-2 pt-1 gap-0.5 overflow-x-auto shrink-0 min-h-[38px]">
    </div>

    <!-- ══ Toolbar ══ -->
    <div class="bg-[#292a2d] border-b border-[#5f6368]/30 px-3 py-1.5 flex items-center gap-2 shrink-0">

      <!-- Nav Buttons -->
      <div class="flex items-center gap-0.5 text-slate-400">
        <button id="btn-back"    class="nav-btn disabled:opacity-30" title="Back"    disabled><i class="fas fa-arrow-left  text-sm"></i></button>
        <button id="btn-forward" class="nav-btn disabled:opacity-30" title="Forward" disabled><i class="fas fa-arrow-right text-sm"></i></button>
        <button id="btn-reload"  class="nav-btn" title="Reload"><i id="reload-icon" class="fas fa-redo text-sm"></i></button>
      </div>

      <!-- Omnibox / Address Bar -->
      <div id="omnibox"
           class="flex-1 flex items-center gap-2 bg-[#3c3c3f] hover:bg-[#484848] border border-transparent focus-within:border-blue-500 focus-within:bg-[#292a2d] rounded-full px-3 py-1 text-xs cursor-text transition-colors">
        <i id="security-icon" class="fas fa-lock text-emerald-400 text-[11px]" title="Secure connection"></i>
        <input id="address-bar"
               type="text"
               class="bg-transparent border-none outline-none text-slate-100 text-[13px] w-full font-sans"
               spellcheck="false"
               autocomplete="off"
               placeholder="Search Wikipedia or enter a URL...">
        <span class="shrink-0 text-[10px] bg-emerald-950/70 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded-full font-semibold">
          SafeSearch
        </span>
      </div>

      <!-- New Tab + Menu -->
      <div class="flex items-center gap-1 text-slate-400">
        <button id="btn-new-tab" class="nav-btn" title="New Tab"><i class="fas fa-plus text-sm"></i></button>
        <button id="btn-zoom-in"  class="nav-btn hidden-webonly" title="Zoom In"><i class="fas fa-search-plus text-sm"></i></button>
        <button id="btn-zoom-out" class="nav-btn hidden-webonly" title="Zoom Out"><i class="fas fa-search-minus text-sm"></i></button>
      </div>
    </div>

    <!-- ══ Bookmarks Bar ══ -->
    <div id="bookmarks-bar"
         class="bg-[#292a2d] border-b border-[#5f6368]/20 px-3 py-0.5 flex items-center gap-1 text-xs overflow-x-auto shrink-0">
      <span class="text-[10px] text-slate-500 font-semibold mr-1 shrink-0">Bookmarks:</span>
      ${BOOKMARKS.map(bm => `
        <button class="bm-btn flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors shrink-0" data-url="${bm.url}">
          <i class="${bm.icon} text-[11px]"></i>
          <span class="text-[11px]">${bm.label}</span>
        </button>
      `).join('')}
    </div>

    <!-- ══ Loading Progress Bar ══ -->
    <div id="progress-bar"
         class="h-[3px] bg-blue-500 w-0 transition-all duration-300 shrink-0 opacity-0">
    </div>

    <!-- ══ Webview / Iframe Canvas ══ -->
    <div id="browser-canvas" class="flex-1 relative overflow-hidden bg-white">
    </div>

    <!-- ══ Status Bar ══ -->
    <div id="status-bar"
         class="bg-[#292a2d] border-t border-[#5f6368]/20 px-3 py-0.5 text-[10px] text-slate-400 flex justify-between shrink-0">
      <span id="status-text"></span>
      <span id="zoom-display" class="text-[10px] text-slate-500"></span>
    </div>

    <style>
      .nav-btn {
        width:28px; height:28px; border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        background:transparent; border:none; cursor:pointer;
        color:#9aa0a6; transition:background 0.1s;
      }
      .nav-btn:hover { background:rgba(255,255,255,0.1); color:#fff; }
      .nav-btn:active { transform:scale(0.92); }
      .tab-item {
        display:flex; align-items:center; gap:6px;
        padding:6px 12px 6px 10px; border-radius:8px 8px 0 0;
        min-width:130px; max-width:220px; cursor:pointer;
        background:#2d2e32; color:#9aa0a6; font-size:12px;
        border:1px solid transparent; border-bottom:none;
        transition:background 0.12s; position:relative;
      }
      .tab-item:hover { background:#3a3b3f; color:#e8eaed; }
      .tab-item.active {
        background:#292a2d; color:#e8eaed;
        border-color:#5f6368;
        z-index:1;
      }
      .tab-close {
        margin-left:auto; width:16px; height:16px; border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        font-size:10px; color:#9aa0a6; background:transparent; border:none;
        cursor:pointer; opacity:0; transition:opacity 0.1s, background 0.1s;
        flex-shrink:0;
      }
      .tab-item:hover .tab-close,
      .tab-item.active .tab-close { opacity:1; }
      .tab-close:hover { background:rgba(255,255,255,0.2); color:#fff; }
    </style>
  `;
}

/* ─────────────────────────────────────────
   WEBVIEW / IFRAME CANVAS
───────────────────────────────────────── */
function mountWebviews(container) {
  const canvas = container.querySelector('#browser-canvas');
  tabs.forEach(tab => appendView(container, tab.id, tab.url));
}

function appendView(container, tabId, url) {
  const canvas = container.querySelector('#browser-canvas');
  const wrapper = document.createElement('div');
  wrapper.id = `view-wrapper-${tabId}`;
  wrapper.className = 'absolute inset-0 hidden';

  if (IS_ELECTRON) {
    // Electron: full native <webview> – real separate browser process
    const wv = document.createElement('webview');
    wv.id = `webview-${tabId}`;
    wv.setAttribute('src', url);
    wv.setAttribute('allowpopups', '');
    wv.style.width  = '100%';
    wv.style.height = '100%';
    wv.style.border = 'none';

    wireWebviewEvents(container, tabId, wv);
    wrapper.appendChild(wv);
  } else {
    // Web fallback: <iframe>
    const iframe = document.createElement('iframe');
    iframe.id = `webview-${tabId}`;
    iframe.src = url;
    iframe.style.width  = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.allow = 'fullscreen';
    iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals';
    iframe.addEventListener('load', () => {
      setLoading(container, tabId, false);
    });
    wrapper.appendChild(iframe);
  }

  canvas.appendChild(wrapper);
}

function wireWebviewEvents(container, tabId, wv) {
  wv.addEventListener('did-start-loading', () => setLoading(container, tabId, true));
  wv.addEventListener('did-stop-loading',  () => setLoading(container, tabId, false));
  wv.addEventListener('did-fail-load',     () => setLoading(container, tabId, false));

  wv.addEventListener('page-title-updated', (e) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) { tab.title = e.title; renderTabs(container); }
  });

  wv.addEventListener('page-favicon-updated', (e) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && e.favicons[0]) { tab.favicon = e.favicons[0]; renderTabs(container); }
  });

  wv.addEventListener('did-navigate', (e) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) { tab.url = e.url; }
    if (tabId === activeTabId) {
      container.querySelector('#address-bar').value = e.url;
      syncNavButtons(container, tabId);
    }
  });

  wv.addEventListener('did-navigate-in-page', (e) => {
    if (tabId === activeTabId) {
      container.querySelector('#address-bar').value = e.url;
      syncNavButtons(container, tabId);
    }
  });

  wv.addEventListener('update-target-url', (e) => {
    if (tabId === activeTabId) {
      container.querySelector('#status-text').textContent = e.url || '';
    }
  });

  // Intercept new windows / link clicks to enforce restrictions
  wv.addEventListener('will-navigate', (e) => {
    const access = restrictionManager.checkUrlAccess(e.url);
    if (!access.allowed) {
      e.preventDefault && e.preventDefault();
      wv.stop();
      showBlockPage(container, tabId, e.url, access.reason);
    }
  });
}

/* ─────────────────────────────────────────
   NAVIGATION HELPERS
───────────────────────────────────────── */
function navigate(container, tabId, rawInput) {
  let url = rawInput.trim();
  if (!url) return;

  // Search query → Wikipedia SafeSearch
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.includes('.') && !url.includes(' ')) {
      url = 'https://' + url;
    } else {
      const q = restrictionManager.inspectSearchQuery(url);
      if (!q.safe) { showBlockPage(container, tabId, url, q.reason); return; }
      url = `https://en.m.wikipedia.org/w/index.php?search=${encodeURIComponent(url)}`;
    }
  }

  // Domain restriction check
  const access = restrictionManager.checkUrlAccess(url);
  if (!access.allowed) { showBlockPage(container, tabId, url, access.reason); return; }

  const tab = tabs.find(t => t.id === tabId);
  if (tab) { tab.url = url; tab.title = 'Loading…'; }

  const view = getView(container, tabId);
  if (IS_ELECTRON && view && view.tagName === 'WEBVIEW') {
    view.src = url;
  } else if (view) {
    view.src = url;
  }

  container.querySelector('#address-bar').value = url;
  setLoading(container, tabId, true);
  renderTabs(container);
}

function getView(container, tabId) {
  return container.querySelector(`#webview-${tabId}`);
}

function syncNavButtons(container, tabId) {
  const view = getView(container, tabId);
  const backBtn    = container.querySelector('#btn-back');
  const forwardBtn = container.querySelector('#btn-forward');
  if (!view) return;
  if (IS_ELECTRON && view.tagName === 'WEBVIEW') {
    backBtn.disabled    = !view.canGoBack();
    forwardBtn.disabled = !view.canGoForward();
  } else {
    backBtn.disabled = forwardBtn.disabled = false; // iframe can't report history
  }
}

function setLoading(container, tabId, isLoading) {
  const tab = tabs.find(t => t.id === tabId);
  if (tab) tab.loading = isLoading;

  if (tabId === activeTabId) {
    const icon = container.querySelector('#reload-icon');
    const bar  = container.querySelector('#progress-bar');
    if (icon) icon.className = isLoading ? 'fas fa-times text-sm' : 'fas fa-redo text-sm';
    if (bar) {
      if (isLoading) {
        bar.style.width = '70%'; bar.style.opacity = '1';
      } else {
        bar.style.width = '100%';
        setTimeout(() => { bar.style.width = '0'; bar.style.opacity = '0'; }, 300);
      }
    }
  }
}

function showBlockPage(container, tabId, blockedUrl, reason) {
  const wrapper = container.querySelector(`#view-wrapper-${tabId}`);
  if (!wrapper) return;

  // Remove old view
  const oldView = wrapper.querySelector('webview, iframe');
  if (oldView) oldView.remove();

  wrapper.innerHTML = `
    <div class="h-full overflow-y-auto flex items-center justify-center p-8 bg-[#202124]">
      <div class="max-w-xl w-full bg-[#292a2d] border border-[#5f6368]/50 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
        <div class="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto text-3xl border border-rose-500/30">
          <i class="fas fa-shield-alt"></i>
        </div>
        <h2 class="text-xl font-bold text-white">Access Restricted by Administrator</h2>
        <p class="text-slate-400 text-sm leading-relaxed">
          ${reason || 'This website is blocked by school/parent safety policy.'}
        </p>
        <div class="bg-[#1a1b1e] p-4 rounded-2xl border border-[#5f6368]/40 font-mono text-xs text-rose-300 text-left space-y-1">
          <div><b class="text-slate-400">URL:</b> ${blockedUrl}</div>
          <div><b class="text-slate-400">Policy:</b> Anti-Distraction &amp; Student Safety</div>
          <div><b class="text-slate-400">Filter:</b> Lincoln High School Network</div>
        </div>
        <div class="flex justify-center gap-3">
          <button id="req-unblock-${tabId}" class="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-5 py-2.5 rounded-full transition-colors flex items-center gap-2">
            <i class="fas fa-paper-plane"></i> Request Unblock from Teacher
          </button>
          <button id="go-home-${tabId}" class="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-2.5 rounded-full transition-colors">
            Go Home
          </button>
        </div>
      </div>
    </div>
  `;

  setLoading(container, tabId, false);
  container.querySelector(`#address-bar`).value = blockedUrl;

  wrapper.querySelector(`#go-home-${tabId}`)?.addEventListener('click', () => {
    appendNewView(container, tabId, DEFAULT_HOME);
    navigate(container, tabId, DEFAULT_HOME);
  });

  wrapper.querySelector(`#req-unblock-${tabId}`)?.addEventListener('click', (e) => {
    e.target.innerHTML = '<i class="fas fa-check"></i> Request Sent';
    e.target.className = 'bg-emerald-600 text-white font-semibold text-xs px-5 py-2.5 rounded-full cursor-default';
  });
}

function appendNewView(container, tabId, url) {
  const wrapper = container.querySelector(`#view-wrapper-${tabId}`);
  if (!wrapper) return;
  wrapper.innerHTML = '';

  if (IS_ELECTRON) {
    const wv = document.createElement('webview');
    wv.id = `webview-${tabId}`;
    wv.setAttribute('src', url);
    wv.setAttribute('allowpopups', '');
    wv.style.width = '100%'; wv.style.height = '100%'; wv.style.border = 'none';
    wireWebviewEvents(container, tabId, wv);
    wrapper.appendChild(wv);
  } else {
    const iframe = document.createElement('iframe');
    iframe.id = `webview-${tabId}`;
    iframe.src = url;
    iframe.style.width = '100%'; iframe.style.height = '100%'; iframe.style.border = 'none';
    iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals';
    wrapper.appendChild(iframe);
  }
}

/* ─────────────────────────────────────────
   TAB RENDERING
───────────────────────────────────────── */
function renderTabs(container) {
  const bar = container.querySelector('#tab-bar');
  if (!bar) return;

  bar.innerHTML = tabs.map(tab => `
    <div class="tab-item ${tab.id === activeTabId ? 'active' : ''}" data-tab-id="${tab.id}" title="${tab.title || tab.url}">
      ${tab.favicon
        ? `<img src="${tab.favicon}" class="w-3.5 h-3.5 rounded-sm shrink-0" onerror="this.replaceWith(document.createElement('i'))">`
        : `<i class="${tab.loading ? 'fas fa-circle-notch fa-spin text-blue-400' : 'fas fa-globe text-slate-500'} text-[11px] shrink-0"></i>`}
      <span class="truncate flex-1 text-[12px]">${tab.title || tab.url || 'New Tab'}</span>
      <button class="tab-close" data-close-tab="${tab.id}" title="Close Tab">✕</button>
    </div>
  `).join('') + `
    <button id="new-tab-btn-inline"
            class="flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/10 text-slate-400 hover:text-white ml-1 self-center shrink-0 text-sm transition-colors"
            title="New Tab">+</button>
  `;

  // Tab click to activate
  bar.querySelectorAll('.tab-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.tab-close')) return;
      const id = parseInt(el.dataset.tabId, 10);
      setActiveTab(container, id);
    });
  });

  // Close tab buttons
  bar.querySelectorAll('.tab-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTab(container, parseInt(btn.dataset.closeTab, 10));
    });
  });

  // Inline new tab
  bar.querySelector('#new-tab-btn-inline')?.addEventListener('click', () => openNewTab(container));
}

function setActiveTab(container, tabId) {
  activeTabId = tabId;
  const tab = tabs.find(t => t.id === tabId);

  // Show/hide wrappers
  container.querySelectorAll('[id^="view-wrapper-"]').forEach(w => w.classList.add('hidden'));
  const wrapper = container.querySelector(`#view-wrapper-${tabId}`);
  if (wrapper) wrapper.classList.remove('hidden');

  // Update address bar
  const addrBar = container.querySelector('#address-bar');
  if (addrBar && tab) addrBar.value = tab.url || '';

  syncNavButtons(container, tabId);
  renderTabs(container);
}

function openNewTab(container) {
  const id = createTab(DEFAULT_HOME);
  appendView(container, id, DEFAULT_HOME);
  setActiveTab(container, id);
  // Focus address bar
  const bar = container.querySelector('#address-bar');
  if (bar) { bar.value = ''; bar.focus(); bar.select(); }
}

function closeTab(container, tabId) {
  if (tabs.length === 1) return; // Never close last tab

  const idx = tabs.findIndex(t => t.id === tabId);
  tabs = tabs.filter(t => t.id !== tabId);

  // Remove DOM
  container.querySelector(`#view-wrapper-${tabId}`)?.remove();

  if (activeTabId === tabId) {
    const next = tabs[Math.min(idx, tabs.length - 1)];
    setActiveTab(container, next.id);
  } else {
    renderTabs(container);
  }
}

/* ─────────────────────────────────────────
   TOOLBAR WIRING
───────────────────────────────────────── */
function wireToolbar(container) {
  const addrBar = container.querySelector('#address-bar');

  // Enter to navigate
  addrBar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') navigate(container, activeTabId, addrBar.value);
  });

  // Select all on focus
  addrBar.addEventListener('focus', () => addrBar.select());

  // Back
  container.querySelector('#btn-back').addEventListener('click', () => {
    const view = getView(container, activeTabId);
    if (IS_ELECTRON && view?.canGoBack()) view.goBack();
  });

  // Forward
  container.querySelector('#btn-forward').addEventListener('click', () => {
    const view = getView(container, activeTabId);
    if (IS_ELECTRON && view?.canGoForward()) view.goForward();
  });

  // Reload / Stop
  container.querySelector('#btn-reload').addEventListener('click', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    const view = getView(container, activeTabId);
    if (tab?.loading) {
      if (IS_ELECTRON && view?.stop) view.stop();
      setLoading(container, activeTabId, false);
    } else {
      if (IS_ELECTRON && view?.reload) view.reload();
      else if (view) { view.src = view.src; }
      setLoading(container, activeTabId, true);
    }
  });

  // New Tab button
  container.querySelector('#btn-new-tab').addEventListener('click', () => openNewTab(container));

  // Zoom (Electron only)
  container.querySelector('#btn-zoom-in')?.addEventListener('click', () => {
    const view = getView(container, activeTabId);
    if (view?.getZoomFactor) view.setZoomFactor(view.getZoomFactor() + 0.1);
  });
  container.querySelector('#btn-zoom-out')?.addEventListener('click', () => {
    const view = getView(container, activeTabId);
    if (view?.getZoomFactor) view.setZoomFactor(Math.max(0.5, view.getZoomFactor() - 0.1));
  });

  if (IS_ELECTRON) {
    container.querySelector('#btn-zoom-in')?.classList.remove('hidden-webonly');
    container.querySelector('#btn-zoom-out')?.classList.remove('hidden-webonly');
  }
}

/* ─────────────────────────────────────────
   BOOKMARKS WIRING
───────────────────────────────────────── */
function wireBookmarks(container) {
  container.querySelector('#bookmarks-bar').addEventListener('click', (e) => {
    const btn = e.target.closest('.bm-btn');
    if (!btn) return;
    navigate(container, activeTabId, btn.dataset.url);
  });
}

function wireTabs(container) {
  // (tab bar wired in renderTabs – re-wired on each render)
}
