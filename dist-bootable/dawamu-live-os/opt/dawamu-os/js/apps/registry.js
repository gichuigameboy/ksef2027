/**
 * DawamuOS — Student Registry & IT Administration Application
 *
 * Implements:
 * - Real-time IT Administration Dashboard (metrics, account states, recent students).
 * - Live Student Directory with instant search, filtering, and sorting.
 * - Idempotent Student Registration with single-use activation code generation.
 * - Profile inspection & safe editing.
 * - Direct account suspension and reactivation with immediate auth-layer enforcement.
 * - CSV Bulk Student Import with preview, column validation, duplicate detection, and batch execution.
 * - Tamper-evident, filterable Audit Log.
 */

import { studentRegistryService } from '../services/studentRegistryService.js';
import { stateStore } from '../os/state.js';
import { dawamuDialogs } from '../os/dialogs.js';

export function createRegistryApp() {
  const container = document.createElement('div');
  container.className = 'flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden';

  // 1. Role-based access control guard
  const currentUser = stateStore.getCurrentStudent() || { role: 'student', admNo: '1001', name: 'Student' };
  const allowedRoles = ['it_admin', 'admin', 'super_admin'];
  const isAuthorized = allowedRoles.includes((currentUser.role || '').toLowerCase()) ||
                       currentUser.admNo === 'ADMIN' ||
                       (currentUser.name || '').toLowerCase().includes('admin');

  if (!isAuthorized) {
    container.innerHTML = `
      <div class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
        <div class="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center text-3xl mb-4 shadow-xl shadow-rose-950/40">
          <i class="fas fa-user-lock"></i>
        </div>
        <h2 class="text-xl font-bold text-white mb-2">Access Denied: IT Administrator Only</h2>
        <p class="text-xs text-slate-400 max-w-md leading-relaxed mb-6">
          The Student Registry is restricted to authorized school IT personnel and system administrators.
          Student account provisioning, credential management, and OS access controls require privileged administrative credentials.
        </p>
        <div class="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-left max-w-sm w-full space-y-1.5 text-xs text-slate-300 font-mono">
          <div>Current User: <b class="text-white">${currentUser.name || 'Anonymous'}</b></div>
          <div>Admission No: <b class="text-emerald-400">${currentUser.admNo || 'N/A'}</b></div>
          <div>Active Role: <span class="px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-700/50 uppercase text-[10px] font-bold">${currentUser.role || 'student'}</span></div>
        </div>
      </div>
    `;
    return container;
  }

  // Active view state
  let currentTab = 'dashboard'; // 'dashboard' | 'directory' | 'register' | 'bulk' | 'audit'
  let searchQuery = '';
  let classFilter = 'all';
  let statusFilter = 'all';
  let sortBy = 'created_at';
  let sortOrder = 'desc';

  // Modal state
  let selectedStudent = null;
  let activeModal = null; // null | 'profile' | 'suspend' | 'activation'

  const render = () => {
    container.innerHTML = `
      <!-- App Header & Navigation Toolbar -->
      <header class="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/90 px-5 py-2.5 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-sm shadow-md shadow-purple-950/50 border border-purple-400/30">
            <i class="fas fa-users-gear"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xs font-bold text-white tracking-wide">Student Registry & IT Admin</h1>
              <span class="px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-700/50 text-[9px] font-mono font-bold tracking-wider uppercase">SECURE PROVISIONING</span>
            </div>
            <p class="text-[10px] text-slate-400">DawamuOS Centralized Account Directory & Access Control</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button class="nav-tab px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${currentTab === 'dashboard' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-900'}" data-tab="dashboard">
            <i class="fas fa-chart-pie text-[11px]"></i> <span>Dashboard</span>
          </button>
          <button class="nav-tab px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${currentTab === 'directory' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-900'}" data-tab="directory">
            <i class="fas fa-address-book text-[11px]"></i> <span>Directory</span>
          </button>
          <button class="nav-tab px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${currentTab === 'register' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-900'}" data-tab="register">
            <i class="fas fa-user-plus text-[11px]"></i> <span>Register Student</span>
          </button>
          <button class="nav-tab px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${currentTab === 'bulk' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-900'}" data-tab="bulk">
            <i class="fas fa-file-csv text-[11px]"></i> <span>Bulk Import</span>
          </button>
          <button class="nav-tab px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${currentTab === 'audit' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-900'}" data-tab="audit">
            <i class="fas fa-shield-halved text-[11px]"></i> <span>Audit Log</span>
          </button>
        </nav>
      </header>

      <!-- Main Body Container -->
      <main class="flex-1 overflow-y-auto p-5 relative" id="registry-main-body">
        ${renderActiveTabContent()}
      </main>

      <!-- Modal Backdrop and Container -->
      <div id="registry-modal-container" class="${activeModal ? 'flex' : 'hidden'} fixed inset-0 z-50 items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        ${renderModalContent()}
      </div>
    `;

    attachEvents();
  };

  const renderActiveTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return renderDashboardView();
      case 'directory':
        return renderDirectoryView();
      case 'register':
        return renderRegisterView();
      case 'bulk':
        return renderBulkImportView();
      case 'audit':
        return renderAuditLogView();
      default:
        return renderDashboardView();
    }
  };

  /* ── 1. DASHBOARD VIEW ─────────────────────────────────────────────────── */
  const renderDashboardView = () => {
    const stats = studentRegistryService.getDashboardStats();

    return `
      <div class="max-w-5xl mx-auto space-y-6">
        <!-- Overview Metrics Cards -->
        <div class="grid grid-cols-4 gap-4">
          <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div>
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
              <h3 class="text-2xl font-black text-white mt-1">${stats.total_students}</h3>
              <p class="text-[10px] text-purple-400 mt-1 flex items-center gap-1">
                <i class="fas fa-id-badge text-[9px]"></i> Form 1 – Form 4
              </p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center text-xl">
              <i class="fas fa-graduation-cap"></i>
            </div>
          </div>

          <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div>
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Accounts</p>
              <h3 class="text-2xl font-black text-emerald-400 mt-1">${stats.active_accounts}</h3>
              <p class="text-[10px] text-emerald-300 mt-1 flex items-center gap-1">
                <i class="fas fa-circle-check text-[9px]"></i> Logged-in eligible
              </p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl">
              <i class="fas fa-user-check"></i>
            </div>
          </div>

          <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div>
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Activation</p>
              <h3 class="text-2xl font-black text-amber-400 mt-1">${stats.pending_activation}</h3>
              <p class="text-[10px] text-amber-300 mt-1 flex items-center gap-1">
                <i class="fas fa-clock text-[9px]"></i> Single-use code issued
              </p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl">
              <i class="fas fa-key"></i>
            </div>
          </div>

          <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div>
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Suspended Accounts</p>
              <h3 class="text-2xl font-black text-rose-400 mt-1">${stats.suspended_accounts}</h3>
              <p class="text-[10px] text-rose-300 mt-1 flex items-center gap-1">
                <i class="fas fa-ban text-[9px]"></i> OS Login restricted
              </p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center text-xl">
              <i class="fas fa-user-slash"></i>
            </div>
          </div>
        </div>

        <!-- Quick Administration Actions -->
        <div class="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-800/40 rounded-2xl p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center text-base shadow-md">
              <i class="fas fa-bolt"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-white">Administrator Quick Provisioning</h4>
              <p class="text-xs text-slate-400">Register individual students, import CSV spreadsheets, or audit security events.</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="quick-nav-btn px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer transition-all shadow-md active:scale-95 flex items-center gap-1.5" data-goto="register">
              <i class="fas fa-user-plus text-[11px]"></i> Register Student
            </button>
            <button class="quick-nav-btn px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs cursor-pointer transition-all active:scale-95 flex items-center gap-1.5" data-goto="bulk">
              <i class="fas fa-file-csv text-[11px] text-emerald-400"></i> Import CSV
            </button>
            <button class="quick-nav-btn px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs cursor-pointer transition-all active:scale-95 flex items-center gap-1.5" data-goto="directory">
              <i class="fas fa-list text-[11px] text-blue-400"></i> View All
            </button>
          </div>
        </div>

        <!-- Recently Registered Students Table -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div class="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="fas fa-clock-rotate-left text-purple-400 text-xs"></i>
              <h4 class="text-xs font-bold text-white uppercase tracking-wider">Recently Registered Students</h4>
            </div>
            <button class="quick-nav-btn text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer" data-goto="directory">
              View All Directory &rarr;
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th class="px-5 py-3">Student Name</th>
                  <th class="px-4 py-3">Admission No</th>
                  <th class="px-4 py-3">Class / Grade</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3">Registration Date</th>
                  <th class="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 font-sans">
                ${stats.recent_registrations.map(student => `
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-2.5">
                        <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
                          ${student.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div class="font-bold text-white">${student.full_name}</div>
                          <div class="text-[10px] text-slate-400">${student.email || 'No email registered'}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 font-mono font-bold text-purple-300">${student.admission_number}</td>
                    <td class="px-4 py-3 text-slate-300 font-medium">${student.grade_class}</td>
                    <td class="px-4 py-3">${renderStatusBadge(student.account_status)}</td>
                    <td class="px-4 py-3 text-slate-400 font-mono text-[11px]">${formatDate(student.created_at)}</td>
                    <td class="px-5 py-3 text-right">
                      <button class="view-profile-btn px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 transition-all" data-adm="${student.admission_number}">
                        Manage
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  };

  /* ── 2. DIRECTORY VIEW ──────────────────────────────────────────────────── */
  const renderDirectoryView = () => {
    const students = studentRegistryService.listStudents({
      search: searchQuery,
      gradeClass: classFilter,
      status: statusFilter,
      sortBy: sortBy,
      order: sortOrder
    });

    const uniqueClasses = Array.from(new Set(
      Object.values(studentRegistryService._students).map(s => s.grade_class)
    )).sort();

    return `
      <div class="max-w-6xl mx-auto space-y-4">
        <!-- Controls Toolbar -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-md flex flex-wrap items-center justify-between gap-3">
          <!-- Search input -->
          <div class="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex-1 min-w-[240px] focus-within:border-purple-500 transition-all">
            <i class="fas fa-search text-slate-500 text-xs"></i>
            <input type="text" id="directory-search-input" value="${escapeHtml(searchQuery)}" placeholder="Search by student name, admission number, or email..." class="bg-transparent outline-none text-xs text-white placeholder-slate-500 flex-1">
            ${searchQuery ? `<button id="clear-search-btn" class="text-slate-500 hover:text-white text-xs"><i class="fas fa-times-circle"></i></button>` : ''}
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <!-- Class filter -->
            <select id="filter-class-select" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500 cursor-pointer">
              <option value="all" ${classFilter === 'all' ? 'selected' : ''}>All Classes</option>
              ${uniqueClasses.map(c => `<option value="${c}" ${classFilter === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>

            <!-- Status filter -->
            <select id="filter-status-select" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500 cursor-pointer">
              <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
              <option value="active" ${statusFilter === 'active' ? 'selected' : ''}>Active</option>
              <option value="pending_activation" ${statusFilter === 'pending_activation' ? 'selected' : ''}>Pending Activation</option>
              <option value="suspended" ${statusFilter === 'suspended' ? 'selected' : ''}>Suspended</option>
            </select>

            <!-- Sort By -->
            <select id="sort-by-select" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500 cursor-pointer">
              <option value="created_at:desc" ${sortBy === 'created_at' && sortOrder === 'desc' ? 'selected' : ''}>Newest Registered</option>
              <option value="name:asc" ${sortBy === 'name' && sortOrder === 'asc' ? 'selected' : ''}>Name (A–Z)</option>
              <option value="name:desc" ${sortBy === 'name' && sortOrder === 'desc' ? 'selected' : ''}>Name (Z–A)</option>
              <option value="admission_number:asc" ${sortBy === 'admission_number' && sortOrder === 'asc' ? 'selected' : ''}>Admission No (Asc)</option>
              <option value="admission_number:desc" ${sortBy === 'admission_number' && sortOrder === 'desc' ? 'selected' : ''}>Admission No (Desc)</option>
            </select>

            <!-- Action buttons -->
            <button class="quick-nav-btn px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer transition-all shadow-md flex items-center gap-1.5" data-goto="register">
              <i class="fas fa-plus text-[10px]"></i> New Student
            </button>
            <button id="export-csv-btn" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5" title="Export Directory to CSV">
              <i class="fas fa-file-export text-[10px] text-emerald-400"></i> Export
            </button>
          </div>
        </div>

        <!-- Student Records Table -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div class="px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Showing <b class="text-white">${students.length}</b> student records</span>
            <span class="text-[11px] font-mono">Storage: Authoritative Dawamu DB</span>
          </div>

          ${students.length === 0 ? `
            <div class="py-14 text-center space-y-3">
              <div class="w-12 h-12 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto text-xl">
                <i class="fas fa-user-slash"></i>
              </div>
              <h5 class="text-sm font-bold text-white">No Matching Students Found</h5>
              <p class="text-xs text-slate-500 max-w-sm mx-auto">Try adjusting your search query or clear the active class and status filters.</p>
              <button id="reset-filters-btn" class="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer">
                Reset All Filters
              </button>
            </div>
          ` : `
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th class="px-5 py-3">Student Name</th>
                    <th class="px-4 py-3">Admission No</th>
                    <th class="px-4 py-3">Class / Grade</th>
                    <th class="px-4 py-3">Account Status</th>
                    <th class="px-4 py-3">Registered</th>
                    <th class="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60 font-sans">
                  ${students.map(student => `
                    <tr class="hover:bg-slate-800/40 transition-colors">
                      <td class="px-5 py-3">
                        <div class="flex items-center gap-2.5">
                          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            ${student.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div class="font-bold text-white text-xs">${student.full_name}</div>
                            <div class="text-[10px] text-slate-400">${student.email || 'No email registered'}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-3 font-mono font-bold text-purple-300">${student.admission_number}</td>
                      <td class="px-4 py-3 text-slate-300 font-medium">${student.grade_class}</td>
                      <td class="px-4 py-3">${renderStatusBadge(student.account_status)}</td>
                      <td class="px-4 py-3 text-slate-400 font-mono text-[11px]">${formatDate(student.created_at)}</td>
                      <td class="px-5 py-3 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                          <button class="view-profile-btn px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 transition-all" data-adm="${student.admission_number}" title="Edit Profile & Details">
                            <i class="fas fa-edit mr-1 text-[10px] text-purple-400"></i> Edit
                          </button>
                          ${student.account_status === 'suspended' ? `
                            <button class="reactivate-btn px-2.5 py-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 text-xs font-semibold cursor-pointer border border-emerald-600/40 transition-all" data-adm="${student.admission_number}" title="Restore Login Access">
                              <i class="fas fa-user-check mr-1 text-[10px]"></i> Unsuspend
                            </button>
                          ` : `
                            <button class="suspend-btn px-2.5 py-1 rounded-lg bg-rose-900/40 hover:bg-rose-800/60 text-rose-300 text-xs font-semibold cursor-pointer border border-rose-600/40 transition-all" data-adm="${student.admission_number}" title="Disable Student Login Access">
                              <i class="fas fa-ban mr-1 text-[10px]"></i> Suspend
                            </button>
                          `}
                          <button class="reset-activation-btn px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold cursor-pointer border border-slate-700 transition-all" data-adm="${student.admission_number}" title="Generate New Single-Use Code">
                            <i class="fas fa-key text-[10px]"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  };

  /* ── 3. REGISTER STUDENT VIEW ─────────────────────────────────────────── */
  const renderRegisterView = () => {
    return `
      <div class="max-w-2xl mx-auto space-y-6">
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div class="flex items-center gap-3 border-b border-slate-800 pb-4 mb-5">
            <div class="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-lg">
              <i class="fas fa-user-plus"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white">Student Registration & Account Provisioning</h3>
              <p class="text-xs text-slate-400">Registers the student and generates a single-use setup code for their first OS login.</p>
            </div>
          </div>

          <form id="student-registration-form" class="space-y-4" onsubmit="return false;">
            <!-- Admission Number -->
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admission Number <span class="text-rose-400">*</span>
              </label>
              <div class="relative">
                <i class="fas fa-id-badge absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                <input type="text" id="reg-adm" placeholder="e.g. 1050 or ADM-1050" required
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono placeholder-slate-600 outline-none focus:border-purple-500 transition-colors uppercase">
              </div>
              <div id="reg-adm-feedback" class="text-[11px] mt-1 text-slate-500 font-medium">Unique student identifier across the school OS.</div>
            </div>

            <!-- Full Name -->
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Student Full Name <span class="text-rose-400">*</span>
              </label>
              <div class="relative">
                <i class="fas fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                <input type="text" id="reg-name" placeholder="e.g. Grace Muthoni" required
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-purple-500 transition-colors">
              </div>
            </div>

            <!-- Class / Grade -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Class / Year Group <span class="text-rose-400">*</span>
                </label>
                <div class="relative">
                  <i class="fas fa-graduation-cap absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                  <input type="text" id="reg-grade" list="grade-presets" placeholder="e.g. Form 1 East" required
                    class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-purple-500 transition-colors">
                  <datalist id="grade-presets">
                    <option value="Form 1 East"></option>
                    <option value="Form 1 West"></option>
                    <option value="Form 2 North"></option>
                    <option value="Form 2 South"></option>
                    <option value="Form 3 Science"></option>
                    <option value="Form 3 Arts"></option>
                    <option value="Form 4 KCSE"></option>
                  </datalist>
                </div>
              </div>

              <!-- School Email -->
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  School Email <span class="text-slate-500 text-[10px] lowercase">(optional)</span>
                </label>
                <div class="relative">
                  <i class="fas fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                  <input type="email" id="reg-email" placeholder="e.g. gmuthoni@dawamu.ac.ke"
                    class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-purple-500 transition-colors">
                </div>
              </div>
            </div>

            <!-- Administrative Notes -->
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Administrative Notes <span class="text-slate-500 text-[10px] lowercase">(optional)</span>
              </label>
              <textarea id="reg-notes" rows="2" placeholder="Optional notes (e.g. special accommodation, house/dormitory, transfer record)..."
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 outline-none focus:border-purple-500 transition-colors resize-none"></textarea>
            </div>

            <div id="reg-error-msg" class="hidden p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2"></div>

            <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button type="reset" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer">
                Clear
              </button>
              <button type="submit" id="submit-register-btn" class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all cursor-pointer flex items-center gap-2 active:scale-95">
                <i class="fas fa-check"></i> Provision Student Account
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  };

  /* ── 4. BULK CSV IMPORT VIEW ───────────────────────────────────────────── */
  const renderBulkImportView = () => {
    return `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg">
                <i class="fas fa-file-csv"></i>
              </div>
              <div>
                <h3 class="text-sm font-bold text-white">Bulk Student CSV Import</h3>
                <p class="text-xs text-slate-400">Import student batches directly from a school spreadsheet file.</p>
              </div>
            </div>
            <button id="download-csv-template-btn" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5">
              <i class="fas fa-download text-emerald-400 text-[10px]"></i> Download Template CSV
            </button>
          </div>

          <!-- Upload Dropzone -->
          <div id="csv-dropzone" class="border-2 border-dashed border-slate-700 hover:border-purple-500/80 bg-slate-950/60 rounded-2xl p-8 text-center transition-all cursor-pointer space-y-3">
            <input type="file" id="csv-file-input" accept=".csv,text/csv" class="hidden">
            <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto text-xl">
              <i class="fas fa-cloud-arrow-up"></i>
            </div>
            <div>
              <p class="text-xs font-bold text-white">Click to select CSV file, or drag & drop here</p>
              <p class="text-[11px] text-slate-500 mt-0.5">Required columns: <code class="text-purple-300 font-mono">full_name, admission_number, grade_class</code></p>
            </div>
          </div>

          <!-- Preview & Action Container (populated when file chosen) -->
          <div id="csv-preview-container" class="hidden space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <span id="csv-preview-title" class="text-xs font-bold text-white">CSV File Preview</span>
              <button id="clear-csv-btn" class="text-xs text-slate-400 hover:text-white cursor-pointer">
                <i class="fas fa-times mr-1"></i> Cancel
              </button>
            </div>

            <div class="max-h-60 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950">
              <table id="csv-preview-table" class="w-full text-left text-xs font-mono"></table>
            </div>

            <div id="csv-import-summary" class="text-xs p-3 rounded-xl bg-slate-800/60 border border-slate-700"></div>

            <div class="flex justify-end gap-2 pt-2">
              <button id="execute-import-btn" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-2 active:scale-95">
                <i class="fas fa-play"></i> Execute Safe Batch Provisioning
              </button>
            </div>
          </div>

          <!-- Results Summary (shown after import) -->
          <div id="csv-results-container" class="hidden space-y-4 p-4 rounded-xl bg-slate-950 border border-emerald-500/30"></div>
        </div>
      </div>
    `;
  };

  /* ── 5. AUDIT LOG VIEW ──────────────────────────────────────────────────── */
  const renderAuditLogView = () => {
    const logs = studentRegistryService.getAuditLogs({ limit: 150 });

    return `
      <div class="max-w-5xl mx-auto space-y-4">
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-lg">
              <i class="fas fa-shield-halved"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white">System Security & Provisioning Audit Log</h3>
              <p class="text-xs text-slate-400">Append-only administrative event log. Credentials and private passwords are never logged.</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-xs font-mono text-purple-300 font-bold">${logs.length} Logged Events</span>
          </div>
        </div>

        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th class="px-4 py-3">Timestamp</th>
                  <th class="px-4 py-3">Action</th>
                  <th class="px-4 py-3">Administrator</th>
                  <th class="px-4 py-3">Target Student</th>
                  <th class="px-4 py-3">Event Details</th>
                  <th class="px-4 py-3 text-right">Outcome</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 font-sans">
                ${logs.map(log => `
                  <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="px-4 py-2.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">${formatDate(log.timestamp)}</td>
                    <td class="px-4 py-2.5">
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${getActionBadgeClass(log.action)}">
                        ${log.action}
                      </span>
                    </td>
                    <td class="px-4 py-2.5 font-bold text-slate-300 text-[11px]">${log.actor_id}</td>
                    <td class="px-4 py-2.5 font-bold text-purple-300 text-[11px]">${log.target_id || ''} ${log.target_name ? `(${log.target_name})` : ''}</td>
                    <td class="px-4 py-2.5 text-slate-300 max-w-xs truncate text-[11px]">${log.details}</td>
                    <td class="px-4 py-2.5 text-right font-mono font-bold text-[10px]">
                      <span class="${log.outcome === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}">${log.outcome}</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  };

  /* ── MODALS RENDERER ────────────────────────────────────────────────────── */
  const renderModalContent = () => {
    if (!activeModal || !selectedStudent) return '';

    if (activeModal === 'profile') {
      return `
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                ${selectedStudent.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 class="text-sm font-bold text-white">${selectedStudent.full_name}</h3>
                <p class="text-xs text-purple-300 font-mono">Admission: ${selectedStudent.admission_number}</p>
              </div>
            </div>
            <button id="close-modal-btn" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form id="edit-student-form" class="space-y-3.5" onsubmit="return false;">
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Full Name</label>
              <input type="text" id="edit-name" value="${escapeHtml(selectedStudent.full_name)}" required
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-purple-500">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Class / Grade</label>
                <input type="text" id="edit-grade" value="${escapeHtml(selectedStudent.grade_class)}" required
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-purple-500">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">School Email</label>
                <input type="email" id="edit-email" value="${escapeHtml(selectedStudent.email || '')}"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-purple-500">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Administrative Notes</label>
              <textarea id="edit-notes" rows="2" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500 resize-none">${escapeHtml(selectedStudent.notes || '')}</textarea>
            </div>

            <div class="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5 text-xs text-slate-400">
              <div class="flex justify-between">
                <span>Account Status:</span>
                <div>${renderStatusBadge(selectedStudent.account_status)}</div>
              </div>
              <div class="flex justify-between">
                <span>Registered On:</span>
                <span class="font-mono text-slate-200">${formatDate(selectedStudent.created_at)}</span>
              </div>
              <div class="flex justify-between">
                <span>Last OS Session:</span>
                <span class="font-mono text-slate-200">${selectedStudent.last_login_at ? formatDate(selectedStudent.last_login_at) : 'Never logged in'}</span>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button type="button" id="modal-reset-activation-btn" class="px-3 py-2 rounded-xl bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 border border-amber-600/40 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5">
                <i class="fas fa-key text-[10px]"></i> Reset Setup Code
              </button>
              <div class="flex gap-2">
                <button type="button" id="modal-cancel-btn" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" id="modal-save-btn" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer">
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      `;
    }

    if (activeModal === 'suspend') {
      return `
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center text-xl mx-auto">
            <i class="fas fa-user-lock"></i>
          </div>
          <div class="text-center">
            <h3 class="text-sm font-bold text-white">Confirm Account Suspension</h3>
            <p class="text-xs text-slate-400 mt-1">
              Are you sure you want to suspend <b class="text-white">${selectedStudent.full_name}</b> (Adm: <span class="text-rose-400 font-mono">${selectedStudent.admission_number}</span>)?
            </p>
          </div>

          <p class="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
            <i class="fas fa-info-circle mr-1"></i> The student will be instantly blocked from logging in to DawamuOS. Their files and homework will remain completely safe.
          </p>

          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Reason for Suspension</label>
            <input type="text" id="suspend-reason-input" placeholder="e.g. Exam integrity review, pending disciplinary..." class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500">
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button id="modal-cancel-btn" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer">
              Cancel
            </button>
            <button id="confirm-suspend-btn" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer">
              Suspend Account
            </button>
          </div>
        </div>
      `;
    }

    if (activeModal === 'activation') {
      const code = selectedStudent._newActivationCode;
      return `
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4 text-center">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl mx-auto">
            <i class="fas fa-key"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">Student Account Provisioned</h3>
            <p class="text-xs text-slate-400 mt-1">Provide this single-use code to <b class="text-white">${selectedStudent.full_name}</b>:</p>
          </div>

          <div class="bg-slate-950 border border-purple-500/40 rounded-2xl p-4 shadow-inner">
            <div class="text-[10px] text-purple-400 uppercase font-mono tracking-widest font-bold">Single-Use Activation Code</div>
            <div class="text-2xl font-black font-mono text-emerald-400 tracking-widest my-1 select-all">${code}</div>
            <div class="text-[10px] text-slate-500">Expires after first password establishment</div>
          </div>

          <div class="text-left text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
            <div>1. Student goes to DawamuOS login screen.</div>
            <div>2. Clicks <b>"First-Time Student Setup / Activate Account"</b>.</div>
            <div>3. Enters Admission No <b>${selectedStudent.admission_number}</b> and this code.</div>
            <div>4. Chooses their private secret password.</div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button id="modal-cancel-btn" class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer w-full">
              Done & Return to Directory
            </button>
          </div>
        </div>
      `;
    }

    return '';
  };

  /* ── EVENT BINDINGS ─────────────────────────────────────────────────────── */
  const attachEvents = () => {
    // Navigation Tabs
    container.querySelectorAll('.nav-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        currentTab = btn.getAttribute('data-tab');
        render();
      });
    });

    container.querySelectorAll('.quick-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentTab = btn.getAttribute('data-goto');
        render();
      });
    });

    // Directory Search & Filters
    const searchInput = container.querySelector('#directory-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        const tbody = container.querySelector('tbody');
        if (tbody) render();
      });
    }

    container.querySelector('#clear-search-btn')?.addEventListener('click', () => {
      searchQuery = '';
      render();
    });

    container.querySelector('#filter-class-select')?.addEventListener('change', (e) => {
      classFilter = e.target.value;
      render();
    });

    container.querySelector('#filter-status-select')?.addEventListener('change', (e) => {
      statusFilter = e.target.value;
      render();
    });

    container.querySelector('#sort-by-select')?.addEventListener('change', (e) => {
      const parts = e.target.value.split(':');
      sortBy = parts[0];
      sortOrder = parts[1] || 'asc';
      render();
    });

    container.querySelector('#reset-filters-btn')?.addEventListener('click', () => {
      searchQuery = '';
      classFilter = 'all';
      statusFilter = 'all';
      render();
    });

    // Student Actions
    container.querySelectorAll('.view-profile-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const adm = btn.getAttribute('data-adm');
        selectedStudent = studentRegistryService.getStudent(adm);
        if (selectedStudent) {
          activeModal = 'profile';
          render();
        }
      });
    });

    container.querySelectorAll('.suspend-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const adm = btn.getAttribute('data-adm');
        selectedStudent = studentRegistryService.getStudent(adm);
        if (selectedStudent) {
          activeModal = 'suspend';
          render();
        }
      });
    });

    container.querySelectorAll('.reactivate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const adm = btn.getAttribute('data-adm');
        try {
          studentRegistryService.setAccountStatus(adm, 'active', 'Reactivated by IT Administrator', {
            id: currentUser.admNo || 'ADMIN',
            role: currentUser.role || 'it_admin'
          });
          dawamuDialogs.toast(`Account for ${adm} has been reactivated.`, 'success');
          render();
        } catch (err) {
          dawamuDialogs.toast(err.message, 'error');
        }
      });
    });

    container.querySelectorAll('.reset-activation-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const adm = btn.getAttribute('data-adm');
        const st = studentRegistryService.getStudent(adm);
        if (!st) return;
        const code = await studentRegistryService.resetActivationCode(adm, {
          id: currentUser.admNo || 'ADMIN',
          role: currentUser.role || 'it_admin'
        });
        selectedStudent = { ...st, _newActivationCode: code };
        activeModal = 'activation';
        render();
      });
    });

    // Registration Form
    const regForm = container.querySelector('#student-registration-form');
    if (regForm) {
      const admInput = container.querySelector('#reg-adm');
      const feedback = container.querySelector('#reg-adm-feedback');

      admInput?.addEventListener('input', () => {
        const val = admInput.value.trim().toUpperCase();
        if (val && studentRegistryService.getStudent(val)) {
          feedback.textContent = `Warning: Admission number ${val} is already registered!`;
          feedback.className = 'text-[11px] mt-1 text-rose-400 font-bold';
        } else {
          feedback.textContent = 'Unique student identifier across the school OS.';
          feedback.className = 'text-[11px] mt-1 text-slate-500 font-medium';
        }
      });

      regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const adm = container.querySelector('#reg-adm').value.trim().toUpperCase();
        const name = container.querySelector('#reg-name').value.trim();
        const grade = container.querySelector('#reg-grade').value.trim();
        const email = container.querySelector('#reg-email').value.trim();
        const notes = container.querySelector('#reg-notes').value.trim();
        const errEl = container.querySelector('#reg-error-msg');

        errEl.classList.add('hidden');

        try {
          const res = await studentRegistryService.registerStudent({
            admissionNumber: adm,
            fullName: name,
            gradeClass: grade,
            email: email,
            notes: notes
          }, {
            id: currentUser.admNo || 'ADMIN',
            role: currentUser.role || 'it_admin'
          });

          dawamuDialogs.toast(`Student ${name} (${adm}) provisioned successfully!`, 'success');
          selectedStudent = { ...res.student, _newActivationCode: res.activationCode };
          activeModal = 'activation';
          currentTab = 'directory';
          render();
        } catch (err) {
          errEl.textContent = err.message;
          errEl.classList.remove('hidden');
        }
      });
    }

    // CSV Template Download
    container.querySelector('#download-csv-template-btn')?.addEventListener('click', () => {
      const csv = studentRegistryService.generateSampleCsv();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dawamu_student_import_template.csv';
      a.click();
      URL.revokeObjectURL(url);
      dawamuDialogs.toast('Template CSV downloaded.', 'info');
    });

    // CSV Export
    container.querySelector('#export-csv-btn')?.addEventListener('click', () => {
      const students = Object.values(studentRegistryService._students);
      const rows = [
        ['full_name', 'admission_number', 'grade_class', 'email', 'account_status', 'created_at']
      ];
      for (const s of students) {
        rows.push([
          `"${s.full_name}"`,
          `"${s.admission_number}"`,
          `"${s.grade_class}"`,
          `"${s.email || ''}"`,
          `"${s.account_status}"`,
          `"${s.created_at}"`
        ]);
      }
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dawamu_students_directory_${new Date().toISOString().substring(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      dawamuDialogs.toast(`Exported ${students.length} student records to CSV.`, 'success');
    });

    // CSV Dropzone
    const dropzone = container.querySelector('#csv-dropzone');
    const fileInput = container.querySelector('#csv-file-input');
    let loadedCsvText = '';

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-purple-500', 'bg-purple-950/20');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-purple-500', 'bg-purple-950/20');
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-purple-500', 'bg-purple-950/20');
        if (e.dataTransfer?.files?.length) {
          handleCsvFile(e.dataTransfer.files[0]);
        }
      });
      fileInput.addEventListener('change', () => {
        if (fileInput.files?.length) {
          handleCsvFile(fileInput.files[0]);
        }
      });
    }

    const handleCsvFile = (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        loadedCsvText = e.target.result;
        showCsvPreview(loadedCsvText, file.name);
      };
      reader.readAsText(file);
    };

    const showCsvPreview = (csvText, fileName) => {
      const previewContainer = container.querySelector('#csv-preview-container');
      const previewTable = container.querySelector('#csv-preview-table');
      const summary = container.querySelector('#csv-import-summary');
      if (!previewContainer || !previewTable) return;

      const lines = csvText.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        dawamuDialogs.toast('CSV must contain a header and at least one student record.', 'error');
        return;
      }

      const rows = lines.slice(0, 10).map(l => l.split(',').map(c => c.replace(/^"|"$/g, '').trim()));
      let tableHtml = `<thead><tr class="bg-slate-900 text-purple-300 font-bold">`;
      for (const h of rows[0]) {
        tableHtml += `<th class="p-2 border-b border-slate-800">${escapeHtml(h)}</th>`;
      }
      tableHtml += `</tr></thead><tbody>`;

      for (let i = 1; i < rows.length; i++) {
        tableHtml += `<tr class="hover:bg-slate-900/50">`;
        for (const cell of rows[i]) {
          tableHtml += `<td class="p-2 border-b border-slate-800/60">${escapeHtml(cell)}</td>`;
        }
        tableHtml += `</tr>`;
      }
      tableHtml += `</tbody>`;

      previewTable.innerHTML = tableHtml;
      summary.innerHTML = `File: <b class="text-white">${fileName}</b> &bull; Found <b>${lines.length - 1}</b> data row(s). Click Execute to safely batch provision accounts.`;
      previewContainer.classList.remove('hidden');
    };

    container.querySelector('#clear-csv-btn')?.addEventListener('click', () => {
      loadedCsvText = '';
      container.querySelector('#csv-preview-container')?.classList.add('hidden');
      if (fileInput) fileInput.value = '';
    });

    container.querySelector('#execute-import-btn')?.addEventListener('click', async () => {
      if (!loadedCsvText) return;
      const res = await studentRegistryService.bulkImport(loadedCsvText, {
        id: currentUser.admNo || 'ADMIN',
        role: currentUser.role || 'it_admin'
      });

      const resContainer = container.querySelector('#csv-results-container');
      if (resContainer) {
        resContainer.innerHTML = `
          <div class="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <i class="fas fa-check-circle"></i> Bulk Import Finished
          </div>
          <div class="grid grid-cols-3 gap-3 text-xs">
            <div class="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div class="text-slate-400">Successfully Provisioned:</div>
              <div class="text-xl font-black text-emerald-400 mt-1">${res.imported}</div>
            </div>
            <div class="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div class="text-slate-400">Skipped (Duplicate):</div>
              <div class="text-xl font-black text-amber-400 mt-1">${res.skipped}</div>
            </div>
            <div class="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div class="text-slate-400">Failed / Errors:</div>
              <div class="text-xl font-black text-rose-400 mt-1">${res.failed}</div>
            </div>
          </div>
          ${res.newStudents.length > 0 ? `
            <div class="space-y-1.5">
              <div class="text-xs font-bold text-white uppercase">Generated Student Activation Codes:</div>
              <div class="max-h-40 overflow-y-auto border border-slate-800 rounded-xl bg-slate-900 p-2 space-y-1 text-xs font-mono">
                ${res.newStudents.map(st => `
                  <div class="flex items-center justify-between p-1.5 bg-slate-950 rounded-lg">
                    <span>${st.admission_number}: <b class="text-white">${st.full_name}</b></span>
                    <span class="text-emerald-400 font-bold font-mono">${st.activation_code}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          ${res.errors.length > 0 ? `
            <div class="text-[11px] text-rose-400 space-y-0.5">
              <div class="font-bold">Errors & Skipped Details:</div>
              ${res.errors.map(err => `<div>&bull; ${escapeHtml(err)}</div>`).join('')}
            </div>
          ` : ''}
        `;
        resContainer.classList.remove('hidden');
        container.querySelector('#csv-preview-container')?.classList.add('hidden');
      }

      dawamuDialogs.toast(`Bulk import completed: ${res.imported} accounts provisioned.`, 'success');
    });

    // Modals actions
    container.querySelector('#close-modal-btn')?.addEventListener('click', () => {
      activeModal = null;
      render();
    });

    container.querySelector('#modal-cancel-btn')?.addEventListener('click', () => {
      activeModal = null;
      render();
    });

    container.querySelector('#edit-student-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!selectedStudent) return;
      const name = container.querySelector('#edit-name').value.trim();
      const grade = container.querySelector('#edit-grade').value.trim();
      const email = container.querySelector('#edit-email').value.trim();
      const notes = container.querySelector('#edit-notes').value.trim();

      try {
        studentRegistryService.updateStudent(selectedStudent.admission_number, {
          fullName: name,
          gradeClass: grade,
          email: email,
          notes: notes
        }, {
          id: currentUser.admNo || 'ADMIN',
          role: currentUser.role || 'it_admin'
        });
        dawamuDialogs.toast(`Updated details for ${selectedStudent.admission_number}`, 'success');
        activeModal = null;
        render();
      } catch (err) {
        dawamuDialogs.toast(err.message, 'error');
      }
    });

    container.querySelector('#confirm-suspend-btn')?.addEventListener('click', () => {
      if (!selectedStudent) return;
      const reason = container.querySelector('#suspend-reason-input').value.trim();
      try {
        studentRegistryService.setAccountStatus(selectedStudent.admission_number, 'suspended', reason, {
          id: currentUser.admNo || 'ADMIN',
          role: currentUser.role || 'it_admin'
        });
        dawamuDialogs.toast(`Account for ${selectedStudent.admission_number} suspended.`, 'info');
        activeModal = null;
        render();
      } catch (err) {
        dawamuDialogs.toast(err.message, 'error');
      }
    });

    container.querySelector('#modal-reset-activation-btn')?.addEventListener('click', async () => {
      if (!selectedStudent) return;
      const code = await studentRegistryService.resetActivationCode(selectedStudent.admission_number, {
        id: currentUser.admNo || 'ADMIN',
        role: currentUser.role || 'it_admin'
      });
      selectedStudent = { ...selectedStudent, _newActivationCode: code };
      activeModal = 'activation';
      render();
    });
  };

  /* ── VIEW HELPERS ───────────────────────────────────────────────────────── */
  const renderStatusBadge = (st) => {
    switch (st) {
      case 'active':
        return `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900/50 text-emerald-300 border border-emerald-600/50 font-mono text-[10px] font-bold uppercase"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> ACTIVE</span>`;
      case 'pending_activation':
        return `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-900/50 text-amber-300 border border-amber-600/50 font-mono text-[10px] font-bold uppercase"><span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> PENDING</span>`;
      case 'suspended':
        return `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-900/50 text-rose-300 border border-rose-600/50 font-mono text-[10px] font-bold uppercase"><span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span> SUSPENDED</span>`;
      default:
        return `<span class="inline-flex items-center px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] uppercase">${st}</span>`;
    }
  };

  const getActionBadgeClass = (action) => {
    if (action.includes('REGISTERED') || action.includes('INIT')) return 'bg-purple-900/60 text-purple-300 border border-purple-700/50';
    if (action.includes('ACTIVAT')) return 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50';
    if (action.includes('SUSPEND') || action.includes('BLOCKED') || action.includes('FAILED')) return 'bg-rose-900/60 text-rose-300 border border-rose-700/50';
    if (action.includes('UPDATED')) return 'bg-blue-900/60 text-blue-300 border border-blue-700/50';
    return 'bg-slate-800 text-slate-300 border border-slate-700';
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
             d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch (_) {
      return isoString;
    }
  };

  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  // Initial render
  render();

  // Subscribe to registry events for live updates across windows
  studentRegistryService.subscribe(() => {
    if (container.isConnected) {
      render();
    }
  });

  return container;
}
