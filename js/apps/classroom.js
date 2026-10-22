/**
 * ChromeOS Student Edition - Classroom & Assignment Tracker
 */

import { stateStore } from '../os/state.js';

export function createClassroomApp() {
  const container = document.createElement('div');
  container.className = 'flex flex-col h-full bg-slate-900 text-slate-100 font-sans p-6 overflow-y-auto space-y-6';

  let currentSubject = 'All';
  let currentStatus = 'All';

  const render = () => {
    const assignments = stateStore.getState().assignments;

    // Calculate Stats
    const total = assignments.length;
    const completedCount = assignments.filter((a) => a.completed).length;
    const pendingCount = total - completedCount;
    const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    // Filter list
    const filtered = assignments.filter((a) => {
      const matchSub = currentSubject === 'All' || a.subject === currentSubject;
      const matchStat = currentStatus === 'All' || (currentStatus === 'Pending' ? !a.completed : a.completed);
      return matchSub && matchStat;
    });

    container.innerHTML = `
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-base font-semibold text-white">Assignments</h1>
          <p class="text-xs text-slate-400">${pendingCount} pending &nbsp;·&nbsp; ${completedCount}/${total} done (${percent}%)</p>
        </div>
        <div class="w-2 h-2 rounded-full ${pendingCount > 0 ? 'bg-amber-400' : 'bg-emerald-400'}"></div>
      </div>

      <!-- Controls & Filters Bar -->
      <div class="flex items-center justify-between flex-wrap gap-3 bg-slate-950/50 px-3 py-2.5 rounded-xl border border-slate-800/80">
        <!-- Subject Pills -->
        <div class="flex items-center gap-2 overflow-x-auto text-xs">
          <span class="text-slate-400 font-semibold mr-1">Subject:</span>
          ${['All', 'Math', 'Science', 'History', 'English']
            .map(
              (sub) => `
            <button class="sub-filter-btn px-3 py-1.5 rounded-full font-semibold transition-colors ${currentSubject === sub ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}" data-subject="${sub}">
              ${sub}
            </button>
          `
            )
            .join('')}
        </div>

        <!-- Status Filter & Add Button -->
        <div class="flex items-center gap-3 text-xs">
          <select id="status-select" class="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 font-semibold text-slate-200 outline-none focus:border-blue-500">
            <option value="All" ${currentStatus === 'All' ? 'selected' : ''}>All Statuses</option>
            <option value="Pending" ${currentStatus === 'Pending' ? 'selected' : ''}>Pending Only</option>
            <option value="Completed" ${currentStatus === 'Completed' ? 'selected' : ''}>Completed Only</option>
          </select>

          <button id="add-asg-btn" class="bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
            <i class="fas fa-plus"></i> Add Assignment
          </button>
        </div>
      </div>

      <!-- New Assignment Modal (Hidden by default) -->
      <div id="asg-form-container" class="hidden bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
        <h3 class="font-bold text-sm text-white border-b border-slate-800 pb-2">Add New Assignment</h3>
        <div class="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">Assignment Title</label>
            <input type="text" id="new-asg-title" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-blue-500" placeholder="e.g. Chapter 4 Quiz Review">
          </div>
          <div>
            <label class="block text-slate-400 mb-1">Subject</label>
            <select id="new-asg-subject" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-blue-500">
              <option value="Math">Math</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="English">English</option>
            </select>
          </div>
          <div>
            <label class="block text-slate-400 mb-1">Due Date</label>
            <input type="date" id="new-asg-date" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-blue-500">
          </div>
          <div>
            <label class="block text-slate-400 mb-1">Priority</label>
            <select id="new-asg-priority" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-blue-500">
              <option value="low">Low Priority</option>
              <option value="medium" selected>Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-slate-400 mb-1 text-xs">Notes & Instructions</label>
          <input type="text" id="new-asg-notes" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs outline-none focus:border-blue-500" placeholder="e.g. Read pages 10-15 and answer questions 1-5">
        </div>
        <div class="flex justify-end gap-2 text-xs">
          <button id="cancel-asg-btn" class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl">Cancel</button>
          <button id="save-asg-btn" class="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl">Save Assignment</button>
        </div>
      </div>

      <!-- Assignments Cards Grid -->
      <div class="space-y-3">
        ${
          filtered.length === 0
            ? `<div class="text-center py-12 text-slate-400 text-sm bg-slate-950/40 border border-slate-800 rounded-2xl">No assignments match your selected filter criteria.</div>`
            : filtered
                .map(
                  (asg) => `
            <div class="asg-card bg-slate-950/80 border ${asg.completed ? 'border-slate-800/80 opacity-60' : 'border-slate-800 hover:border-blue-500/50'} rounded-2xl p-4 flex items-center justify-between gap-4 transition-all">
              <div class="flex items-start gap-4">
                <input type="checkbox" class="asg-chk w-5 h-5 mt-1 accent-emerald-500 cursor-pointer rounded" data-id="${asg.id}" ${asg.completed ? 'checked' : ''}>
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-bold text-white ${asg.completed ? 'line-through text-slate-400' : ''}">${asg.title}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                      asg.subject === 'Math'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : asg.subject === 'Science'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : asg.subject === 'History'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }">${asg.subject}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-md font-bold ${
                      asg.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : asg.priority === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }">${asg.priority} priority</span>
                  </div>
                  <p class="text-xs text-slate-400 mb-1">${asg.notes || 'No extra notes provided.'}</p>
                  <div class="text-[11px] text-slate-500 flex items-center gap-3">
                    <span><i class="far fa-calendar-alt text-blue-400"></i> Due: ${asg.dueDate}</span>
                    <span>Status: <b class="${asg.completed ? 'text-emerald-400' : 'text-amber-400'}">${asg.completed ? 'Completed' : 'Pending'}</b></span>
                  </div>
                </div>
              </div>

              <button class="asg-del-btn text-slate-500 hover:text-rose-400 p-2 text-sm transition-colors" data-id="${asg.id}" title="Delete Assignment">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          `
                )
                .join('')
        }
      </div>
    `;

    attachEvents();
  };

  const attachEvents = () => {
    // Subject filter buttons
    container.querySelectorAll('.sub-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentSubject = btn.dataset.subject;
        render();
      });
    });

    // Status select filter
    const statusSelect = container.querySelector('#status-select');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        currentStatus = e.target.value;
        render();
      });
    }

    // Toggle Checkbox
    container.querySelectorAll('.asg-chk').forEach((chk) => {
      chk.addEventListener('change', (e) => {
        stateStore.toggleAssignmentCompleted(e.target.dataset.id);
        render();
      });
    });

    // Delete button
    container.querySelectorAll('.asg-del-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        stateStore.deleteAssignment(btn.dataset.id);
        render();
      });
    });

    // Toggle Form Modal
    const formContainer = container.querySelector('#asg-form-container');
    const addBtn = container.querySelector('#add-asg-btn');
    const cancelBtn = container.querySelector('#cancel-asg-btn');
    const saveBtn = container.querySelector('#save-asg-btn');

    if (addBtn && formContainer) {
      addBtn.addEventListener('click', () => formContainer.classList.remove('hidden'));
      cancelBtn.addEventListener('click', () => formContainer.classList.add('hidden'));

      saveBtn.addEventListener('click', () => {
        const title = container.querySelector('#new-asg-title').value.trim();
        const subject = container.querySelector('#new-asg-subject').value;
        const dueDate = container.querySelector('#new-asg-date').value || new Date().toISOString().split('T')[0];
        const priority = container.querySelector('#new-asg-priority').value;
        const notes = container.querySelector('#new-asg-notes').value.trim();

        if (!title) return;

        stateStore.addAssignment({ title, subject, dueDate, priority, notes });
        render();
      });
    }
  };

  render();
  return container;
}
