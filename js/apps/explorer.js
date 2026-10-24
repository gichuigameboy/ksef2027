/**
 * Dawamu OS - Windows-Style File Explorer ("This PC / My PC / My Files")
 * Complete Implementation with Comprehensive Drag-and-Drop:
 * - Persistent per-student Virtual File System (VFS) via stateStore
 * - Navigable folders, custom subfolders, and drive hierarchies
 * - Full Drag-and-Drop file import from host OS (Windows/Mac/Linux) into My PC
 * - Drag-and-drop file/folder moving or copying (with Ctrl key) onto sidebar folders, grid folders, and breadcrumbs
 * - Visual drop overlay & drop cues with animated indicators
 * - Clipboard paste (Ctrl+V) for external files, screenshots, and text notes
 * - "Import / Drop File" toolbar button with native file picker fallback
 * - "Move To..." modal, Cut, Copy, Paste, Rename, Delete (with Del key), New Folder, New Document
 * - Working file-type associations with DawamuOS applications (Word, Sheets, Database, Docs, Offline Library)
 */

import { stateStore, inferVFSFileIconAndType, readDroppedFile, formatFileSize } from '../os/state.js';
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
  let containerDragCounter = 0;

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

  // ── Drag & Drop Core Action: Import External Files into a VFS Folder ──
  async function handleExternalFilesDrop(fileList, targetFolderKey = currentFolder) {
    if (!fileList || fileList.length === 0) return;
    const destMeta = stateStore.getFolderMeta(targetFolderKey);
    const files = Array.from(fileList);
    let successCount = 0;
    let lastSaved = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const content = await readDroppedFile(file);
        const sizeFormatted = formatFileSize(file.size);
        const { type } = inferVFSFileIconAndType(file.name, file.type);
        const saved = stateStore.saveFileToVFS(targetFolderKey, {
          name: file.name,
          size: sizeFormatted,
          type: type,
          content: content,
          date: 'Imported just now'
        });
        lastSaved = saved;
        successCount++;

        if (window.electronAPI && typeof window.electronAPI.saveDownloadFile === 'function' && targetFolderKey === 'downloads') {
          window.electronAPI.saveDownloadFile({
            filename: file.name,
            content: typeof content === 'string' ? content : JSON.stringify(content)
          }).catch(() => {});
        }
      } catch (err) {
        console.error('Failed to import dropped file:', file.name, err);
      }
    }

    if (successCount === 1) {
      dawamuDialogs.toast(`Imported "${files[0].name}" into ${destMeta.name}`, 'success');
      if (targetFolderKey === currentFolder && lastSaved) {
        selectedFile = lastSaved;
      }
    } else if (successCount > 1) {
      dawamuDialogs.toast(`Imported ${successCount} files into ${destMeta.name}`, 'success');
    }

    if (targetFolderKey === currentFolder) {
      render();
    }
  }

  // ── Drag & Drop Core Action: Move or Copy Internal VFS Items ──
  function handleInternalDrop(draggedName, sourceFolder, targetFolderKey, isCopy = false) {
    if (!draggedName || !targetFolderKey) return;
    if (sourceFolder === targetFolderKey) {
      return;
    }
    const destMeta = stateStore.getFolderMeta(targetFolderKey);
    if (isCopy) {
      const copied = stateStore.copyItemInVFS(sourceFolder, targetFolderKey, draggedName);
      if (copied) {
        dawamuDialogs.toast(`Copied "${draggedName}" to ${destMeta.name}`, 'success');
        if (targetFolderKey === currentFolder) {
          selectedFile = copied;
          render();
        }
      }
    } else {
      const ok = stateStore.moveItemInVFS(sourceFolder, targetFolderKey, draggedName);
      if (ok) {
        dawamuDialogs.toast(`Moved "${draggedName}" to ${destMeta.name}`, 'success');
        if (targetFolderKey === currentFolder) {
          const files = stateStore.getFolderFiles(currentFolder);
          selectedFile = files.find(f => f.name === draggedName) || null;
        } else if (sourceFolder === currentFolder) {
          selectedFile = null;
        }
        render();
      }
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
          <label id="exp-upload-label" class="px-3 py-1.5 rounded-xl bg-sky-600/25 hover:bg-sky-600/40 border border-sky-500/30 text-sky-300 flex items-center gap-1.5 font-semibold text-xs transition-all active:scale-95 cursor-pointer" title="Import / drop files from your computer into this folder">
            <i class="fas fa-cloud-arrow-up text-sky-400 text-[10px]"></i> Import / Drop File
            <input type="file" id="exp-file-input" multiple class="hidden">
          </label>
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
          <button id="exp-up-btn" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-xs text-slate-300 transition-all cursor-pointer" title="Up to Parent Folder (Drag & drop target)">
            <i class="fas fa-arrow-up"></i>
          </button>
          <button id="exp-refresh-btn" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-xs text-slate-300 transition-all cursor-pointer" title="Refresh">
            <i class="fas fa-redo"></i>
          </button>
        </div>

        <div class="flex-1 bg-[#0f172a] border border-white/10 focus-within:border-emerald-500 rounded-xl px-3.5 py-1.5 flex items-center gap-2 text-xs text-slate-200 transition-all">
          <i class="fas fa-laptop text-emerald-400 text-xs"></i>
          <span class="text-slate-400 hover:text-white cursor-pointer transition-colors" id="bread-root" title="Click to go to Local Disk, or drop files here">This PC</span>
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
            <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider px-2 mb-1.5 flex items-center justify-between">
              <span>Quick Access</span>
              <span class="text-[9px] text-emerald-400/80 font-normal"><i class="fas fa-arrows-alt text-[8px]"></i> Drop Target</span>
            </div>
            <div class="space-y-1">
              ${QUICK_ACCESS_KEYS.map(k => {
                const qa = stateStore.getFolderMeta(k);
                return `
                  <div class="exp-nav-item flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all ${currentFolder === qa.key ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}" data-folder="${qa.key}" title="Drop files here to move or import into ${qa.name}">
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
                  <div class="exp-nav-item flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all ${currentFolder === cf.key ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}" data-folder="${cf.key}" title="Drop files here to move or import into ${cf.name}">
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
                <div class="exp-nav-item flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all ${currentFolder === d.target ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}" data-folder="${d.target}" title="Drop files here to move or import into ${d.name}">
                  <i class="${d.icon} w-4 text-center"></i>
                  <span class="truncate">${d.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Files & Folders Grid Area -->
        <div class="flex-1 bg-[#0b111c] p-5 overflow-y-auto relative" id="files-container">
          <!-- Visual Drop Overlay for External OS Files Drag-and-Drop -->
          <div id="exp-drop-overlay" class="hidden absolute inset-3 z-30 bg-[#061715]/95 backdrop-blur-md border-2 border-dashed border-emerald-400 rounded-2xl flex flex-col items-center justify-center pointer-events-none transition-all shadow-2xl">
            <div class="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mb-3 shadow-lg ring-1 ring-emerald-400/50 animate-bounce">
              <i class="fas fa-cloud-arrow-up"></i>
            </div>
            <div class="text-base font-bold text-white tracking-wide">Drop files to import into ${currentMeta.name}</div>
            <div class="text-xs text-emerald-300/80 mt-1">Accepts documents, spreadsheets, PDFs, code, notes, and media</div>
          </div>

          <div class="grid grid-cols-4 gap-3.5" id="files-grid">
            ${files.map((f, idx) => `
              <div class="file-item p-4 rounded-2xl ${selectedFile?.name === f.name ? 'bg-emerald-600/25 border-emerald-500/50 ring-1 ring-emerald-500/40' : 'bg-[#0f172a]/70 hover:bg-[#1e293b] border-white/5'} border hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col items-center text-center group shadow-sm hover:shadow-lg hover:-translate-y-0.5"
                   draggable="true"
                   data-idx="${idx}"
                   data-name="${f.name}"
                   data-type="${f.type || 'doc'}"
                   data-target-folder="${f.target || ''}"
                   title="${f.type === 'folder' ? `Folder: ${f.name} (Drag files onto this folder)` : `${f.name} • Double-click to open, drag to move/copy`}">
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
                <div class="text-[11px] text-slate-400 mt-1.5 flex items-center justify-center gap-1.5">
                  <i class="fas fa-cloud-arrow-up text-emerald-400"></i> Drag &amp; drop files from your computer here, or click "Import / Drop File" above.
                </div>
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
        <div class="text-[10px] text-slate-400 flex items-center gap-2">
          <span><i class="fas fa-arrows-up-down-left-right text-emerald-400"></i> Drag &amp; drop files from PC or between folders</span>
          <span class="text-slate-600">•</span>
          <span>Hold <kbd class="px-1 py-0.5 bg-white/10 rounded text-[9px] text-slate-300">Ctrl</kbd> to copy</span>
          <span class="text-slate-600">•</span>
          <span><kbd class="px-1 py-0.5 bg-white/10 rounded text-[9px] text-slate-300">Ctrl+V</kbd> to paste</span>
        </div>
      </div>
    `;

    attachEvents();
  }

  function attachEvents() {
    // ── 1. Sidebar Navigation Items + Drag-and-Drop Drop Target ──
    root.querySelectorAll('.exp-nav-item').forEach(el => {
      const targetFolderKey = el.dataset.folder;
      el.addEventListener('click', () => {
        navigateTo(targetFolderKey);
      });

      el.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = e.ctrlKey ? 'copy' : 'move';
        el.classList.add('ring-2', 'ring-emerald-400', 'bg-emerald-500/25');
      });
      el.addEventListener('dragleave', () => {
        el.classList.remove('ring-2', 'ring-emerald-400', 'bg-emerald-500/25');
      });
      el.addEventListener('drop', async (e) => {
        e.preventDefault();
        el.classList.remove('ring-2', 'ring-emerald-400', 'bg-emerald-500/25');

        // External files dropped onto a sidebar folder
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
          await handleExternalFilesDrop(e.dataTransfer.files, targetFolderKey);
          return;
        }

        // Internal file dragged onto sidebar folder
        const draggedJson = e.dataTransfer?.getData('application/json');
        let draggedInfo = null;
        try {
          if (draggedJson) draggedInfo = JSON.parse(draggedJson);
        } catch (_) {}

        const draggedName = draggedInfo?.name || e.dataTransfer?.getData('text/plain') || window.__dawamuDraggingItem?.name;
        const sourceFolder = draggedInfo?.sourceFolder || window.__dawamuDraggingItem?.sourceFolder || currentFolder;

        if (draggedName && targetFolderKey) {
          handleInternalDrop(draggedName, sourceFolder, targetFolderKey, e.ctrlKey || e.altKey);
        }
      });
    });

    // ── 2. Files Container Drag & Drop (External Files Drop Zone & Empty Area Drop) ──
    const filesContainer = root.querySelector('#files-container');
    const dropOverlay = root.querySelector('#exp-drop-overlay');

    if (filesContainer) {
      filesContainer.addEventListener('dragenter', (e) => {
        e.preventDefault();
        containerDragCounter++;
        const isExternal = (e.dataTransfer?.types && Array.from(e.dataTransfer.types).includes('Files')) || !window.__dawamuDraggingItem;
        if (isExternal && dropOverlay) {
          dropOverlay.classList.remove('hidden');
        }
      });

      filesContainer.addEventListener('dragleave', (e) => {
        e.preventDefault();
        containerDragCounter--;
        if (containerDragCounter <= 0) {
          containerDragCounter = 0;
          if (dropOverlay) dropOverlay.classList.add('hidden');
        }
      });

      filesContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = e.ctrlKey ? 'copy' : (window.__dawamuDraggingItem ? 'move' : 'copy');
        }
      });

      filesContainer.addEventListener('drop', async (e) => {
        e.preventDefault();
        containerDragCounter = 0;
        if (dropOverlay) dropOverlay.classList.add('hidden');

        // Case A: External files dropped into current folder
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
          await handleExternalFilesDrop(e.dataTransfer.files, currentFolder);
          return;
        }

        // Case B: Internal item dropped into empty space of folder
        const draggedJson = e.dataTransfer?.getData('application/json');
        let draggedInfo = null;
        try {
          if (draggedJson) draggedInfo = JSON.parse(draggedJson);
        } catch (_) {}

        const draggedName = draggedInfo?.name || e.dataTransfer?.getData('text/plain') || window.__dawamuDraggingItem?.name;
        const sourceFolder = draggedInfo?.sourceFolder || window.__dawamuDraggingItem?.sourceFolder;

        if (draggedName && sourceFolder && sourceFolder !== currentFolder) {
          handleInternalDrop(draggedName, sourceFolder, currentFolder, e.ctrlKey || e.altKey);
        }
      });
    }

    // ── 3. Breadcrumb & Up Button Drop Targets ──
    const upBtn = root.querySelector('#exp-up-btn');
    if (upBtn) {
      upBtn.addEventListener('click', goUp);
      upBtn.addEventListener('dragover', (e) => {
        e.preventDefault();
        upBtn.classList.add('ring-2', 'ring-emerald-400', 'bg-emerald-500/30');
      });
      upBtn.addEventListener('dragleave', () => {
        upBtn.classList.remove('ring-2', 'ring-emerald-400', 'bg-emerald-500/30');
      });
      upBtn.addEventListener('drop', async (e) => {
        e.preventDefault();
        upBtn.classList.remove('ring-2', 'ring-emerald-400', 'bg-emerald-500/30');
        const parentTarget = stateStore.getFolderMeta(currentFolder)?.parent || 'documents';

        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
          await handleExternalFilesDrop(e.dataTransfer.files, parentTarget);
          return;
        }

        const draggedName = e.dataTransfer?.getData('text/plain') || window.__dawamuDraggingItem?.name;
        const sourceFolder = window.__dawamuDraggingItem?.sourceFolder || currentFolder;
        if (draggedName) {
          handleInternalDrop(draggedName, sourceFolder, parentTarget, e.ctrlKey);
        }
      });
    }

    const breadRoot = root.querySelector('#bread-root');
    if (breadRoot) {
      breadRoot.addEventListener('click', () => navigateTo('c_drive'));
      breadRoot.addEventListener('dragover', (e) => {
        e.preventDefault();
        breadRoot.classList.add('text-emerald-300', 'underline');
      });
      breadRoot.addEventListener('dragleave', () => {
        breadRoot.classList.remove('text-emerald-300', 'underline');
      });
      breadRoot.addEventListener('drop', async (e) => {
        e.preventDefault();
        breadRoot.classList.remove('text-emerald-300', 'underline');
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
          await handleExternalFilesDrop(e.dataTransfer.files, 'c_drive');
          return;
        }
        const draggedName = e.dataTransfer?.getData('text/plain') || window.__dawamuDraggingItem?.name;
        const sourceFolder = window.__dawamuDraggingItem?.sourceFolder || currentFolder;
        if (draggedName) {
          handleInternalDrop(draggedName, sourceFolder, 'c_drive', e.ctrlKey);
        }
      });
    }

    // ── 4. History & Refresh Buttons ──
    root.querySelector('#exp-back-btn')?.addEventListener('click', goBack);
    root.querySelector('#exp-refresh-btn')?.addEventListener('click', () => {
      loadRealDownloads();
      render();
      dawamuDialogs.toast('Folder refreshed.', 'info');
    });

    // ── 5. Search Bar ──
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

    // ── 6. Import / Drop File Picker Input ──
    root.querySelector('#exp-file-input')?.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files.length > 0) {
        await handleExternalFilesDrop(e.target.files, currentFolder);
        e.target.value = '';
      }
    });

    // ── 7. New File Button ──
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

    // ── 8. New Folder Button ──
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

    // ── 9. Cut / Copy / Paste handlers ──
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

    const handlePasteClipboard = () => {
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
    };
    root.querySelector('#exp-paste-btn')?.addEventListener('click', handlePasteClipboard);

    // ── 10. Move To... button ──
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

    // ── 11. Rename button ──
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

    // ── 12. Delete button ──
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

    // ── 13. Grid Items: Selection, Double-Click, Drag Start & Folder Drop Target ──
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

      // Drag Start: Set payload and visual dragging style
      el.addEventListener('dragstart', (e) => {
        selectedFile = file;
        window.__dawamuDraggingItem = {
          name: file.name,
          sourceFolder: currentFolder,
          type: file.type,
          file
        };
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'copyMove';
          e.dataTransfer.setData('text/plain', file.name);
          e.dataTransfer.setData('application/json', JSON.stringify({
            name: file.name,
            sourceFolder: currentFolder,
            type: file.type
          }));
        }
        el.classList.add('opacity-40', 'scale-95', 'ring-2', 'ring-emerald-400');
      });

      el.addEventListener('dragend', () => {
        window.__dawamuDraggingItem = null;
        el.classList.remove('opacity-40', 'scale-95', 'ring-2', 'ring-emerald-400');
      });

      // If this grid card is a folder, allow dropping external files OR internal items onto it!
      if (file.type === 'folder' && file.target) {
        el.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer) {
            e.dataTransfer.dropEffect = e.ctrlKey ? 'copy' : 'move';
          }
          el.classList.add('ring-2', 'ring-amber-400', 'bg-amber-500/20', 'scale-105');
        });

        el.addEventListener('dragleave', (e) => {
          e.stopPropagation();
          el.classList.remove('ring-2', 'ring-amber-400', 'bg-amber-500/20', 'scale-105');
        });

        el.addEventListener('drop', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          el.classList.remove('ring-2', 'ring-amber-400', 'bg-amber-500/20', 'scale-105');

          // Case A: External files dropped onto subfolder
          if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            await handleExternalFilesDrop(e.dataTransfer.files, file.target);
            return;
          }

          // Case B: Internal item dragged into subfolder
          const draggedJson = e.dataTransfer?.getData('application/json');
          let draggedInfo = null;
          try {
            if (draggedJson) draggedInfo = JSON.parse(draggedJson);
          } catch (_) {}

          const draggedName = draggedInfo?.name || e.dataTransfer?.getData('text/plain') || window.__dawamuDraggingItem?.name;
          const sourceFolder = draggedInfo?.sourceFolder || window.__dawamuDraggingItem?.sourceFolder || currentFolder;

          if (draggedName && draggedName !== file.name) {
            handleInternalDrop(draggedName, sourceFolder, file.target, e.ctrlKey || e.altKey);
          }
        });
      }
    });

    // ── 14. Click Outside to Deselect ──
    root.querySelector('#files-container')?.addEventListener('click', () => {
      if (selectedFile) {
        selectedFile = null;
        render();
      }
    });

    // ── 15. Global Paste (Ctrl+V) & Delete Key Shortcuts in Explorer ──
    root.tabIndex = 0; // Focusable for key handling
    root.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'Delete' || e.key === 'Del') {
        if (selectedFile) {
          e.preventDefault();
          root.querySelector('#exp-delete-btn')?.click();
        }
      } else if (e.key === 'Escape') {
        if (selectedFile) {
          selectedFile = null;
          render();
        }
      }
    });

    root.addEventListener('paste', async (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      // 1. Files copied to clipboard (e.g. from OS file explorer or screenshot)
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        e.preventDefault();
        await handleExternalFilesDrop(e.clipboardData.files, currentFolder);
        return;
      }

      // 2. Internal cut/copy clipboard
      if (clipboard && clipboard.file) {
        e.preventDefault();
        handlePasteClipboard();
        return;
      }

      // 3. Plain text snippet
      const text = e.clipboardData?.getData('text/plain');
      if (text && text.trim()) {
        e.preventDefault();
        const snippetName = `Pasted_Note_${Date.now().toString().slice(-4)}.txt`;
        const saved = stateStore.saveFileToVFS(currentFolder, {
          name: snippetName,
          content: text,
          type: 'txt'
        });
        dawamuDialogs.toast(`Pasted text note as "${saved.name}"`, 'success');
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
      window.__dawamuDraggingItem = null;
    }
  };

  render();
  return root;
}
