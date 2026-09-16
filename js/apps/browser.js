/**
 * ChromeOS Student Edition - Real Working School Mode Web Browser
 */

import { restrictionManager } from '../os/restrictionManager.js';

export function createBrowserApp() {
  const container = document.createElement('div');
  container.className = 'flex flex-col h-full bg-slate-900 text-slate-100 font-sans';

  let currentUrl = 'https://en.m.wikipedia.org/wiki/Solar_System';
  let history = [currentUrl];
  let historyIndex = 0;

  container.innerHTML = `
    <!-- Browser Top Bar -->
    <div class="bg-slate-800 border-b border-slate-700/80 p-2 flex items-center gap-2">
      <div class="flex items-center gap-1 text-slate-300">
        <button id="browser-back" class="p-1.5 hover:bg-slate-700 rounded-full text-xs disabled:opacity-40" disabled title="Back"><i class="fas fa-arrow-left"></i></button>
        <button id="browser-forward" class="p-1.5 hover:bg-slate-700 rounded-full text-xs disabled:opacity-40" disabled title="Forward"><i class="fas fa-arrow-right"></i></button>
        <button id="browser-reload" class="p-1.5 hover:bg-slate-700 rounded-full text-xs" title="Reload"><i class="fas fa-redo"></i></button>
      </div>

      <!-- Address Bar -->
      <div class="flex-1 bg-slate-950/90 border border-slate-700 rounded-full px-3 py-1 flex items-center gap-2 text-xs focus-within:border-blue-500 shadow-inner">
        <i class="fas fa-lock text-emerald-400 text-xs" title="Safe School Network Connection"></i>
        <input type="text" id="browser-address" class="bg-transparent border-none outline-none text-slate-100 w-full font-mono text-xs" value="${currentUrl}" placeholder="Search Wikipedia, Google, or enter web address...">
        <span class="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-semibold">Live SafeSearch</span>
      </div>

      <button id="browser-go" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors shadow-md">
        Go
      </button>
    </div>

    <!-- Bookmarks Bar -->
    <div class="bg-slate-800/80 border-b border-slate-700/50 px-3 py-1 flex items-center gap-3 text-xs overflow-x-auto">
      <span class="text-slate-400 text-[11px] font-semibold">Quick Bookmarks:</span>
      <button class="bm-btn flex items-center gap-1.5 hover:text-blue-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700/60" data-url="https://en.m.wikipedia.org">
        <i class="fab fa-wikipedia-w text-gray-300"></i> Wikipedia
      </button>
      <button class="bm-btn flex items-center gap-1.5 hover:text-blue-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700/60" data-url="https://www.khanacademy.org">
        <i class="fas fa-leaf text-emerald-400"></i> Khan Academy
      </button>
      <button class="bm-btn flex items-center gap-1.5 hover:text-blue-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700/60" data-url="https://www.nasa.gov">
        <i class="fas fa-rocket text-indigo-400"></i> NASA
      </button>
      <button class="bm-btn flex items-center gap-1.5 hover:text-blue-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700/60" data-url="https://www.gutenberg.org">
        <i class="fas fa-book text-amber-400"></i> Free Library
      </button>
      <button class="bm-btn flex items-center gap-1.5 hover:text-rose-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700/60 text-rose-300" data-url="https://roblox.com">
        <i class="fas fa-gamepad text-rose-400"></i> Roblox (Blocked Test)
      </button>
    </div>

    <!-- Web Page Frame Viewport Canvas -->
    <div id="browser-viewport" class="flex-1 relative bg-slate-950 overflow-hidden">
    </div>
  `;

  const addressInput = container.querySelector('#browser-address');
  const goBtn = container.querySelector('#browser-go');
  const backBtn = container.querySelector('#browser-back');
  const forwardBtn = container.querySelector('#browser-forward');
  const reloadBtn = container.querySelector('#browser-reload');
  const viewport = container.querySelector('#browser-viewport');

  const navigateTo = (url) => {
    let target = url.trim();
    if (!target) return;

    // Check if user entered a search query or URL
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (target.includes('.') && !target.includes(' ')) {
        target = 'https://' + target;
      } else {
        // Treat as live Safe Search Query!
        const searchCheck = restrictionManager.inspectSearchQuery(target);
        if (!searchCheck.safe) {
          renderBlockPage(target, searchCheck.reason);
          return;
        }
        target = `https://en.m.wikipedia.org/w/index.php?search=${encodeURIComponent(target)}`;
      }
    }

    // Evaluate School Policy & Domain Restrictions
    const access = restrictionManager.checkUrlAccess(target);
    if (!access.allowed) {
      renderBlockPage(target, access.reason);
      return;
    }

    currentUrl = target;
    addressInput.value = currentUrl;
    renderLiveFrame(currentUrl);

    // Update browser history
    if (history[historyIndex] !== target) {
      history = history.slice(0, historyIndex + 1);
      history.push(target);
      historyIndex = history.length - 1;
    }
    updateNavButtons();
  };

  const updateNavButtons = () => {
    backBtn.disabled = historyIndex <= 0;
    forwardBtn.disabled = historyIndex >= history.length - 1;
  };

  const renderBlockPage = (blockedUrl, reason) => {
    addressInput.value = blockedUrl;
    viewport.innerHTML = `
      <div class="h-full overflow-y-auto p-8 flex items-center justify-center bg-slate-950">
        <div class="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl animate-fade-in space-y-6">
          <div class="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto text-3xl border border-rose-500/30">
            <i class="fas fa-shield-alt"></i>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-white mb-2">Access Restricted by Administrator</h2>
            <p class="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
              ${reason || 'This web page or search request is blocked in accordance with Lincoln High School district safety and focus guidelines.'}
            </p>
          </div>

          <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left font-mono text-xs text-rose-300 space-y-1">
            <div><b class="text-slate-400">Target URL:</b> ${blockedUrl}</div>
            <div><b class="text-slate-400">Security Group:</b> Anti-Distraction & Student Safety</div>
            <div><b class="text-slate-400">Network Firewall:</b> District Managed Whitelist</div>
          </div>

          <div class="flex items-center justify-center gap-3">
            <button id="req-unblock-btn" class="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-5 py-2.5 rounded-full transition-colors flex items-center gap-2">
              <i class="fas fa-paper-plane"></i> Request Unblock from Teacher
            </button>
            <button id="return-safe-btn" class="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-2.5 rounded-full transition-colors">
              Return to Safe Library
            </button>
          </div>
        </div>
      </div>
    `;

    viewport.querySelector('#return-safe-btn')?.addEventListener('click', () => {
      navigateTo('https://en.m.wikipedia.org');
    });

    viewport.querySelector('#req-unblock-btn')?.addEventListener('click', (e) => {
      e.target.disabled = true;
      e.target.innerHTML = '<i class="fas fa-check"></i> Request Sent to Administrator';
      e.target.className = 'bg-emerald-600 text-white font-semibold text-xs px-5 py-2.5 rounded-full cursor-default';
    });
  };

  const renderLiveFrame = (url) => {
    viewport.innerHTML = `
      <div class="w-full h-full flex flex-col">
        <!-- Live Loading Status Bar -->
        <div id="iframe-status-bar" class="bg-slate-900 border-b border-slate-800 px-3 py-1 flex items-center justify-between text-[11px] text-slate-400">
          <span class="flex items-center gap-2">
            <i class="fas fa-circle-notch fa-spin text-blue-400" id="iframe-spinner"></i>
            <span id="iframe-status-text">Loading live web page...</span>
          </span>
          <a href="${url}" target="_blank" class="hover:text-blue-400 flex items-center gap-1 font-semibold">
            Open in new tab <i class="fas fa-external-link-alt text-[10px]"></i>
          </a>
        </div>

        <!-- Live IFrame Element -->
        <iframe 
          id="live-browser-iframe"
          src="${url}" 
          class="flex-1 w-full h-full border-none bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          title="School Mode Web Browser Frame">
        </iframe>
      </div>
    `;

    const iframe = viewport.querySelector('#live-browser-iframe');
    const spinner = viewport.querySelector('#iframe-spinner');
    const statusText = viewport.querySelector('#iframe-status-text');

    if (iframe) {
      iframe.addEventListener('load', () => {
        if (spinner) spinner.style.display = 'none';
        if (statusText) statusText.textContent = `Connected to ${url}`;
      });

      iframe.addEventListener('error', () => {
        if (statusText) statusText.textContent = 'Failed to load page. Connection timed out.';
      });
    }
  };

  // Attach Event Listeners
  goBtn.addEventListener('click', () => navigateTo(addressInput.value));
  addressInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') navigateTo(addressInput.value);
  });

  backBtn.addEventListener('click', () => {
    if (historyIndex > 0) {
      historyIndex--;
      navigateTo(history[historyIndex]);
    }
  });

  forwardBtn.addEventListener('click', () => {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      navigateTo(history[historyIndex]);
    }
  });

  reloadBtn.addEventListener('click', () => navigateTo(currentUrl));

  container.querySelectorAll('.bm-btn').forEach((btn) => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.url));
  });

  // Load initial URL
  navigateTo(currentUrl);

  return container;
}
