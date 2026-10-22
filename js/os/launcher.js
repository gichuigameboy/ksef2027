/**
 * Dawamu OS - Windows 11 Style Floating Start Menu
 */

class Launcher {
  constructor() {
    this.overlayEl = null;
    this.apps = [];
  }

  init(overlayElement, appRegistry) {
    this.overlayEl = overlayElement;
    this.apps = appRegistry;

    this.render();
    this.attachEvents();
  }

  render() {
    this.overlayEl.innerHTML = `
      <div class="win-start-menu p-5 flex flex-col h-full select-none gap-4">

        <!-- Search -->
        <div class="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-emerald-500/60 transition-colors">
          <i class="fas fa-search text-slate-500 text-xs"></i>
          <input type="text" id="launcher-search-input" placeholder="Search apps..."
            autocomplete="off" class="bg-transparent outline-none text-xs text-white placeholder-slate-500 flex-1">
        </div>

        <!-- App Grid -->
        <div class="flex-1 overflow-y-auto space-y-4 min-h-0">
          <div>
            <p class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 px-0.5">Apps</p>
            <div id="launcher-app-grid" class="grid grid-cols-4 gap-2">
              ${this.renderAppItems(this.apps)}
            </div>
          </div>

          <!-- Recent -->
          <div>
            <p class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 px-0.5">Recent</p>
            <div class="space-y-0.5 text-xs">
              <div class="recent-item flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                <i class="fas fa-file-word text-blue-400 w-4 text-center text-sm"></i>
                <span class="flex-1 text-slate-300 truncate">Biology Photosynthesis.docx</span>
                <span class="text-[10px] text-slate-600">Today</span>
              </div>
              <div class="recent-item flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                <i class="fas fa-file-pdf text-rose-400 w-4 text-center text-sm"></i>
                <span class="flex-1 text-slate-300 truncate">Math Quadratic Equations.pdf</span>
                <span class="text-[10px] text-slate-600">Yesterday</span>
              </div>
              <div class="recent-item flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                <i class="fas fa-atom text-cyan-400 w-4 text-center text-sm"></i>
                <span class="flex-1 text-slate-300 truncate">Physics Newton Laws</span>
                <span class="text-[10px] text-slate-600">Khan Academy</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-white/10 pt-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-md bg-emerald-700 flex items-center justify-center text-white text-xs">
              <i class="fas fa-user-graduate"></i>
            </div>
            <span class="text-xs text-slate-300">Student</span>
          </div>
          <div class="flex items-center gap-0.5">
            <button id="start-signout-btn" class="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-amber-400 transition-colors" title="Sign Out">
              <i class="fas fa-sign-out-alt text-xs"></i>
            </button>
            <button id="start-reboot-btn" class="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-blue-400 transition-colors" title="Restart">
              <i class="fas fa-redo text-xs"></i>
            </button>
            <button id="start-shutdown-btn" class="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-rose-400 transition-colors" title="Shut Down">
              <i class="fas fa-power-off text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderAppItems(appList) {
    if (appList.length === 0) {
      return `<div class="col-span-4 text-center py-8 text-slate-500 text-xs">No apps found</div>`;
    }

    return appList
      .map(
        (app) => `
      <button class="app-grid-item p-2 rounded-xl hover:bg-white/6 border border-transparent hover:border-white/8 flex flex-col items-center gap-1.5 text-center transition-colors active:scale-95 cursor-pointer" data-app-id="${app.id}">
        <div class="w-10 h-10 rounded-lg ${app.bgColor || 'bg-emerald-800'} flex items-center justify-center text-lg text-white">
          ${app.icon}
        </div>
        <span class="text-[10px] text-slate-400 line-clamp-1 truncate w-full leading-tight">${app.title}</span>
      </button>
    `
      )
      .join('');
  }

  attachEvents() {
    const searchInput = this.overlayEl.querySelector('#launcher-search-input');
    const appGrid = this.overlayEl.querySelector('#launcher-app-grid');

    searchInput?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = this.apps.filter(
        (a) => a.title.toLowerCase().includes(q) || (a.keywords && a.keywords.some((k) => k.includes(q)))
      );
      if (appGrid) appGrid.innerHTML = this.renderAppItems(filtered);
    });

    this.overlayEl.addEventListener('click', (e) => {
      const item = e.target.closest('.app-grid-item');
      if (item) {
        const appId = item.dataset.appId;
        const appData = this.apps.find((a) => a.id === appId);
        if (appData) {
          this.close();
          appData.launch();
        }
        return;
      }

      const signoutBtn = e.target.closest('#start-signout-btn');
      if (signoutBtn) {
        this.close();
        if (window.dawamuPower) window.dawamuPower.signOut();
        return;
      }

      const rebootBtn = e.target.closest('#start-reboot-btn');
      if (rebootBtn) {
        this.close();
        if (window.dawamuPower) window.dawamuPower.reboot();
        return;
      }

      const shutdownBtn = e.target.closest('#start-shutdown-btn');
      if (shutdownBtn) {
        this.close();
        if (window.dawamuPower) window.dawamuPower.shutdown();
        return;
      }
    });

    document.addEventListener('click', (e) => {
      if (!this.overlayEl.contains(e.target) && !e.target.closest('#everything-btn') && !e.target.closest('#taskbar-search-btn')) {
        this.close();
      }
    });
  }

  close() {
    this.overlayEl.classList.remove('open');
  }
}

export const launcher = new Launcher();
