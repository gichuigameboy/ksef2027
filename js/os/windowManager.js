/**
 * DawamuOS - Window Management System
 * Supports 60FPS dragging, 8-direction edge/corner resizing, double-click maximize,
 * focus stacking, smooth minimize/restore animations, and focus-mode restrictions.
 */

import { restrictionManager } from './restrictionManager.js';
import { dawamuDialogs } from './dialogs.js';

class WindowManager {
  constructor() {
    this.windows = new Map(); // id -> window object
    this.highestZIndex = 100;
    this.activeWindowId = null;
    this.desktopEl = null;
    this.listeners = new Set();
  }

  init(desktopElement) {
    this.desktopEl = desktopElement;
    if (typeof window !== 'undefined' && !this._resizeListenerBound) {
      this._resizeListenerBound = true;
      window.addEventListener('resize', () => {
        this.clampWindowsToViewport();
      });
      document.addEventListener('fullscreenchange', () => {
        this.notify();
      });
    }
  }

  hasFullscreenWindow() {
    let hasMax = false;
    this.windows.forEach((w) => {
      if (!w.minimized && w.maximized) {
        hasMax = true;
      }
    });
    if (
      !hasMax &&
      typeof document !== 'undefined' &&
      document.fullscreenElement &&
      document.fullscreenElement !== document.documentElement &&
      document.fullscreenElement !== document.body
    ) {
      hasMax = true;
    }
    return hasMax;
  }

  clampWindowsToViewport() {
    if (!this.desktopEl) return;
    const desktopWidth = this.desktopEl.clientWidth || window.innerWidth;
    const desktopHeight = (this.desktopEl.clientHeight || window.innerHeight) - 68;
    this.windows.forEach((win) => {
      if (win.maximized || win.minimized) return;
      const el = win.element;
      const curW = el.offsetWidth;
      const curH = el.offsetHeight;
      const curL = parseInt(el.style.left, 10) || 0;
      const curT = parseInt(el.style.top, 10) || 0;

      if (curW > desktopWidth - 16) {
        el.style.width = `${Math.max(win.minWidth || 380, desktopWidth - 16)}px`;
      }
      if (curH > desktopHeight - 12) {
        el.style.height = `${Math.max(win.minHeight || 270, desktopHeight - 12)}px`;
      }
      if (curL > desktopWidth - 100) {
        el.style.left = `${Math.max(8, desktopWidth - Math.min(curW, desktopWidth - 16) - 8)}px`;
      }
      if (curT > desktopHeight - 48) {
        el.style.top = `${Math.max(8, desktopHeight - 60)}px`;
      }
    });
  }

  focusNextTopWindow() {
    let topWin = null;
    this.windows.forEach((w) => {
      if (!w.minimized) {
        if (!topWin || w.zIndex > topWin.zIndex) {
          topWin = w;
        }
      }
    });
    if (topWin) {
      this.focusWindow(topWin.id);
    } else {
      this.activeWindowId = null;
      this.notify();
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener(Array.from(this.windows.values())));
  }

  createWindow(options) {
    const { id, title, icon, content, width = 800, height = 550, minWidth = 380, minHeight = 270 } = options;

    // Focus Mode restriction check
    if (!restrictionManager.isAppAllowedInFocusMode(id)) {
      this.showFocusRestrictionAlert(title);
      return null;
    }

    // If window already exists, restore and focus it (and pass new file options if provided)!
    if (this.windows.has(id)) {
      const existing = this.windows.get(id);
      if (existing.minimized) {
        this.restoreWindow(id);
      }
      this.focusWindow(id);
      if (options.appOptions) {
        const bodyEl = existing.element.querySelector(`#body-${id}`);
        const appRoot = bodyEl?.firstElementChild;
        if (appRoot?.__dawamuAppController?.loadFromOptions) {
          appRoot.__dawamuAppController.loadFromOptions(options.appOptions);
        } else if (typeof content === 'function') {
          try {
            appRoot?.__dawamuAppController?.onDestroy?.();
            bodyEl.innerHTML = '';
            const res = content();
            if (res instanceof HTMLElement) bodyEl.appendChild(res);
          } catch (_) {}
        }
      }
      return existing;
    }

    // Compute default centered initial coordinates clamped to available desktop area
    const desktopWidth = this.desktopEl.clientWidth || window.innerWidth;
    const desktopHeight = Math.max(320, (this.desktopEl.clientHeight || window.innerHeight) - 72);

    const safeWidth = Math.max(minWidth, Math.min(width, desktopWidth - 24));
    const safeHeight = Math.max(minHeight, Math.min(height, desktopHeight - 16));

    const cascadeX = (this.windows.size * 24) % 96;
    const cascadeY = (this.windows.size * 22) % 66;
    const rawLeft = Math.floor((desktopWidth - safeWidth) / 2) + cascadeX;
    const rawTop = Math.floor((desktopHeight - safeHeight) / 2) + cascadeY;

    const initialLeft = Math.max(12, Math.min(desktopWidth - safeWidth - 12, rawLeft));
    const initialTop = Math.max(10, Math.min(desktopHeight - safeHeight - 8, rawTop));

    const winEl = document.createElement('div');
    winEl.className = 'cros-window focused cros-window-opening';
    winEl.id = `window-${id}`;
    winEl.style.width = `${safeWidth}px`;
    winEl.style.height = `${safeHeight}px`;
    winEl.style.left = `${initialLeft}px`;
    winEl.style.top = `${initialTop}px`;
    winEl.style.zIndex = ++this.highestZIndex;

    winEl.innerHTML = `
      <div class="window-header" id="header-${id}">
        <div class="window-controls">
          <button class="win-btn close-btn" title="Close" data-action="close"><i class="fas fa-times"></i></button>
          <button class="win-btn minimize-btn" title="Minimize" data-action="minimize"><i class="fas fa-minus"></i></button>
          <button class="win-btn maximize-btn" title="Maximize/Restore" data-action="maximize"><i class="far fa-square"></i></button>
        </div>
        <div class="window-title">
          <span class="app-header-icon">${icon}</span>
          <span class="window-title-text">${title}</span>
        </div>
        <div class="window-header-spacer" aria-hidden="true"></div>
      </div>
      <div class="window-body" id="body-${id}"></div>

      <!-- Edge & Corner Resize Handles -->
      <div class="win-resize-handle win-resize-r" data-dir="r"></div>
      <div class="win-resize-handle win-resize-b" data-dir="b"></div>
      <div class="win-resize-handle win-resize-l" data-dir="l"></div>
      <div class="win-resize-handle win-resize-t" data-dir="t"></div>
      <div class="win-resize-handle win-resize-br" data-dir="br" title="Resize window">
        <svg width="10" height="10" viewBox="0 0 10 10" class="resize-gripper">
          <path d="M8 2L2 8M8 5L5 8M8 8L8 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="win-resize-handle win-resize-bl" data-dir="bl"></div>
      <div class="win-resize-handle win-resize-tr" data-dir="tr"></div>
      <div class="win-resize-handle win-resize-tl" data-dir="tl"></div>
    `;

    // Append body content
    const bodyEl = winEl.querySelector(`#body-${id}`);
    if (typeof content === 'string') {
      bodyEl.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      bodyEl.appendChild(content);
    } else if (typeof content === 'function') {
      try {
        const res = content();
        if (res instanceof HTMLElement) {
          bodyEl.appendChild(res);
        } else if (typeof res === 'string') {
          bodyEl.innerHTML = res;
        }
      } catch (err) {
        console.error(`Failed to launch app ${id}:`, err);
        bodyEl.innerHTML = `<div class="p-6 text-rose-400 font-sans">Error launching application: ${err.message}</div>`;
      }
    }

    this.desktopEl.appendChild(winEl);

    // Remove opening scale transition class after first frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        winEl.classList.remove('cros-window-opening');
      });
    });

    const windowData = {
      id,
      title,
      icon,
      element: winEl,
      minimized: false,
      maximized: false,
      zIndex: this.highestZIndex,
      minWidth,
      minHeight,
      savedRect: { left: initialLeft, top: initialTop, width: safeWidth, height: safeHeight }
    };

    // Unfocus previous windows before setting new window focused
    this.windows.forEach((w) => {
      w.element.classList.remove('focused');
    });

    this.windows.set(id, windowData);
    this.activeWindowId = id;

    // Attach event listeners for window dragging, controls, resizing & focus
    this.setupWindowEvents(windowData);
    this.notify();

    return windowData;
  }

  setupWindowEvents(winData) {
    const { id, element, minWidth, minHeight } = winData;
    const header = element.querySelector(`#header-${id}`);

    // Focus on click
    element.addEventListener('mousedown', () => {
      this.focusWindow(id);
    });

    // Header Double-Click Maximize / Restore
    header.addEventListener('dblclick', (e) => {
      if (e.target.closest('.win-btn')) return;
      this.toggleMaximizeWindow(id);
    });

    // Control buttons
    header.addEventListener('click', (e) => {
      const btn = e.target.closest('.win-btn');
      if (!btn) return;
      const action = btn.dataset.action;

      if (action === 'minimize') this.minimizeWindow(id);
      if (action === 'maximize') this.toggleMaximizeWindow(id);
      if (action === 'close') this.closeWindow(id);
    });

    // ── Window Dragging Functionality (60 FPS requestAnimationFrame Optimized) ──
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;
    let dragRafId = null;

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.win-btn')) return;
      if (e.button !== 0) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = parseInt(element.style.left, 10) || 0;
      initialTop = parseInt(element.style.top, 10) || 0;

      if (!winData.maximized) {
        element.classList.add('dragging');
        document.body.classList.add('window-dragging-active');
      }

      const onMouseMove = (moveEvent) => {
        if (!isDragging) return;

        // Support drag-to-unmaximize when pulling a maximized window header
        if (winData.maximized) {
          const pullDist = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
          if (pullDist < 6) return;

          const desktopW = this.desktopEl.clientWidth || window.innerWidth;
          const restoredW = winData.savedRect?.width || Math.min(900, desktopW - 40);
          const restoredH = winData.savedRect?.height || 560;
          const ratio = Math.max(0.15, Math.min(0.85, moveEvent.clientX / desktopW));

          winData.maximized = false;
          element.classList.remove('maximized');
          const maxIcon = element.querySelector('.maximize-btn i');
          if (maxIcon) maxIcon.className = 'far fa-square';
          this.notify();

          initialLeft = Math.round(moveEvent.clientX - restoredW * ratio);
          initialTop = Math.max(8, moveEvent.clientY - 22);
          startX = moveEvent.clientX;
          startY = moveEvent.clientY;

          element.style.width = `${restoredW}px`;
          element.style.height = `${restoredH}px`;
          element.style.left = `${initialLeft}px`;
          element.style.top = `${initialTop}px`;
          element.classList.add('dragging');
          document.body.classList.add('window-dragging-active');
        }

        if (dragRafId) return;

        dragRafId = requestAnimationFrame(() => {
          dragRafId = null;
          if (!isDragging) return;
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;

          const maxLeft = (this.desktopEl.clientWidth || window.innerWidth) - 80;
          const maxTop = (this.desktopEl.clientHeight || window.innerHeight) - 76;

          const newLeft = Math.max(-50, Math.min(maxLeft, initialLeft + dx));
          const newTop = Math.max(0, Math.min(maxTop, initialTop + dy));

          element.style.left = `${newLeft}px`;
          element.style.top = `${newTop}px`;
        });
      };

      const onMouseUp = () => {
        isDragging = false;
        element.classList.remove('dragging');
        document.body.classList.remove('window-dragging-active');
        if (dragRafId) {
          cancelAnimationFrame(dragRafId);
          dragRafId = null;
        }
        if (!winData.maximized) {
          winData.savedRect = {
            left: parseInt(element.style.left, 10) || 0,
            top: parseInt(element.style.top, 10) || 0,
            width: element.offsetWidth,
            height: element.offsetHeight
          };
        }
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('blur', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove, { passive: true });
      document.addEventListener('mouseup', onMouseUp, { passive: true });
      window.addEventListener('blur', onMouseUp, { once: true });
    });

    // ── 8-Direction Resizing Functionality ──
    element.querySelectorAll('.win-resize-handle').forEach((handle) => {
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (winData.maximized) return;

        this.focusWindow(id);
        const dir = handle.dataset.dir;
        const startClientX = e.clientX;
        const startClientY = e.clientY;
        const startW = element.offsetWidth;
        const startH = element.offsetHeight;
        const startL = element.offsetLeft;
        const startT = element.offsetTop;
        let resizeRafId = null;

        element.classList.add('resizing');
        document.body.classList.add('window-dragging-active');

        const onResizeMove = (moveEvt) => {
          if (resizeRafId) return;
          resizeRafId = requestAnimationFrame(() => {
            resizeRafId = null;
            const dx = moveEvt.clientX - startClientX;
            const dy = moveEvt.clientY - startClientY;
            const minW = minWidth || 380;
            const minH = minHeight || 270;
            const maxW = (this.desktopEl.clientWidth || window.innerWidth);
            const maxH = (this.desktopEl.clientHeight || window.innerHeight) - 68;

            let newW = startW;
            let newH = startH;
            let newL = startL;
            let newT = startT;

            if (dir.includes('r')) {
              newW = Math.max(minW, Math.min(maxW - startL, startW + dx));
            }
            if (dir.includes('b')) {
              newH = Math.max(minH, Math.min(maxH - startT, startH + dy));
            }
            if (dir.includes('l')) {
              const clampedW = Math.max(minW, Math.min(startL + startW, startW - dx));
              newL = startL + (startW - clampedW);
              newW = clampedW;
            }
            if (dir.includes('t')) {
              const clampedH = Math.max(minH, Math.min(startT + startH, startH - dy));
              newT = Math.max(0, startT + (startH - clampedH));
              newH = clampedH;
            }

            element.style.width = `${newW}px`;
            element.style.height = `${newH}px`;
            element.style.left = `${newL}px`;
            element.style.top = `${newT}px`;
          });
        };

        const onResizeUp = () => {
          element.classList.remove('resizing');
          document.body.classList.remove('window-dragging-active');
          if (resizeRafId) {
            cancelAnimationFrame(resizeRafId);
            resizeRafId = null;
          }
          winData.savedRect = {
            left: parseInt(element.style.left, 10) || 0,
            top: parseInt(element.style.top, 10) || 0,
            width: element.offsetWidth,
            height: element.offsetHeight
          };
          document.removeEventListener('mousemove', onResizeMove);
          document.removeEventListener('mouseup', onResizeUp);
          window.removeEventListener('blur', onResizeUp);
        };

        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeUp);
        window.addEventListener('blur', onResizeUp, { once: true });
      });
    });
  }

  focusWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    // Close open system popovers when focusing an app window
    document.getElementById('launcher-overlay')?.classList.remove('open');
    document.getElementById('quick-settings-overlay')?.classList.remove('open');

    this.windows.forEach((w) => {
      w.element.classList.remove('focused');
    });

    win.element.classList.remove('minimized');
    win.element.classList.add('focused');
    win.minimized = false;
    win.zIndex = ++this.highestZIndex;
    win.element.style.zIndex = win.zIndex;

    this.activeWindowId = id;
    this.notify();
  }

  minimizeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.minimized = true;
    win.element.classList.add('minimized');
    win.element.classList.remove('focused');

    if (this.activeWindowId === id) {
      this.focusNextTopWindow();
    } else {
      this.notify();
    }
  }

  restoreWindow(id) {
    this.focusWindow(id);
  }

  toggleMaximizeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    if (!win.maximized) {
      win.savedRect = {
        left: parseInt(win.element.style.left, 10) || 20,
        top: parseInt(win.element.style.top, 10) || 20,
        width: win.element.offsetWidth,
        height: win.element.offsetHeight
      };
      win.maximized = true;
      win.element.classList.add('maximized');
      const maxIcon = win.element.querySelector('.maximize-btn i');
      if (maxIcon) maxIcon.className = 'far fa-clone';
      document.body?.classList.remove('dock-revealed');
      document.getElementById('shelf')?.classList.remove('dock-revealed');
    } else {
      win.maximized = false;
      win.element.classList.remove('maximized');
      if (win.savedRect) {
        win.element.style.left = `${win.savedRect.left}px`;
        win.element.style.top = `${win.savedRect.top}px`;
        win.element.style.width = `${win.savedRect.width}px`;
        win.element.style.height = `${win.savedRect.height}px`;
      }
      const maxIcon = win.element.querySelector('.maximize-btn i');
      if (maxIcon) maxIcon.className = 'far fa-square';
    }
    this.focusWindow(id);
  }

  async closeWindow(id, force = false) {
    const win = this.windows.get(id);
    if (!win) return false;

    const bodyEl = win.element.querySelector(`#body-${id}`);
    const appRoot = bodyEl?.firstElementChild;
    const controller = appRoot?.__dawamuAppController;

    if (!force && controller && typeof controller.isDirty === 'function' && controller.isDirty()) {
      const itemName = typeof controller.getTitle === 'function' ? controller.getTitle() : win.title;
      const choice = await dawamuDialogs.unsavedChanges({
        appName: win.title,
        itemName
      });

      if (choice === 'cancel') {
        return false;
      }
      if (choice === 'save') {
        if (typeof controller.saveNow === 'function') {
          await controller.saveNow({ silentToast: false });
        }
      } else if (choice === 'discard') {
        if (typeof controller.discardChanges === 'function') {
          controller.discardChanges();
        }
      }
    }

    try {
      controller?.onDestroy?.();
    } catch (_) {}

    win.element.remove();
    this.windows.delete(id);

    if (this.activeWindowId === id) {
      this.focusNextTopWindow();
    } else {
      this.notify();
    }
    return true;
  }

  closeAllWindows() {
    this.windows.forEach((win, id) => {
      try {
        const bodyEl = win.element.querySelector(`#body-${id}`);
        const appRoot = bodyEl?.firstElementChild;
        appRoot?.__dawamuAppController?.onDestroy?.();
        win.element.remove();
      } catch (_) {}
    });
    this.windows.clear();
    this.activeWindowId = null;
    this.notify();
  }

  showFocusRestrictionAlert(appTitle) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-6 left-1/2 -translate-x-1/2 bg-amber-600 text-white px-6 py-3 rounded-2xl shadow-2xl z-[99999] flex items-center gap-3 animate-bounce';
    toast.innerHTML = `<i class="fas fa-lock text-xl"></i> <div><div class="font-bold">Focus Mode Active</div><div class="text-xs text-amber-100">${appTitle} is blocked while Focus Mode is active. Focus on your homework!</div></div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
}

export const windowManager = new WindowManager();
