/**
 * DawamuOS - Quick Settings Popover Menu
 * Real-time hardware toggles (Network, Bluetooth, Night Light, Curfew Lock),
 * interactive display brightness and audio volume sliders, and power controls.
 */

import { stateStore } from './state.js';

class QuickSettings {
  constructor() {
    this.overlayEl = null;
    this.openAdmin = null;
  }

  init(overlayElement, openAdminCallback) {
    this.overlayEl = overlayElement;
    this.openAdmin = openAdminCallback;

    this.render();
    this.attachEvents();

    stateStore.subscribe(() => this.updateUI());
  }

  render() {
    const state = stateStore.getState();
    const settings = state.systemSettings;
    const currentUser = state.currentUser || { name: 'Brian Ochieng', admNo: '1001', grade: 'Form 1' };
    const isDesktopNative = window.electronAPI && window.electronAPI.isElectron;
    const initials = currentUser.name
      ? currentUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
      : 'ST';

    this.overlayEl.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-700/60 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md border border-emerald-400/30">
            ${initials}
          </div>
          <div>
            <div class="font-bold text-sm text-white flex items-center gap-1.5">
              ${currentUser.name || 'Student Account'}
              <span class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 uppercase font-mono">${currentUser.role || 'student'}</span>
            </div>
            <div class="text-[11px] text-slate-400">Adm: ${currentUser.admNo || '1001'} &bull; ${isDesktopNative ? 'Native Desktop OS' : 'Web Desktop'}</div>
          </div>
        </div>

        <button id="qs-admin-btn" class="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer" title="Open Admin Controls">
          <i class="fas fa-user-shield text-amber-400 text-sm"></i>
          <span class="font-semibold text-xs">Admin</span>
        </button>
      </div>

      <!-- Quick Toggles Grid -->
      <div class="grid grid-cols-2 gap-2.5">
        <button id="toggle-wifi" class="qs-tile flex items-center gap-3 p-3 rounded-2xl ${settings.wifiConnected ? 'bg-emerald-600/25 text-emerald-300 border border-emerald-500/40 shadow-sm' : 'bg-slate-800/80 text-slate-400 border border-transparent'} hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
          <div class="w-8 h-8 rounded-xl ${settings.wifiConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'} flex items-center justify-center text-sm">
            <i class="fas ${settings.wifiConnected ? 'fa-wifi' : 'fa-wifi-slash'}"></i>
          </div>
          <div class="text-left">
            <div class="text-xs font-bold leading-tight">Network</div>
            <div class="text-[10px] opacity-75">${settings.wifiConnected ? (navigator.onLine ? 'Connected' : 'Offline Engine') : 'Disabled'}</div>
          </div>
        </button>

        <button id="toggle-bt" class="qs-tile flex items-center gap-3 p-3 rounded-2xl ${settings.bluetoothConnected ? 'bg-blue-600/25 text-blue-300 border border-blue-500/40 shadow-sm' : 'bg-slate-800/80 text-slate-400 border border-transparent'} hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
          <div class="w-8 h-8 rounded-xl ${settings.bluetoothConnected ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-400'} flex items-center justify-center text-sm">
            <i class="fab fa-bluetooth-b"></i>
          </div>
          <div class="text-left">
            <div class="text-xs font-bold leading-tight">Bluetooth</div>
            <div class="text-[10px] opacity-75">${settings.bluetoothConnected ? 'Paired' : 'Off'}</div>
          </div>
        </button>

        <button id="toggle-night" class="qs-tile flex items-center gap-3 p-3 rounded-2xl ${settings.nightLight ? 'bg-amber-600/25 text-amber-300 border border-amber-500/40 shadow-sm' : 'bg-slate-800/80 text-slate-400 border border-transparent'} hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
          <div class="w-8 h-8 rounded-xl ${settings.nightLight ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700/50 text-slate-400'} flex items-center justify-center text-sm">
            <i class="fas fa-moon"></i>
          </div>
          <div class="text-left">
            <div class="text-xs font-bold leading-tight">Night Light</div>
            <div class="text-[10px] opacity-75">${settings.nightLight ? 'Warm 4500K' : 'Off'}</div>
          </div>
        </button>

        <button id="lock-screen-btn" class="qs-tile flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-transparent hover:border-slate-600/50 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
          <div class="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-sm">
            <i class="fas fa-lock"></i>
          </div>
          <div class="text-left">
            <div class="text-xs font-bold leading-tight">Lock Screen</div>
            <div class="text-[10px] opacity-75">Curfew Shield</div>
          </div>
        </button>
      </div>

      <!-- Audio & Brightness Sliders -->
      <div class="space-y-3 pt-1 border-t border-slate-700/60">
        <div class="flex items-center gap-3 text-xs text-slate-300">
          <i class="fas fa-volume-up text-emerald-400 w-4 text-center"></i>
          <input type="range" id="volume-slider" min="0" max="100" value="${settings.volume}" class="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg">
          <span class="w-8 text-right font-mono text-[11px] text-slate-400">${settings.volume}%</span>
        </div>
        <div class="flex items-center gap-3 text-xs text-slate-300">
          <i class="fas fa-sun text-amber-400 w-4 text-center"></i>
          <input type="range" id="brightness-slider" min="20" max="100" value="${settings.brightness}" class="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg">
          <span class="w-8 text-right font-mono text-[11px] text-slate-400">${settings.brightness}%</span>
        </div>
      </div>

      <!-- Power & Session Controls -->
      <div class="grid grid-cols-3 gap-2 border-t border-slate-700/60 pt-2.5">
        <button id="qs-signout-btn" class="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600/40 text-slate-200 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95" title="Sign Out Student">
          <i class="fas fa-sign-out-alt text-xs text-amber-400"></i>
          <span class="text-[10px]">Sign Out</span>
        </button>
        <button id="qs-reboot-btn" class="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600/40 text-slate-200 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95" title="Reboot DawamuOS">
          <i class="fas fa-redo text-xs text-blue-400"></i>
          <span class="text-[10px]">Reboot</span>
        </button>
        <button id="qs-shutdown-btn" class="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-700/40 text-rose-200 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95" title="Shut Down OS">
          <i class="fas fa-power-off text-xs text-rose-400"></i>
          <span class="text-[10px]">Power Off</span>
        </button>
      </div>
    `;

    this.bindSliders();
  }

  bindSliders() {
    const volumeSlider = this.overlayEl.querySelector('#volume-slider');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        stateStore.updateSettings({ volume: val });
      });
    }

    const brightnessSlider = this.overlayEl.querySelector('#brightness-slider');
    if (brightnessSlider) {
      brightnessSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        stateStore.updateSettings({ brightness: val });
        document.documentElement.style.setProperty('--desktop-brightness', `${val}%`);
        const desktop = document.getElementById('desktop');
        if (desktop) desktop.style.filter = `brightness(${val / 100})`;
      });
    }
  }

  attachEvents() {
    this.overlayEl.addEventListener('click', async (e) => {
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

      const signOutBtn = e.target.closest('#qs-signout-btn');
      if (signOutBtn) {
        this.close();
        if (window.dawamuDialogs?.confirm) {
          const ok = await window.dawamuDialogs.confirm({
            title: 'Sign Out Student',
            message: 'Are you sure you want to sign out?',
            confirmText: 'Sign Out'
          });
          if (!ok) return;
        }
        if (window.dawamuPower) window.dawamuPower.signOut();
        return;
      }

      const rebootBtn = e.target.closest('#qs-reboot-btn');
      if (rebootBtn) {
        this.close();
        if (window.dawamuDialogs?.confirm) {
          const ok = await window.dawamuDialogs.confirm({
            title: 'Restart DawamuOS',
            message: 'Are you sure you want to restart the operating system?',
            confirmText: 'Restart'
          });
          if (!ok) return;
        }
        if (window.dawamuPower) window.dawamuPower.reboot();
        return;
      }

      const shutdownBtn = e.target.closest('#qs-shutdown-btn');
      if (shutdownBtn) {
        this.close();
        if (window.dawamuDialogs?.confirm) {
          const ok = await window.dawamuDialogs.confirm({
            title: 'Shut Down DawamuOS',
            message: 'Are you sure you want to shut down the computer?',
            confirmText: 'Shut Down',
            danger: true
          });
          if (!ok) return;
        }
        if (window.dawamuPower) window.dawamuPower.shutdown();
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
        document.getElementById('desktop')?.classList.toggle('night-light', !current);
        return;
      }
    });

    document.addEventListener('click', (e) => {
      if (!this.overlayEl.contains(e.target) && !e.target.closest('#status-tray')) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlayEl.classList.contains('open')) {
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

  toggle() {
    if (this.overlayEl.classList.contains('open')) {
      this.close();
    } else {
      this.overlayEl.classList.add('open');
    }
  }
}

export const quickSettings = new QuickSettings();
