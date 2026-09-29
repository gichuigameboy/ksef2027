/**
 * Dawamu OS - Windows-Style File Explorer ("This PC / My Files")
 */

import { stateStore } from '../os/state.js';

export function createExplorerApp() {
  const root = document.createElement('div');
  root.className = 'flex flex-col h-full bg-[#191919] text-white font-sans select-none overflow-hidden';

  let currentFolder = 'documents';

  const fileSystem = {
    quickAccess: [
      { name: 'Desktop', icon: 'fas fa-desktop text-blue-400', type: 'folder', target: 'desktop' },
      { name: 'Downloads', icon: 'fas fa-arrow-down text-emerald-400', type: 'folder', target: 'downloads' },
      { name: 'Documents', icon: 'fas fa-folder text-amber-400', type: 'folder', target: 'documents' },
      { name: 'Pictures', icon: 'fas fa-images text-purple-400', type: 'folder', target: 'pictures' },
      { name: 'School Work', icon: 'fas fa-graduation-cap text-sky-400', type: 'folder', target: 'schoolwork' }
    ],
    drives: [
      { name: 'Local Disk (C:)', size: '256 GB (182 GB free)', icon: 'fas fa-hdd text-slate-300', target: 'c_drive' },
      { name: 'Dawamu Cloud Storage (D:)', size: '50 GB (44 GB free)', icon: 'fas fa-cloud text-emerald-400', target: 'cloud' }
    ],
    folders: {
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
    };

  function render() {
    const files = fileSystem.folders[currentFolder] || fileSystem.folders.documents;

    root.innerHTML = `
      <!-- Ribbon Bar (Windows Explorer Style) -->
      <div class="bg-[#202020] border-b border-[#2d2d2d] px-3 py-1.5 flex items-center justify-between shrink-0 text-xs">
        <div class="flex items-center gap-2">
          <button class="px-2.5 py-1 rounded bg-[#2b2b2b] hover:bg-[#333] text-white flex items-center gap-1.5 font-semibold text-xs transition-colors">
            <i class="fas fa-plus text-emerald-400 text-[10px]"></i> New Document
          </button>
          <button class="px-2.5 py-1 rounded hover:bg-[#2b2b2b] text-slate-300 hover:text-white flex items-center gap-1.5 text-xs transition-colors">
            <i class="fas fa-cut text-[10px]"></i> Cut
          </button>
          <button class="px-2.5 py-1 rounded hover:bg-[#2b2b2b] text-slate-300 hover:text-white flex items-center gap-1.5 text-xs transition-colors">
            <i class="fas fa-copy text-[10px]"></i> Copy
          </button>
          <button class="px-2.5 py-1 rounded hover:bg-[#2b2b2b] text-slate-300 hover:text-white flex items-center gap-1.5 text-xs transition-colors">
            <i class="fas fa-paste text-[10px]"></i> Paste
          </button>
        </div>
        <div class="text-[11px] text-slate-500 font-mono">Dawamu File Explorer v11</div>
      </div>

      <!-- Address Bar & Search -->
      <div class="bg-[#202020] border-b border-[#2d2d2d] px-3 py-1.5 flex items-center gap-2 shrink-0">
        <div class="flex items-center gap-1 text-slate-400">
          <button id="exp-back-btn" class="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-xs text-slate-300"><i class="fas fa-arrow-left"></i></button>
          <button id="exp-up-btn" class="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-xs text-slate-300"><i class="fas fa-arrow-up"></i></button>
          <button id="exp-refresh-btn" class="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-xs text-slate-300"><i class="fas fa-redo"></i></button>
        </div>

        <!-- Path Bar -->
        <div class="flex-1 bg-[#1a1a1a] border border-[#333] focus-within:border-emerald-500 rounded-md px-3 py-1 flex items-center gap-2 text-xs text-slate-200">
          <i class="fas fa-laptop text-emerald-400 text-xs"></i>
          <span class="text-slate-400">This PC</span>
          <span class="text-slate-600">></span>
          <span class="font-semibold capitalize text-white">${currentFolder}</span>
        </div>

        <!-- Search Input -->
        <div class="w-56 bg-[#1a1a1a] border border-[#333] focus-within:border-emerald-500 rounded-md px-2.5 py-1 flex items-center gap-2 text-xs">
          <i class="fas fa-search text-slate-500 text-xs"></i>
          <input id="exp-search" type="text" placeholder="Search ${currentFolder}..." class="bg-transparent outline-none text-xs text-white placeholder-slate-500 flex-1 min-w-0">
        </div>
      </div>

      <!-- Main Body (Sidebar + File View) -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Navigation Tree Sidebar -->
        <div class="w-48 bg-[#181818] border-r border-[#2d2d2d] p-2 space-y-4 overflow-y-auto text-xs shrink-0 select-none">
          <div>
            <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider px-2 mb-1">Quick Access</div>
            <div class="space-y-0.5">
              ${fileSystem.quickAccess.map(qa => `
                <div class="exp-nav-item flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${currentFolder === qa.target ? 'bg-[#2b2b2b] text-white font-semibold' : 'text-slate-300 hover:bg-white/5'}" data-folder="${qa.target}">
                  <i class="${qa.icon} w-4 text-center"></i>
                  <span class="truncate">${qa.name}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div>
            <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider px-2 mb-1">This PC</div>
            <div class="space-y-0.5">
              ${fileSystem.drives.map(d => `
                <div class="exp-nav-item flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${currentFolder === d.target ? 'bg-[#2b2b2b] text-white font-semibold' : 'text-slate-300 hover:bg-white/5'}" data-folder="${d.target}">
                  <i class="${d.icon} w-4 text-center"></i>
                  <span class="truncate">${d.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Files Content Grid -->
        <div class="flex-1 bg-[#141414] p-4 overflow-y-auto">
          <div class="grid grid-cols-4 gap-3" id="files-grid">
            ${files.map(f => `
              <div class="file-item p-3 rounded-xl bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col items-center text-center group" data-name="${f.name}">
                <div class="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
                  <i class="${f.icon}"></i>
                </div>
                <div class="text-xs font-semibold text-slate-200 line-clamp-2 w-full break-words group-hover:text-white">${f.name}</div>
                <div class="text-[10px] text-slate-500 mt-1">${f.size || 'Folder'}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Status Bar -->
      <div class="bg-[#1c1c1c] border-t border-[#2d2d2d] px-3 py-1 flex justify-between items-center text-[11px] text-slate-400 shrink-0 font-sans">
        <div>${files.length} items</div>
        <div class="text-[10px] text-slate-500">1 item selected | Safe Student Storage Area</div>
      </div>
    `;

    // Attach Click Events
    root.querySelectorAll('.exp-nav-item').forEach(el => {
      el.addEventListener('click', () => {
        currentFolder = el.dataset.folder;
        render();
      });
    });

    root.querySelectorAll('.file-item').forEach(el => {
      el.addEventListener('dblclick', () => {
        alert(`Opening ${el.dataset.name}...`);
      });
    });

    root.querySelector('#exp-refresh-btn')?.addEventListener('click', () => render());
  }

  render();
  return root;
}
