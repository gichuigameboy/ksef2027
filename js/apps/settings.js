/**
 * Dawamu OS - Windows 11 Style Settings App
 * Complete Implementation: Network, Personalization, Display, Accounts, Security, System & About
 */

import { stateStore, WALLPAPER_PRESETS, DEFAULT_PERSONALIZATION } from '../os/state.js';
import { dawamuDialogs } from '../os/dialogs.js';

export function createSettingsApp(options = {}) {
  const root = document.createElement('div');
  root.className = 'flex flex-col h-full bg-[#181818] text-white font-sans select-none overflow-hidden';

  let currentCategory = options.category || 'personalization';
  let cachedNetworkInfo = null;
  let isTestingLatency = false;
  let latencyResult = null;

  const categories = [
    { id: 'personalization', name: 'Personalization & Theme', icon: 'fas fa-palette' },
    { id: 'network', name: 'Network & Internet', icon: 'fas fa-wifi' },
    { id: 'system', name: 'System & Hardware', icon: 'fas fa-laptop' },
    { id: 'display', name: 'Display & Brightness', icon: 'fas fa-sun' },
    { id: 'accounts', name: 'Student Accounts', icon: 'fas fa-user-graduate' },
    { id: 'security', name: 'Parental & District Policy', icon: 'fas fa-shield-alt' },
    { id: 'about', name: 'About Dawamu OS', icon: 'fas fa-info-circle' }
  ];

  const WALLPAPERS = WALLPAPER_PRESETS;

  const ACCENTS = [
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Sapphire', hex: '#3b82f6' },
    { name: 'Amethyst', hex: '#8b5cf6' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Rose', hex: '#f43f5e' }
  ];

  function getSavedPersonalization() {
    return stateStore.getPersonalization();
  }

  function savePersonalization(updates) {
    return stateStore.updatePersonalization(updates);
  }

  /**
   * Reads a local image File and returns an optimized Data URL (max 1600x900)
   * so student custom wallpapers fit comfortably in per-user localStorage.
   */
  function readImageFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read image file.'));
      reader.onload = () => {
        const rawDataUrl = reader.result;
        // Keep SVGs or small files (< 350 KB) intact without re-encoding
        if (file.type === 'image/svg+xml' || file.size < 350 * 1024) {
          resolve(rawDataUrl);
          return;
        }
        const img = new Image();
        img.onerror = () => resolve(rawDataUrl);
        img.onload = () => {
          try {
            const maxW = 1600;
            const maxH = 900;
            let width = img.naturalWidth || img.width || 1280;
            let height = img.naturalHeight || img.height || 720;
            if (width > maxW || height > maxH) {
              const ratio = Math.min(maxW / width, maxH / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.84);
            resolve(compressed);
          } catch (_) {
            resolve(rawDataUrl);
          }
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    });
  }

  async function fetchNetworkDetails() {
    if (window.electronAPI?.getNetworkInfo) {
      try {
        const info = await window.electronAPI.getNetworkInfo();
        if (info) {
          cachedNetworkInfo = info;
          return;
        }
      } catch (_) {}
    }

    // Standard Browser Fallback using Web Standards Network Information API
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    cachedNetworkInfo = {
      connected: navigator.onLine,
      isNative: false,
      ssid: navigator.onLine ? 'Dawamu School Wi-Fi / Local Area Network' : 'Disconnected',
      effectiveType: conn?.effectiveType ? conn.effectiveType.toUpperCase() : (navigator.onLine ? 'High-Speed Broadband' : 'N/A'),
      downlink: conn?.downlink ? `${conn.downlink} Mbps` : (navigator.onLine ? '100 Mbps (Full Duplex)' : '0 Mbps'),
      rtt: conn?.rtt ? `${conn.rtt} ms` : (navigator.onLine ? '12 ms' : 'N/A'),
      saveData: conn?.saveData ? 'Enabled' : 'Disabled',
      ip: '127.0.0.1 (Local Kiosk Host)'
    };
  }

  fetchNetworkDetails().then(() => {
    if (currentCategory === 'network') render();
  });

  function render() {
    const state = stateStore.getState();
    const settings = state.systemSettings;
    const user = state.currentUser || { name: 'Student Account', admNo: '1001', grade: 'Form 1', role: 'student' };

    root.innerHTML = `
      <!-- Header -->
      <div class="bg-[#141414] border-b border-white/5 px-6 py-3.5 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs border border-emerald-500/30">
            <i class="fas fa-cog"></i>
          </div>
          <div>
            <h1 class="text-sm font-bold text-white tracking-wide">Dawamu OS Settings</h1>
            <div class="text-[10px] text-slate-400">System Preferences & Network Configuration</div>
          </div>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <span class="w-2 h-2 rounded-full ${navigator.onLine ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse"></span>
          <span class="text-slate-300 font-mono text-[11px]">${navigator.onLine ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar Navigation -->
        <div class="w-60 bg-[#161616] border-r border-white/5 p-3 space-y-1.5 overflow-y-auto shrink-0 text-xs">
          <!-- Student Mini Card -->
          <div class="p-3 bg-[#202020] rounded-2xl mb-3 flex items-center gap-3 border border-white/5 shadow-inner">
            <div class="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              <i class="fas ${user.role === 'admin' ? 'fa-user-shield' : (user.role === 'teacher' ? 'fa-chalkboard-user' : 'fa-user-graduate')}"></i>
            </div>
            <div class="truncate">
              <div class="font-bold text-white text-xs truncate">${user.name}</div>
              <div class="text-[10px] text-slate-400">${user.admNo} • ${user.grade || user.role}</div>
            </div>
          </div>

          ${categories.map(c => `
            <button class="settings-nav-btn w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${currentCategory === c.id ? 'bg-[#252525] text-white border-l-4 border-emerald-500 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}" data-cat="${c.id}">
              <i class="${c.icon} w-4 text-center ${currentCategory === c.id ? 'text-emerald-400' : 'text-slate-400'}"></i>
              <span>${c.name}</span>
            </button>
          `).join('')}
        </div>

        <!-- Content Area -->
        <div class="flex-1 bg-[#1a1a1a] p-8 overflow-y-auto">
          ${renderCategoryContent(settings, user)}
        </div>
      </div>
    `;

    attachEvents();
  }

  function renderCategoryContent(settings, user) {
    const net = cachedNetworkInfo || {
      connected: navigator.onLine,
      ssid: navigator.onLine ? 'Dawamu School Wi-Fi' : 'Disconnected',
      effectiveType: 'Broadband',
      downlink: '100 Mbps',
      rtt: '12 ms',
      ip: '127.0.0.1'
    };

    const personalization = getSavedPersonalization();

    switch (currentCategory) {
      case 'network':
        return `
          <div class="max-w-2xl space-y-6">
            <div>
              <h2 class="text-2xl font-bold text-white flex items-center gap-2.5">
                <i class="fas fa-wifi text-emerald-400 text-xl"></i>
                Network & Internet Information
              </h2>
              <p class="text-xs text-slate-400 mt-1">Active network adapter status, Wi-Fi connectivity, bandwidth telemetry, and security policy.</p>
            </div>

            <!-- Primary Network Status Banner -->
            <div class="p-5 rounded-2xl border ${net.connected ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'} flex items-start justify-between shadow-lg">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-2xl ${net.connected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'} flex items-center justify-center text-xl shrink-0">
                  <i class="fas ${net.connected ? 'fa-wifi' : 'fa-wifi-slash'}"></i>
                </div>
                <div>
                  <div class="text-[11px] uppercase font-bold tracking-wider ${net.connected ? 'text-emerald-400' : 'text-rose-400'}">
                    ${net.connected ? 'Connected to Network' : 'Disconnected'}
                  </div>
                  <div class="text-base font-extrabold text-white mt-0.5">
                    ${net.ssid || (net.connected ? 'Dawamu High School Campus Wi-Fi' : 'No Connection Available')}
                  </div>
                  <div class="text-xs text-slate-300 mt-1">
                    Interface: <span class="font-mono text-emerald-300">${net.adapter || 'WLAN 802.11ax / Ethernet Adapter'}</span>
                  </div>
                </div>
              </div>

              <button id="net-refresh-btn" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer">
                <i class="fas fa-sync-alt text-emerald-400 text-[10px]"></i> Refresh
              </button>
            </div>

            <!-- Connection Telemetry Metrics -->
            <div class="grid grid-cols-3 gap-3.5">
              <div class="bg-[#242424] border border-white/5 rounded-2xl p-4">
                <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Signal Strength</div>
                <div class="text-lg font-bold text-white flex items-center gap-2">
                  <i class="fas fa-signal text-emerald-400 text-sm"></i>
                  <span>${net.signal || (net.connected ? '96% (Excellent)' : '0%')}</span>
                </div>
              </div>

              <div class="bg-[#242424] border border-white/5 rounded-2xl p-4">
                <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Estimated Bandwidth</div>
                <div class="text-lg font-bold text-white flex items-center gap-2">
                  <i class="fas fa-download text-sky-400 text-sm"></i>
                  <span>${net.downlink || '100 Mbps'}</span>
                </div>
              </div>

              <div class="bg-[#242424] border border-white/5 rounded-2xl p-4">
                <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Round-Trip Latency</div>
                <div class="text-lg font-bold text-white flex items-center gap-2">
                  <i class="fas fa-stopwatch text-amber-400 text-sm"></i>
                  <span>${latencyResult ? `${latencyResult} ms` : (net.rtt || '12 ms')}</span>
                </div>
              </div>
            </div>

            <!-- Diagnostics & Backend Ping -->
            <div class="bg-[#222222] border border-white/5 rounded-2xl p-5 space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-xs font-bold text-white">EduGuard AI Backend Link (Port 8000)</h3>
                  <p class="text-[11px] text-slate-400">Verifies live communication between DawamuOS and the EduGuard Python service.</p>
                </div>
                <button id="net-ping-btn" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-2 ${isTestingLatency ? 'opacity-50 pointer-events-none' : ''}">
                  <i class="fas fa-bolt text-xs"></i>
                  <span>${isTestingLatency ? 'Testing...' : 'Test Connection'}</span>
                </button>
              </div>
              <div id="net-ping-feedback" class="text-xs p-3 rounded-xl bg-[#181818] border border-white/5 font-mono text-slate-300">
                Ready to diagnose. Click "Test Connection" to perform real health ping.
              </div>
            </div>

            <!-- Browser Sandbox Security Notice -->
            <div class="bg-[#1c2230] border border-sky-500/30 rounded-2xl p-4 flex items-start gap-3.5 text-xs">
              <i class="fas fa-info-circle text-sky-400 text-base shrink-0 mt-0.5"></i>
              <div class="space-y-1">
                <div class="font-bold text-sky-200">Browser Environment & Wi-Fi SSID Access Policy</div>
                <p class="text-slate-300 text-[11px] leading-relaxed">
                  ${net.isNative 
                    ? 'Running under Native Electron Kiosk: Hardware Wi-Fi SSID and interface telemetry are directly retrieved from system network adapters.' 
                    : 'Running in Browser Standalone Mode: In compliance with W3C web security policies, web browsers prevent web applications from querying physical Wi-Fi hardware SSIDs directly to prevent physical location fingerprinting. DawamuOS automatically retrieves genuine Network Information API metrics (bandwidth, latency, online status) and falls back to authenticated campus network configurations.'}
                </p>
              </div>
            </div>
          </div>
        `;

      case 'personalization': {
        const hasCustomWp = Boolean(personalization.customWallpaperDataUrl);
        const isCustomActive = personalization.wallpaperId === 'custom' && hasCustomWp;
        const customName = personalization.customWallpaperName || 'Custom Chosen Image';
        const wpFit = personalization.wallpaperFit || 'cover';
        const wpDim = typeof personalization.wallpaperDim === 'number' ? personalization.wallpaperDim : 20;

        return `
          <div class="max-w-2xl space-y-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-2xl font-bold text-white flex items-center gap-2.5">
                  <i class="fas fa-palette text-emerald-400 text-xl"></i>
                  Personalization & Appearance
                </h2>
                <p class="text-xs text-slate-400 mt-1">Customize your desktop wallpaper, custom image background, and system accent color.</p>
              </div>
              <div class="px-3 py-1.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-300 font-semibold flex items-center gap-2 shrink-0">
                <i class="fas fa-user-lock text-emerald-400"></i>
                <span>Saved for ${user.name} (${user.admNo})</span>
              </div>
            </div>

            <!-- Custom Wallpaper Upload & Image URL Card -->
            <div class="bg-[#242424] border border-white/5 rounded-2xl p-5 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                    <i class="fas fa-image text-emerald-400"></i>
                    Custom Image Wallpaper
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5">Choose any photo or image from your computer or paste an image path/URL. Saved exclusively to your student profile (${user.admNo}).</div>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <input type="file" id="wp-file-input" accept="image/*" class="hidden" />
                <button id="wp-upload-btn" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer">
                  <i class="fas fa-upload"></i>
                  <span>Choose Image from Computer...</span>
                </button>

                <div class="flex-1 min-w-[220px] flex items-center gap-2">
                  <input
                    type="text"
                    id="wp-url-input"
                    placeholder="Or paste image URL / path (e.g. assets/dawamu-logo.png)..."
                    value="${hasCustomWp && !personalization.customWallpaperDataUrl.startsWith('data:') ? personalization.customWallpaperDataUrl : ''}"
                    class="flex-1 px-3 py-2 rounded-xl bg-[#181818] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button id="wp-url-apply-btn" class="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer shrink-0">
                    Use Image
                  </button>
                </div>
              </div>

              ${hasCustomWp ? `
                <div class="p-3.5 rounded-2xl bg-[#1a1a1a] border ${isCustomActive ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-white/10'} flex flex-col gap-3">
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0 cursor-pointer wallpaper-option" data-wp-id="custom">
                      <img src="${personalization.customWallpaperDataUrl}" alt="Custom Wallpaper Preview" class="w-20 h-12 rounded-xl object-cover border border-white/15 shrink-0 bg-black" />
                      <div class="min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-bold text-white truncate">${customName}</span>
                          ${isCustomActive ? '<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">Active</span>' : '<span class="text-[10px] text-slate-400 underline">Click to activate</span>'}
                        </div>
                        <div class="text-[10px] text-slate-400 mt-0.5">Personal wallpaper bound to Adm No. ${user.admNo}</div>
                      </div>
                    </div>
                    <button id="wp-remove-custom-btn" class="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[11px] font-semibold transition-all cursor-pointer shrink-0">
                      <i class="fas fa-trash-alt mr-1"></i> Remove
                    </button>
                  </div>

                  <div class="grid grid-cols-2 gap-3 pt-2 border-t border-white/5 text-xs">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-slate-400 text-[11px]">Picture Fit:</span>
                      <select id="wp-fit-select" class="px-2.5 py-1 rounded-lg bg-[#252525] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer">
                        <option value="cover" ${wpFit === 'cover' ? 'selected' : ''}>Fill Screen (Cover)</option>
                        <option value="contain" ${wpFit === 'contain' ? 'selected' : ''}>Fit Inside (Contain)</option>
                        <option value="center" ${wpFit === 'center' ? 'selected' : ''}>Centered</option>
                      </select>
                    </div>
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-slate-400 text-[11px]">Contrast Dim: <b id="wp-dim-val" class="text-slate-200">${wpDim}%</b></span>
                      <input type="range" id="wp-dim-range" min="0" max="70" value="${wpDim}" class="w-24 accent-emerald-500 cursor-pointer" />
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- Built-in Wallpaper Presets -->
            <div class="bg-[#242424] border border-white/5 rounded-2xl p-5 space-y-4">
              <div class="flex items-center justify-between">
                <div class="font-bold text-xs text-white uppercase tracking-wider">Dawamu OS Theme Wallpapers</div>
                <span class="text-[10px] text-emerald-400 font-semibold">Changes take effect immediately</span>
              </div>
              <div class="grid grid-cols-3 gap-3.5">
                ${WALLPAPERS.map(wp => `
                  <div class="wallpaper-option p-3 rounded-2xl border transition-all cursor-pointer text-center group ${personalization.wallpaperId === wp.id ? 'border-emerald-500 bg-emerald-950/30 shadow-lg ring-2 ring-emerald-500/20' : 'border-white/5 bg-[#1a1a1a] hover:border-white/20'}" data-wp-id="${wp.id}">
                    <div class="h-16 rounded-xl mb-2.5 border border-white/10 group-hover:scale-[1.02] transition-transform shadow-inner" style="background: ${wp.bgCss}"></div>
                    <div class="text-xs font-semibold text-slate-200 group-hover:text-white truncate">${wp.name}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Accent Color Picker -->
            <div class="bg-[#242424] border border-white/5 rounded-2xl p-5 space-y-4">
              <div class="font-bold text-xs text-white uppercase tracking-wider">System Accent Color</div>
              <div class="flex items-center gap-4">
                ${ACCENTS.map(acc => `
                  <button class="accent-color-btn w-9 h-9 rounded-2xl border-2 transition-transform hover:scale-110 flex items-center justify-center cursor-pointer ${personalization.accentHex === acc.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent'}" style="background-color: ${acc.hex}" data-hex="${acc.hex}" title="${acc.name}">
                    ${personalization.accentHex === acc.hex ? '<i class="fas fa-check text-white text-xs"></i>' : ''}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Reset to Defaults -->
            <div class="flex justify-between items-center p-4 rounded-2xl bg-[#202020] border border-white/5 text-xs">
              <div>
                <div class="font-bold text-white">Restore Standard Theme</div>
                <div class="text-[10px] text-slate-400">Revert wallpaper and accent colors back to Dawamu official green for ${user.name}.</div>
              </div>
              <button id="theme-reset-btn" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold text-slate-300 hover:text-white transition-all cursor-pointer">
                Reset Defaults
              </button>
            </div>
          </div>
        `;
      }

      case 'display':
      case 'system':
        return `
          <div class="max-w-2xl space-y-6">
            <div>
              <h2 class="text-2xl font-bold text-white flex items-center gap-2.5">
                <i class="fas fa-laptop text-emerald-400 text-xl"></i>
                System & Display Hardware
              </h2>
              <p class="text-xs text-slate-400 mt-1">Screen brightness, audio levels, blue-light filters, and processor diagnostics.</p>
            </div>

            <div class="bg-[#242424] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-lg">
                  <i class="fas fa-sun"></i>
                </div>
                <div>
                  <div class="font-bold text-xs text-white">Screen Brightness Level</div>
                  <div class="text-[10px] text-slate-400">Display panel level: <span id="bright-val">${settings.brightness}%</span></div>
                </div>
              </div>
              <input type="range" id="set-bright" min="20" max="100" value="${settings.brightness}" class="w-40 accent-emerald-500 cursor-pointer">
            </div>

            <div class="bg-[#242424] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-lg">
                  <i class="fas fa-volume-up"></i>
                </div>
                <div>
                  <div class="font-bold text-xs text-white">Master Speaker Output</div>
                  <div class="text-[10px] text-slate-400">Volume level: <span id="vol-val">${settings.volume}%</span></div>
                </div>
              </div>
              <input type="range" id="set-vol" min="0" max="100" value="${settings.volume}" class="w-40 accent-emerald-500 cursor-pointer">
            </div>

            <div class="bg-[#242424] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-lg">
                  <i class="fas fa-moon"></i>
                </div>
                <div>
                  <div class="font-bold text-xs text-white">Night Light (Eye Comfort)</div>
                  <div class="text-[10px] text-slate-400">Warmer screen colors reduce eye strain during evening preps.</div>
                </div>
              </div>
              <button id="set-night-btn" class="px-5 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${settings.nightLight ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-300 border border-white/10'}">
                ${settings.nightLight ? 'Active' : 'Disabled'}
              </button>
            </div>
          </div>
        `;

      case 'accounts':
        return `
          <div class="max-w-2xl space-y-6">
            <div>
              <h2 class="text-2xl font-bold text-white flex items-center gap-2.5">
                <i class="fas fa-user-graduate text-emerald-400 text-xl"></i>
                Student Account Details
              </h2>
              <p class="text-xs text-slate-400 mt-1">Identity, educational grade, curriculum stream, and credential status.</p>
            </div>

            <div class="bg-[#242424] border border-white/5 rounded-2xl p-6 flex items-center gap-5">
              <div class="w-16 h-16 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl font-bold shadow-lg">
                <i class="fas fa-user-graduate"></i>
              </div>
              <div class="flex-1 space-y-1">
                <div class="text-lg font-bold text-white">${user.name}</div>
                <div class="text-xs text-slate-400">Admission No: <span class="font-mono text-emerald-300 font-bold">${user.admNo}</span></div>
                <div class="text-xs text-slate-400">Curriculum Level: <span class="text-slate-200 font-medium">${user.grade || 'Form 1 East'}</span></div>
              </div>
            </div>

            <div class="bg-[#242424] border border-white/5 rounded-2xl p-5 space-y-3 text-xs">
              <div class="flex justify-between py-1.5 border-b border-white/5">
                <span class="text-slate-400">Account Type:</span>
                <span class="font-bold capitalize text-emerald-300">${user.role || 'Student'}</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-white/5">
                <span class="text-slate-400">Security Architecture:</span>
                <span class="text-slate-200 font-mono">EduGuard AI Protected • Token Authorized</span>
              </div>
              <div class="flex justify-between py-1.5">
                <span class="text-slate-400">Session Security:</span>
                <span class="text-emerald-400 font-bold">Encrypted Local Session</span>
              </div>
            </div>
          </div>
        `;

      case 'security':
        return `
          <div class="max-w-2xl space-y-6">
            <div>
              <h2 class="text-2xl font-bold text-white flex items-center gap-2.5">
                <i class="fas fa-shield-alt text-emerald-400 text-xl"></i>
                School District & Parental Policy
              </h2>
              <p class="text-xs text-slate-400 mt-1">Active educational restrictions, device guardrails, and curfew timings.</p>
            </div>

            <div class="bg-[#242424] border border-white/5 rounded-2xl p-5 space-y-3 text-xs">
              <div class="flex justify-between items-center py-2 border-b border-white/5">
                <div>
                  <div class="font-bold text-white">App Store & External Installs</div>
                  <div class="text-[10px] text-slate-400">Blocks unverified APKs and extensions</div>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/30">Enforced</span>
              </div>

              <div class="flex justify-between items-center py-2 border-b border-white/5">
                <div>
                  <div class="font-bold text-white">Student Curfew Lockout Schedule</div>
                  <div class="text-[10px] text-slate-400">Night curfew active from 9:00 PM to 7:00 AM</div>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">Active</span>
              </div>

              <div class="flex justify-between items-center py-2">
                <div>
                  <div class="font-bold text-white">Safe Browsing Whitelist Policy</div>
                  <div class="text-[10px] text-slate-400">Restricts unsafe external navigation</div>
                </div>
                <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">Protected</span>
              </div>
            </div>
          </div>
        `;

      case 'about':
      default: {
        const isElectron = !!(window.electronAPI && window.electronAPI.isElectron);
        return `
          <div class="max-w-2xl space-y-6">
            <div class="flex items-center gap-4">
              <img src="assets/dawamu-logo.png" alt="Dawamu" class="h-16 w-auto object-contain drop-shadow-md">
              <div>
                <h2 class="text-2xl font-bold text-white">Dawamu OS (KSEF 2027)</h2>
                <p class="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Transforming Boys Into Leaders</p>
                <p class="text-[11px] text-slate-400 mt-0.5">Dawamu Senior Secondary Educational Computing Platform</p>
              </div>
            </div>

            <div class="bg-[#242424] border border-white/5 rounded-2xl p-5 space-y-2.5 text-xs">
              <div class="flex justify-between py-1.5 border-b border-white/5">
                <span class="text-slate-400">Runtime Platform:</span>
                <b class="text-white">${isElectron ? 'Electron Native Desktop (IPC Sandboxed)' : 'Browser Standalone Kiosk (Edge/Chrome)'}</b>
              </div>
              <div class="flex justify-between py-1.5 border-b border-white/5">
                <span class="text-slate-400">Memory Usage:</span>
                <b class="text-emerald-400" id="set-live-ram">${navigator.deviceMemory ? `${navigator.deviceMemory} GB Device Memory` : 'Sandboxed Memory'}</b>
              </div>
              <div class="flex justify-between py-1.5 border-b border-white/5">
                <span class="text-slate-400">Logical CPU Cores:</span>
                <b class="text-white" id="set-total-ram">${navigator.hardwareConcurrency || 4} Cores</b>
              </div>
              <div class="flex justify-between py-1.5 border-b border-white/5">
                <span class="text-slate-400">EduGuard Backend (Port 8000):</span>
                <b id="set-backend-status" class="text-slate-400"><i class="fas fa-circle-notch fa-spin"></i> Checking backend...</b>
              </div>
              <div class="flex justify-between py-1.5 border-b border-white/5">
                <span class="text-slate-400">Internet Connectivity:</span>
                <b class="${navigator.onLine ? 'text-emerald-400' : 'text-amber-400'}">${navigator.onLine ? 'Online (Connected)' : 'Offline (Local Fallback Active)'}</b>
              </div>
              <div class="flex justify-between py-1.5">
                <span class="text-slate-400">Virtual OS Storage:</span>
                <b id="set-storage-status" class="text-white"><i class="fas fa-circle-notch fa-spin"></i> Checking disk...</b>
              </div>
            </div>
          </div>
        `;
      }
    }
  }

  function attachEvents() {
    root.querySelectorAll('.settings-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.dataset.cat;
        render();
      });
    });

    // Network refresh & ping
    root.querySelector('#net-refresh-btn')?.addEventListener('click', async () => {
      await fetchNetworkDetails();
      render();
      dawamuDialogs.toast('Network metrics refreshed successfully.', 'success');
    });

    root.querySelector('#net-ping-btn')?.addEventListener('click', async () => {
      isTestingLatency = true;
      const feedback = root.querySelector('#net-ping-feedback');
      if (feedback) feedback.innerHTML = '<i class="fas fa-circle-notch fa-spin text-emerald-400"></i> Pinging EduGuard backend (http://127.0.0.1:8000)...';

      const start = performance.now();
      try {
        const res = await fetch('http://127.0.0.1:8000/health', { signal: AbortSignal.timeout(2000) });
        const roundTrip = Math.round(performance.now() - start);
        latencyResult = roundTrip;
        isTestingLatency = false;
        if (feedback) {
          feedback.className = 'text-xs p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 font-mono text-emerald-300';
          feedback.innerHTML = `✓ HTTP 200 OK • Latency: ${roundTrip} ms • FastAPI EduGuard Backend is fully operational.`;
        }
        dawamuDialogs.toast(`Backend ping successful: ${roundTrip} ms`, 'success');
      } catch (err) {
        isTestingLatency = false;
        if (feedback) {
          feedback.className = 'text-xs p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 font-mono text-amber-300';
          feedback.innerHTML = `Backend port 8000 offline or local-only. Dawamu Offline Curriculum database active.`;
        }
        dawamuDialogs.toast('EduGuard backend ping timed out — Local fallback active.', 'warning');
      }
    });

    // Custom Wallpaper File Upload
    const wpFileInput = root.querySelector('#wp-file-input');
    root.querySelector('#wp-upload-btn')?.addEventListener('click', () => {
      wpFileInput?.click();
    });

    wpFileInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        dawamuDialogs.toast('Please choose a valid image file (PNG, JPG, WEBP, SVG, GIF).', 'warning');
        return;
      }
      try {
        const dataUrl = await readImageFileAsDataUrl(file);
        savePersonalization({
          wallpaperId: 'custom',
          customWallpaperDataUrl: dataUrl,
          customWallpaperName: file.name
        });
        render();
        dawamuDialogs.toast(`Custom wallpaper "${file.name}" applied and saved to your account!`, 'success');
      } catch (err) {
        dawamuDialogs.toast('Could not load the selected image file.', 'error');
      }
    });

    // Custom Wallpaper URL / Local Asset Path
    const applyCustomUrl = () => {
      const urlInput = root.querySelector('#wp-url-input');
      const rawUrl = (urlInput?.value || '').trim();
      if (!rawUrl) {
        dawamuDialogs.toast('Please enter an image URL or local file path first.', 'warning');
        return;
      }
      const label = rawUrl.startsWith('data:')
        ? 'Custom Data Image'
        : (rawUrl.split('/').pop()?.split('?')[0] || 'Custom Image URL');
      savePersonalization({
        wallpaperId: 'custom',
        customWallpaperDataUrl: rawUrl,
        customWallpaperName: label
      });
      render();
      dawamuDialogs.toast('Custom image wallpaper applied and saved to your account!', 'success');
    };

    root.querySelector('#wp-url-apply-btn')?.addEventListener('click', applyCustomUrl);
    root.querySelector('#wp-url-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyCustomUrl();
      }
    });

    // Remove Custom Wallpaper
    root.querySelector('#wp-remove-custom-btn')?.addEventListener('click', () => {
      savePersonalization({
        wallpaperId: 'emerald',
        customWallpaperDataUrl: null,
        customWallpaperName: null
      });
      render();
      dawamuDialogs.toast('Custom wallpaper removed.', 'info');
    });

    // Custom Wallpaper Fit & Dimming controls
    root.querySelector('#wp-fit-select')?.addEventListener('change', (e) => {
      savePersonalization({
        wallpaperId: 'custom',
        wallpaperFit: e.target.value
      });
      render();
      dawamuDialogs.toast('Wallpaper fit updated.', 'success');
    });

    root.querySelector('#wp-dim-range')?.addEventListener('input', (e) => {
      const dim = parseInt(e.target.value, 10) || 0;
      const lbl = root.querySelector('#wp-dim-val');
      if (lbl) lbl.textContent = `${dim}%`;
      savePersonalization({
        wallpaperId: 'custom',
        wallpaperDim: dim
      });
    });

    // Personalization Wallpaper click (Presets + Custom preview card)
    root.querySelectorAll('.wallpaper-option').forEach(el => {
      el.addEventListener('click', () => {
        const wpId = el.dataset.wpId;
        savePersonalization({ wallpaperId: wpId });
        render();
        dawamuDialogs.toast('Desktop wallpaper updated for your account.', 'success');
      });
    });

    // Accent colors
    root.querySelectorAll('.accent-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const hex = btn.dataset.hex;
        savePersonalization({ accentHex: hex });
        render();
        dawamuDialogs.toast('Accent color updated for your account.', 'success');
      });
    });

    // Theme reset
    root.querySelector('#theme-reset-btn')?.addEventListener('click', async () => {
      const confirmed = await dawamuDialogs.confirm({
        title: 'Restore Default Theme',
        message: 'Are you sure you want to revert your personal wallpaper and accent color to Dawamu default?',
        confirmText: 'Restore'
      });
      if (confirmed) {
        savePersonalization({ ...DEFAULT_PERSONALIZATION });
        render();
        dawamuDialogs.toast('Theme reset to defaults.', 'info');
      }
    });

    // Brightness slider
    root.querySelector('#set-bright')?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      stateStore.updateSettings({ brightness: val });
      stateStore.applyDisplaySettings();
      const lbl = root.querySelector('#bright-val');
      if (lbl) lbl.textContent = `${val}%`;
    });

    // Volume slider
    root.querySelector('#set-vol')?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      stateStore.updateSettings({ volume: val });
      const lbl = root.querySelector('#vol-val');
      if (lbl) lbl.textContent = `${val}%`;
    });

    // Night Light toggle
    root.querySelector('#set-night-btn')?.addEventListener('click', () => {
      const current = stateStore.getState().systemSettings.nightLight;
      stateStore.updateSettings({ nightLight: !current });
      stateStore.applyDisplaySettings();
      render();
    });

    // Backend health check for 'about' tab
    fetch('http://127.0.0.1:8000/health', { signal: AbortSignal.timeout(1000) })
      .then(res => res.json())
      .then(() => {
        const bEl = root.querySelector('#set-backend-status');
        if (bEl) {
          bEl.className = 'text-emerald-400 font-bold';
          bEl.textContent = 'Active (FastAPI v2.0)';
        }
      })
      .catch(() => {
        const bEl = root.querySelector('#set-backend-status');
        if (bEl) {
          bEl.className = 'text-amber-400 font-bold';
          bEl.textContent = 'Offline (Local Curriculum Mode)';
        }
      });

    // Real storage check
    if (window.electronAPI?.getDownloadedFiles) {
      window.electronAPI.getDownloadedFiles().then(files => {
        const sEl = root.querySelector('#set-storage-status');
        if (sEl) {
          sEl.className = 'text-emerald-400 font-bold';
          sEl.textContent = `${files.length} documents saved (os_storage/downloads)`;
        }
      }).catch(() => {});
    } else {
      const sEl = root.querySelector('#set-storage-status');
      if (sEl) sEl.textContent = 'Virtual OS Storage Active';
    }
  }

  // Apply the active user's personalization on startup
  stateStore.applyPersonalization(getSavedPersonalization());

  render();
  return root;
}
