/**
 * ChromeOS Student Edition - Admin / Parental Control Panel (PIN Protected)
 */

import { stateStore } from '../os/state.js';

export function createAdminPanelApp() {
  const container = document.createElement('div');
  container.className = 'flex flex-col h-full bg-slate-900 text-slate-100 font-sans';

  let isAuthenticated = false;

  const renderPinChallenge = () => {
    container.innerHTML = `
      <div class="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div class="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-3xl mb-4 border border-amber-500/30 shadow-lg">
          <i class="fas fa-user-shield"></i>
        </div>
        <h2 class="text-xl font-bold text-white mb-1">Teacher & Parent Controls</h2>
        <p class="text-xs text-slate-400 mb-6 max-w-xs">Enter your 4-digit Administrator Security PIN to modify student restriction policies.</p>

        <div class="space-y-4 w-64">
          <input type="password" id="admin-pin-input" maxlength="6" class="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-center text-2xl tracking-widest font-mono text-white outline-none focus:border-amber-500" placeholder="••••" autofocus>
          
          <div id="pin-error-msg" class="text-xs text-rose-400 font-semibold min-h-[16px]"></div>

          <button id="pin-submit-btn" class="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm py-3 rounded-2xl transition-colors shadow-lg">
            Unlock Admin Panel
          </button>
        </div>

        <div class="mt-8 text-[11px] text-slate-500">
          Default Demo PIN: <code class="text-amber-400 bg-slate-950 px-2 py-0.5 rounded font-mono">1234</code>
        </div>
      </div>
    `;

    const pinInput = container.querySelector('#admin-pin-input');
    const submitBtn = container.querySelector('#pin-submit-btn');
    const errorMsg = container.querySelector('#pin-error-msg');

    const verify = () => {
      const pin = pinInput.value.trim();
      if (stateStore.verifyAdminPin(pin)) {
        isAuthenticated = true;
        renderAdminDashboard();
      } else {
        errorMsg.textContent = 'Incorrect Security PIN. Please try again.';
        pinInput.value = '';
        pinInput.focus();
      }
    };

    submitBtn.addEventListener('click', verify);
    pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') verify();
    });
  };

  const renderAdminDashboard = () => {
    const restrictions = stateStore.getState().restrictions;

    container.innerHTML = `
      <!-- Admin Header -->
      <div class="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold">
            <i class="fas fa-shield-alt text-lg"></i>
          </div>
          <div>
            <h2 class="font-bold text-white text-base">District & Parental Control Center</h2>
            <p class="text-xs text-slate-400">Lincoln High School Chromebook Policy Engine</p>
          </div>
        </div>

        <button id="admin-lock-btn" class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
          <i class="fas fa-lock text-amber-400"></i> Lock Panel
        </button>
      </div>

      <!-- Main Controls Dashboard -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Master Restrictions Toggles Grid -->
        <div class="grid grid-cols-2 gap-4">
          <!-- Web Browser Toggle -->
          <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <h4 class="font-bold text-white text-sm">School Web Browser</h4>
              <p class="text-xs text-slate-400">Enable or block internet browser access.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="toggle-browser" class="sr-only peer" ${restrictions.browserEnabled ? 'checked' : ''}>
              <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          <!-- Safe Search Toggle -->
          <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <h4 class="font-bold text-white text-sm">Enforce SafeSearch</h4>
              <p class="text-xs text-slate-400">Filter explicit search terms & keywords.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="toggle-safesearch" class="sr-only peer" ${restrictions.safeSearch ? 'checked' : ''}>
              <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          <!-- Focus Mode Lockout Toggle -->
          <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <h4 class="font-bold text-white text-sm">Active Focus Mode Lockout</h4>
              <p class="text-xs text-slate-400">Locks non-educational apps during study.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="toggle-focusmode" class="sr-only peer" ${restrictions.focusMode ? 'checked' : ''}>
              <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          <!-- Extension & App Install Lock Toggle -->
          <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <h4 class="font-bold text-white text-sm">App Install Lock</h4>
              <p class="text-xs text-slate-400">Prohibit downloading external Chrome apps.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="toggle-applock" class="sr-only peer" ${restrictions.appInstallLock ? 'checked' : ''}>
              <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>
        </div>

        <!-- Curfew Schedule Setup -->
        <div class="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 class="font-bold text-white text-sm">Curfew Bedtime Lockdown</h4>
              <p class="text-xs text-slate-400">Locks the Chromebook completely during specified night hours.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="toggle-curfew" class="sr-only peer" ${restrictions.curfewEnabled ? 'checked' : ''}>
              <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          <div class="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label class="block text-slate-400 mb-1">Curfew Start Time (Lockdown)</label>
              <input type="time" id="curfew-start-input" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono outline-none focus:border-amber-500" value="${restrictions.curfewStart}">
            </div>
            <div>
              <label class="block text-slate-400 mb-1">Curfew End Time (Unlock)</label>
              <input type="time" id="curfew-end-input" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono outline-none focus:border-amber-500" value="${restrictions.curfewEnd}">
            </div>
          </div>
        </div>

        <!-- Blocked Domains Manager -->
        <div class="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h4 class="font-bold text-white text-sm">Restricted Domain Blocklist</h4>
          <div class="flex gap-2">
            <input type="text" id="new-domain-input" class="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white outline-none focus:border-amber-500 font-mono" placeholder="e.g. gaming-site.com">
            <button id="add-domain-btn" class="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 rounded-xl">Add Domain</button>
          </div>

          <div class="flex flex-wrap gap-2 text-xs max-h-36 overflow-y-auto">
            ${restrictions.blockedDomains
              .map(
                (domain) => `
              <span class="bg-rose-950/60 border border-rose-800/80 text-rose-300 px-3 py-1 rounded-full flex items-center gap-2">
                ${domain}
                <button class="del-domain-btn hover:text-white" data-domain="${domain}"><i class="fas fa-times text-[10px]"></i></button>
              </span>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Change Security PIN -->
        <div class="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <h4 class="font-bold text-white text-sm">Change Security PIN</h4>
            <p class="text-slate-400">Update master admin access passcode.</p>
          </div>
          <div class="flex items-center gap-2">
            <input type="password" id="change-pin-input" maxlength="6" class="w-28 bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-white font-mono outline-none focus:border-amber-500" placeholder="New PIN">
            <button id="save-pin-btn" class="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl">Update</button>
          </div>
        </div>
      </div>
    `;

    attachDashboardEvents();
  };

  const attachDashboardEvents = () => {
    container.querySelector('#admin-lock-btn')?.addEventListener('click', () => {
      isAuthenticated = false;
      renderPinChallenge();
    });

    // Toggles
    container.querySelector('#toggle-browser')?.addEventListener('change', (e) => {
      stateStore.updateRestrictions({ browserEnabled: e.target.checked });
    });

    container.querySelector('#toggle-safesearch')?.addEventListener('change', (e) => {
      stateStore.updateRestrictions({ safeSearch: e.target.checked });
    });

    container.querySelector('#toggle-focusmode')?.addEventListener('change', (e) => {
      stateStore.updateRestrictions({ focusMode: e.target.checked });
    });

    container.querySelector('#toggle-applock')?.addEventListener('change', (e) => {
      stateStore.updateRestrictions({ appInstallLock: e.target.checked });
    });

    container.querySelector('#toggle-curfew')?.addEventListener('change', (e) => {
      stateStore.updateRestrictions({ curfewEnabled: e.target.checked });
    });

    // Curfew Times
    container.querySelector('#curfew-start-input')?.addEventListener('change', (e) => {
      stateStore.updateRestrictions({ curfewStart: e.target.value });
    });

    container.querySelector('#curfew-end-input')?.addEventListener('change', (e) => {
      stateStore.updateRestrictions({ curfewEnd: e.target.value });
    });

    // Domain Add & Remove
    container.querySelector('#add-domain-btn')?.addEventListener('click', () => {
      const input = container.querySelector('#new-domain-input');
      const val = input.value.trim().toLowerCase();
      if (!val) return;

      const current = stateStore.getState().restrictions.blockedDomains;
      if (!current.includes(val)) {
        stateStore.updateRestrictions({ blockedDomains: [...current, val] });
        renderAdminDashboard();
      }
    });

    container.querySelectorAll('.del-domain-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const domain = btn.dataset.domain;
        const current = stateStore.getState().restrictions.blockedDomains;
        stateStore.updateRestrictions({ blockedDomains: current.filter((d) => d !== domain) });
        renderAdminDashboard();
      });
    });

    // Change PIN
    container.querySelector('#save-pin-btn')?.addEventListener('click', () => {
      const newPin = container.querySelector('#change-pin-input').value.trim();
      if (newPin.length >= 4) {
        stateStore.setAdminPin(newPin);
        alert('✓ Admin PIN successfully updated!');
      } else {
        alert('PIN must be at least 4 digits long.');
      }
    });
  };

  renderPinChallenge();
  return container;
}
