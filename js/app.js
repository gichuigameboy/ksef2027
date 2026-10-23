/**
 * Dawamu OS - Master Application Entry Point
 */

import { stateStore } from './os/state.js';
import { restrictionManager } from './os/restrictionManager.js';
import { windowManager } from './os/windowManager.js';
import { shelf } from './os/shelf.js';
import { launcher } from './os/launcher.js';
import { quickSettings } from './os/quickSettings.js';

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
    let backendUser = null;
    let isOfflineDemo = false;
    let role = 'student';
    let token = `token_student_${adm}`;

    if (adm.toLowerCase() === 'teacher') {
      role = 'teacher';
      token = 'token_teacher_1';
    } else if (adm.toLowerCase() === 'admin') {
      role = 'admin';
      token = 'token_admin_1';
    }

    // 1. Attempt authoritative backend authentication verification (Port 8000)
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(1200)
      });
      if (res.ok) {
        backendUser = await res.json();
      }
    } catch (_) {}

    const student = STUDENT_DB[adm];
    const isTeacher = adm.toLowerCase() === 'teacher';
    const isAdmin = adm.toLowerCase() === 'admin';

    let authenticated = false;
    let userProfile = null;

    if (backendUser && (student?.password === pass || pass === 'dawamu2026' || pass === 'student123' || (isTeacher && pass === 'teacher2026') || (isAdmin && pass === 'admin2026'))) {
      // Verified Backend Identity
      authenticated = true;
      userProfile = {
        admNo: backendUser.uid.replace('student_', ''),
        name: backendUser.display_name,
        grade: student ? student.grade : (backendUser.role === 'teacher' ? 'Staff' : 'Form 1'),
        role: backendUser.role,
        token: token,
        backendConnected: true,
        isOfflineDemo: false
      };
    } else if (student && student.password === pass) {
      // Offline Demo Student Mode
      authenticated = true;
      isOfflineDemo = true;
      userProfile = {
        admNo: adm,
        name: student.name,
        grade: student.grade,
        role: 'student',
        token: token,
        backendConnected: false,
        isOfflineDemo: true
      };
    } else if (isTeacher && pass === 'teacher2026') {
      // Offline Demo Teacher Mode
      authenticated = true;
      isOfflineDemo = true;
      userProfile = {
        admNo: 'T-101',
        name: 'Teacher / Proctor Monitor',
        grade: 'Staff',
        role: 'teacher',
        token: 'token_teacher_1',
        backendConnected: false,
        isOfflineDemo: true
      };
    } else if (isAdmin && pass === 'admin2026') {
      // Offline Demo Admin Mode
      authenticated = true;
      isOfflineDemo = true;
      userProfile = {
        admNo: 'ADMIN',
        name: 'School System Administrator',
        grade: 'Admin',
        role: 'admin',
        token: 'token_admin_1',
        backendConnected: false,
        isOfflineDemo: true
      };
    }

    if (authenticated) {
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
    } else {
      loginErr?.classList.remove('hidden');
      if (loginErr?.querySelector('span')) {
        loginErr.querySelector('span').textContent =
          (student || isTeacher || isAdmin) ? 'Incorrect password' : 'User account not found';
      }
      if (loginPass) loginPass.value = '';
      loginAdm?.focus();
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const adm  = loginAdm.value.trim();
      const pass = loginPass.value;
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
      launch: () => {
        windowManager.createWindow({
          id: 'docs',
          title: 'Homework Notes & Rich Text Docs',
          icon: '<i class="fas fa-file-alt text-blue-300"></i>',
          content: () => createDocsApp(),
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
      launch: () => {
        windowManager.createWindow({
          id: 'word',
          title: 'Dawamu Word Processor',
          icon: '<i class="fas fa-file-word text-blue-400"></i>',
          content: () => createWordApp(),
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
      launch: () => {
        windowManager.createWindow({
          id: 'spreadsheet',
          title: 'Dawamu Spreadsheet',
          icon: '<i class="fas fa-file-excel text-emerald-400"></i>',
          content: () => createSpreadsheetApp(),
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
