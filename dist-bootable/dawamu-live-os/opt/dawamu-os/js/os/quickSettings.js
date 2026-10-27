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
      <div class="flex items-center justify-between border-b border-white/10 pb-3">
        <div class="flex items-center gap-3" id="qs-user-header">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md border border-emerald-400/30">
            ${initials}
          </div>
          <div>
            <div class="font-bold text-sm text-white flex items-center gap-1.5">
              <span>${currentUser.name || 'Student Account'}</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 uppercase font-mono">${currentUser.role || 'student'}</span>
            </div>
            <div class="text-[11px] text-slate-300">Adm: ${currentUser.admNo || '1001'} &bull; ${isDesktopNative ? 'Native Desktop OS' : 'Liquid Glass OS'}</div>
          </div>
        </div>

        <button id="qs-admin-btn" class="p-2 text-slate-200 hover:text-white hover:bg-white/15 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10 bg-white/5" title="Open Admin Controls">
          <i class="fas fa-user-shield text-amber-400 text-sm"></i>
          <span class="font-semibold text-xs">Admin</span>
        </button>
      </div>

      <!-- Quick Toggles Grid (macOS Control Center Tiles) -->
      <div class="grid grid-cols-2 gap-2.5">
        <button id="toggle-wifi" class="qs-tile flex items-center gap-3 p-3 rounded-2xl ${settings.wifiConnected ? 'qs-tile-active-emerald bg-emerald-600/25 text-emerald-200 border border-emerald-400/40 shadow-sm' : 'bg-slate-800/60 text-slate-300 border border-white/10'} hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
          <div id="toggle-wifi-icon-box" class="w-8 h-8 rounded-xl ${settings.wifiConnected ? 'bg-emerald-500 text-white shadow-md' : 'bg-white/10 text-slate-400'} flex items-center justify-center text-sm transition-all">
            <i id="toggle-wifi-icon" class="fas ${settings.wifiConnected ? 'fa-wifi' : 'fa-wifi-slash'}"></i>
          </div>
          <div class="text-left">
            <div class="text-xs font-bold leading-tight text-white">Wi-Fi</div>
            <div id="toggle-wifi-sub" class="text-[10px] opacity-80">${settings.wifiConnected ? (navigator.onLine ? 'Connected' : 'Offline Engine') : 'Disabled'}</div>
          </div>
        </button>

        <button id="toggle-bt" class="qs-tile flex items-center gap-3 p-3 rounded-2xl ${settings.bluetoothConnected ? 'qs-tile-active-blue bg-blue-600/25 text-blue-200 border border-blue-400/40 shadow-sm' : 'bg-slate-800/60 text-slate-300 border border-white/10'} hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
          <div id="toggle-bt-icon-box" class="w-8 h-8 rounded-xl ${settings.bluetoothConnected ? 'bg-blue-500 text-white shadow-md' : 'bg-white/10 text-slate-400'} flex items-center justify-center text-sm transition-all">
            <i class="fab fa-bluetooth-b"></i>
          </div>
          <div class="text-left">
            <div class="text-xs font-bold leading-tight text-white">Bluetooth</div>
            <div id="toggle-bt-sub" class="text-[10px] opacity-80">${settings.bluetoothConnected ? 'Paired' : 'Off'}</div>
          </div>
        </button>

        <button id="toggle-night" class="qs-tile flex items-center gap-3 p-3 rounded-2xl ${settings.nightLight ? 'qs-tile-active-amber bg-amber-600/25 text-amber-200 border border-amber-400/40 shadow-sm' : 'bg-slate-800/60 text-slate-300 border border-white/10'} hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
          <div id="toggle-night-icon-box" class="w-8 h-8 rounded-xl ${settings.nightLight ? 'bg-amber-500 text-white shadow-md' : 'bg-white/10 text-slate-400'} flex items-center justify-center text-sm transition-all">
            <i class="fas fa-moon"></i>
          </div>
          <div class="text-left">
            <div class="text-xs font-bold leading-tight text-white">Night Shift</div>
            <div id="toggle-night-sub" class="text-[10px] opacity-80">${settings.nightLight ? 'Warm 4500K' : 'Off'}</div>
          </div>
        </button>

        <button id="lock-screen-btn" class="qs-tile flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 hover:bg-white/10 text-slate-200 border border-white/10 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
          <div class="w-8 h-8 rounded-xl bg-rose-500/25 text-rose-300 border border-rose-400/30 flex items-center justify-center text-sm">
            <i class="fas fa-lock"></i>
          </div>
          <div class="text-left">
            <div class="text-xs font-bold leading-tight text-white">Lock Screen</div>
            <div class="text-[10px] opacity-80">Curfew Shield</div>
          </div>
        </button>
      </div>

      <!-- Audio & Brightness Sliders (macOS Control Center Glass Bars) -->
      <div class="space-y-3 pt-2 border-t border-white/10">
        <div class="qs-slider-card p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
          <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-300 px-1">
            <span>Sound</span>
            <span id="qs-volume-label" class="font-mono text-emerald-300">${settings.volume}%</span>
          </div>
          <div class="flex items-center gap-2.5 text-xs text-slate-200 px-1">
            <i class="fas fa-volume-up text-emerald-400 w-4 text-center"></i>
            <input type="range" id="volume-slider" min="0" max="100" value="${settings.volume}" class="w-full accent-emerald-500 cursor-pointer h-1.5 bg-white/15 rounded-lg">
          </div>
        </div>

        <div class="qs-slider-card p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
          <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-300 px-1">
            <span>Display</span>
            <span id="qs-brightness-label" class="font-mono text-amber-300">${settings.brightness}%</span>
          </div>
          <div class="flex items-center gap-2.5 text-xs text-slate-200 px-1">
            <i class="fas fa-sun text-amber-400 w-4 text-center"></i>
            <input type="range" id="brightness-slider" min="20" max="100" value="${settings.brightness}" class="w-full accent-amber-500 cursor-pointer h-1.5 bg-white/15 rounded-lg">
          </div>
        </div>
      </div>

      <!-- Power & Session Controls -->
      <div class="grid grid-cols-3 gap-2 border-t border-white/10 pt-2.5">
        <button id="qs-signout-btn" class="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95" title="Sign Out Student">
          <i class="fas fa-sign-out-alt text-xs text-amber-400"></i>
          <span class="text-[10px]">Sign Out</span>
        </button>
        <button id="qs-reboot-btn" class="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95" title="Reboot DawamuOS">
          <i class="fas fa-redo text-xs text-blue-400"></i>
          <span class="text-[10px]">Reboot</span>
        </button>
        <button id="qs-shutdown-btn" class="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95" title="Shut Down OS">
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
        const lbl = this.overlayEl.querySelector('#qs-volume-label');
        if (lbl) lbl.textContent = `${val}%`;
        stateStore.updateSettings({ volume: val });
      });
    }

    const brightnessSlider = this.overlayEl.querySelector('#brightness-slider');
    if (brightnessSlider) {
      brightnessSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        const lbl = this.overlayEl.querySelector('#qs-brightness-label');
        if (lbl) lbl.textContent = `${val}%`;
        stateStore.updateSettings({ brightness: val });
        stateStore.applyDisplaySettings();
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
        stateStore.applyDisplaySettings();
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
    if (!this.overlayEl) return;
    const wifiBtn = this.overlayEl.querySelector('#toggle-wifi');
    if (!wifiBtn) {
      this.render();
      return;
    }

    const state = stateStore.getState();
    const settings = state.systemSettings;
    const currentUser = state.currentUser || { name: 'Brian Ochieng', admNo: '1001', grade: 'Form 1' };
    const isDesktopNative = window.electronAPI && window.electronAPI.isElectron;
    const initials = currentUser.name
      ? currentUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
      : 'ST';

    // Update User Header
    const userHeader = this.overlayEl.querySelector('#qs-user-header');
    if (userHeader) {
      userHeader.innerHTML = `
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md border border-emerald-400/30">
          ${initials}
        </div>
        <div>
          <div class="font-bold text-sm text-white flex items-center gap-1.5">
            <span>${currentUser.name || 'Student Account'}</span>
            <span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 uppercase font-mono">${currentUser.role || 'student'}</span>
          </div>
          <div class="text-[11px] text-slate-300">Adm: ${currentUser.admNo || '1001'} &bull; ${isDesktopNative ? 'Native Desktop OS' : 'Liquid Glass OS'}</div>
        </div>
      `;
    }

    // Update Wi-Fi Tile
    wifiBtn.className = `qs-tile flex items-center gap-3 p-3 rounded-2xl ${settings.wifiConnected ? 'qs-tile-active-emerald bg-emerald-600/25 text-emerald-200 border border-emerald-400/40 shadow-sm' : 'bg-slate-800/60 text-slate-300 border border-white/10'} hover:scale-[1.02] active:scale-95 transition-all cursor-pointer`;
    const wifiIconBox = this.overlayEl.querySelector('#toggle-wifi-icon-box');
    if (wifiIconBox) wifiIconBox.className = `w-8 h-8 rounded-xl ${settings.wifiConnected ? 'bg-emerald-500 text-white shadow-md' : 'bg-white/10 text-slate-400'} flex items-center justify-center text-sm transition-all`;
    const wifiIcon = this.overlayEl.querySelector('#toggle-wifi-icon');
    if (wifiIcon) wifiIcon.className = `fas ${settings.wifiConnected ? 'fa-wifi' : 'fa-wifi-slash'}`;
    const wifiSub = this.overlayEl.querySelector('#toggle-wifi-sub');
    if (wifiSub) wifiSub.textContent = settings.wifiConnected ? (navigator.onLine ? 'Connected' : 'Offline Engine') : 'Disabled';

    // Update Bluetooth Tile
    const btBtn = this.overlayEl.querySelector('#toggle-bt');
    if (btBtn) {
      btBtn.className = `qs-tile flex items-center gap-3 p-3 rounded-2xl ${settings.bluetoothConnected ? 'qs-tile-active-blue bg-blue-600/25 text-blue-200 border border-blue-400/40 shadow-sm' : 'bg-slate-800/60 text-slate-300 border border-white/10'} hover:scale-[1.02] active:scale-95 transition-all cursor-pointer`;
    }
    const btIconBox = this.overlayEl.querySelector('#toggle-bt-icon-box');
    if (btIconBox) btIconBox.className = `w-8 h-8 rounded-xl ${settings.bluetoothConnected ? 'bg-blue-500 text-white shadow-md' : 'bg-white/10 text-slate-400'} flex items-center justify-center text-sm transition-all`;
    const btSub = this.overlayEl.querySelector('#toggle-bt-sub');
    if (btSub) btSub.textContent = settings.bluetoothConnected ? 'Paired' : 'Off';

    // Update Night Shift Tile
    const nightBtn = this.overlayEl.querySelector('#toggle-night');
    if (nightBtn) {
      nightBtn.className = `qs-tile flex items-center gap-3 p-3 rounded-2xl ${settings.nightLight ? 'qs-tile-active-amber bg-amber-600/25 text-amber-200 border border-amber-400/40 shadow-sm' : 'bg-slate-800/60 text-slate-300 border border-white/10'} hover:scale-[1.02] active:scale-95 transition-all cursor-pointer`;
    }
    const nightIconBox = this.overlayEl.querySelector('#toggle-night-icon-box');
    if (nightIconBox) nightIconBox.className = `w-8 h-8 rounded-xl ${settings.nightLight ? 'bg-amber-500 text-white shadow-md' : 'bg-white/10 text-slate-400'} flex items-center justify-center text-sm transition-all`;
    const nightSub = this.overlayEl.querySelector('#toggle-night-sub');
    if (nightSub) nightSub.textContent = settings.nightLight ? 'Warm 4500K' : 'Off';

    // Update sliders only if not actively focused/dragged
    const volSlider = this.overlayEl.querySelector('#volume-slider');
    if (volSlider && document.activeElement !== volSlider) {
      volSlider.value = settings.volume;
    }
    const volLbl = this.overlayEl.querySelector('#qs-volume-label');
    if (volLbl) volLbl.textContent = `${settings.volume}%`;

    const brightSlider = this.overlayEl.querySelector('#brightness-slider');
    if (brightSlider && document.activeElement !== brightSlider) {
      brightSlider.value = settings.brightness;
    }
    const brightLbl = this.overlayEl.querySelector('#qs-brightness-label');
    if (brightLbl) brightLbl.textContent = `${settings.brightness}%`;
  }

  close() {
    this.overlayEl.classList.remove('open');
  }

  toggle() {
    if (this.overlayEl.classList.contains('open')) {
      this.close();
    } else {
      document.getElementById('launcher-overlay')?.classList.remove('open');
      this.updateUI();
      this.overlayEl.classList.add('open');
    }
  }
}

export const quickSettings = new QuickSettings();
