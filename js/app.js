/**
 * ChromeOS Student Edition - Master Application Entry Point
 */

import { stateStore } from './os/state.js';
import { restrictionManager } from './os/restrictionManager.js';
import { windowManager } from './os/windowManager.js';
import { shelf } from './os/shelf.js';
import { launcher } from './os/launcher.js';
import { quickSettings } from './os/quickSettings.js';

import { createBrowserApp } from './apps/browser.js';
import { createDocsApp } from './apps/docs.js';
import { createClassroomApp } from './apps/classroom.js';
import { createCalculatorApp } from './apps/calculator.js';
import { createFocusTimerApp } from './apps/focusTimer.js';
import { createAdminPanelApp } from './apps/adminPanel.js';

document.addEventListener('DOMContentLoaded', () => {
  const desktopEl = document.getElementById('desktop');
  const shelfEl = document.getElementById('shelf');
  const launcherEl = document.getElementById('launcher-overlay');
  const quickSettingsEl = document.getElementById('quick-settings-overlay');

  windowManager.init(desktopEl);

  // App Registry Definition
  const appRegistry = [
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
          content: createBrowserApp(),
          width: 1100,
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
          content: createDocsApp(),
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
          content: createClassroomApp(),
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
          content: createCalculatorApp(),
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
          content: createFocusTimerApp(),
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
          content: createAdminPanelApp(),
          width: 740,
          height: 540
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
});
