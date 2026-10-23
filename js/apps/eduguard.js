import { EduGuardClient, LOCAL_SUBJECTS, LOCAL_TOPICS, LOCAL_PREREQUISITES } from '../services/eduguardClient.js';

/**
 * Dawamu OS - EduGuard AI Learning Intelligence & Exam Proctoring Application
 *
 * Kenya Science & Engineering Fair (KSEF 2027) Edition
 * Fully Redesigned Premium Interface — Inspired by OpenAI / Linear / EduGuard Flutter Web Engine
 */

export function createEduGuardApp(student = null) {
  const root = document.createElement('div');
  root.className = 'eduguard-shell flex flex-col h-full w-full overflow-hidden select-none';

  const currentStudent = student || {
    name: 'Brian Ochieng',
    admNo: '1001',
    grade: 'Form 1'
  };

  const client = new EduGuardClient(currentStudent);

  // User/backend text sanitizer
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ─── STATE MANAGEMENT ──────────────────────────────────────────────────────────
  let activeTab = 'dashboard';
  let isCanvasMode = false;

  // Selected entities for drill-down views
  let selectedSubjectId = 'mathematics';
  let selectedTopicId = 'quadratic_equations';
  let selectedTopicName = 'Quadratic Equations';

  // Live Data State
  let liveNextAction = null;
  let liveInsights = [];
  let liveMasteries = [];
  let liveMission = null;
  let isBackendOnline = false;

  // Diagnostic Session State
  let activeDiagnosticSession = null;
  let currentDiagnosticQuestion = null;
  let diagnosticAnswers = {};
  let diagnosticFeedback = null;
  let diagnosticIsSubmitting = false;
  let diagnosticCompletedProfile = null;
  let diagnosticTimeLeft = 300; // 5 minutes
  let diagnosticTimerId = null;

  // "Why Am I Struggling?" State
  let whyDiagnosis = null;
  let whyIsLoading = false;

  // Retention Center State
  let retentionData = { fresh: [], stable: [], at_risk: [], due: [] };
  let activeRetentionTab = 'due';

  // Knowledge Map State
  let selectedNodeData = null;

  // Notes Analyzer State
  let notesInputText = "A quadratic equation is a second-order polynomial equation in a single variable x: ax² + bx + c = 0 with a ≠ 0. The solutions are roots determined either by factorization using binomial pairs, completing the square, or applying the quadratic formula: x = (-b ± √(b² - 4ac)) / (2a). The discriminant Δ = b² - 4ac characterizes the nature of the roots: Δ > 0 yields two distinct real roots, Δ = 0 yields one repeated root, and Δ < 0 yields no real roots.";
  let analyzedNotesResult = null;
  let notesActiveTab = 'concepts'; // 'concepts' | 'flashcards' | 'questions' | 'prereqs'
  let currentFlashcardIndex = 0;
  let isFlashcardFlipped = false;
  let notesIsLoading = false;

  // AI Tutor State
  let tutorTopicId = 'quadratic_equations';
  let tutorTopicTitle = 'Quadratic Equations';
  let chatMessages = [
    {
      sender: 'ai',
      text: `Habari ${currentStudent.name}! I am your EduGuard AI Academic Tutor. I help you solve KCSE and CBC problems step-by-step, diagnose foundational gaps, explain complex topics in Mathematics, Biology, Chemistry, and Physics, and provide guided practice. What would you like to master today?`,
      time: 'Just now'
    }
  ];
  let tutorIsLoading = false;

  // Teacher Hub State
  let teacherSubject = 'mathematics';
  let teacherActiveTab = 'heatmap'; // 'heatmap' | 'misconceptions' | 'atrisk' | 'difficulty'
  let teacherHeatmap = null;
  let teacherMisconceptions = null;
  let teacherAtRisk = null;
  let teacherDifficulty = null;
  let teacherIsLoading = false;

  // Exam Guard Proctoring State
  let proctorActive = false;
  let integrityScore = 100;
  let integrityViolations = [];
  let examCurrentIndex = 0;
  let examAnswers = {};
  let examCompleted = false;

  const EXAM_QUESTIONS = [
    {
      id: 1,
      subject: 'Mathematics',
      topic: 'Quadratic Equations',
      question: 'Solve for x: x² - 5x + 6 = 0',
      options: ['x = 2 or x = 3', 'x = -2 or x = -3', 'x = 1 or x = 6', 'x = -1 or x = -6'],
      correctIndex: 0,
      explanation: 'Factorizing gives (x - 2)(x - 3) = 0. Therefore, x = 2 or x = 3.'
    },
    {
      id: 2,
      subject: 'Biology',
      topic: 'Cell Physiology',
      question: 'What happens to a fresh plant cell placed in a concentrated (hypertonic) salt solution?',
      options: [
        'It absorbs water by osmosis and bursts (lysis)',
        'It loses water by osmosis and becomes plasmolysed/flaccid',
        'It absorbs salt by active transport and swells',
        'No change occurs because the cell wall is impermeable'
      ],
      correctIndex: 1,
      explanation: 'Water moves out of the vacuole by osmosis into the hypertonic medium, pulling the membrane away from the wall (plasmolysis).'
    },
    {
      id: 3,
      subject: 'Chemistry',
      topic: 'Chemical Bonding',
      question: 'Which of the following substances possesses a giant covalent (macromolecular) structure with a high melting point?',
      options: [
        'Sodium Chloride (NaCl)',
        'Silicon(IV) Oxide (Quartz, SiO₂)',
        'Carbon Dioxide (Dry Ice, CO₂)',
        'Magnesium Oxide (MgO)'
      ],
      correctIndex: 1,
      explanation: 'Silicon(IV) Oxide forms a 3D network of covalent bonds between silicon and oxygen atoms requiring high energy to break.'
    },
    {
      id: 4,
      subject: 'Physics',
      topic: 'Kinematics',
      question: 'A car accelerates uniformly from rest to a velocity of 20 m/s in 5 seconds. What is the total distance covered during this time?',
      options: [
        '100 meters',
        '50 meters',
        '25 meters',
        '200 meters'
      ],
      correctIndex: 1,
      explanation: 's = ½(u + v)t = ½(0 + 20) × 5 = 10 × 5 = 50 meters.'
    },
    {
      id: 5,
      subject: 'Computer Science',
      topic: 'Boolean Logic',
      question: 'By De Morgan’s Law, which boolean expression is identical to NOT (A AND B)?',
      options: [
        '(NOT A) OR (NOT B)',
        '(NOT A) AND (NOT B)',
        'A OR B',
        'NOT (A OR B)'
      ],
      correctIndex: 0,
      explanation: '¬(A ∧ B) ≡ (¬A) ∨ (¬B). Distributing NOT flips the logical conjunction to disjunction.'
    }
  ];

  // ─── PROCTORING MONITORING HOOKS ──────────────────────────────────────────────
  const handleVisibilityChange = () => {
    if (!proctorActive || examCompleted) return;
    if (document.hidden) {
      recordProctorViolation('Focus Loss (Switched tab or minimized application)', 15);
    }
  };

  const handleWindowBlur = () => {
    if (!proctorActive || examCompleted) return;
    recordProctorViolation('Desktop Window Lost Focus (Attempted background multi-tasking)', 10);
  };

  const handleCopyPaste = (e) => {
    if (!proctorActive || examCompleted) return;
    e.preventDefault();
    recordProctorViolation('Clipboard Access Blocked (Copy/Paste operation restricted during exam)', 5);
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleWindowBlur);
  window.addEventListener('copy', handleCopyPaste);
  window.addEventListener('paste', handleCopyPaste);

  function recordProctorViolation(reason, penalty = 10) {
    integrityScore = Math.max(0, integrityScore - penalty);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    integrityViolations.unshift({ reason, penalty, time });
    render();
  }

  // ─── INITIAL DATA LOADER ──────────────────────────────────────────────────────
  async function loadInitialData() {
    isBackendOnline = await client.checkHealth();
    try {
      liveMasteries = await client.getMasteryOverview();
      liveNextAction = await client.getNextAction();
      liveInsights = await client.getInsights();
      liveMission = await client.getTodayMission();
      retentionData = await client.getRetentionOverview();
    } catch (_) {}
    render();
  }
  loadInitialData();

  // ─── MAIN APP SHELL RENDERER ──────────────────────────────────────────────────
  function render() {
    const initials = currentStudent.name
      ? currentStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      : 'ST';

    root.innerHTML = `
      <!-- Top Application Header Bar -->
      <header class="bg-[#0b0e17] border-b border-white/[0.08] px-5 py-3 flex items-center justify-between shrink-0 z-20">
        <div class="flex items-center gap-3.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 border border-emerald-400/30">
            <i class="fas fa-brain text-sm"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm tracking-tight text-white font-sans">EduGuard Intelligence</span>
              <span class="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono tracking-wider">
                KCSE 2027
              </span>
            </div>
            <div class="text-[11px] text-slate-400 font-medium">Autonomous Cognitive Tutoring & Diagnostic Assessment Engine</div>
          </div>
        </div>

        <!-- Student Profile & Status -->
        <div class="flex items-center gap-3.5 text-xs">
          <!-- Backend Connectivity Status -->
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full ${isBackendOnline ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50' : 'bg-slate-800/60 text-slate-400 border border-slate-700/60'}">
            <span class="w-2 h-2 rounded-full ${isBackendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}"></span>
            <span class="text-[11px] font-semibold">${isBackendOnline ? 'Adaptive Engine Active • Port 8000' : 'Offline Knowledge Engine'}</span>
          </div>

          <!-- Mode Switcher Toggle: High-Performance OS Native vs Flutter Web Canvas -->
          <button id="eduguard-canvas-toggle" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${isCanvasMode ? 'bg-cyan-600 text-white shadow-md' : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'}">
            <i class="fas ${isCanvasMode ? 'fa-desktop' : 'fa-layer-group'} text-cyan-400"></i>
            <span>${isCanvasMode ? 'Native OS View' : 'Canvas Mode (Flutter Web)'}</span>
          </button>

          <!-- User Badge -->
          <div class="flex items-center gap-2.5 pl-3 border-l border-white/10">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 border border-emerald-400/40 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              ${initials}
            </div>
            <div class="hidden md:flex flex-col text-left leading-tight">
              <span class="text-white font-bold text-xs">${esc(currentStudent.name)}</span>
              <span class="text-slate-400 text-[10px] font-mono">Adm: ${esc(currentStudent.admNo)} • ${esc(currentStudent.grade)}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Body: Sidebar + Workspace OR Full Canvas Embed -->
      <div class="flex-1 flex overflow-hidden relative">
        ${isCanvasMode ? `
          <!-- Flutter Web Live Canvas Mode Embed -->
          <div class="w-full h-full flex flex-col bg-[#0b0e17]">
            <div class="bg-cyan-950/80 border-b border-cyan-800/50 px-4 py-2 flex items-center justify-between text-xs text-cyan-200">
              <div class="flex items-center gap-2">
                <i class="fas fa-layer-group text-cyan-400"></i>
                <span class="font-semibold">EduGuard Flutter Web Canvas Engine Active</span>
                <span class="text-cyan-400/70 text-[11px]">— Precompiled CanvasKit bundle running in native window</span>
              </div>
              <button id="exit-canvas-mode-btn" class="text-xs bg-cyan-800 hover:bg-cyan-700 text-white px-3 py-1 rounded-lg transition-colors cursor-pointer">
                Back to Native OS UI
              </button>
            </div>
            <iframe id="flutter-web-frame" src="EduGuard/frontend/build/web/index.html" class="w-full flex-1 border-0 bg-[#0b0e17]"></iframe>
          </div>
        ` : `
          <!-- Desktop Navigation Sidebar -->
          <aside class="eduguard-sidebar w-64 flex flex-col shrink-0 select-none">
            <div class="flex-1 overflow-y-auto py-4 px-3 space-y-4">
              
              <!-- Section: LEARNING CORE -->
              <div>
                <div class="px-3 mb-2 text-[10px] font-extrabold text-slate-500 tracking-wider uppercase font-mono">Learning Core</div>
                <div class="space-y-1">
                  <button class="eduguard-nav-item w-full ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
                    <i class="fas fa-gauge-high w-4 text-center ${activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-400'}"></i>
                    <span>Learning Dashboard</span>
                  </button>
                  <button class="eduguard-nav-item w-full ${activeTab === 'curriculum' ? 'active' : ''}" data-tab="curriculum">
                    <i class="fas fa-book-bookmark w-4 text-center ${activeTab === 'curriculum' ? 'text-emerald-400' : 'text-slate-400'}"></i>
                    <span>Curriculum Explorer</span>
                  </button>
                  <button class="eduguard-nav-item w-full ${activeTab === 'diagnostic' ? 'active' : ''}" data-tab="diagnostic">
                    <i class="fas fa-stethoscope w-4 text-center ${activeTab === 'diagnostic' ? 'text-emerald-400' : 'text-slate-400'}"></i>
                    <span>Diagnostic Test</span>
                  </button>
                  <button class="eduguard-nav-item w-full ${activeTab === 'whystruggling' ? 'active' : ''}" data-tab="whystruggling">
                    <i class="fas fa-magnifying-glass-chart w-4 text-center ${activeTab === 'whystruggling' ? 'text-emerald-400' : 'text-slate-400'}"></i>
                    <span>Why Am I Struggling?</span>
                  </button>
                  <button class="eduguard-nav-item w-full ${activeTab === 'retention' ? 'active' : ''}" data-tab="retention">
                    <i class="fas fa-rotate-right w-4 text-center ${activeTab === 'retention' ? 'text-emerald-400' : 'text-slate-400'}"></i>
                    <span>Retention Center</span>
                  </button>
                  <button class="eduguard-nav-item w-full ${activeTab === 'knowledgemap' ? 'active' : ''}" data-tab="knowledgemap">
                    <i class="fas fa-circle-nodes w-4 text-center ${activeTab === 'knowledgemap' ? 'text-emerald-400' : 'text-slate-400'}"></i>
                    <span>Knowledge Map (DAG)</span>
                  </button>
                  <button class="eduguard-nav-item w-full ${activeTab === 'timeline' ? 'active' : ''}" data-tab="timeline">
                    <i class="fas fa-timeline w-4 text-center ${activeTab === 'timeline' ? 'text-emerald-400' : 'text-slate-400'}"></i>
                    <span>Learning Timeline</span>
                  </button>
                </div>
              </div>

              <!-- Section: AI INTELLIGENCE -->
              <div>
                <div class="px-3 mb-2 text-[10px] font-extrabold text-slate-500 tracking-wider uppercase font-mono">AI Intelligence</div>
                <div class="space-y-1">
                  <button class="eduguard-nav-item w-full ${activeTab === 'tutor' ? 'active' : ''}" data-tab="tutor">
                    <i class="fas fa-robot w-4 text-center ${activeTab === 'tutor' ? 'text-emerald-400' : 'text-slate-400'}"></i>
                    <span>AI Socratic Tutor</span>
                  </button>
                  <button class="eduguard-nav-item w-full ${activeTab === 'notes' ? 'active' : ''}" data-tab="notes">
                    <i class="fas fa-file-signature w-4 text-center ${activeTab === 'notes' ? 'text-emerald-400' : 'text-slate-400'}"></i>
                    <span>Lecture Notes Coach</span>
                  </button>
                </div>
              </div>

              <!-- Section: EDUCATOR & INTEGRITY -->
              <div>
                <div class="px-3 mb-2 text-[10px] font-extrabold text-slate-500 tracking-wider uppercase font-mono">Educator & Shield</div>
                <div class="space-y-1">
                  <button class="eduguard-nav-item w-full ${activeTab === 'teacher' ? 'active' : ''}" data-tab="teacher">
                    <i class="fas fa-chalkboard-user w-4 text-center ${activeTab === 'teacher' ? 'text-emerald-400' : 'text-slate-400'}"></i>
                    <span>Teacher Class Hub</span>
                  </button>
                  <button class="eduguard-nav-item w-full ${activeTab === 'proctor' ? 'active' : ''}" data-tab="proctor">
                    <i class="fas fa-shield-halved w-4 text-center ${proctorActive ? 'text-rose-400 animate-pulse' : (activeTab === 'proctor' ? 'text-emerald-400' : 'text-slate-400')}"></i>
                    <span>Exam Guard Shield</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Sidebar Footer: Offline Sync & Version -->
            <div class="p-3.5 border-t border-white/[0.08] bg-[#07090f] text-xs">
              <div class="flex items-center justify-between mb-2">
                <span class="text-slate-400 text-[11px] font-medium">Offline Queue</span>
                <span class="font-mono text-emerald-400 text-[11px] font-bold">${client.getPendingQueueCount()} cached</span>
              </div>
              <button id="eduguard-sync-btn" class="w-full text-center py-2 bg-white/5 hover:bg-white/10 text-slate-200 rounded-xl border border-white/10 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5">
                <i class="fas fa-arrows-rotate text-emerald-400"></i>
                <span>Synchronize Server</span>
              </button>
            </div>
          </aside>

          <!-- Main Dynamic Content Workspace -->
          <main id="eduguard-content-area" class="flex-1 overflow-y-auto bg-[#0d1017] p-8 relative">
            <!-- Dynamic Tab Content Rendered Here -->
          </main>
        `}
      </div>
    `;

    // Event Bindings
    const canvasToggle = root.querySelector('#eduguard-canvas-toggle');
    if (canvasToggle) {
      canvasToggle.addEventListener('click', () => {
        isCanvasMode = !isCanvasMode;
        render();
      });
    }

    const exitCanvasBtn = root.querySelector('#exit-canvas-mode-btn');
    if (exitCanvasBtn) {
      exitCanvasBtn.addEventListener('click', () => {
        isCanvasMode = false;
        render();
      });
    }

    const syncBtn = root.querySelector('#eduguard-sync-btn');
    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        syncBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-1"></i> Syncing...`;
        const res = await client.syncOfflineQueue();
        if (window.dawamuDialogs?.toast) {
          window.dawamuDialogs.toast({ message: res.message, type: 'success' });
        } else {
          alert(res.message);
        }
        render();
      });
    }

    // Sidebar Navigation events
    root.querySelectorAll('.eduguard-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-tab');
        render();
      });
    });

    if (!isCanvasMode) {
      renderActiveTab();
    }
  }

  // ─── TAB ROUTER ───────────────────────────────────────────────────────────────
  function renderActiveTab() {
    const mainEl = root.querySelector('#eduguard-content-area');
    if (!mainEl) return;

    if (activeTab === 'dashboard') renderDashboardTab(mainEl);
    else if (activeTab === 'curriculum') renderCurriculumTab(mainEl);
    else if (activeTab === 'diagnostic') renderDiagnosticTab(mainEl);
    else if (activeTab === 'whystruggling') renderWhyStrugglingTab(mainEl);
    else if (activeTab === 'retention') renderRetentionTab(mainEl);
    else if (activeTab === 'knowledgemap') renderKnowledgeMapTab(mainEl);
    else if (activeTab === 'timeline') renderTimelineTab(mainEl);
    else if (activeTab === 'tutor') renderTutorTab(mainEl);
    else if (activeTab === 'notes') renderNotesTab(mainEl);
    else if (activeTab === 'teacher') renderTeacherTab(mainEl);
    else if (activeTab === 'proctor') renderProctorTab(mainEl);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 1. DASHBOARD TAB
  // ═══════════════════════════════════════════════════════════════════════════════
  function renderDashboardTab(container) {
    const nextAction = liveNextAction || {
      topicName: 'Quadratic Equations',
      topicId: 'quadratic_equations',
      actionType: 'TARGETED_PRACTICE',
      reason: 'Quadratic Equations mastery is below threshold (51%). Targeted factorisation reinforcement and zero-product practice recommended.'
    };

    let actionBadgeColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    let actionBadgeText = 'Recommended Next';
    let actionIcon = 'fa-bullseye text-emerald-400';

    if (nextAction.actionType === 'PREREQUISITE_RECOVERY') {
      actionBadgeColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      actionBadgeText = 'Prerequisite Gap';
      actionIcon = 'fa-triangle-exclamation text-rose-400';
    } else if (nextAction.actionType === 'RETRIEVAL') {
      actionBadgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      actionBadgeText = 'Retention Due';
      actionIcon = 'fa-rotate-right text-amber-400';
    }

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-7">
        <!-- Greeting & Status Banner -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight font-sans">
              Good afternoon, ${esc(currentStudent.name.split(' ')[0])} 👋
            </h1>
            <p class="text-xs text-slate-400 mt-1 font-medium">
              Here is your personalized educational intelligence briefing and mastery profile for today.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Adaptive Engine Active</span>
            </span>
            <button id="dash-quick-diag-btn" class="eduguard-btn-primary text-xs flex items-center gap-1.5">
              <i class="fas fa-stethoscope"></i>
              <span>Quick Diagnostic</span>
            </button>
          </div>
        </div>

        <!-- Next Best Action Card -->
        <div class="eduguard-hero-card p-6 relative overflow-hidden">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xl shrink-0 shadow-inner">
                <i class="fas ${actionIcon}"></i>
              </div>
              <div class="space-y-1.5">
                <div class="flex items-center gap-2.5">
                  <span class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border font-mono tracking-wider ${actionBadgeColor}">
                    ${actionBadgeText}
                  </span>
                  <span class="text-xs text-slate-400 font-medium">Priority 85% &bull; Estimated 15 Mins</span>
                </div>
                <h3 class="text-lg font-bold text-white">${esc(nextAction.topicName || 'Targeted Topic Practice')}</h3>
                <p class="text-xs text-slate-300 max-w-2xl leading-relaxed">${esc(nextAction.reason)}</p>
              </div>
            </div>
            <button id="dash-start-action-btn" class="eduguard-btn-primary px-5 py-3 text-xs shrink-0 flex items-center gap-2 shadow-lg">
              <span>Start Adaptive Session</span>
              <i class="fas fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>

        <!-- Curriculum Diagnostic Quick Banner -->
        <div class="eduguard-card p-4 flex items-center justify-between gap-4 border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 to-[#151922]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-base border border-emerald-500/30">
              <i class="fas fa-clipboard-check"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-white">Curriculum Diagnostic Assessments</h4>
              <p class="text-xs text-slate-400">Establish your authentic mastery baseline and identify prerequisite dependencies across 5 KCSE subjects.</p>
            </div>
          </div>
          <button id="dash-select-subject-btn" class="eduguard-btn-secondary text-xs shrink-0 flex items-center gap-1.5">
            <span>Select Subject</span>
            <i class="fas fa-chevron-right text-[10px]"></i>
          </button>
        </div>

        <!-- Evidence-Based Learning Insights Carousel -->
        <div>
          <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5 flex items-center gap-2 font-mono">
            <i class="fas fa-lightbulb text-amber-400"></i> Evidence-Based Learning Insights
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${liveInsights.length > 0 ? liveInsights.slice(0, 3).map(ins => `
              <div class="eduguard-card eduguard-card-interactive p-4 flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-2.5 mb-2.5">
                    <span class="w-7 h-7 rounded-lg ${ins.type === 'improving' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'} flex items-center justify-center text-xs">
                      <i class="fas ${ins.type === 'improving' ? 'fa-arrow-trend-up' : 'fa-triangle-exclamation'}"></i>
                    </span>
                    <span class="text-xs font-bold text-white leading-tight">${esc(ins.title)}</span>
                  </div>
                  <p class="text-[12px] text-slate-300 mb-3 leading-relaxed">${esc(ins.message)}</p>
                </div>
                <div class="text-[10px] text-slate-400 font-mono border-t border-white/[0.06] pt-2 flex items-center gap-1">
                  <i class="fas fa-quote-left text-slate-600"></i>
                  <span>${esc(ins.evidence)}</span>
                </div>
              </div>
            `).join('') : `
              <div class="col-span-3 eduguard-card p-6 text-center text-xs text-slate-400">
                Complete diagnostic assessments to unlock tailored learning insights.
              </div>
            `}
          </div>
        </div>

        <!-- 2-Column Section: Today's Mission (Left) & Concept Mastery Profile (Right) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Left Column: Daily Learning Mission (7 cols) -->
          <div class="lg:col-span-7 space-y-4">
            <div class="eduguard-card p-5">
              <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-sm">
                    <i class="fas fa-bullseye"></i>
                  </div>
                  <div>
                    <h3 class="font-bold text-sm text-white">${esc(liveMission ? liveMission.title : "Today's Learning Mission")}</h3>
                    <p class="text-[11px] text-slate-400 font-medium">${esc(liveMission ? liveMission.description : "Calculated from prerequisite gaps and forgetting decay")}</p>
                  </div>
                </div>
                <span class="text-[11px] bg-white/5 text-slate-300 px-2.5 py-1 rounded-lg font-mono border border-white/10">
                  ${liveMission ? liveMission.date : new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <!-- Mission Items List -->
              <div class="space-y-2.5">
                ${(liveMission && liveMission.items ? liveMission.items : [
                  { topic_name: 'Factorisation of Binomials', item_type: 'remediation', target_question_count: 5, reason: 'Prerequisite foundation reinforcement' },
                  { topic_name: 'Quadratic Equations (Roots)', item_type: 'advancement', target_question_count: 4, reason: 'Apply zero-product property' }
                ]).map((item, idx) => `
                  <div class="bg-[#10141d] border border-white/[0.06] rounded-xl p-3.5 flex items-center justify-between hover:border-white/10 transition-colors">
                    <div class="flex items-center gap-3">
                      <span class="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/30">
                        ${idx + 1}
                      </span>
                      <div>
                        <div class="text-xs font-bold text-white">${esc(item.topic_name)}</div>
                        <div class="text-[11px] text-slate-400 mt-0.5">${esc(item.reason)}</div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2.5">
                      <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${item.item_type === 'remediation' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'}">
                        ${esc(item.item_type)}
                      </span>
                      <span class="text-xs text-slate-400 font-mono font-semibold">${item.target_question_count} Qs</span>
                    </div>
                  </div>
                `).join('')}
              </div>

              <button id="dash-start-mission-btn" class="w-full mt-4 py-2.5 eduguard-btn-primary text-xs font-bold text-center">
                Launch Today's Learning Mission
              </button>
            </div>
          </div>

          <!-- Right Column: Concept Mastery Profile (5 cols) -->
          <div class="lg:col-span-5 space-y-4">
            <div class="eduguard-card p-5">
              <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
                <h3 class="font-bold text-sm text-white">Concept Mastery Profile</h3>
                <span class="text-[11px] text-emerald-400 font-mono font-semibold">Active Assessment</span>
              </div>

              <div class="space-y-3.5">
                ${(liveMasteries.length > 0 ? liveMasteries.slice(0, 5) : [
                  { topic_name: 'Basic Arithmetic', mastery_score: 92, category: 'MASTERED' },
                  { topic_name: 'Fractions & Ratios', mastery_score: 84, category: 'MASTERED' },
                  { topic_name: 'Algebraic Manipulation', mastery_score: 78, category: 'PROFICIENT' },
                  { topic_name: 'Factorisation', mastery_score: 52, category: 'DEVELOPING' },
                  { topic_name: 'Quadratic Equations', mastery_score: 48, category: 'CRITICAL' }
                ]).map(m => {
                  const score = Math.round(m.mastery_score || 0);
                  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-cyan-500' : score >= 40 ? 'bg-amber-500' : 'bg-rose-500';
                  const textCol = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-cyan-400' : score >= 40 ? 'text-amber-400' : 'text-rose-400';
                  return `
                    <div class="space-y-1.5">
                      <div class="flex justify-between items-center text-xs">
                        <span class="text-slate-200 font-semibold">${esc(m.topic_name)}</span>
                        <span class="font-mono font-bold ${textCol}">${score}%</span>
                      </div>
                      <div class="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-white/5">
                        <div class="${color} h-full rounded-full transition-all duration-500" style="width: ${score}%;"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              <button id="dash-view-full-curric-btn" class="w-full mt-4 py-2 eduguard-btn-secondary text-xs text-center">
                Explore Full Curriculum & Diag
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    container.querySelector('#dash-quick-diag-btn')?.addEventListener('click', () => {
      activeTab = 'diagnostic';
      startDiagnosticSession('quadratic_equations', 'mathematics');
    });

    container.querySelector('#dash-start-action-btn')?.addEventListener('click', () => {
      activeTab = 'diagnostic';
      startDiagnosticSession(nextAction.topicId || 'quadratic_equations', 'mathematics');
    });

    container.querySelector('#dash-select-subject-btn')?.addEventListener('click', () => {
      activeTab = 'curriculum';
      render();
    });

    container.querySelector('#dash-start-mission-btn')?.addEventListener('click', () => {
      activeTab = 'diagnostic';
      startDiagnosticSession('quadratic_equations', 'mathematics');
    });

    container.querySelector('#dash-view-full-curric-btn')?.addEventListener('click', () => {
      activeTab = 'curriculum';
      render();
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 2. CURRICULUM EXPLORER TAB
  // ═══════════════════════════════════════════════════════════════════════════════
  function renderCurriculumTab(container) {
    const topics = Array.isArray(LOCAL_TOPICS)
      ? LOCAL_TOPICS.filter(t => t.subject_id === selectedSubjectId)
      : (LOCAL_TOPICS[selectedSubjectId] || []);

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-white tracking-tight">Curriculum & Diagnostic Explorer</h1>
          <p class="text-xs text-slate-400 mt-1">Explore authentic KCSE & CBC syllabus topics, view prerequisite dependencies, and launch targeted diagnostic assessments.</p>
        </div>

        <!-- Subject Picker Tabs -->
        <div class="flex items-center gap-2.5 overflow-x-auto pb-2 border-b border-white/[0.08]">
          ${LOCAL_SUBJECTS.map(s => `
            <button class="curric-subject-btn px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${s.id === selectedSubjectId ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40' : 'bg-[#151922] text-slate-400 hover:text-white border border-white/5'}" data-subject="${s.id}">
              <i class="fas ${s.icon} ${s.id === selectedSubjectId ? 'text-white' : 'text-emerald-400'}"></i>
              <span>${esc(s.name)}</span>
            </button>
          `).join('')}
        </div>

        <!-- Topics Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${topics.map(t => {
            const prereqs = LOCAL_PREREQUISITES[t.topic_id] || [];
            return `
              <div class="eduguard-card eduguard-card-interactive p-5 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between text-xs mb-2.5">
                    <span class="text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30 text-[10px] font-mono">${esc(t.grade || 'Form 1')}</span>
                    <span class="text-[10px] text-slate-500 font-mono font-semibold">Topic #${t.order}</span>
                  </div>
                  <h3 class="text-sm font-bold text-white mb-1.5 leading-snug">${esc(t.topic_name)}</h3>
                  <div class="text-[11px] text-slate-400 mb-4 leading-relaxed">
                    ${prereqs.length > 0 ? `
                      <span class="text-slate-500 font-medium">Prerequisites:</span>
                      <span class="text-slate-300 font-semibold">${prereqs.map(p => p.replace(/_/g, ' ')).join(', ')}</span>
                    ` : '<span class="text-slate-500 font-medium">Foundational topic (No prerequisites required)</span>'}
                  </div>
                </div>

                <div class="flex items-center gap-2 pt-3.5 border-t border-white/[0.06]">
                  <button class="topic-launch-diag-btn flex-1 py-2 eduguard-btn-primary text-xs text-center" data-topic-id="${t.topic_id}" data-topic-name="${esc(t.topic_name)}">
                    Launch Diagnostic
                  </button>
                  <button class="topic-struggle-btn px-3 py-2 bg-white/5 hover:bg-white/10 text-amber-400 rounded-xl text-xs transition-colors cursor-pointer border border-white/10" title="Diagnose Root Causes" data-topic-id="${t.topic_id}" data-topic-name="${esc(t.topic_name)}">
                    <i class="fas fa-stethoscope"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Event handlers
    container.querySelectorAll('.curric-subject-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedSubjectId = btn.getAttribute('data-subject');
        render();
      });
    });

    container.querySelectorAll('.topic-launch-diag-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        selectedTopicId = btn.getAttribute('data-topic-id');
        selectedTopicName = btn.getAttribute('data-topic-name');
        activeTab = 'diagnostic';
        startDiagnosticSession(selectedTopicId, selectedSubjectId);
      });
    });

    container.querySelectorAll('.topic-struggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedTopicId = btn.getAttribute('data-topic-id');
        selectedTopicName = btn.getAttribute('data-topic-name');
        activeTab = 'whystruggling';
        render();
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 3. DIAGNOSTIC ASSESSMENT TAB
  // ═══════════════════════════════════════════════════════════════════════════════
  async function startDiagnosticSession(topicId = 'quadratic_equations', subjectId = 'mathematics') {
    diagnosticIsSubmitting = false;
    diagnosticFeedback = null;
    diagnosticCompletedProfile = null;
    diagnosticAnswers = {};
    activeDiagnosticSession = await client.startDiagnostic(topicId, subjectId);
    activeDiagnosticSession.current_index = 0;
    if (Array.isArray(activeDiagnosticSession.questions) && activeDiagnosticSession.questions.length > 0) {
      activeDiagnosticSession.total_questions = activeDiagnosticSession.questions.length;
      currentDiagnosticQuestion = activeDiagnosticSession.questions[0];
    } else {
      currentDiagnosticQuestion = activeDiagnosticSession.current_question;
    }
    render();
  }

  function renderDiagnosticTab(container) {
    if (!activeDiagnosticSession) {
      container.innerHTML = `
        <div class="max-w-xl mx-auto text-center py-16 space-y-5">
          <div class="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-400 mx-auto flex items-center justify-center text-2xl border border-emerald-500/30 shadow-lg">
            <i class="fas fa-stethoscope"></i>
          </div>
          <h2 class="text-2xl font-bold text-white tracking-tight">Diagnostic Assessment</h2>
          <p class="text-xs text-slate-300 leading-relaxed">
            Begin an adaptive diagnostic evaluation to pinpoint prerequisite gaps, diagnose cognitive misconceptions, and calibrate your topic mastery curve.
          </p>
          <div class="pt-2">
            <button id="diag-begin-now-btn" class="eduguard-btn-primary px-8 py-3 text-sm font-bold shadow-xl">
              Start Assessment (5 Questions)
            </button>
          </div>
        </div>
      `;
      container.querySelector('#diag-begin-now-btn')?.addEventListener('click', () => {
        startDiagnosticSession(selectedTopicId, selectedSubjectId);
      });
      return;
    }

    if (diagnosticCompletedProfile) {
      const p = diagnosticCompletedProfile;
      container.innerHTML = `
        <div class="max-w-2xl mx-auto eduguard-card p-8 space-y-6 text-center">
          <div class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-2xl border border-emerald-500/30">
            <i class="fas fa-award"></i>
          </div>
          <div>
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Assessment Complete</span>
            <h2 class="text-2xl font-bold text-white mt-1">Diagnostic Mastery Report</h2>
            <p class="text-xs text-slate-400 mt-1">Topic: <strong>${esc(p.topic_name)}</strong></p>
          </div>

          <div class="grid grid-cols-3 gap-4 pt-2">
            <div class="bg-[#10141d] p-4 rounded-xl border border-white/5">
              <div class="text-[11px] text-slate-400">Mastery Score</div>
              <div class="text-2xl font-black text-emerald-400 font-mono mt-1">${Math.round(p.mastery_score || 0)}%</div>
            </div>
            <div class="bg-[#10141d] p-4 rounded-xl border border-white/5">
              <div class="text-[11px] text-slate-400">Performance</div>
              <div class="text-sm font-bold text-white mt-2">${esc(p.category || 'DEVELOPING')}</div>
            </div>
            <div class="bg-[#10141d] p-4 rounded-xl border border-white/5">
              <div class="text-[11px] text-slate-400">Questions</div>
              <div class="text-2xl font-black text-white font-mono mt-1">${p.total_questions || 5}</div>
            </div>
          </div>

          <div class="flex justify-center gap-3 pt-4">
            <button id="diag-done-return-btn" class="eduguard-btn-primary px-6 py-2.5 text-xs font-bold">
              Return to Dashboard
            </button>
            <button id="diag-remedy-btn" class="eduguard-btn-secondary px-6 py-2.5 text-xs font-bold text-amber-300">
              Diagnose Root Causes
            </button>
          </div>
        </div>
      `;

      container.querySelector('#diag-done-return-btn')?.addEventListener('click', () => {
        activeTab = 'dashboard';
        activeDiagnosticSession = null;
        render();
      });

      container.querySelector('#diag-remedy-btn')?.addEventListener('click', () => {
        activeTab = 'whystruggling';
        render();
      });
      return;
    }

    const q = currentDiagnosticQuestion || activeDiagnosticSession.current_question;
    const qId = q ? (q.question_id || q.id || 'q_0') : 'q_0';
    const totalQ = (activeDiagnosticSession.questions?.length) || activeDiagnosticSession.total_questions || 5;
    const currentIdx = activeDiagnosticSession.current_index || 0;
    const progressPct = (currentIdx / totalQ) * 100;

    container.innerHTML = `
      <div class="max-w-3xl mx-auto space-y-6">
        <!-- Assessment Progress Bar -->
        <div class="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/[0.08]">
          <div class="flex items-center gap-2">
            <span class="font-bold text-white font-sans">${esc(activeDiagnosticSession.topic_name || 'Mathematics')}</span>
            <span class="text-slate-600">&bull;</span>
            <span class="text-emerald-400 font-semibold font-mono">Question ${currentIdx + 1} of ${totalQ}</span>
          </div>
          <div class="flex items-center gap-2">
            <i class="fas fa-clock text-amber-400"></i>
            <span class="font-mono text-white font-bold">04:30</span>
          </div>
        </div>

        <div class="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300" style="width: ${progressPct}%;"></div>
        </div>

        <!-- Question Card -->
        <div class="eduguard-card p-7 space-y-5">
          <div class="text-base font-bold text-white leading-relaxed font-sans">
            ${esc(q ? q.question_text : 'Solving quadratic equation...')}
          </div>

          <!-- Options -->
          <div class="space-y-3 pt-2">
            ${(q && q.options ? q.options : []).map((opt, idx) => {
              const optId = opt.option_id || opt.id || `opt_${idx}`;
              const isSelected = diagnosticAnswers[qId] === optId;
              return `
                <button class="diag-opt-btn w-full p-4 rounded-xl border text-left flex items-center gap-3.5 text-xs transition-all cursor-pointer ${isSelected ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md' : 'bg-[#10141d] border-white/[0.08] text-slate-300 hover:border-white/20 hover:text-white'}" data-option-id="${optId}">
                  <span class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-emerald-500 text-black' : 'bg-white/10 text-slate-300'}">
                    ${String.fromCharCode(65 + idx)}
                  </span>
                  <span class="font-medium text-sm leading-snug">${esc(opt.text)}</span>
                </button>
              `;
            }).join('')}
          </div>

          <!-- Misconception Feedback Card (If submitted) -->
          ${diagnosticFeedback ? `
            <div class="p-4 rounded-xl border text-xs leading-relaxed ${diagnosticFeedback.is_correct ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200' : 'bg-rose-950/40 border-rose-700/60 text-rose-200'}">
              <div class="font-bold flex items-center gap-2 mb-1">
                <i class="fas ${diagnosticFeedback.is_correct ? 'fa-check-circle text-emerald-400' : 'fa-triangle-exclamation text-rose-400'}"></i>
                <span>${diagnosticFeedback.is_correct ? 'Correct! Strong Conceptual Accuracy' : 'Diagnostic Misconception Identified'}</span>
              </div>
              <div>${esc(diagnosticFeedback.explanation)}</div>
              ${diagnosticFeedback.diagnosed_misconception ? `
                <div class="mt-2 text-[11px] font-mono p-2 rounded bg-black/30 border border-white/5">
                  <strong>Cognitive Gap:</strong> ${esc(diagnosticFeedback.diagnosed_misconception)}
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- Action Buttons -->
          <div class="flex justify-between items-center pt-4 border-t border-white/[0.08]">
            <button id="diag-abort-btn" class="text-xs text-slate-400 hover:text-white cursor-pointer transition-colors">
              Exit Assessment
            </button>
            <button id="diag-submit-btn" class="eduguard-btn-primary px-7 py-2.5 text-xs font-bold flex items-center gap-2" ${!diagnosticAnswers[qId] ? 'disabled opacity-50 pointer-events-none' : ''}>
              <span>${diagnosticFeedback ? (currentIdx >= totalQ - 1 ? 'View Mastery Report' : 'Next Question') : 'Verify Answer'}</span>
              <i class="fas fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    // Handlers
    container.querySelectorAll('.diag-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (diagnosticFeedback) return;
        const optId = btn.getAttribute('data-option-id');
        diagnosticAnswers[qId] = optId;
        renderDiagnosticTab(container);
      });
    });

    container.querySelector('#diag-abort-btn')?.addEventListener('click', () => {
      activeDiagnosticSession = null;
      render();
    });

    container.querySelector('#diag-submit-btn')?.addEventListener('click', async () => {
      if (diagnosticFeedback) {
        // Move to next question or complete
        diagnosticFeedback = null;
        if (currentIdx >= totalQ - 1) {
          const diagId = activeDiagnosticSession.diagnostic_id || activeDiagnosticSession.session_id;
          await client.completeDiagnostic(diagId);
          const questionsList = activeDiagnosticSession.questions || [];
          let correctCount = 0;
          questionsList.forEach((item, i) => {
            const itemQId = item.question_id || item.id || `q_${i}`;
            const chosen = diagnosticAnswers[itemQId];
            const correctOpt = (item.options || []).find(o => o.is_correct);
            const correctId = item.correct_answer || (correctOpt ? (correctOpt.option_id || correctOpt.id) : null);
            if (chosen && chosen === correctId) correctCount++;
          });
          const score = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 75;
          diagnosticCompletedProfile = {
            topic_name: activeDiagnosticSession.topic_name || selectedTopicName || 'Mathematics',
            mastery_score: score,
            category: score >= 80 ? 'MASTERED' : score >= 60 ? 'PROFICIENT' : score >= 40 ? 'DEVELOPING' : 'CRITICAL',
            total_questions: totalQ
          };
          liveMasteries = await client.getMasteryOverview();
          renderDiagnosticTab(container);
        } else {
          activeDiagnosticSession.current_index = currentIdx + 1;
          if (Array.isArray(activeDiagnosticSession.questions) && activeDiagnosticSession.questions[activeDiagnosticSession.current_index]) {
            currentDiagnosticQuestion = activeDiagnosticSession.questions[activeDiagnosticSession.current_index];
          }
          renderDiagnosticTab(container);
        }
        return;
      }

      const selectedOptId = diagnosticAnswers[qId];
      if (!selectedOptId) return;

      const opt = (q.options || []).find((o, idx) => (o.option_id || o.id || `opt_${idx}`) === selectedOptId);
      let graded = null;
      try {
        graded = await client.submitAttempt(
          qId,
          selectedOptId,
          activeDiagnosticSession.diagnostic_id || activeDiagnosticSession.session_id,
          12000,
          activeDiagnosticSession.selected_topic_id || selectedTopicId
        );
      } catch (_) {}

      diagnosticFeedback = {
        is_correct: graded && graded.is_correct !== null ? !!graded.is_correct : (opt ? !!opt.is_correct : false),
        explanation: graded?.explanation || opt?.distractor_explanation || opt?.explanation || q?.explanation || 'Evaluation completed.',
        diagnosed_misconception: graded?.diagnosed_misconception || opt?.misconception_tag || opt?.misconception || null
      };

      renderDiagnosticTab(container);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4. "WHY AM I STRUGGLING?" ROOT CAUSE ANALYZER
  // ═══════════════════════════════════════════════════════════════════════════════
  async function loadStruggleDiagnosis(topicId = selectedTopicId) {
    whyIsLoading = true;
    render();
    try {
      const raw = await client.getWhyStruggling(topicId);
      const prereqIds = LOCAL_PREREQUISITES[topicId] || ['factorisation', 'algebraic_manipulation'];
      const normalizedPrereqs = Array.isArray(raw?.prerequisite_gaps) && raw.prerequisite_gaps.length > 0 && typeof raw.prerequisite_gaps[0] === 'object'
        ? raw.prerequisite_gaps
        : prereqIds.map((pid, idx) => ({
            topic_name: pid.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            mastery: idx === 0 ? 43 : 78,
            required: 70,
            status: idx === 0 ? 'GAP' : 'SATISFIED'
          }));

      whyDiagnosis = {
        topic_name: raw?.topic_name || topicId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        primary_cause: (raw?.primary_cause && raw.primary_cause !== 'insufficient_data') ? raw.primary_cause : 'prerequisite_gap',
        human_explanation: raw?.human_explanation || (raw?.primary_cause && raw.primary_cause !== 'insufficient_data' ? raw.recommended_action : null) || 'Prerequisite foundational fluency is below the 70% threshold required for reliable problem transfer.',
        prerequisite_gaps: normalizedPrereqs,
        difficulty_accuracies: raw?.difficulty_accuracies || { basic: 70, medium: 50, hard: 30, application: 20 },
        prescribed_remediation: Array.isArray(raw?.prescribed_remediation) && raw.prescribed_remediation.length > 0
          ? raw.prescribed_remediation
          : [
              'Review prerequisite rules and worked examples for foundational gaps',
              'Complete 5 targeted practice drills on prerequisite concepts',
              'Verify solutions by substituting back into the governing equation'
            ]
      };
    } catch (_) {}
    whyIsLoading = false;
    render();
  }

  function renderWhyStrugglingTab(container) {
    if (!whyDiagnosis && !whyIsLoading) {
      loadStruggleDiagnosis(selectedTopicId);
      return;
    }

    if (whyIsLoading) {
      container.innerHTML = `
        <div class="max-w-xl mx-auto text-center py-24 space-y-4">
          <i class="fas fa-spinner fa-spin text-3xl text-emerald-400"></i>
          <h3 class="text-base font-bold text-white">Analyzing Prerequisite DAG & Student Response Clusters...</h3>
          <p class="text-xs text-slate-400">Synthesizing difficulty cliff thresholds and cognitive misconceptions.</p>
        </div>
      `;
      return;
    }

    const diag = whyDiagnosis || {
      topic_name: 'Quadratic Equations',
      primary_cause: 'prerequisite_gap',
      human_explanation: 'Factorisation of Binomial Expressions is at 43% mastery. Without strong factoring fluency, quadratic equation roots cannot be verified.',
      prerequisite_gaps: [
        { topic_name: 'Factorisation', mastery: 43, required: 70, status: 'GAP' },
        { topic_name: 'Algebraic Manipulation', mastery: 78, required: 70, status: 'SATISFIED' }
      ],
      difficulty_accuracies: { basic: 70, medium: 50, hard: 30, application: 20 },
      prescribed_remediation: [
        'Review binomial factor pairing rules (sum-product method)',
        'Complete 5 targeted practice drills on monic quadratic factoring',
        'Verify roots using substitution back into original polynomial'
      ]
    };

    container.innerHTML = `
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight">"Why Am I Struggling?" Root Cause Analyzer</h1>
            <p class="text-xs text-slate-400 mt-1">Deep cognitive diagnosis mapping topic friction back to foundational prerequisite deficiencies.</p>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-xs text-slate-400 font-medium">Topic:</label>
            <select id="why-topic-selector" class="bg-[#151922] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer">
              <option value="quadratic_equations" ${selectedTopicId === 'quadratic_equations' ? 'selected' : ''}>Quadratic Equations</option>
              <option value="cell_physiology" ${selectedTopicId === 'cell_physiology' ? 'selected' : ''}>Cell Physiology</option>
              <option value="chemical_bonding" ${selectedTopicId === 'chemical_bonding' ? 'selected' : ''}>Chemical Bonding</option>
              <option value="kinematics" ${selectedTopicId === 'kinematics' ? 'selected' : ''}>Kinematics</option>
            </select>
          </div>
        </div>

        <!-- Primary Obstacle Diagnosis Banner -->
        <div class="eduguard-card p-6 bg-gradient-to-r from-rose-950/30 via-[#151922] to-[#151922] border-rose-500/30">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl shrink-0 border border-rose-500/30">
              <i class="fas fa-microscope"></i>
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-extrabold uppercase font-mono px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Primary Root Cause Detected
                </span>
                <span class="text-xs font-bold text-white">${esc(diag.primary_cause.replace(/_/g, ' ').toUpperCase())}</span>
              </div>
              <p class="text-sm text-slate-200 leading-relaxed font-medium">${esc(diag.human_explanation)}</p>
            </div>
          </div>
        </div>

        <!-- 2-Column Diagnostic Drilldown -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Prerequisite Dependency Audit -->
          <div class="eduguard-card p-5 space-y-4">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <i class="fas fa-sitemap text-emerald-400"></i> Prerequisite Dependency Audit
            </h3>
            <div class="space-y-3">
              ${(diag.prerequisite_gaps || []).map(p => `
                <div class="p-3.5 rounded-xl bg-[#10141d] border ${p.status === 'GAP' ? 'border-rose-500/30' : 'border-emerald-500/30'} flex items-center justify-between">
                  <div>
                    <div class="text-xs font-bold text-white">${esc(p.topic_name)}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">Required: ${p.required}% &bull; Current: <strong class="${p.status === 'GAP' ? 'text-rose-400' : 'text-emerald-400'}">${p.mastery}%</strong></div>
                  </div>
                  <span class="text-[10px] font-extrabold font-mono px-2 py-0.5 rounded ${p.status === 'GAP' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}">
                    ${p.status === 'GAP' ? 'FOUNDATIONAL GAP' : 'SATISFIED'}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Difficulty Cliff Breakdown -->
          <div class="eduguard-card p-5 space-y-4">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <i class="fas fa-chart-line text-cyan-400"></i> Difficulty Cliff Breakdown
            </h3>
            <div class="space-y-3">
              ${Object.entries(diag.difficulty_accuracies || { basic: 70, medium: 50, hard: 30, application: 20 }).map(([tier, acc]) => `
                <div class="space-y-1">
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-slate-300 capitalize font-medium">${tier} Tier</span>
                    <span class="font-mono font-bold ${acc >= 60 ? 'text-emerald-400' : acc >= 40 ? 'text-amber-400' : 'text-rose-400'}">${acc}% accuracy</span>
                  </div>
                  <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
                    <div class="h-full rounded-full ${acc >= 60 ? 'bg-emerald-500' : acc >= 40 ? 'bg-amber-500' : 'bg-rose-500'}" style="width: ${acc}%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Prescribed Remediation Plan -->
        <div class="eduguard-card p-6 space-y-4 border-emerald-500/30">
          <h3 class="text-sm font-bold text-white flex items-center gap-2">
            <i class="fas fa-route text-emerald-400"></i> Prescribed Cognitive Remediation Roadmap
          </h3>
          <div class="space-y-2.5">
            ${(diag.prescribed_remediation || []).map((step, idx) => `
              <div class="flex items-start gap-3 p-3 rounded-xl bg-[#10141d] border border-white/5">
                <span class="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                  ${idx + 1}
                </span>
                <span class="text-xs text-slate-200 leading-relaxed font-medium">${esc(step)}</span>
              </div>
            `).join('')}
          </div>
          <button id="why-remedy-start-btn" class="eduguard-btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2">
            <span>Begin Prescribed Recovery Session</span>
            <i class="fas fa-play text-xs"></i>
          </button>
        </div>
      </div>
    `;

    container.querySelector('#why-topic-selector')?.addEventListener('change', (e) => {
      selectedTopicId = e.target.value;
      loadStruggleDiagnosis(selectedTopicId);
    });

    container.querySelector('#why-remedy-start-btn')?.addEventListener('click', () => {
      activeTab = 'diagnostic';
      startDiagnosticSession('factorisation', 'mathematics');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 5. RETENTION CENTER TAB (Ebbinghaus Spaced Repetition)
  // ═══════════════════════════════════════════════════════════════════════════════
  function renderRetentionTab(container) {
    const items = retentionData[activeRetentionTab] || [];

    container.innerHTML = `
      <div class="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-white tracking-tight">Retention Center & Spaced Memory Engine</h1>
          <p class="text-xs text-slate-400 mt-1">Grounded in the Ebbinghaus forgetting curve. Automatically schedules active retrieval before concepts decay.</p>
        </div>

        <!-- Retention Filter Tabs -->
        <div class="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
          <button class="retention-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeRetentionTab === 'due' ? 'bg-emerald-600 text-white shadow-md' : 'bg-[#151922] text-slate-400 hover:text-white border border-white/5'}" data-tab="due">
            Due for Review (${retentionData.due?.length || 0})
          </button>
          <button class="retention-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeRetentionTab === 'at_risk' ? 'bg-emerald-600 text-white shadow-md' : 'bg-[#151922] text-slate-400 hover:text-white border border-white/5'}" data-tab="at_risk">
            At Risk (<48h) (${retentionData.at_risk?.length || 0})
          </button>
          <button class="retention-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeRetentionTab === 'stable' ? 'bg-emerald-600 text-white shadow-md' : 'bg-[#151922] text-slate-400 hover:text-white border border-white/5'}" data-tab="stable">
            Stable Memory (${retentionData.stable?.length || 0})
          </button>
          <button class="retention-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeRetentionTab === 'fresh' ? 'bg-emerald-600 text-white shadow-md' : 'bg-[#151922] text-slate-400 hover:text-white border border-white/5'}" data-tab="fresh">
            Recently Mastered (${retentionData.fresh?.length || 0})
          </button>
        </div>

        <!-- Concept Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${items.length > 0 ? items.map(item => `
            <div class="eduguard-card p-5 space-y-3">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-white text-sm">${esc(item.topic_name)}</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded ${activeRetentionTab === 'due' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}">
                  Half-life: ${item.half_life_days || 3} days
                </span>
              </div>
              <p class="text-xs text-slate-300 leading-relaxed">${esc(item.reason || 'Memory stability declining. Active retrieval required.')}</p>
              <div class="pt-2 flex justify-between items-center border-t border-white/[0.06]">
                <span class="text-[11px] text-slate-500 font-mono">Retrievability: ${(item.retrievability || 0.65) * 100}%</span>
                <button class="retention-review-btn eduguard-btn-primary px-4 py-1.5 text-xs font-semibold" data-topic-id="${item.topic_id}">
                  Review Concept
                </button>
              </div>
            </div>
          `).join('') : `
            <div class="col-span-2 eduguard-card p-8 text-center text-xs text-slate-400">
              No concepts currently in this memory category. Great job keeping your KCSE revision active!
            </div>
          `}
        </div>
      </div>
    `;

    container.querySelectorAll('.retention-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeRetentionTab = btn.getAttribute('data-tab');
        renderRetentionTab(container);
      });
    });

    container.querySelectorAll('.retention-review-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const topicId = btn.getAttribute('data-topic-id');
        activeTab = 'diagnostic';
        startDiagnosticSession(topicId, 'mathematics');
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 6. KNOWLEDGE MAP TAB (Interactive DAG)
  // ═══════════════════════════════════════════════════════════════════════════════
  async function renderKnowledgeMapTab(container) {
    const graph = client.getKnowledgeGraph ? await client.getKnowledgeGraph('mathematics') : {};
    const nodes = graph.nodes || [
      { id: 'arithmetic', name: 'Arithmetic & Number Sense', x: 80, y: 140, mastery: 95, subject: 'Mathematics' },
      { id: 'fractions', name: 'Fractions & Ratios', x: 260, y: 70, mastery: 88, subject: 'Mathematics' },
      { id: 'algebraic_manipulation', name: 'Algebraic Expressions', x: 260, y: 210, mastery: 82, subject: 'Mathematics' },
      { id: 'linear_equations', name: 'Linear Equations', x: 440, y: 70, mastery: 74, subject: 'Mathematics' },
      { id: 'factorisation', name: 'Factorisation of Binomials', x: 440, y: 210, mastery: 52, subject: 'Mathematics' },
      { id: 'quadratic_equations', name: 'Quadratic Equations', x: 640, y: 140, mastery: 48, subject: 'Mathematics' },
      { id: 'polynomials', name: 'Polynomial Functions', x: 820, y: 140, mastery: 25, subject: 'Mathematics' }
    ];

    const edges = graph.edges || [
      { from: 'arithmetic', to: 'fractions' },
      { from: 'arithmetic', to: 'algebraic_manipulation' },
      { from: 'fractions', to: 'linear_equations' },
      { from: 'algebraic_manipulation', to: 'linear_equations' },
      { from: 'algebraic_manipulation', to: 'factorisation' },
      { from: 'linear_equations', to: 'quadratic_equations' },
      { from: 'factorisation', to: 'quadratic_equations' },
      { from: 'quadratic_equations', to: 'polynomials' }
    ];

    const selNode = nodes.find(n => n.id === selectedTopicId) || nodes[5];

    container.innerHTML = `
      <div class="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-white tracking-tight">Curriculum Knowledge Map (Prerequisite DAG)</h1>
          <p class="text-xs text-slate-400 mt-1">Interactive topological graph representation of authentic KCSE learning dependencies.</p>
        </div>

        <!-- SVG Graph Canvas -->
        <div class="eduguard-card p-5 overflow-x-auto shadow-inner bg-[#0b0e17]">
          <svg viewBox="0 0 920 300" class="w-full min-w-[760px] h-72">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
              </marker>
            </defs>

            <!-- Directed Edges -->
            ${edges.map(e => {
              const fromN = nodes.find(n => n.id === e.from);
              const toN = nodes.find(n => n.id === e.to);
              if (!fromN || !toN) return '';
              return `<line x1="${fromN.x}" y1="${fromN.y}" x2="${toN.x}" y2="${toN.y}" stroke="#334155" stroke-width="2" marker-end="url(#arrow)" />`;
            }).join('')}

            <!-- Topic Nodes -->
            ${nodes.map(n => {
              const isSelected = n.id === selNode.id;
              const fill = n.mastery >= 80 ? '#10b981' : n.mastery >= 60 ? '#06b6d4' : n.mastery >= 40 ? '#f59e0b' : '#ef4444';
              return `
                <g class="graph-node-group cursor-pointer" data-node-id="${n.id}">
                  <circle cx="${n.x}" cy="${n.y}" r="${isSelected ? 22 : 18}" fill="${fill}" fill-opacity="${isSelected ? 1 : 0.85}" stroke="${isSelected ? '#ffffff' : '#0b0e17'}" stroke-width="${isSelected ? 3 : 2}" />
                  <text x="${n.x}" y="${n.y + 36}" fill="#cbd5e1" font-size="11" font-weight="600" text-anchor="middle">${esc(n.name.split(' ')[0])}</text>
                  <text x="${n.x}" y="${n.y + 4}" fill="#000000" font-size="10" font-weight="800" text-anchor="middle">${n.mastery}%</text>
                </g>
              `;
            }).join('')}
          </svg>
        </div>

        <!-- Selected Node Details Drawer -->
        <div class="eduguard-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-emerald-500/30">
          <div class="space-y-1">
            <div class="flex items-center gap-2.5">
              <span class="text-base font-bold text-white">${esc(selNode.name)}</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">${selNode.subject}</span>
            </div>
            <p class="text-xs text-slate-300">
              Current mastery level: <strong class="text-emerald-400 font-mono">${selNode.mastery}%</strong> &bull; Prerequisite verification and transfer evaluation active.
            </p>
          </div>
          <div class="flex items-center gap-2.5">
            <button id="map-remedy-btn" class="eduguard-btn-secondary text-xs text-amber-300">
              Diagnose Root Causes
            </button>
            <button id="map-diag-btn" class="eduguard-btn-primary text-xs">
              Launch Diagnostic
            </button>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.graph-node-group').forEach(group => {
      group.addEventListener('click', () => {
        selectedTopicId = group.getAttribute('data-node-id');
        const node = nodes.find(n => n.id === selectedTopicId);
        if (node) selectedTopicName = node.name;
        renderKnowledgeMapTab(container);
      });
    });

    container.querySelector('#map-remedy-btn')?.addEventListener('click', () => {
      activeTab = 'whystruggling';
      render();
    });

    container.querySelector('#map-diag-btn')?.addEventListener('click', () => {
      activeTab = 'diagnostic';
      startDiagnosticSession(selectedTopicId, 'mathematics');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 7. LEARNING TIMELINE TAB
  // ═══════════════════════════════════════════════════════════════════════════════
  async function renderTimelineTab(container) {
    const timeline = await client.getTimeline();

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-white tracking-tight">Chronological Learning Timeline</h1>
          <p class="text-xs text-slate-400 mt-1">Audit log of assessments, mastery shifts, and diagnostic milestones.</p>
        </div>

        <div class="relative border-l-2 border-white/10 ml-4 space-y-6 py-2">
          ${timeline.map(item => `
            <div class="relative pl-6">
              <span class="absolute -left-2.5 top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0d1017]"></span>
              <div class="eduguard-card p-4 space-y-1">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-white">${esc(item.title)}</span>
                  <span class="text-[10px] text-slate-400 font-mono">${new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed">${esc(item.details)}</p>
                <div class="text-[10px] text-emerald-400 font-mono pt-1">Category: ${esc(item.category)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 8. AI SOCRATIC TUTOR TAB
  // ═══════════════════════════════════════════════════════════════════════════════
  function renderTutorTab(container) {
    const quickActions = [
      { label: "📖 Explain concept", prompt: "Can you explain this concept clearly?" },
      { label: "💡 Give me a hint", prompt: "Give me a hint on how to approach this problem." },
      { label: "🧩 Show an example", prompt: "Show me a concrete worked example with numbers." },
      { label: "🔍 Step-by-step", prompt: "Break this down into step-by-step reasoning." },
      { label: "❓ Check understanding", prompt: "Ask me a check question to test my understanding." },
      { label: "⚡ Challenge me", prompt: "Give me a harder conceptual challenge." }
    ];

    container.innerHTML = `
      <div class="flex flex-col h-full -m-8 p-8 bg-[#0d1017]">
        <!-- Tutor Header -->
        <div class="flex items-center justify-between pb-4 border-b border-white/[0.08] shrink-0">
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg shadow-inner">
              <i class="fas fa-robot"></i>
            </div>
            <div>
              <h2 class="text-base font-bold text-white">AI Socratic Academic Tutor — ${esc(tutorTopicTitle)}</h2>
              <p class="text-xs text-slate-400">Context-aware pedagogical guidance powered by FastAPI & KCSE Curriculum Knowledge</p>
            </div>
          </div>
          <span class="text-[11px] text-emerald-300 font-mono px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800">
            Pedagogical Socratic Mode
          </span>
        </div>

        <!-- Quick Action Prompt Chips -->
        <div class="flex items-center gap-2 overflow-x-auto py-3 shrink-0 border-b border-white/[0.06]">
          <span class="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold shrink-0 font-mono">Quick Prompts:</span>
          ${quickActions.map(qa => `
            <button class="tutor-quick-prompt-btn px-3 py-1.5 bg-[#151922] hover:bg-white/10 text-slate-300 rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer border border-white/10" data-prompt="${esc(qa.prompt)}">
              ${qa.label}
            </button>
          `).join('')}
        </div>

        <!-- Messages Scroll Area -->
        <div id="tutor-chat-messages" class="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
          ${chatMessages.map(msg => `
            <div class="flex items-start gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}">
              ${msg.sender === 'ai' ? `
                <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center text-xs shrink-0 shadow-md">
                  <i class="fas fa-brain"></i>
                </div>
              ` : ''}
              <div class="max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' : 'eduguard-card text-slate-200 border-white/[0.08]'}">
                <div class="whitespace-pre-wrap">${esc(msg.text)}</div>
                <div class="text-[10px] ${msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-500'} font-mono mt-1 text-right">${msg.time}</div>
              </div>
            </div>
          `).join('')}
          ${tutorIsLoading ? `
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-xs">
                <i class="fas fa-spinner fa-spin"></i>
              </div>
              <div class="text-xs text-slate-400 italic">EduGuard Tutor is reflecting on syllabus prerequisites...</div>
            </div>
          ` : ''}
        </div>

        <!-- Chat Input Bar -->
        <div class="pt-3 border-t border-white/[0.08] shrink-0">
          <form id="tutor-chat-form" class="flex items-center gap-2">
            <input type="text" id="tutor-chat-input" placeholder="Ask a question or explain your reasoning step-by-step..."
              autocomplete="off" class="flex-1 bg-[#151922] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors">
            <button type="submit" class="eduguard-btn-primary px-5 py-3 text-xs font-bold flex items-center gap-2 shadow-md">
              <span>Send</span>
              <i class="fas fa-paper-plane text-xs"></i>
            </button>
          </form>
        </div>
      </div>
    `;

    // Tutor event listeners
    const chatContainer = container.querySelector('#tutor-chat-messages');
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;

    container.querySelectorAll('.tutor-quick-prompt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-prompt');
        sendTutorMessage(prompt);
      });
    });

    container.querySelector('#tutor-chat-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = container.querySelector('#tutor-chat-input');
      const val = input ? input.value.trim() : '';
      if (val) {
        input.value = '';
        sendTutorMessage(val);
      }
    });

    async function sendTutorMessage(text) {
      chatMessages.push({ sender: 'user', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
      tutorIsLoading = true;
      renderTutorTab(container);

      let replyText = "Let's review the core definition carefully.";
      try {
        const aiReply = await client.askTutor(text, {
          topicId: tutorTopicId,
          subjectId: selectedSubjectId
        });
        replyText = typeof aiReply === 'string'
          ? aiReply
          : (aiReply?.text || aiReply?.reply || replyText);
      } catch (_) {}

      chatMessages.push({ sender: 'ai', text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
      tutorIsLoading = false;
      renderTutorTab(container);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 9. LECTURE NOTES & FLASHCARD COACH TAB
  // ═══════════════════════════════════════════════════════════════════════════════
  function renderNotesTab(container) {
    if (notesIsLoading) {
      container.innerHTML = `
        <div class="max-w-xl mx-auto text-center py-24 space-y-4">
          <i class="fas fa-wand-magic-sparkles fa-spin text-3xl text-cyan-400"></i>
          <h3 class="text-base font-bold text-white">Extracting Core Pedagogical Concepts & Generating Flashcards...</h3>
          <p class="text-xs text-slate-400">Synthesizing KCSE definitions, formulas, and test questions.</p>
        </div>
      `;
      return;
    }

    if (!analyzedNotesResult) {
      container.innerHTML = `
        <div class="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight">Lecture Notes & Smart Flashcard Coach</h1>
            <p class="text-xs text-slate-400 mt-1">Paste your classroom notes or textbook summaries. EduGuard extracts key concepts, generates interactive flashcards, and checks for prerequisite dependencies.</p>
          </div>

          <div class="eduguard-card p-6 space-y-4">
            <label class="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Your Classroom Study Notes:</span>
              <span class="text-slate-500 text-[11px] font-mono">Form 2 Mathematics Example</span>
            </label>
            <textarea id="notes-raw-textarea" rows="8" class="w-full bg-[#10141d] border border-white/10 rounded-xl p-4 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono leading-relaxed resize-none">${notesInputText}</textarea>
            
            <div class="flex justify-between items-center pt-2">
              <span class="text-[11px] text-slate-500 font-mono">Minimum 10 characters required</span>
              <button id="notes-analyze-btn" class="eduguard-btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-lg">
                <i class="fas fa-wand-magic-sparkles"></i>
                <span>Analyze Notes & Generate Flashcards</span>
              </button>
            </div>
          </div>
        </div>
      `;

      container.querySelector('#notes-analyze-btn')?.addEventListener('click', async () => {
        const text = container.querySelector('#notes-raw-textarea')?.value || '';
        if (text.trim().length < 10) return;
        notesInputText = text;
        notesIsLoading = true;
        renderNotesTab(container);

        analyzedNotesResult = await client.analyzeNotes({
          notesText: text,
          topicId: 'quadratic_equations',
          subjectId: 'mathematics'
        });
        notesIsLoading = false;
        renderNotesTab(container);
      });
      return;
    }

    // Results View
    const r = analyzedNotesResult;
    const cards = r.flashcards || [];
    const activeCard = cards[currentFlashcardIndex] || { front: 'No card', back: 'No back' };

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight">${esc(r.topic_name || 'Study Notes Analysis')}</h1>
            <p class="text-xs text-slate-400 mt-1">${esc(r.summary)}</p>
          </div>
          <button id="notes-reset-btn" class="eduguard-btn-secondary text-xs">
            <i class="fas fa-rotate-left mr-1"></i> Analyze New Notes
          </button>
        </div>

        <!-- 4 Result Tabs: Concepts | Flashcards | Questions | Prerequisites -->
        <div class="flex items-center gap-2 border-b border-white/[0.08] pb-2">
          <button class="notes-tab-btn px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${notesActiveTab === 'concepts' ? 'bg-cyan-600 text-white shadow-md' : 'bg-[#151922] text-slate-400 hover:text-white border border-white/5'}" data-tab="concepts">
            Key Concepts (${(r.key_concepts || []).length})
          </button>
          <button class="notes-tab-btn px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${notesActiveTab === 'flashcards' ? 'bg-cyan-600 text-white shadow-md' : 'bg-[#151922] text-slate-400 hover:text-white border border-white/5'}" data-tab="flashcards">
            Interactive Flashcards (${cards.length})
          </button>
          <button class="notes-tab-btn px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${notesActiveTab === 'questions' ? 'bg-cyan-600 text-white shadow-md' : 'bg-[#151922] text-slate-400 hover:text-white border border-white/5'}" data-tab="questions">
            Practice Questions (${(r.practice_questions || []).length})
          </button>
          <button class="notes-tab-btn px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${notesActiveTab === 'prereqs' ? 'bg-cyan-600 text-white shadow-md' : 'bg-[#151922] text-slate-400 hover:text-white border border-white/5'}" data-tab="prereqs">
            Prerequisites
          </button>
        </div>

        <!-- Tab Content View -->
        ${notesActiveTab === 'concepts' ? `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${(r.key_concepts || []).map(c => `
              <div class="eduguard-card p-5 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sm text-white">${esc(c.concept)}</span>
                  <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono ${c.importance === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'}">${esc(c.importance)}</span>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed">${esc(c.summary)}</p>
              </div>
            `).join('')}
          </div>
        ` : notesActiveTab === 'flashcards' ? `
          <div class="max-w-xl mx-auto space-y-5 text-center">
            <div id="flashcard-flip-box" class="min-h-[240px] eduguard-card border-2 ${isFlashcardFlipped ? 'border-cyan-500 bg-cyan-950/20' : 'border-white/10'} p-8 flex flex-col justify-between items-center cursor-pointer transition-all shadow-xl hover:border-cyan-400">
              <span class="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
                ${isFlashcardFlipped ? 'ANSWER (CLICK TO FLIP BACK)' : 'QUESTION / PROMPT (CLICK TO REVEAL)'}
              </span>
              <div class="text-base font-bold text-white my-auto px-4 leading-relaxed">
                ${esc(isFlashcardFlipped ? activeCard.back : activeCard.front)}
              </div>
              <span class="text-[11px] text-cyan-400 font-mono font-bold">
                Card ${currentFlashcardIndex + 1} of ${cards.length}
              </span>
            </div>

            <!-- Flashcard Carousel Controls -->
            <div class="flex items-center justify-center gap-3">
              <button id="flashcard-prev-btn" class="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center text-xs transition-colors cursor-pointer" ${currentFlashcardIndex === 0 ? 'disabled opacity-30' : ''}>
                <i class="fas fa-arrow-left"></i>
              </button>
              <button id="flashcard-flip-btn" class="px-5 py-2.5 eduguard-btn-primary text-xs font-bold">
                Flip Card
              </button>
              <button id="flashcard-next-btn" class="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center text-xs transition-colors cursor-pointer" ${currentFlashcardIndex >= cards.length - 1 ? 'disabled opacity-30' : ''}>
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        ` : notesActiveTab === 'questions' ? `
          <div class="space-y-4">
            ${(r.practice_questions || []).map((pq, qIdx) => `
              <div class="eduguard-card p-5 space-y-3">
                <div class="font-bold text-sm text-white">Q${qIdx + 1}: ${esc(pq.question)}</div>
                <div class="space-y-2">
                  ${(pq.options || []).map((optText, oIdx) => `
                    <div class="p-3 rounded-xl border text-xs font-medium ${oIdx === pq.correct_index ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200 font-bold' : 'bg-white/5 border-white/5 text-slate-300'}">
                      ${String.fromCharCode(65 + oIdx)}. ${esc(optText)}
                    </div>
                  `).join('')}
                </div>
                <div class="text-[11px] text-slate-300 bg-[#10141d] p-3 rounded-xl border border-white/5 leading-relaxed">
                  <strong class="text-emerald-400">Explanation:</strong> ${esc(pq.explanation)}
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <!-- Prerequisites Tab -->
          <div class="eduguard-card p-6 space-y-4">
            <h3 class="font-bold text-sm text-white">Prerequisites Detected in These Notes</h3>
            <ul class="space-y-2 text-xs text-slate-300">
              ${(r.prerequisites_detected || ['Basic Algebra', 'Operations']).map(p => `
                <li class="flex items-center gap-2.5"><i class="fas fa-check-circle text-emerald-400"></i> ${esc(p)}</li>
              `).join('')}
            </ul>
          </div>
        `}
      </div>
    `;

    // Event listeners
    container.querySelector('#notes-reset-btn')?.addEventListener('click', () => {
      analyzedNotesResult = null;
      renderNotesTab(container);
    });

    container.querySelectorAll('.notes-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        notesActiveTab = btn.getAttribute('data-tab');
        renderNotesTab(container);
      });
    });

    container.querySelector('#flashcard-flip-box')?.addEventListener('click', () => {
      isFlashcardFlipped = !isFlashcardFlipped;
      renderNotesTab(container);
    });

    container.querySelector('#flashcard-flip-btn')?.addEventListener('click', () => {
      isFlashcardFlipped = !isFlashcardFlipped;
      renderNotesTab(container);
    });

    container.querySelector('#flashcard-prev-btn')?.addEventListener('click', () => {
      if (currentFlashcardIndex > 0) {
        currentFlashcardIndex--;
        isFlashcardFlipped = false;
        renderNotesTab(container);
      }
    });

    container.querySelector('#flashcard-next-btn')?.addEventListener('click', () => {
      if (currentFlashcardIndex < cards.length - 1) {
        currentFlashcardIndex++;
        isFlashcardFlipped = false;
        renderNotesTab(container);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 10. TEACHER CLASS HUB TAB
  // ═══════════════════════════════════════════════════════════════════════════════
  async function loadTeacherData(subjectId = teacherSubject) {
    teacherIsLoading = true;
    render();
    try {
      teacherHeatmap = await client.getTeacherHeatmap(subjectId);
      teacherMisconceptions = await client.getTeacherMisconceptions(subjectId);
      teacherAtRisk = await client.getTeacherAtRisk(subjectId);
      teacherDifficulty = await client.getTeacherTopicDifficulty(subjectId);
    } catch (_) {}
    teacherIsLoading = false;
    render();
  }

  function renderTeacherTab(container) {
    if (!teacherHeatmap && !teacherIsLoading) {
      loadTeacherData(teacherSubject);
      return;
    }

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight">Teacher & Proctor Analytics Hub</h1>
            <p class="text-xs text-slate-400 mt-1">Form 1 East Cohort Diagnostics, Common Misconception Clusters, & At-Risk Early Interventions.</p>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-xs text-slate-400 font-medium">Subject Cohort:</label>
            <select id="teacher-subject-picker" class="bg-[#151922] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer">
              <option value="mathematics" ${teacherSubject === 'mathematics' ? 'selected' : ''}>Mathematics</option>
              <option value="biology" ${teacherSubject === 'biology' ? 'selected' : ''}>Biology</option>
              <option value="chemistry" ${teacherSubject === 'chemistry' ? 'selected' : ''}>Chemistry</option>
              <option value="physics" ${teacherSubject === 'physics' ? 'selected' : ''}>Physics</option>
            </select>
          </div>
        </div>

        <!-- 4 Sub-Tabs -->
        <div class="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
          <button class="teacher-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${teacherActiveTab === 'heatmap' ? 'bg-emerald-600 text-white shadow-md' : 'bg-[#151922] text-slate-400 hover:text-white border border-white/5'}" data-tab="heatmap">
            Class Heatmap Matrix
          </button>
          <button class="teacher-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${teacherActiveTab === 'misconceptions' ? 'bg-emerald-600 text-white shadow-md' : 'bg-[#151922] text-slate-400 hover:text-white border border-white/5'}" data-tab="misconceptions">
            Misconception Clusters (${teacherMisconceptions?.clusters?.length || 0})
          </button>
          <button class="teacher-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${teacherActiveTab === 'atrisk' ? 'bg-emerald-600 text-white shadow-md' : 'bg-[#151922] text-slate-400 hover:text-white border border-white/5'}" data-tab="atrisk">
            At-Risk Students (${teacherAtRisk?.students?.length || 0})
          </button>
          <button class="teacher-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${teacherActiveTab === 'difficulty' ? 'bg-emerald-600 text-white shadow-md' : 'bg-[#151922] text-slate-400 hover:text-white border border-white/5'}" data-tab="difficulty">
            Topic Difficulty Cliffs
          </button>
        </div>

        <!-- Heatmap View -->
        ${teacherActiveTab === 'heatmap' ? `
          <div class="eduguard-card overflow-x-auto p-4">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-white/[0.08] text-slate-400 text-[11px] font-mono">
                  <th class="py-3 px-4 font-bold">Student Name</th>
                  ${(teacherHeatmap && teacherHeatmap.topics ? teacherHeatmap.topics : ['Arithmetic', 'Fractions', 'Algebra', 'Factoring', 'Quadratics']).map(top => `
                    <th class="py-3 px-4 font-bold text-center">${esc(top)}</th>
                  `).join('')}
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.04]">
                ${(teacherHeatmap && teacherHeatmap.student_names ? teacherHeatmap.student_names : ['Brian Ochieng', 'Alice Mwangi', 'Faith Muthoni', 'David Kariuki']).map((sname, sIdx) => `
                  <tr class="hover:bg-white/[0.02] transition-colors">
                    <td class="py-3 px-4 font-semibold text-white">${esc(sname)}</td>
                    ${(teacherHeatmap && teacherHeatmap.topic_ids ? teacherHeatmap.topic_ids : [1, 2, 3, 4, 5]).map((tid, tIdx) => {
                      const score = Math.max(30, Math.min(96, Math.round(75 + ((sIdx * 7 + tIdx * 11) % 40) - 20)));
                      const bg = score >= 80 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : score >= 60 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : score >= 40 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
                      return `<td class="py-3 px-4 text-center"><span class="px-2.5 py-1 rounded-md font-mono font-bold text-xs ${bg}">${score}%</span></td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : teacherActiveTab === 'misconceptions' ? `
          <!-- Misconception Clusters -->
          <div class="space-y-4">
            ${(teacherMisconceptions && teacherMisconceptions.clusters ? teacherMisconceptions.clusters : []).map(cl => `
              <div class="eduguard-card p-5 space-y-2.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-white text-sm">${esc(cl.topic_name)}: ${esc(cl.error_tag.replace(/_/g, ' '))}</span>
                  <span class="text-rose-400 font-bold bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 rounded-md font-mono">${cl.prevalence_percent}% Prevalence</span>
                </div>
                <div class="text-xs text-slate-300 leading-relaxed">${esc(cl.recommended_intervention)}</div>
                <div class="text-[11px] text-slate-400 font-mono border-t border-white/[0.06] pt-2">Affected Cohort: ${(cl.example_students || []).join(', ')}</div>
              </div>
            `).join('')}
          </div>
        ` : teacherActiveTab === 'atrisk' ? `
          <!-- At-Risk Students -->
          <div class="space-y-4">
            ${(teacherAtRisk && teacherAtRisk.students ? teacherAtRisk.students : []).map(st => `
              <div class="eduguard-card p-5 space-y-2.5 border-rose-500/30">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-white text-sm">${esc(st.student_name)}</span>
                  <span class="text-rose-300 font-bold bg-rose-500/20 border border-rose-500/30 px-2.5 py-0.5 rounded-md uppercase font-mono">${esc(st.risk_level)}</span>
                </div>
                <div class="text-xs text-slate-300">Weakest Concept: <strong>${esc(st.weakest_topic_name)}</strong> (Average: <span class="text-rose-400 font-mono font-bold">${st.average_mastery}%</span>)</div>
                <div class="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">${esc(st.recommended_action)}</div>
              </div>
            `).join('')}
          </div>
        ` : `
          <!-- Topic Difficulty Profiles -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${(teacherDifficulty && teacherDifficulty.profiles ? teacherDifficulty.profiles : []).map(p => `
              <div class="eduguard-card p-5 space-y-3">
                <div class="font-bold text-sm text-white">${esc(p.topic_name)}</div>
                <div class="text-xs text-slate-300">Class Average: <strong class="text-emerald-400 font-mono font-bold">${p.class_average_mastery}%</strong></div>
                <div class="text-[11px] text-slate-400 space-y-1.5 font-mono">
                  <div>Basic Tier: <b class="text-white">${p.basic_accuracy}%</b></div>
                  <div>Medium Tier: <b class="text-white">${p.medium_accuracy}%</b></div>
                  <div>Hard Tier: <b class="text-white">${p.hard_accuracy}%</b></div>
                </div>
                ${p.difficulty_cliff_detected ? `
                  <div class="text-[10px] text-rose-300 font-bold bg-rose-500/20 border border-rose-500/30 px-2 py-1 rounded-md">
                    Difficulty Cliff Detected (Drop between basic & application)
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    container.querySelector('#teacher-subject-picker')?.addEventListener('change', (e) => {
      teacherSubject = e.target.value;
      loadTeacherData(teacherSubject);
    });

    container.querySelectorAll('.teacher-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        teacherActiveTab = btn.getAttribute('data-tab');
        renderTeacherTab(container);
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 11. EXAM GUARD PROCTORING TAB
  // ═══════════════════════════════════════════════════════════════════════════════
  function renderProctorTab(container) {
    const q = EXAM_QUESTIONS[examCurrentIndex];

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-2xl ${proctorActive ? 'bg-rose-600 shadow-rose-600/30' : 'bg-slate-800'} text-white flex items-center justify-center text-lg shadow-md border border-white/10">
              <i class="fas fa-shield-halved"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-white tracking-tight">Exam Guard & Proctoring Shield</h1>
              <p class="text-xs text-slate-400 mt-1">Anti-Cheat Focus Loss Tracking, Clipboard Guard, & Integrity Scoring</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-[11px] text-slate-400 font-medium">Session Integrity Score</div>
            <div class="text-base font-mono font-black ${integrityScore >= 80 ? 'text-emerald-400' : integrityScore >= 50 ? 'text-amber-400' : 'text-rose-400'}">${integrityScore}%</div>
          </div>
        </div>

        ${!proctorActive && !examCompleted ? `
          <div class="eduguard-card p-10 text-center space-y-5">
            <div class="w-16 h-16 rounded-3xl bg-rose-500/15 text-rose-400 mx-auto flex items-center justify-center text-2xl border border-rose-500/30 shadow-lg">
              <i class="fas fa-shield-halved"></i>
            </div>
            <h2 class="text-xl font-bold text-white">Official KSEF National Assessment Session</h2>
            <p class="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
              When started, Exam Guard monitors window focus loss, desktop multi-tasking, clipboard events, and tab switches. Violations penalize your real-time Integrity Score.
            </p>
            <div class="pt-2">
              <button id="proctor-start-exam-btn" class="bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-3 rounded-xl text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer">
                Begin Proctored Exam (10 Mins)
              </button>
            </div>
          </div>
        ` : examCompleted ? `
          <div class="eduguard-card p-10 text-center space-y-5">
            <div class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto border border-emerald-500/30">
              <i class="fas fa-award"></i>
            </div>
            <h2 class="text-2xl font-bold text-white">Exam Completed Successfully</h2>
            <p class="text-xs text-slate-300">Final Proctored Integrity Score: <strong class="font-mono text-emerald-400 text-base">${integrityScore}%</strong></p>
            <div class="pt-2">
              <button id="proctor-reset-btn" class="eduguard-btn-secondary px-6 py-2.5 text-xs">
                Reset Session
              </button>
            </div>
          </div>
        ` : `
          <!-- Active Proctored Exam Runner -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-8 eduguard-card p-6 space-y-5">
              <div class="flex items-center justify-between text-xs pb-3 border-b border-white/[0.06]">
                <span class="text-emerald-400 font-bold font-mono">${esc(q.subject)}: ${esc(q.topic)}</span>
                <span class="text-slate-400 font-mono font-semibold">Q ${examCurrentIndex + 1} of ${EXAM_QUESTIONS.length}</span>
              </div>
              <div class="text-sm font-bold text-white leading-relaxed font-sans">${esc(q.question)}</div>
              <div class="space-y-3 pt-2">
                ${q.options.map((opt, i) => `
                  <button class="exam-opt-btn w-full p-3.5 rounded-xl border text-left flex items-center gap-3.5 text-xs transition-all cursor-pointer ${examAnswers[q.id] === i ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold shadow-md' : 'bg-[#10141d] border-white/[0.08] text-slate-300 hover:border-white/20'}" data-index="${i}">
                    <span class="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center font-bold ${examAnswers[q.id] === i ? 'bg-emerald-500 text-black' : 'text-slate-300'}">${String.fromCharCode(65 + i)}</span>
                    <span class="text-sm leading-snug">${esc(opt)}</span>
                  </button>
                `).join('')}
              </div>
              <div class="flex justify-between pt-4 border-t border-white/[0.06]">
                <button id="exam-prev-btn" class="eduguard-btn-secondary px-4 py-2 text-xs" ${examCurrentIndex === 0 ? 'disabled opacity-30' : ''}>
                  Previous
                </button>
                <button id="exam-next-btn" class="eduguard-btn-primary px-5 py-2 text-xs font-bold">
                  ${examCurrentIndex >= EXAM_QUESTIONS.length - 1 ? 'Finish & Submit Exam' : 'Next Question'}
                </button>
              </div>
            </div>

            <!-- Integrity Log Sidebar -->
            <div class="lg:col-span-4 eduguard-card p-4 space-y-3 bg-[#0a0d14]">
              <h3 class="text-xs font-bold text-white flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                <i class="fas fa-eye text-rose-400"></i> Live Proctor Audit Trail
              </h3>
              <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
                ${integrityViolations.length > 0 ? integrityViolations.map(v => `
                  <div class="bg-rose-950/40 border border-rose-900/50 p-2.5 rounded-xl text-[11px] text-rose-200">
                    <div class="font-bold flex justify-between">
                      <span class="font-mono">-${v.penalty}% Penalty</span>
                      <span class="text-slate-500 font-mono">${v.time}</span>
                    </div>
                    <div class="text-slate-300 mt-0.5">${esc(v.reason)}</div>
                  </div>
                `).join('') : `
                  <div class="text-center py-12 text-xs text-slate-500">
                    No integrity violations recorded. System focus secure.
                  </div>
                `}
              </div>
            </div>
          </div>
        `}
      </div>
    `;

    // Exam controls
    container.querySelector('#proctor-start-exam-btn')?.addEventListener('click', () => {
      proctorActive = true;
      integrityScore = 100;
      integrityViolations = [];
      examCurrentIndex = 0;
      examAnswers = {};
      examCompleted = false;
      renderProctorTab(container);
    });

    container.querySelectorAll('.exam-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        examAnswers[q.id] = parseInt(btn.getAttribute('data-index'));
        renderProctorTab(container);
      });
    });

    container.querySelector('#exam-prev-btn')?.addEventListener('click', () => {
      if (examCurrentIndex > 0) {
        examCurrentIndex--;
        renderProctorTab(container);
      }
    });

    container.querySelector('#exam-next-btn')?.addEventListener('click', () => {
      if (examCurrentIndex >= EXAM_QUESTIONS.length - 1) {
        proctorActive = false;
        examCompleted = true;
      } else {
        examCurrentIndex++;
      }
      renderProctorTab(container);
    });

    container.querySelector('#proctor-reset-btn')?.addEventListener('click', () => {
      examCompleted = false;
      proctorActive = false;
      renderProctorTab(container);
    });
  }

  // Initialize Shell
  render();
  return root;
}
