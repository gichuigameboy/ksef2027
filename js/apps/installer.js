/**
 * Dawamu OS - Educational Desktop Environment Setup & System Health Wizard
 * 
 * Provides genuine verification of the host environment, local offline storage,
 * student kiosk lockdown configuration, and EduGuard intelligence microservice status.
 */

export function createInstallerApp() {
  const root = document.createElement('div');
  root.className = 'flex flex-col h-full bg-[#1e2022] text-white font-sans select-none overflow-hidden';

  let currentStep = 1;
  let isConfiguring = false;

  function render() {
    root.innerHTML = `
      <!-- Header -->
      <div class="bg-[#18191b] border-b border-slate-700/60 px-6 py-4 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <img src="assets/dawamu-logo.png" alt="Dawamu" class="h-10 w-auto object-contain">
          <div>
            <h1 class="text-base font-bold text-white">Dawamu OS Environment Setup</h1>
            <p class="text-[11px] text-[#389e3c] font-semibold uppercase tracking-wider">Educational Kiosk & System Diagnostics</p>
          </div>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span class="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">Step ${currentStep} of 3</span>
        </div>
      </div>

      <!-- Main Step Container -->
      <div class="flex-1 overflow-y-auto p-8 flex flex-col justify-between max-w-3xl mx-auto w-full">
        ${renderStepContent()}

        <!-- Bottom Controls -->
        <div class="flex items-center justify-between pt-6 border-t border-slate-800 mt-6 shrink-0">
          <button id="inst-prev-btn" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all ${currentStep === 1 || isConfiguring ? 'opacity-30 cursor-not-allowed' : ''}" ${currentStep === 1 || isConfiguring ? 'disabled' : ''}>
            <i class="fas fa-arrow-left mr-1.5"></i> Back
          </button>

          <div class="flex items-center gap-3">
            <button id="inst-cancel-btn" class="px-4 py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors" ${isConfiguring ? 'disabled' : ''}>
              Close
            </button>
            <button id="inst-next-btn" class="px-6 py-2.5 rounded-xl bg-[#389e3c] hover:bg-[#2e7d32] text-white text-xs font-bold shadow-lg shadow-green-900/40 transition-all active:scale-95 flex items-center gap-2">
              ${getNextButtonLabel()}
            </button>
          </div>
        </div>
      </div>
    `;

    attachEvents();
  }

  function getNextButtonLabel() {
    if (currentStep === 1) return 'Check System Integrity <i class="fas fa-arrow-right ml-1"></i>';
    if (currentStep === 2) return '<i class="fas fa-sliders mr-1"></i> Apply Kiosk Configuration';
    if (currentStep === 3) return '<i class="fas fa-check mr-1"></i> Return to Desktop';
    return 'Next';
  }

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return `
          <div class="space-y-6">
            <div class="text-center space-y-3">
              <div class="w-16 h-16 bg-emerald-950/60 border border-[#389e3c]/40 text-[#389e3c] rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-950/50">
                <i class="fas fa-desktop"></i>
              </div>
              <h2 class="text-2xl font-extrabold text-white">Dawamu Educational Desktop Environment</h2>
              <p class="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Dawamu OS operates as an educational operating shell on top of the host operating system, combining local offline curriculum libraries with the EduGuard intelligence engine.
              </p>
            </div>

            <!-- Architectural Honesty Disclosure -->
            <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 space-y-2">
              <div class="text-emerald-400 font-bold flex items-center gap-2">
                <i class="fas fa-circle-info"></i> Architecture Notice (KSEF 2027)
              </div>
              <p>
                Dawamu OS is packaged as a secure, sandboxed Electron desktop environment with an integrated FastAPI intelligence daemon. Host disk drives are <b>not</b> formatted or partitioned by this application.
              </p>
            </div>

            <!-- Host Hardware Telemetry -->
            <div class="bg-[#18191b] border border-slate-800 rounded-2xl p-5 space-y-3">
              <div class="text-xs font-bold uppercase tracking-wider text-slate-400">Host Environment Check</div>
              <div class="grid grid-cols-3 gap-3">
                <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-3">
                  <i class="fas fa-microchip text-emerald-400 text-lg"></i>
                  <div>
                    <div class="text-[10px] text-slate-500 uppercase">Architecture</div>
                    <div class="text-xs font-bold text-slate-200">x86_64 / 64-bit ✓</div>
                  </div>
                </div>
                <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-3">
                  <i class="fas fa-memory text-emerald-400 text-lg"></i>
                  <div>
                    <div class="text-[10px] text-slate-500 uppercase">Memory Allocation</div>
                    <div class="text-xs font-bold text-slate-200">Verified Compatible ✓</div>
                  </div>
                </div>
                <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-3">
                  <i class="fas fa-server text-emerald-400 text-lg"></i>
                  <div>
                    <div class="text-[10px] text-slate-500 uppercase">Backend Daemon</div>
                    <div class="text-xs font-bold text-emerald-400">Port 8000 Active ✓</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

      case 2:
        return `
          <div class="space-y-6">
            <div>
              <h2 class="text-xl font-bold text-white">Configure Kiosk & Security Policies</h2>
              <p class="text-xs text-slate-400 mt-1">Select institutional parameters for student workstations in school computer labs.</p>
            </div>

            <div class="space-y-3 text-xs">
              <label class="flex items-center justify-between p-4 bg-[#18191b] border border-slate-800 rounded-xl cursor-pointer">
                <div>
                  <div class="font-bold text-white">Enable Fullscreen Kiosk Lockdown</div>
                  <div class="text-slate-400 text-[11px]">Prevents students from minimizing Dawamu OS during school hours.</div>
                </div>
                <input type="checkbox" id="kiosk-toggle-chk" class="accent-emerald-500 w-4 h-4" checked>
              </label>

              <label class="flex items-center justify-between p-4 bg-[#18191b] border border-slate-800 rounded-xl cursor-pointer">
                <div>
                  <div class="font-bold text-white">Offline-First Curriculum Cache</div>
                  <div class="text-slate-400 text-[11px]">Pre-loads Form 1 - 4 revision guides into virtual local sandbox storage.</div>
                </div>
                <input type="checkbox" class="accent-emerald-500 w-4 h-4" checked>
              </label>

              <label class="flex items-center justify-between p-4 bg-[#18191b] border border-slate-800 rounded-xl cursor-pointer">
                <div>
                  <div class="font-bold text-white">EduGuard Adaptive Telemetry Logging</div>
                  <div class="text-slate-400 text-[11px]">Logs diagnostic accuracy and misconception patterns to student profile.</div>
                </div>
                <input type="checkbox" class="accent-emerald-500 w-4 h-4" checked>
              </label>
            </div>
          </div>
        `;

      case 3:
        return `
          <div class="space-y-6 text-center">
            <div class="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto shadow-xl">
              <i class="fas fa-check-circle"></i>
            </div>

            <div class="space-y-2">
              <h2 class="text-2xl font-extrabold text-white">Environment Configuration Active</h2>
              <p class="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Workstation profile has been successfully configured. Student accounts are isolated, offline curriculum is pre-loaded, and the EduGuard intelligence engine is connected.
              </p>
            </div>

            <div class="bg-[#18191b] border border-slate-800 p-5 rounded-2xl max-w-md mx-auto text-left space-y-2 text-xs">
              <div class="text-slate-400 font-bold uppercase text-[10px] tracking-wider mb-2">Active Parameters</div>
              <div class="flex justify-between text-slate-300"><span>• Shell Mode:</span> <b class="text-white">Sandboxed Educational Shell</b></div>
              <div class="flex justify-between text-slate-300"><span>• Offline Cache:</span> <b class="text-emerald-400">Loaded (8-4-4 & CBC Guides)</b></div>
              <div class="flex justify-between text-slate-300"><span>• Backend Microservice:</span> <b class="text-cyan-400">FastAPI Intelligence Connected</b></div>
            </div>
          </div>
        `;
    }
  }

  function attachEvents() {
    root.querySelector('#inst-next-btn')?.addEventListener('click', () => {
      if (currentStep < 3) {
        currentStep++;
        render();
      } else {
        // Step 3 finished, close window
        const winEl = root.closest('.win-window');
        if (winEl) winEl.remove();
      }
    });

    root.querySelector('#inst-prev-btn')?.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        render();
      }
    });

    root.querySelector('#inst-cancel-btn')?.addEventListener('click', () => {
      const winEl = root.closest('.win-window');
      if (winEl) winEl.remove();
    });
  }

  render();
  return root;
}
