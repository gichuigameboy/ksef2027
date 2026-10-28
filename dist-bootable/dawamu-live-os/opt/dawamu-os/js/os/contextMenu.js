/**
 * Dawamu OS - macOS Liquid Glass Desktop Context Menu
 * Provides right-click desktop and app icon context menus with optical blur,
 * file/folder creation, icon sorting, wallpaper controls, and quick toggles.
 */

import { stateStore } from './state.js';
import { windowManager } from './windowManager.js';
import { launcher } from './launcher.js';
import { quickSettings } from './quickSettings.js';
import { dawamuDialogs } from './dialogs.js';

class DesktopContextMenu {
  constructor() {
    this.menuEl = null;
    this.isOpen = false;
    this.desktopEl = null;
    this.appRegistry = [];
  }

  init({ desktopEl, appRegistry = [] }) {
    this.desktopEl = desktopEl || document.getElementById('desktop');
    this.appRegistry = appRegistry;

    // Create single reusable context menu element
    let existing = document.getElementById('desktop-context-menu');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'desktop-context-menu';
      existing.className = 'context-menu';
      existing.setAttribute('role', 'menu');
      existing.setAttribute('aria-hidden', 'true');
      document.body.appendChild(existing);
    }
    this.menuEl = existing;

    this.attachEvents();
  }

  attachEvents() {
    if (!this.desktopEl) return;

    // Right click on desktop or desktop icons
    this.desktopEl.addEventListener('contextmenu', (e) => {
      // Ignore right-clicks inside app windows, shelf dock, or system popovers
      if (
        e.target.closest('.cros-window') ||
        e.target.closest('#shelf') ||
        e.target.closest('#launcher-overlay') ||
        e.target.closest('#quick-settings-overlay') ||
        e.target.closest('#os-login-screen') ||
        e.target.closest('#curfew-lockout-screen') ||
        e.target.closest('#os-shutdown-screen')
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const iconEl = e.target.closest('.desktop-icon');
      if (iconEl) {
        const appId = iconEl.dataset.appId;
        this.showIconMenu(e.clientX, e.clientY, appId, iconEl);
      } else {
        this.showDesktopMenu(e.clientX, e.clientY);
      }
    });

    // Dismiss on click outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.menuEl.contains(e.target)) {
        this.hide();
      }
    });

    document.addEventListener('contextmenu', (e) => {
      if (this.isOpen && !this.menuEl.contains(e.target) && !e.target.closest('#desktop')) {
        this.hide();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.hide();
      }
    });

    window.addEventListener('blur', () => this.hide());
    window.addEventListener('resize', () => this.hide());
  }

  showDesktopMenu(x, y) {
    this.menuEl.innerHTML = `
      <div class="context-menu-item" data-action="new-folder">
        <i class="fas fa-folder-plus text-amber-400"></i>
        <span>New Folder</span>
        <span class="context-menu-shortcut">⌘⇧N</span>
      </div>
      <div class="context-menu-item" data-action="new-note">
        <i class="fas fa-file-lines text-emerald-400"></i>
        <span>New Study Note</span>
      </div>
      <div class="context-menu-item" data-action="new-doc">
        <i class="fas fa-file-word text-blue-400"></i>
        <span>New Document</span>
      </div>

      <div class="context-menu-divider"></div>

      <div class="context-menu-item has-submenu" data-action="sort">
        <i class="fas fa-arrow-down-a-z text-sky-400"></i>
        <span>Sort Icons By</span>
        <i class="fas fa-chevron-right context-menu-subarrow"></i>
        <div class="context-submenu">
          <div class="context-menu-item" data-action="sort-name">
            <i class="fas fa-arrow-down-a-z text-slate-300"></i>
            <span>Name (A → Z)</span>
          </div>
          <div class="context-menu-item" data-action="sort-category">
            <i class="fas fa-layer-group text-slate-300"></i>
            <span>Curriculum & Type</span>
          </div>
          <div class="context-menu-item" data-action="sort-default">
            <i class="fas fa-rotate-left text-slate-300"></i>
            <span>Default Order</span>
          </div>
        </div>
      </div>

      <div class="context-menu-item" data-action="cleanup">
        <i class="fas fa-table-cells text-indigo-400"></i>
        <span>Clean Up Desktop</span>
      </div>

      <div class="context-menu-divider"></div>

      <div class="context-menu-item" data-action="wallpaper">
        <i class="fas fa-palette text-pink-400"></i>
        <span>Change Wallpaper...</span>
      </div>
      <div class="context-menu-item" data-action="display">
        <i class="fas fa-sun text-amber-400"></i>
        <span>Display Settings...</span>
      </div>

      <div class="context-menu-divider"></div>

      <div class="context-menu-item" data-action="control-center">
        <i class="fas fa-sliders text-teal-400"></i>
        <span>Control Center</span>
      </div>
      <div class="context-menu-item" data-action="launchpad">
        <i class="fas fa-rocket text-purple-400"></i>
        <span>Launchpad & Apps</span>
      </div>
      <div class="context-menu-item" data-action="spotlight">
        <i class="fas fa-magnifying-glass text-emerald-400"></i>
        <span>Spotlight Search</span>
        <span class="context-menu-shortcut">⌘Space</span>
      </div>

      <div class="context-menu-divider"></div>

      <div class="context-menu-item" data-action="about">
        <i class="fas fa-circle-info text-blue-400"></i>
        <span>About Dawamu OS</span>
      </div>
    `;

    this.bindMenuActions();
    this.positionMenu(x, y);
  }

  showIconMenu(x, y, appId, iconEl) {
    const desktopLabel = iconEl ? iconEl.querySelector('.desktop-icon-label')?.textContent.trim() : null;
    const foundApp = this.appRegistry.find((a) => a.id === appId);
    const app = {
      id: appId,
      title: desktopLabel || foundApp?.title || 'App',
      icon: foundApp?.icon || '<i class="fas fa-window-maximize text-emerald-400"></i>',
      keywords: foundApp?.keywords || []
    };

    const isRunning = windowManager.windows.has(appId);

    this.menuEl.innerHTML = `
      <div class="context-menu-header">
        <span class="text-sm">${app.icon}</span>
        <span class="font-bold text-white truncate max-w-[170px]">${app.title}</span>
      </div>
      <div class="context-menu-divider"></div>

      <div class="context-menu-item font-semibold text-emerald-300" data-action="open-app" data-app-id="${app.id}">
        <i class="fas fa-arrow-up-right-from-square text-emerald-400"></i>
        <span>${isRunning ? 'Switch to Application' : 'Open'}</span>
      </div>

      <div class="context-menu-item" data-action="app-info" data-app-id="${app.id}">
        <i class="fas fa-circle-info text-blue-400"></i>
        <span>Get App Info</span>
      </div>

      <div class="context-menu-divider"></div>

      <div class="context-menu-item" data-action="open-in-explorer">
        <i class="fas fa-folder-open text-amber-400"></i>
        <span>Browse in This PC</span>
      </div>

      <div class="context-menu-item" data-action="wallpaper">
        <i class="fas fa-palette text-pink-400"></i>
        <span>Change Wallpaper...</span>
      </div>
    `;

    this.bindMenuActions(app);
    this.positionMenu(x, y);
  }

  positionMenu(x, y) {
    this.menuEl.style.visibility = 'hidden';
    this.menuEl.style.left = '0px';
    this.menuEl.style.top = '0px';
    this.menuEl.classList.add('open');
    this.menuEl.setAttribute('aria-hidden', 'false');
    this.isOpen = true;

    const menuWidth = this.menuEl.offsetWidth || 220;
    const menuHeight = this.menuEl.offsetHeight || 310;
    const pad = 12;

    // Keep inside screen viewport bounds and above the floating dock
    const maxX = window.innerWidth - menuWidth - pad;
    const maxY = window.innerHeight - menuHeight - 68;

    const posX = Math.max(pad, Math.min(x, maxX));
    const posY = Math.max(pad, Math.min(y, maxY));

    this.menuEl.style.left = `${posX}px`;
    this.menuEl.style.top = `${posY}px`;

    // Flip submenu if near right viewport edge
    const submenu = this.menuEl.querySelector('.context-submenu');
    if (submenu) {
      if (posX + menuWidth + 180 > window.innerWidth) {
        submenu.classList.add('flip-left');
      } else {
        submenu.classList.remove('flip-left');
      }
    }

    this.menuEl.style.visibility = 'visible';
  }

  hide() {
    if (!this.isOpen) return;
    this.menuEl.classList.remove('open');
    this.menuEl.setAttribute('aria-hidden', 'true');
    this.menuEl.style.visibility = '';
    this.isOpen = false;
  }

  bindMenuActions(targetApp = null) {
    this.menuEl.querySelectorAll('.context-menu-item').forEach((item) => {
      item.addEventListener('click', async (e) => {
        const action = item.dataset.action;
        if (action === 'sort') return; // Parent item for submenu

        e.stopPropagation();
        this.hide();

        await this.handleAction(action, targetApp || item.dataset);
      });
    });
  }

  async handleAction(action, data = {}) {
    switch (action) {
      case 'new-folder': {
        const name = await dawamuDialogs.prompt({
          title: 'New Desktop Folder',
          message: 'Enter a name for the new folder on your Desktop:',
          defaultValue: 'New Folder',
          placeholder: 'Folder name...',
          confirmText: 'Create Folder'
        });
        if (name && name.trim()) {
          stateStore.createFolderInVFS('desktop', name.trim());
          dawamuDialogs.toast(`Created folder "${name.trim()}" on Desktop`, 'success');
        }
        break;
      }

      case 'new-note': {
        const timestamp = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
        const noteName = `Study_Note_${Date.now().toString().slice(-4)}.txt`;
        const initialText = `Dawamu OS - Quick Study Note\nDate: ${timestamp}\nStudent: ${stateStore.getState().currentUser?.name || 'Candidate'}\n\nKey Concepts & Notes:\n- `;
        const file = stateStore.saveFileToVFS('desktop', {
          name: noteName,
          content: initialText,
          type: 'txt'
        });
        dawamuDialogs.toast(`Created "${file.name}" on Desktop`, 'success');

        const docsApp = this.appRegistry.find((a) => a.id === 'docs');
        if (docsApp) {
          docsApp.launch({
            fileId: file.id,
            fileName: file.name,
            folderKey: 'desktop',
            fileData: file.content
          });
        }
        break;
      }

      case 'new-doc': {
        const wordApp = this.appRegistry.find((a) => a.id === 'word');
        if (wordApp) wordApp.launch();
        break;
      }

      case 'sort-name':
        this.sortIcons('name');
        dawamuDialogs.toast('Desktop icons sorted alphabetically (A → Z)', 'info');
        break;

      case 'sort-category':
        this.sortIcons('category');
        dawamuDialogs.toast('Desktop icons arranged by curriculum category', 'info');
        break;

      case 'sort-default':
        this.sortIcons('default');
        dawamuDialogs.toast('Desktop icons restored to default arrangement', 'info');
        break;

      case 'cleanup':
        this.triggerCleanupAnimation();
        dawamuDialogs.toast('Desktop aligned and cleaned up', 'success');
        break;

      case 'wallpaper': {
        const settingsApp = this.appRegistry.find((a) => a.id === 'settings');
        if (settingsApp) settingsApp.launch({ category: 'personalization' });
        break;
      }

      case 'display': {
        const settingsApp = this.appRegistry.find((a) => a.id === 'settings');
        if (settingsApp) settingsApp.launch({ category: 'display' });
        break;
      }

      case 'control-center':
        quickSettings.toggle();
        break;

      case 'launchpad':
        launcher.toggle();
        break;

      case 'spotlight':
        launcher.open();
        break;

      case 'about': {
        const settingsApp = this.appRegistry.find((a) => a.id === 'settings');
        if (settingsApp) settingsApp.launch({ category: 'about' });
        break;
      }

      case 'open-app': {
        const appId = data.id || data.appId;
        const app = this.appRegistry.find((a) => a.id === appId);
        if (app) app.launch();
        break;
      }

      case 'app-info': {
        const appId = data.id || data.appId;
        const app = this.appRegistry.find((a) => a.id === appId);
        if (app) {
          const kw = app.keywords ? app.keywords.slice(0, 5).join(', ') : 'Academic Tools';
          dawamuDialogs.alert(
            app.title,
            `Application ID: ${app.id}\nCategory / Keywords: ${kw}\nEnvironment: Dawamu OS Sandboxed Environment`,
            'info'
          );
        }
        break;
      }

      case 'open-in-explorer': {
        const explorer = this.appRegistry.find((a) => a.id === 'explorer');
        if (explorer) explorer.launch({ folderKey: 'desktop' });
        break;
      }

      default:
        break;
    }
  }

  sortIcons(mode = 'name') {
    const container = document.getElementById('desktop-icons');
    if (!container) return;

    const icons = Array.from(container.querySelectorAll('.desktop-icon'));
    if (icons.length === 0) return;

    if (mode === 'name') {
      icons.sort((a, b) => {
        const nameA = a.querySelector('.desktop-icon-label')?.textContent.trim() || '';
        const nameB = b.querySelector('.desktop-icon-label')?.textContent.trim() || '';
        return nameA.localeCompare(nameB);
      });
    } else if (mode === 'category') {
      const catOrder = {
        eduguard: 1,
        books844: 2,
        classroom: 3,
        browser: 4,
        offlineBrowser: 5,
        docs: 6,
        word: 7,
        spreadsheet: 8,
        database: 9,
        calculator: 10,
        focusTimer: 11,
        explorer: 12,
        settings: 13,
        installer: 14
      };
      icons.sort((a, b) => (catOrder[a.dataset.appId] || 99) - (catOrder[b.dataset.appId] || 99));
    } else if (mode === 'default') {
      const defaultOrder = [
        'explorer',
        'browser',
        'offlineBrowser',
        'eduguard',
        'books844',
        'docs',
        'classroom',
        'word',
        'spreadsheet',
        'database',
        'calculator',
        'settings',
        'installer'
      ];
      icons.sort((a, b) => defaultOrder.indexOf(a.dataset.appId) - defaultOrder.indexOf(b.dataset.appId));
    }

    icons.forEach((ic) => container.appendChild(ic));
    this.triggerCleanupAnimation();
  }

  triggerCleanupAnimation() {
    const container = document.getElementById('desktop-icons');
    if (!container) return;
    const icons = container.querySelectorAll('.desktop-icon');
    icons.forEach((ic, idx) => {
      ic.style.transition = 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)';
      ic.style.transform = 'scale(0.88)';
      setTimeout(() => {
        ic.style.transform = '';
      }, 30 + idx * 18);
    });
  }
}

export const desktopContextMenu = new DesktopContextMenu();
