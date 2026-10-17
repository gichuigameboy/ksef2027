/**
 * Dawamu OS - School Database App
 */

export function createDatabaseApp() {
  const root = document.createElement('div');
  root.className = 'flex flex-col h-full bg-[#0f172a] text-white font-sans overflow-hidden';

  const DB = {
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

  let activeTab = 'students';
  let searchQuery = '';

  root.innerHTML = `
    <!-- Header -->
    <div class="bg-[#0f172a] border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 bg-blue-900/60 border border-blue-700/50 rounded-xl flex items-center justify-center text-blue-300 text-xl">
          <i class="fas fa-database"></i>
        </div>
        <div>
          <div class="font-bold text-white text-sm">Dawamu School Database</div>
          <div class="text-[10px] text-slate-400">Student Records • Courses • Library Catalog</div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 bg-[#1e293b] border border-white/10 rounded-xl px-3 py-1.5">
          <i class="fas fa-search text-slate-500 text-xs"></i>
          <input id="db-search" type="text" placeholder="Search records..." class="bg-transparent outline-none text-xs text-white placeholder-slate-500 w-40">
        </div>
        <button id="btn-add-record" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all">
          <i class="fas fa-plus text-[10px]"></i> Add Record
        </button>
        <button id="btn-export-db" class="bg-[#1e293b] hover:bg-[#2d3748] border border-white/10 text-slate-300 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all">
          <i class="fas fa-download text-[10px]"></i> Export CSV
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-[#111827] border-b border-white/10 px-4 flex items-center shrink-0">
      <button class="db-tab px-5 py-2.5 text-xs font-semibold border-b-2 transition-all" data-tab="students">
        <i class="fas fa-users mr-1.5"></i>Students
        <span class="ml-1.5 bg-blue-900/60 text-blue-300 text-[9px] px-1.5 py-0.5 rounded-full" id="count-students">12</span>
      </button>
      <button class="db-tab px-5 py-2.5 text-xs font-semibold border-b-2 transition-all" data-tab="courses">
        <i class="fas fa-book mr-1.5"></i>Courses
        <span class="ml-1.5 bg-purple-900/60 text-purple-300 text-[9px] px-1.5 py-0.5 rounded-full">10</span>
      </button>
      <button class="db-tab px-5 py-2.5 text-xs font-semibold border-b-2 transition-all" data-tab="library">
        <i class="fas fa-book-open mr-1.5"></i>Library
        <span class="ml-1.5 bg-amber-900/60 text-amber-300 text-[9px] px-1.5 py-0.5 rounded-full">10</span>
      </button>
      <div class="ml-auto text-[10px] text-slate-500 self-center pr-2" id="record-count"></div>
    </div>

    <!-- Content Area -->
    <div id="db-content" class="flex-1 overflow-hidden"></div>

    <!-- Add Record Modal -->
    <div id="add-modal" class="hidden absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="bg-[#1e293b] border border-white/10 rounded-2xl p-6 w-[420px] shadow-2xl">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-bold text-white text-sm"><i class="fas fa-plus-circle text-blue-400 mr-2"></i>Add New Student</h3>
          <button id="close-modal" class="text-slate-400 hover:text-white transition-colors text-lg"><i class="fas fa-times"></i></button>
        </div>
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Admission No.</label>
              <input id="modal-id" type="text" placeholder="e.g. 1013" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500">
            </div>
            <div>
              <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Form/Grade</label>
              <select id="modal-grade" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 cursor-pointer">
                <option>Form 1</option><option>Form 2</option><option>Form 3</option><option>Form 4</option>
              </select>
            </div>
          </div>
          <div>
            <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Full Name</label>
            <input id="modal-name" type="text" placeholder="Student full name" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Stream</label>
              <select id="modal-stream" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 cursor-pointer">
                <option>East</option><option>West</option><option>North</option><option>South</option>
              </select>
            </div>
            <div>
              <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Date of Birth</label>
              <input id="modal-dob" type="date" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500">
            </div>
          </div>
          <div>
            <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Parent / Guardian</label>
            <input id="modal-parent" type="text" placeholder="Parent or guardian name" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500">
          </div>
          <div>
            <label class="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Phone</label>
            <input id="modal-phone" type="text" placeholder="07XX-XXX-XXX" class="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500">
          </div>
        </div>
        <div id="modal-error" class="text-rose-400 text-[11px] mt-2 hidden"></div>
        <div class="flex gap-3 mt-5">
          <button id="modal-save" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all">Save Student</button>
          <button id="modal-cancel" class="flex-1 bg-[#0f172a] hover:bg-[#1e293b] border border-white/10 text-slate-300 text-xs py-2.5 rounded-xl transition-all">Cancel</button>
        </div>
      </div>
    </div>
  `;

  root.style.position = 'relative';

  function renderContent() {
    const contentEl = root.querySelector('#db-content');
    const q = searchQuery.toLowerCase();

    if (activeTab === 'students') {
      const filtered = DB.students.filter(s =>
        s.id.includes(q) || s.name.toLowerCase().includes(q) ||
        s.grade.toLowerCase().includes(q) || s.stream.toLowerCase().includes(q)
      );
      root.querySelector('#record-count').textContent = `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`;
      contentEl.innerHTML = `
        <div class="overflow-auto h-full">
          <table class="w-full text-xs border-collapse">
            <thead class="sticky top-0 z-10">
              <tr class="bg-[#1e3a5f]">
                ${['ID','Name','Form','Stream','D.O.B','Parent/Guardian','Phone','Status'].map(h =>
                  `<th class="px-3 py-2.5 text-left text-[10px] font-bold text-blue-200 uppercase tracking-wider border-b border-blue-800">${h}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
              ${filtered.map((s, i) => `
                <tr class="${i % 2 === 0 ? 'bg-[#0f172a]' : 'bg-[#111827]'} hover:bg-[#1e3a5f]/60 transition-colors border-b border-white/5">
                  <td class="px-3 py-2 font-mono text-blue-300 font-bold">${s.id}</td>
                  <td class="px-3 py-2 font-semibold text-white">${s.name}</td>
                  <td class="px-3 py-2 text-slate-300">${s.grade}</td>
                  <td class="px-3 py-2 text-slate-400">${s.stream}</td>
                  <td class="px-3 py-2 text-slate-400">${s.dob}</td>
                  <td class="px-3 py-2 text-slate-300">${s.parent}</td>
                  <td class="px-3 py-2 font-mono text-slate-400">${s.phone}</td>
                  <td class="px-3 py-2"><span class="bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full text-[9px] font-bold">${s.status}</span></td>
                </tr>
              `).join('')}
              ${filtered.length === 0 ? `<tr><td colspan="8" class="text-center text-slate-500 py-12"><i class="fas fa-search text-3xl mb-3 block"></i>No students match.</td></tr>` : ''}
            </tbody>
          </table>
        </div>`;
    } else if (activeTab === 'courses') {
      const filtered = DB.courses.filter(c =>
        c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.teacher.toLowerCase().includes(q)
      );
      root.querySelector('#record-count').textContent = `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`;
      contentEl.innerHTML = `
        <div class="overflow-auto h-full">
          <table class="w-full text-xs border-collapse">
            <thead class="sticky top-0 z-10">
              <tr class="bg-[#2d1b69]">
                ${['Code','Subject','Teacher','Forms','Hrs/Week','Room'].map(h =>
                  `<th class="px-3 py-2.5 text-left text-[10px] font-bold text-purple-200 uppercase tracking-wider border-b border-purple-800">${h}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
              ${filtered.map((c, i) => `
                <tr class="${i % 2 === 0 ? 'bg-[#0f172a]' : 'bg-[#111827]'} hover:bg-[#2d1b69]/30 transition-colors border-b border-white/5">
                  <td class="px-3 py-2 font-mono text-purple-300 font-bold">${c.code}</td>
                  <td class="px-3 py-2 font-semibold text-white">${c.name}</td>
                  <td class="px-3 py-2 text-slate-300">${c.teacher}</td>
                  <td class="px-3 py-2 text-slate-400">${c.form}</td>
                  <td class="px-3 py-2 text-center"><span class="bg-purple-900/50 text-purple-300 border border-purple-700/40 px-2 py-0.5 rounded-full text-[10px] font-bold">${c.hrs}h</span></td>
                  <td class="px-3 py-2 text-slate-400">${c.room}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`;
    } else {
      const filtered = DB.library.filter(b =>
        b.isbn.toLowerCase().includes(q) || b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)
      );
      root.querySelector('#record-count').textContent = `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`;
      contentEl.innerHTML = `
        <div class="overflow-auto h-full">
          <table class="w-full text-xs border-collapse">
            <thead class="sticky top-0 z-10">
              <tr class="bg-[#422006]">
                ${['ISBN','Title','Author','Category','Copies','Available'].map(h =>
                  `<th class="px-3 py-2.5 text-left text-[10px] font-bold text-amber-200 uppercase tracking-wider border-b border-amber-900">${h}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
              ${filtered.map((b, i) => `
                <tr class="${i % 2 === 0 ? 'bg-[#0f172a]' : 'bg-[#111827]'} hover:bg-[#422006]/30 transition-colors border-b border-white/5">
                  <td class="px-3 py-2 font-mono text-amber-300 text-[10px]">${b.isbn}</td>
                  <td class="px-3 py-2 font-semibold text-white" style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${b.title}</td>
                  <td class="px-3 py-2 text-slate-300">${b.author}</td>
                  <td class="px-3 py-2"><span class="bg-amber-900/40 text-amber-300 border border-amber-700/40 px-2 py-0.5 rounded-full text-[9px] font-bold">${b.category}</span></td>
                  <td class="px-3 py-2 text-center text-slate-300">${b.copies}</td>
                  <td class="px-3 py-2 text-center font-bold ${b.avail > 10 ? 'text-emerald-400' : 'text-rose-400'}">${b.avail}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`;
    }
  }

  function updateTabs() {
    root.querySelectorAll('.db-tab').forEach(btn => {
      const active = btn.dataset.tab === activeTab;
      btn.className = `db-tab px-5 py-2.5 text-xs font-semibold border-b-2 transition-all ${
        active ? 'text-blue-300 border-blue-500' : 'text-slate-500 border-transparent hover:text-slate-300'
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

  root.querySelector('#btn-export-db').addEventListener('click', () => {
    const data = DB[activeTab];
    if (!data?.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map(r => keys.map(k => `"${r[k]}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dawamu_${activeTab}_${Date.now()}.csv`;
    a.click();
  });

  // Add record modal
  const addModal = root.querySelector('#add-modal');
  root.querySelector('#btn-add-record').addEventListener('click', () => addModal.classList.remove('hidden'));
  root.querySelector('#close-modal').addEventListener('click', () => addModal.classList.add('hidden'));
  root.querySelector('#modal-cancel').addEventListener('click', () => addModal.classList.add('hidden'));

  root.querySelector('#modal-save').addEventListener('click', () => {
    const errorEl = root.querySelector('#modal-error');
    const id     = root.querySelector('#modal-id').value.trim();
    const name   = root.querySelector('#modal-name').value.trim();
    const grade  = root.querySelector('#modal-grade').value;
    const stream = root.querySelector('#modal-stream').value;
    const dob    = root.querySelector('#modal-dob').value;
    const parent = root.querySelector('#modal-parent').value.trim();
    const phone  = root.querySelector('#modal-phone').value.trim();

    if (!id || !name) {
      errorEl.textContent = 'Admission number and full name are required.';
      errorEl.classList.remove('hidden');
      return;
    }
    if (DB.students.find(s => s.id === id)) {
      errorEl.textContent = `Student ID ${id} already exists.`;
      errorEl.classList.remove('hidden');
      return;
    }

    DB.students.push({ id, name, grade, stream, dob: dob || 'N/A', parent: parent || 'N/A', phone: phone || 'N/A', status: 'Active' });
    errorEl.classList.add('hidden');
    addModal.classList.add('hidden');
    ['#modal-id','#modal-name','#modal-parent','#modal-phone','#modal-dob'].forEach(sel => {
      root.querySelector(sel).value = '';
    });
    activeTab = 'students';
    root.querySelector('#count-students').textContent = DB.students.length;
    updateTabs();
    renderContent();
  });

  updateTabs();
  renderContent();
  return root;
}
