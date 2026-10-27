/**
 * Dawamu OS - Modern Desktop Taskbar & System Tray
 * Handles pinned applications, dynamic running window lifecycle, window states, and system tray.
 */

import { windowManager } from './windowManager.js';
import { stateStore } from './state.js';
import { launcher } from './launcher.js';
import { quickSettings } from './quickSettings.js';

const PINNED_APP_IDS = ['explorer', 'browser', 'offlineBrowser', 'eduguard', 'word', 'spreadsheet', 'classroom'];

class Shelf {
  constructor() {
    this.shelfEl = null;
    this.apps = [];
    this.hotzoneEl = null;
    this._hideDockTimer = null;
    this._isHoveringShelf = false;
    this._autoHideBound = false;
  }

  init(shelfElement, appRegistry) {
    this.shelfEl = shelfElement;
    this.apps = appRegistry;

    this.render();
    this.startClock();
    this.setupBattery();
    this.setupFullscreenAutoHide();

    // Subscribe to window changes to update dynamic running tasks, active pills, and fullscreen dock auto-hide
    windowManager.subscribe(() => {
      this.updateTaskbarApps();
      this.updateAppIndicators();
      this.syncFullscreenDockState();
    });

    stateStore.subscribe(() => this.updateStatusTray());
    this.syncFullscreenDockState();
  }

  setupFullscreenAutoHide() {
    if (typeof document === 'undefined') return;

    let hotzone = document.getElementById('dock-hotzone');
    if (!hotzone) {
      hotzone = document.createElement('div');
      hotzone.id = 'dock-hotzone';
      hotzone.setAttribute('aria-hidden', 'true');
      document.body.appendChild(hotzone);
    }
    this.hotzoneEl = hotzone;

    if (this._autoHideBound) return;
    this._autoHideBound = true;

    const onBottomEdgeTrigger = () => {
      if (document.body.classList.contains('has-fullscreen-window')) {
        this.revealDock();
      }
    };

    this.hotzoneEl.addEventListener('mouseenter', onBottomEdgeTrigger);
    this.hotzoneEl.addEventListener('mousemove', onBottomEdgeTrigger, { passive: true });

    this.shelfEl?.addEventListener('mouseenter', () => {
      this._isHoveringShelf = true;
      if (document.body.classList.contains('has-fullscreen-window')) {
        this.revealDock();
      }
    });

    this.shelfEl?.addEventListener('mouseleave', () => {
      this._isHoveringShelf = false;
      if (document.body.classList.contains('has-fullscreen-window')) {
        this.scheduleHideDock(240);
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!document.body.classList.contains('has-fullscreen-window')) return;
      const distFromBottom = window.innerHeight - e.clientY;
      if (distFromBottom <= 14) {
        this.revealDock();
      } else if (document.body.classList.contains('dock-revealed')) {
        if (distFromBottom <= 82 || this._isHoveringShelf) {
          clearTimeout(this._hideDockTimer);
        } else {
          this.scheduleHideDock(220);
        }
      }
    }, { passive: true });

    window.addEventListener('wheel', (e) => {
      if (!document.body.classList.contains('has-fullscreen-window')) return;
      const distFromBottom = window.innerHeight - e.clientY;
      if (e.deltaY > 0 && distFromBottom <= 96) {
        this.revealDock();
      }
    }, { passive: true });
  }

  revealDock() {
    if (!document.body.classList.contains('has-fullscreen-window')) return;
    clearTimeout(this._hideDockTimer);
    document.body.classList.add('dock-revealed');
    this.shelfEl?.classList.add('dock-revealed');
  }

  scheduleHideDock(delay = 220) {
    clearTimeout(this._hideDockTimer);
    this._hideDockTimer = setTimeout(() => {
      if (!document.body.classList.contains('has-fullscreen-window')) return;
      const launcherOpen = document.getElementById('launcher-overlay')?.classList.contains('open');
      const qsOpen = document.getElementById('quick-settings-overlay')?.classList.contains('open');
      if (launcherOpen || qsOpen || this._isHoveringShelf) return;
      document.body.classList.remove('dock-revealed');
      this.shelfEl?.classList.remove('dock-revealed');
    }, delay);
  }

  syncFullscreenDockState() {
    if (typeof document === 'undefined') return;
    const isFullscreen = windowManager.hasFullscreenWindow();
    const wasFullscreen = document.body.classList.contains('has-fullscreen-window');

    document.body.classList.toggle('has-fullscreen-window', isFullscreen);
    this.shelfEl?.classList.toggle('dock-autohide', isFullscreen);

    if (!isFullscreen) {
      clearTimeout(this._hideDockTimer);
      document.body.classList.remove('dock-revealed');
      this.shelfEl?.classList.remove('dock-revealed');
    } else if (!wasFullscreen && isFullscreen) {
      clearTimeout(this._hideDockTimer);
      document.body.classList.remove('dock-revealed');
      this.shelfEl?.classList.remove('dock-revealed');
    }
  }

  render() {
    this.shelfEl.innerHTML = `
      <div class="flex items-center gap-2 h-full">
        <!-- Dawamu Launchpad / Start Button -->
        <button id="everything-btn" class="win-start-btn flex items-center justify-center p-1.5 rounded-2xl hover:bg-white/15 active:scale-95 transition-all text-white cursor-pointer group" title="Launchpad & Start Menu (DawamuOS)">
          <img src="assets/dawamu-logo.png" alt="Start" class="h-6 w-auto object-contain drop-shadow group-hover:scale-110 transition-transform">
        </button>

        <!-- Spotlight Search Bar Pill -->
        <button id="taskbar-search-btn" class="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 rounded-full px-3.5 py-1.5 text-xs text-slate-200 transition-all cursor-pointer shadow-sm">
          <i class="fas fa-search text-emerald-400 text-xs"></i>
          <span class="text-[11px] text-slate-200 font-medium font-sans pr-1">Spotlight</span>
          <span class="text-[9px] bg-white/15 text-slate-200 px-1.5 py-0.5 rounded-md font-mono border border-white/10">⌘Space</span>
        </button>

        <div class="dock-divider h-7 w-[1px] bg-white/20 mx-1"></div>

        <!-- Dynamic & Pinned Dock Apps -->
        <div id="shelf-pinned-apps" class="flex items-center gap-2"></div>
      </div>

      <div class="dock-divider h-7 w-[1px] bg-white/20 mx-1"></div>

      <!-- System Tray / macOS Control Center Pill -->
      <div class="flex items-center gap-2 h-full">
        <div id="status-tray" class="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl hover:bg-white/15 cursor-pointer text-slate-100 transition-all border border-white/15 bg-white/10" title="Control Center & System Status">
          <!-- Restriction Badge -->
          <div id="focus-mode-badge" class="hidden text-[10px] bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <i class="fas fa-lock text-[9px]"></i> Focus
          </div>

          <div class="flex items-center gap-2.5 text-xs text-slate-200">
            <i id="tray-wifi-icon" class="fas fa-wifi text-emerald-400 text-xs"></i>
            <i class="fas fa-sliders text-xs text-slate-200"></i>
            <span id="tray-battery" class="flex items-center gap-1 text-[11px] font-semibold">
              <i class="fas fa-battery-full text-xs text-emerald-400"></i> 100%
            </span>
          </div>

          <!-- Stacked Time & Date -->
          <div class="flex flex-col items-end text-[10px] font-sans leading-tight border-l border-white/20 pl-2.5 text-slate-200">
            <span id="tray-clock" class="font-bold text-white text-[11px]">10:24 AM</span>
            <span id="tray-date" class="text-[9px] text-slate-300">9/29/2026</span>
          </div>
        </div>

        <!-- Show Desktop Glass Pill -->
        <button id="win-show-desktop-btn" class="w-2.5 h-8 rounded-full border border-white/20 bg-white/10 hover:bg-white/25 transition-all ml-0.5 cursor-pointer" title="Show Desktop (Minimize All)"></button>
      </div>
    `;

    this.attachEvents();
    this.updateTaskbarApps();
    this.updateStatusTray();
  }

  /**
   * Render pinned applications + open running windows (no duplicate registrations or stale icons)
   */
  updateTaskbarApps() {
    const container = this.shelfEl?.querySelector('#shelf-pinned-apps');
    if (!container) return;

    // 1. Gather all pinned apps
    const taskbarAppIds = new Set(PINNED_APP_IDS);

    // 2. Add any running unpinned window ID
    windowManager.windows.forEach((_, id) => {
      taskbarAppIds.add(id);
    });

    // 3. Resolve app metadata
    const items = [];
    taskbarAppIds.forEach(id => {
      const registered = this.apps.find(a => a.id === id);
      const runningWin = windowManager.windows.get(id);

      if (registered) {
        items.push({
          id: registered.id,
          title: registered.title,
          icon: registered.icon,
          isPinned: PINNED_APP_IDS.includes(id),
          isRunning: !!runningWin,
          isFocused: windowManager.activeWindowId === id && !runningWin?.minimized,
          isMinimized: runningWin?.minimized
        });
      } else if (runningWin) {
        // App launched dynamically that wasn't in static registry
        items.push({
          id,
          title: runningWin.title || id,
          icon: runningWin.icon || '<i class="fas fa-window-maximize text-emerald-400"></i>',
          isPinned: false,
          isRunning: true,
          isFocused: windowManager.activeWindowId === id && !runningWin.minimized,
          isMinimized: runningWin.minimized
        });
      }
    });

    container.innerHTML = items.map(app => `
      <button class="app-shelf-btn relative p-2 rounded-2xl hover:bg-white/15 active:scale-95 flex items-center justify-center transition-all group cursor-pointer ${app.isRunning ? (app.isFocused ? 'bg-white/20 shadow-inner dock-app-focused' : 'bg-white/10 dock-app-running') : ''}" data-app-id="${app.id}" title="${app.title} ${app.isRunning ? (app.isFocused ? '(Active)' : '(Running)') : ''}">
        <span class="dock-tooltip">${app.title}</span>
        <span class="text-xl flex items-center justify-center dock-icon-glyph">${app.icon}</span>
        <!-- Active Luminescent Dot -->
        <span class="win-app-pill absolute bottom-0.5 rounded-full transition-all duration-200 ${app.isRunning ? (app.isFocused ? 'w-3.5 h-1 bg-emerald-400 opacity-100 shadow-[0_0_8px_rgba(52,211,153,0.9)]' : 'w-1.5 h-1.5 bg-white/85 opacity-90') : 'w-1 h-1 bg-white/40 opacity-0 group-hover:opacity-40'}"></span>
      </button>
    `).join('');

    this.updateAppIndicators();
  }

  attachEvents() {
    const launcherBtn = this.shelfEl.querySelector('#everything-btn');
    const searchBtn   = this.shelfEl.querySelector('#taskbar-search-btn');

    const toggleStart = (e) => {
      e.stopPropagation();
      launcher.toggle();
    };

    launcherBtn?.addEventListener('click', toggleStart);
    searchBtn?.addEventListener('click', toggleStart);

    // Keyboard shortcut to toggle launcher
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Meta' || (e.ctrlKey && e.code === 'Space')) {
        e.preventDefault();
        launcher.toggle();
      }
    });

    const pinnedContainer = this.shelfEl.querySelector('#shelf-pinned-apps');
    pinnedContainer?.addEventListener('click', (e) => {
      const btn = e.target.closest('.app-shelf-btn');
      if (!btn) return;

      const appId = btn.dataset.appId;
      const appData = this.apps.find((a) => a.id === appId);
      const activeWin = windowManager.windows.get(appId);

      if (activeWin) {
        if (windowManager.activeWindowId === appId && !activeWin.minimized) {
          windowManager.minimizeWindow(appId);
        } else {
          windowManager.restoreWindow(appId);
        }
      } else if (appData) {
        appData.launch();
      }
    });

    const statusTray = this.shelfEl.querySelector('#status-tray');
    statusTray?.addEventListener('click', (e) => {
      e.stopPropagation();
      quickSettings.toggle();
    });

    const showDesktopBtn = this.shelfEl.querySelector('#win-show-desktop-btn');
    showDesktopBtn?.addEventListener('click', () => {
      windowManager.windows.forEach((win, id) => {
        windowManager.minimizeWindow(id);
      });
    });
  }

  updateAppIndicators() {
    const buttons = this.shelfEl?.querySelectorAll('.app-shelf-btn') || [];
    buttons.forEach((btn) => {
      const appId = btn.dataset.appId;
      const win = windowManager.windows.get(appId);
      const pill = btn.querySelector('.win-app-pill');

      btn.classList.remove('bg-white/20', 'bg-white/15', 'bg-white/10', 'bg-white/5', 'dock-app-focused', 'dock-app-running');
      if (win) {
        const isFocused = windowManager.activeWindowId === appId && !win.minimized;
        btn.classList.add(isFocused ? 'bg-white/20' : 'bg-white/10');
        btn.classList.add(isFocused ? 'dock-app-focused' : 'dock-app-running');
        if (pill) {
          pill.className = `win-app-pill absolute bottom-0.5 rounded-full transition-all duration-200 ${isFocused ? 'w-3.5 h-1 bg-emerald-400 opacity-100 shadow-[0_0_8px_rgba(52,211,153,0.9)]' : 'w-1.5 h-1.5 bg-white/85 opacity-90'}`;
        }
      } else {
        if (pill) {
          pill.className = 'win-app-pill absolute bottom-0.5 w-1 h-1 bg-white/40 opacity-0 group-hover:opacity-40 rounded-full transition-all duration-200';
        }
      }
    });
  }

  updateStatusTray() {
    const state = stateStore.getState();
    const focusBadge = this.shelfEl?.querySelector('#focus-mode-badge');
    const wifiIcon = this.shelfEl?.querySelector('#tray-wifi-icon');

    if (focusBadge) {
      if (state.restrictions.focusMode) {
        focusBadge.classList.remove('hidden');
      } else {
        focusBadge.classList.add('hidden');
      }
    }

    if (wifiIcon) {
      wifiIcon.className = state.systemSettings.wifiConnected
        ? 'fas fa-wifi text-xs text-emerald-400'
        : 'fas fa-wifi-slash text-xs text-slate-400';
    }
  }

  startClock() {
    const updateTime = () => {
      const clockEl = this.shelfEl?.querySelector('#tray-clock');
      const dateEl  = this.shelfEl?.querySelector('#tray-date');
      const now = new Date();
      if (clockEl) clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (dateEl)  dateEl.textContent  = now.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  setupBattery() {
    const batteryEl = this.shelfEl?.querySelector('#tray-battery');
    if ('getBattery' in navigator && typeof navigator.getBattery === 'function') {
      navigator.getBattery().then((battery) => {
        const updateBatt = () => {
          const pct = Math.round(battery.level * 100);
          const charging = battery.charging ? '⚡' : '';
          if (batteryEl) {
            batteryEl.innerHTML = `<i class="fas fa-battery-${pct > 80 ? 'full' : pct > 40 ? 'half' : 'quarter'} text-xs text-emerald-400"></i> ${pct}% ${charging}`;
          }
        };
        updateBatt();
        battery.addEventListener('levelchange', updateBatt);
        battery.addEventListener('chargingchange', updateBatt);
      }).catch(() => {
        if (batteryEl) batteryEl.innerHTML = `<i class="fas fa-plug text-xs text-emerald-400"></i> AC`;
      });
    } else {
      if (batteryEl) batteryEl.innerHTML = `<i class="fas fa-plug text-xs text-emerald-400"></i> AC`;
    }
  }
}

export const shelf = new Shelf();
