/**
 * Dawamu OS - Windows 11 Style Settings App
 */

import { stateStore } from '../os/state.js';

export function createSettingsApp() {
  const root = document.createElement('div');
  root.className = 'flex flex-col h-full bg-[#202020] text-white font-sans select-none overflow-hidden';

  let currentCategory = 'system';

  const categories = [
    { id: 'system', name: 'System', icon: 'fas fa-laptop' },
    { id: 'display', name: 'Display & Brightness', icon: 'fas fa-sun' },
    { id: 'personalization', name: 'Personalization & Theme', icon: 'fas fa-palette' },
    { id: 'network', name: 'Network & Internet', icon: 'fas fa-wifi' },
    { id: 'accounts', name: 'Student Accounts', icon: 'fas fa-user-graduate' },
    { id: 'security', name: 'Parental & District Policy', icon: 'fas fa-shield-alt' },
    { id: 'about', name: 'About Dawamu OS', icon: 'fas fa-info-circle' }
  ];

  function render() {
    const settings = stateStore.getState().systemSettings;

    root.innerHTML = `
      <!-- Header -->
      <div class="bg-[#181818] border-b border-[#2d2d2d] px-6 py-3 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2.5">
          <i class="fas fa-cog text-emerald-400 text-base"></i>
          <h1 class="text-sm font-bold text-white">Settings</h1>
        </div>
        <div class="w-64 bg-[#252525] border border-[#333] rounded-lg px-2.5 py-1 flex items-center gap-2 text-xs">
          <i class="fas fa-search text-slate-500 text-xs"></i>
          <input type="text" placeholder="Find a setting..." class="bg-transparent outline-none text-xs text-white placeholder-slate-500 flex-1">
        </div>
      </div>

      <!-- Main Layout -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar Navigation -->
        <div class="w-60 bg-[#1b1b1b] border-r border-[#2d2d2d] p-3 space-y-1 overflow-y-auto shrink-0 text-xs">
          <!-- Student Mini Card -->
          <div class="p-3 bg-[#242424] rounded-xl mb-3 flex items-center gap-3 border border-[#333]">
            <div class="w-9 h-9 rounded-full bg-[#389e3c] flex items-center justify-center text-white font-bold text-sm">
              <i class="fas fa-user-graduate"></i>
            </div>
            <div>
              <div class="font-bold text-white text-xs">Brian Ochieng</div>
              <div class="text-[10px] text-slate-400">Adm: 1001 • Form 1</div>
            </div>
          </div>

          ${categories.map(c => `
            <button class="settings-nav-btn w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${currentCategory === c.id ? 'bg-[#2b2b2b] text-white border-l-4 border-emerald-500' : 'text-slate-300 hover:bg-white/5'}" data-cat="${c.id}">
              <i class="${c.icon} w-4 text-center ${currentCategory === c.id ? 'text-emerald-400' : 'text-slate-400'}"></i>
              <span>${c.name}</span>
            </button>
          `).join('')}
        </div>

        <!-- Content Area -->
        <div class="flex-1 bg-[#202020] p-8 overflow-y-auto">
          ${renderCategoryContent(settings)}
        </div>
      </div>
    `;

    attachEvents();
  }

  function renderCategoryContent(settings) {
    switch (currentCategory) {
      case 'system':
        return `
          <div class="max-w-2xl space-y-6">
            <div>
              <h2 class="text-2xl font-bold text-white">System</h2>
              <p class="text-xs text-slate-400 mt-1">Display, sound, notifications, power and storage.</p>
            </div>

            <div class="bg-[#262626] border border-[#333] rounded-2xl p-5 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <i class="fas fa-volume-up text-emerald-400 text-xl"></i>
                <div>
                  <div class="font-bold text-xs text-white">Master Audio Volume</div>
                  <div class="text-[10px] text-slate-400">Speaker output: ${settings.volume}%</div>
                </div>
              </div>
              <input type="range" id="set-vol" min="0" max="100" value="${settings.volume}" class="w-36 accent-emerald-500 cursor-pointer">
            </div>

            <div class="bg-[#262626] border border-[#333] rounded-2xl p-5 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <i class="fas fa-sun text-amber-400 text-xl"></i>
                <div>
                  <div class="font-bold text-xs text-white">Screen Brightness</div>
                  <div class="text-[10px] text-slate-400">Display panel level: ${settings.brightness}%</div>
                </div>
              </div>
              <input type="range" id="set-bright" min="20" max="100" value="${settings.brightness}" class="w-36 accent-emerald-500 cursor-pointer">
            </div>

            <div class="bg-[#262626] border border-[#333] rounded-2xl p-5 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <i class="fas fa-moon text-purple-400 text-xl"></i>
                <div>
                  <div class="font-bold text-xs text-white">Night Light (Eye Protection)</div>
                  <div class="text-[10px] text-slate-400">Reduces blue light during evening study sessions</div>
                </div>
              </div>
              <button id="set-night-btn" class="px-4 py-1.5 rounded-full font-bold text-xs transition-colors ${settings.nightLight ? 'bg-[#389e3c] text-white' : 'bg-[#333] text-slate-300'}">
                ${settings.nightLight ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        `;

      case 'personalization':
        return `
          <div class="max-w-2xl space-y-6">
            <div>
              <h2 class="text-2xl font-bold text-white">Personalization</h2>
              <p class="text-xs text-slate-400 mt-1">Backgrounds, accent colors, and desktop themes.</p>
            </div>

            <div class="bg-[#262626] border border-[#333] rounded-2xl p-5 space-y-4">
              <div class="font-bold text-xs text-white">Select Desktop Theme</div>
              <div class="grid grid-cols-3 gap-3">
                <div class="theme-card p-3 rounded-xl border border-emerald-500 bg-emerald-950/50 cursor-pointer text-center">
                  <div class="h-14 rounded-lg bg-gradient-to-br from-emerald-900 to-green-950 mb-2 border border-emerald-700"></div>
                  <span class="text-xs font-bold text-emerald-300">Dawamu Emerald (Default)</span>
                </div>
                <div class="theme-card p-3 rounded-xl border border-[#333] bg-[#1a1a1a] hover:border-slate-500 cursor-pointer text-center">
                  <div class="h-14 rounded-lg bg-gradient-to-br from-blue-900 to-slate-950 mb-2 border border-blue-700"></div>
                  <span class="text-xs font-bold text-slate-300">Deep Blue Windows</span>
                </div>
                <div class="theme-card p-3 rounded-xl border border-[#333] bg-[#1a1a1a] hover:border-slate-500 cursor-pointer text-center">
                  <div class="h-14 rounded-lg bg-gradient-to-br from-slate-900 to-black mb-2 border border-slate-700"></div>
                  <span class="text-xs font-bold text-slate-300">Midnight Dark</span>
                </div>
              </div>
            </div>
          </div>
        `;

      case 'about':
      default:
        return `
          <div class="max-w-2xl space-y-6">
            <div class="flex items-center gap-4">
              <img src="assets/dawamu-logo.png" alt="Dawamu" class="h-16 w-auto object-contain">
              <div>
                <h2 class="text-2xl font-bold text-white">Dawamu OS 11</h2>
                <p class="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Transforming Boys Into Leaders</p>
                <p class="text-[11px] text-slate-500 mt-0.5">Edition: K-12 Student Educational Chromebook & PC Kiosk</p>
              </div>
            </div>

            <div class="bg-[#262626] border border-[#333] rounded-2xl p-5 space-y-2.5 text-xs">
              <div class="flex justify-between py-1 border-b border-[#333]"><span class="text-slate-400">OS Version:</span> <b class="text-white">Dawamu 11 (Build 2026.09.29)</b></div>
              <div class="flex justify-between py-1 border-b border-[#333]"><span class="text-slate-400">Kernel:</span> <b class="text-white">Dawamu Security Linux 6.8.0-x86_64</b></div>
              <div class="flex justify-between py-1 border-b border-[#333]"><span class="text-slate-400">Memory Footprint:</span> <b class="text-emerald-400">380 MB / 8 GB (Ultra-Lightweight)</b></div>
              <div class="flex justify-between py-1 border-b border-[#333]"><span class="text-slate-400">Managed District:</span> <b class="text-white">Dawamu Educational Technology Dept</b></div>
              <div class="flex justify-between py-1"><span class="text-slate-400">Security Mode:</span> <b class="text-emerald-400">SecureBoot Kiosk Active</b></div>
            </div>
          </div>
        `;
    }
  }

  function attachEvents() {
    root.querySelectorAll('.settings-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.dataset.cat;
        render();
      });
    });

    root.querySelector('#set-vol')?.addEventListener('input', (e) => {
      stateStore.updateSettings({ volume: parseInt(e.target.value) });
    });

    root.querySelector('#set-bright')?.addEventListener('input', (e) => {
      stateStore.updateSettings({ brightness: parseInt(e.target.value) });
    });

    root.querySelector('#set-night-btn')?.addEventListener('click', () => {
      const current = stateStore.getState().systemSettings.nightLight;
      stateStore.updateSettings({ nightLight: !current });
      render();
    });
  }

  render();
  return root;
}
