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

document.addEventListener('DOMContentLoaded', () => {
  const desktopEl = document.getElementById('desktop');
  const shelfEl = document.getElementById('shelf');
  const launcherEl = document.getElementById('launcher-overlay');
  const quickSettingsEl = document.getElementById('quick-settings-overlay');

  /* ─── SCREENS ─── */
  const bootScreen    = document.getElementById('os-boot-screen');
  const loginScreen   = document.getElementById('os-login-screen');
  const powerOffScreen= document.getElementById('os-power-off-screen');
  const powerOnBtn    = document.getElementById('os-power-on-btn');

  const bootLogLines  = document.getElementById('boot-log-lines');
  const bootProgressBar = document.getElementById('boot-progress-bar');
  const bootStatusText= document.getElementById('boot-status-text');

  const loginForm     = document.getElementById('os-login-form');
  const loginAdm      = document.getElementById('login-adm');
  const loginPass     = document.getElementById('login-pass');
  const loginErr      = document.getElementById('login-error-msg');

  /* ─── POWER & REBOOT MANAGER ─── */
  window.dawamuPower = {
    shutdown: () => {
      // Hide all overlays & show powered-off black standby screen
      bootScreen.classList.add('hidden');
      loginScreen.classList.add('hidden');
      document.getElementById('curfew-lockout-screen')?.classList.remove('active');
      powerOffScreen.classList.remove('hidden');
    },
    reboot: () => {
      // Re-trigger full BIOS boot sequence
      powerOffScreen.classList.add('hidden');
      loginScreen.classList.add('hidden');
      currentStudent = null;
      runBootSequence();
    },
    signOut: () => {
      currentStudent = null;
      loginAdm.value = '';
      loginPass.value = '';
      loginErr.classList.add('hidden');
      loginScreen.style.opacity = '1';
      loginScreen.style.transform = 'scale(1)';
      loginScreen.style.display = 'flex';
      loginScreen.classList.remove('hidden');
    }
  };

  if (powerOnBtn) {
    powerOnBtn.addEventListener('click', () => {
      powerOffScreen.classList.add('hidden');
      runBootSequence();
    });
  }

  /* ─── BOOT SEQUENCE ─── */
  function runBootSequence() {
    bootScreen.style.opacity = '1';
    bootScreen.style.display = 'flex';
    bootScreen.classList.remove('hidden');

    if (bootProgressBar) bootProgressBar.style.width = '0%';
    if (bootStatusText) bootStatusText.textContent = 'Hardware Diagnostics & Self-Test...';
    if (bootLogLines) bootLogLines.innerHTML = '';

    const logs = [
      { text: '[  0.012 ] ACPI: Core System Tables loaded', pct: 15, status: 'Loading Hardware Drivers...' },
      { text: '[  0.054 ] Memory: 8192 MB LPDDR4 ECC RAM verified OK', pct: 30, status: 'Checking System Integrity...' },
      { text: '[  0.118 ] Dawamu Security Kernel v2.4 (x86_64) loaded', pct: 45, status: 'Initializing Secure Kernel...' },
      { text: '[  0.240 ] Storage: Encrypted Kiosk Rootfs Mounted (ro)', pct: 60, status: 'Mounting School File System...' },
      { text: '[  0.375 ] Dawamu Policy Daemon v1.4: Active', pct: 75, status: 'Enforcing District Security Rules...' },
      { text: '[  0.490 ] Safe DNS Firewall & URL Filter: Engaged', pct: 90, status: 'Starting Network Isolation...' },
      { text: '[  0.620 ] Display Manager: Initializing Student Login...', pct: 100, status: 'Ready.' }
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        if (bootLogLines) {
          const div = document.createElement('div');
          div.className = 'text-slate-400 text-[11px] leading-tight';
          div.textContent = log.text;
          bootLogLines.appendChild(div);
        }
        if (bootProgressBar) bootProgressBar.style.width = `${log.pct}%`;
        if (bootStatusText) bootStatusText.textContent = log.status;

        // When boot finishes, smoothly transition to Login Screen
        if (index === logs.length - 1) {
          setTimeout(() => {
            bootScreen.style.transition = 'opacity 0.6s ease';
            bootScreen.style.opacity = '0';
            setTimeout(() => {
              bootScreen.style.display = 'none';
              bootScreen.classList.add('hidden');
              // Show Login Screen
              loginScreen.style.opacity = '1';
              loginScreen.style.transform = 'scale(1)';
              loginScreen.style.display = 'flex';
              loginScreen.classList.remove('hidden');
              loginAdm?.focus();
            }, 600);
          }, 400);
        }
      }, (index + 1) * 220);
    });
  }

  /* ─── LOGIN GATE ─── */
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const adm  = loginAdm.value.trim();
      const pass = loginPass.value;

      const student = STUDENT_DB[adm];
      if (student && student.password === pass) {
        // ✅ Login successful
        currentStudent = { admNo: adm, ...student };
        loginErr.classList.add('hidden');
        loginScreen.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        loginScreen.style.opacity = '0';
        loginScreen.style.transform = 'scale(1.05)';
        setTimeout(() => {
          loginScreen.style.display = 'none';
          loginScreen.classList.add('hidden');
          bootDesktop();
        }, 500);
      } else {
        // ❌ Invalid credentials
        loginErr.classList.remove('hidden');
        loginErr.querySelector('span').textContent =
          STUDENT_DB[adm] ? 'Incorrect password' : 'Admission number not found';
        loginPass.value = '';
        loginAdm.focus();
      }
    });
  }

  // Start the Initial Boot Sequence
  runBootSequence();

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

  // Launch Default Welcome Apps
  setTimeout(() => {
    const classroomApp = appRegistry.find((a) => a.id === 'classroom');
    const docsApp = appRegistry.find((a) => a.id === 'docs');

    if (classroomApp) classroomApp.launch();
    if (docsApp) docsApp.launch();
  }, 200);

  // Personalize the desktop welcome widget with the logged-in student name
  if (currentStudent) {
    const welcomeWidget = desktopEl.querySelector('.pointer-events-none');
    if (welcomeWidget) {
      // Add a greeting line after the logo
      const greeting = document.createElement('div');
      greeting.className = 'text-white text-lg font-bold mt-2';
      greeting.innerHTML = `Welcome, <span class="text-[#4ade80]">${currentStudent.name}</span>`;
      const subtitle = document.createElement('div');
      subtitle.className = 'text-slate-400 text-xs';
      subtitle.textContent = `Adm No: ${currentStudent.admNo} • ${currentStudent.grade}`;
      welcomeWidget.appendChild(greeting);
      welcomeWidget.appendChild(subtitle);
    }
  }

  } // end bootDesktop()
});
