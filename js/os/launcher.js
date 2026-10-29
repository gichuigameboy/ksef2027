/**
 * DawamuOS - Modern Floating Application Launcher (Start Menu)
 * Integrated with real student profile, categorized apps, active search,
 * real recent documents opening via dawamuOS.openFile, and power controls.
 */

import { stateStore } from './state.js';

class Launcher {
  constructor() {
    this.overlayEl = null;
    this.apps = [];
    this.activeCategory = 'all';
  }

  init(overlayElement, appRegistry) {
    this.overlayEl = overlayElement;
    this.apps = appRegistry;

    this.render();
    this.attachEvents();

    stateStore.subscribe(() => {
      if (this.overlayEl?.classList.contains('open')) {
        this.updateProfileAndRecents();
      }
    });
  }

  render() {
    const state = stateStore.getState();
    const currentUser = state.currentUser || { name: 'Brian Ochieng', admNo: '1001', grade: 'Form 1' };
    const initials = currentUser.name
      ? currentUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
      : 'ST';

    this.overlayEl.innerHTML = `
      <div class="win-start-menu p-5 flex flex-col h-full select-none gap-3.5">
        <!-- Search Header -->
        <div class="flex items-center gap-2.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3.5 py-2.5 focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-inner">
          <i class="fas fa-search text-slate-400 text-xs"></i>
          <input type="text" id="launcher-search-input" placeholder="Type to search applications, subjects, files..."
            autocomplete="off" class="bg-transparent outline-none text-xs text-white placeholder-slate-500 flex-1 font-sans">
          <button id="launcher-clear-search" class="hidden text-slate-500 hover:text-slate-300 text-xs">
            <i class="fas fa-times-circle"></i>
          </button>
        </div>

        <!-- Category Filter Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto text-xs pb-0.5 no-scrollbar">
          <button class="launcher-cat-btn px-3 py-1 rounded-lg font-semibold transition-all ${this.activeCategory === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white'}" data-cat="all">
            All Apps
          </button>
          <button class="launcher-cat-btn px-3 py-1 rounded-lg font-semibold transition-all ${this.activeCategory === 'study' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white'}" data-cat="study">
            <i class="fas fa-graduation-cap mr-1 text-[10px]"></i> Study & AI
          </button>
          <button class="launcher-cat-btn px-3 py-1 rounded-lg font-semibold transition-all ${this.activeCategory === 'office' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white'}" data-cat="office">
            <i class="fas fa-briefcase mr-1 text-[10px]"></i> Office & Tools
          </button>
        </div>

        <!-- Scrollable Middle Section: App Grid & Recents -->
        <div class="flex-1 overflow-y-auto space-y-4 min-h-0 pr-1">
          <div>
            <div class="flex items-center justify-between mb-2 px-1">
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Installed Applications</span>
              <span id="launcher-app-count" class="text-[10px] text-slate-500 font-mono">${this.apps.length} apps</span>
            </div>
            <div id="launcher-app-grid" class="grid grid-cols-4 gap-2.5">
              ${this.renderAppItems(this.filterApps())}
            </div>
          </div>

          <!-- Recent Documents & Learning Items -->
          <div class="border-t border-slate-800/80 pt-3">
            <div class="flex items-center justify-between mb-2 px-1">
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Recent Documents & KCSE Notes</span>
              <span class="text-[10px] text-emerald-400/80 font-medium cursor-pointer hover:underline" id="launcher-open-explorer-btn">Browse Files</span>
            </div>
            <div id="launcher-recent-list" class="space-y-1 text-xs">
              ${this.renderRecentItems()}
            </div>
          </div>
        </div>

        <!-- Footer / Student Profile & Power Controls -->
        <div class="border-t border-slate-800/80 pt-3 flex items-center justify-between">
          <div class="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity" id="launcher-user-card" title="Click to view Settings & Accounts">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-emerald-950/50 border border-emerald-400/30">
              ${initials}
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-white leading-tight flex items-center gap-1.5">
                ${currentUser.name || 'Student User'}
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 font-mono uppercase">${currentUser.role || 'student'}</span>
              </span>
              <span class="text-[10px] text-slate-400 leading-tight">Adm: ${currentUser.admNo || '1001'} &bull; ${currentUser.grade || 'Form 1'}</span>
            </div>
          </div>

          <!-- Power Controls -->
          <div class="flex items-center gap-1">
            <button id="start-signout-btn" class="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-amber-400 transition-colors" title="Sign Out">
              <i class="fas fa-sign-out-alt text-xs"></i>
            </button>
            <button id="start-reboot-btn" class="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-colors" title="Restart OS">
              <i class="fas fa-redo text-xs"></i>
            </button>
            <button id="start-shutdown-btn" class="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-colors" title="Shut Down OS">
              <i class="fas fa-power-off text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  filterApps(searchQuery = '') {
    let list = this.apps;
    const currentUser = stateStore.getCurrentStudent() || { role: 'student' };
    const isStudent = (currentUser.role || 'student').toLowerCase() === 'student';
    if (isStudent) {
      list = list.filter((a) => a.id !== 'registry');
    }

    if (this.activeCategory === 'study') {
      const studyIds = ['eduguard', 'books844', 'docs', 'classroom', 'offlineBrowser', 'focusTimer'];
      list = list.filter((a) => studyIds.includes(a.id));
    } else if (this.activeCategory === 'office') {
      const officeIds = ['word', 'spreadsheet', 'database', 'calculator', 'explorer', 'browser', 'settings', 'adminPanel', 'registry'];
      list = list.filter((a) => officeIds.includes(a.id));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) => a.title.toLowerCase().includes(q) || (a.keywords && a.keywords.some((k) => k.includes(q)))
      );
    }

    return list;
  }

  renderAppItems(appList) {
    if (appList.length === 0) {
      return `<div class="col-span-4 text-center py-8 text-slate-500 text-xs">No matching applications found</div>`;
    }

    return appList
      .map(
        (app) => `
      <button class="app-grid-item launcher-app-item p-2.5 rounded-2xl hover:bg-white/10 border border-transparent hover:border-white/15 flex flex-col items-center gap-1.5 text-center transition-all duration-150 active:scale-95 cursor-pointer group shadow-sm" data-app-id="${app.id}" title="Launch ${app.title}">
        <div class="w-11 h-11 rounded-2xl ${app.bgColor || 'bg-emerald-800'} flex items-center justify-center text-xl text-white shadow-lg shadow-black/30 group-hover:scale-105 transition-transform duration-150 border border-white/20">
          ${app.icon}
        </div>
        <span class="text-[11px] font-medium text-slate-200 group-hover:text-white line-clamp-1 truncate w-full leading-tight transition-colors">${app.title}</span>
      </button>
    `
      )
      .join('');
  }

  renderRecentItems() {
    const docs = stateStore.getState().documents || [];
    if (docs.length > 0) {
      return docs.slice(0, 3).map((doc) => `
        <div class="recent-item flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors border border-transparent hover:border-white/10" data-doc-id="${doc.id}" title="Open document">
          <i class="fas fa-file-alt text-emerald-400 w-4 text-center text-sm"></i>
          <span class="flex-1 text-slate-200 font-medium truncate">${doc.title}</span>
          <span class="text-[10px] text-slate-400 font-mono">Saved</span>
        </div>
      `).join('');
    }

    // Default curated academic files
    return `
      <div class="recent-item flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors border border-transparent hover:border-white/10" data-filename="KCSE_Form4_Math_Calculus.docx">
        <i class="fas fa-file-word text-blue-400 w-4 text-center text-sm"></i>
        <span class="flex-1 text-slate-200 font-medium truncate">KCSE_Form4_Math_Calculus.docx</span>
        <span class="text-[10px] text-slate-400">Today</span>
      </div>
      <div class="recent-item flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors border border-transparent hover:border-white/10" data-filename="Biology_Osmosis_Lab_Report.docx">
        <i class="fas fa-file-word text-emerald-400 w-4 text-center text-sm"></i>
        <span class="flex-1 text-slate-200 font-medium truncate">Biology_Osmosis_Lab_Report.docx</span>
        <span class="text-[10px] text-slate-400">Yesterday</span>
      </div>
    `;
  }

  updateProfileAndRecents() {
    const state = stateStore.getState();
    const currentUser = state.currentUser || { name: 'Brian Ochieng', admNo: '1001', grade: 'Form 1' };
    const initials = currentUser.name
      ? currentUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
      : 'ST';

    const userCard = this.overlayEl.querySelector('#launcher-user-card');
    if (userCard) {
      userCard.innerHTML = `
        <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-emerald-950/50 border border-emerald-400/30">
          ${initials}
        </div>
        <div class="flex flex-col">
          <span class="text-xs font-bold text-white leading-tight flex items-center gap-1.5">
            ${currentUser.name || 'Student User'}
            <span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 font-mono uppercase">${currentUser.role || 'student'}</span>
          </span>
          <span class="text-[10px] text-slate-400 leading-tight">Adm: ${currentUser.admNo || '1001'} &bull; ${currentUser.grade || 'Form 1'}</span>
        </div>
      `;
    }

    const recentList = this.overlayEl.querySelector('#launcher-recent-list');
    if (recentList) recentList.innerHTML = this.renderRecentItems();
  }

  attachEvents() {
    const searchInput = this.overlayEl.querySelector('#launcher-search-input');
    const clearSearch = this.overlayEl.querySelector('#launcher-clear-search');
    const appGrid = this.overlayEl.querySelector('#launcher-app-grid');
    const countEl = this.overlayEl.querySelector('#launcher-app-count');

    // Search event
    searchInput?.addEventListener('input', (e) => {
      const q = e.target.value;
      if (clearSearch) {
        if (q) clearSearch.classList.remove('hidden');
        else clearSearch.classList.add('hidden');
      }

      const filtered = this.filterApps(q);
      if (appGrid) appGrid.innerHTML = this.renderAppItems(filtered);
      if (countEl) countEl.textContent = `${filtered.length} app${filtered.length === 1 ? '' : 's'}`;
    });

    clearSearch?.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      clearSearch.classList.add('hidden');
      const filtered = this.filterApps();
      if (appGrid) appGrid.innerHTML = this.renderAppItems(filtered);
      if (countEl) countEl.textContent = `${filtered.length} app${filtered.length === 1 ? '' : 's'}`;
    });

    // Category filter pills
    this.overlayEl.querySelectorAll('.launcher-cat-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.dataset.cat;
        this.overlayEl.querySelectorAll('.launcher-cat-btn').forEach((b) => {
          b.className = `launcher-cat-btn px-3 py-1 rounded-lg font-semibold transition-all ${
            b.dataset.cat === this.activeCategory
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white'
          }`;
        });

        const q = searchInput ? searchInput.value : '';
        const filtered = this.filterApps(q);
        if (appGrid) appGrid.innerHTML = this.renderAppItems(filtered);
        if (countEl) countEl.textContent = `${filtered.length} app${filtered.length === 1 ? '' : 's'}`;
      });
    });

    // Main overlay click dispatcher
    this.overlayEl.addEventListener('click', async (e) => {
      const item = e.target.closest('.app-grid-item, .launcher-app-item');
      if (item) {
        const appId = item.dataset.appId;
        const appData = this.apps.find((a) => a.id === appId);
        if (appData) {
          this.close();
          appData.launch();
        }
        return;
      }

      const recentItem = e.target.closest('.recent-item');
      if (recentItem) {
        const docId = recentItem.dataset.docId;
        const filename = recentItem.dataset.filename;
        this.close();

        if (docId) {
          const doc = (stateStore.getState().documents || []).find((d) => d.id === docId);
          if (doc && window.dawamuOS?.openFile) {
            window.dawamuOS.openFile({ fileName: doc.title + '.docx', fileData: doc.content });
            return;
          }
        } else if (filename && window.dawamuOS?.openFile) {
          window.dawamuOS.openFile({ fileName: filename });
          return;
        }
      }

      const openExplorerBtn = e.target.closest('#launcher-open-explorer-btn');
      if (openExplorerBtn) {
        this.close();
        const explorerApp = this.apps.find((a) => a.id === 'explorer');
        if (explorerApp) explorerApp.launch();
        return;
      }

      const userCard = e.target.closest('#launcher-user-card');
      if (userCard) {
        this.close();
        const settingsApp = this.apps.find((a) => a.id === 'settings');
        if (settingsApp) settingsApp.launch();
        return;
      }

      // Power actions with unified confirmation dialogs
      const signoutBtn = e.target.closest('#start-signout-btn');
      if (signoutBtn) {
        this.close();
        if (window.dawamuDialogs?.confirm) {
          const ok = await window.dawamuDialogs.confirm({
            title: 'Sign Out Student',
            message: 'Are you sure you want to sign out and return to the login screen?',
            confirmText: 'Sign Out'
          });
          if (!ok) return;
        }
        if (window.dawamuPower) window.dawamuPower.signOut();
        return;
      }

      const rebootBtn = e.target.closest('#start-reboot-btn');
      if (rebootBtn) {
        this.close();
        if (window.dawamuDialogs?.confirm) {
          const ok = await window.dawamuDialogs.confirm({
            title: 'Restart DawamuOS',
            message: 'Are you sure you want to restart the operating system session?',
            confirmText: 'Restart'
          });
          if (!ok) return;
        }
        if (window.dawamuPower) window.dawamuPower.reboot();
        return;
      }

      const shutdownBtn = e.target.closest('#start-shutdown-btn');
      if (shutdownBtn) {
        this.close();
        if (window.dawamuDialogs?.confirm) {
          const ok = await window.dawamuDialogs.confirm({
            title: 'Shut Down DawamuOS',
            message: 'Are you sure you want to power off the system?',
            confirmText: 'Power Off',
            danger: true
          });
          if (!ok) return;
        }
        if (window.dawamuPower) window.dawamuPower.shutdown();
        return;
      }
    });

    // Close on clicking outside launcher or pressing Escape
    document.addEventListener('click', (e) => {
      if (
        !this.overlayEl.contains(e.target) &&
        !e.target.closest('#everything-btn') &&
        !e.target.closest('#taskbar-search-btn')
      ) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlayEl.classList.contains('open')) {
        this.close();
      }
    });
  }

  open() {
    document.getElementById('quick-settings-overlay')?.classList.remove('open');
    this.updateProfileAndRecents();
    this.overlayEl.classList.add('open');
    const searchInput = this.overlayEl.querySelector('#launcher-search-input');
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100);
    }
  }

  close() {
    this.overlayEl.classList.remove('open');
  }

  toggle() {
    if (this.overlayEl.classList.contains('open')) {
      this.close();
    } else {
      this.open();
    }
  }
}

export const launcher = new Launcher();
