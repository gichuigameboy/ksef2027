/**
 * DawamuOS - Modern Dialogs, Modals & Toast Notification System
 * Replaces legacy native alert/confirm/prompt with accessible, glassmorphic UI components.
 */

class DialogManager {
  constructor() {
    this.toastContainer = null;
    this.activeToasts = new Set();
    this.modalContainer = null;
    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;

    // Toast container
    if (!document.getElementById('dawamu-toast-container')) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'dawamu-toast-container';
      this.toastContainer.className = 'fixed top-5 right-5 z-[999999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none font-sans';
      document.body.appendChild(this.toastContainer);
    } else {
      this.toastContainer = document.getElementById('dawamu-toast-container');
    }

    // Modal container
    if (!document.getElementById('dawamu-modal-container')) {
      this.modalContainer = document.createElement('div');
      this.modalContainer.id = 'dawamu-modal-container';
      this.modalContainer.className = 'fixed inset-0 z-[1000000] hidden items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none font-sans transition-all';
      document.body.appendChild(this.modalContainer);
    } else {
      this.modalContainer = document.getElementById('dawamu-modal-container');
    }
  }

  /**
   * Display a non-blocking toast notification.
   * @param {string} message 
   * @param {'info'|'success'|'warning'|'error'} type 
   * @param {number} duration ms
   */
  toast(message, type = 'info', duration = 3500) {
    if (!this.toastContainer) this.init();

    // Prevent identical duplicates stacking
    if (this.activeToasts.has(message)) return;
    this.activeToasts.add(message);

    const typeConfig = {
      success: {
        icon: 'fas fa-check-circle text-emerald-400',
        border: 'border-emerald-500/40',
        bg: 'bg-[#0f172a]/95 text-emerald-100',
        bar: 'bg-emerald-500'
      },
      error: {
        icon: 'fas fa-exclamation-circle text-rose-400',
        border: 'border-rose-500/40',
        bg: 'bg-[#0f172a]/95 text-rose-100',
        bar: 'bg-rose-500'
      },
      warning: {
        icon: 'fas fa-triangle-exclamation text-amber-400',
        border: 'border-amber-500/40',
        bg: 'bg-[#0f172a]/95 text-amber-100',
        bar: 'bg-amber-500'
      },
      info: {
        icon: 'fas fa-info-circle text-sky-400',
        border: 'border-sky-500/40',
        bg: 'bg-[#0f172a]/95 text-slate-100',
        bar: 'bg-sky-500'
      }
    };

    const cfg = typeConfig[type] || typeConfig.info;

    const toastEl = document.createElement('div');
    toastEl.className = `pointer-events-auto rounded-2xl border ${cfg.border} ${cfg.bg} p-3.5 shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all duration-300 translate-x-12 opacity-0 text-xs overflow-hidden relative`;
    toastEl.innerHTML = `
      <i class="${cfg.icon} text-base shrink-0 mt-0.5"></i>
      <div class="flex-1 font-medium leading-relaxed pr-2">${message}</div>
      <button class="toast-close text-slate-400 hover:text-white transition-colors p-1 -mr-1 -mt-1"><i class="fas fa-times text-xs"></i></button>
      <div class="toast-timer absolute bottom-0 left-0 right-0 h-0.5 ${cfg.bar} opacity-60"></div>
    `;

    // Cap at 4 visible toasts
    if (this.toastContainer.childElementCount >= 4) {
      const oldest = this.toastContainer.firstElementChild;
      if (oldest) oldest.remove();
    }

    this.toastContainer.appendChild(toastEl);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toastEl.classList.remove('translate-x-12', 'opacity-0');
    });

    let dismissTimeout;
    const dismiss = () => {
      clearTimeout(dismissTimeout);
      this.activeToasts.delete(message);
      toastEl.classList.add('translate-x-12', 'opacity-0');
      setTimeout(() => toastEl.remove(), 300);
    };

    toastEl.querySelector('.toast-close')?.addEventListener('click', dismiss);
    dismissTimeout = setTimeout(dismiss, duration);
  }

  /**
   * Accessible confirmation dialog (Promise<boolean>)
   */
  confirm(options = {}) {
    const {
      title = 'Confirm Action',
      message = 'Are you sure you want to proceed?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      type = 'primary' // 'primary' | 'danger'
    } = typeof options === 'string' ? { message: options } : options;

    return new Promise((resolve) => {
      if (!this.modalContainer) this.init();

      const isDanger = type === 'danger';
      const iconClass = isDanger ? 'fas fa-triangle-exclamation text-rose-400' : 'fas fa-question-circle text-emerald-400';
      const confirmBtnClass = isDanger
        ? 'bg-rose-600 hover:bg-rose-500 text-white font-semibold'
        : 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold';

      this.modalContainer.innerHTML = `
        <div class="bg-[#0f172a] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-left transition-all scale-95 opacity-0 modal-box">
          <div class="flex items-start gap-4 mb-4">
            <div class="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <i class="${iconClass} text-lg"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-white mb-1">${title}</h3>
              <p class="text-xs text-slate-300 leading-relaxed">${message}</p>
            </div>
          </div>
          <div class="flex justify-end gap-2.5 mt-6">
            <button id="modal-cancel-btn" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all cursor-pointer font-medium">
              ${cancelText}
            </button>
            <button id="modal-confirm-btn" class="px-4 py-2 rounded-xl text-xs transition-all cursor-pointer active:scale-95 ${confirmBtnClass}">
              ${confirmText}
            </button>
          </div>
        </div>
      `;

      this.modalContainer.classList.remove('hidden');
      this.modalContainer.classList.add('flex');

      const modalBox = this.modalContainer.querySelector('.modal-box');
      requestAnimationFrame(() => {
        modalBox.classList.remove('scale-95', 'opacity-0');
      });

      const confirmBtn = this.modalContainer.querySelector('#modal-confirm-btn');
      const cancelBtn = this.modalContainer.querySelector('#modal-cancel-btn');
      confirmBtn?.focus();

      const closeDialog = (result) => {
        document.removeEventListener('keydown', onKeyDown);
        this.modalContainer.classList.add('hidden');
        this.modalContainer.classList.remove('flex');
        this.modalContainer.innerHTML = '';
        resolve(result);
      };

      const onKeyDown = (e) => {
        if (e.key === 'Escape') closeDialog(false);
        if (e.key === 'Enter') closeDialog(true);
      };
      document.addEventListener('keydown', onKeyDown);

      confirmBtn?.addEventListener('click', () => closeDialog(true));
      cancelBtn?.addEventListener('click', () => closeDialog(false));
    });
  }

  /**
   * Accessible input prompt (Promise<string|null>)
   */
  prompt(options = {}) {
    const {
      title = 'Input Required',
      message = 'Please enter a value:',
      defaultValue = '',
      placeholder = 'Type here...',
      confirmText = 'Submit',
      cancelText = 'Cancel'
    } = typeof options === 'string' ? { message: options } : options;

    return new Promise((resolve) => {
      if (!this.modalContainer) this.init();

      this.modalContainer.innerHTML = `
        <div class="bg-[#0f172a] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-left transition-all scale-95 opacity-0 modal-box">
          <div class="flex items-start gap-4 mb-4">
            <div class="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <i class="fas fa-edit text-emerald-400 text-lg"></i>
            </div>
            <div class="flex-1">
              <h3 class="text-base font-bold text-white mb-1">${title}</h3>
              <p class="text-xs text-slate-300 leading-relaxed mb-3">${message}</p>
              <input id="modal-prompt-input" type="text" value="${defaultValue}" placeholder="${placeholder}"
                     class="w-full bg-[#080d16] border border-white/15 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none transition-all font-sans">
            </div>
          </div>
          <div class="flex justify-end gap-2.5 mt-6">
            <button id="modal-cancel-btn" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all cursor-pointer font-medium">
              ${cancelText}
            </button>
            <button id="modal-confirm-btn" class="px-4 py-2 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all cursor-pointer active:scale-95">
              ${confirmText}
            </button>
          </div>
        </div>
      `;

      this.modalContainer.classList.remove('hidden');
      this.modalContainer.classList.add('flex');

      const modalBox = this.modalContainer.querySelector('.modal-box');
      requestAnimationFrame(() => {
        modalBox.classList.remove('scale-95', 'opacity-0');
      });

      const input = this.modalContainer.querySelector('#modal-prompt-input');
      const confirmBtn = this.modalContainer.querySelector('#modal-confirm-btn');
      const cancelBtn = this.modalContainer.querySelector('#modal-cancel-btn');
      input?.focus();
      input?.select();

      const closeDialog = (val) => {
        document.removeEventListener('keydown', onKeyDown);
        this.modalContainer.classList.add('hidden');
        this.modalContainer.classList.remove('flex');
        this.modalContainer.innerHTML = '';
        resolve(val);
      };

      const onKeyDown = (e) => {
        if (e.key === 'Escape') closeDialog(null);
        if (e.key === 'Enter') closeDialog(input.value.trim());
      };
      document.addEventListener('keydown', onKeyDown);

      confirmBtn?.addEventListener('click', () => closeDialog(input.value.trim()));
      cancelBtn?.addEventListener('click', () => closeDialog(null));
    });
  }

  /**
   * Accessible alert dialog (Promise<void>)
   */
  alert(titleOrMessage, message, type = 'info') {
    const isSingleArg = !message;
    const actualTitle = isSingleArg ? 'Dawamu OS' : titleOrMessage;
    const actualMessage = isSingleArg ? titleOrMessage : message;

    return new Promise((resolve) => {
      if (!this.modalContainer) this.init();

      const typeConfig = {
        success: { icon: 'fas fa-check-circle text-emerald-400', btn: 'bg-emerald-600 hover:bg-emerald-500' },
        error: { icon: 'fas fa-circle-xmark text-rose-400', btn: 'bg-rose-600 hover:bg-rose-500' },
        warning: { icon: 'fas fa-triangle-exclamation text-amber-400', btn: 'bg-amber-600 hover:bg-amber-500' },
        info: { icon: 'fas fa-info-circle text-sky-400', btn: 'bg-sky-600 hover:bg-sky-500' }
      };

      const cfg = typeConfig[type] || typeConfig.info;

      this.modalContainer.innerHTML = `
        <div class="bg-[#0f172a] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-left transition-all scale-95 opacity-0 modal-box">
          <div class="flex items-start gap-4 mb-4">
            <div class="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <i class="${cfg.icon} text-lg"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-white mb-1">${actualTitle}</h3>
              <p class="text-xs text-slate-300 leading-relaxed">${actualMessage}</p>
            </div>
          </div>
          <div class="flex justify-end gap-2.5 mt-6">
            <button id="modal-alert-ok-btn" class="px-5 py-2 rounded-xl text-xs text-white font-semibold transition-all cursor-pointer active:scale-95 ${cfg.btn}">
              OK
            </button>
          </div>
        </div>
      `;

      this.modalContainer.classList.remove('hidden');
      this.modalContainer.classList.add('flex');

      const modalBox = this.modalContainer.querySelector('.modal-box');
      requestAnimationFrame(() => {
        modalBox.classList.remove('scale-95', 'opacity-0');
      });

      const okBtn = this.modalContainer.querySelector('#modal-alert-ok-btn');
      okBtn?.focus();

      const closeDialog = () => {
        document.removeEventListener('keydown', onKeyDown);
        this.modalContainer.classList.add('hidden');
        this.modalContainer.classList.remove('flex');
        this.modalContainer.innerHTML = '';
        resolve();
      };

      const onKeyDown = (e) => {
        if (e.key === 'Escape' || e.key === 'Enter') closeDialog();
      };
      document.addEventListener('keydown', onKeyDown);

      okBtn?.addEventListener('click', closeDialog);
    });
  }
}

export const dawamuDialogs = new DialogManager();

// Expose globally so all apps and scripts have immediate access
if (typeof window !== 'undefined') {
  window.dawamuDialogs = dawamuDialogs;
  window.dawamuToast = (msg, type, dur) => dawamuDialogs.toast(msg, type, dur);
}
