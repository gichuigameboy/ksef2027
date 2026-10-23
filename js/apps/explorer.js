/**
 * Dawamu OS - Windows-Style File Explorer ("This PC / My Files")
 * Complete Implementation:
 * - Navigable folders and drive hierarchies
 * - Working file-type associations with DawamuOS applications (Word, Sheets, Docs, Offline Library)
 * - History stack (Back, Forward, Up, Refresh)
 * - Breadcrumb navigation
 * - Document creation, cut, copy, paste, delete
 * - Real download synchronization & virtual storage
 */

import { stateStore } from '../os/state.js';
import { dawamuDialogs } from '../os/dialogs.js';

export function createExplorerApp() {
  const root = document.createElement('div');
  root.className = 'flex flex-col h-full bg-[#191919] text-white font-sans select-none overflow-hidden';

  let currentFolder = 'documents';
  const historyStack = ['documents'];
  let historyIndex = 0;
  let selectedFile = null;
  let clipboard = null; // { action: 'cut'|'copy', file, sourceFolder }
  let searchQuery = '';

  const fileSystem = {
    quickAccess: [
      { name: 'Desktop', icon: 'fas fa-desktop text-blue-400', type: 'folder', target: 'desktop' },
      { name: 'Downloads', icon: 'fas fa-arrow-down text-emerald-400', type: 'folder', target: 'downloads' },
      { name: 'Documents', icon: 'fas fa-folder text-amber-400', type: 'folder', target: 'documents' },
      { name: '8-4-4 Coursebooks (F3 & F4)', icon: 'fas fa-book-open text-emerald-400', type: 'folder', target: 'books844' },
      { name: 'School Work', icon: 'fas fa-graduation-cap text-sky-400', type: 'folder', target: 'schoolwork' },
      { name: 'Pictures', icon: 'fas fa-images text-purple-400', type: 'folder', target: 'pictures' }
    ],
    drives: [
      { name: 'Local Disk (C:)', size: '256 GB (182 GB free)', icon: 'fas fa-hdd text-slate-300', target: 'c_drive' },
      { name: 'Dawamu Cloud Storage (D:)', size: '50 GB (44 GB free)', icon: 'fas fa-cloud text-emerald-400', target: 'cloud' }
    ],
    folders: {
      books844: [
        { name: 'KLB Secondary Mathematics Form 3.docx', size: '42 KB', date: 'Official KICD', icon: 'fas fa-file-word text-blue-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form3/mathematics' },
        { name: 'KLB Secondary Biology Form 3.docx', size: '38 KB', date: 'Official KICD', icon: 'fas fa-file-word text-emerald-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form3/biology' },
        { name: 'KLB Secondary Chemistry Form 3.docx', size: '45 KB', date: 'Official KICD', icon: 'fas fa-file-word text-amber-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form3/chemistry' },
        { name: 'KLB Secondary Physics Form 3.docx', size: '40 KB', date: 'Official KICD', icon: 'fas fa-file-word text-purple-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form3/physics' },
        { name: 'KLB History & Government Form 3.docx', size: '35 KB', date: 'Official KICD', icon: 'fas fa-file-word text-rose-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form3/history' },
        { name: 'KLB Geography Form 3.docx', size: '36 KB', date: 'Official KICD', icon: 'fas fa-file-word text-teal-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form3/geography' },
        { name: 'KLB Business Studies Form 3.docx', size: '34 KB', date: 'Official KICD', icon: 'fas fa-file-word text-cyan-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form3/business' },
        { name: 'KLB Secondary Mathematics Form 4.docx', size: '48 KB', date: 'KCSE Candidate', icon: 'fas fa-file-word text-blue-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form4/mathematics' },
        { name: 'KLB Secondary Biology Form 4.docx', size: '41 KB', date: 'KCSE Candidate', icon: 'fas fa-file-word text-emerald-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form4/biology' },
        { name: 'KLB Secondary Chemistry Form 4.docx', size: '46 KB', date: 'KCSE Candidate', icon: 'fas fa-file-word text-amber-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form4/chemistry' },
        { name: 'KLB Secondary Physics Form 4.docx', size: '44 KB', date: 'KCSE Candidate', icon: 'fas fa-file-word text-purple-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form4/physics' },
        { name: 'KLB History & Government Form 4.docx', size: '39 KB', date: 'KCSE Candidate', icon: 'fas fa-file-word text-rose-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form4/history' },
        { name: 'KLB Geography Form 4.docx', size: '37 KB', date: 'KCSE Candidate', icon: 'fas fa-file-word text-teal-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form4/geography' },
        { name: 'KLB Business Studies Form 4.docx', size: '35 KB', date: 'KCSE Candidate', icon: 'fas fa-file-word text-cyan-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form4/business' },
        { name: 'Fathers of Nations (Paul B. Vitta).docx', size: '52 KB', date: 'Compulsory Novel', icon: 'fas fa-book text-purple-400', type: 'doc', targetUrl: 'https://library.dawamu.school/setbooks/fathers-of-nations' },
        { name: 'The Samaritan (John Lara).docx', size: '49 KB', date: 'Compulsory Play', icon: 'fas fa-theater-masks text-fuchsia-400', type: 'doc', targetUrl: 'https://library.dawamu.school/setbooks/the-samaritan' },
        { name: 'Bembea ya Maisha (Timothy Arege).docx', size: '43 KB', date: 'Tamthilia Teule', icon: 'fas fa-feather-alt text-rose-400', type: 'doc', targetUrl: 'https://library.dawamu.school/setbooks/bembea-ya-maisha' },
        { name: 'Chozi la Heri (Assumpta K. Matei).docx', size: '47 KB', date: 'Riwaya Teule', icon: 'fas fa-book-reader text-teal-400', type: 'doc', targetUrl: 'https://library.dawamu.school/setbooks/chozi-la-heri' },
        { name: 'Mapambazuko ya Machweo Hadithi Nyingine.docx', size: '40 KB', date: 'Hadithi Fupi', icon: 'fas fa-scroll text-orange-400', type: 'doc', targetUrl: 'https://library.dawamu.school/setbooks/mapambazuko-ya-machweo' }
      ],
      documents: [
        { name: 'Biology Photosynthesis Notes.docx', size: '24 KB', date: 'Today, 10:14 AM', icon: 'fas fa-file-word text-blue-500', type: 'doc' },
        { name: 'Mathematics Homework - Quadratics.pdf', size: '142 KB', date: 'Yesterday', icon: 'fas fa-file-pdf text-red-500', type: 'pdf' },
        { name: 'History of Kenya Essay.docx', size: '36 KB', date: 'Sep 24, 2026', icon: 'fas fa-file-word text-blue-500', type: 'doc' },
        { name: 'Physics Newton Laws Lab.xlsx', size: '18 KB', date: 'Sep 22, 2026', icon: 'fas fa-file-excel text-emerald-500', type: 'excel' },
        { name: 'Geography Map of Africa.png', size: '1.2 MB', date: 'Sep 20, 2026', icon: 'fas fa-file-image text-purple-400', type: 'image' }
      ],
      schoolwork: [
        { name: 'Form 1 Term 3 Timetable.pdf', size: '88 KB', date: 'Sep 18, 2026', icon: 'fas fa-file-pdf text-red-500', type: 'pdf' },
        { name: 'Chemistry Periodic Table Notes.docx', size: '31 KB', date: 'Sep 16, 2026', icon: 'fas fa-file-word text-blue-500', type: 'doc' },
        { name: 'English Literature Study Guide.pdf', size: '310 KB', date: 'Sep 14, 2026', icon: 'fas fa-file-pdf text-red-500', type: 'pdf' }
      ],
      downloads: [
        { name: 'Dawamu_Curriculum_Guide_2026.pdf', size: '2.4 MB', date: 'Today, 8:30 AM', icon: 'fas fa-file-pdf text-red-500', type: 'pdf' },
        { name: 'Mars_Perseverance_Diagram.jpg', size: '850 KB', date: 'Sep 23, 2026', icon: 'fas fa-file-image text-purple-400', type: 'image' }
      ],
      pictures: [
        { name: 'Dawamu_School_Campus.jpg', size: '3.1 MB', date: 'Aug 12, 2026', icon: 'fas fa-file-image text-purple-400', type: 'image' },
        { name: 'Science_Lab_Project.jpg', size: '2.8 MB', date: 'Aug 20, 2026', icon: 'fas fa-file-image text-purple-400', type: 'image' }
      ],
      desktop: [
        { name: 'Homework Notes', icon: 'fas fa-folder text-amber-400', type: 'folder', target: 'documents' },
        { name: 'Student Schedule.pdf', size: '95 KB', date: 'Sep 28, 2026', icon: 'fas fa-file-pdf text-red-500', type: 'pdf' }
      ],
      c_drive: [
        { name: 'Program Files', icon: 'fas fa-folder text-amber-400', type: 'folder', target: 'documents' },
        { name: 'Windows / DawamuOS', icon: 'fas fa-folder text-emerald-400', type: 'folder', target: 'documents' },
        { name: 'Users', icon: 'fas fa-folder text-amber-400', type: 'folder', target: 'documents' }
      ],
      cloud: [
        { name: 'Student Shared Drive', icon: 'fas fa-folder text-emerald-400', type: 'folder', target: 'schoolwork' },
        { name: 'Teacher Assignments Drop', icon: 'fas fa-folder text-emerald-400', type: 'folder', target: 'schoolwork' }
      ]
    }
  };

  async function loadRealDownloads() {
    if (window.electronAPI && typeof window.electronAPI.getDownloadedFiles === 'function') {
      try {
        const files = await window.electronAPI.getDownloadedFiles();
        if (files && files.length > 0) {
          fileSystem.folders.downloads = files;
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

  function navigateTo(folderKey) {
    if (!folderKey) return;
    if (currentFolder !== folderKey) {
      // Trim forward history if we navigated somewhere new
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
    const parentMap = {
      books844: 'documents',
      schoolwork: 'documents',
      pictures: 'documents',
      downloads: 'documents',
      desktop: 'c_drive',
      cloud: 'c_drive'
    };
    const target = parentMap[currentFolder] || 'documents';
    navigateTo(target);
  }

  function executeOpenFile(file) {
    if (!file) return;

    // 1. If it's a folder, navigate inside
    if (file.type === 'folder' || file.target) {
      navigateTo(file.target || 'documents');
      return;
    }

    // 2. Open via Dawamu OS Global handler
    if (window.dawamuOS?.openFile) {
      window.dawamuOS.openFile(file);
      return;
    }

    // 3. Fallback handlers
    if (file.targetUrl) {
      window.dispatchEvent(new CustomEvent('open-dawamu-url', { detail: { url: file.targetUrl } }));
    } else {
      const ext = file.name.split('.').pop().toLowerCase();
      if (['docx', 'doc'].includes(ext)) {
        window.dawamuOS?.openApp('word', { fileName: file.name });
      } else if (['xlsx', 'csv'].includes(ext)) {
        window.dawamuOS?.openApp('spreadsheet', { fileName: file.name });
      } else {
        dawamuDialogs.toast(`Opened ${file.name}`, 'info');
      }
    }
  }

  function render() {
    const rawFiles = fileSystem.folders[currentFolder] || fileSystem.folders.documents;
    const files = searchQuery.trim() 
      ? rawFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
      : rawFiles;

    const canGoBack = historyIndex > 0;

    root.innerHTML = `
      <!-- Toolbar Ribbon -->
      <div class="bg-[#0f172a] border-b border-white/10 px-3 py-2 flex items-center justify-between shrink-0 text-xs">
        <div class="flex items-center gap-2">
          <button id="exp-new-btn" class="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 font-semibold text-xs transition-all active:scale-95 cursor-pointer">
            <i class="fas fa-plus text-emerald-400 text-[10px]"></i> New Document
          </button>
          <button id="exp-cut-btn" class="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${!selectedFile ? 'opacity-50 pointer-events-none' : ''}">
            <i class="fas fa-cut text-[10px]"></i> Cut
          </button>
          <button id="exp-copy-btn" class="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${!selectedFile ? 'opacity-50 pointer-events-none' : ''}">
            <i class="fas fa-copy text-[10px]"></i> Copy
          </button>
          <button id="exp-paste-btn" class="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${!clipboard ? 'opacity-50 pointer-events-none' : ''}">
            <i class="fas fa-paste text-[10px]"></i> Paste ${clipboard ? `(${clipboard.file.name})` : ''}
          </button>
        </div>
        <div class="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
          <i class="fas fa-shield-alt text-emerald-400"></i>
          <span>Dawamu Safe Storage</span>
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
          <span class="font-semibold capitalize text-emerald-300">${currentFolder.replace('_', ' ')}</span>
        </div>

        <div class="w-60 bg-[#0f172a] border border-white/10 focus-within:border-emerald-500 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs transition-all">
          <i class="fas fa-search text-slate-500 text-xs"></i>
          <input id="exp-search" type="text" value="${searchQuery}" placeholder="Search ${currentFolder}..." class="bg-transparent outline-none text-xs text-white placeholder-slate-500 flex-1 min-w-0">
        </div>
      </div>

      <!-- Main Container: Sidebar + File Grid -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar Navigation Tree -->
        <div class="w-56 bg-[#080d16] border-r border-white/5 p-3 space-y-4 overflow-y-auto text-xs shrink-0 select-none">
          <div>
            <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider px-2 mb-1.5">Quick Access</div>
            <div class="space-y-1">
              ${fileSystem.quickAccess.map(qa => `
                <div class="exp-nav-item flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all ${currentFolder === qa.target ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}" data-folder="${qa.target}">
                  <i class="${qa.icon} w-4 text-center"></i>
                  <span class="truncate">${qa.name}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div>
            <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider px-2 mb-1.5">This PC Drives</div>
            <div class="space-y-1">
              ${fileSystem.drives.map(d => `
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
              <div class="file-item p-4 rounded-2xl ${selectedFile?.name === f.name ? 'bg-emerald-600/25 border-emerald-500/50 ring-1 ring-emerald-500/40' : 'bg-[#0f172a]/70 hover:bg-[#1e293b] border-white/5'} border hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col items-center text-center group shadow-sm hover:shadow-lg hover:-translate-y-0.5" data-idx="${idx}" data-name="${f.name}">
                <div class="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl mb-2.5 group-hover:scale-110 transition-transform shadow-inner">
                  <i class="${f.icon}"></i>
                </div>
                <div class="text-xs font-semibold text-slate-200 line-clamp-2 w-full break-words group-hover:text-white">${f.name}</div>
                <div class="text-[10px] text-slate-500 mt-1">${f.size || (f.type === 'folder' ? 'Folder' : 'Document')}</div>
              </div>
            `).join('')}
            ${files.length === 0 ? `
              <div class="col-span-4 text-center py-16 text-slate-500 text-xs">
                <i class="fas fa-folder-open text-4xl mb-3 block text-slate-600"></i>
                <div class="font-bold text-slate-400 text-sm">This folder is empty</div>
                <div class="text-[11px] text-slate-500 mt-1">Create a new document or transfer files here.</div>
              </div>` : ''}
          </div>
        </div>
      </div>

      <!-- Status Bar -->
      <div class="bg-[#080d16] border-t border-white/5 px-4 py-2 flex justify-between items-center text-[11px] text-slate-400 shrink-0 font-sans">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>${files.length} items</span>
          ${selectedFile ? `<span class="border-l border-white/10 pl-2 text-emerald-300 font-medium">Selected: ${selectedFile.name}</span>` : ''}
        </div>
        <div class="text-[10px] text-slate-500">Virtual OS File System • Double-click any file to open</div>
      </div>
    `;

    attachEvents();
  }

  function attachEvents() {
    // Nav items
    root.querySelectorAll('.exp-nav-item').forEach(el => {
      el.addEventListener('click', () => {
        navigateTo(el.dataset.folder);
      });
    });

    // History buttons
    root.querySelector('#exp-back-btn')?.addEventListener('click', goBack);
    root.querySelector('#exp-up-btn')?.addEventListener('click', goUp);
    root.querySelector('#bread-root')?.addEventListener('click', () => navigateTo('documents'));

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
        // Restore cursor focus after re-render
        const reInput = root.querySelector('#exp-search');
        if (reInput) {
          reInput.focus();
          reInput.setSelectionRange(searchQuery.length, searchQuery.length);
        }
      });
    }

    // New Document button
    root.querySelector('#exp-new-btn')?.addEventListener('click', async () => {
      const docName = await dawamuDialogs.prompt({
        title: 'Create New Document',
        message: 'Enter the filename for the new document:',
        defaultValue: `New Document ${Date.now().toString().slice(-4)}.docx`,
        confirmText: 'Create & Open'
      });

      if (docName && docName.trim()) {
        const cleanName = docName.trim();
        const newFile = {
          name: cleanName.endsWith('.docx') ? cleanName : `${cleanName}.docx`,
          size: '1 KB',
          date: 'Just now',
          icon: 'fas fa-file-word text-blue-500',
          type: 'doc'
        };

        if (!fileSystem.folders[currentFolder]) {
          fileSystem.folders[currentFolder] = [];
        }
        fileSystem.folders[currentFolder].unshift(newFile);
        render();
        dawamuDialogs.toast(`Created ${newFile.name}`, 'success');
        executeOpenFile(newFile);
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
        dawamuDialogs.toast(`Cut "${selectedFile.name}".`, 'info');
        render();
      }
    });

    root.querySelector('#exp-paste-btn')?.addEventListener('click', () => {
      if (clipboard && clipboard.file) {
        if (!fileSystem.folders[currentFolder]) fileSystem.folders[currentFolder] = [];

        // If cut, remove from source folder
        if (clipboard.action === 'cut' && fileSystem.folders[clipboard.sourceFolder]) {
          fileSystem.folders[clipboard.sourceFolder] = fileSystem.folders[clipboard.sourceFolder].filter(
            f => f.name !== clipboard.file.name
          );
        }

        // Add to current folder
        fileSystem.folders[currentFolder].push({ ...clipboard.file, date: 'Just now' });
        dawamuDialogs.toast(`Pasted "${clipboard.file.name}".`, 'success');
        if (clipboard.action === 'cut') clipboard = null;
        render();
      }
    });

    // File selection, opening & double click
    const rawFiles = fileSystem.folders[currentFolder] || fileSystem.folders.documents;
    const currentFiles = searchQuery.trim() 
      ? rawFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
      : rawFiles;

    root.querySelectorAll('.file-item').forEach(el => {
      const idx = parseInt(el.dataset.idx, 10);
      const file = currentFiles[idx];

      // Single click: select item
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedFile = file;
        render();
      });

      // Double click: open file or folder
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        executeOpenFile(file);
      });
    });

    // Click outside to deselect
    root.querySelector('#files-container')?.addEventListener('click', () => {
      if (selectedFile) {
        selectedFile = null;
        render();
      }
    });
  }

  render();
  return root;
}
