/**
 * ChromeOS Student Edition - Taskbar Shelf & Status Tray
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

    // Subscribe to window manager state changes to update active app indicators
    windowManager.subscribe(() => this.updateAppIndicators());
    stateStore.subscribe(() => this.updateStatusTray());
  }

  render() {
    this.shelfEl.innerHTML = `
      <div class="flex items-center gap-2">
        <!-- Everything Button -->
        <button id="everything-btn" class="shelf-icon-btn everything-btn" title="Launcher (Everything Button)">
          <i class="fas fa-[#4285F4] fa-circle text-blue-400 text-lg"></i>
          <span class="sr-only">Launcher</span>
        </button>

        <!-- Pinned Apps -->
        <div id="shelf-pinned-apps" class="shelf-center">
          ${this.apps
            .map(
              (app) => `
            <button class="shelf-icon-btn app-shelf-btn" data-app-id="${app.id}" title="${app.title}">
              <span class="text-xl">${app.icon}</span>
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Status Tray -->
      <div id="status-tray" class="status-tray" title="Quick Settings">
        <div id="focus-mode-badge" class="restrict-badge focus-active hidden">
          <i class="fas fa-lock text-xs"></i> Focus Mode
        </div>
        <div id="restriction-mode-badge" class="restrict-badge">
          <i class="fas fa-shield-alt text-xs"></i> Protected
        </div>

        <div class="flex items-center gap-2 ml-1 text-gray-200">
          <i id="tray-wifi-icon" class="fas fa-wifi text-xs"></i>
          <span id="tray-battery" class="flex items-center gap-1 text-xs font-semibold">
            <i class="fas fa-battery-full text-xs"></i> 98%
          </span>
          <span id="tray-clock" class="text-xs font-bold tracking-tight text-white ml-1">10:24 AM</span>
        </div>
      </div>
    `;

    this.attachEvents();
    this.updateAppIndicators();
    this.updateStatusTray();
  }

  attachEvents() {
    // Everything launcher button toggle
    const launcherBtn = this.shelfEl.querySelector('#everything-btn');
    launcherBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const overlay = document.getElementById('launcher-overlay');
      overlay.classList.toggle('open');
    });

    // Pinned App Buttons
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
        // Launch app via its launcher callback
        appData.launch();
      }
    });

    // Status Tray click opens Quick Settings
    const statusTray = this.shelfEl.querySelector('#status-tray');
    statusTray.addEventListener('click', (e) => {
      e.stopPropagation();
      const qs = document.getElementById('quick-settings-overlay');
      qs.classList.toggle('open');
    });
  }

  updateAppIndicators() {
    const buttons = this.shelfEl.querySelectorAll('.app-shelf-btn');
    buttons.forEach((btn) => {
      const appId = btn.dataset.appId;
      const win = windowManager.windows.get(appId);

      btn.classList.remove('active-app', 'active-focused');
      if (win) {
        btn.classList.add('active-app');
        if (windowManager.activeWindowId === appId && !win.minimized) {
          btn.classList.add('active-focused');
        }
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
        ? 'fas fa-wifi text-xs text-blue-400'
        : 'fas fa-wifi-slash text-xs text-gray-400';
    }
  }

  startClock() {
    const updateTime = () => {
      const clockEl = this.shelfEl.querySelector('#tray-clock');
      if (!clockEl) return;
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  setupBattery() {
    const batteryEl = this.shelfEl.querySelector('#tray-battery');
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        const updateBatt = () => {
          const pct = Math.round(battery.level * 100);
          const charging = battery.charging ? '⚡' : '';
          if (batteryEl) {
            batteryEl.innerHTML = `<i class="fas fa-battery-${pct > 80 ? 'full' : pct > 40 ? 'half' : 'quarter'} text-xs"></i> ${pct}% ${charging}`;
          }
        };
        updateBatt();
        battery.addEventListener('levelchange', updateBatt);
        battery.addEventListener('chargingchange', updateBatt);
      });
    }
  }
}

export const shelf = new Shelf();
