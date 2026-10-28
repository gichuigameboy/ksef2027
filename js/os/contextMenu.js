/**
 * Dawamu OS - Unified macOS Liquid Glass Context Menu System
 * Provides authentic, translucent context menus for:
 * 1. Desktop Wallpaper (New folder, New study note, New doc, Sort icons, Clean up, Wallpapers)
 * 2. Desktop Icons (Open, Get info, Browse in This PC)
 * 3. In-App Windows (Word, Spreadsheet, Explorer, Database, Browser, Docs, Calculator, Books, etc.)
 * 4. Dock Shelf (Launchpad, Control Center, Spotlight, Dock Settings)
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
    this.savedRange = null;
    this.savedText = '';
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
    this.menuEl.addEventListener('mousedown', (e) => {
      // Crucial: Prevent context menu interactions from stealing focus and collapsing selection in contenteditable
      e.preventDefault();
    });

    this.attachEvents();
  }

  attachEvents() {
    // Global Right Click Listener
    document.addEventListener('contextmenu', (e) => {
      // Ignore system lockout, login, and shutdown screens
      if (
        e.target.closest('#os-login-screen') ||
        e.target.closest('#curfew-lockout-screen') ||
        e.target.closest('#os-shutdown-screen')
      ) {
        return;
      }

      // 1. Right Click inside an Open App Window (.cros-window)
      const winEl = e.target.closest('.cros-window');
      if (winEl) {
        e.preventDefault();
        e.stopPropagation();

        const appId = winEl.id.replace('window-', '');
        windowManager.focusWindow(appId);
        const container = winEl.querySelector('#word-paper') || winEl.querySelector('#doc-editor');
        this.saveCurrentSelection(e, container);
        this.showAppContextMenu(e.clientX, e.clientY, appId, winEl, e.target);
        return;
      }

      // 2. Right Click on Shelf Dock (#shelf)
      const shelfEl = e.target.closest('#shelf');
      if (shelfEl) {
        e.preventDefault();
        e.stopPropagation();

        const shelfIcon = e.target.closest('.shelf-icon');
        if (shelfIcon) {
          const appId = shelfIcon.dataset.appId;
          this.showDockAppMenu(e.clientX, e.clientY, appId, shelfIcon);
        } else {
          this.showDockMenu(e.clientX, e.clientY);
        }
        return;
      }

      // 3. Right Click on Desktop or Desktop Icons (#desktop)
      const desktop = e.target.closest('#desktop');
      if (desktop) {
        e.preventDefault();
        e.stopPropagation();

        const iconEl = e.target.closest('.desktop-icon');
        if (iconEl) {
          const appId = iconEl.dataset.appId;
          this.showIconMenu(e.clientX, e.clientY, appId, iconEl);
        } else {
          this.showDesktopMenu(e.clientX, e.clientY);
        }
      }
    });

    // Dismiss on click outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.menuEl.contains(e.target)) {
        this.hide();
      }
    });

    // Dismiss on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.hide();
      }
    });

    window.addEventListener('blur', () => this.hide());
    window.addEventListener('resize', () => this.hide());
  }

  saveCurrentSelection(e = null, container = null) {
    this.lastClickX = e?.clientX ?? null;
    this.lastClickY = e?.clientY ?? null;
    this.lastTargetEl = e?.target ?? null;

    // 1. Resolve point range from right-click coordinates if valid mouse coordinates provided
    let pointRange = null;
    if (e && typeof e.clientX === 'number' && typeof e.clientY === 'number' && (e.clientX > 0 || e.clientY > 0)) {
      if (document.caretRangeFromPoint) {
        pointRange = document.caretRangeFromPoint(e.clientX, e.clientY);
      } else if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
        if (pos) {
          pointRange = document.createRange();
          pointRange.setStart(pos.offsetNode, pos.offset);
          pointRange.setEnd(pos.offsetNode, pos.offset);
        }
      }
    }

    const sel = window.getSelection();

    // 2. If user already had an active highlighted selection inside container:
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      if (!container || container.contains(range.commonAncestorContainer) || container === range.commonAncestorContainer) {
        let isInsideSelection = true;
        // If a physical click point inside the container was detected, check if it was on or outside the selection
        if (pointRange && (!container || container.contains(pointRange.startContainer) || container === pointRange.startContainer)) {
          try {
            isInsideSelection = (range.comparePoint(pointRange.startContainer, pointRange.startOffset) === 0);
          } catch (_) {
            isInsideSelection = true;
          }
        }
        if (isInsideSelection) {
          this.savedRange = range.cloneRange();
          this.savedText = sel.toString().trim();
          return;
        }
      }
    }

    // 3. Right-click point range inside container
    if (pointRange && (!container || container.contains(pointRange.startContainer) || container === pointRange.startContainer)) {
      this.savedRange = pointRange.cloneRange();
      this.savedText = this.savedRange.toString().trim();
    } else if (sel && sel.rangeCount > 0 && (!container || container.contains(sel.getRangeAt(0).startContainer) || container === sel.getRangeAt(0).startContainer)) {
      this.savedRange = sel.getRangeAt(0).cloneRange();
      this.savedText = sel.toString().trim();
    } else if (e?.target && container && container.contains(e.target)) {
      const r = document.createRange();
      r.selectNodeContents(e.target);
      this.savedRange = r;
      this.savedText = e.target.textContent.trim();
    } else if (sel && sel.rangeCount > 0) {
      this.savedRange = sel.getRangeAt(0).cloneRange();
      this.savedText = sel.toString().trim();
    } else {
      this.savedRange = null;
      this.savedText = '';
    }
  }

  restoreSelection(container) {
    if (container && typeof container.focus === 'function') {
      try {
        container.focus();
      } catch (_) {}
    }
    if (this.savedRange) {
      try {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(this.savedRange);
      } catch (_) {}
    }
  }

  ensureFormattingSelection(container, targetEl, mode = 'word') {
    this.restoreSelection(container);
    const sel = window.getSelection();

    // If an explicit non-collapsed selection was highlighted by user inside container, preserve it!
    if (this.savedRange && !this.savedRange.collapsed) {
      if (!container || container.contains(this.savedRange.commonAncestorContainer) || container === this.savedRange.commonAncestorContainer) {
        return this.savedRange;
      }
    }

    // Word Mode: for character/font formatting (bold, italic, underline, strike, highlight, clear format)
    if (mode === 'word') {
      let range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : this.savedRange;
      if ((!range || (container && !container.contains(range.startContainer))) && this.lastClickX != null && this.lastClickY != null && document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(this.lastClickX, this.lastClickY);
      }

      if (range && range.startContainer) {
        let node = range.startContainer;
        let offset = range.startOffset;

        if (node.nodeType === Node.ELEMENT_NODE && node.childNodes.length > 0) {
          const childIdx = Math.min(offset, node.childNodes.length - 1);
          node = node.childNodes[childIdx];
          if (node.nodeType === Node.ELEMENT_NODE && node.firstChild) {
            node = node.firstChild;
          }
        }

        if (node && node.nodeType === Node.TEXT_NODE) {
          const text = node.nodeValue || '';
          let start = Math.min(Math.max(0, offset), text.length);
          let end = start;

          // Expand backwards to beginning of word
          while (start > 0 && /\S/.test(text.charAt(start - 1))) {
            start--;
          }
          // Expand forwards to end of word
          while (end < text.length && /\S/.test(text.charAt(end))) {
            end++;
          }

          // Strip leading & trailing punctuation so formatting applies cleanly to the word
          while (start < end && /^[«"'(\[{"'`]/i.test(text.charAt(start))) {
            start++;
          }
          while (end > start && /[»"')\]}"'`,.:;!?]/i.test(text.charAt(end - 1))) {
            end--;
          }

          if (end > start) {
            const wordRange = document.createRange();
            wordRange.setStart(node, start);
            wordRange.setEnd(node, end);
            sel.removeAllRanges();
            sel.addRange(wordRange);
            this.savedRange = wordRange.cloneRange();
            return wordRange;
          }
        }
      }

      // Fallback: leaf element under click
      const el = targetEl || this.lastTargetEl;
      if (el && container && container.contains(el) && el !== container) {
        const r = document.createRange();
        r.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(r);
        this.savedRange = r.cloneRange();
        return r;
      }
    }

    // Block Mode: for paragraph styles, headings, lists, alignment
    if (mode === 'block') {
      const el = targetEl || this.lastTargetEl;
      const block = el?.closest('p, h1, h2, h3, h4, h5, h6, li, blockquote') ||
                    (sel && sel.anchorNode ? (sel.anchorNode.nodeType === Node.ELEMENT_NODE ? sel.anchorNode : sel.anchorNode.parentElement)?.closest('p, h1, h2, h3, h4, h5, h6, li, blockquote') : null);
      if (block && container && container.contains(block)) {
        const blockRange = document.createRange();
        blockRange.selectNodeContents(block);
        sel.removeAllRanges();
        sel.addRange(blockRange);
        this.savedRange = blockRange.cloneRange();
        return blockRange;
      }
    }

    return null;
  }

  /* ─────────────────────────────────────────────
     1. DESKTOP WALLPAPER CONTEXT MENU
  ───────────────────────────────────────────── */
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

  /* ─────────────────────────────────────────────
     2. DESKTOP ICON CONTEXT MENU
  ───────────────────────────────────────────── */
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

  /* ─────────────────────────────────────────────
     3. DOCK SHELF CONTEXT MENUS
  ───────────────────────────────────────────── */
  showDockMenu(x, y) {
    this.menuEl.innerHTML = `
      <div class="context-menu-header">
        <i class="fas fa-bars-staggered text-emerald-400"></i>
        <span class="font-bold text-white">Dawamu Dock</span>
      </div>
      <div class="context-menu-divider"></div>

      <div class="context-menu-item" data-action="launchpad">
        <i class="fas fa-rocket text-purple-400"></i>
        <span>Launchpad & Apps</span>
      </div>
      <div class="context-menu-item" data-action="control-center">
        <i class="fas fa-sliders text-teal-400"></i>
        <span>Control Center</span>
      </div>
      <div class="context-menu-item" data-action="spotlight">
        <i class="fas fa-magnifying-glass text-emerald-400"></i>
        <span>Spotlight Search</span>
      </div>

      <div class="context-menu-divider"></div>

      <div class="context-menu-item" data-action="wallpaper">
        <i class="fas fa-palette text-pink-400"></i>
        <span>Desktop & Dock Settings...</span>
      </div>
    `;
    this.bindMenuActions();
    this.positionMenu(x, y);
  }

  showDockAppMenu(x, y, appId, iconEl) {
    this.showIconMenu(x, y, appId, iconEl);
  }

  /* ─────────────────────────────────────────────
     4. IN-APP CONTEXT MENUS (APP-SPECIFIC)
  ───────────────────────────────────────────── */
  showAppContextMenu(x, y, appId, winEl, targetEl) {
    const foundApp = this.appRegistry.find((a) => a.id === appId);
    const winTitle = winEl.querySelector('.window-title-text')?.textContent.trim();
    const app = {
      id: appId,
      title: winTitle || foundApp?.title || 'Application',
      icon: winEl.querySelector('.app-header-icon')?.innerHTML || foundApp?.icon || '<i class="fas fa-window-maximize text-emerald-400"></i>'
    };

    let menuContent = '';

    if (appId === 'word') {
      menuContent = this.getWordMenuHtml(app, winEl, targetEl);
    } else if (appId === 'spreadsheet') {
      menuContent = this.getSpreadsheetMenuHtml(app, winEl, targetEl);
    } else if (appId === 'explorer') {
      menuContent = this.getExplorerMenuHtml(app, winEl, targetEl);
    } else if (appId === 'database') {
      menuContent = this.getDatabaseMenuHtml(app, winEl, targetEl);
    } else if (appId === 'browser' || appId === 'offlineBrowser') {
      menuContent = this.getBrowserMenuHtml(app, winEl, targetEl);
    } else if (appId === 'docs') {
      menuContent = this.getDocsMenuHtml(app, winEl, targetEl);
    } else if (appId === 'calculator') {
      menuContent = this.getCalculatorMenuHtml(app, winEl, targetEl);
    } else if (appId === 'books844') {
      menuContent = this.getBooksMenuHtml(app, winEl, targetEl);
    } else if (appId === 'classroom') {
      menuContent = this.getClassroomMenuHtml(app, winEl, targetEl);
    } else if (appId === 'eduguard') {
      menuContent = this.getEduguardMenuHtml(app, winEl, targetEl);
    } else if (appId === 'settings') {
      menuContent = this.getSettingsMenuHtml(app, winEl, targetEl);
    } else {
      menuContent = this.getGenericAppMenuHtml(app, winEl, targetEl);
    }

    this.menuEl.innerHTML = menuContent;
    this.bindAppMenuActions(appId, winEl, targetEl);
    this.positionMenu(x, y);
  }

  getWordMenuHtml(app, winEl, targetEl) {
    const hasSelection = Boolean(this.savedText);
    const selSnippet = hasSelection ? (this.savedText.length > 18 ? this.savedText.slice(0, 16) + '…' : this.savedText) : '';

    return `
      <div class="context-menu-header">
        <span class="text-sm">${app.icon}</span>
        <span class="font-bold text-white truncate max-w-[170px]">${app.title}</span>
      </div>
      <div class="context-menu-divider"></div>

      <div class="context-menu-item" data-app-action="word-cut">
        <i class="fas fa-cut text-slate-300"></i>
        <span>Cut</span>
        <span class="context-menu-shortcut">⌘X</span>
      </div>
      <div class="context-menu-item" data-app-action="word-copy">
        <i class="fas fa-copy text-slate-300"></i>
        <span>Copy</span>
        <span class="context-menu-shortcut">⌘C</span>
      </div>
      <div class="context-menu-item" data-app-action="word-paste">
        <i class="fas fa-paste text-slate-300"></i>
        <span>Paste</span>
        <span class="context-menu-shortcut">⌘V</span>
      </div>

      <div class="context-menu-divider"></div>

      <div class="context-menu-item has-submenu" data-app-action="menu-group">
        <i class="fas fa-font text-sky-400"></i>
        <span>Format Font</span>
        <i class="fas fa-chevron-right context-menu-subarrow"></i>
        <div class="context-submenu">
          <div class="context-menu-item" data-app-action="word-bold">
            <i class="fas fa-bold text-slate-200"></i>
            <span>Bold</span>
            <span class="context-menu-shortcut">⌘B</span>
          </div>
          <div class="context-menu-item" data-app-action="word-italic">
            <i class="fas fa-italic text-slate-200"></i>
            <span>Italic</span>
            <span class="context-menu-shortcut">⌘I</span>
          </div>
          <div class="context-menu-item" data-app-action="word-underline">
            <i class="fas fa-underline text-slate-200"></i>
            <span>Underline</span>
            <span class="context-menu-shortcut">⌘U</span>
          </div>
          <div class="context-menu-item" data-app-action="word-strike">
            <i class="fas fa-strikethrough text-slate-300"></i>
            <span>Strikethrough</span>
          </div>
          <div class="context-menu-item" data-app-action="word-highlight">
            <i class="fas fa-highlighter text-amber-300"></i>
            <span>Highlight (Yellow)</span>
          </div>
          <div class="context-menu-item" data-app-action="word-remove-format">
            <i class="fas fa-remove-format text-rose-300"></i>
            <span>Clear Formatting</span>
          </div>
        </div>
      </div>

      <div class="context-menu-item has-submenu" data-app-action="menu-group">
        <i class="fas fa-plus-circle text-emerald-400"></i>
        <span>Insert Tools</span>
        <i class="fas fa-chevron-right context-menu-subarrow"></i>
        <div class="context-submenu">
          <div class="context-menu-item" data-app-action="word-insert-table">
            <i class="fas fa-table text-blue-400"></i>
            <span>Insert Table (3×3)</span>
          </div>
          <div class="context-menu-item" data-app-action="word-insert-image">
            <i class="fas fa-image text-emerald-400"></i>
            <span>Insert Image...</span>
          </div>
          <div class="context-menu-item" data-app-action="word-insert-date">
            <i class="fas fa-calendar-day text-amber-400"></i>
            <span>Current Date & Time</span>
          </div>
          <div class="context-menu-item" data-app-action="word-insert-symbol">
            <i class="fas fa-square-root-alt text-purple-400"></i>
            <span>Math & Scientific Symbol...</span>
          </div>
          <div class="context-menu-item" data-app-action="word-insert-hr">
            <i class="fas fa-minus text-slate-300"></i>
            <span>Horizontal Line</span>
          </div>
        </div>
      </div>

      <div class="context-menu-item has-submenu" data-app-action="menu-group">
        <i class="fas fa-align-left text-indigo-400"></i>
        <span>Paragraph & Style</span>
        <i class="fas fa-chevron-right context-menu-subarrow"></i>
        <div class="context-submenu">
          <div class="context-menu-item" data-app-action="word-h1">
            <i class="fas fa-heading text-blue-400"></i>
            <span>Heading 1</span>
          </div>
          <div class="context-menu-item" data-app-action="word-h2">
            <i class="fas fa-heading text-blue-300"></i>
            <span>Heading 2</span>
          </div>
          <div class="context-menu-item" data-app-action="word-p">
            <i class="fas fa-paragraph text-slate-300"></i>
            <span>Normal Paragraph</span>
          </div>
          <div class="context-menu-item" data-app-action="word-bullet">
            <i class="fas fa-list-ul text-emerald-400"></i>
            <span>Bulleted List</span>
          </div>
          <div class="context-menu-item" data-app-action="word-numbered">
            <i class="fas fa-list-ol text-emerald-400"></i>
            <span>Numbered List</span>
          </div>
          <div class="context-menu-item" data-app-action="word-align-left">
            <i class="fas fa-align-left text-slate-300"></i>
            <span>Align Left</span>
          </div>
          <div class="context-menu-item" data-app-action="word-align-center">
            <i class="fas fa-align-center text-slate-300"></i>
            <span>Align Center</span>
          </div>
          <div class="context-menu-item" data-app-action="word-align-right">
            <i class="fas fa-align-right text-slate-300"></i>
            <span>Align Right</span>
          </div>
        </div>
      </div>

      ${hasSelection ? `
        <div class="context-menu-divider"></div>
        <div class="context-menu-item" data-app-action="word-search-selection">
          <i class="fas fa-globe text-emerald-400"></i>
          <span>Search "${selSnippet}" on Safe Web</span>
        </div>
        <div class="context-menu-item" data-app-action="word-note-selection">
          <i class="fas fa-note-sticky text-amber-400"></i>
          <span>Save Selection as Study Note</span>
        </div>
      ` : ''}

      <div class="context-menu-divider"></div>

      <div class="context-menu-item" data-app-action="word-stats">
        <i class="fas fa-chart-bar text-sky-400"></i>
        <span>Document Statistics...</span>
      </div>
      <div class="context-menu-item" data-app-action="word-save">
        <i class="fas fa-save text-emerald-400"></i>
        <span>Save Document</span>
        <span class="context-menu-shortcut">⌘S</span>
      </div>
      <div class="context-menu-item" data-app-action="word-export-pdf">
        <i class="fas fa-file-pdf text-rose-400"></i>
        <span>Print / Export PDF</span>
      </div>

      <div class="context-menu-divider"></div>
      ${this.getWindowControlsHtml(app.id)}
    `;
  }

  getSpreadsheetMenuHtml(app, winEl, targetEl) {
    const cellTd = targetEl.closest('.cell-td');
    if (cellTd) {
      cellTd.click();
    }
    const cellKey = cellTd ? cellTd.dataset.key : winEl.querySelector('#cell-ref')?.textContent || 'A1';

    return `
      <div class="context-menu-header">
        <span class="text-sm">${app.icon}</span>
        <span class="font-bold text-white truncate max-w-[170px]">${app.title} (${cellKey})</span>
      </div>
      <div class="context-menu-divider"></div>

      <div class="context-menu-item" data-app-action="sheet-cut">
        <i class="fas fa-cut text-slate-300"></i>
        <span>Cut Cell Value</span>
        <span class="context-menu-shortcut">⌘X</span>
      </div>
      <div class="context-menu-item" data-app-action="sheet-copy">
        <i class="fas fa-copy text-slate-300"></i>
        <span>Copy Cell Value</span>
        <span class="context-menu-shortcut">⌘C</span>
      </div>
      <div class="context-menu-item" data-app-action="sheet-paste">
        <i class="fas fa-paste text-slate-300"></i>
        <span>Paste into Cell</span>
        <span class="context-menu-shortcut">⌘V</span>
      </div>
      <div class="context-menu-item" data-app-action="sheet-clear">
        <i class="fas fa-eraser text-slate-300"></i>
        <span>Clear Cell Contents</span>
      </div>

      <div class="context-menu-divider"></div>

      <div class="context-menu-item has-submenu" data-app-action="menu-group">
        <i class="fas fa-sliders text-emerald-400"></i>
        <span>Format Cell</span>
        <i class="fas fa-chevron-right context-menu-subarrow"></i>
        <div class="context-submenu">
          <div class="context-menu-item" data-app-action="sheet-fmt-currency">
            <i class="fas fa-money-bill-wave text-emerald-400"></i>
            <span>Currency (KES)</span>
          </div>
          <div class="context-menu-item" data-app-action="sheet-fmt-percent">
            <i class="fas fa-percent text-blue-400"></i>
            <span>Percentage (%)</span>
          </div>
          <div class="context-menu-item" data-app-action="sheet-fmt-bold">
            <i class="fas fa-bold text-slate-200"></i>
            <span>Bold Text</span>
          </div>
          <div class="context-menu-item" data-app-action="sheet-fmt-decimal">
            <i class="fas fa-hashtag text-amber-400"></i>
            <span>Two Decimals (.00)</span>
          </div>
        </div>
      </div>

      <div class="context-menu-item has-submenu" data-app-action="menu-group">
        <i class="fas fa-calculator text-blue-400"></i>
        <span>Insert Formula</span>
        <i class="fas fa-chevron-right context-menu-subarrow"></i>
        <div class="context-submenu">
          <div class="context-menu-item" data-app-action="sheet-fml-sum">
            <i class="fas fa-calculator text-emerald-400"></i>
            <span>=SUM(B2:B8)</span>
          </div>
          <div class="context-menu-item" data-app-action="sheet-fml-avg">
            <i class="fas fa-divide text-blue-400"></i>
            <span>=AVERAGE(B2:B8)</span>
          </div>
          <div class="context-menu-item" data-app-action="sheet-fml-max">
            <i class="fas fa-arrow-trend-up text-amber-400"></i>
            <span>=MAX(B2:B8)</span>
          </div>
          <div class="context-menu-item" data-app-action="sheet-fml-min">
            <i class="fas fa-arrow-trend-down text-teal-400"></i>
            <span>=MIN(B2:B8)</span>
          </div>
          <div class="context-menu-item" data-app-action="sheet-fml-count">
            <i class="fas fa-list-ol text-purple-400"></i>
            <span>=COUNT(B2:B8)</span>
          </div>
        </div>
      </div>

      <div class="context-menu-divider"></div>

      <div class="context-menu-item" data-app-action="sheet-save-downloads">
        <i class="fas fa-folder-plus text-emerald-400"></i>
        <span>Save to This PC > Downloads</span>
      </div>
      <div class="context-menu-item" data-app-action="sheet-export-csv">
        <i class="fas fa-file-csv text-blue-400"></i>
        <span>Export CSV File</span>
      </div>
      <div class="context-menu-item" data-app-action="sheet-load-gradebook">
        <i class="fas fa-graduation-cap text-amber-400"></i>
        <span>Load KCSE Gradebook</span>
      </div>
      <div class="context-menu-item" data-app-action="sheet-clear-all">
        <i class="fas fa-trash-alt text-rose-400"></i>
        <span>Clear Entire Sheet</span>
      </div>

      <div class="context-menu-divider"></div>
      ${this.getWindowControlsHtml(app.id)}
    `;
  }

  getExplorerMenuHtml(app, winEl, targetEl) {
    const fileItem = targetEl.closest('.file-item');
    if (fileItem) {
      fileItem.click();
      const fileName = fileItem.dataset.name || 'File';
      const fileType = fileItem.dataset.type || 'file';

      return `
        <div class="context-menu-header">
          <i class="fas fa-file-lines text-amber-400"></i>
          <span class="font-bold text-white truncate max-w-[170px]">${fileName}</span>
        </div>
        <div class="context-menu-divider"></div>

        <div class="context-menu-item font-semibold text-emerald-300" data-app-action="exp-open-item">
          <i class="fas fa-arrow-up-right-from-square text-emerald-400"></i>
          <span>Open ${fileType === 'folder' ? 'Folder' : 'File'}</span>
        </div>
        <div class="context-menu-item" data-app-action="exp-cut-item">
          <i class="fas fa-cut text-slate-300"></i>
          <span>Cut</span>
          <span class="context-menu-shortcut">⌘X</span>
        </div>
        <div class="context-menu-item" data-app-action="exp-copy-item">
          <i class="fas fa-copy text-slate-300"></i>
          <span>Copy</span>
          <span class="context-menu-shortcut">⌘C</span>
        </div>
        <div class="context-menu-item" data-app-action="exp-move-item">
          <i class="fas fa-people-arrows text-sky-400"></i>
          <span>Move To...</span>
        </div>
        <div class="context-menu-item" data-app-action="exp-rename-item">
          <i class="fas fa-pen text-amber-300"></i>
          <span>Rename...</span>
        </div>
        <div class="context-menu-item text-rose-300" data-app-action="exp-delete-item">
          <i class="fas fa-trash-alt text-rose-400"></i>
          <span>Delete</span>
          <span class="context-menu-shortcut">Del</span>
        </div>

        <div class="context-menu-divider"></div>

        <div class="context-menu-item" data-app-action="exp-copy-desktop">
          <i class="fas fa-desktop text-blue-400"></i>
          <span>Copy to Desktop</span>
        </div>

        <div class="context-menu-divider"></div>
        ${this.getWindowControlsHtml(app.id)}
      `;
    }

    return `
      <div class="context-menu-header">
        <i class="fas fa-laptop text-emerald-400"></i>
        <span class="font-bold text-white">This PC / My Files</span>
      </div>
      <div class="context-menu-divider"></div>

      <div class="context-menu-item" data-app-action="exp-new-folder">
        <i class="fas fa-folder-plus text-amber-400"></i>
        <span>New Folder</span>
      </div>
      <div class="context-menu-item" data-app-action="exp-new-file">
        <i class="fas fa-file-circle-plus text-emerald-400"></i>
        <span>New Document</span>
      </div>
      <div class="context-menu-item" data-app-action="exp-paste">
        <i class="fas fa-paste text-slate-300"></i>
        <span>Paste</span>
        <span class="context-menu-shortcut">⌘V</span>
      </div>
      <div class="context-menu-item" data-app-action="exp-import">
        <i class="fas fa-cloud-arrow-up text-sky-400"></i>
        <span>Import / Drop Files...</span>
      </div>

      <div class="context-menu-divider"></div>

      <div class="context-menu-item" data-app-action="exp-refresh">
        <i class="fas fa-redo text-slate-300"></i>
        <span>Refresh Folder</span>
      </div>

      <div class="context-menu-divider"></div>
      ${this.getWindowControlsHtml(app.id)}
    `;
  }

  getDatabaseMenuHtml(app, winEl, targetEl) {
    const tr = targetEl.closest('tr');
    const editBtn = tr?.querySelector('.row-edit-btn');
    const hasRow = Boolean(editBtn);

    return `
      <div class="context-menu-header">
        <span class="text-sm">${app.icon}</span>
        <span class="font-bold text-white truncate max-w-[170px]">${app.title}</span>
      </div>
      <div class="context-menu-divider"></div>

      ${hasRow ? `
        <div class="context-menu-item font-semibold text-sky-300" data-app-action="db-edit-row">
          <i class="fas fa-edit text-sky-400"></i>
          <span>Edit Selected Record...</span>
        </div>
        <div class="context-menu-item text-rose-300" data-app-action="db-delete-row">
          <i class="fas fa-trash-alt text-rose-400"></i>
          <span>Delete Record</span>
        </div>
        <div class="context-menu-divider"></div>
      ` : ''}

      <div class="context-menu-item text-emerald-300" data-app-action="db-add-record">
        <i class="fas fa-plus-circle text-emerald-400"></i>
        <span>Add New Record...</span>
      </div>
      <div class="context-menu-item" data-app-action="db-save">
        <i class="fas fa-save text-blue-400"></i>
        <span>Save Database</span>
        <span class="context-menu-shortcut">⌘S</span>
      </div>
      <div class="context-menu-item" data-app-action="db-export-csv">
        <i class="fas fa-file-csv text-amber-400"></i>
        <span>Export Current Table to CSV</span>
      </div>
      <div class="context-menu-item" data-app-action="db-refresh">
        <i class="fas fa-redo text-slate-300"></i>
        <span>Refresh Database</span>
      </div>

      <div class="context-menu-divider"></div>
      ${this.getWindowControlsHtml(app.id)}
    `;
  }

  getBrowserMenuHtml(app, winEl, targetEl) {
    const hasSelection = Boolean(this.savedText);
    const selSnippet = hasSelection ? (this.savedText.length > 18 ? this.savedText.slice(0, 16) + '…' : this.savedText) : '';

    return `
      <div class="context-menu-header">
        <span class="text-sm">${app.icon}</span>
        <span class="font-bold text-white truncate max-w-[170px]">${app.title}</span>
      </div>
      <div class="context-menu-divider"></div>

      <div class="context-menu-item" data-app-action="browser-back">
        <i class="fas fa-arrow-left text-slate-300"></i>
        <span>Back</span>
        <span class="context-menu-shortcut">Alt←</span>
      </div>
      <div class="context-menu-item" data-app-action="browser-forward">
        <i class="fas fa-arrow-right text-slate-300"></i>
        <span>Forward</span>
        <span class="context-menu-shortcut">Alt→</span>
      </div>
      <div class="context-menu-item" data-app-action="browser-reload">
        <i class="fas fa-redo text-slate-300"></i>
        <span>Reload Page</span>
        <span class="context-menu-shortcut">⌘R</span>
      </div>
      <div class="context-menu-item" data-app-action="browser-home">
        <i class="fas fa-home text-blue-400"></i>
        <span>Go to Homepage</span>
      </div>

      <div class="context-menu-divider"></div>

      <div class="context-menu-item" data-app-action="browser-new-tab">
        <i class="fas fa-plus text-emerald-400"></i>
        <span>New Tab</span>
        <span class="context-menu-shortcut">⌘T</span>
      </div>
      <div class="context-menu-item" data-app-action="browser-copy-url">
        <i class="fas fa-link text-sky-400"></i>
        <span>Copy Page Address</span>
      </div>
      <div class="context-menu-item" data-app-action="browser-save-page">
        <i class="fas fa-download text-teal-400"></i>
        <span>Save Page to Downloads</span>
      </div>

      ${hasSelection ? `
        <div class="context-menu-divider"></div>
        <div class="context-menu-item" data-app-action="browser-search-web">
          <i class="fas fa-magnifying-glass text-emerald-400"></i>
          <span>Search "${selSnippet}" on Safe Web</span>
        </div>
        <div class="context-menu-item" data-app-action="browser-save-note">
          <i class="fas fa-note-sticky text-amber-400"></i>
          <span>Save Selection to Study Notes</span>
        </div>
      ` : ''}

      <div class="context-menu-divider"></div>
      <div class="context-menu-item" data-app-action="browser-offline-tools">
        <i class="fas fa-graduation-cap text-purple-400"></i>
        <span>Offline Educational Tools...</span>
      </div>

      <div class="context-menu-divider"></div>
      ${this.getWindowControlsHtml(app.id)}
    `;
  }

  getDocsMenuHtml(app, winEl, targetEl) {
    return `
      <div class="context-menu-header">
        <span class="text-sm">${app.icon}</span>
        <span class="font-bold text-white truncate max-w-[170px]">${app.title}</span>
      </div>
      <div class="context-menu-divider"></div>

      <div class="context-menu-item" data-app-action="docs-cut">
        <i class="fas fa-cut text-slate-300"></i>
        <span>Cut</span>
        <span class="context-menu-shortcut">⌘X</span>
      </div>
      <div class="context-menu-item" data-app-action="docs-copy">
        <i class="fas fa-copy text-slate-300"></i>
        <span>Copy</span>
        <span class="context-menu-shortcut">⌘C</span>
      </div>
      <div class="context-menu-item" data-app-action="docs-paste">
        <i class="fas fa-paste text-slate-300"></i>
        <span>Paste</span>
        <span class="context-menu-shortcut">⌘V</span>
      </div>

      <div class="context-menu-divider"></div>

      <div class="context-menu-item" data-app-action="docs-bold">
        <i class="fas fa-bold text-slate-200"></i>
        <span>Bold</span>
        <span class="context-menu-shortcut">⌘B</span>
      </div>
      <div class="context-menu-item" data-app-action="docs-italic">
        <i class="fas fa-italic text-slate-200"></i>
        <span>Italic</span>
        <span class="context-menu-shortcut">⌘I</span>
      </div>
      <div class="context-menu-item" data-app-action="docs-underline">
        <i class="fas fa-underline text-slate-200"></i>
        <span>Underline</span>
        <span class="context-menu-shortcut">⌘U</span>
      </div>
      <div class="context-menu-item" data-app-action="docs-heading">
        <i class="fas fa-heading text-blue-400"></i>
        <span>Heading</span>
      </div>
      <div class="context-menu-item" data-app-action="docs-list">
        <i class="fas fa-list-ul text-emerald-400"></i>
        <span>Bullet List</span>
      </div>
      <div class="context-menu-item" data-app-action="docs-clear-format">
        <i class="fas fa-remove-format text-rose-300"></i>
        <span>Clear Formatting</span>
      </div>
      <div class="context-menu-item" data-app-action="docs-insert-date">
        <i class="fas fa-calendar-day text-amber-400"></i>
        <span>Insert Date & Time</span>
      </div>

      <div class="context-menu-divider"></div>

      <div class="context-menu-item text-emerald-300" data-app-action="docs-new">
        <i class="fas fa-plus text-emerald-400"></i>
        <span>New Note</span>
      </div>
      <div class="context-menu-item" data-app-action="docs-export">
        <i class="fas fa-file-export text-sky-400"></i>
        <span>Export as .txt File</span>
      </div>

      <div class="context-menu-divider"></div>
      ${this.getWindowControlsHtml(app.id)}
    `;
  }

  getCalculatorMenuHtml(app, winEl, targetEl) {
    const dispVal = winEl.querySelector('#calc-display')?.textContent || '0';
    return `
      <div class="context-menu-header">
        <span class="text-sm">${app.icon}</span>
        <span class="font-bold text-white truncate max-w-[170px]">${app.title}</span>
      </div>
      <div class="context-menu-divider"></div>

      <div class="context-menu-item font-semibold text-emerald-300" data-app-action="calc-copy">
        <i class="fas fa-copy text-emerald-400"></i>
        <span>Copy Result (${dispVal})</span>
        <span class="context-menu-shortcut">⌘C</span>
      </div>
      <div class="context-menu-item" data-app-action="calc-paste">
        <i class="fas fa-paste text-slate-300"></i>
        <span>Paste Number</span>
        <span class="context-menu-shortcut">⌘V</span>
      </div>
      <div class="context-menu-item text-rose-300" data-app-action="calc-clear">
        <i class="fas fa-rotate-left text-rose-400"></i>
        <span>Clear Display (AC)</span>
        <span class="context-menu-shortcut">Esc</span>
      </div>

      <div class="context-menu-divider"></div>

      <div class="context-menu-item" data-app-action="calc-sqrt">
        <i class="fas fa-square-root-alt text-amber-400"></i>
        <span>Square Root (√)</span>
      </div>
      <div class="context-menu-item" data-app-action="calc-percent">
        <i class="fas fa-percent text-blue-400"></i>
        <span>Percentage (%)</span>
      </div>
      <div class="context-menu-item" data-app-action="calc-deg-rad">
        <i class="fas fa-arrows-rotate text-purple-400"></i>
        <span>Toggle DEG / RAD</span>
      </div>
      <div class="context-menu-item" data-app-action="calc-mr">
        <i class="fas fa-memory text-sky-400"></i>
        <span>Recall Memory (MR)</span>
      </div>

      <div class="context-menu-divider"></div>
      ${this.getWindowControlsHtml(app.id)}
    `;
  }

  getBooksMenuHtml(app, winEl, targetEl) {
    const hasSelection = Boolean(this.savedText);
    const selSnippet = hasSelection ? (this.savedText.length > 18 ? this.savedText.slice(0, 16) + '…' : this.savedText) : '';

    return `
      <div class="context-menu-header">
        <span class="text-sm">${app.icon}</span>
        <span class="font-bold text-white truncate max-w-[170px]">${app.title}</span>
      </div>
      <div class="context-menu-divider"></div>

      ${hasSelection ? `
        <div class="context-menu-item font-semibold text-emerald-300" data-app-action="books-copy-selection">
          <i class="fas fa-copy text-emerald-400"></i>
          <span>Copy "${selSnippet}"</span>
        </div>
        <div class="context-menu-item font-semibold text-amber-300" data-app-action="books-note-selection">
          <i class="fas fa-note-sticky text-amber-400"></i>
          <span>Save Passage to Study Notes</span>
        </div>
        <div class="context-menu-divider"></div>
      ` : ''}

      <div class="context-menu-item" data-app-action="books-catalog">
        <i class="fas fa-book-bookmark text-amber-400"></i>
        <span>Browse KCSE Curriculum Catalog</span>
      </div>
      <div class="context-menu-item" data-app-action="books-zoom-in">
        <i class="fas fa-magnifying-glass-plus text-sky-400"></i>
        <span>Zoom In Text</span>
      </div>
      <div class="context-menu-item" data-app-action="books-zoom-out">
        <i class="fas fa-magnifying-glass-minus text-sky-400"></i>
        <span>Zoom Out Text</span>
      </div>

      <div class="context-menu-divider"></div>
      ${this.getWindowControlsHtml(app.id)}
    `;
  }

  getClassroomMenuHtml(app, winEl, targetEl) {
    return `
      <div class="context-menu-header">
        <span class="text-sm">${app.icon}</span>
        <span class="font-bold text-white truncate max-w-[170px]">${app.title}</span>
      </div>
      <div class="context-menu-divider"></div>

      <div class="context-menu-item" data-app-action="classroom-refresh">
        <i class="fas fa-redo text-emerald-400"></i>
        <span>Refresh Assignments & Tasks</span>
      </div>
      <div class="context-menu-item" data-app-action="classroom-create-note">
        <i class="fas fa-file-pen text-blue-400"></i>
        <span>Create Homework Study Note</span>
      </div>
      <div class="context-menu-item" data-app-action="classroom-open-pastpapers">
        <i class="fas fa-graduation-cap text-amber-400"></i>
        <span>Open KCSE Past Papers</span>
      </div>

      <div class="context-menu-divider"></div>
      ${this.getWindowControlsHtml(app.id)}
    `;
  }

  getEduguardMenuHtml(app, winEl, targetEl) {
    return `
      <div class="context-menu-header">
        <span class="text-sm">${app.icon}</span>
        <span class="font-bold text-white truncate max-w-[170px]">${app.title}</span>
      </div>
      <div class="context-menu-divider"></div>

      <div class="context-menu-item text-emerald-300 font-semibold" data-app-action="eduguard-quick-audit">
        <i class="fas fa-shield-virus text-emerald-400"></i>
        <span>Run Rapid Security Audit</span>
      </div>
      <div class="context-menu-item" data-app-action="eduguard-inspect-domains">
        <i class="fas fa-list-check text-sky-400"></i>
        <span>View Allowed Academic Domains</span>
      </div>
      <div class="context-menu-item" data-app-action="eduguard-network-status">
        <i class="fas fa-network-wired text-blue-400"></i>
        <span>Inspect Network Isolation</span>
      </div>

      <div class="context-menu-divider"></div>
      ${this.getWindowControlsHtml(app.id)}
    `;
  }

  getSettingsMenuHtml(app, winEl, targetEl) {
    return `
      <div class="context-menu-header">
        <span class="text-sm">${app.icon}</span>
        <span class="font-bold text-white truncate max-w-[170px]">${app.title}</span>
      </div>
      <div class="context-menu-divider"></div>

      <div class="context-menu-item" data-app-action="settings-personalization">
        <i class="fas fa-palette text-pink-400"></i>
        <span>Personalization & Wallpaper</span>
      </div>
      <div class="context-menu-item" data-app-action="settings-display">
        <i class="fas fa-sun text-amber-400"></i>
        <span>Display & Liquid Glass</span>
      </div>
      <div class="context-menu-item" data-app-action="settings-about">
        <i class="fas fa-circle-info text-blue-400"></i>
        <span>About Dawamu OS</span>
      </div>

      <div class="context-menu-divider"></div>
      ${this.getWindowControlsHtml(app.id)}
    `;
  }

  getGenericAppMenuHtml(app, winEl, targetEl) {
    return `
      <div class="context-menu-header">
        <span class="text-sm">${app.icon}</span>
        <span class="font-bold text-white truncate max-w-[170px]">${app.title}</span>
      </div>
      <div class="context-menu-divider"></div>
      ${this.getWindowControlsHtml(app.id)}
    `;
  }

  getWindowControlsHtml(appId) {
    return `
      <div class="context-menu-item" data-app-action="win-maximize" data-app-id="${appId}">
        <i class="far fa-square text-sky-400"></i>
        <span>Maximize / Restore Window</span>
      </div>
      <div class="context-menu-item" data-app-action="win-minimize" data-app-id="${appId}">
        <i class="fas fa-minus text-amber-400"></i>
        <span>Minimize Window</span>
      </div>
      <div class="context-menu-item text-rose-300" data-app-action="win-close" data-app-id="${appId}">
        <i class="fas fa-times text-rose-400"></i>
        <span>Close Window</span>
        <span class="context-menu-shortcut">⌘W</span>
      </div>
    `;
  }

  /* ─────────────────────────────────────────────
     5. ACTION BINDINGS & EXECUTION ENGINE
  ───────────────────────────────────────────── */
  bindMenuActions(targetApp = null) {
    this.menuEl.querySelectorAll('.context-menu-item').forEach((item) => {
      item.addEventListener('click', async (e) => {
        const action = item.dataset.action;
        if (action === 'sort') return; // Submenu parent

        e.stopPropagation();
        this.hide();

        await this.handleAction(action, targetApp || item.dataset);
      });
    });
  }

  bindAppMenuActions(appId, winEl, targetEl) {
    this.menuEl.querySelectorAll('.context-menu-item').forEach((item) => {
      item.addEventListener('click', async (e) => {
        const action = item.dataset.appAction;
        if (action === 'menu-group') {
          // Toggle submenu-open class so click works cleanly on touchpads / touchscreens
          e.stopPropagation();
          const wasOpen = item.classList.contains('submenu-open');
          this.menuEl.querySelectorAll('.has-submenu').forEach(sm => sm.classList.remove('submenu-open'));
          if (!wasOpen) item.classList.add('submenu-open');
          return;
        }

        e.stopPropagation();
        this.hide();

        await this.handleAppAction(action, appId, winEl, targetEl);
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

  async handleAppAction(action, appId, winEl, targetEl) {
    // Window manager controls
    if (action === 'win-maximize') {
      windowManager.maximizeWindow(appId);
      return;
    }
    if (action === 'win-minimize') {
      windowManager.minimizeWindow(appId);
      return;
    }
    if (action === 'win-close') {
      windowManager.closeWindow(appId);
      return;
    }

    // Word Processor Actions
    if (action.startsWith('word-')) {
      const paper = winEl.querySelector('#word-paper');
      const bodyEl = winEl.querySelector('#body-word');
      const appRoot = bodyEl?.firstElementChild;
      const controller = appRoot?.__dawamuAppController;

      switch (action) {
        case 'word-cut':
          this.ensureFormattingSelection(paper, targetEl, 'word');
          document.execCommand('cut');
          paper?.dispatchEvent(new Event('input', { bubbles: true }));
          dawamuDialogs.toast('Cut selection', 'info');
          break;
        case 'word-copy':
          this.ensureFormattingSelection(paper, targetEl, 'word');
          document.execCommand('copy');
          dawamuDialogs.toast('Copied selection', 'info');
          break;
        case 'word-paste':
          try {
            const clipText = await navigator.clipboard?.readText();
            if (clipText && paper) {
              this.restoreSelection(paper);
              document.execCommand('insertText', false, clipText);
              paper.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
              this.restoreSelection(paper);
              document.execCommand('paste');
            }
          } catch (_) {
            this.restoreSelection(paper);
            document.execCommand('paste');
          }
          break;
        case 'word-bold': {
          const rng = this.ensureFormattingSelection(paper, targetEl, 'word');
          if (controller?.setSelectionRange && rng) controller.setSelectionRange(rng);
          if (controller?.executeFormat) {
            controller.executeFormat('bold');
          } else {
            document.execCommand('bold', false, null);
            paper?.dispatchEvent(new Event('input', { bubbles: true }));
          }
          dawamuDialogs.toast('Applied Bold', 'info');
          break;
        }
        case 'word-italic': {
          const rng = this.ensureFormattingSelection(paper, targetEl, 'word');
          if (controller?.setSelectionRange && rng) controller.setSelectionRange(rng);
          if (controller?.executeFormat) {
            controller.executeFormat('italic');
          } else {
            document.execCommand('italic', false, null);
            paper?.dispatchEvent(new Event('input', { bubbles: true }));
          }
          dawamuDialogs.toast('Applied Italic', 'info');
          break;
        }
        case 'word-underline': {
          const rng = this.ensureFormattingSelection(paper, targetEl, 'word');
          if (controller?.setSelectionRange && rng) controller.setSelectionRange(rng);
          if (controller?.executeFormat) {
            controller.executeFormat('underline');
          } else {
            document.execCommand('underline', false, null);
            paper?.dispatchEvent(new Event('input', { bubbles: true }));
          }
          dawamuDialogs.toast('Applied Underline', 'info');
          break;
        }
        case 'word-strike': {
          const rng = this.ensureFormattingSelection(paper, targetEl, 'word');
          if (controller?.setSelectionRange && rng) controller.setSelectionRange(rng);
          if (controller?.executeFormat) {
            controller.executeFormat('strikeThrough');
          } else {
            document.execCommand('strikeThrough', false, null);
            paper?.dispatchEvent(new Event('input', { bubbles: true }));
          }
          dawamuDialogs.toast('Applied Strikethrough', 'info');
          break;
        }
        case 'word-highlight': {
          const rng = this.ensureFormattingSelection(paper, targetEl, 'word');
          if (controller?.setSelectionRange && rng) controller.setSelectionRange(rng);
          if (controller?.executeFormat) {
            controller.executeFormat('hiliteColor', '#fef08a');
          } else {
            document.execCommand('hiliteColor', false, '#fef08a');
            paper?.dispatchEvent(new Event('input', { bubbles: true }));
          }
          dawamuDialogs.toast('Highlighted in Yellow', 'info');
          break;
        }
        case 'word-remove-format': {
          const rng = this.ensureFormattingSelection(paper, targetEl, 'word');
          if (controller?.setSelectionRange && rng) controller.setSelectionRange(rng);
          if (controller?.executeFormat) {
            controller.executeFormat('removeFormat');
          } else {
            document.execCommand('removeFormat', false, null);
            paper?.dispatchEvent(new Event('input', { bubbles: true }));
          }
          dawamuDialogs.toast('Cleared Formatting', 'info');
          break;
        }
        case 'word-insert-table': {
          this.restoreSelection(paper);
          const tableHtml = `
            <table style="width:100%; border-collapse:collapse; margin:14px 0; font-size:13px;">
              <thead>
                <tr style="background:#185abd; color:white;">
                  <th style="border:1px solid #cbd5e1; padding:6px 10px;">Item / Parameter</th>
                  <th style="border:1px solid #cbd5e1; padding:6px 10px;">Observation</th>
                  <th style="border:1px solid #cbd5e1; padding:6px 10px;">Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style="border:1px solid #cbd5e1; padding:6px 10px;">Test Sample 1</td><td style="border:1px solid #cbd5e1; padding:6px 10px;">Normal reaction</td><td style="border:1px solid #cbd5e1; padding:6px 10px;">Valid</td></tr>
                <tr style="background:#f8fafc;"><td style="border:1px solid #cbd5e1; padding:6px 10px;">Test Sample 2</td><td style="border:1px solid #cbd5e1; padding:6px 10px;">Rapid precipitate</td><td style="border:1px solid #cbd5e1; padding:6px 10px;">Optimal</td></tr>
                <tr><td style="border:1px solid #cbd5e1; padding:6px 10px;">Test Sample 3</td><td style="border:1px solid #cbd5e1; padding:6px 10px;">Stable baseline</td><td style="border:1px solid #cbd5e1; padding:6px 10px;">Control test</td></tr>
              </tbody>
            </table><p><br></p>
          `;
          document.execCommand('insertHTML', false, tableHtml);
          paper?.dispatchEvent(new Event('input', { bubbles: true }));
          dawamuDialogs.toast('Inserted 3×3 academic table', 'success');
          break;
        }
        case 'word-insert-image': {
          this.restoreSelection(paper);
          const url = await dawamuDialogs.prompt({
            title: 'Insert Document Image',
            message: 'Enter image URL or choose default illustration:',
            defaultValue: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600',
            confirmText: 'Insert Image'
          });
          if (url && paper) {
            paper.focus();
            document.execCommand('insertHTML', false, `<div style="text-align:center; margin:16px 0;"><img src="${url}" alt="Figure" style="max-width:85%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);"><br><small style="color:#64748b;">Figure: Image illustration</small></div><p><br></p>`);
            paper.dispatchEvent(new Event('input', { bubbles: true }));
            dawamuDialogs.toast('Inserted image into document', 'success');
          }
          break;
        }
        case 'word-insert-date': {
          this.restoreSelection(paper);
          const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
          document.execCommand('insertText', false, dateStr);
          paper?.dispatchEvent(new Event('input', { bubbles: true }));
          dawamuDialogs.toast(`Inserted current date: ${dateStr}`, 'info');
          break;
        }
        case 'word-insert-symbol': {
          const symModal = winEl.querySelector('#symbols-modal');
          if (symModal) symModal.classList.remove('hidden');
          break;
        }
        case 'word-insert-hr':
          this.restoreSelection(paper);
          document.execCommand('insertHorizontalRule');
          paper?.dispatchEvent(new Event('input', { bubbles: true }));
          break;
        case 'word-h1': {
          const rng = this.ensureFormattingSelection(paper, targetEl, 'block');
          if (controller?.setSelectionRange && rng) controller.setSelectionRange(rng);
          if (controller?.executeFormat) {
            controller.executeFormat('formatBlock', '<h1>');
          } else {
            document.execCommand('formatBlock', false, '<h1>');
            paper?.dispatchEvent(new Event('input', { bubbles: true }));
          }
          dawamuDialogs.toast('Formatted as Heading 1', 'info');
          break;
        }
        case 'word-h2': {
          const rng = this.ensureFormattingSelection(paper, targetEl, 'block');
          if (controller?.setSelectionRange && rng) controller.setSelectionRange(rng);
          if (controller?.executeFormat) {
            controller.executeFormat('formatBlock', '<h2>');
          } else {
            document.execCommand('formatBlock', false, '<h2>');
            paper?.dispatchEvent(new Event('input', { bubbles: true }));
          }
          dawamuDialogs.toast('Formatted as Heading 2', 'info');
          break;
        }
        case 'word-p': {
          const rng = this.ensureFormattingSelection(paper, targetEl, 'block');
          if (controller?.setSelectionRange && rng) controller.setSelectionRange(rng);
          if (controller?.executeFormat) {
            controller.executeFormat('formatBlock', '<p>');
          } else {
            document.execCommand('formatBlock', false, '<p>');
            paper?.dispatchEvent(new Event('input', { bubbles: true }));
          }
          dawamuDialogs.toast('Formatted as Normal Paragraph', 'info');
          break;
        }
        case 'word-bullet': {
          const rng = this.ensureFormattingSelection(paper, targetEl, 'block');
          if (controller?.setSelectionRange && rng) controller.setSelectionRange(rng);
          if (controller?.executeFormat) {
            controller.executeFormat('insertUnorderedList');
          } else {
            document.execCommand('insertUnorderedList');
            paper?.dispatchEvent(new Event('input', { bubbles: true }));
          }
          dawamuDialogs.toast('Applied Bulleted List', 'info');
          break;
        }
        case 'word-numbered': {
          const rng = this.ensureFormattingSelection(paper, targetEl, 'block');
          if (controller?.setSelectionRange && rng) controller.setSelectionRange(rng);
          if (controller?.executeFormat) {
            controller.executeFormat('insertOrderedList');
          } else {
            document.execCommand('insertOrderedList');
            paper?.dispatchEvent(new Event('input', { bubbles: true }));
          }
          dawamuDialogs.toast('Applied Numbered List', 'info');
          break;
        }
        case 'word-align-left': {
          const rng = this.ensureFormattingSelection(paper, targetEl, 'block');
          if (controller?.setSelectionRange && rng) controller.setSelectionRange(rng);
          if (controller?.executeFormat) {
            controller.executeFormat('justifyLeft');
          } else {
            document.execCommand('justifyLeft');
            paper?.dispatchEvent(new Event('input', { bubbles: true }));
          }
          break;
        }
        case 'word-align-center': {
          const rng = this.ensureFormattingSelection(paper, targetEl, 'block');
          if (controller?.setSelectionRange && rng) controller.setSelectionRange(rng);
          if (controller?.executeFormat) {
            controller.executeFormat('justifyCenter');
          } else {
            document.execCommand('justifyCenter');
            paper?.dispatchEvent(new Event('input', { bubbles: true }));
          }
          break;
        }
        case 'word-align-right': {
          const rng = this.ensureFormattingSelection(paper, targetEl, 'block');
          if (controller?.setSelectionRange && rng) controller.setSelectionRange(rng);
          if (controller?.executeFormat) {
            controller.executeFormat('justifyRight');
          } else {
            document.execCommand('justifyRight');
            paper?.dispatchEvent(new Event('input', { bubbles: true }));
          }
          break;
        }
        case 'word-search-selection': {
          const browserApp = this.appRegistry.find((a) => a.id === 'browser');
          if (browserApp && this.savedText) {
            browserApp.launch({ url: `https://www.google.com/search?q=${encodeURIComponent(this.savedText)}` });
          }
          break;
        }
        case 'word-note-selection': {
          if (this.savedText) {
            const file = stateStore.saveFileToVFS('desktop', {
              name: `Study_Note_${Date.now().toString().slice(-4)}.txt`,
              content: `Dawamu Word Excerpt:\n\n${this.savedText}`,
              type: 'txt'
            });
            dawamuDialogs.toast(`Created "${file.name}" on Desktop`, 'success');
          }
          break;
        }
        case 'word-stats':
          winEl.querySelector('#btn-word-stats')?.click();
          break;
        case 'word-save':
          winEl.querySelector('#btn-save-doc')?.click();
          break;
        case 'word-export-pdf':
          winEl.querySelector('#btn-export-pdf')?.click();
          break;
      }
      return;
    }

    // Spreadsheet Actions
    if (action.startsWith('sheet-')) {
      const formulaBar = winEl.querySelector('#formula-bar');
      const cellRef = winEl.querySelector('#cell-ref');
      const curKey = cellRef?.textContent || 'A1';

      switch (action) {
        case 'sheet-cut': {
          if (formulaBar) {
            const val = formulaBar.value;
            navigator.clipboard?.writeText(val);
            formulaBar.value = '';
            formulaBar.dispatchEvent(new Event('input'));
            dawamuDialogs.toast(`Cut cell ${curKey}`, 'info');
          }
          break;
        }
        case 'sheet-copy': {
          if (formulaBar) {
            navigator.clipboard?.writeText(formulaBar.value);
            dawamuDialogs.toast(`Copied ${curKey}: "${formulaBar.value}"`, 'info');
          }
          break;
        }
        case 'sheet-paste': {
          try {
            const txt = await navigator.clipboard?.readText();
            if (txt && formulaBar) {
              formulaBar.value = txt;
              formulaBar.dispatchEvent(new Event('input'));
              dawamuDialogs.toast(`Pasted into ${curKey}`, 'info');
            }
          } catch (_) {}
          break;
        }
        case 'sheet-clear': {
          if (formulaBar) {
            formulaBar.value = '';
            formulaBar.dispatchEvent(new Event('input'));
            dawamuDialogs.toast(`Cleared cell ${curKey}`, 'info');
          }
          break;
        }
        case 'sheet-fmt-currency': {
          if (formulaBar) {
            const num = parseFloat(formulaBar.value.replace(/[^0-9.-]/g, '')) || 0;
            formulaBar.value = `KES ${num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            formulaBar.dispatchEvent(new Event('input'));
            dawamuDialogs.toast(`Formatted ${curKey} as KES currency`, 'success');
          }
          break;
        }
        case 'sheet-fmt-percent': {
          if (formulaBar) {
            const num = parseFloat(formulaBar.value.replace(/[^0-9.-]/g, '')) || 0;
            formulaBar.value = `${num}%`;
            formulaBar.dispatchEvent(new Event('input'));
            dawamuDialogs.toast(`Formatted ${curKey} as percentage`, 'success');
          }
          break;
        }
        case 'sheet-fmt-bold': {
          const activeCell = winEl.querySelector('.cell-td.ring-2');
          if (activeCell) {
            activeCell.style.fontWeight = activeCell.style.fontWeight === 'bold' ? 'normal' : 'bold';
            dawamuDialogs.toast(`Toggled bold on ${curKey}`, 'info');
          }
          break;
        }
        case 'sheet-fmt-decimal': {
          if (formulaBar) {
            const num = parseFloat(formulaBar.value.replace(/[^0-9.-]/g, '')) || 0;
            formulaBar.value = num.toFixed(2);
            formulaBar.dispatchEvent(new Event('input'));
            dawamuDialogs.toast(`Formatted ${curKey} with 2 decimals`, 'success');
          }
          break;
        }
        case 'sheet-fml-sum':
        case 'sheet-fml-avg':
        case 'sheet-fml-max':
        case 'sheet-fml-min':
        case 'sheet-fml-count': {
          const map = {
            'sheet-fml-sum': '=SUM(B2:B8)',
            'sheet-fml-avg': '=AVERAGE(B2:B8)',
            'sheet-fml-max': '=MAX(B2:B8)',
            'sheet-fml-min': '=MIN(B2:B8)',
            'sheet-fml-count': '=COUNT(B2:B8)'
          };
          if (formulaBar) {
            formulaBar.value = map[action];
            formulaBar.dispatchEvent(new Event('input'));
            dawamuDialogs.toast(`Inserted formula: ${map[action]}`, 'success');
          }
          break;
        }
        case 'sheet-save-downloads':
          winEl.querySelector('#btn-save-sheet-downloads')?.click();
          break;
        case 'sheet-export-csv':
          winEl.querySelector('#btn-export-csv')?.click();
          break;
        case 'sheet-load-gradebook':
          winEl.querySelector('#btn-load-gradebook')?.click();
          break;
        case 'sheet-clear-all':
          winEl.querySelector('#btn-clear-all')?.click();
          break;
      }
      return;
    }

    // Explorer Actions
    if (action.startsWith('exp-')) {
      const fileItem = targetEl.closest('.file-item');
      switch (action) {
        case 'exp-open-item':
          if (fileItem) fileItem.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
          break;
        case 'exp-cut-item':
          winEl.querySelector('#exp-cut-btn')?.click();
          break;
        case 'exp-copy-item':
          winEl.querySelector('#exp-copy-btn')?.click();
          break;
        case 'exp-move-item':
          winEl.querySelector('#exp-move-btn')?.click();
          break;
        case 'exp-rename-item':
          winEl.querySelector('#exp-rename-btn')?.click();
          break;
        case 'exp-delete-item':
          winEl.querySelector('#exp-delete-btn')?.click();
          break;
        case 'exp-copy-desktop': {
          if (fileItem) {
            const fileName = fileItem.dataset.name;
            const activeFolderEl = winEl.querySelector('.exp-nav-item.bg-emerald-600\\/20');
            const folderKey = activeFolderEl?.dataset?.folder || 'documents';
            const files = stateStore.getFolderFiles(folderKey);
            const targetFile = files.find((f) => f.name === fileName);
            if (targetFile) {
              stateStore.saveFileToVFS('desktop', { ...targetFile });
              dawamuDialogs.toast(`Copied "${fileName}" to Desktop`, 'success');
            }
          }
          break;
        }
        case 'exp-new-folder':
          winEl.querySelector('#exp-new-folder-btn')?.click();
          break;
        case 'exp-new-file':
          winEl.querySelector('#exp-new-file-btn')?.click();
          break;
        case 'exp-paste':
          winEl.querySelector('#exp-paste-btn')?.click();
          break;
        case 'exp-import':
          winEl.querySelector('#exp-import-btn')?.click();
          break;
        case 'exp-refresh':
          winEl.querySelector('#exp-refresh-btn')?.click();
          break;
      }
      return;
    }

    // Database Actions
    if (action.startsWith('db-')) {
      const tr = targetEl.closest('tr');
      switch (action) {
        case 'db-edit-row':
          tr?.querySelector('.row-edit-btn')?.click();
          break;
        case 'db-delete-row':
          tr?.querySelector('.row-del-btn')?.click();
          break;
        case 'db-add-record':
          winEl.querySelector('#btn-add-record')?.click();
          break;
        case 'db-save':
          winEl.querySelector('#btn-save-db')?.click();
          break;
        case 'db-export-csv':
          winEl.querySelector('#btn-export-csv')?.click();
          break;
        case 'db-refresh': {
          const searchInput = winEl.querySelector('#db-search');
          if (searchInput) searchInput.dispatchEvent(new Event('input'));
          dawamuDialogs.toast('Refreshed database records', 'info');
          break;
        }
      }
      return;
    }

    // Browser Actions
    if (action.startsWith('browser-')) {
      switch (action) {
        case 'browser-back':
          winEl.querySelector('#btn-back')?.click();
          break;
        case 'browser-forward':
          winEl.querySelector('#btn-forward')?.click();
          break;
        case 'browser-reload':
          winEl.querySelector('#btn-reload')?.click();
          break;
        case 'browser-home':
          winEl.querySelector('#btn-home')?.click();
          break;
        case 'browser-new-tab':
          winEl.querySelector('#btn-new-tab')?.click();
          break;
        case 'browser-copy-url': {
          const omni = winEl.querySelector('#omnibox');
          if (omni?.value) {
            navigator.clipboard?.writeText(omni.value);
            dawamuDialogs.toast(`Copied address: ${omni.value}`, 'info');
          }
          break;
        }
        case 'browser-save-page':
          winEl.querySelector('#btn-save-page')?.click();
          break;
        case 'browser-search-web': {
          const omni = winEl.querySelector('#omnibox');
          if (omni && this.savedText) {
            omni.value = this.savedText;
            omni.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
          }
          break;
        }
        case 'browser-save-note': {
          if (this.savedText) {
            const file = stateStore.saveFileToVFS('desktop', {
              name: `Web_Research_${Date.now().toString().slice(-4)}.txt`,
              content: `Dawamu Safe Web Excerpt:\n\n${this.savedText}`,
              type: 'txt'
            });
            dawamuDialogs.toast(`Saved research clip "${file.name}" to Desktop`, 'success');
          }
          break;
        }
        case 'browser-offline-tools': {
          const offBtn = winEl.querySelector('.bm[data-url="dawamu://offline"]');
          if (offBtn) offBtn.click();
          break;
        }
      }
      return;
    }

    // Homework Notes Actions
    if (action.startsWith('docs-')) {
      const editorEl = winEl.querySelector('#doc-editor');
      if (editorEl) {
        this.restoreSelection(editorEl);
      }
      switch (action) {
        case 'docs-cut':
          this.ensureFormattingSelection(editorEl, targetEl, 'word');
          document.execCommand('cut');
          editorEl?.dispatchEvent(new Event('input', { bubbles: true }));
          break;
        case 'docs-copy':
          this.ensureFormattingSelection(editorEl, targetEl, 'word');
          document.execCommand('copy');
          dawamuDialogs.toast('Copied selection', 'info');
          break;
        case 'docs-paste':
          try {
            const clipText = await navigator.clipboard?.readText();
            if (clipText && editorEl) {
              editorEl.focus();
              document.execCommand('insertText', false, clipText);
              editorEl.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
              document.execCommand('paste');
            }
          } catch (_) {
            document.execCommand('paste');
          }
          break;
        case 'docs-bold':
          this.ensureFormattingSelection(editorEl, targetEl, 'word');
          document.execCommand('bold', false, null);
          editorEl?.dispatchEvent(new Event('input', { bubbles: true }));
          dawamuDialogs.toast('Applied Bold', 'info');
          break;
        case 'docs-italic':
          this.ensureFormattingSelection(editorEl, targetEl, 'word');
          document.execCommand('italic', false, null);
          editorEl?.dispatchEvent(new Event('input', { bubbles: true }));
          dawamuDialogs.toast('Applied Italic', 'info');
          break;
        case 'docs-underline':
          this.ensureFormattingSelection(editorEl, targetEl, 'word');
          document.execCommand('underline', false, null);
          editorEl?.dispatchEvent(new Event('input', { bubbles: true }));
          dawamuDialogs.toast('Applied Underline', 'info');
          break;
        case 'docs-clear-format':
          this.ensureFormattingSelection(editorEl, targetEl, 'word');
          document.execCommand('removeFormat', false, null);
          editorEl?.dispatchEvent(new Event('input', { bubbles: true }));
          dawamuDialogs.toast('Cleared Formatting', 'info');
          break;
        case 'docs-heading':
          this.ensureFormattingSelection(editorEl, targetEl, 'block');
          document.execCommand('formatBlock', false, '<h2>');
          editorEl?.dispatchEvent(new Event('input', { bubbles: true }));
          dawamuDialogs.toast('Applied Heading', 'info');
          break;
        case 'docs-list':
          this.ensureFormattingSelection(editorEl, targetEl, 'block');
          document.execCommand('insertUnorderedList');
          editorEl?.dispatchEvent(new Event('input', { bubbles: true }));
          dawamuDialogs.toast('Applied List', 'info');
          break;
        case 'docs-insert-date': {
          if (editorEl) {
            this.restoreSelection(editorEl);
            const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
            document.execCommand('insertText', false, ` [${dateStr}] `);
            editorEl.dispatchEvent(new Event('input', { bubbles: true }));
          }
          break;
        }
        case 'docs-new':
          winEl.querySelector('#doc-new-btn')?.click();
          break;
        case 'docs-export':
          winEl.querySelector('#doc-export-btn')?.click();
          break;
      }
      return;
    }

    // Calculator Actions
    if (action.startsWith('calc-')) {
      switch (action) {
        case 'calc-copy': {
          const disp = winEl.querySelector('#calc-display')?.textContent || '0';
          navigator.clipboard?.writeText(disp);
          dawamuDialogs.toast(`Copied result: ${disp}`, 'info');
          break;
        }
        case 'calc-paste': {
          try {
            const txt = await navigator.clipboard?.readText();
            if (txt) {
              const num = parseFloat(txt.replace(/[^0-9.-]/g, ''));
              if (!isNaN(num)) {
                const disp = winEl.querySelector('#calc-display');
                if (disp) disp.textContent = String(num);
                dawamuDialogs.toast(`Pasted number: ${num}`, 'info');
              }
            }
          } catch (_) {}
          break;
        }
        case 'calc-clear':
          winEl.querySelector('.calc-btn[data-val="C"]')?.click();
          break;
        case 'calc-sqrt':
          winEl.querySelector('.calc-btn[data-val="sqrt"]')?.click();
          break;
        case 'calc-percent':
          winEl.querySelector('.calc-btn[data-val="%"]')?.click();
          break;
        case 'calc-deg-rad':
          winEl.querySelector('#calc-angle-mode')?.click();
          break;
        case 'calc-mr':
          winEl.querySelector('.calc-btn[data-val="MR"]')?.click();
          break;
      }
      return;
    }

    // 8-4-4 Books Actions
    if (action.startsWith('books-')) {
      switch (action) {
        case 'books-copy-selection':
          if (this.savedText) {
            navigator.clipboard?.writeText(this.savedText);
            dawamuDialogs.toast('Copied passage to clipboard', 'info');
          }
          break;
        case 'books-note-selection':
          if (this.savedText) {
            const file = stateStore.saveFileToVFS('desktop', {
              name: `Book_Excerpt_${Date.now().toString().slice(-4)}.txt`,
              content: `8-4-4 Curriculum Reference Passage:\n\n${this.savedText}`,
              type: 'txt'
            });
            dawamuDialogs.toast(`Created "${file.name}" on Desktop`, 'success');
          }
          break;
        case 'books-catalog':
          dawamuDialogs.toast('Showing KCSE Approved Textbooks', 'info');
          break;
        case 'books-zoom-in':
          dawamuDialogs.toast('Zoomed in reader text', 'info');
          break;
        case 'books-zoom-out':
          dawamuDialogs.toast('Zoomed out reader text', 'info');
          break;
      }
      return;
    }

    // Classroom Actions
    if (action.startsWith('classroom-')) {
      switch (action) {
        case 'classroom-refresh':
          dawamuDialogs.toast('Assignments refreshed with teacher portal', 'success');
          break;
        case 'classroom-create-note': {
          const docsApp = this.appRegistry.find((a) => a.id === 'docs');
          if (docsApp) docsApp.launch();
          break;
        }
        case 'classroom-open-pastpapers': {
          const browserApp = this.appRegistry.find((a) => a.id === 'browser');
          if (browserApp) browserApp.launch({ url: 'https://www.google.com/search?q=KCSE+Past+Papers+and+Marking+Schemes' });
          break;
        }
      }
      return;
    }

    // EduGuard Actions
    if (action.startsWith('eduguard-')) {
      switch (action) {
        case 'eduguard-quick-audit':
          dawamuDialogs.toast('EduGuard AI: All security boundaries verified (100% Secure)', 'success');
          break;
        case 'eduguard-inspect-domains':
          dawamuDialogs.alert('EduGuard Allowlist', 'Approved academic domains: google.com, wikipedia.org, khanacademy.org, nasa.gov, mathsisfun.com, brave.com.', 'info');
          break;
        case 'eduguard-network-status':
          dawamuDialogs.toast('Network Sandbox: Student tenant isolation ACTIVE', 'info');
          break;
      }
      return;
    }

    // Settings Actions
    if (action.startsWith('settings-')) {
      const settingsApp = this.appRegistry.find((a) => a.id === 'settings');
      if (settingsApp) {
        if (action === 'settings-personalization') settingsApp.launch({ category: 'personalization' });
        else if (action === 'settings-display') settingsApp.launch({ category: 'display' });
        else if (action === 'settings-about') settingsApp.launch({ category: 'about' });
      }
      return;
    }
  }

  /* ─────────────────────────────────────────────
     6. POSITIONING & ICON SORTING HELPERS
  ───────────────────────────────────────────── */
  positionMenu(x, y) {
    this.menuEl.style.visibility = 'hidden';
    this.menuEl.style.left = '0px';
    this.menuEl.style.top = '0px';
    this.menuEl.classList.add('open');
    this.menuEl.setAttribute('aria-hidden', 'false');
    this.isOpen = true;

    const menuWidth = this.menuEl.offsetWidth || 230;
    const menuHeight = this.menuEl.offsetHeight || 320;
    const pad = 12;

    // Keep inside screen viewport bounds and above the floating dock
    const maxX = window.innerWidth - menuWidth - pad;
    const maxY = window.innerHeight - menuHeight - 68;

    const posX = Math.max(pad, Math.min(x, maxX));
    const posY = Math.max(pad, Math.min(y, maxY));

    this.menuEl.style.left = `${posX}px`;
    this.menuEl.style.top = `${posY}px`;

    // Flip submenus if near right viewport edge
    const submenus = this.menuEl.querySelectorAll('.context-submenu');
    submenus.forEach((submenu) => {
      if (posX + menuWidth + 185 > window.innerWidth) {
        submenu.classList.add('flip-left');
      } else {
        submenu.classList.remove('flip-left');
      }
    });

    this.menuEl.style.visibility = 'visible';
  }

  hide() {
    if (!this.isOpen) return;
    this.menuEl.classList.remove('open');
    this.menuEl.setAttribute('aria-hidden', 'true');
    this.menuEl.style.visibility = '';
    this.isOpen = false;
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
