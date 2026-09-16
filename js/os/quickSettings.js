/**
 * ChromeOS Student Edition - Quick Settings Popover Menu (Desktop OS Supported)
 */

import { stateStore } from './state.js';

class QuickSettings {
  constructor() {
    this.overlayEl = null;
  }

  init(overlayElement, openAdminCallback) {
    this.overlayEl = overlayElement;
    this.openAdmin = openAdminCallback;

    this.render();
    this.attachEvents();

    stateStore.subscribe(() => this.updateUI());
  }

  render() {
    const settings = stateStore.getState().systemSettings;
    const isDesktopNative = window.electronAPI && window.electronAPI.isElectron;

    this.overlayEl.innerHTML = `
      <div class="flex items-center justify-between border-b border-gray-700/50 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            ST
          </div>
          <div>
            <div class="font-bold text-sm text-white">Student Account</div>
            <div class="text-xs text-gray-400">Lincoln High School ${isDesktopNative ? '• Desktop Native OS' : ''}</div>
          </div>
        </div>

        <button id="qs-admin-btn" class="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full text-xs flex items-center gap-1 transition-colors" title="Open Admin Controls">
          <i class="fas fa-user-shield text-amber-400 text-sm"></i> Admin
        </button>
      </div>

      <!-- Quick Toggles Grid -->
      <div class="grid grid-cols-2 gap-2">
        <button id="toggle-wifi" class="qs-tile flex items-center gap-3 p-3 rounded-2xl ${settings.wifiConnected ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'bg-gray-800 text-gray-400'} transition-all">
          <i class="fas ${settings.wifiConnected ? 'fa-wifi' : 'fa-wifi-slash'} text-base"></i>
          <div class="text-left">
            <div class="text-xs font-semibold">Wi-Fi</div>
            <div class="text-[10px] opacity-75">${settings.wifiConnected ? 'School_5G' : 'Off'}</div>
          </div>
        </button>

        <button id="toggle-bt" class="qs-tile flex items-center gap-3 p-3 rounded-2xl ${settings.bluetoothConnected ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'bg-gray-800 text-gray-400'} transition-all">
          <i class="fab fa-bluetooth-b text-base"></i>
          <div class="text-left">
            <div class="text-xs font-semibold">Bluetooth</div>
            <div class="text-[10px] opacity-75">${settings.bluetoothConnected ? 'Connected' : 'Off'}</div>
          </div>
        </button>

        <button id="toggle-night" class="qs-tile flex items-center gap-3 p-3 rounded-2xl ${settings.nightLight ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40' : 'bg-gray-800 text-gray-400'} transition-all">
          <i class="fas fa-moon text-base"></i>
          <div class="text-left">
            <div class="text-xs font-semibold">Night Light</div>
            <div class="text-[10px] opacity-75">${settings.nightLight ? 'On' : 'Off'}</div>
          </div>
        </button>

        <button id="lock-screen-btn" class="qs-tile flex items-center gap-3 p-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-200 transition-all">
          <i class="fas fa-lock text-base text-red-400"></i>
          <div class="text-left">
            <div class="text-xs font-semibold">Lock OS</div>
            <div class="text-[10px] opacity-75">Curfew Screen</div>
          </div>
        </button>
      </div>

      ${
        isDesktopNative
          ? `
        <!-- Desktop OS Actions -->
        <div class="grid grid-cols-2 gap-2 border-t border-gray-700/50 pt-2">
          <button id="desktop-kiosk-btn" class="p-2.5 rounded-xl bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center justify-center gap-2">
            <i class="fas fa-expand text-xs"></i> Fullscreen Kiosk
          </button>
          <button id="desktop-exit-btn" class="p-2.5 rounded-xl bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center justify-center gap-2">
            <i class="fas fa-power-off text-xs"></i> Shutdown OS
          </button>
        </div>
      `
          : ''
      }

      <!-- Sliders -->
      <div class="space-y-3 pt-2">
        <div class="flex items-center gap-3 text-xs text-gray-300">
          <i class="fas fa-volume-up text-blue-400 w-4"></i>
          <input type="range" id="volume-slider" min="0" max="100" value="${settings.volume}" class="w-full accent-blue-500 cursor-pointer h-1.5 bg-gray-700 rounded-lg">
        </div>
        <div class="flex items-center gap-3 text-xs text-gray-300">
          <i class="fas fa-sun text-amber-400 w-4"></i>
          <input type="range" id="brightness-slider" min="20" max="100" value="${settings.brightness}" class="w-full accent-amber-500 cursor-pointer h-1.5 bg-gray-700 rounded-lg">
        </div>
      </div>
    `;
  }

  attachEvents() {
    this.overlayEl.addEventListener('click', (e) => {
      const adminBtn = e.target.closest('#qs-admin-btn');
      if (adminBtn) {
        this.close();
        if (this.openAdmin) this.openAdmin();
        return;
      }

      const lockBtn = e.target.closest('#lock-screen-btn');
      if (lockBtn) {
        this.close();
        const curfewOverlay = document.getElementById('curfew-lockout-screen');
        if (curfewOverlay) curfewOverlay.classList.add('active');
        return;
      }

      const kioskBtn = e.target.closest('#desktop-kiosk-btn');
      if (kioskBtn && window.electronAPI) {
        window.electronAPI.toggleFullscreen();
        return;
      }

      const exitBtn = e.target.closest('#desktop-exit-btn');
      if (exitBtn && window.electronAPI) {
        const pin = prompt('Enter Admin Security PIN to Exit Desktop OS:');
        if (stateStore.verifyAdminPin(pin)) {
          window.electronAPI.exitApp();
        } else if (pin !== null) {
          alert('Incorrect PIN. Shutdown request denied.');
        }
        return;
      }

      const wifiBtn = e.target.closest('#toggle-wifi');
      if (wifiBtn) {
        const current = stateStore.getState().systemSettings.wifiConnected;
        stateStore.updateSettings({ wifiConnected: !current });
        return;
      }

      const btBtn = e.target.closest('#toggle-bt');
      if (btBtn) {
        const current = stateStore.getState().systemSettings.bluetoothConnected;
        stateStore.updateSettings({ bluetoothConnected: !current });
        return;
      }

      const nightBtn = e.target.closest('#toggle-night');
      if (nightBtn) {
        const current = stateStore.getState().systemSettings.nightLight;
        stateStore.updateSettings({ nightLight: !current });
        document.body.classList.toggle('sepia', !current);
        return;
      }
    });

    const volumeSlider = this.overlayEl.querySelector('#volume-slider');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        stateStore.updateSettings({ volume: parseInt(e.target.value, 10) });
      });
    }

    const brightnessSlider = this.overlayEl.querySelector('#brightness-slider');
    if (brightnessSlider) {
      brightnessSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        stateStore.updateSettings({ brightness: val });
        document.getElementById('desktop').style.filter = `brightness(${val / 100})`;
      });
    }

    document.addEventListener('click', (e) => {
      if (!this.overlayEl.contains(e.target) && !e.target.closest('#status-tray')) {
        this.close();
      }
    });
  }

  updateUI() {
    this.render();
  }

  close() {
    this.overlayEl.classList.remove('open');
  }
}

export const quickSettings = new QuickSettings();
