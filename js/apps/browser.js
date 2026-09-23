/**
 * ChromeOS Student Edition - Real Web Browser (Google / Bing / Brave Search Powered)
 * Supports real search engines (Google, Bing, Brave), multi-tab browsing, live iframe rendering, and school domain restrictions.
 */

import { restrictionManager } from '../os/restrictionManager.js';

const SEARCH_ENGINES = {
  google: { name: 'Google', url: 'https://www.google.com/search?q=', home: 'https://www.google.com', icon: 'fab fa-google text-blue-400' },
  bing:   { name: 'Bing',   url: 'https://www.bing.com/search?q=',   home: 'https://www.bing.com',   icon: 'fab fa-microsoft text-cyan-400' },
  brave:  { name: 'Brave',  url: 'https://search.brave.com/search?q=', home: 'https://search.brave.com', icon: 'fas fa-shield-alt text-amber-500' }
};

let currentEngine = 'google';
const DEFAULT_HOME = SEARCH_ENGINES.google.home;

const BOOKMARKS = [
  { label: 'Google',       icon: 'fab fa-google text-blue-400',       url: 'https://www.google.com' },
  { label: 'Bing',         icon: 'fab fa-microsoft text-cyan-400',     url: 'https://www.bing.com' },
  { label: 'Brave Search', icon: 'fas fa-shield-alt text-amber-500',  url: 'https://search.brave.com' },
  { label: 'Khan Academy', icon: 'fas fa-leaf text-emerald-400',      url: 'https://www.khanacademy.org' },
  { label: 'NASA',         icon: 'fas fa-rocket text-indigo-400',     url: 'https://www.nasa.gov' },
  { label: 'Math Is Fun',  icon: 'fas fa-square-root-alt text-amber-400', url: 'https://www.mathsisfun.com' },
  { label: 'Roblox (Block Test)', icon: 'fas fa-gamepad text-rose-400', url: 'https://roblox.com' }
];

/* ─────────────────────────────────────────
   TAB MODEL
───────────────────────────────────────── */
let tabs = [];
let activeTabId = null;
let tabCounter = 0;

function createTab(url = DEFAULT_HOME) {
  const id = ++tabCounter;
  tabs.push({ id, url, title: 'Google', loading: false, favicon: null });
  return id;
}

/* ─────────────────────────────────────────
   MAIN APP FACTORY
───────────────────────────────────────── */
export function createBrowserApp() {
  try {
    // Reset tabs state for new window instance
    tabs = [];
    activeTabId = null;
    tabCounter = 0;

    const container = document.createElement('div');
    container.className = 'flex flex-col h-full bg-[#202124] text-slate-100 font-sans overflow-hidden';

    // Start with Google home tab
    const firstTabId = createTab(DEFAULT_HOME);
    activeTabId = firstTabId;

    container.innerHTML = buildShell();
    mountViews(container);

    // Wire interactive events
    wireToolbar(container);
    wireBookmarks(container);

    // Initial render
    renderTabs(container);
    setActiveTab(container, activeTabId);

    return container;
  } catch (err) {
    console.error('Error in createBrowserApp:', err);
    const fallback = document.createElement('div');
    fallback.className = 'p-6 bg-slate-900 text-rose-400 font-sans h-full flex items-center justify-center';
    fallback.innerHTML = `<div class="text-center"><i class="fas fa-exclamation-triangle text-3xl mb-2"></i><h3 class="font-bold text-base">Unable to load School Browser</h3><p class="text-xs text-slate-400 mt-1">${err.message}</p></div>`;
    return fallback;
  }
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
        <button id="btn-back"    class="nav-btn" title="Back"><i class="fas fa-arrow-left text-sm"></i></button>
        <button id="btn-forward" class="nav-btn" title="Forward"><i class="fas fa-arrow-right text-sm"></i></button>
        <button id="btn-reload"  class="nav-btn" title="Reload"><i id="reload-icon" class="fas fa-redo text-sm"></i></button>
        <button id="btn-home"    class="nav-btn" title="Home"><i class="fas fa-home text-sm"></i></button>
      </div>

      <!-- Search Engine Selector -->
      <div class="flex items-center bg-[#3c3c3f] rounded-full px-2 py-1 text-xs border border-slate-600/50">
        <select id="engine-select" class="bg-transparent text-slate-200 font-semibold outline-none cursor-pointer text-xs pr-1">
          <option value="google" ${currentEngine === 'google' ? 'selected' : ''}>🔍 Google</option>
          <option value="bing"   ${currentEngine === 'bing' ? 'selected' : ''}>🔍 Bing</option>
          <option value="brave"  ${currentEngine === 'brave' ? 'selected' : ''}>🦁 Brave</option>
        </select>
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
               placeholder="Search Google or type a web URL...">
        <span class="shrink-0 text-[10px] bg-emerald-950/70 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded-full font-semibold">
          SafeSearch
        </span>
      </div>

      <!-- New Tab -->
      <div class="flex items-center gap-1 text-slate-400">
        <button id="btn-new-tab" class="nav-btn" title="New Tab"><i class="fas fa-plus text-sm"></i></button>
      </div>
    </div>

    <!-- ══ Bookmarks Bar ══ -->
    <div id="bookmarks-bar"
         class="bg-[#292a2d] border-b border-[#5f6368]/20 px-3 py-0.5 flex items-center gap-1 text-xs overflow-x-auto shrink-0">
      <span class="text-[10px] text-slate-500 font-semibold mr-1 shrink-0">Quick Sites:</span>
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

    <!-- ══ Web Canvas ══ -->
    <div id="browser-canvas" class="flex-1 relative overflow-hidden bg-white">
    </div>

    <!-- ══ Status Bar ══ -->
    <div id="status-bar"
         class="bg-[#292a2d] border-t border-[#5f6368]/20 px-3 py-0.5 text-[10px] text-slate-400 flex justify-between shrink-0">
      <span id="status-text">Lincoln High School Protected Browser Network</span>
      <span id="zoom-display" class="text-[10px] text-slate-500">Google Search Powered</span>
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
   WEB CANVAS MOUNTING
───────────────────────────────────────── */
function mountViews(container) {
  tabs.forEach(tab => appendView(container, tab.id, tab.url));
}

function appendView(container, tabId, url) {
  const canvas = container.querySelector('#browser-canvas');
  if (!canvas) return;

  const wrapper = document.createElement('div');
  wrapper.id = `view-wrapper-${tabId}`;
  wrapper.className = 'absolute inset-0 hidden';

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
  canvas.appendChild(wrapper);
}

/* ─────────────────────────────────────────
   NAVIGATION HELPERS
───────────────────────────────────────── */
function navigate(container, tabId, rawInput) {
  let url = rawInput.trim();
  if (!url) return;

  // Search query → Google / Bing / Brave Search
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.includes('.') && !url.includes(' ')) {
      url = 'https://' + url;
    } else {
      const q = restrictionManager.inspectSearchQuery(url);
      if (!q.safe) { showBlockPage(container, tabId, url, q.reason); return; }
      const engine = SEARCH_ENGINES[currentEngine] || SEARCH_ENGINES.google;
      url = `${engine.url}${encodeURIComponent(url)}`;
    }
  }

  // Domain restriction check
  const access = restrictionManager.checkUrlAccess(url);
  if (!access.allowed) { showBlockPage(container, tabId, url, access.reason); return; }

  const tab = tabs.find(t => t.id === tabId);
  if (tab) {
    tab.url = url;
    if (url.includes('google.com')) tab.title = 'Google Search';
    else if (url.includes('bing.com')) tab.title = 'Bing Search';
    else if (url.includes('brave.com')) tab.title = 'Brave Search';
    else tab.title = 'Loading…';
  }

  const view = getView(container, tabId);
  if (view) {
    view.src = url;
  }

  const addrBar = container.querySelector('#address-bar');
  if (addrBar) addrBar.value = url;

  setLoading(container, tabId, true);
  renderTabs(container);
}

function getView(container, tabId) {
  return container.querySelector(`#webview-${tabId}`);
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
  const oldView = wrapper.querySelector('iframe');
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
            Go to Google
          </button>
        </div>
      </div>
    </div>
  `;

  setLoading(container, tabId, false);
  const addrBar = container.querySelector('#address-bar');
  if (addrBar) addrBar.value = blockedUrl;

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

  const iframe = document.createElement('iframe');
  iframe.id = `webview-${tabId}`;
  iframe.src = url;
  iframe.style.width = '100%'; iframe.style.height = '100%'; iframe.style.border = 'none';
  iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals';
  wrapper.appendChild(iframe);
}

/* ─────────────────────────────────────────
   TAB RENDERING & INTERACTION
───────────────────────────────────────── */
function renderTabs(container) {
  const bar = container.querySelector('#tab-bar');
  if (!bar) return;

  bar.innerHTML = tabs.map(tab => `
    <div class="tab-item ${tab.id === activeTabId ? 'active' : ''}" data-tab-id="${tab.id}" title="${tab.title || tab.url}">
      <i class="${tab.loading ? 'fas fa-circle-notch fa-spin text-blue-400' : 'fas fa-globe text-slate-500'} text-[11px] shrink-0"></i>
      <span class="truncate flex-1 text-[12px]">${tab.title || tab.url || 'Google'}</span>
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

  // Inline new tab button
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

  renderTabs(container);
}

function openNewTab(container) {
  const id = createTab(DEFAULT_HOME);
  appendView(container, id, DEFAULT_HOME);
  setActiveTab(container, id);

  const bar = container.querySelector('#address-bar');
  if (bar) { bar.value = ''; bar.focus(); bar.select(); }
}

function closeTab(container, tabId) {
  if (tabs.length === 1) return; // Never close last tab

  const idx = tabs.findIndex(t => t.id === tabId);
  tabs = tabs.filter(t => t.id !== tabId);

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
  const engineSelect = container.querySelector('#engine-select');

  // Engine switch
  engineSelect?.addEventListener('change', (e) => {
    currentEngine = e.target.value;
  });

  // Enter to navigate
  addrBar?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') navigate(container, activeTabId, addrBar.value);
  });

  // Select all on focus
  addrBar?.addEventListener('focus', () => addrBar.select());

  // Back
  container.querySelector('#btn-back')?.addEventListener('click', () => {
    const view = getView(container, activeTabId);
    if (view && view.contentWindow) {
      try { view.contentWindow.history.back(); } catch (e) {}
    }
  });

  // Forward
  container.querySelector('#btn-forward')?.addEventListener('click', () => {
    const view = getView(container, activeTabId);
    if (view && view.contentWindow) {
      try { view.contentWindow.history.forward(); } catch (e) {}
    }
  });

  // Reload / Stop
  container.querySelector('#btn-reload')?.addEventListener('click', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    const view = getView(container, activeTabId);
    if (tab?.loading) {
      setLoading(container, activeTabId, false);
    } else {
      if (view) view.src = view.src;
      setLoading(container, activeTabId, true);
    }
  });

  // Home button
  container.querySelector('#btn-home')?.addEventListener('click', () => {
    const homeUrl = SEARCH_ENGINES[currentEngine]?.home || DEFAULT_HOME;
    navigate(container, activeTabId, homeUrl);
  });

  // New Tab button
  container.querySelector('#btn-new-tab')?.addEventListener('click', () => openNewTab(container));
}

/* ─────────────────────────────────────────
   BOOKMARKS WIRING
───────────────────────────────────────── */
function wireBookmarks(container) {
  container.querySelector('#bookmarks-bar')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.bm-btn');
    if (!btn) return;
    navigate(container, activeTabId, btn.dataset.url);
  });
}
