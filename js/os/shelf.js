/**
 * Dawamu OS - Windows 11 Style Taskbar & System Tray
 */

import { windowManager } from './windowManager.js';
import { stateStore } from './state.js';

class Shelf {
  constructor() {
    this.shelfEl = null;
    this.apps = [];
  }

  init(shelfElement, appRegistry) {
    this.shelfEl = shelfElement;
    this.apps = appRegistry;

    this.render();
    this.startClock();
    this.setupBattery();

    windowManager.subscribe(() => this.updateAppIndicators());
    stateStore.subscribe(() => this.updateStatusTray());
  }

  render() {
    this.shelfEl.innerHTML = `
      <div class="flex items-center gap-1.5 h-full">
        <!-- Windows / Dawamu Start Button -->
        <button id="everything-btn" class="win-start-btn flex items-center justify-center p-2 rounded-lg hover:bg-white/10 active:scale-95 transition-all text-white" title="Start (Dawamu)">
          <img src="assets/dawamu-logo.png" alt="Start" class="h-6 w-auto object-contain drop-shadow-sm">
        </button>

        <!-- Windows Search Bar Pill -->
        <button id="taskbar-search-btn" class="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 text-xs text-slate-300 transition-all">
          <i class="fas fa-search text-emerald-400 text-xs"></i>
          <span class="text-[11px] text-slate-400 font-sans pr-2">Search</span>
        </button>

        <div class="h-5 w-[1px] bg-white/10 mx-1"></div>

        <!-- Pinned Taskbar Apps -->
        <div id="shelf-pinned-apps" class="flex items-center gap-1">
          ${this.apps
            .map(
              (app) => `
            <button class="app-shelf-btn relative p-2 rounded-xl hover:bg-white/10 active:scale-95 flex items-center justify-center transition-all group" data-app-id="${app.id}" title="${app.title}">
              <span class="text-xl">${app.icon}</span>
              <!-- Windows Active Pill Underline -->
              <span class="win-app-pill absolute bottom-0.5 w-1.5 h-1 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-60 transition-all"></span>
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- System Tray (Bottom Right) -->
      <div class="flex items-center gap-1.5 h-full">
        <div id="status-tray" class="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-white/10 cursor-pointer text-slate-200 transition-all" title="System Status & Quick Settings">
          <!-- Restriction Badge -->
          <div id="focus-mode-badge" class="hidden text-[10px] bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <i class="fas fa-lock text-[9px]"></i> Focus
          </div>

          <div class="flex items-center gap-2.5 text-xs text-slate-300">
            <i id="tray-wifi-icon" class="fas fa-wifi text-emerald-400 text-xs"></i>
            <i class="fas fa-volume-up text-xs text-slate-300"></i>
            <span id="tray-battery" class="flex items-center gap-1 text-[11px] font-semibold">
              <i class="fas fa-battery-full text-xs text-emerald-400"></i> 100%
            </span>
          </div>

          <!-- Windows Stacked Time & Date -->
          <div class="flex flex-col items-end text-[10px] font-sans leading-tight border-l border-white/10 pl-2 text-slate-300">
            <span id="tray-clock" class="font-bold text-white text-[11px]">10:24 AM</span>
            <span id="tray-date" class="text-[9px] text-slate-400">9/29/2026</span>
          </div>
        </div>

        <!-- Show Desktop Peek Line -->
        <button id="win-show-desktop-btn" class="w-1.5 h-8 border-l border-white/20 hover:bg-white/20 transition-colors ml-1" title="Show Desktop"></button>
      </div>
    `;

    this.attachEvents();
    this.updateAppIndicators();
    this.updateStatusTray();
  }

  attachEvents() {
    const launcherBtn = this.shelfEl.querySelector('#everything-btn');
    const searchBtn   = this.shelfEl.querySelector('#taskbar-search-btn');

    const toggleStart = (e) => {
      e.stopPropagation();
      const overlay = document.getElementById('launcher-overlay');
      overlay.classList.toggle('open');
    };

    launcherBtn?.addEventListener('click', toggleStart);
    searchBtn?.addEventListener('click', toggleStart);

    const pinnedContainer = this.shelfEl.querySelector('#shelf-pinned-apps');
    pinnedContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.app-shelf-btn');
      if (!btn) return;

      const appId = btn.dataset.appId;
      const appData = this.apps.find((a) => a.id === appId);
      if (!appData) return;

      const activeWin = windowManager.windows.get(appId);
      if (activeWin) {
        if (windowManager.activeWindowId === appId && !activeWin.minimized) {
          windowManager.minimizeWindow(appId);
        } else {
          windowManager.restoreWindow(appId);
        }
      } else {
        appData.launch();
      }
    });

    const statusTray = this.shelfEl.querySelector('#status-tray');
    statusTray.addEventListener('click', (e) => {
      e.stopPropagation();
      const qs = document.getElementById('quick-settings-overlay');
      qs.classList.toggle('open');
    });

    const showDesktopBtn = this.shelfEl.querySelector('#win-show-desktop-btn');
    showDesktopBtn?.addEventListener('click', () => {
      windowManager.windows.forEach((win, id) => {
        windowManager.minimizeWindow(id);
      });
    });
  }

  updateAppIndicators() {
    const buttons = this.shelfEl.querySelectorAll('.app-shelf-btn');
    buttons.forEach((btn) => {
      const appId = btn.dataset.appId;
      const win = windowManager.windows.get(appId);
      const pill = btn.querySelector('.win-app-pill');

      if (win) {
        btn.classList.add('bg-white/10');
        if (pill) {
          pill.style.width = windowManager.activeWindowId === appId && !win.minimized ? '14px' : '6px';
          pill.style.opacity = '1';
        }
      } else {
        btn.classList.remove('bg-white/10');
        if (pill) pill.style.opacity = '0';
      }
    });
  }

  updateStatusTray() {
    const state = stateStore.getState();
    const focusBadge = this.shelfEl.querySelector('#focus-mode-badge');
    const wifiIcon = this.shelfEl.querySelector('#tray-wifi-icon');

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
      const clockEl = this.shelfEl.querySelector('#tray-clock');
      const dateEl  = this.shelfEl.querySelector('#tray-date');
      const now = new Date();
      if (clockEl) clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (dateEl)  dateEl.textContent  = now.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  setupBattery() {
    const batteryEl = this.shelfEl.querySelector('#tray-battery');
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
