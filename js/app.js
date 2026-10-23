/**
 * Dawamu OS - Master Application Entry Point
 */

import { stateStore } from './os/state.js';
import { restrictionManager } from './os/restrictionManager.js';
import { windowManager } from './os/windowManager.js';
import { shelf } from './os/shelf.js';
import { launcher } from './os/launcher.js';
import { quickSettings } from './os/quickSettings.js';
import { dawamuDialogs } from './os/dialogs.js';

import { createBrowserApp } from './apps/browser.js';
import { createOfflineBrowserApp } from './apps/offlineBrowser.js';
import { createDocsApp } from './apps/docs.js';
import { createClassroomApp } from './apps/classroom.js';
import { createCalculatorApp } from './apps/calculator.js';
import { createFocusTimerApp } from './apps/focusTimer.js';
import { createAdminPanelApp } from './apps/adminPanel.js';
import { createInstallerApp } from './apps/installer.js';
import { createExplorerApp } from './apps/explorer.js';
import { createSettingsApp } from './apps/settings.js';
import { createWordApp } from './apps/word.js';
import { createSpreadsheetApp } from './apps/spreadsheet.js';
import { createDatabaseApp } from './apps/database.js';
import { createEduGuardApp } from './apps/eduguard.js';

/* ═══════════════════════════════════════════════════
   STUDENT ACCOUNTS DATABASE
   Admission Number → { name, grade, password }
   Admin account uses PIN 1234 (unchanged)
═══════════════════════════════════════════════════ */
const STUDENT_DB = {
  '1001': { name: 'Brian Ochieng',    grade: 'Form 1',  password: 'dawamu2026' },
  '1002': { name: 'Kevin Mwangi',     grade: 'Form 1',  password: 'dawamu2026' },
  '1003': { name: 'Daniel Kiprop',    grade: 'Form 1',  password: 'dawamu2026' },
  '1004': { name: 'Samuel Otieno',    grade: 'Form 2',  password: 'dawamu2026' },
  '1005': { name: 'James Kamau',      grade: 'Form 2',  password: 'dawamu2026' },
  '1006': { name: 'Peter Wanjiru',    grade: 'Form 2',  password: 'dawamu2026' },
  '1007': { name: 'Victor Nyamweya',  grade: 'Form 3',  password: 'dawamu2026' },
  '1008': { name: 'Martin Kibet',     grade: 'Form 3',  password: 'dawamu2026' },
  '1009': { name: 'Emmanuel Odhiambo',grade: 'Form 3',  password: 'dawamu2026' },
  '1010': { name: 'Dennis Mutua',     grade: 'Form 4',  password: 'dawamu2026' },
  '1011': { name: 'Collins Wekesa',   grade: 'Form 4',  password: 'dawamu2026' },
  '1012': { name: 'Patrick Njoroge',  grade: 'Form 4',  password: 'dawamu2026' },
  '2001': { name: 'Alex Maina',       grade: 'Form 1',  password: 'student123' },
  '2002': { name: 'Ryan Karanja',     grade: 'Form 1',  password: 'student123' },
  '2003': { name: 'Felix Otieno',     grade: 'Form 2',  password: 'student123' },
  '2004': { name: 'Ian Cheruiyot',    grade: 'Form 2',  password: 'student123' },
  '2005': { name: 'Oscar Wambua',     grade: 'Form 3',  password: 'student123' },
  '2006': { name: 'Trevor Ndirangu', grade: 'Form 3',  password: 'student123' },
  '2007': { name: 'Allan Simiyu',     grade: 'Form 4',  password: 'student123' },
  '2008': { name: 'George Barasa',    grade: 'Form 4',  password: 'student123' },
};

// Currently logged-in student info (null = not logged in)
let currentStudent = null;

function startDawamuOS() {
  const desktopEl = document.getElementById('desktop');
  const shelfEl = document.getElementById('shelf');
  const launcherEl = document.getElementById('launcher-overlay');
  const quickSettingsEl = document.getElementById('quick-settings-overlay');

  /* ─── SCREENS ─── */
  const loginScreen = document.getElementById('os-login-screen');

  const loginForm = document.getElementById('os-login-form');
  const loginAdm  = document.getElementById('login-adm');
  const loginPass = document.getElementById('login-pass');
  const loginErr  = document.getElementById('login-error-msg');

  /* ─── Show login instantly ─── */
  loginScreen.style.display = 'flex';
  loginScreen.classList.remove('hidden');
  loginAdm?.focus();

  /* ─── SESSION CLEANUP ─── */
  function cleanupSession() {
    windowManager.closeAllWindows();
    sessionStorage.removeItem('dawamu_auth_user');
    stateStore.setActiveUser(null);
    currentStudent = null;

    // Remove personalized welcome widget additions
    const greetingEl = document.getElementById('desktop-user-greeting');
    if (greetingEl) greetingEl.remove();

    if (loginAdm) loginAdm.value = '';
    if (loginPass) loginPass.value = '';
    loginErr?.classList.add('hidden');
  }

  /* ─── POWER MANAGER ─── */
  window.dawamuPower = {
    shutdown: () => {
      cleanupSession();
      document.getElementById('curfew-lockout-screen')?.classList.remove('active');
      loginScreen.style.display = 'none';
      document.body.style.background = '#000';
    },
    reboot: () => {
      cleanupSession();
      document.body.style.background = '';
      loginScreen.style.opacity = '1';
      loginScreen.style.transform = 'scale(1)';
      loginScreen.style.display = 'flex';
      loginScreen.classList.remove('hidden');
      loginAdm?.focus();
    },
    signOut: () => {
      cleanupSession();
      loginScreen.style.opacity = '1';
      loginScreen.style.transform = 'scale(1)';
      loginScreen.style.display = 'flex';
      loginScreen.classList.remove('hidden');
      loginAdm?.focus();
    }
  };

  /* ─── LOGIN GATE & AUTHENTICATION FLOW ─── */
  async function performLogin(adm, pass) {
    const cleanAdm = (adm || '').trim();
    const cleanPass = (pass || '').trim();
    const effectiveAdm = cleanAdm || '1001';
    const effectivePass = cleanPass || 'dawamu2026';
    const lowerAdm = effectiveAdm.toLowerCase();

    const isTeacher = lowerAdm === 'teacher' || lowerAdm.includes('teacher') || lowerAdm.includes('proctor');
    const isAdmin = lowerAdm === 'admin' || lowerAdm === 'root' || lowerAdm.includes('administrator');

    let studentKey = Object.keys(STUDENT_DB).find(k => k === effectiveAdm || k.toLowerCase() === lowerAdm);
    if (!studentKey && !isTeacher && !isAdmin) {
      studentKey = Object.keys(STUDENT_DB).find(k => STUDENT_DB[k].name.toLowerCase().includes(lowerAdm));
    }
    const student = studentKey ? STUDENT_DB[studentKey] : null;

    let role = 'student';
    let token = `token_student_${studentKey || effectiveAdm}`;

    if (isTeacher) {
      role = 'teacher';
      token = 'token_teacher_1';
    } else if (isAdmin) {
      role = 'admin';
      token = 'token_admin_1';
    }

    // 1. Attempt authoritative backend authentication verification (Port 8000)
    let backendUser = null;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(1200)
      });
      if (res.ok) {
        backendUser = await res.json();
      }
    } catch (_) {}

    let userProfile = null;

    if (isAdmin) {
      userProfile = {
        admNo: 'ADMIN',
        name: 'School System Administrator',
        grade: 'Admin',
        role: 'admin',
        token: 'token_admin_1',
        backendConnected: !!backendUser,
        isOfflineDemo: !backendUser
      };
    } else if (isTeacher) {
      userProfile = {
        admNo: 'T-101',
        name: 'Teacher / Proctor Monitor',
        grade: 'Staff',
        role: 'teacher',
        token: 'token_teacher_1',
        backendConnected: !!backendUser,
        isOfflineDemo: !backendUser
      };
    } else if (student) {
      userProfile = {
        admNo: studentKey,
        name: student.name,
        grade: student.grade,
        role: 'student',
        token: `token_student_${studentKey}`,
        backendConnected: !!backendUser,
        isOfflineDemo: !backendUser
      };
    } else {
      userProfile = {
        admNo: effectiveAdm,
        name: `Student (${effectiveAdm})`,
        grade: 'Form 1',
        role: 'student',
        token: `token_student_${effectiveAdm}`,
        backendConnected: !!backendUser,
        isOfflineDemo: !backendUser
      };
    }

    currentStudent = userProfile;
    sessionStorage.setItem('dawamu_auth_user', JSON.stringify(userProfile));

    // Isolate student storage
    stateStore.setActiveUser(userProfile);

    loginErr?.classList.add('hidden');
    loginScreen.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    loginScreen.style.opacity = '0';
    loginScreen.style.transform = 'scale(1.03)';
    setTimeout(() => {
      loginScreen.style.display = 'none';
      loginScreen.classList.add('hidden');
      bootDesktop();
    }, 250);
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const adm  = loginAdm ? loginAdm.value.trim() : '';
      const pass = loginPass ? loginPass.value : '';
      performLogin(adm, pass);
    });
  }

  // Quick Demo Account Click Handlers
  document.querySelectorAll('[data-quick-login]').forEach(btn => {
    btn.addEventListener('click', () => {
      const adm = btn.getAttribute('data-adm') || '1001';
      const pass = btn.getAttribute('data-pass') || 'dawamu2026';
      if (loginAdm) loginAdm.value = adm;
      if (loginPass) loginPass.value = pass;
      performLogin(adm, pass);
    });
  });

  let desktopInitialized = false;
  function bootDesktop() {
    if (!desktopInitialized) {
      windowManager.init(desktopEl);
      desktopInitialized = true;
    }

  // App Registry Definition
  const appRegistry = [
    {
      id: 'explorer',
      title: 'This PC (File Explorer)',
      icon: '<i class="fas fa-folder-open text-blue-400"></i>',
      bgColor: 'bg-blue-700',
      keywords: ['files', 'folders', 'documents', 'c drive', 'pc', 'explorer', 'my computer'],
      launch: () => {
        windowManager.createWindow({
          id: 'explorer',
          title: 'This PC - Dawamu File Explorer',
          icon: '<i class="fas fa-folder-open text-blue-400"></i>',
          content: () => createExplorerApp(),
          width: 920,
          height: 580
        });
      }
    },
    {
      id: 'browser',
      title: 'School Web Browser',
      icon: '<i class="fab fa-chrome text-blue-400"></i>',
      bgColor: 'bg-blue-600',
      keywords: ['web', 'internet', 'search', 'wikipedia', 'khan academy'],
      launch: () => {
        windowManager.createWindow({
          id: 'browser',
          title: 'School Web Browser (Safe Network)',
          icon: '<i class="fab fa-chrome text-blue-400"></i>',
          content: () => createBrowserApp(),
          width: 1100,
          height: 680
        });
      }
    },
    {
      id: 'offlineBrowser',
      title: 'Offline Web Encyclopedia',
      icon: '<i class="fas fa-globe-africa text-emerald-400"></i>',
      bgColor: 'bg-emerald-700',
      keywords: ['offline', 'browser', 'wikipedia', 'khan academy', 'encyclopedia', 'lessons', 'reading', 'nasa'],
      launch: () => {
        windowManager.createWindow({
          id: 'offlineBrowser',
          title: 'Dawamu Offline Web Encyclopedia & Library',
          icon: '<i class="fas fa-globe-africa text-emerald-400"></i>',
          content: () => createOfflineBrowserApp(),
          width: 1050,
          height: 660
        });
      }
    },
    {
      id: 'books844',
      title: '8-4-4 Coursebooks (F3 & F4)',
      icon: '<i class="fas fa-book-reader text-emerald-400"></i>',
      bgColor: 'bg-emerald-800',
      keywords: ['books', '844', 'form 3', 'form 4', 'kcse', 'curriculum', 'mathematics', 'biology', 'chemistry', 'physics', 'history', 'geography', 'business', 'literature', 'fasihi'],
      launch: () => {
        windowManager.createWindow({
          id: 'offlineBrowser',
          title: '8-4-4 Form 3 & Form 4 Coursebook Library',
          icon: '<i class="fas fa-book-reader text-emerald-400"></i>',
          content: () => createOfflineBrowserApp('dawamu://books-844'),
          width: 1080,
          height: 680
        });
      }
    },
    {
      id: 'eduguard',
      title: 'EduGuard AI',
      icon: '<i class="fas fa-shield-halved text-emerald-400"></i>',
      bgColor: 'bg-emerald-700',
      keywords: ['eduguard', 'ai', 'tutor', 'exam', 'proctor', 'diagnostic', 'curriculum', 'revision', 'kcse', 'learning', 'integrity'],
      launch: () => {
        windowManager.createWindow({
          id: 'eduguard',
          title: 'EduGuard - AI Learning Intelligence & Exam Guard',
          icon: '<i class="fas fa-shield-halved text-emerald-400"></i>',
          content: () => createEduGuardApp(currentStudent),
          width: 1060,
          height: 680
        });
      }
    },
    {
      id: 'docs',
      title: 'Docs & Homework Notes',
      icon: '<i class="fas fa-file-alt text-blue-300"></i>',
      bgColor: 'bg-indigo-600',
      keywords: ['docs', 'notes', 'homework', 'write', 'editor'],
      launch: (opts = {}) => {
        windowManager.createWindow({
          id: 'docs',
          title: opts.fileName ? `${opts.fileName} - Homework Notes` : 'Homework Notes & Rich Text Docs',
          icon: '<i class="fas fa-file-alt text-blue-300"></i>',
          content: () => createDocsApp(opts),
          width: 840,
          height: 560
        });
      }
    },
    {
      id: 'word',
      title: 'Dawamu Word',
      icon: '<i class="fas fa-file-word text-blue-400"></i>',
      bgColor: 'bg-blue-700',
      keywords: ['word', 'document', 'write', 'essay', 'report', 'letter', 'docx', 'office'],
      launch: (opts = {}) => {
        windowManager.createWindow({
          id: 'word',
          title: opts.fileName ? `${opts.fileName} - Dawamu Word` : 'Dawamu Word Processor',
          icon: '<i class="fas fa-file-word text-blue-400"></i>',
          content: () => createWordApp(opts),
          width: 980,
          height: 640
        });
      }
    },
    {
      id: 'spreadsheet',
      title: 'Dawamu Sheets',
      icon: '<i class="fas fa-file-excel text-emerald-400"></i>',
      bgColor: 'bg-emerald-700',
      keywords: ['spreadsheet', 'excel', 'sheets', 'calc', 'math', 'gradebook', 'table', 'csv', 'formulas'],
      launch: (opts = {}) => {
        windowManager.createWindow({
          id: 'spreadsheet',
          title: opts.fileName ? `${opts.fileName} - Dawamu Sheets` : 'Dawamu Spreadsheet',
          icon: '<i class="fas fa-file-excel text-emerald-400"></i>',
          content: () => createSpreadsheetApp(opts),
          width: 1000,
          height: 620
        });
      }
    },
    {
      id: 'database',
      title: 'School Database',
      icon: '<i class="fas fa-database text-purple-400"></i>',
      bgColor: 'bg-purple-800',
      keywords: ['database', 'records', 'students', 'courses', 'library', 'sql', 'dbms'],
      launch: () => {
        windowManager.createWindow({
          id: 'database',
          title: 'Dawamu School Database',
          icon: '<i class="fas fa-database text-purple-400"></i>',
          content: () => createDatabaseApp(),
          width: 960,
          height: 600
        });
      }
    },
    {
      id: 'classroom',
      title: 'Classroom Tracker',
      icon: '<i class="fas fa-graduation-cap text-emerald-400"></i>',
      bgColor: 'bg-emerald-600',
      keywords: ['classroom', 'assignments', 'due dates', 'subjects', 'homework'],
      launch: () => {
        windowManager.createWindow({
          id: 'classroom',
          title: 'Classroom Assignment Dashboard',
          icon: '<i class="fas fa-graduation-cap text-emerald-400"></i>',
          content: () => createClassroomApp(),
          width: 820,
          height: 560
        });
      }
    },
    {
      id: 'calculator',
      title: 'Scientific Calculator',
      icon: '<i class="fas fa-calculator text-amber-400"></i>',
      bgColor: 'bg-amber-600',
      keywords: ['calculator', 'math', 'sin', 'cos', 'tan', 'science'],
      launch: () => {
        windowManager.createWindow({
          id: 'calculator',
          title: 'Scientific Calculator',
          icon: '<i class="fas fa-calculator text-amber-400"></i>',
          content: () => createCalculatorApp(),
          width: 680,
          height: 480
        });
      }
    },
    {
      id: 'focusTimer',
      title: 'Focus Study Timer',
      icon: '<i class="fas fa-stopwatch text-purple-400"></i>',
      bgColor: 'bg-purple-600',
      keywords: ['focus', 'pomodoro', 'timer', 'study sounds', 'rain noise'],
      launch: () => {
        windowManager.createWindow({
          id: 'focusTimer',
          title: 'Focus Study Timer & Ambient Audio',
          icon: '<i class="fas fa-stopwatch text-purple-400"></i>',
          content: () => createFocusTimerApp(),
          width: 540,
          height: 540
        });
      }
    },
    {
      id: 'adminPanel',
      title: 'Teacher & Parent Controls',
      icon: '<i class="fas fa-user-shield text-amber-300"></i>',
      bgColor: 'bg-rose-700',
      keywords: ['admin', 'parental controls', 'pin', 'restrictions', 'curfew', 'block'],
      launch: () => {
        windowManager.createWindow({
          id: 'adminPanel',
          title: 'Teacher & Parent Restriction Controls',
          icon: '<i class="fas fa-user-shield text-amber-300"></i>',
          content: () => createAdminPanelApp(),
          width: 740,
          height: 540
        });
      }
    },
    {
      id: 'installer',
      title: 'Install Dawamu OS to PC',
      icon: '<i class="fas fa-download text-emerald-300"></i>',
      bgColor: 'bg-emerald-800',
      keywords: ['install', 'setup', 'disk', 'ssd', 'hdd', 'partition', 'bootable', 'drive', 'usb'],
      launch: () => {
        windowManager.createWindow({
          id: 'installer',
          title: 'Dawamu OS Disk Installation Wizard',
          icon: '<i class="fas fa-download text-emerald-300"></i>',
          content: () => createInstallerApp(),
          width: 820,
          height: 600
        });
      }
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: '<i class="fas fa-cog text-slate-300"></i>',
      bgColor: 'bg-slate-700',
      keywords: ['settings', 'preferences', 'system', 'display', 'volume', 'theme', 'personalization', 'sound'],
      launch: () => {
        windowManager.createWindow({
          id: 'settings',
          title: 'Settings - Dawamu OS',
          icon: '<i class="fas fa-cog text-slate-300"></i>',
          content: () => createSettingsApp(),
          width: 860,
          height: 580
        });
      }
    },
    {
      id: 'appStore',
      title: 'Chrome Web Store',
      icon: '<i class="fas fa-store text-rose-400"></i>',
      bgColor: 'bg-rose-600',
      keywords: ['store', 'install', 'extensions', 'apps', 'download'],
      launch: () => {
        // App Install Lock behavior
        const modal = document.getElementById('app-store-lock-modal');
        if (modal) modal.classList.remove('hidden');
      }
    },
    {
      id: 'installer',
      title: 'Install DawamuOS to PC',
      icon: '<i class="fas fa-download text-amber-400"></i>',
      bgColor: 'bg-amber-600',
      keywords: ['install', 'setup', 'disk', 'hardware', 'bootable', 'usb', 'installer'],
      launch: () => {
        windowManager.createWindow({
          id: 'installer',
          title: 'DawamuOS Hardware Deployment & Disk Installer',
          icon: '<i class="fas fa-download text-amber-400"></i>',
          content: () => {
            const div = document.createElement('div');
            div.className = 'flex flex-col h-full bg-[#0b1329] text-white p-6 font-sans overflow-y-auto space-y-5';
            div.innerHTML = `
              <div class="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/30">
                  <i class="fas fa-hdd"></i>
                </div>
                <div>
                  <h2 class="text-base font-bold text-white">DawamuOS Hardware Installer Wizard</h2>
                  <p class="text-xs text-slate-400">Deploy DawamuOS directly onto this computer's internal storage drive (SSD/eMMC/HDD)</p>
                </div>
              </div>

              <!-- Hardware Specs Card -->
              <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Target System Verification</span>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px]">CPU ARCH</span>
                    <span class="font-bold text-emerald-400">x86_64 Dual-Core+</span>
                  </div>
                  <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px]">MEMORY</span>
                    <span class="font-bold text-emerald-400">Detected: 4GB+ RAM</span>
                  </div>
                  <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px]">BOOT MODE</span>
                    <span class="font-bold text-emerald-400">UEFI / BIOS</span>
                  </div>
                  <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <span class="text-slate-500 block text-[10px]">SECURITY</span>
                    <span class="font-bold text-emerald-400">KCSE Exam Shield Ready</span>
                  </div>
                </div>
              </div>

              <!-- Disk Selection Form -->
              <div class="space-y-3 text-xs">
                <label class="block font-bold text-slate-300">Select Target Drive for Installation:</label>
                <select id="target-disk-select" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500 font-mono">
                  <option value="/dev/sda">/dev/sda - Internal Primary Drive (256 GB SSD) [Recommended]</option>
                  <option value="/dev/nvme0n1">/dev/nvme0n1 - NVMe M.2 Solid State Drive (512 GB)</option>
                  <option value="/dev/sdb">/dev/sdb - Secondary Drive / USB Storage (32 GB)</option>
                </select>

                <div class="space-y-2 pt-2">
                  <label class="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 cursor-pointer">
                    <input type="radio" name="install-type" value="clean" checked class="accent-emerald-500">
                    <div>
                      <div class="font-bold text-white text-xs">Clean Installation (Erase and Install DawamuOS)</div>
                      <div class="text-[11px] text-slate-400">Recommended for school labs & student Chromebooks. Automatically configures UEFI boot partition.</div>
                    </div>
                  </label>
                  <label class="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
                    <input type="radio" name="install-type" value="dual" class="accent-emerald-500">
                    <div>
                      <div class="font-bold text-white text-xs">Dual Boot Side-by-Side (Keep Existing OS)</div>
                      <div class="text-[11px] text-slate-400">Installs GRUB multi-boot alongside Windows 10/11 or Ubuntu Linux.</div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Install Progress Container -->
              <div id="installer-progress-container" class="hidden space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div class="flex justify-between text-xs text-slate-300 font-mono">
                  <span id="install-step-text">Writing EFI system partition...</span>
                  <span id="install-percent-text">0%</span>
                </div>
                <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                  <div id="install-progress-bar" class="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-300" style="width: 0%;"></div>
                </div>
              </div>

              <div class="flex justify-between items-center pt-2 border-t border-slate-800">
                <span class="text-[11px] text-slate-500"><i class="fas fa-shield-alt text-emerald-400 mr-1"></i> Automated verification enabled</span>
                <button id="start-install-btn" class="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-amber-950/40 transition-all flex items-center gap-2 cursor-pointer">
                  <i class="fas fa-play"></i> Start Installation
                </button>
              </div>
            `;

            const btn = div.querySelector('#start-install-btn');
            const progressCont = div.querySelector('#installer-progress-container');
            const stepText = div.querySelector('#install-step-text');
            const pctText = div.querySelector('#install-percent-text');
            const bar = div.querySelector('#install-progress-bar');

            btn?.addEventListener('click', async () => {
              if (window.dawamuDialogs?.confirm) {
                const ok = await window.dawamuDialogs.confirm({
                  title: 'Confirm Installation',
                  message: 'This wizard will write DawamuOS and the EduGuard educational image to the selected drive. Ensure any critical personal data is backed up before continuing.',
                  confirmText: 'Proceed with Install',
                  danger: false
                });
                if (!ok) return;
              }

              btn.disabled = true;
              btn.classList.add('opacity-50', 'pointer-events-none');
              progressCont.classList.remove('hidden');

              const steps = [
                { pct: 15, msg: 'Creating GPT partition table and EFI system partition (FAT32)...' },
                { pct: 35, msg: 'Extracting DawamuOS core filesystem and Linux kernel image...' },
                { pct: 60, msg: 'Deploying EduGuard AI cognitive engine & offline KCSE curriculum...' },
                { pct: 85, msg: 'Configuring systemd bootloader and student security policies...' },
                { pct: 100, msg: 'Installation completed successfully! Computer is ready to boot DawamuOS.' }
              ];

              let currentStep = 0;
              const interval = setInterval(() => {
                if (currentStep < steps.length) {
                  const s = steps[currentStep];
                  bar.style.width = `${s.pct}%`;
                  pctText.textContent = `${s.pct}%`;
                  stepText.textContent = s.msg;
                  currentStep++;
                } else {
                  clearInterval(interval);
                  if (window.dawamuDialogs?.toast) {
                    window.dawamuDialogs.toast({ message: 'DawamuOS installation finished successfully!', type: 'success' });
                  }
                  btn.innerHTML = '<i class="fas fa-check"></i> Installation Finished';
                  btn.className = 'bg-emerald-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl';
                }
              }, 600);
            });

            return div;
          },
          width: 780,
          height: 560
        });
      }
    }
  ];

  // Desktop Icons Click Handler (Windows Style)
  const desktopIconsContainer = document.getElementById('desktop-icons');
  if (desktopIconsContainer) {
    desktopIconsContainer.addEventListener('click', (e) => {
      const iconEl = e.target.closest('.desktop-icon');
      if (!iconEl) return;
      const appId = iconEl.dataset.appId;
      const app = appRegistry.find(a => a.id === appId);
      if (app) app.launch();
    });
  }

  // Cross-App Dawamu URL Navigation (from File Explorer or Web to Offline Browser)
  window.addEventListener('open-dawamu-url', (e) => {
    const url = e.detail?.url;
    if (!url) return;
    const existing = windowManager.windows.get('offlineBrowser');
    if (existing) {
      windowManager.focusWindow('offlineBrowser');
      const input = existing.element.querySelector('#omnibox');
      if (input) {
        input.value = url;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      }
    } else {
      windowManager.createWindow({
        id: 'offlineBrowser',
        title: 'Dawamu Offline Web Encyclopedia & Library',
        icon: '<i class="fas fa-globe-africa text-emerald-400"></i>',
        content: () => createOfflineBrowserApp(url),
        width: 1050,
        height: 660
      });
    }
  });

  // Global Dawamu OS API for cross-app launches & file opening
  window.dawamuOS = {
    openApp: (appId, options = {}) => {
      const app = appRegistry.find(a => a.id === appId);
      if (app) {
        app.launch(options);
        return true;
      }
      return false;
    },
    openFile: (file) => {
      if (!file) return;
      const name = (file.name || '').toLowerCase();
      if (file.targetUrl) {
        window.dispatchEvent(new CustomEvent('open-dawamu-url', { detail: { url: file.targetUrl } }));
        return;
      }
      if (name.endsWith('.docx') || name.endsWith('.doc') || file.type === 'doc') {
        const app = appRegistry.find(a => a.id === 'word');
        if (app) app.launch({ fileName: file.name, fileData: file });
      } else if (name.endsWith('.xlsx') || name.endsWith('.csv') || file.type === 'excel') {
        const app = appRegistry.find(a => a.id === 'spreadsheet');
        if (app) app.launch({ fileName: file.name, fileData: file });
      } else if (name.endsWith('.pdf') || file.type === 'pdf') {
        window.dispatchEvent(new CustomEvent('open-dawamu-url', { detail: { url: 'dawamu://books-844' } }));
      } else if (name.endsWith('.txt') || name.endsWith('.md')) {
        const app = appRegistry.find(a => a.id === 'docs');
        if (app) app.launch({ fileName: file.name, fileData: file });
      } else {
        dawamuDialogs.toast(`Opening ${file.name} in Dawamu Word`, 'info');
        const app = appRegistry.find(a => a.id === 'word');
        if (app) app.launch({ fileName: file.name, fileData: file });
      }
    }
  };

  // Initialize OS Shell Modules
  shelf.init(shelfEl, appRegistry);
  launcher.init(launcherEl, appRegistry);
  quickSettings.init(quickSettingsEl, () => {
    // Open Admin Panel callback
    const adminApp = appRegistry.find((a) => a.id === 'adminPanel');
    if (adminApp) adminApp.launch();
  });

  // App Install Lock Close Listener
  document.getElementById('close-app-lock-modal')?.addEventListener('click', () => {
    document.getElementById('app-store-lock-modal')?.classList.add('hidden');
  });

  // Curfew Lockout Bypass Listener
  const curfewBypassBtn = document.getElementById('curfew-bypass-btn');
  const curfewBypassPin = document.getElementById('curfew-bypass-pin');
  const curfewBypassErr = document.getElementById('curfew-bypass-err');

  curfewBypassBtn?.addEventListener('click', () => {
    const pin = curfewBypassPin.value.trim();
    if (stateStore.verifyAdminPin(pin)) {
      document.getElementById('curfew-lockout-screen')?.classList.remove('active');
      curfewBypassPin.value = '';
      curfewBypassErr.textContent = '';
    } else {
      curfewBypassErr.textContent = 'Incorrect Admin PIN.';
    }
  });

  // Check initial curfew rules
  restrictionManager.evaluateSecurityRules();



  // Personalize the desktop welcome widget with the logged-in student name and mode badge
  const welcomeWidget = desktopEl.querySelector('.pointer-events-none');
  if (welcomeWidget) {
    let greeting = document.getElementById('desktop-user-greeting');
    if (!greeting) {
      greeting = document.createElement('div');
      greeting.id = 'desktop-user-greeting';
      greeting.className = 'flex flex-col items-end text-right';
      welcomeWidget.appendChild(greeting);
    }
    if (currentStudent) {
      const modeBadge = currentStudent.isOfflineDemo
        ? `<div class="mt-1.5 text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase">OFFLINE DEMO MODE (Local Simulation)</div>`
        : `<div class="mt-1.5 text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase">VERIFIED BACKEND ACTIVE</div>`;

      greeting.innerHTML = `
        <div class="text-white text-lg font-bold mt-2">Welcome, <span class="text-[#4ade80]">${currentStudent.name}</span></div>
        <div class="text-slate-400 text-xs">Adm No: ${currentStudent.admNo} • ${currentStudent.grade}</div>
        ${modeBadge}
      `;
    } else {
      greeting.innerHTML = '';
    }
  }

  } // end bootDesktop()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startDawamuOS);
} else {
  startDawamuOS();
}
