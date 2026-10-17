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
      <div class="win-start-menu p-6 flex flex-col justify-between h-full select-none">
        <!-- Search Bar -->
        <div class="win-search-box flex items-center gap-3 bg-white/5 hover:bg-white/10 focus-within:bg-[#0f172a] focus-within:border-emerald-500 border border-white/10 rounded-2xl px-4 py-3 transition-all mb-6 shadow-inner">
          <i class="fas fa-search text-emerald-400 text-sm"></i>
          <input type="text" id="launcher-search-input" placeholder="Search apps, lessons, files, settings..." autocomplete="off" class="bg-transparent outline-none text-xs text-white placeholder-slate-400 flex-1 font-medium">
        </div>

        <!-- Pinned Section -->
        <div class="flex-1 overflow-y-auto space-y-6">
          <div>
            <div class="flex items-center justify-between px-1 mb-3">
              <span class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <i class="fas fa-th-large text-emerald-400 text-[11px]"></i>
                <span>Pinned Applications</span>
              </span>
              <span class="text-[10px] text-emerald-400 font-semibold cursor-pointer hover:underline">All Apps &gt;</span>
            </div>

            <div id="launcher-app-grid" class="grid grid-cols-4 gap-2.5">
              ${this.renderAppItems(this.apps)}
            </div>
          </div>

          <!-- Recommended / Recent Documents -->
          <div>
            <div class="flex items-center justify-between px-1 mb-2.5">
              <span class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <i class="fas fa-clock text-blue-400 text-[11px]"></i>
                <span>Recent School Work</span>
              </span>
              <span class="text-[10px] text-slate-500">More &gt;</span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="recent-item p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 flex items-center gap-3 cursor-pointer transition-all shadow-sm hover:-translate-y-0.5">
                <i class="fas fa-file-word text-blue-400 text-xl"></i>
                <div class="truncate">
                  <div class="font-semibold text-slate-200 truncate">Biology Photosynthesis.docx</div>
                  <div class="text-[10px] text-slate-500">Opened today • 10:14 AM</div>
                </div>
              </div>

              <div class="recent-item p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 flex items-center gap-3 cursor-pointer transition-all shadow-sm hover:-translate-y-0.5">
                <i class="fas fa-file-pdf text-rose-400 text-xl"></i>
                <div class="truncate">
                  <div class="font-semibold text-slate-200 truncate">Math Quadratic Equations.pdf</div>
                  <div class="text-[10px] text-slate-500">Opened yesterday</div>
                </div>
              </div>

              <div class="recent-item p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 flex items-center gap-3 cursor-pointer transition-all shadow-sm hover:-translate-y-0.5">
                <i class="fas fa-globe text-emerald-400 text-xl"></i>
                <div class="truncate">
                  <div class="font-semibold text-slate-200 truncate">History of Kenya (Offline)</div>
                  <div class="text-[10px] text-slate-500">Encyclopedia Snapshot</div>
                </div>
              </div>

              <div class="recent-item p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 flex items-center gap-3 cursor-pointer transition-all shadow-sm hover:-translate-y-0.5">
                <i class="fas fa-atom text-cyan-400 text-xl"></i>
                <div class="truncate">
                  <div class="font-semibold text-slate-200 truncate">Physics Newton Laws</div>
                  <div class="text-[10px] text-slate-500">Khan Academy Offline</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Profile & Power Controls Footer -->
        <div class="border-t border-white/10 pt-3.5 mt-4 flex items-center justify-between">
          <div class="flex items-center gap-3 hover:bg-white/5 p-2 rounded-xl cursor-pointer transition-colors">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-emerald-900/40">
              <i class="fas fa-user-graduate"></i>
            </div>
            <div>
              <div class="text-xs font-bold text-white">Student Account</div>
              <div class="text-[10px] text-emerald-400 font-medium">Dawamu OS • Safe Kiosk</div>
            </div>
          </div>

          <!-- Power Button Menu -->
          <div class="flex items-center gap-1.5">
            <button id="start-signout-btn" class="p-2.5 rounded-xl bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-white/5 hover:border-amber-500/30 transition-all" title="Sign Out">
              <i class="fas fa-sign-out-alt text-xs"></i>
            </button>
            <button id="start-reboot-btn" class="p-2.5 rounded-xl bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 border border-white/5 hover:border-blue-500/30 transition-all" title="Restart PC">
              <i class="fas fa-redo text-xs"></i>
            </button>
            <button id="start-shutdown-btn" class="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 transition-all" title="Shut Down">
              <i class="fas fa-power-off text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderAppItems(appList) {
    if (appList.length === 0) {
      return `<div class="col-span-4 text-center py-8 text-slate-400 text-xs">No apps match your search query</div>`;
    }

    return appList
      .map(
        (app) => `
      <button class="app-grid-item p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/40 flex flex-col items-center justify-center gap-2 text-center transition-all group active:scale-95 shadow-sm hover:shadow-lg hover:-translate-y-0.5" data-app-id="${app.id}">
        <div class="w-11 h-11 rounded-xl ${app.bgColor || 'bg-emerald-800'} flex items-center justify-center text-xl text-white group-hover:scale-110 transition-transform shadow-md">
          ${app.icon}
        </div>
        <span class="text-[11px] font-semibold text-slate-200 group-hover:text-white line-clamp-1 truncate w-full">${app.title}</span>
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
