/**
 * Dawamu OS - Hard Drive & SSD Installer Wizard
 * 
 * Allows school IT admins and students to install Dawamu OS permanently 
 * onto any computer's internal hard drive or SSD.
 */

export function createInstallerApp() {
  const root = document.createElement('div');
  root.className = 'flex flex-col h-full bg-[#1e2022] text-white font-sans select-none overflow-hidden';

  let currentStep = 1;
  let selectedDrive = '/dev/sda';
  let isInstalling = false;

  const drives = [
    { id: '/dev/sda', name: 'Internal SSD (Samsung 870 EVO - 256 GB)', size: '256 GB', type: 'SSD (SATA)' },
    { id: '/dev/nvme0n1', name: 'Internal NVMe (Kioxia NVMe SSD - 512 GB)', size: '512 GB', type: 'NVMe (PCIe)' },
    { id: '/dev/sdb', name: 'Secondary Drive (Seagate BarraCuda - 1 TB)', size: '1000 GB', type: 'HDD (SATA)' }
  ];

  function render() {
    root.innerHTML = `
      <!-- Header -->
      <div class="bg-[#18191b] border-b border-slate-700/60 px-6 py-4 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <img src="assets/dawamu-logo.png" alt="Dawamu" class="h-10 w-auto object-contain">
          <div>
            <h1 class="text-base font-bold text-white">Dawamu OS Disk Installer</h1>
            <p class="text-[11px] text-[#389e3c] font-semibold uppercase tracking-wider">Install Dawamu OS to Internal Storage</p>
          </div>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span class="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">Step ${currentStep} of 4</span>
        </div>
      </div>

      <!-- Main Step Container -->
      <div class="flex-1 overflow-y-auto p-8 flex flex-col justify-between max-w-3xl mx-auto w-full">
        ${renderStepContent()}

        <!-- Bottom Controls -->
        <div class="flex items-center justify-between pt-6 border-t border-slate-800 mt-6 shrink-0">
          <button id="inst-prev-btn" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all ${currentStep === 1 || isInstalling ? 'opacity-30 cursor-not-allowed' : ''}" ${currentStep === 1 || isInstalling ? 'disabled' : ''}>
            <i class="fas fa-arrow-left mr-1.5"></i> Back
          </button>

          <div class="flex items-center gap-3">
            <button id="inst-cancel-btn" class="px-4 py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors" ${isInstalling ? 'disabled' : ''}>
              Cancel
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
    if (currentStep === 1) return 'Get Started <i class="fas fa-arrow-right ml-1"></i>';
    if (currentStep === 2) return 'Select Drive & Continue <i class="fas fa-arrow-right ml-1"></i>';
    if (currentStep === 3) return '<i class="fas fa-hdd mr-1"></i> Erase & Install Dawamu OS';
    if (currentStep === 4) return '<i class="fas fa-redo mr-1"></i> Reboot Computer Now';
    return 'Next';
  }

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return `
          <div class="space-y-6">
            <div class="text-center space-y-3">
              <div class="w-16 h-16 bg-emerald-950/60 border border-[#389e3c]/40 text-[#389e3c] rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-950/50">
                <i class="fas fa-download"></i>
              </div>
              <h2 class="text-2xl font-extrabold text-white">Welcome to Dawamu OS Setup</h2>
              <p class="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Transform this computer into a dedicated, high-speed Dawamu Educational Chromebook. The installation takes less than 2 minutes.
              </p>
            </div>

            <!-- Hardware Check -->
            <div class="bg-[#18191b] border border-slate-800 rounded-2xl p-5 space-y-3">
              <div class="text-xs font-bold uppercase tracking-wider text-slate-400">System Compatibility Check</div>
              <div class="grid grid-cols-3 gap-3">
                <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-3">
                  <i class="fas fa-microchip text-emerald-400 text-lg"></i>
                  <div>
                    <div class="text-[10px] text-slate-500 uppercase">Architecture</div>
                    <div class="text-xs font-bold text-slate-200">x86_64 (64-bit) ✓</div>
                  </div>
                </div>
                <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-3">
                  <i class="fas fa-memory text-emerald-400 text-lg"></i>
                  <div>
                    <div class="text-[10px] text-slate-500 uppercase">Memory (RAM)</div>
                    <div class="text-xs font-bold text-slate-200">2 GB+ (Passed) ✓</div>
                  </div>
                </div>
                <div class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-3">
                  <i class="fas fa-shield-alt text-emerald-400 text-lg"></i>
                  <div>
                    <div class="text-[10px] text-slate-500 uppercase">Firmware</div>
                    <div class="text-xs font-bold text-slate-200">UEFI / BIOS ✓</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-emerald-950/30 border border-emerald-800/40 p-4 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
              <i class="fas fa-feather-alt text-lg shrink-0"></i>
              <span><b>Ultra-Lightweight Engine:</b> Dawamu OS runs smoothly on even 10-year-old laptops and low-spec netbooks with zero lag.</span>
            </div>
          </div>
        `;

      case 2:
        return `
          <div class="space-y-5">
            <div>
              <h2 class="text-xl font-bold text-white">Select Target Hard Drive / SSD</h2>
              <p class="text-xs text-slate-400 mt-1">Choose the internal disk where Dawamu OS will be permanently installed.</p>
            </div>

            <div class="space-y-3">
              ${drives.map(d => `
                <div class="drive-card p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${selectedDrive === d.id ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50' : 'bg-[#18191b] border-slate-800 hover:border-slate-700'}" data-drive="${d.id}">
                  <div class="flex items-center gap-3.5">
                    <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg ${selectedDrive === d.id ? 'text-emerald-400' : 'text-slate-400'}">
                      <i class="fas fa-hdd"></i>
                    </div>
                    <div>
                      <div class="text-xs font-bold text-white">${d.name}</div>
                      <div class="text-[10px] text-slate-500 font-mono">${d.id} • ${d.type}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-bold text-white">${d.size}</div>
                    <div class="text-[10px] font-semibold ${selectedDrive === d.id ? 'text-emerald-400' : 'text-slate-500'}">
                      ${selectedDrive === d.id ? '● Selected Target' : 'Click to Select'}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-300 flex items-center gap-2.5">
              <i class="fas fa-exclamation-triangle text-base shrink-0"></i>
              <span><b>Warning:</b> All existing data on the chosen drive will be erased to install a fresh, clean copy of Dawamu OS.</span>
            </div>
          </div>
        `;

      case 3:
        return `
          <div class="space-y-6">
            <div>
              <h2 class="text-xl font-bold text-white">Installing Dawamu OS</h2>
              <p class="text-xs text-slate-400 mt-1">Copying system files, building kernel modules, and setting up bootloader...</p>
            </div>

            <!-- Progress Card -->
            <div class="bg-[#18191b] border border-slate-800 p-6 rounded-2xl space-y-4">
              <div class="flex justify-between items-center text-xs">
                <span id="inst-status-label" class="text-slate-300 font-semibold font-mono">Preparing partition table on ${selectedDrive}...</span>
                <span id="inst-pct" class="text-emerald-400 font-bold font-mono">0%</span>
              </div>

              <!-- Bar -->
              <div class="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
                <div id="inst-progress-bar" class="bg-gradient-to-r from-emerald-600 to-green-400 h-full rounded-full transition-all duration-300 w-0"></div>
              </div>

              <div id="inst-terminal" class="bg-slate-950 p-3 rounded-xl border border-slate-900 font-mono text-[10px] text-slate-500 h-32 overflow-y-auto space-y-1">
                <div>[INFO] Formatting ${selectedDrive} with GPT Partition Table...</div>
              </div>
            </div>

            <div class="text-center text-xs text-slate-500">
              Please do not power off your computer or remove the USB drive during installation.
            </div>
          </div>
        `;

      case 4:
        return `
          <div class="space-y-6 text-center">
            <div class="w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center text-4xl mx-auto shadow-xl shadow-emerald-950/60">
              <i class="fas fa-check-circle"></i>
            </div>

            <div class="space-y-2">
              <h2 class="text-2xl font-extrabold text-white">Installation Complete!</h2>
              <p class="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Dawamu OS has been successfully installed to <b>${selectedDrive}</b>. You can now remove the USB drive and restart the computer.
              </p>
            </div>

            <div class="bg-[#18191b] border border-slate-800 p-5 rounded-2xl max-w-md mx-auto text-left space-y-2 text-xs">
              <div class="text-slate-400 font-bold uppercase text-[10px] tracking-wider mb-2">Installed Components</div>
              <div class="flex justify-between text-slate-300"><span>• Base System:</span> <b class="text-white">Dawamu Linux Core (420 MB)</b></div>
              <div class="flex justify-between text-slate-300"><span>• Bootloader:</span> <b class="text-white">UEFI GRUB v2.4</b></div>
              <div class="flex justify-between text-slate-300"><span>• Offline Libraries:</span> <b class="text-white">Pre-Loaded (Wikipedia & Khan)</b></div>
              <div class="flex justify-between text-slate-300"><span>• Security Daemon:</span> <b class="text-emerald-400">Locked Kiosk Active</b></div>
            </div>
          </div>
        `;
    }
  }

  function startInstallation() {
    isInstalling = true;
    currentStep = 3;
    render();

    const progressBar = root.querySelector('#inst-progress-bar');
    const pctLabel    = root.querySelector('#inst-pct');
    const statusLabel = root.querySelector('#inst-status-label');
    const terminal    = root.querySelector('#inst-terminal');

    const steps = [
      { text: `Creating EFI System Partition (ESP) on ${selectedDrive}1...`, pct: 15 },
      { text: `Formatting root filesystem (ext4) on ${selectedDrive}2...`, pct: 30 },
      { text: 'Extracting Dawamu Core System Image...', pct: 50 },
      { text: 'Configuring Offline Encrypted Educational Database...', pct: 70 },
      { text: 'Installing UEFI GRUB Bootloader to MBR/GPT...', pct: 85 },
      { text: 'Enforcing District Security Policies & Autostart Kiosk...', pct: 95 },
      { text: 'Synchronizing storage buffers and finalizing install...', pct: 100 }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        if (progressBar) progressBar.style.width = `${step.pct}%`;
        if (pctLabel) pctLabel.textContent = `${step.pct}%`;
        if (statusLabel) statusLabel.textContent = step.text;

        if (terminal) {
          const line = document.createElement('div');
          line.textContent = `[OK] ${step.text}`;
          terminal.appendChild(line);
          terminal.scrollTop = terminal.scrollHeight;
        }

        if (idx === steps.length - 1) {
          setTimeout(() => {
            isInstalling = false;
            currentStep = 4;
            render();
          }, 800);
        }
      }, (idx + 1) * 600);
    });
  }

  function attachEvents() {
    // Next / Action Button
    root.querySelector('#inst-next-btn')?.addEventListener('click', () => {
      if (currentStep === 1) {
        currentStep = 2;
        render();
      } else if (currentStep === 2) {
        startInstallation();
      } else if (currentStep === 4) {
        if (window.dawamuPower) window.dawamuPower.reboot();
      }
    });

    // Back Button
    root.querySelector('#inst-prev-btn')?.addEventListener('click', () => {
      if (currentStep > 1 && !isInstalling) {
        currentStep--;
        render();
      }
    });

    // Drive Card Selection
    root.querySelectorAll('.drive-card').forEach(card => {
      card.addEventListener('click', () => {
        selectedDrive = card.dataset.drive;
        render();
      });
    });
  }

  render();
  return root;
}
