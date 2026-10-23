/**
 * DawamuOS Classroom & Assignment Tracker
 * Fully integrated with Kenyan KCSE Curriculum, StateStore persistence,
 * real-time filtering, search, sorting, deadlines tracking, and accessible dialogs.
 */

import { stateStore } from '../os/state.js';

export function createClassroomApp() {
  const container = document.createElement('div');
  container.className = 'flex flex-col h-full bg-slate-900 text-slate-100 font-sans p-6 overflow-y-auto space-y-5';

  let currentSubject = 'All';
  let currentStatus = 'All';
  let searchQuery = '';
  let sortBy = 'due-asc';
  let isFormOpen = false;

  const KENYAN_SUBJECTS = [
    'Mathematics',
    'English',
    'Kiswahili',
    'Biology',
    'Chemistry',
    'Physics',
    'History',
    'Geography',
    'Computer Studies',
    'Business Studies',
    'Agriculture'
  ];

  const getSubjectBadge = (subject) => {
    switch (subject) {
      case 'Mathematics':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Biology':
      case 'Agriculture':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Chemistry':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Physics':
        return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
      case 'English':
      case 'Kiswahili':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'History':
      case 'Geography':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'Computer Studies':
      case 'Business Studies':
        return 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/30';
    }
  };

  const calculateDueNotice = (dueDateStr) => {
    if (!dueDateStr) return { text: 'No due date', color: 'text-slate-400' };
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`, color: 'text-rose-400 font-semibold' };
    } else if (diffDays === 0) {
      return { text: 'Due Today', color: 'text-amber-400 font-semibold' };
    } else if (diffDays === 1) {
      return { text: 'Due Tomorrow', color: 'text-amber-300' };
    } else {
      return { text: `Due in ${diffDays} days`, color: 'text-slate-400' };
    }
  };

  const render = () => {
    const state = stateStore.getState();
    const assignments = state.assignments || [];
    const currentUser = state.currentUser;

    // Calculate statistics
    const total = assignments.length;
    const completedCount = assignments.filter((a) => a.completed).length;
    const pendingCount = total - completedCount;
    const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    // Filter list
    let filtered = assignments.filter((a) => {
      const matchSub = currentSubject === 'All' || a.subject === currentSubject;
      const matchStat = currentStatus === 'All' || (currentStatus === 'Pending' ? !a.completed : a.completed);
      const matchSearch = !searchQuery || 
        (a.title && a.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.notes && a.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.subject && a.subject.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSub && matchStat && matchSearch;
    });

    // Sort list
    filtered.sort((a, b) => {
      if (sortBy === 'due-asc') return (a.dueDate || '').localeCompare(b.dueDate || '');
      if (sortBy === 'due-desc') return (b.dueDate || '').localeCompare(a.dueDate || '');
      if (sortBy === 'priority') {
        const pOrder = { high: 3, medium: 2, low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });

    const userBadge = currentUser
      ? `<span class="bg-blue-900/40 text-blue-300 border border-blue-700/50 px-2.5 py-1 rounded-lg text-xs font-medium"><i class="fas fa-user-graduate mr-1"></i> ${currentUser.name || 'Student'} (${currentUser.admNo || 'Enrolled'})</span>`
      : `<span class="bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg text-xs font-medium">Standard Profile</span>`;

    container.innerHTML = `
      <!-- Header -->
      <div class="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-lg font-bold text-white flex items-center gap-2">
              <i class="fas fa-tasks text-emerald-400"></i> Classroom Assignments
            </h1>
            ${userBadge}
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Track KCSE curriculum coursework, homework deadlines, and submission records
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-right">
            <div class="text-xs font-semibold text-slate-300">${completedCount} of ${total} Completed (${percent}%)</div>
            <div class="w-36 bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-700">
              <div class="bg-emerald-500 h-full transition-all duration-300" style="width: ${percent}%;"></div>
            </div>
          </div>
          <button id="add-asg-toggle-btn" class="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm">
            <i class="fas fa-plus"></i> New Task
          </button>
        </div>
      </div>

      <!-- New Assignment Modal / Form Panel -->
      <div id="asg-form-container" class="${isFormOpen ? '' : 'hidden'} bg-slate-950/90 border border-emerald-500/30 p-5 rounded-2xl shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 class="font-bold text-sm text-white flex items-center gap-2">
            <i class="fas fa-file-signature text-emerald-400"></i> Create New Homework / Assignment Task
          </h3>
          <button id="close-form-btn" class="text-slate-400 hover:text-white text-xs"><i class="fas fa-times"></i></button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block text-slate-300 font-medium mb-1">Assignment Title <span class="text-rose-400">*</span></label>
            <input type="text" id="new-asg-title" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 outline-none focus:border-emerald-500" placeholder="e.g. KCSE Form 4 Calculus Revision">
          </div>
          <div>
            <label class="block text-slate-300 font-medium mb-1">Subject</label>
            <select id="new-asg-subject" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500">
              ${KENYAN_SUBJECTS.map((sub) => `<option value="${sub}">${sub}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-slate-300 font-medium mb-1">Due Date</label>
            <input type="date" id="new-asg-date" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500" value="${new Date(Date.now() + 86400000).toISOString().split('T')[0]}">
          </div>
          <div>
            <label class="block text-slate-300 font-medium mb-1">Priority</label>
            <select id="new-asg-priority" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500">
              <option value="low">Low Priority</option>
              <option value="medium" selected>Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-slate-300 font-medium mb-1 text-xs">Instructions & Exercise References</label>
          <textarea id="new-asg-notes" rows="2" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs outline-none focus:border-emerald-500 placeholder-slate-500" placeholder="e.g. Complete questions 1 to 15 from KLB Form 4 Chapter 3; verify derivative proofs."></textarea>
        </div>
        <div class="flex justify-end gap-2 text-xs">
          <button id="cancel-asg-btn" class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl">Cancel</button>
          <button id="save-asg-btn" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl transition-colors">
            <i class="fas fa-save mr-1"></i> Save Task
          </button>
        </div>
      </div>

      <!-- Controls & Filter Toolbar -->
      <div class="flex flex-col gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
        <!-- Search, Status and Sort Bar -->
        <div class="flex items-center justify-between flex-wrap gap-3 text-xs">
          <div class="flex items-center gap-2 flex-1 min-w-[200px]">
            <div class="relative w-full max-w-xs">
              <i class="fas fa-search absolute left-3 top-2.5 text-slate-500"></i>
              <input type="text" id="asg-search" class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-white placeholder-slate-500 outline-none focus:border-blue-500 text-xs" placeholder="Search tasks, subjects, instructions..." value="${searchQuery}">
            </div>
            ${searchQuery ? `<button id="clear-search-btn" class="text-slate-400 hover:text-white px-2 py-1"><i class="fas fa-times-circle"></i></button>` : ''}
          </div>

          <div class="flex items-center gap-2">
            <span class="text-slate-400 font-medium">Status:</span>
            <select id="status-select" class="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-semibold text-slate-200 outline-none focus:border-blue-500">
              <option value="All" ${currentStatus === 'All' ? 'selected' : ''}>All Statuses</option>
              <option value="Pending" ${currentStatus === 'Pending' ? 'selected' : ''}>Pending (${pendingCount})</option>
              <option value="Completed" ${currentStatus === 'Completed' ? 'selected' : ''}>Completed (${completedCount})</option>
            </select>

            <span class="text-slate-400 font-medium ml-1">Sort:</span>
            <select id="sort-select" class="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-semibold text-slate-200 outline-none focus:border-blue-500">
              <option value="due-asc" ${sortBy === 'due-asc' ? 'selected' : ''}>Earliest Due</option>
              <option value="due-desc" ${sortBy === 'due-desc' ? 'selected' : ''}>Latest Due</option>
              <option value="priority" ${sortBy === 'priority' ? 'selected' : ''}>Highest Priority</option>
              <option value="title" ${sortBy === 'title' ? 'selected' : ''}>Title (A-Z)</option>
            </select>
          </div>
        </div>

        <!-- Subject Filter Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button class="sub-filter-btn px-3 py-1 rounded-lg font-semibold transition-colors shrink-0 ${currentSubject === 'All' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}" data-subject="All">
            All (${total})
          </button>
          ${KENYAN_SUBJECTS.map((sub) => {
            const count = assignments.filter((a) => a.subject === sub).length;
            if (count === 0 && currentSubject !== sub) return '';
            return `
              <button class="sub-filter-btn px-3 py-1 rounded-lg font-semibold transition-colors shrink-0 ${currentSubject === sub ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}" data-subject="${sub}">
                ${sub} (${count})
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Assignments Cards List -->
      <div class="space-y-3">
        ${
          filtered.length === 0
            ? `<div class="text-center py-14 text-slate-400 text-sm bg-slate-950/40 border border-slate-800 rounded-2xl">
                 <i class="fas fa-clipboard-check text-4xl text-slate-600 mb-3 block"></i>
                 <div class="font-semibold text-slate-300">No assignments match your criteria</div>
                 <div class="text-xs text-slate-500 mt-1">Try switching filters or click "New Task" above to add an assignment.</div>
               </div>`
            : filtered
                .map((asg) => {
                  const dueInfo = calculateDueNotice(asg.dueDate);
                  const badgeClass = getSubjectBadge(asg.subject);
                  return `
            <div class="asg-card bg-slate-950/70 border ${asg.completed ? 'border-slate-800/60 bg-slate-950/30' : 'border-slate-800 hover:border-emerald-500/40'} rounded-2xl p-4 flex items-start justify-between gap-4 transition-all">
              <div class="flex items-start gap-3.5 flex-1">
                <input type="checkbox" class="asg-chk w-5 h-5 mt-1 accent-emerald-500 cursor-pointer rounded transition-transform hover:scale-110" data-id="${asg.id}" ${asg.completed ? 'checked' : ''} title="Mark as ${asg.completed ? 'Pending' : 'Completed'}">
                <div class="flex-1">
                  <div class="flex items-center flex-wrap gap-2 mb-1.5">
                    <span class="text-sm font-bold ${asg.completed ? 'line-through text-slate-500' : 'text-white'}">${asg.title}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase border ${badgeClass}">
                      ${asg.subject}
                    </span>
                    <span class="text-[10px] px-2 py-0.5 rounded-md font-bold ${
                      asg.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : asg.priority === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }">${asg.priority} priority</span>
                  </div>

                  <p class="text-xs ${asg.completed ? 'text-slate-500' : 'text-slate-300'} mb-2 leading-relaxed">
                    ${asg.notes || '<span class="italic text-slate-500">No additional notes provided.</span>'}
                  </p>

                  <div class="text-[11px] text-slate-400 flex items-center flex-wrap gap-4">
                    <span class="flex items-center gap-1.5"><i class="far fa-calendar-alt text-emerald-400"></i> ${asg.dueDate}</span>
                    <span class="${dueInfo.color}"><i class="fas fa-clock mr-1"></i>${dueInfo.text}</span>
                    <span>Status: <b class="${asg.completed ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}">${asg.completed ? 'Done' : 'Pending'}</b></span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-1">
                <button class="asg-del-btn text-slate-500 hover:text-rose-400 p-2 text-sm rounded-lg hover:bg-slate-800 transition-colors" data-id="${asg.id}" data-title="${encodeURIComponent(asg.title)}" title="Delete Assignment">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          `;
                })
                .join('')
        }
      </div>
    `;

    attachEvents();
  };

  const attachEvents = () => {
    // Subject filter pills
    container.querySelectorAll('.sub-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentSubject = btn.dataset.subject;
        render();
      });
    });

    // Search query
    const searchInput = container.querySelector('#asg-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
      });
    }

    const clearSearch = container.querySelector('#clear-search-btn');
    if (clearSearch) {
      clearSearch.addEventListener('click', () => {
        searchQuery = '';
        render();
      });
    }

    // Status select
    const statusSelect = container.querySelector('#status-select');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        currentStatus = e.target.value;
        render();
      });
    }

    // Sort select
    const sortSelect = container.querySelector('#sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        sortBy = e.target.value;
        render();
      });
    }

    // Toggle Checkbox
    container.querySelectorAll('.asg-chk').forEach((chk) => {
      chk.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        stateStore.toggleAssignmentCompleted(id);
        const item = (stateStore.getState().assignments || []).find((a) => a.id === id);
        if (window.dawamuDialogs?.toast) {
          window.dawamuDialogs.toast({
            message: item && item.completed ? 'Task marked as completed!' : 'Task reopened as pending',
            type: item && item.completed ? 'success' : 'info'
          });
        }
        render();
      });
    });

    // Delete button with unified confirm dialog
    container.querySelectorAll('.asg-del-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const title = decodeURIComponent(btn.dataset.title || 'this assignment');

        if (window.dawamuDialogs?.confirm) {
          const ok = await window.dawamuDialogs.confirm({
            title: 'Delete Assignment',
            message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
            confirmText: 'Delete Task',
            danger: true
          });
          if (!ok) return;
        }

        stateStore.deleteAssignment(id);
        if (window.dawamuDialogs?.toast) {
          window.dawamuDialogs.toast({ message: 'Assignment deleted.', type: 'info' });
        }
        render();
      });
    });

    // Form modal toggles
    const addToggleBtn = container.querySelector('#add-asg-toggle-btn');
    const closeFormBtn = container.querySelector('#close-form-btn');
    const cancelFormBtn = container.querySelector('#cancel-asg-btn');
    const saveFormBtn = container.querySelector('#save-asg-btn');

    if (addToggleBtn) {
      addToggleBtn.addEventListener('click', () => {
        isFormOpen = !isFormOpen;
        render();
      });
    }

    if (closeFormBtn) {
      closeFormBtn.addEventListener('click', () => {
        isFormOpen = false;
        render();
      });
    }

    if (cancelFormBtn) {
      cancelFormBtn.addEventListener('click', () => {
        isFormOpen = false;
        render();
      });
    }

    if (saveFormBtn) {
      saveFormBtn.addEventListener('click', () => {
        const titleInput = container.querySelector('#new-asg-title');
        const title = titleInput ? titleInput.value.trim() : '';
        const subject = container.querySelector('#new-asg-subject')?.value || 'Mathematics';
        const dueDate = container.querySelector('#new-asg-date')?.value || new Date().toISOString().split('T')[0];
        const priority = container.querySelector('#new-asg-priority')?.value || 'medium';
        const notes = container.querySelector('#new-asg-notes')?.value.trim() || '';

        if (!title) {
          if (window.dawamuDialogs?.toast) {
            window.dawamuDialogs.toast({ message: 'Please enter an assignment title.', type: 'warning' });
          }
          if (titleInput) titleInput.focus();
          return;
        }

        stateStore.addAssignment({ title, subject, dueDate, priority, notes });
        isFormOpen = false;
        if (window.dawamuDialogs?.toast) {
          window.dawamuDialogs.toast({ message: `Assignment "${title}" added!`, type: 'success' });
        }
        render();
      });
    }
  };

  render();
  return container;
}
