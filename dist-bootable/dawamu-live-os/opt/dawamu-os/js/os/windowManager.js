/**
 * DawamuOS - Window Management System
 * Supports 60FPS dragging, 8-direction edge/corner resizing, double-click maximize,
 * focus stacking, smooth minimize/restore animations, and focus-mode restrictions.
 */

import { restrictionManager } from './restrictionManager.js';

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

    // If window already exists, restore and focus it!
    if (this.windows.has(id)) {
      const existing = this.windows.get(id);
      if (existing.minimized) {
        this.restoreWindow(id);
      }
      this.focusWindow(id);
      return existing;
    }

    // Compute default centered initial coordinates
    const desktopWidth = this.desktopEl.clientWidth || window.innerWidth;
    const desktopHeight = (this.desktopEl.clientHeight || window.innerHeight) - 54;

    const initialLeft = Math.max(20, Math.floor((desktopWidth - width) / 2) + (this.windows.size * 25) % 100);
    const initialTop = Math.max(20, Math.floor((desktopHeight - height) / 2) + (this.windows.size * 25) % 80);

    const winEl = document.createElement('div');
    winEl.className = 'cros-window focused cros-window-opening';
    winEl.id = `window-${id}`;
    winEl.style.width = `${width}px`;
    winEl.style.height = `${height}px`;
    winEl.style.left = `${initialLeft}px`;
    winEl.style.top = `${initialTop}px`;
    winEl.style.zIndex = ++this.highestZIndex;

    winEl.innerHTML = `
      <div class="window-header" id="header-${id}">
        <div class="window-title">
          <span class="app-header-icon">${icon}</span>
          <span class="window-title-text">${title}</span>
        </div>
        <div class="window-controls">
          <button class="win-btn minimize-btn" title="Minimize" data-action="minimize"><i class="fas fa-minus"></i></button>
          <button class="win-btn maximize-btn" title="Maximize/Restore" data-action="maximize"><i class="far fa-square"></i></button>
          <button class="win-btn close-btn" title="Close" data-action="close"><i class="fas fa-times"></i></button>
        </div>
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
      minHeight
    };

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
      if (winData.maximized) return; // Don't drag when maximized

      isDragging = true;
      element.classList.add('dragging');
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = parseInt(element.style.left, 10) || 0;
      initialTop = parseInt(element.style.top, 10) || 0;

      const onMouseMove = (moveEvent) => {
        if (!isDragging) return;
        if (dragRafId) return;

        dragRafId = requestAnimationFrame(() => {
          dragRafId = null;
          if (!isDragging) return;
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;

          const maxLeft = (this.desktopEl.clientWidth || window.innerWidth) - 80;
          const maxTop = (this.desktopEl.clientHeight || window.innerHeight) - 60;

          const newLeft = Math.max(-50, Math.min(maxLeft, initialLeft + dx));
          const newTop = Math.max(0, Math.min(maxTop, initialTop + dy));

          element.style.left = `${newLeft}px`;
          element.style.top = `${newTop}px`;
        });
      };

      const onMouseUp = () => {
        isDragging = false;
        element.classList.remove('dragging');
        if (dragRafId) {
          cancelAnimationFrame(dragRafId);
          dragRafId = null;
        }
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove, { passive: true });
      document.addEventListener('mouseup', onMouseUp, { passive: true });
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

        const onResizeMove = (moveEvt) => {
          if (resizeRafId) return;
          resizeRafId = requestAnimationFrame(() => {
            resizeRafId = null;
            const dx = moveEvt.clientX - startClientX;
            const dy = moveEvt.clientY - startClientY;
            const minW = minWidth || 380;
            const minH = minHeight || 270;
            const maxW = (this.desktopEl.clientWidth || window.innerWidth);
            const maxH = (this.desktopEl.clientHeight || window.innerHeight);

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
              const clampedW = Math.max(minW, startW - dx);
              newL = startL + (startW - clampedW);
              newW = clampedW;
            }
            if (dir.includes('t')) {
              const clampedH = Math.max(minH, startH - dy);
              newT = startT + (startH - clampedH);
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
          if (resizeRafId) {
            cancelAnimationFrame(resizeRafId);
            resizeRafId = null;
          }
          document.removeEventListener('mousemove', onResizeMove);
          document.removeEventListener('mouseup', onResizeUp);
        };

        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeUp);
      });
    });
  }

  focusWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

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
      this.activeWindowId = null;
    }
    this.notify();
  }

  restoreWindow(id) {
    this.focusWindow(id);
  }

  toggleMaximizeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.maximized = !win.maximized;
    if (win.maximized) {
      win.element.classList.add('maximized');
      win.element.querySelector('.maximize-btn i').className = 'far fa-clone';
    } else {
      win.element.classList.remove('maximized');
      win.element.querySelector('.maximize-btn i').className = 'far fa-square';
    }
    this.focusWindow(id);
  }

  closeWindow(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.element.remove();
    this.windows.delete(id);

    if (this.activeWindowId === id) {
      this.activeWindowId = null;
    }
    this.notify();
  }

  closeAllWindows() {
    this.windows.forEach((win) => {
      try {
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
