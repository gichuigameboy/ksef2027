/**
 * ChromeOS Student Edition - Everything Button Launcher
 */

class Launcher {
  constructor() {
    this.overlayEl = null;
    this.apps = [];
  }

  init(overlayElement, appRegistry) {
    this.overlayEl = overlayElement;
    this.apps = appRegistry;

    this.render();
    this.attachEvents();
  }

  render() {
    this.overlayEl.innerHTML = `
      <div class="launcher-search">
        <i class="fas fa-search text-blue-400"></i>
        <input type="text" id="launcher-search-input" placeholder="Search your apps, web, and school files..." autocomplete="off">
      </div>

      <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 pt-2">
        School Applications
      </div>

      <div id="launcher-app-grid" class="app-grid">
        ${this.renderAppItems(this.apps)}
      </div>

      <div class="mt-auto border-t border-gray-700/50 pt-3 flex items-center justify-between text-xs text-gray-400 px-2">
        <span><i class="fas fa-graduation-cap text-blue-400 mr-1"></i> Student Chromebook Edition</span>
        <span>Managed by District Administrator</span>
      </div>
    `;
  }

  renderAppItems(appList) {
    if (appList.length === 0) {
      return `<div class="col-span-4 text-center py-8 text-gray-400 text-sm">No apps match your search query</div>`;
    }

    return appList
      .map(
        (app) => `
      <button class="app-grid-item" data-app-id="${app.id}">
        <div class="app-icon-lg ${app.bgColor || 'bg-blue-600'}">
          ${app.icon}
        </div>
        <span>${app.title}</span>
      </button>
    `
      )
      .join('');
  }

  attachEvents() {
    const searchInput = this.overlayEl.querySelector('#launcher-search-input');
    const appGrid = this.overlayEl.querySelector('#launcher-app-grid');

    // Realtime search filtering
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = this.apps.filter(
        (a) => a.title.toLowerCase().includes(q) || (a.keywords && a.keywords.some((k) => k.includes(q)))
      );
      appGrid.innerHTML = this.renderAppItems(filtered);
    });

    // App launch click handler
    appGrid.addEventListener('click', (e) => {
      const item = e.target.closest('.app-grid-item');
      if (!item) return;

      const appId = item.dataset.appId;
      const appData = this.apps.find((a) => a.id === appId);
      if (appData) {
        this.close();
        appData.launch();
      }
    });

    // Close launcher when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.overlayEl.contains(e.target) && !e.target.closest('#everything-btn')) {
        this.close();
      }
    });
  }

  close() {
    this.overlayEl.classList.remove('open');
  }
}

export const launcher = new Launcher();
