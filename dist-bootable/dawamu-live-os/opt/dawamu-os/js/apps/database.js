/**
 * Dawamu OS - School Management Database App
 * Features:
 * - Complete CRUD (Create, Read, Update, Delete) across Students, Courses, and Library
 * - Persistent storage across sessions via localStorage (dawamu_school_db)
 * - Safe HTML escaping and validation
 * - Dynamic modals for Adding and Editing records
 * - Export to CSV
 * - Integration with Dawamu Dialogs
 */

import { stateStore } from '../os/state.js';
import { dawamuDialogs } from '../os/dialogs.js';

export function createDatabaseApp(options = {}) {
  const root = document.createElement('div');
  root.className = 'flex flex-col h-full bg-[#0f172a] text-white font-sans overflow-hidden select-none';

  const AUTO_SAVE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes (300,000 ms)
  let isDirty = false;
  let currentFolderKey = options.folderKey || 'documents';
  let currentFileName = options.fileName || 'Dawamu_School_Records.db.json';

  const DEFAULT_DB = {
    students: [
      { id: '1001', name: 'Brian Ochieng',     grade: 'Form 1', stream: 'East',  dob: '2012-03-14', parent: 'Mary Ochieng',    phone: '0712-345-678', status: 'Active' },
      { id: '1002', name: 'Kevin Mwangi',      grade: 'Form 1', stream: 'West',  dob: '2012-07-22', parent: 'John Mwangi',     phone: '0723-456-789', status: 'Active' },
      { id: '1003', name: 'Daniel Kiprop',     grade: 'Form 1', stream: 'East',  dob: '2012-01-08', parent: 'Grace Kiprop',    phone: '0734-567-890', status: 'Active' },
      { id: '1004', name: 'Samuel Otieno',     grade: 'Form 2', stream: 'South', dob: '2011-09-15', parent: 'Rose Otieno',     phone: '0745-678-901', status: 'Active' },
      { id: '1005', name: 'James Kamau',       grade: 'Form 2', stream: 'North', dob: '2011-05-20', parent: 'Peter Kamau',     phone: '0756-789-012', status: 'Active' },
      { id: '1006', name: 'Peter Wanjiru',     grade: 'Form 2', stream: 'South', dob: '2011-11-30', parent: 'Alice Wanjiru',   phone: '0767-890-123', status: 'Active' },
      { id: '1007', name: 'Victor Nyamweya',   grade: 'Form 3', stream: 'East',  dob: '2010-04-12', parent: 'David Nyamweya', phone: '0778-901-234', status: 'Active' },
      { id: '1008', name: 'Martin Kibet',      grade: 'Form 3', stream: 'West',  dob: '2010-08-25', parent: 'Susan Kibet',    phone: '0789-012-345', status: 'Active' },
      { id: '1009', name: 'Emmanuel Odhiambo', grade: 'Form 3', stream: 'North', dob: '2010-02-18', parent: 'Agnes Odhiambo', phone: '0790-123-456', status: 'Active' },
      { id: '1010', name: 'Dennis Mutua',      grade: 'Form 4', stream: 'East',  dob: '2009-06-07', parent: 'Lucy Mutua',     phone: '0701-234-567', status: 'Active' },
      { id: '1011', name: 'Collins Wekesa',    grade: 'Form 4', stream: 'West',  dob: '2009-10-19', parent: 'Mark Wekesa',    phone: '0712-345-890', status: 'Active' },
      { id: '1012', name: 'Patrick Njoroge',   grade: 'Form 4', stream: 'South', dob: '2009-12-03', parent: 'Jane Njoroge',   phone: '0723-456-901', status: 'Active' },
    ],
    courses: [
      { code: 'MAT101', name: 'Mathematics',     teacher: 'Mr. Omondi',   form: 'All',   hrs: 6, room: 'Lab A' },
      { code: 'ENG101', name: 'English',          teacher: 'Ms. Wangari',  form: 'All',   hrs: 5, room: 'Class 3' },
      { code: 'SWA101', name: 'Kiswahili',        teacher: 'Mr. Abubakar', form: 'All',   hrs: 4, room: 'Class 4' },
      { code: 'BIO201', name: 'Biology',          teacher: 'Dr. Kamau',    form: 'F2-F4', hrs: 5, room: 'Science Lab' },
      { code: 'CHE201', name: 'Chemistry',        teacher: 'Ms. Wanjiku',  form: 'F2-F4', hrs: 5, room: 'Chem Lab' },
      { code: 'PHY201', name: 'Physics',          teacher: 'Mr. Njoroge',  form: 'F2-F4', hrs: 5, room: 'Physics Lab' },
      { code: 'HIS101', name: 'History',          teacher: 'Ms. Atieno',   form: 'All',   hrs: 4, room: 'Class 5' },
      { code: 'GEO101', name: 'Geography',        teacher: 'Mr. Mutua',    form: 'All',   hrs: 4, room: 'Class 6' },
      { code: 'CRE101', name: 'C.R.E',            teacher: 'Rev. Odhiambo',form: 'All',   hrs: 3, room: 'Hall' },
      { code: 'CS101',  name: 'Computer Studies', teacher: 'Ms. Githuku',  form: 'All',   hrs: 4, room: 'ICT Lab' },
    ],
    library: [
      { isbn: '978-001', title: 'New KLB Mathematics Form 1',  author: 'KLB Publishers',     copies: 45, avail: 38, category: 'Textbook' },
      { isbn: '978-002', title: 'Oxford English Grammar',       author: 'Oxford Press',        copies: 30, avail: 22, category: 'Textbook' },
      { isbn: '978-003', title: 'Biology Today Form 3',         author: 'Longhorn',            copies: 35, avail: 29, category: 'Textbook' },
      { isbn: '978-004', title: 'Chemistry Practical Manual',   author: 'East Africa Pubs',    copies: 20, avail: 14, category: 'Lab Guide' },
      { isbn: '978-005', title: 'Romeo and Juliet',             author: 'William Shakespeare', copies: 25, avail: 20, category: 'Set Book' },
      { isbn: '978-006', title: 'A Grain of Wheat',             author: 'Ngugi wa Thiongo',    copies: 20, avail: 17, category: 'Set Book' },
      { isbn: '978-007', title: 'The Pearl',                    author: 'John Steinbeck',      copies: 18, avail: 15, category: 'Set Book' },
      { isbn: '978-008', title: 'Kenya History & Government',   author: 'Longhorn Kenya',      copies: 40, avail: 35, category: 'Textbook' },
      { isbn: '978-009', title: 'Computer Studies Practical',   author: 'East Africa Pubs',    copies: 22, avail: 18, category: 'Textbook' },
      { isbn: '978-010', title: 'Physics Simplified Form 4',    author: 'Storymoja',           copies: 28, avail: 23, category: 'Textbook' },
    ]
  };

  let DB = JSON.parse(JSON.stringify(DEFAULT_DB));
  let lastSavedSnapshot = null;

  const loadDB = () => {
    try {
      const rawFileData = typeof options.fileData === 'string'
        ? options.fileData
        : (typeof options.fileData?.content === 'string' ? options.fileData.content : null);
      if (rawFileData) {
        const parsed = JSON.parse(rawFileData);
        if (parsed && (Array.isArray(parsed.students) || Array.isArray(parsed.courses))) {
          DB = parsed;
        }
      } else {
        const savedWs = stateStore.getAppWorkspace('database', null);
        if (savedWs && (Array.isArray(savedWs.students) || Array.isArray(savedWs.courses))) {
          DB = JSON.parse(JSON.stringify(savedWs));
        }
      }
    } catch (_) {
      DB = JSON.parse(JSON.stringify(DEFAULT_DB));
    }
    lastSavedSnapshot = JSON.parse(JSON.stringify(DB));
  };

  loadDB();

  let activeTab = 'students';
  let searchQuery = '';
  let editingRecord = null; // null if adding new, object if editing

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  root.innerHTML = `
    <!-- Header -->
    <div class="bg-[#0f172a] border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 bg-blue-900/60 border border-blue-700/50 rounded-xl flex items-center justify-center text-blue-300 text-xl">
          <i class="fas fa-database"></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <div class="font-bold text-white text-sm">Dawamu School Database</div>
            <span id="db-save-status" class="text-[10px] bg-blue-950/90 text-blue-200 px-2.5 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1.5">
              <i class="fas fa-check-circle text-emerald-400"></i> Saved • Auto-Save (5m)
            </span>
          </div>
          <div class="text-[10px] text-slate-400">Student Records • Courses • Library Catalog</div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 bg-[#1e293b] border border-white/10 rounded-xl px-3 py-1.5">
          <i class="fas fa-search text-slate-500 text-xs"></i>
          <input id="db-search" type="text" placeholder="Search records..." class="bg-transparent outline-none text-xs text-white placeholder-slate-500 w-32">
        </div>
        <button id="btn-save-db" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer" title="Save Database (Ctrl+S)">
          <i class="fas fa-save text-[10px]"></i> Save DB
        </button>
        <button id="btn-save-db-downloads" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer" title="Save Database Snapshot to This PC > Downloads">
          <i class="fas fa-folder-plus text-[10px]"></i> Save to Downloads
        </button>
        <button id="btn-add-record" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer">
          <i class="fas fa-plus text-[10px]"></i> <span id="add-btn-label">Add Student</span>
        </button>
        <button id="btn-export-db" class="bg-[#1e293b] hover:bg-[#2d3748] border border-white/10 text-slate-300 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer">
          <i class="fas fa-download text-[10px]"></i> Export CSV
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-[#111827] border-b border-white/10 px-4 flex items-center shrink-0">
      <button class="db-tab px-5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer" data-tab="students">
        <i class="fas fa-users mr-1.5"></i>Students
        <span class="ml-1.5 bg-blue-900/60 text-blue-300 text-[9px] px-1.5 py-0.5 rounded-full" id="count-students"></span>
      </button>
      <button class="db-tab px-5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer" data-tab="courses">
        <i class="fas fa-book mr-1.5"></i>Courses
        <span class="ml-1.5 bg-purple-900/60 text-purple-300 text-[9px] px-1.5 py-0.5 rounded-full" id="count-courses"></span>
      </button>
      <button class="db-tab px-5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer" data-tab="library">
        <i class="fas fa-book-open mr-1.5"></i>Library
        <span class="ml-1.5 bg-amber-900/60 text-amber-300 text-[9px] px-1.5 py-0.5 rounded-full" id="count-library"></span>
      </button>
      <div class="ml-auto text-[10px] text-slate-400 self-center pr-2" id="record-count"></div>
    </div>

    <!-- Content Area -->
    <div id="db-content" class="flex-1 overflow-hidden select-text"></div>

    <!-- Dynamic Modal (Add / Edit) -->
    <div id="record-modal" class="hidden absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-[#1e293b] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
          <h3 id="modal-title" class="font-bold text-white text-sm flex items-center gap-2">
            <i class="fas fa-edit text-blue-400"></i> <span>Manage Record</span>
          </h3>
          <button id="close-modal" class="text-slate-400 hover:text-white transition-colors cursor-pointer"><i class="fas fa-times"></i></button>
        </div>
        <div id="modal-fields" class="space-y-3"></div>
        <div id="modal-error" class="text-rose-400 text-[11px] mt-2 hidden"></div>
        <div class="flex gap-3 mt-5">
          <button id="modal-save" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer">Save Record</button>
          <button id="modal-cancel" class="flex-1 bg-[#0f172a] hover:bg-[#1e293b] border border-white/10 text-slate-300 text-xs py-2.5 rounded-xl transition-all cursor-pointer">Cancel</button>
        </div>
      </div>
    </div>
  `;

  root.style.position = 'relative';
  const saveStatusBadge = root.querySelector('#db-save-status');

  function updateSaveStatusBadge(customMsg = null) {
    if (!saveStatusBadge) return;
    if (isDirty) {
      saveStatusBadge.className = 'text-[10px] bg-amber-400 text-slate-950 font-bold px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1.5 shadow-sm';
      saveStatusBadge.innerHTML = `<i class="fas fa-circle text-[7px] text-amber-950 animate-pulse"></i> ${customMsg || 'Unsaved Changes • Auto-saves every 5m'}`;
    } else {
      saveStatusBadge.className = 'text-[10px] bg-blue-950/90 text-blue-200 px-2.5 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1.5';
      saveStatusBadge.innerHTML = `<i class="fas fa-check-circle text-emerald-400"></i> ${customMsg || 'Saved • Auto-Save (5m)'}`;
    }
  }

  function markDirty() {
    if (!isDirty) {
      isDirty = true;
      updateSaveStatusBadge();
    }
  }

  function saveDatabase(targetFolder = currentFolderKey, silent = false) {
    try {
      const folder = (typeof targetFolder === 'string' && targetFolder) ? targetFolder : currentFolderKey;
      currentFolderKey = folder;
      const snapshot = JSON.parse(JSON.stringify(DB));

      // Save to active student's Database workspace
      stateStore.saveAppWorkspace('database', snapshot);

      // Save as file in active student's Virtual File System
      stateStore.saveFileToVFS(currentFolderKey, {
        name: currentFileName,
        type: 'db',
        icon: 'fa-database',
        color: 'text-indigo-400',
        content: JSON.stringify(snapshot, null, 2)
      });

      lastSavedSnapshot = snapshot;
      isDirty = false;
      const folderMeta = stateStore.getFolderMeta(currentFolderKey);
      updateSaveStatusBadge(`Saved in ${folderMeta?.label || currentFolderKey} • Auto-Save (5m)`);
      if (!silent) {
        dawamuDialogs.toast(`Saved "${currentFileName}" to This PC > ${folderMeta?.label || currentFolderKey}`, 'success');
      }
      return snapshot;
    } catch (e) {
      console.error('Database save error:', e);
      return null;
    }
  }

  function updateCounts() {
    root.querySelector('#count-students').textContent = DB.students.length;
    root.querySelector('#count-courses').textContent = DB.courses.length;
    root.querySelector('#count-library').textContent = DB.library.length;
    root.querySelector('#add-btn-label').textContent =
      activeTab === 'students' ? 'Add Student' : activeTab === 'courses' ? 'Add Course' : 'Add Book';
  }

  function renderContent() {
    updateCounts();
    const contentEl = root.querySelector('#db-content');
    const q = searchQuery.toLowerCase();

    if (activeTab === 'students') {
      const filtered = DB.students.filter(s =>
        s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) ||
        s.grade.toLowerCase().includes(q) || s.stream.toLowerCase().includes(q)
      );
      root.querySelector('#record-count').textContent = `${filtered.length} student${filtered.length !== 1 ? 's' : ''}`;
      contentEl.innerHTML = `
        <div class="overflow-auto h-full">
          <table class="w-full text-xs border-collapse">
            <thead class="sticky top-0 z-10">
              <tr class="bg-[#1e3a5f]">
                ${['ID','Name','Form','Stream','D.O.B','Parent/Guardian','Phone','Status','Actions'].map(h =>
                  `<th class="px-3 py-2.5 text-left text-[10px] font-bold text-blue-200 uppercase tracking-wider border-b border-blue-800">${h}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
              ${filtered.map((s, i) => `
                <tr class="${i % 2 === 0 ? 'bg-[#0f172a]' : 'bg-[#111827]'} hover:bg-[#1e3a5f]/60 transition-colors border-b border-white/5">
                  <td class="px-3 py-2 font-mono text-blue-300 font-bold">${esc(s.id)}</td>
                  <td class="px-3 py-2 font-semibold text-white">${esc(s.name)}</td>
                  <td class="px-3 py-2 text-slate-300">${esc(s.grade)}</td>
                  <td class="px-3 py-2 text-slate-400">${esc(s.stream)}</td>
                  <td class="px-3 py-2 text-slate-400">${esc(s.dob)}</td>
                  <td class="px-3 py-2 text-slate-300">${esc(s.parent)}</td>
                  <td class="px-3 py-2 font-mono text-slate-400">${esc(s.phone)}</td>
                  <td class="px-3 py-2"><span class="bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full text-[9px] font-bold">${esc(s.status)}</span></td>
                  <td class="px-3 py-2">
                    <div class="flex items-center gap-1.5">
                      <button class="row-edit-btn text-blue-400 hover:text-blue-300 p-1" data-id="${esc(s.id)}" title="Edit Student"><i class="fas fa-edit"></i></button>
                      <button class="row-del-btn text-rose-400 hover:text-rose-300 p-1" data-id="${esc(s.id)}" title="Delete Student"><i class="fas fa-trash-alt"></i></button>
                    </div>
                  </td>
                </tr>
              `).join('')}
              ${filtered.length === 0 ? `<tr><td colspan="9" class="text-center text-slate-500 py-12"><i class="fas fa-search text-3xl mb-3 block"></i>No students match "${esc(searchQuery)}".</td></tr>` : ''}
            </tbody>
          </table>
        </div>`;
    } else if (activeTab === 'courses') {
      const filtered = DB.courses.filter(c =>
        c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.teacher.toLowerCase().includes(q)
      );
      root.querySelector('#record-count').textContent = `${filtered.length} course${filtered.length !== 1 ? 's' : ''}`;
      contentEl.innerHTML = `
        <div class="overflow-auto h-full">
          <table class="w-full text-xs border-collapse">
            <thead class="sticky top-0 z-10">
              <tr class="bg-[#2d1b69]">
                ${['Code','Subject','Teacher','Forms','Hrs/Week','Room','Actions'].map(h =>
                  `<th class="px-3 py-2.5 text-left text-[10px] font-bold text-purple-200 uppercase tracking-wider border-b border-purple-800">${h}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
              ${filtered.map((c, i) => `
                <tr class="${i % 2 === 0 ? 'bg-[#0f172a]' : 'bg-[#111827]'} hover:bg-[#2d1b69]/30 transition-colors border-b border-white/5">
                  <td class="px-3 py-2 font-mono text-purple-300 font-bold">${esc(c.code)}</td>
                  <td class="px-3 py-2 font-semibold text-white">${esc(c.name)}</td>
                  <td class="px-3 py-2 text-slate-300">${esc(c.teacher)}</td>
                  <td class="px-3 py-2 text-slate-400">${esc(c.form)}</td>
                  <td class="px-3 py-2"><span class="bg-purple-900/50 text-purple-300 border border-purple-700/40 px-2 py-0.5 rounded-full text-[10px] font-bold">${esc(c.hrs)}h</span></td>
                  <td class="px-3 py-2 text-slate-400">${esc(c.room)}</td>
                  <td class="px-3 py-2">
                    <div class="flex items-center gap-1.5">
                      <button class="row-edit-btn text-purple-400 hover:text-purple-300 p-1" data-id="${esc(c.code)}" title="Edit Course"><i class="fas fa-edit"></i></button>
                      <button class="row-del-btn text-rose-400 hover:text-rose-300 p-1" data-id="${esc(c.code)}" title="Delete Course"><i class="fas fa-trash-alt"></i></button>
                    </div>
                  </td>
                </tr>
              `).join('')}
              ${filtered.length === 0 ? `<tr><td colspan="7" class="text-center text-slate-500 py-12"><i class="fas fa-search text-3xl mb-3 block"></i>No courses match "${esc(searchQuery)}".</td></tr>` : ''}
            </tbody>
          </table>
        </div>`;
    } else {
      const filtered = DB.library.filter(b =>
        b.isbn.toLowerCase().includes(q) || b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)
      );
      root.querySelector('#record-count').textContent = `${filtered.length} book${filtered.length !== 1 ? 's' : ''}`;
      contentEl.innerHTML = `
        <div class="overflow-auto h-full">
          <table class="w-full text-xs border-collapse">
            <thead class="sticky top-0 z-10">
              <tr class="bg-[#422006]">
                ${['ISBN','Title','Author','Category','Copies','Available','Actions'].map(h =>
                  `<th class="px-3 py-2.5 text-left text-[10px] font-bold text-amber-200 uppercase tracking-wider border-b border-amber-900">${h}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
              ${filtered.map((b, i) => `
                <tr class="${i % 2 === 0 ? 'bg-[#0f172a]' : 'bg-[#111827]'} hover:bg-[#422006]/30 transition-colors border-b border-white/5">
                  <td class="px-3 py-2 font-mono text-amber-300 text-[10px]">${esc(b.isbn)}</td>
                  <td class="px-3 py-2 font-semibold text-white max-w-[220px] truncate">${esc(b.title)}</td>
                  <td class="px-3 py-2 text-slate-300">${esc(b.author)}</td>
                  <td class="px-3 py-2"><span class="bg-amber-900/40 text-amber-300 border border-amber-700/40 px-2 py-0.5 rounded-full text-[9px] font-bold">${esc(b.category)}</span></td>
                  <td class="px-3 py-2 text-center text-slate-300">${esc(b.copies)}</td>
                  <td class="px-3 py-2 text-center font-bold ${b.avail > 10 ? 'text-emerald-400' : 'text-rose-400'}">${esc(b.avail)}</td>
                  <td class="px-3 py-2">
                    <div class="flex items-center gap-1.5">
                      <button class="row-edit-btn text-amber-400 hover:text-amber-300 p-1" data-id="${esc(b.isbn)}" title="Edit Book"><i class="fas fa-edit"></i></button>
                      <button class="row-del-btn text-rose-400 hover:text-rose-300 p-1" data-id="${esc(b.isbn)}" title="Delete Book"><i class="fas fa-trash-alt"></i></button>
                    </div>
                  </td>
                </tr>
              `).join('')}
              ${filtered.length === 0 ? `<tr><td colspan="7" class="text-center text-slate-500 py-12"><i class="fas fa-search text-3xl mb-3 block"></i>No books match "${esc(searchQuery)}".</td></tr>` : ''}
            </tbody>
          </table>
        </div>`;
    }

    // Attach row events
    contentEl.querySelectorAll('.row-del-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const confirmed = await dawamuDialogs.confirm(`Are you sure you want to delete record ${id}?`);
        if (confirmed) {
          if (activeTab === 'students') {
            DB.students = DB.students.filter(s => s.id !== id);
          } else if (activeTab === 'courses') {
            DB.courses = DB.courses.filter(c => c.code !== id);
          } else {
            DB.library = DB.library.filter(b => b.isbn !== id);
          }
          markDirty();
          renderContent();
          dawamuDialogs.toast(`Record ${id} removed (Click Save DB to commit)`, 'info');
        }
      });
    });

    contentEl.querySelectorAll('.row-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        let rec = null;
        if (activeTab === 'students') rec = DB.students.find(s => s.id === id);
        else if (activeTab === 'courses') rec = DB.courses.find(c => c.code === id);
        else rec = DB.library.find(b => b.isbn === id);
        if (rec) openModal(rec);
      });
    });
  }

  function updateTabs() {
    root.querySelectorAll('.db-tab').forEach(btn => {
      const active = btn.dataset.tab === activeTab;
      btn.className = `db-tab px-5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
        active ? 'text-blue-300 border-blue-500 bg-white/5' : 'text-slate-400 border-transparent hover:text-slate-200'
      }`;
    });
  }

  root.querySelectorAll('.db-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      searchQuery = '';
      root.querySelector('#db-search').value = '';
      updateTabs();
      renderContent();
    });
  });

  root.querySelector('#db-search').addEventListener('input', e => {
    searchQuery = e.target.value.trim();
    renderContent();
  });

  root.querySelector('#btn-save-db').addEventListener('click', () => {
    saveDatabase(currentFolderKey, false);
  });

  root.querySelector('#btn-save-db-downloads').addEventListener('click', () => {
    saveDatabase('downloads', false);
  });

  root.querySelector('#btn-export-db').addEventListener('click', () => {
    const data = DB[activeTab];
    if (!data?.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map(r => keys.map(k => `"${r[k]}"`).join(','))].join('\n');
    const csvName = `dawamu_${activeTab}_export.csv`;
    stateStore.saveFileToVFS('downloads', {
      name: csvName,
      type: 'sheet',
      icon: 'fa-file-csv',
      color: 'text-emerald-400',
      content: csv
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = csvName;
    a.click();
    dawamuDialogs.toast(`Saved "${csvName}" to This PC > Downloads`, 'success');
  });

  // Modal Setup
  const modal = root.querySelector('#record-modal');
  const modalTitle = root.querySelector('#modal-title');
  const modalFields = root.querySelector('#modal-fields');
  const modalError = root.querySelector('#modal-error');

  function openModal(existing = null) {
    editingRecord = existing;
    modalError.classList.add('hidden');
    modalError.textContent = '';

    if (activeTab === 'students') {
      modalTitle.innerHTML = `<i class="fas fa-user-graduate text-blue-400"></i> <span>${existing ? 'Edit Student' : 'Add New Student'}</span>`;
      modalFields.innerHTML = `
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Admission No.</label>
            <input id="f-id" type="text" value="${esc(existing?.id || '')}" ${existing ? 'readonly class="w-full bg-[#0b101c] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono"' : 'class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 font-mono"'}>
          </div>
          <div>
            <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Form / Grade</label>
            <select id="f-grade" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500">
              ${['Form 1','Form 2','Form 3','Form 4'].map(g => `<option ${existing?.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
            </select>
          </div>
        </div>
        <div>
          <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Full Name</label>
          <input id="f-name" type="text" value="${esc(existing?.name || '')}" placeholder="Student full name" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Stream</label>
            <select id="f-stream" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500">
              ${['East','West','North','South'].map(s => `<option ${existing?.stream === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Date of Birth</label>
            <input id="f-dob" type="date" value="${esc(existing?.dob || '2012-01-01')}" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500">
          </div>
        </div>
        <div>
          <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Parent / Guardian</label>
          <input id="f-parent" type="text" value="${esc(existing?.parent || '')}" placeholder="Parent or guardian name" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500">
        </div>
        <div>
          <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Phone Contact</label>
          <input id="f-phone" type="text" value="${esc(existing?.phone || '')}" placeholder="07XX-XXX-XXX" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500">
        </div>
      `;
    } else if (activeTab === 'courses') {
      modalTitle.innerHTML = `<i class="fas fa-book text-purple-400"></i> <span>${existing ? 'Edit Course' : 'Add New Course'}</span>`;
      modalFields.innerHTML = `
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Course Code</label>
            <input id="f-code" type="text" value="${esc(existing?.code || '')}" placeholder="e.g. MAT201" ${existing ? 'readonly class="w-full bg-[#0b101c] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono"' : 'class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500 font-mono"'}>
          </div>
          <div>
            <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Hours / Week</label>
            <input id="f-hrs" type="number" min="1" max="15" value="${esc(existing?.hrs || 5)}" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500">
          </div>
        </div>
        <div>
          <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Subject Name</label>
          <input id="f-name" type="text" value="${esc(existing?.name || '')}" placeholder="e.g. Applied Physics" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500">
        </div>
        <div>
          <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Instructor / Teacher</label>
          <input id="f-teacher" type="text" value="${esc(existing?.teacher || '')}" placeholder="e.g. Mr. Ochieng" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Target Forms</label>
            <input id="f-form" type="text" value="${esc(existing?.form || 'All')}" placeholder="All, F3-F4" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500">
          </div>
          <div>
            <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Classroom / Lab</label>
            <input id="f-room" type="text" value="${esc(existing?.room || 'Lab 1')}" placeholder="Lab 1" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500">
          </div>
        </div>
      `;
    } else {
      modalTitle.innerHTML = `<i class="fas fa-book-open text-amber-400"></i> <span>${existing ? 'Edit Library Resource' : 'Add Library Book'}</span>`;
      modalFields.innerHTML = `
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">ISBN / Code</label>
            <input id="f-isbn" type="text" value="${esc(existing?.isbn || '')}" placeholder="978-011" ${existing ? 'readonly class="w-full bg-[#0b101c] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono"' : 'class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-mono"'}>
          </div>
          <div>
            <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Category</label>
            <select id="f-cat" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500">
              ${['Textbook','Set Book','Lab Guide','Reference','Novel'].map(c => `<option ${existing?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
        </div>
        <div>
          <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Book Title</label>
          <input id="f-title" type="text" value="${esc(existing?.title || '')}" placeholder="Full book title" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500">
        </div>
        <div>
          <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Author / Publisher</label>
          <input id="f-author" type="text" value="${esc(existing?.author || '')}" placeholder="Author name" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Total Copies</label>
            <input id="f-copies" type="number" min="1" value="${esc(existing?.copies || 20)}" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500">
          </div>
          <div>
            <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Available Copies</label>
            <input id="f-avail" type="number" min="0" value="${esc(existing?.avail || 15)}" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500">
          </div>
        </div>
      `;
    }

    modal.classList.remove('hidden');
  }

  function closeModal() {
    modal.classList.add('hidden');
    editingRecord = null;
  }

  root.querySelector('#btn-add-record').addEventListener('click', () => openModal(null));
  root.querySelector('#close-modal').addEventListener('click', closeModal);
  root.querySelector('#modal-cancel').addEventListener('click', closeModal);

  root.querySelector('#modal-save').addEventListener('click', () => {
    if (activeTab === 'students') {
      const id = root.querySelector('#f-id')?.value.trim();
      const name = root.querySelector('#f-name')?.value.trim();
      const grade = root.querySelector('#f-grade')?.value;
      const stream = root.querySelector('#f-stream')?.value;
      const dob = root.querySelector('#f-dob')?.value || '2012-01-01';
      const parent = root.querySelector('#f-parent')?.value.trim() || 'N/A';
      const phone = root.querySelector('#f-phone')?.value.trim() || 'N/A';

      if (!id || !name) {
        modalError.textContent = 'Admission number and full name are required.';
        modalError.classList.remove('hidden');
        return;
      }

      if (!editingRecord && DB.students.some(s => s.id === id)) {
        modalError.textContent = `Student ID ${id} already exists.`;
        modalError.classList.remove('hidden');
        return;
      }

      const wasEditing = Boolean(editingRecord);
      if (editingRecord) {
        const idx = DB.students.findIndex(s => s.id === editingRecord.id);
        if (idx !== -1) {
          DB.students[idx] = { id, name, grade, stream, dob, parent, phone, status: editingRecord.status || 'Active' };
        }
      } else {
        DB.students.push({ id, name, grade, stream, dob, parent, phone, status: 'Active' });
      }

      markDirty();
      closeModal();
      renderContent();
      dawamuDialogs.toast(`Student "${name}" ${wasEditing ? 'updated' : 'added'} (Click Save DB to commit)`, 'info');
    } else if (activeTab === 'courses') {
      const code = root.querySelector('#f-code')?.value.trim().toUpperCase();
      const name = root.querySelector('#f-name')?.value.trim();
      const teacher = root.querySelector('#f-teacher')?.value.trim() || 'TBD';
      const form = root.querySelector('#f-form')?.value.trim() || 'All';
      const hrs = parseInt(root.querySelector('#f-hrs')?.value || '4', 10);
      const room = root.querySelector('#f-room')?.value.trim() || 'Classroom';

      if (!code || !name) {
        modalError.textContent = 'Course code and course name are required.';
        modalError.classList.remove('hidden');
        return;
      }

      if (!editingRecord && DB.courses.some(c => c.code === code)) {
        modalError.textContent = `Course code ${code} already exists.`;
        modalError.classList.remove('hidden');
        return;
      }

      if (editingRecord) {
        const idx = DB.courses.findIndex(c => c.code === editingRecord.code);
        if (idx !== -1) {
          DB.courses[idx] = { code, name, teacher, form, hrs, room };
        }
      } else {
        DB.courses.push({ code, name, teacher, form, hrs, room });
      }

      markDirty();
      closeModal();
      renderContent();
      dawamuDialogs.toast(`Course "${name}" updated (Click Save DB to commit)`, 'info');
    } else {
      const isbn = root.querySelector('#f-isbn')?.value.trim();
      const title = root.querySelector('#f-title')?.value.trim();
      const author = root.querySelector('#f-author')?.value.trim() || 'Unknown';
      const category = root.querySelector('#f-cat')?.value || 'Textbook';
      const copies = parseInt(root.querySelector('#f-copies')?.value || '10', 10);
      const avail = parseInt(root.querySelector('#f-avail')?.value || '10', 10);

      if (!isbn || !title) {
        modalError.textContent = 'ISBN and title are required.';
        modalError.classList.remove('hidden');
        return;
      }

      if (!editingRecord && DB.library.some(b => b.isbn === isbn)) {
        modalError.textContent = `Book with ISBN ${isbn} already exists.`;
        modalError.classList.remove('hidden');
        return;
      }

      if (editingRecord) {
        const idx = DB.library.findIndex(b => b.isbn === editingRecord.isbn);
        if (idx !== -1) {
          DB.library[idx] = { isbn, title, author, category, copies, avail };
        }
      } else {
        DB.library.push({ isbn, title, author, category, copies, avail });
      }

      markDirty();
      closeModal();
      renderContent();
      dawamuDialogs.toast(`Book "${title}" updated (Click Save DB to commit)`, 'info');
    }
  });

  root.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveDatabase(currentFolderKey, false);
    }
  });

  // 5-Minute Automatic Save Interval while in Dawamu School Database
  const autoSaveIntervalId = setInterval(() => {
    if (!document.body.contains(root)) {
      clearInterval(autoSaveIntervalId);
      return;
    }
    saveDatabase(currentFolderKey, true);
    dawamuDialogs.toast(`Auto-saved "${currentFileName}" (5-minute interval)`, 'info');
  }, AUTO_SAVE_INTERVAL_MS);

  // Register lifecycle controller for WindowManager close interception & E2E inspection
  root.__dawamuAppController = {
    appId: 'database',
    autoSaveIntervalMs: AUTO_SAVE_INTERVAL_MS,
    isDirty: () => isDirty,
    getTitle: () => currentFileName,
    saveNow: () => saveDatabase(currentFolderKey, false),
    triggerAutoSaveNow: () => saveDatabase(currentFolderKey, true),
    discardChanges: () => {
      if (lastSavedSnapshot) {
        DB = JSON.parse(JSON.stringify(lastSavedSnapshot));
      }
      isDirty = false;
    },
    onDestroy: () => {
      clearInterval(autoSaveIntervalId);
    }
  };

  updateTabs();
  renderContent();
  updateSaveStatusBadge();
  return root;
}
