/**
 * Dawamu OS - Windows-Style File Explorer ("This PC / My Files")
 * Complete Implementation:
 * - Persistent per-student Virtual File System (VFS) via stateStore
 * - Navigable folders, custom subfolders, and drive hierarchies
 * - Drag-and-drop file/folder moving onto sidebar folders or grid folders
 * - "Move To..." modal, Cut, Copy, Paste, Rename, Delete, New Folder, New Document
 * - Working file-type associations with DawamuOS applications (Word, Sheets, Database, Docs, Offline Library)
 */

import { stateStore } from '../os/state.js';
import { dawamuDialogs } from '../os/dialogs.js';

export function createExplorerApp(options = {}) {
  const root = document.createElement('div');
  root.className = 'flex flex-col h-full bg-[#191919] text-white font-sans select-none overflow-hidden';

  let currentFolder = options.folderKey || 'documents';
  const historyStack = [currentFolder];
  let historyIndex = 0;
  let selectedFile = null;
  let clipboard = null; // { action: 'cut'|'copy', file, sourceFolder }
  let searchQuery = '';

  const QUICK_ACCESS_KEYS = ['desktop', 'downloads', 'documents', 'books844', 'schoolwork', 'pictures'];
  const DRIVE_ITEMS = [
    { name: 'Local Disk (C:)', size: '256 GB (182 GB free)', icon: 'fas fa-hdd text-slate-300', target: 'c_drive' },
    { name: 'Dawamu Cloud Storage (D:)', size: '50 GB (44 GB free)', icon: 'fas fa-cloud text-emerald-400', target: 'cloud' }
  ];

  async function loadRealDownloads() {
    if (window.electronAPI && typeof window.electronAPI.getDownloadedFiles === 'function') {
      try {
        const files = await window.electronAPI.getDownloadedFiles();
        if (files && files.length > 0) {
          files.forEach(f => {
            stateStore.saveFileToVFS('downloads', f);
          });
          if (currentFolder === 'downloads') {
            render();
          }
        }
      } catch (err) {
        console.error('Error fetching downloads in Explorer:', err);
      }
    }
  }

  loadRealDownloads();

  if (window.electronAPI && typeof window.electronAPI.onDownloadComplete === 'function') {
    window.electronAPI.onDownloadComplete(() => {
      loadRealDownloads();
    });
  }

  const onVfsUpdated = () => {
    // Re-sync selectedFile reference if still present
    if (selectedFile) {
      const files = stateStore.getFolderFiles(currentFolder);
      selectedFile = files.find(f => f.name === selectedFile.name) || null;
    }
    render();
  };
  window.addEventListener('dawamu-vfs-updated', onVfsUpdated);

  function navigateTo(folderKey) {
    if (!folderKey) return;
    if (currentFolder !== folderKey) {
      historyStack.splice(historyIndex + 1);
      historyStack.push(folderKey);
      historyIndex = historyStack.length - 1;
      currentFolder = folderKey;
      selectedFile = null;
      searchQuery = '';
      render();
    }
  }

  function goBack() {
    if (historyIndex > 0) {
      historyIndex--;
      currentFolder = historyStack[historyIndex];
      selectedFile = null;
      searchQuery = '';
      render();
    }
  }

  function goUp() {
    const meta = stateStore.getFolderMeta(currentFolder);
    const target = meta?.parent || 'documents';
    navigateTo(target);
  }

  function executeOpenFile(file) {
    if (!file) return;

    // 1. If it's a folder, navigate inside
    if (file.type === 'folder' || file.target) {
      navigateTo(file.target || 'documents');
      return;
    }

    // 2. Open via Dawamu OS Global handler with folder context
    if (window.dawamuOS?.openFile) {
      window.dawamuOS.openFile({ ...file, folderKey: file.folderKey || currentFolder });
      return;
    }
  }

  function render() {
    const vfs = stateStore.getVFS();
    const rawFiles = stateStore.getFolderFiles(currentFolder);
    const files = searchQuery.trim()
      ? rawFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
      : rawFiles;

    const currentMeta = stateStore.getFolderMeta(currentFolder);
    const canGoBack = historyIndex > 0;
    const customFolders = Object.values(vfs.folderMeta || {}).filter(m => m.isCustom);

    root.innerHTML = `
      <!-- Toolbar Ribbon -->
      <div class="bg-[#0f172a] border-b border-white/10 px-3 py-2 flex items-center justify-between shrink-0 text-xs flex-wrap gap-2">
        <div class="flex items-center gap-1.5 flex-wrap">
          <button id="exp-new-btn" class="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 font-semibold text-xs transition-all active:scale-95 cursor-pointer">
            <i class="fas fa-file-circle-plus text-emerald-400 text-[10px]"></i> New File
          </button>
          <button id="exp-new-folder-btn" class="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 font-semibold text-xs transition-all active:scale-95 cursor-pointer">
            <i class="fas fa-folder-plus text-amber-400 text-[10px]"></i> New Folder
          </button>
          <div class="h-4 w-[1px] bg-white/10 mx-0.5"></div>
          <button id="exp-cut-btn" class="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${!selectedFile ? 'opacity-40 pointer-events-none' : ''}">
            <i class="fas fa-cut text-[10px]"></i> Cut
          </button>
          <button id="exp-copy-btn" class="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${!selectedFile ? 'opacity-40 pointer-events-none' : ''}">
            <i class="fas fa-copy text-[10px]"></i> Copy
          </button>
          <button id="exp-paste-btn" class="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${!clipboard ? 'opacity-40 pointer-events-none' : ''}">
            <i class="fas fa-paste text-[10px]"></i> Paste ${clipboard ? `(${clipboard.file.name})` : ''}
          </button>
          <button id="exp-move-btn" class="px-2.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${!selectedFile ? 'opacity-40 pointer-events-none' : ''}">
            <i class="fas fa-people-arrows text-[10px]"></i> Move To...
          </button>
          <button id="exp-rename-btn" class="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${!selectedFile ? 'opacity-40 pointer-events-none' : ''}">
            <i class="fas fa-pen text-[10px]"></i> Rename
          </button>
          <button id="exp-delete-btn" class="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${!selectedFile ? 'opacity-40 pointer-events-none' : ''}">
            <i class="fas fa-trash-alt text-[10px]"></i> Delete
          </button>
        </div>
        <div class="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
          <i class="fas fa-shield-alt text-emerald-400"></i>
          <span>Dawamu Safe Storage (${stateStore.getState().currentUser?.admNo || 'Local'})</span>
        </div>
      </div>

      <!-- Navigation & Breadcrumb Bar -->
      <div class="bg-[#0b1320] border-b border-white/5 px-3 py-2 flex items-center gap-2.5 shrink-0">
        <div class="flex items-center gap-1 text-slate-400">
          <button id="exp-back-btn" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-xs text-slate-300 transition-all cursor-pointer ${!canGoBack ? 'opacity-40 cursor-not-allowed' : ''}" title="Back">
            <i class="fas fa-arrow-left"></i>
          </button>
          <button id="exp-up-btn" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-xs text-slate-300 transition-all cursor-pointer" title="Up to Parent Folder">
            <i class="fas fa-arrow-up"></i>
          </button>
          <button id="exp-refresh-btn" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-xs text-slate-300 transition-all cursor-pointer" title="Refresh">
            <i class="fas fa-redo"></i>
          </button>
        </div>

        <div class="flex-1 bg-[#0f172a] border border-white/10 focus-within:border-emerald-500 rounded-xl px-3.5 py-1.5 flex items-center gap-2 text-xs text-slate-200 transition-all">
          <i class="fas fa-laptop text-emerald-400 text-xs"></i>
          <span class="text-slate-400 hover:text-white cursor-pointer" id="bread-root">This PC</span>
          <span class="text-slate-600">&gt;</span>
          <span class="font-semibold text-emerald-300">${currentMeta.name}</span>
        </div>

        <div class="w-56 bg-[#0f172a] border border-white/10 focus-within:border-emerald-500 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs transition-all">
          <i class="fas fa-search text-slate-500 text-xs"></i>
          <input id="exp-search" type="text" value="${searchQuery}" placeholder="Search ${currentMeta.name}..." class="bg-transparent outline-none text-xs text-white placeholder-slate-500 flex-1 min-w-0">
        </div>
      </div>

      <!-- Main Container: Sidebar + File Grid -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar Navigation Tree -->
        <div class="w-56 bg-[#080d16] border-r border-white/5 p-3 space-y-4 overflow-y-auto text-xs shrink-0 select-none">
          <div>
            <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider px-2 mb-1.5">Quick Access (Drop Target)</div>
            <div class="space-y-1">
              ${QUICK_ACCESS_KEYS.map(k => {
                const qa = stateStore.getFolderMeta(k);
                return `
                  <div class="exp-nav-item flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all ${currentFolder === qa.key ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}" data-folder="${qa.key}">
                    <i class="${qa.icon} w-4 text-center"></i>
                    <span class="truncate">${qa.name}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          ${customFolders.length > 0 ? `
            <div>
              <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider px-2 mb-1.5">My Folders</div>
              <div class="space-y-1">
                ${customFolders.map(cf => `
                  <div class="exp-nav-item flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all ${currentFolder === cf.key ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}" data-folder="${cf.key}">
                    <i class="${cf.icon} w-4 text-center"></i>
                    <span class="truncate">${cf.name}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div>
            <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider px-2 mb-1.5">This PC Drives</div>
            <div class="space-y-1">
              ${DRIVE_ITEMS.map(d => `
                <div class="exp-nav-item flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all ${currentFolder === d.target ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}" data-folder="${d.target}">
                  <i class="${d.icon} w-4 text-center"></i>
                  <span class="truncate">${d.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Files & Folders Grid -->
        <div class="flex-1 bg-[#0b111c] p-5 overflow-y-auto" id="files-container">
          <div class="grid grid-cols-4 gap-3.5" id="files-grid">
            ${files.map((f, idx) => `
              <div class="file-item p-4 rounded-2xl ${selectedFile?.name === f.name ? 'bg-emerald-600/25 border-emerald-500/50 ring-1 ring-emerald-500/40' : 'bg-[#0f172a]/70 hover:bg-[#1e293b] border-white/5'} border hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col items-center text-center group shadow-sm hover:shadow-lg hover:-translate-y-0.5"
                   draggable="true"
                   data-idx="${idx}"
                   data-name="${f.name}"
                   data-type="${f.type || 'doc'}"
                   data-target-folder="${f.target || ''}">
                <div class="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl mb-2.5 group-hover:scale-110 transition-transform shadow-inner">
                  <i class="${f.icon || 'fas fa-file text-blue-400'}"></i>
                </div>
                <div class="text-xs font-semibold text-slate-200 line-clamp-2 w-full break-words group-hover:text-white">${f.name}</div>
                <div class="text-[10px] text-slate-500 mt-1">${f.size || (f.type === 'folder' ? 'Folder' : 'Document')} ${f.date ? `• ${f.date}` : ''}</div>
              </div>
            `).join('')}
            ${files.length === 0 ? `
              <div class="col-span-4 text-center py-16 text-slate-500 text-xs">
                <i class="fas fa-folder-open text-4xl mb-3 block text-slate-600"></i>
                <div class="font-bold text-slate-400 text-sm">This folder is empty</div>
                <div class="text-[11px] text-slate-500 mt-1">Click "New File", "New Folder", or drag/paste files here.</div>
              </div>` : ''}
          </div>
        </div>
      </div>

      <!-- Status Bar -->
      <div class="bg-[#080d16] border-t border-white/5 px-4 py-2 flex justify-between items-center text-[11px] text-slate-400 shrink-0 font-sans">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>${files.length} item${files.length === 1 ? '' : 's'}</span>
          ${selectedFile ? `<span class="border-l border-white/10 pl-2 text-emerald-300 font-medium">Selected: ${selectedFile.name}</span>` : ''}
        </div>
        <div class="text-[10px] text-slate-500">Drag &amp; drop items onto folders or sidebar • Double-click any item to open</div>
      </div>
    `;

    attachEvents();
  }

  function attachEvents() {
    // Sidebar nav items + drag-and-drop target
    root.querySelectorAll('.exp-nav-item').forEach(el => {
      const targetFolderKey = el.dataset.folder;
      el.addEventListener('click', () => {
        navigateTo(targetFolderKey);
      });

      el.addEventListener('dragover', (e) => {
        e.preventDefault();
        el.classList.add('ring-2', 'ring-emerald-400');
      });
      el.addEventListener('dragleave', () => {
        el.classList.remove('ring-2', 'ring-emerald-400');
      });
      el.addEventListener('drop', (e) => {
        e.preventDefault();
        el.classList.remove('ring-2', 'ring-emerald-400');
        const draggedName = e.dataTransfer?.getData('text/plain');
        if (draggedName && targetFolderKey && targetFolderKey !== currentFolder) {
          const ok = stateStore.moveItemInVFS(currentFolder, targetFolderKey, draggedName);
          if (ok) {
            const destMeta = stateStore.getFolderMeta(targetFolderKey);
            dawamuDialogs.toast(`Moved "${draggedName}" to ${destMeta.name}`, 'success');
          }
        }
      });
    });

    // History buttons
    root.querySelector('#exp-back-btn')?.addEventListener('click', goBack);
    root.querySelector('#exp-up-btn')?.addEventListener('click', goUp);
    root.querySelector('#bread-root')?.addEventListener('click', () => navigateTo('c_drive'));

    // Refresh
    root.querySelector('#exp-refresh-btn')?.addEventListener('click', () => {
      loadRealDownloads();
      render();
      dawamuDialogs.toast('Folder refreshed.', 'info');
    });

    // Search bar
    const searchInput = root.querySelector('#exp-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
        const reInput = root.querySelector('#exp-search');
        if (reInput) {
          reInput.focus();
          reInput.setSelectionRange(searchQuery.length, searchQuery.length);
        }
      });
    }

    // New File button
    root.querySelector('#exp-new-btn')?.addEventListener('click', async () => {
      const docName = await dawamuDialogs.prompt({
        title: 'Create New Document / File',
        message: 'Enter filename (.docx for Word, .xlsx for Sheets, .txt for Notes):',
        defaultValue: `New Document ${Date.now().toString().slice(-4)}.docx`,
        confirmText: 'Create & Open'
      });

      if (docName && docName.trim()) {
        let cleanName = docName.trim();
        if (!/\.[a-z0-9]+$/i.test(cleanName)) {
          cleanName += '.docx';
        }
        const savedFile = stateStore.saveFileToVFS(currentFolder, {
          name: cleanName,
          content: cleanName.endsWith('.xlsx') || cleanName.endsWith('.csv')
            ? 'Column A,Column B,Column C\n'
            : `<h1 style="color:#185abd;font-size:22px;font-weight:800;">${cleanName.replace(/\.[^/.]+$/, '')}</h1><p>Start writing your document here...</p>`
        });
        dawamuDialogs.toast(`Created "${savedFile.name}" in ${stateStore.getFolderMeta(currentFolder).name}`, 'success');
        executeOpenFile(savedFile);
      }
    });

    // New Folder button
    root.querySelector('#exp-new-folder-btn')?.addEventListener('click', async () => {
      const folderName = await dawamuDialogs.prompt({
        title: 'Create New Folder',
        message: `Enter a name for the new folder inside ${stateStore.getFolderMeta(currentFolder).name}:`,
        defaultValue: 'New Study Folder',
        confirmText: 'Create Folder'
      });

      if (folderName && folderName.trim()) {
        const created = stateStore.createFolderInVFS(currentFolder, folderName.trim());
        dawamuDialogs.toast(`Created folder "${created.name}"`, 'success');
        render();
      }
    });

    // Cut / Copy / Paste handlers
    root.querySelector('#exp-copy-btn')?.addEventListener('click', () => {
      if (selectedFile) {
        clipboard = { action: 'copy', file: { ...selectedFile }, sourceFolder: currentFolder };
        dawamuDialogs.toast(`Copied "${selectedFile.name}" to clipboard.`, 'info');
        render();
      }
    });

    root.querySelector('#exp-cut-btn')?.addEventListener('click', () => {
      if (selectedFile) {
        clipboard = { action: 'cut', file: { ...selectedFile }, sourceFolder: currentFolder };
        dawamuDialogs.toast(`Cut "${selectedFile.name}". Navigate to destination folder and click Paste.`, 'info');
        render();
      }
    });

    root.querySelector('#exp-paste-btn')?.addEventListener('click', () => {
      if (clipboard && clipboard.file) {
        if (clipboard.action === 'cut') {
          const ok = stateStore.moveItemInVFS(clipboard.sourceFolder, currentFolder, clipboard.file.name);
          if (ok) {
            dawamuDialogs.toast(`Moved "${clipboard.file.name}" to ${stateStore.getFolderMeta(currentFolder).name}.`, 'success');
            clipboard = null;
          }
        } else {
          const copied = stateStore.copyItemInVFS(clipboard.sourceFolder, currentFolder, clipboard.file.name);
          if (copied) {
            dawamuDialogs.toast(`Pasted "${copied.name}" into ${stateStore.getFolderMeta(currentFolder).name}.`, 'success');
          }
        }
        render();
      }
    });

    // Move To... button
    root.querySelector('#exp-move-btn')?.addEventListener('click', async () => {
      if (!selectedFile) return;
      const allFolders = stateStore.getAllFoldersList().filter(f => f.key !== currentFolder && f.key !== selectedFile.target);
      const res = await dawamuDialogs.chooseFolder({
        title: `Move "${selectedFile.name}"`,
        message: 'Select the destination folder to move this item into:',
        folders: allFolders,
        defaultFolder: 'downloads',
        showFileName: false,
        confirmText: 'Move Here'
      });
      if (res && res.folderKey) {
        const ok = stateStore.moveItemInVFS(currentFolder, res.folderKey, selectedFile.name);
        if (ok) {
          const destMeta = stateStore.getFolderMeta(res.folderKey);
          dawamuDialogs.toast(`Moved "${selectedFile.name}" to ${destMeta.name}`, 'success');
          selectedFile = null;
          render();
        }
      }
    });

    // Rename button
    root.querySelector('#exp-rename-btn')?.addEventListener('click', async () => {
      if (!selectedFile) return;
      const newName = await dawamuDialogs.prompt({
        title: 'Rename Item',
        message: `Enter a new name for "${selectedFile.name}":`,
        defaultValue: selectedFile.name,
        confirmText: 'Rename'
      });
      if (newName && newName.trim() && newName.trim() !== selectedFile.name) {
        stateStore.renameItemInVFS(currentFolder, selectedFile.name, newName.trim());
        dawamuDialogs.toast(`Renamed to "${newName.trim()}"`, 'success');
        selectedFile = null;
        render();
      }
    });

    // Delete button
    root.querySelector('#exp-delete-btn')?.addEventListener('click', async () => {
      if (!selectedFile) return;
      const ok = await dawamuDialogs.confirm({
        title: 'Delete Item',
        message: `Are you sure you want to delete "${selectedFile.name}" from ${stateStore.getFolderMeta(currentFolder).name}?`,
        confirmText: 'Delete',
        danger: true
      });
      if (ok) {
        const deletedName = selectedFile.name;
        stateStore.deleteItemInVFS(currentFolder, deletedName);
        selectedFile = null;
        dawamuDialogs.toast(`Deleted "${deletedName}"`, 'info');
        render();
      }
    });

    // File selection, double click, and drag-and-drop onto folder items
    const rawFiles = stateStore.getFolderFiles(currentFolder);
    const currentFiles = searchQuery.trim()
      ? rawFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
      : rawFiles;

    root.querySelectorAll('.file-item').forEach(el => {
      const idx = parseInt(el.dataset.idx, 10);
      const file = currentFiles[idx];
      if (!file) return;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedFile = file;
        render();
      });

      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        executeOpenFile(file);
      });

      el.addEventListener('dragstart', (e) => {
        e.dataTransfer?.setData('text/plain', file.name);
      });

      // If this grid card is a folder, allow dropping files onto it!
      if (file.type === 'folder' && file.target) {
        el.addEventListener('dragover', (e) => {
          e.preventDefault();
          el.classList.add('ring-2', 'ring-amber-400');
        });
        el.addEventListener('dragleave', () => {
          el.classList.remove('ring-2', 'ring-amber-400');
        });
        el.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          el.classList.remove('ring-2', 'ring-amber-400');
          const draggedName = e.dataTransfer?.getData('text/plain');
          if (draggedName && draggedName !== file.name) {
            const ok = stateStore.moveItemInVFS(currentFolder, file.target, draggedName);
            if (ok) {
              dawamuDialogs.toast(`Moved "${draggedName}" into folder "${file.name}"`, 'success');
            }
          }
        });
      }
    });

    // Click outside to deselect
    root.querySelector('#files-container')?.addEventListener('click', () => {
      if (selectedFile) {
        selectedFile = null;
        render();
      }
    });
  }

  root.__dawamuAppController = {
    loadFromOptions: (newOpts = {}) => {
      if (newOpts.folderKey) {
        navigateTo(newOpts.folderKey);
      }
    },
    onDestroy: () => {
      window.removeEventListener('dawamu-vfs-updated', onVfsUpdated);
    }
  };

  render();
  return root;
}
