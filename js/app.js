/**
 * Dawamu OS - Master Application Entry Point
 */

import { stateStore, readDroppedFile, formatFileSize } from './os/state.js';
import { restrictionManager } from './os/restrictionManager.js';
import { windowManager } from './os/windowManager.js';
import { shelf } from './os/shelf.js';
import { launcher } from './os/launcher.js';
import { quickSettings } from './os/quickSettings.js';
import { dawamuDialogs } from './os/dialogs.js';
import { desktopContextMenu } from './os/contextMenu.js';

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
  if (window.__DAWAMU_OS_BOOTED__) return;
  window.__DAWAMU_OS_BOOTED__ = true;

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

  /* ─── NATIVE FULLSCREEN OS HELPER ─── */
  function enterOSFullscreen() {
    try {
      if (typeof document !== 'undefined' && !document.fullscreenElement) {
        const el = document.documentElement;
        const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
        if (req) {
          Promise.resolve(req.call(el)).catch(() => {});
        }
      }
    } catch (_) {}
  }

  // Attempt fullscreen immediately on boot & on first user gesture anywhere in the OS
  enterOSFullscreen();
  const onFirstUserGesture = () => {
    if (!document.getElementById('os-shutdown-screen')) {
      enterOSFullscreen();
    }
  };
  document.addEventListener('click', onFirstUserGesture, { once: true, capture: true });
  document.addEventListener('keydown', onFirstUserGesture, { once: true, capture: true });

  /* ─── POWER MANAGER (REAL OS FULL SHUTDOWN & PROCESS TERMINATION) ─── */
  window.dawamuPower = {
    shutdown: () => {
      // 1. Force-close all open windows and destroy running app processes/timers/audio
      cleanupSession();
      document.getElementById('curfew-lockout-screen')?.classList.remove('active');
      document.getElementById('launcher-overlay')?.classList.remove('open');
      document.getElementById('quick-settings-overlay')?.classList.remove('open');
      if (loginScreen) {
        loginScreen.style.display = 'none';
        loginScreen.classList.add('hidden');
      }

      // 2. Render macOS Liquid Glass Shutdown Sequence Overlay
      let shutdownOverlay = document.getElementById('os-shutdown-screen');
      if (!shutdownOverlay) {
        shutdownOverlay = document.createElement('div');
        shutdownOverlay.id = 'os-shutdown-screen';
        shutdownOverlay.className = 'fixed inset-0 z-[2000000] flex flex-col items-center justify-center bg-black text-white select-none font-sans';
        document.body.appendChild(shutdownOverlay);
      }
      shutdownOverlay.style.display = 'flex';
      shutdownOverlay.innerHTML = `
        <div class="flex flex-col items-center gap-4 text-center p-8">
          <img src="assets/dawamu-logo.png" alt="Dawamu OS" class="h-16 w-auto object-contain opacity-90 mb-2">
          <div class="w-7 h-7 rounded-full border-2 border-white/20 border-t-emerald-400 animate-spin"></div>
          <div id="os-shutdown-status" class="text-sm font-semibold text-slate-200 tracking-wide">Shutting down Dawamu OS...</div>
          <div id="os-shutdown-sub" class="text-xs text-slate-400">Closing active applications and stopping background processes...</div>
        </div>
      `;

      // 3. Signal EduGuard backend & static server processes to terminate
      try {
        fetch('http://127.0.0.1:8000/api/v1/system/shutdown', {
          method: 'POST',
          keepalive: true
        }).catch(() => {});
      } catch (_) {}

      // 4. Exit fullscreen and close native/standalone application window
      setTimeout(() => {
        try {
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        } catch (_) {}

        if (window.electronAPI && typeof window.electronAPI.exitApp === 'function') {
          window.electronAPI.exitApp();
          return;
        }

        try {
          window.open('', '_self');
          window.close();
        } catch (_) {}

        // Fallback if running inside a standard browser tab that prevents window.close()
        setTimeout(() => {
          if (shutdownOverlay) {
            shutdownOverlay.innerHTML = `
              <div class="flex flex-col items-center gap-4 text-center p-8 max-w-md">
                <div class="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 text-xl">
                  <i class="fas fa-power-off"></i>
                </div>
                <div class="text-base font-bold text-slate-200">System Powered Off</div>
                <div class="text-xs text-slate-400 leading-relaxed">All Dawamu OS applications, user sessions, and background services have been stopped. You may close this window or power the system back on.</div>
                <button id="os-power-on-btn" class="mt-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-all shadow-lg">
                  <i class="fas fa-bolt mr-1.5"></i> Power On Dawamu OS
                </button>
              </div>
            `;
            shutdownOverlay.querySelector('#os-power-on-btn')?.addEventListener('click', () => {
              shutdownOverlay.remove();
              enterOSFullscreen();
              window.dawamuPower.reboot();
            });
          }
        }, 350);
      }, 650);
    },
    reboot: () => {
      document.getElementById('os-shutdown-screen')?.remove();
      cleanupSession();
      document.body.style.background = '';
      enterOSFullscreen();
      if (loginScreen) {
        loginScreen.style.opacity = '1';
        loginScreen.style.pointerEvents = 'auto';
        loginScreen.style.transform = 'scale(1)';
        loginScreen.style.display = 'flex';
        loginScreen.classList.remove('hidden');
      }
      loginAdm?.focus();
    },
    signOut: () => {
      cleanupSession();
      if (loginScreen) {
        loginScreen.style.opacity = '1';
        loginScreen.style.pointerEvents = 'auto';
        loginScreen.style.transform = 'scale(1)';
        loginScreen.style.display = 'flex';
        loginScreen.classList.remove('hidden');
      }
      loginAdm?.focus();
    }
  };

  document.getElementById('login-shutdown-btn')?.addEventListener('click', () => {
    window.dawamuPower.shutdown();
  });

  /* ─── LOGIN GATE & AUTHENTICATION FLOW (INSTANT 0ms LOGIN) ─── */
  function performLogin(adm, pass) {
    enterOSFullscreen();
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

    let token = `token_student_${studentKey || effectiveAdm}`;
    if (isTeacher) {
      token = 'token_teacher_1';
    } else if (isAdmin) {
      token = 'token_admin_1';
    }

    let userProfile = null;
    if (isAdmin) {
      userProfile = {
        admNo: 'ADMIN',
        name: 'School System Administrator',
        grade: 'Admin',
        role: 'admin',
        token: 'token_admin_1',
        backendConnected: false,
        isOfflineDemo: true
      };
    } else if (isTeacher) {
      userProfile = {
        admNo: 'T-101',
        name: 'Teacher / Proctor Monitor',
        grade: 'Staff',
        role: 'teacher',
        token: 'token_teacher_1',
        backendConnected: false,
        isOfflineDemo: true
      };
    } else if (student) {
      userProfile = {
        admNo: studentKey,
        name: student.name,
        grade: student.grade,
        role: 'student',
        token: `token_student_${studentKey}`,
        backendConnected: false,
        isOfflineDemo: true
      };
    } else {
      userProfile = {
        admNo: effectiveAdm,
        name: `Student (${effectiveAdm})`,
        grade: 'Form 1',
        role: 'student',
        token: `token_student_${effectiveAdm}`,
        backendConnected: false,
        isOfflineDemo: true
      };
    }

    currentStudent = userProfile;
    try {
      sessionStorage.setItem('dawamu_auth_user', JSON.stringify(userProfile));
    } catch (_) {}

    // Isolate student storage immediately
    try {
      stateStore.setActiveUser(userProfile);
    } catch (err) {
      console.error('Failed to setActiveUser:', err);
    }

    // Hide login screen and boot desktop immediately (0ms delay)
    loginErr?.classList.add('hidden');
    if (loginScreen) {
      loginScreen.style.opacity = '0';
      loginScreen.style.pointerEvents = 'none';
      loginScreen.style.display = 'none';
      loginScreen.classList.add('hidden');
    }
    try {
      bootDesktop();
    } catch (err) {
      console.error('Failed during bootDesktop:', err);
    }

    // Non-blocking background probe for local EduGuard FastAPI backend (Port 8000)
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timerId = controller ? setTimeout(() => controller.abort(), 1000) : null;
      fetch('http://127.0.0.1:8000/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: controller ? controller.signal : undefined
      })
        .then(res => {
          if (timerId) clearTimeout(timerId);
          return res.ok ? res.json() : null;
        })
        .then(backendUser => {
          if (backendUser && currentStudent && currentStudent.admNo === userProfile.admNo) {
            currentStudent.backendConnected = true;
            currentStudent.isOfflineDemo = false;
            try { sessionStorage.setItem('dawamu_auth_user', JSON.stringify(currentStudent)); } catch (_) {}
          }
        })
        .catch(() => {});
    } catch (_) {}
  }

  window.dawamuPerformLogin = performLogin;

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const adm  = loginAdm ? loginAdm.value.trim() : '';
      const pass = loginPass ? loginPass.value : '';
      performLogin(adm, pass);
    });
  }

  // Quick Demo Account Click Handlers (Direct + Delegated)
  const triggerQuickLogin = (btn) => {
    if (!btn) return;
    const adm = btn.getAttribute('data-adm') || '1001';
    const pass = btn.getAttribute('data-pass') || 'dawamu2026';
    if (loginAdm) loginAdm.value = adm;
    if (loginPass) loginPass.value = pass;
    performLogin(adm, pass);
  };

  document.querySelectorAll('[data-quick-login]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      triggerQuickLogin(btn);
    });
  });

  loginScreen?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-quick-login]');
    if (btn) {
      e.preventDefault();
      triggerQuickLogin(btn);
    }
  });

  let desktopInitialized = false;
  let desktopShellListenersBound = false;
  function bootDesktop() {
    if (!desktopInitialized) {
      windowManager.init(desktopEl);
      desktopInitialized = true;
    }

  // App Registry Definition
  const appRegistry = [
    {
      id: 'explorer',
      title: 'This PC / My PC (File Explorer)',
      icon: '<i class="fas fa-folder-open text-blue-400"></i>',
      bgColor: 'bg-blue-700',
      keywords: ['files', 'folders', 'documents', 'c drive', 'pc', 'explorer', 'my pc', 'my computer', 'downloads'],
      launch: (opts = {}) => {
        windowManager.createWindow({
          id: 'explorer',
          title: opts && opts.folderKey ? `${stateStore.getFolderMeta(opts.folderKey).name} - This PC / My PC` : 'This PC / My PC - Dawamu File Explorer',
          icon: '<i class="fas fa-folder-open text-blue-400"></i>',
          content: () => createExplorerApp(opts),
          appOptions: opts && Object.keys(opts).length ? opts : undefined,
          width: 920,
          height: 580
        });
      }
    },
    {
      id: 'browser',
      title: 'Web Browser (Safe Network)',
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
          id: 'books844',
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
          width: 1140,
          height: 720
        });
      }
    },
    {
      id: 'docs',
      title: 'Study Notes & Scratchpad',
      icon: '<i class="fas fa-sticky-note text-amber-300"></i>',
      bgColor: 'bg-amber-600',
      keywords: ['notes', 'study notes', 'scratchpad', 'homework', 'revision', 'write', 'quick notes', 'docs'],
      launch: (opts = {}) => {
        if (opts && opts.fileName && windowManager.windows.has('docs')) {
          windowManager.closeWindow('docs', true);
        }
        windowManager.createWindow({
          id: 'docs',
          title: opts.fileName ? `${opts.fileName} - Study Notes` : 'Study Notes & Scratchpad',
          icon: '<i class="fas fa-sticky-note text-amber-300"></i>',
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
        if (opts && opts.fileName && windowManager.windows.has('word')) {
          windowManager.closeWindow('word', true);
        }
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
        if (opts && opts.fileName && windowManager.windows.has('spreadsheet')) {
          windowManager.closeWindow('spreadsheet', true);
        }
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
      title: 'Computer Studies Database (DBMS)',
      icon: '<i class="fas fa-database text-purple-400"></i>',
      bgColor: 'bg-purple-800',
      keywords: ['database', 'records', 'students', 'courses', 'library', 'sql', 'dbms'],
      launch: (opts = {}) => {
        if (opts && opts.fileName && windowManager.windows.has('database')) {
          windowManager.closeWindow('database', true);
        }
        windowManager.createWindow({
          id: 'database',
          title: opts.fileName ? `${opts.fileName} - School Database` : 'Dawamu School Database',
          icon: '<i class="fas fa-database text-purple-400"></i>',
          content: () => createDatabaseApp(opts),
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
      title: 'System Diagnostics & Health',
      icon: '<i class="fas fa-microchip text-emerald-300"></i>',
      bgColor: 'bg-emerald-800',
      keywords: ['diagnostics', 'health', 'system', 'integrity', 'check', 'verification', 'kiosk'],
      launch: () => {
        windowManager.createWindow({
          id: 'installer',
          title: 'System Diagnostics & Environment Check',
          icon: '<i class="fas fa-microchip text-emerald-300"></i>',
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
      keywords: ['settings', 'preferences', 'system', 'display', 'volume', 'theme', 'personalization', 'sound', 'wallpaper'],
      launch: (options = {}) => {
        windowManager.createWindow({
          id: 'settings',
          title: 'Settings - Dawamu OS',
          icon: '<i class="fas fa-cog text-slate-300"></i>',
          content: () => createSettingsApp(options),
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
    }
  ];

  if (!desktopShellListenersBound) {
    desktopShellListenersBound = true;

    // Desktop Icons Click Handler & Drag-and-Drop (Windows Style)
    const desktopIconsContainer = document.getElementById('desktop-icons');
    if (desktopIconsContainer) {
      desktopIconsContainer.addEventListener('click', (e) => {
        const iconEl = e.target.closest('.desktop-icon');
        if (!iconEl) return;
        const appId = iconEl.dataset.appId;
        const app = appRegistry.find(a => a.id === appId);
        if (app) app.launch();
      });

      // Drag and drop files onto the "This PC" / My PC desktop icon
      const explorerIcon = desktopIconsContainer.querySelector('.desktop-icon[data-app-id="explorer"]');
      if (explorerIcon) {
        explorerIcon.addEventListener('dragover', (e) => {
          e.preventDefault();
          if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
          explorerIcon.classList.add('ring-2', 'ring-blue-400', 'bg-blue-500/20', 'rounded-2xl', 'scale-105');
        });
        explorerIcon.addEventListener('dragleave', () => {
          explorerIcon.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-500/20', 'rounded-2xl', 'scale-105');
        });
        explorerIcon.addEventListener('drop', async (e) => {
          e.preventDefault();
          explorerIcon.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-500/20', 'rounded-2xl', 'scale-105');
          const files = e.dataTransfer?.files;
          if (files && files.length > 0) {
            let count = 0;
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              const content = await readDroppedFile(file);
              const formattedSize = formatFileSize(file.size);
              stateStore.saveFileToVFS('documents', {
                name: file.name,
                size: formattedSize,
                type: file.type,
                content: content,
                date: 'Imported just now'
              });
              count++;
            }
            dawamuDialogs.toast(`Imported ${count} file${count > 1 ? 's' : ''} to This PC (Documents)`, 'success');
            const explorerApp = appRegistry.find(a => a.id === 'explorer');
            if (explorerApp) explorerApp.launch({ folderKey: 'documents' });
          }
        });
      }
    }

    // Drop files onto desktop wallpaper to save to Desktop folder in VFS
    const desktopCanvas = document.getElementById('desktop');
    if (desktopCanvas) {
      desktopCanvas.addEventListener('dragover', (e) => {
        if (e.target === desktopCanvas || e.target.id === 'desktop-icons') {
          e.preventDefault();
          if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        }
      });
      desktopCanvas.addEventListener('drop', async (e) => {
        if (e.target === desktopCanvas || e.target.id === 'desktop-icons') {
          e.preventDefault();
          const files = e.dataTransfer?.files;
          if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              const content = await readDroppedFile(file);
              const formattedSize = formatFileSize(file.size);
              stateStore.saveFileToVFS('desktop', {
                name: file.name,
                size: formattedSize,
                type: file.type,
                content: content,
                date: 'Imported just now'
              });
            }
            dawamuDialogs.toast(`Saved ${files.length} file${files.length > 1 ? 's' : ''} to Desktop in My PC`, 'success');
          }
        }
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

    // Initialize OS Shell Modules
    shelf.init(shelfEl, appRegistry);
    launcher.init(launcherEl, appRegistry);
    quickSettings.init(quickSettingsEl, () => {
      // Open Parental & District Policy inside Settings
      const settingsApp = appRegistry.find((a) => a.id === 'settings');
      if (settingsApp) {
        settingsApp.launch({ category: 'security' });
      }
    });
    desktopContextMenu.init({ desktopEl, appRegistry });

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
  }

  // Global Dawamu OS references for developer tools, testing & cross-app launches
  window.windowManager = windowManager;
  window.stateStore = stateStore;
  window.dawamuOS = {
    state: stateStore,
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
      const rawContent = file.content !== undefined
        ? file.content
        : (file.fileData !== undefined ? file.fileData : undefined);
      const launchPayload = {
        fileId: file.id,
        fileName: file.name,
        folderKey: file.folderKey || 'documents',
        fileData: rawContent
      };
      if (name.endsWith('.db') || name.endsWith('.db.json') || name.endsWith('.sql') || file.type === 'db') {
        const app = appRegistry.find(a => a.id === 'database');
        if (app) app.launch(launchPayload);
      } else if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv') || file.type === 'excel') {
        const app = appRegistry.find(a => a.id === 'spreadsheet');
        if (app) app.launch(launchPayload);
      } else if (name.endsWith('.docx') || name.endsWith('.doc') || name.endsWith('.html') || file.type === 'doc') {
        const app = appRegistry.find(a => a.id === 'word');
        if (app) app.launch(launchPayload);
      } else if (name.endsWith('.pdf') || file.type === 'pdf') {
        window.dispatchEvent(new CustomEvent('open-dawamu-url', { detail: { url: 'dawamu://books-844' } }));
      } else if (name.endsWith('.txt') || name.endsWith('.md') || file.type === 'txt') {
        const app = appRegistry.find(a => a.id === 'docs');
        if (app) app.launch(launchPayload);
      } else {
        dawamuDialogs.toast(`Opening ${file.name} in Dawamu Word`, 'info');
        const app = appRegistry.find(a => a.id === 'word');
        if (app) app.launch(launchPayload);
      }
    }
  };

  // Check initial curfew rules
  restrictionManager.evaluateSecurityRules();



  // Personalize the desktop welcome widget with the logged-in student name and mode badge
  const welcomeWidget = document.getElementById('desktop-welcome-widget') || desktopEl.querySelector('.desktop-welcome-widget') || desktopEl.querySelector('.pointer-events-none');
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
        ? `<div class="mt-1 text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase">OFFLINE DEMO MODE (Local Simulation)</div>`
        : `<div class="mt-1 text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase">VERIFIED BACKEND ACTIVE</div>`;

      greeting.innerHTML = `
        <div class="mt-2 flex flex-col items-end text-right bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 px-3.5 py-2 rounded-2xl shadow-xl shadow-black/40">
          <div class="text-white text-sm font-bold flex items-center gap-1.5">
            <i class="fas fa-user-circle text-emerald-400 text-sm"></i>
            <span>Welcome, <span class="text-emerald-400 font-extrabold">${currentStudent.name}</span></span>
          </div>
          <div class="text-slate-400 text-xs mt-0.5">Adm No: <b class="text-slate-200">${currentStudent.admNo}</b> &bull; <span class="text-emerald-300 font-semibold">${currentStudent.grade}</span></div>
          ${modeBadge}
        </div>
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
