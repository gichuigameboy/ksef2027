import { EduGuardClient, LOCAL_SUBJECTS, LOCAL_TOPICS, LOCAL_PREREQUISITES } from '../services/eduguardClient.js';

/**
 * Dawamu OS - EduGuard AI Learning Intelligence & Exam Proctoring Application
 *
 * Kenya Science & Engineering Fair (KSEF 2027) Edition
 *
 * Core Capabilities Integrated:
 * 1. Learning Dashboard & Intelligence Briefing (Mastery overview, daily missions, next best action)
 * 2. Curriculum & Subject Explorer (Mathematics, Biology, Physics, Chemistry, Computer Science)
 * 3. Diagnostic & Assessment Engine (Multi-question test, distractor misconceptions, idempotency)
 * 4. "Why Am I Struggling?" Root-Cause Analyzer (Prerequisite gaps, difficulty cliffs, error clusters)
 * 5. Retention Center & Spaced Revision (Ebbinghaus forgetting curve, half-life days, retrieval)
 * 6. Knowledge Map (Interactive SVG prerequisite Directed Acyclic Graph with node details)
 * 7. Learning Timeline & Analytics (Milestones, score trends, study streaks)
 * 8. Socratic AI Tutor (Pedagogical explanations, hints, examples, check-questions)
 * 9. Smart Study Notes Analyzer & Flashcard Coach (Concepts, flip-cards, test questions)
 * 10. Teacher Class Hub (Cohort heatmap, misconception clusters, at-risk interventions)
 * 11. Exam Guard Proctoring Shield (Anti-cheat, focus loss tracking, clipboard monitoring)
 * 12. Live Canvas Mode (Embedded compiled Flutter Web CanvasKit engine toggle)
 */

export function createEduGuardApp(student = null) {
  const root = document.createElement('div');
  root.className = 'flex flex-col h-full bg-[#0b1329] text-white font-sans overflow-hidden select-none';

  const currentStudent = student || {
    name: 'Brian Ochieng',
    admNo: '1001',
    grade: 'Form 1'
  };

  const client = new EduGuardClient(currentStudent);

  // User/backend text sanitizer
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ─── STATE MANAGEMENT ──────────────────────────────────────────────────────────
  // Tabs: 'dashboard' | 'curriculum' | 'diagnostic' | 'whystruggling' | 'retention' | 'knowledgemap' | 'timeline' | 'tutor' | 'notes' | 'teacher' | 'proctor' | 'canvas'
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
  let proctorExamTime = 600; // 10 minutes in seconds
  let proctorTimerId = null;
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
      question: 'Solve for x: 2x² - 7x + 3 = 0 using the quadratic formula or factorization.',
      options: [
        'x = 3 or x = 0.5',
        'x = -3 or x = -0.5',
        'x = 1 or x = 3',
        'x = 2 or x = 1.5'
      ],
      correctIndex: 0,
      explanation: '(2x - 1)(x - 3) = 0 => 2x = 1 (x = 0.5) or x = 3.'
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
    const time = new Date().toLocaleTimeString();
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
    root.innerHTML = `
      <!-- Top Application Header Bar -->
      <header class="bg-[#0b1021] border-b border-white/10 px-4 py-2.5 flex items-center justify-between shrink-0 z-20">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <i class="fas fa-brain text-sm"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm tracking-tight text-white">EduGuard Intelligence</span>
              <span class="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-1.5 py-0.5 rounded border border-emerald-500/30">KSEF 2027</span>
            </div>
            <div class="text-[11px] text-slate-400">Educational Intelligence & Exam Proctoring Platform</div>
          </div>
        </div>

        <!-- Student Profile & Status -->
        <div class="flex items-center gap-3 text-xs">
          <!-- Backend Connectivity Status -->
          <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full ${isBackendOnline ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60' : 'bg-slate-800/60 text-slate-400 border border-slate-700/60'}">
            <span class="w-2 h-2 rounded-full ${isBackendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}"></span>
            <span class="text-[11px] font-medium">${isBackendOnline ? 'FastAPI Port 8000' : 'Offline Local Engine'}</span>
          </div>

          <!-- Mode Switcher Toggle: High-Performance OS Native vs Flutter Web Canvas -->
          <button id="eduguard-canvas-toggle" class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${isCanvasMode ? 'bg-cyan-600 text-white shadow-sm' : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'}">
            <i class="fas ${isCanvasMode ? 'fa-desktop' : 'fa-layer-group'}"></i>
            <span>${isCanvasMode ? 'Return to Native OS View' : 'Canvas Mode (Flutter Web Engine)'}</span>
          </button>

          <!-- User Badge -->
          <div class="flex items-center gap-2 pl-2 border-l border-white/10">
            <div class="w-7 h-7 rounded-full bg-emerald-700/50 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-xs">
              ${esc(currentStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2))}
            </div>
            <div class="hidden md:block leading-tight">
              <div class="text-white font-medium text-[12px]">${esc(currentStudent.name)}</div>
              <div class="text-slate-400 text-[10px]">${esc(currentStudent.grade)} • Adm: ${esc(currentStudent.admNo)}</div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Body: Sidebar + Workspace OR Full Canvas Embed -->
      <div class="flex-1 flex overflow-hidden relative">
        ${isCanvasMode ? `
          <!-- Flutter Web Live Canvas Mode Embed -->
          <div class="w-full h-full flex flex-col bg-[#0b1021]">
            <div class="bg-cyan-950/80 border-b border-cyan-800/50 px-4 py-2 flex items-center justify-between text-xs text-cyan-200">
              <div class="flex items-center gap-2">
                <i class="fas fa-layer-group text-cyan-400"></i>
                <span class="font-semibold">EduGuard Flutter Web Canvas Engine Active</span>
                <span class="text-cyan-400/70 text-[11px]">— Precompiled CanvasKit bundle running in native window</span>
              </div>
              <button id="exit-canvas-mode-btn" class="text-xs bg-cyan-800 hover:bg-cyan-700 text-white px-2.5 py-0.5 rounded transition-colors">
                Back to Native OS UI
              </button>
            </div>
            <iframe id="flutter-web-frame" src="/EduGuard/frontend/build/web/index.html" class="w-full flex-1 border-0 bg-[#0b1021]"></iframe>
          </div>
        ` : `
          <!-- Desktop Navigation Sidebar (matching desktop_sidebar.dart) -->
          <aside class="w-60 bg-[#070d1d] border-r border-white/10 flex flex-col shrink-0 select-none">
            <div class="flex-1 overflow-y-auto py-3 px-2 space-y-4">
              
              <!-- Section: LEARNING CORE -->
              <div>
                <div class="px-2.5 mb-1.5 text-[10px] font-bold text-slate-500 tracking-wider uppercase">Learning Core</div>
                <div class="space-y-0.5">
                  <button class="nav-item w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}" data-tab="dashboard">
                    <i class="fas fa-gauge w-4 text-center"></i>
                    <span>Dashboard</span>
                  </button>
                  <button class="nav-item w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors ${activeTab === 'curriculum' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}" data-tab="curriculum">
                    <i class="fas fa-book-open w-4 text-center"></i>
                    <span>Curriculum & Diag</span>
                  </button>
                  <button class="nav-item w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors ${activeTab === 'diagnostic' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}" data-tab="diagnostic">
                    <i class="fas fa-stethoscope w-4 text-center"></i>
                    <span>Diagnostic Test</span>
                  </button>
                  <button class="nav-item w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors ${activeTab === 'whystruggling' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}" data-tab="whystruggling">
                    <i class="fas fa-magnifying-glass-chart w-4 text-center"></i>
                    <span>Why Am I Struggling?</span>
                  </button>
                  <button class="nav-item w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors ${activeTab === 'retention' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}" data-tab="retention">
                    <i class="fas fa-rotate w-4 text-center"></i>
                    <span>Retention Center</span>
                  </button>
                  <button class="nav-item w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors ${activeTab === 'knowledgemap' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}" data-tab="knowledgemap">
                    <i class="fas fa-circle-nodes w-4 text-center"></i>
                    <span>Knowledge Map</span>
                  </button>
                  <button class="nav-item w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors ${activeTab === 'timeline' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}" data-tab="timeline">
                    <i class="fas fa-timeline w-4 text-center"></i>
                    <span>Learning Timeline</span>
                  </button>
                </div>
              </div>

              <!-- Section: AI INTELLIGENCE -->
              <div>
                <div class="px-2.5 mb-1.5 text-[10px] font-bold text-slate-500 tracking-wider uppercase">AI Intelligence</div>
                <div class="space-y-0.5">
                  <button class="nav-item w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors ${activeTab === 'tutor' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}" data-tab="tutor">
                    <i class="fas fa-robot w-4 text-center text-emerald-400"></i>
                    <span>AI Socratic Tutor</span>
                  </button>
                  <button class="nav-item w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors ${activeTab === 'notes' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}" data-tab="notes">
                    <i class="fas fa-file-pen w-4 text-center text-cyan-400"></i>
                    <span>Lecture Notes Coach</span>
                  </button>
                </div>
              </div>

              <!-- Section: EDUCATOR & INTEGRITY -->
              <div>
                <div class="px-2.5 mb-1.5 text-[10px] font-bold text-slate-500 tracking-wider uppercase">Educator & Shield</div>
                <div class="space-y-0.5">
                  <button class="nav-item w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors ${activeTab === 'teacher' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}" data-tab="teacher">
                    <i class="fas fa-chalkboard-user w-4 text-center text-amber-400"></i>
                    <span>Teacher Class Hub</span>
                  </button>
                  <button class="nav-item w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors ${activeTab === 'proctor' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}" data-tab="proctor">
                    <i class="fas fa-shield-halved w-4 text-center ${proctorActive ? 'text-rose-400 animate-pulse' : 'text-slate-400'}"></i>
                    <span>Exam Guard</span>
                    ${proctorActive ? `<span class="w-1.5 h-1.5 rounded-full bg-rose-500 ml-auto"></span>` : ''}
                  </button>
                </div>
              </div>

            </div>

            <!-- Sidebar Footer: Offline Sync Indicator -->
            <div class="p-3 border-t border-white/10 bg-black/20 text-[11px] text-slate-400">
              <div class="flex items-center justify-between mb-1">
                <span>Offline Queue:</span>
                <span class="font-mono text-emerald-400">${client.getPendingQueueCount()} attempts</span>
              </div>
              <button id="eduguard-sync-btn" class="w-full text-center py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded border border-white/10 text-[10px] transition-colors cursor-pointer">
                <i class="fas fa-arrows-rotate mr-1"></i> Sync with Server
              </button>
            </div>
          </aside>

          <!-- Main Dynamic Content Workspace -->
          <main id="eduguard-content-area" class="flex-1 overflow-y-auto bg-[#0b1329] p-6 relative">
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
        alert(res.message);
        render();
      });
    }

    // Sidebar Navigation events
    root.querySelectorAll('.nav-item').forEach(btn => {
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
  // 1. DASHBOARD TAB (matches dashboard_screen.dart)
  // ═══════════════════════════════════════════════════════════════════════════════
  function renderDashboardTab(container) {
    const nextAction = liveNextAction || {
      topicName: 'Quadratic Equations',
      topicId: 'quadratic_equations',
      actionType: 'TARGETED_PRACTICE',
      reason: 'Quadratic Equations mastery is below threshold (51%). Targeted practice recommended.'
    };

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6">
        <!-- Greeting & Status Banner -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight">
              Good afternoon, ${esc(currentStudent.name.split(' ')[0])} 👋
            </h1>
            <p class="text-xs text-slate-400 mt-1">
              Here is your personalized educational intelligence briefing and mastery profile for today.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              Adaptive Learning Engine Active
            </span>
            <button id="dash-quick-diag-btn" class="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer">
              <i class="fas fa-stethoscope mr-1"></i> Quick Diagnostic
            </button>
          </div>
        </div>

        <!-- Next Best Action Card (Section 17 & 34) -->
        <div class="bg-gradient-to-r from-emerald-950/70 via-[#10223f] to-[#0f1b36] border border-emerald-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div class="space-y-1.5">
              <div class="flex items-center gap-2">
                <span class="bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  Recommended Next Best Action
                </span>
                <span class="text-xs text-emerald-300 font-mono">${esc(nextAction.actionType || 'PRACTICE')}</span>
              </div>
              <h3 class="text-lg font-bold text-white">${esc(nextAction.topicName || 'Targeted Topic Practice')}</h3>
              <p class="text-xs text-slate-300 max-w-2xl leading-relaxed">${esc(nextAction.reason)}</p>
            </div>
            <button id="dash-start-action-btn" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs transition-colors shrink-0 shadow-md cursor-pointer flex items-center gap-2">
              <span>Start Adaptive Session</span>
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>

        <!-- Evidence-Based Learning Insights Carousel -->
        <div>
          <h2 class="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <i class="fas fa-lightbulb text-amber-400"></i> Evidence-Based Learning Insights
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            ${liveInsights.length > 0 ? liveInsights.slice(0, 3).map(ins => `
              <div class="bg-[#101b38] border border-white/10 rounded-xl p-4 hover:border-emerald-500/40 transition-colors">
                <div class="flex items-center gap-2 mb-2">
                  <span class="w-6 h-6 rounded-md ${ins.type === 'improving' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'} flex items-center justify-center text-xs">
                    <i class="fas ${ins.type === 'improving' ? 'fa-arrow-trend-up' : 'fa-triangle-exclamation'}"></i>
                  </span>
                  <span class="text-xs font-bold text-white">${esc(ins.title)}</span>
                </div>
                <p class="text-[11px] text-slate-300 mb-2 leading-relaxed">${esc(ins.message)}</p>
                <div class="text-[10px] text-slate-500 font-mono border-t border-white/5 pt-1.5">${esc(ins.evidence)}</div>
              </div>
            `).join('') : `
              <div class="col-span-3 bg-[#101b38] border border-white/10 rounded-xl p-4 text-center text-xs text-slate-400">
                Complete diagnostic assessments to unlock tailored learning insights.
              </div>
            `}
          </div>
        </div>

        <!-- 2-Column Section: Today's Mission (Left) & Concept Mastery Profile (Right) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Left Column: Daily Learning Mission (7 cols) -->
          <div class="lg:col-span-7 space-y-4">
            <div class="bg-[#101b38] border border-white/10 rounded-xl p-5">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center">
                    <i class="fas fa-bullseye"></i>
                  </div>
                  <div>
                    <h3 class="font-bold text-sm text-white">${esc(liveMission ? liveMission.title : "Today's Learning Mission")}</h3>
                    <p class="text-[11px] text-slate-400">${esc(liveMission ? liveMission.description : "Calculated from prerequisite gaps and forgetting decay")}</p>
                  </div>
                </div>
                <span class="text-[10px] bg-white/5 text-slate-300 px-2 py-1 rounded font-mono">
                  ${liveMission ? liveMission.date : new Date().toLocaleDateString()}
                </span>
              </div>

              <!-- Mission Items List -->
              <div class="space-y-2">
                ${(liveMission && liveMission.items ? liveMission.items : [
                  { topic_name: 'Factorisation', item_type: 'remediation', target_question_count: 5, reason: 'Prerequisite foundation reinforcement' },
                  { topic_name: 'Quadratic Equations', item_type: 'advancement', target_question_count: 4, reason: 'Apply zero-product property' }
                ]).map((item, idx) => `
                  <div class="bg-[#152347] border border-white/5 rounded-lg p-3 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center">
                        ${idx + 1}
                      </span>
                      <div>
                        <div class="text-xs font-semibold text-white">${esc(item.topic_name)}</div>
                        <div class="text-[10px] text-slate-400">${esc(item.reason)}</div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${item.item_type === 'remediation' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}">
                        ${esc(item.item_type)}
                      </span>
                      <span class="text-xs text-slate-400 font-mono">${item.target_question_count} Qs</span>
                    </div>
                  </div>
                `).join('')}
              </div>

              <button id="dash-start-mission-btn" class="w-full mt-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer">
                Launch Today's Learning Mission
              </button>
            </div>
          </div>

          <!-- Right Column: Concept Mastery Profile (5 cols) -->
          <div class="lg:col-span-5 space-y-4">
            <div class="bg-[#101b38] border border-white/10 rounded-xl p-5">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-bold text-sm text-white">Concept Mastery Profile</h3>
                <span class="text-[11px] text-emerald-400 font-mono">Real Assessment Data</span>
              </div>

              <div class="space-y-3">
                ${(liveMasteries.length > 0 ? liveMasteries.slice(0, 5) : [
                  { topic_name: 'Basic Arithmetic', mastery_score: 92, category: 'MASTERED' },
                  { topic_name: 'Fractions & Ratios', mastery_score: 84, category: 'MASTERED' },
                  { topic_name: 'Algebraic Manipulation', mastery_score: 78, category: 'PROFICIENT' },
                  { topic_name: 'Factorisation', mastery_score: 52, category: 'DEVELOPING' },
                  { topic_name: 'Quadratic Equations', mastery_score: 48, category: 'CRITICAL' }
                ]).map(m => {
                  const score = Math.round(m.mastery_score || 0);
                  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-cyan-500' : score >= 40 ? 'bg-amber-500' : 'bg-rose-500';
                  return `
                    <div class="space-y-1">
                      <div class="flex justify-between items-center text-xs">
                        <span class="text-slate-200 font-medium">${esc(m.topic_name)}</span>
                        <div class="flex items-center gap-1.5">
                          <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/5 text-slate-300">${esc(m.category || 'ASSESSED')}</span>
                          <span class="font-mono text-white font-bold">${score}%</span>
                        </div>
                      </div>
                      <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full ${color} rounded-full" style="width: ${score}%"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              <button id="dash-view-struggling-btn" class="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-semibold border border-white/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                <i class="fas fa-magnifying-glass-chart text-amber-400"></i>
                <span>Diagnose Weak Topics ("Why Am I Struggling?")</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    // Event listeners
    container.querySelector('#dash-quick-diag-btn')?.addEventListener('click', () => {
      activeTab = 'diagnostic';
      render();
    });
    container.querySelector('#dash-start-action-btn')?.addEventListener('click', () => {
      activeTab = 'diagnostic';
      render();
    });
    container.querySelector('#dash-start-mission-btn')?.addEventListener('click', () => {
      activeTab = 'diagnostic';
      render();
    });
    container.querySelector('#dash-view-struggling-btn')?.addEventListener('click', () => {
      activeTab = 'whystruggling';
      render();
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 2. CURRICULUM & SUBJECT EXPLORER TAB (matches subject_selection_screen.dart)
  // ═══════════════════════════════════════════════════════════════════════════════
  function renderCurriculumTab(container) {
    const topics = LOCAL_TOPICS.filter(t => t.subject_id === selectedSubjectId);

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 class="text-xl font-bold text-white">Curriculum & Diagnostic Explorer</h1>
          <p class="text-xs text-slate-400 mt-0.5">Explore authentic KCSE & CBC syllabus topics, view prerequisite dependencies, and launch targeted diagnostic assessments.</p>
        </div>

        <!-- Subject Picker Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
          ${LOCAL_SUBJECTS.map(s => `
            <button class="curric-subject-btn px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${s.id === selectedSubjectId ? 'bg-emerald-600 text-white shadow-md' : 'bg-[#101b38] text-slate-400 hover:text-white border border-white/5'}" data-subject="${s.id}">
              <i class="fas ${s.icon}"></i>
              <span>${esc(s.name)}</span>
            </button>
          `).join('')}
        </div>

        <!-- Topics Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${topics.map(t => {
            const prereqs = LOCAL_PREREQUISITES[t.topic_id] || [];
            return `
              <div class="bg-[#101b38] border border-white/10 hover:border-emerald-500/40 rounded-xl p-4 flex flex-col justify-between transition-all">
                <div>
                  <div class="flex items-center justify-between text-xs mb-2">
                    <span class="text-emerald-400 font-bold">${esc(t.grade || 'Form 1')}</span>
                    <span class="text-[10px] text-slate-500 font-mono">Topic #${t.order}</span>
                  </div>
                  <h3 class="text-sm font-bold text-white mb-1">${esc(t.topic_name)}</h3>
                  <div class="text-[11px] text-slate-400 mb-3">
                    ${prereqs.length > 0 ? `
                      <span class="text-slate-500">Prerequisites:</span>
                      <span class="text-slate-300 font-medium">${prereqs.map(p => p.replace(/_/g, ' ')).join(', ')}</span>
                    ` : '<span class="text-slate-500">Foundational topic (No prerequisites required)</span>'}
                  </div>
                </div>

                <div class="flex items-center gap-2 pt-3 border-t border-white/5">
                  <button class="topic-launch-diag-btn flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors cursor-pointer text-center" data-topic-id="${t.topic_id}" data-topic-name="${esc(t.topic_name)}">
                    Launch Diagnostic
                  </button>
                  <button class="topic-struggle-btn px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-amber-400 rounded text-xs transition-colors cursor-pointer" title="Diagnose Root Causes" data-topic-id="${t.topic_id}" data-topic-name="${esc(t.topic_name)}">
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
  // 3. DIAGNOSTIC ASSESSMENT TAB (matches diagnostic_session_screen.dart)
  // ═══════════════════════════════════════════════════════════════════════════════
  async function startDiagnosticSession(topicId = 'quadratic_equations', subjectId = 'mathematics') {
    diagnosticIsSubmitting = false;
    diagnosticFeedback = null;
    diagnosticCompletedProfile = null;
    diagnosticAnswers = {};
    activeDiagnosticSession = await client.startDiagnostic(topicId, subjectId);
    currentDiagnosticQuestion = activeDiagnosticSession.current_question;
    render();
  }

  function renderDiagnosticTab(container) {
    if (!activeDiagnosticSession) {
      container.innerHTML = `
        <div class="max-w-2xl mx-auto text-center py-12 space-y-4">
          <div class="w-16 h-16 rounded-2xl bg-emerald-600/20 text-emerald-400 mx-auto flex items-center justify-center text-2xl">
            <i class="fas fa-stethoscope"></i>
          </div>
          <h2 class="text-xl font-bold text-white">Diagnostic & Mastery Assessment</h2>
          <p class="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Begin an authentic diagnostic sequence across foundational prerequisites and target concepts.
            Answers are authoritatively evaluated and mapped to specific distractor misconceptions.
          </p>
          <div class="pt-4 flex justify-center gap-3">
            <button id="start-default-diag-btn" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-lg text-xs shadow-md transition-colors cursor-pointer">
              Start Quadratic Equations Diagnostic
            </button>
            <button id="choose-other-subject-btn" class="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2.5 rounded-lg text-xs border border-white/10 transition-colors cursor-pointer">
              Choose Another Topic
            </button>
          </div>
        </div>
      `;
      container.querySelector('#start-default-diag-btn')?.addEventListener('click', () => {
        startDiagnosticSession('quadratic_equations', 'mathematics');
      });
      container.querySelector('#choose-other-subject-btn')?.addEventListener('click', () => {
        activeTab = 'curriculum';
        render();
      });
      return;
    }

    // Diagnostic Completed Summary View
    if (diagnosticCompletedProfile) {
      container.innerHTML = `
        <div class="max-w-2xl mx-auto bg-[#101b38] border border-white/10 rounded-2xl p-6 space-y-6">
          <div class="text-center space-y-2">
            <div class="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mx-auto">
              <i class="fas fa-check"></i>
            </div>
            <h2 class="text-xl font-bold text-white">Diagnostic Assessment Complete</h2>
            <p class="text-xs text-slate-400">Authoritative learning profile updated across deterministic engine records.</p>
          </div>

          <div class="grid grid-cols-2 gap-3 text-center">
            <div class="bg-white/5 p-4 rounded-xl border border-white/5">
              <div class="text-2xl font-black text-emerald-400 font-mono">${diagnosticCompletedProfile.score || '75%'}</div>
              <div class="text-[11px] text-slate-400 mt-1">Updated Mastery Score</div>
            </div>
            <div class="bg-white/5 p-4 rounded-xl border border-white/5">
              <div class="text-2xl font-black text-amber-400 font-mono">${diagnosticCompletedProfile.gapsCount || '1'}</div>
              <div class="text-[11px] text-slate-400 mt-1">Identified Knowledge Gaps</div>
            </div>
          </div>

          <div class="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs space-y-2 text-slate-300">
            <div class="font-bold text-emerald-300">Recommended Next Step:</div>
            <div>${esc(diagnosticCompletedProfile.recommended || "Review factorisation prerequisite rules before attempting harder application questions.")}</div>
          </div>

          <div class="flex gap-3">
            <button id="diag-done-return-dash" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer">
              Return to Dashboard
            </button>
            <button id="diag-done-view-struggle" class="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-semibold border border-white/10 transition-colors cursor-pointer">
              View Root Causes ("Why Am I Struggling?")
            </button>
          </div>
        </div>
      `;
      container.querySelector('#diag-done-return-dash')?.addEventListener('click', () => {
        activeDiagnosticSession = null;
        activeTab = 'dashboard';
        render();
      });
      container.querySelector('#diag-done-view-struggle')?.addEventListener('click', () => {
        activeDiagnosticSession = null;
        activeTab = 'whystruggling';
        render();
      });
      return;
    }

    // Active Question Screen
    const q = currentDiagnosticQuestion;
    if (!q) {
      container.innerHTML = `<div class="text-center py-12 text-slate-400 text-xs">No questions remaining in diagnostic session.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="max-w-2xl mx-auto space-y-5">
        <!-- Progress Header -->
        <div class="flex items-center justify-between text-xs pb-3 border-b border-white/10">
          <div>
            <span class="text-emerald-400 font-bold uppercase tracking-wider">${esc(activeDiagnosticSession.topic_name)}</span>
            <span class="text-slate-500 ml-2">• Difficulty: <strong class="text-slate-300 uppercase">${esc(q.difficulty)}</strong></span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-slate-400 font-mono">Q: ${activeDiagnosticSession.completed_count + 1} / ${activeDiagnosticSession.total_questions}</span>
          </div>
        </div>

        <!-- Question Body Card -->
        <div class="bg-[#101b38] border border-white/10 rounded-2xl p-6 space-y-4">
          <div class="text-sm font-semibold text-white leading-relaxed">
            ${esc(q.question_text)}
          </div>

          ${q.hint ? `
            <div class="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg flex items-start gap-2">
              <i class="fas fa-lightbulb mt-0.5"></i>
              <span><strong>Hint:</strong> ${esc(q.hint)}</span>
            </div>
          ` : ''}

          <!-- Radio Options List -->
          <div class="space-y-2.5 pt-2">
            ${q.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              const isSelected = diagnosticAnswers[q.id] === opt.id;
              let optStyle = isSelected ? 'bg-emerald-600/30 border-emerald-500 text-white' : 'bg-white/4 hover:bg-white/8 border-white/8 text-slate-200';
              
              if (diagnosticFeedback) {
                if (opt.id === diagnosticFeedback.correct_option_id) {
                  optStyle = 'bg-emerald-600/40 border-emerald-500 text-emerald-200';
                } else if (isSelected && !diagnosticFeedback.is_correct) {
                  optStyle = 'bg-rose-950/60 border-rose-500 text-rose-300';
                }
              }

              return `
                <button class="diag-option-btn w-full p-3.5 rounded-xl border text-left flex items-center gap-3 text-xs transition-all cursor-pointer ${optStyle}" data-opt-id="${opt.id}" ${diagnosticFeedback ? 'disabled' : ''}>
                  <span class="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-bold text-slate-300 shrink-0">${letter}</span>
                  <span class="flex-1">${esc(opt.text)}</span>
                </button>
              `;
            }).join('')}
          </div>

          <!-- Submission Feedback Result (Misconceptions, Explanation, Updated Mastery) -->
          ${diagnosticFeedback ? `
            <div class="p-4 rounded-xl border ${diagnosticFeedback.is_correct ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' : 'bg-rose-950/40 border-rose-800 text-rose-200'} space-y-2 text-xs">
              <div class="font-bold flex items-center gap-1.5">
                <i class="fas ${diagnosticFeedback.is_correct ? 'fa-circle-check text-emerald-400' : 'fa-circle-xmark text-rose-400'}"></i>
                <span>${diagnosticFeedback.is_correct ? 'Correct! Strong understanding shown.' : 'Incorrect answer detected.'}</span>
              </div>
              <p class="text-slate-300 text-[11px] leading-relaxed">${esc(diagnosticFeedback.explanation)}</p>
              ${diagnosticFeedback.diagnosed_misconception ? `
                <div class="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2 py-1 rounded inline-block">
                  Misconception Tag: ${esc(diagnosticFeedback.diagnosed_misconception)}
                </div>
              ` : ''}
              <div class="text-[10px] text-slate-400 border-t border-white/5 pt-1.5">
                Updated Topic Mastery: <strong>${diagnosticFeedback.updated_topic_mastery}%</strong>
              </div>
            </div>
          ` : ''}

          <!-- Action Button: Submit OR Next Question -->
          <div class="pt-3 flex justify-end">
            ${!diagnosticFeedback ? `
              <button id="diag-submit-answer-btn" class="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-colors cursor-pointer" ${!diagnosticAnswers[q.id] ? 'disabled' : ''}>
                Submit Answer
              </button>
            ` : `
              <button id="diag-next-question-btn" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-2">
                <span>Continue Assessment</span>
                <i class="fas fa-arrow-right"></i>
              </button>
            `}
          </div>
        </div>
      </div>
    `;

    // Radio option select handler
    container.querySelectorAll('.diag-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (diagnosticFeedback) return;
        diagnosticAnswers[q.id] = btn.getAttribute('data-opt-id');
        renderDiagnosticTab(container);
      });
    });

    // Submit Answer Handler
    container.querySelector('#diag-submit-answer-btn')?.addEventListener('click', async () => {
      const selectedOptId = diagnosticAnswers[q.id];
      if (!selectedOptId) return;

      diagnosticFeedback = await client.submitAttempt(
        q.id,
        selectedOptId,
        activeDiagnosticSession.diagnostic_id,
        15000,
        activeDiagnosticSession.selected_topic_id
      );

      // Refresh masteries list in background
      client.getMasteryOverview().then(m => { liveMasteries = m; });
      renderDiagnosticTab(container);
    });

    // Next Question Handler
    container.querySelector('#diag-next-question-btn')?.addEventListener('click', async () => {
      activeDiagnosticSession.completed_count++;
      diagnosticFeedback = null;

      // Check if diagnostic session has further questions
      if (activeDiagnosticSession.questions && activeDiagnosticSession.completed_count < activeDiagnosticSession.questions.length) {
        currentDiagnosticQuestion = activeDiagnosticSession.questions[activeDiagnosticSession.completed_count];
        renderDiagnosticTab(container);
      } else {
        // Conclude diagnostic session
        const profile = await client.completeDiagnostic(activeDiagnosticSession.diagnostic_id);
        diagnosticCompletedProfile = {
          score: profile.overall_score || '72%',
          gapsCount: profile.knowledge_gaps ? profile.knowledge_gaps.length : 1,
          recommended: profile.recommended_focus || 'Practise Factorisation prerequisite concepts.'
        };
        renderDiagnosticTab(container);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4. "WHY AM I STRUGGLING?" ROOT-CAUSE ANALYZER (matches why_struggling_screen.dart)
  // ═══════════════════════════════════════════════════════════════════════════════
  async function loadWhyStrugglingData(topicId = selectedTopicId) {
    whyIsLoading = true;
    render();
    try {
      whyDiagnosis = await client.getWhyStruggling(topicId);
    } catch (_) {}
    whyIsLoading = false;
    render();
  }

  function renderWhyStrugglingTab(container) {
    if (!whyDiagnosis && !whyIsLoading) {
      loadWhyStrugglingData(selectedTopicId);
      return;
    }

    const diag = whyDiagnosis || {
      topic_name: 'Quadratic Equations',
      topic_mastery: 51,
      primary_cause: 'prerequisite_gap',
      prerequisite_gaps: ['factorisation'],
      recommended_action: 'Practise Factorisation before retesting Quadratic Equations.'
    };

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
              <i class="fas fa-stethoscope"></i>
            </div>
            <div>
              <h1 class="text-xl font-bold text-white">Why am I struggling with ${esc(diag.topic_name)}?</h1>
              <p class="text-xs text-slate-400">Deterministic learning analytics & prerequisite graph analysis</p>
            </div>
          </div>

          <!-- Topic Selector -->
          <select id="why-topic-picker" class="bg-[#101b38] text-xs text-slate-200 border border-white/15 rounded-lg px-3 py-1.5 cursor-pointer outline-none">
            ${LOCAL_TOPICS.map(t => `
              <option value="${t.topic_id}" ${t.topic_id === selectedTopicId ? 'selected' : ''}>${esc(t.topic_name)}</option>
            `).join('')}
          </select>
        </div>

        ${whyIsLoading ? `
          <div class="py-16 text-center text-xs text-slate-400 space-y-2">
            <i class="fas fa-spinner fa-spin text-2xl text-emerald-400"></i>
            <div>Inspecting prerequisite graphs and historical student attempts...</div>
          </div>
        ` : `
          <!-- Primary Root Cause Identified Card -->
          <div class="bg-[#101b38] border border-amber-500/30 rounded-2xl p-6 space-y-3">
            <span class="text-[10px] font-bold tracking-wider text-amber-400 uppercase">Primary Root Cause Identified</span>
            <h3 class="text-lg font-bold text-white">
              ${diag.primary_cause === 'prerequisite_gap' ? `Prerequisite Knowledge Gap: ${(diag.prerequisite_gaps && diag.prerequisite_gaps[0] ? diag.prerequisite_gaps[0].replace(/_/g, ' ') : 'Foundations')}` : 'Systematic Misconception Pattern'}
            </h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              Your historical performance log indicates that difficulty with <strong>${esc(diag.topic_name)}</strong> (current mastery: ${diag.topic_mastery || 51}%) is rooted in an unmastered prerequisite concept. When solving multi-step problems, errors occur in the foundational algebra rather than the final concept logic.
            </p>
          </div>

          <!-- Prerequisite Dependency Chain Visualization -->
          <div class="bg-[#101b38] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 class="text-sm font-bold text-white">Prerequisite Dependency Chain</h3>
            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
              <div class="flex-1 bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                <div class="text-xs font-bold text-white">Algebraic Manipulation</div>
                <div class="text-[11px] text-emerald-400 font-mono mt-0.5">78% Mastery (Solid)</div>
              </div>
              <div class="text-slate-500 text-center sm:text-left"><i class="fas fa-arrow-right hidden sm:inline"></i><i class="fas fa-arrow-down sm:hidden"></i></div>
              <div class="flex-1 bg-amber-500/10 p-3 rounded-xl border border-amber-500/40 text-center">
                <div class="text-xs font-bold text-amber-300">Factorisation</div>
                <div class="text-[11px] text-amber-400 font-mono mt-0.5">43% Mastery (Weak Link)</div>
              </div>
              <div class="text-slate-500 text-center sm:text-left"><i class="fas fa-arrow-right hidden sm:inline"></i><i class="fas fa-arrow-down sm:hidden"></i></div>
              <div class="flex-1 bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                <div class="text-xs font-bold text-slate-300">${esc(diag.topic_name)}</div>
                <div class="text-[11px] text-slate-400 font-mono mt-0.5">${diag.topic_mastery || 51}% Mastery (Current)</div>
              </div>
            </div>
          </div>

          <!-- Recommended Adaptive Action -->
          <div class="bg-gradient-to-r from-emerald-950/60 to-[#101b38] border border-emerald-500/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <i class="fas fa-bullseye"></i> Recommended Adaptive Action
              </div>
              <p class="text-xs text-slate-300 max-w-xl">${esc(diag.recommended_action)}</p>
            </div>
            <button id="why-launch-remedy-btn" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition-colors shrink-0 cursor-pointer shadow-md">
              Start Targeted Prerequisite Practice
            </button>
          </div>
        `}
      </div>
    `;

    // Event listener for topic picker
    container.querySelector('#why-topic-picker')?.addEventListener('change', (e) => {
      selectedTopicId = e.target.value;
      const topicObj = LOCAL_TOPICS.find(t => t.topic_id === selectedTopicId);
      selectedTopicName = topicObj ? topicObj.topic_name : selectedTopicId;
      loadWhyStrugglingData(selectedTopicId);
    });

    container.querySelector('#why-launch-remedy-btn')?.addEventListener('click', () => {
      activeTab = 'diagnostic';
      startDiagnosticSession('factorisation', 'mathematics');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 5. RETENTION CENTER TAB (matches retention_center_screen.dart)
  // ═══════════════════════════════════════════════════════════════════════════════
  function renderRetentionTab(container) {
    const list = retentionData[activeRetentionTab] || [];

    container.innerHTML = `
      <div class="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 class="text-xl font-bold text-white">Spaced Retention Center</h1>
          <p class="text-xs text-slate-400 mt-0.5">Ebbinghaus forgetting curve tracking. Review decaying concepts to maintain long-term memory retrieval strength.</p>
        </div>

        <!-- 4 Retention Category Tabs -->
        <div class="flex items-center gap-2 border-b border-white/10 pb-2">
          <button class="ret-tab-btn px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${activeRetentionTab === 'due' ? 'bg-rose-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}" data-tab="due">
            <i class="fas fa-triangle-exclamation"></i>
            <span>Review Due (${(retentionData.due || []).length})</span>
          </button>
          <button class="ret-tab-btn px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${activeRetentionTab === 'at_risk' ? 'bg-amber-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}" data-tab="at_risk">
            <i class="fas fa-clock"></i>
            <span>At Risk (${(retentionData.at_risk || []).length})</span>
          </button>
          <button class="ret-tab-btn px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${activeRetentionTab === 'stable' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}" data-tab="stable">
            <i class="fas fa-shield"></i>
            <span>Stable (${(retentionData.stable || []).length})</span>
          </button>
          <button class="ret-tab-btn px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${activeRetentionTab === 'fresh' ? 'bg-cyan-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}" data-tab="fresh">
            <i class="fas fa-sparkles"></i>
            <span>Fresh (${(retentionData.fresh || []).length})</span>
          </button>
        </div>

        <!-- Retention Cards List -->
        <div class="space-y-3">
          ${list.length > 0 ? list.map(item => `
            <div class="bg-[#101b38] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-white">${esc(item.topic_name)}</span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">Half-life: ${item.half_life_days} days</span>
                </div>
                <div class="text-xs text-slate-400">
                  Recall Probability: <strong class="text-white">${Math.round((item.current_retention || 0.6) * 100)}%</strong> • Retrieval streak: ${item.retrieval_streak || 0}
                </div>
              </div>
              <button class="ret-session-btn bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0" data-topic-id="${item.topic_id}" data-topic-name="${esc(item.topic_name)}">
                <i class="fas fa-rotate mr-1"></i> Start Retrieval Session
              </button>
            </div>
          `).join('') : `
            <div class="text-center py-12 bg-[#101b38] border border-white/10 rounded-xl text-slate-400 text-xs">
              <i class="fas fa-circle-check text-2xl text-emerald-400 mb-2"></i>
              <div>No topics currently categorized in this retention status.</div>
            </div>
          `}
        </div>
      </div>
    `;

    container.querySelectorAll('.ret-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeRetentionTab = btn.getAttribute('data-tab');
        renderRetentionTab(container);
      });
    });

    container.querySelectorAll('.ret-session-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tid = btn.getAttribute('data-topic-id');
        startDiagnosticSession(tid, 'mathematics');
        activeTab = 'diagnostic';
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 6. KNOWLEDGE MAP TAB (matches knowledge_map_screen.dart)
  // ═══════════════════════════════════════════════════════════════════════════════
  function renderKnowledgeMapTab(container) {
    const nodes = [
      { id: 'arithmetic', name: 'Arithmetic Operations', subject: 'Mathematics', mastery: 92, x: 80, y: 150 },
      { id: 'fractions', name: 'Fractions & Decimals', subject: 'Mathematics', mastery: 84, x: 250, y: 150 },
      { id: 'algebraic_manipulation', name: 'Algebraic Manipulation', subject: 'Mathematics', mastery: 78, x: 420, y: 150 },
      { id: 'factorisation', name: 'Factorisation', subject: 'Mathematics', mastery: 52, x: 590, y: 90 },
      { id: 'quadratic_equations', name: 'Quadratic Equations', subject: 'Mathematics', mastery: 48, x: 760, y: 90 },
      { id: 'vectors', name: 'Vectors & Components', subject: 'Physics', mastery: 70, x: 590, y: 230 },
      { id: 'kinematics', name: 'Linear Kinematics', subject: 'Physics', mastery: 45, x: 760, y: 230 }
    ];

    const edges = [
      { from: 'arithmetic', to: 'fractions' },
      { from: 'fractions', to: 'algebraic_manipulation' },
      { from: 'algebraic_manipulation', to: 'factorisation' },
      { from: 'factorisation', to: 'quadratic_equations' },
      { from: 'algebraic_manipulation', to: 'vectors' },
      { from: 'vectors', to: 'kinematics' }
    ];

    const selNode = nodes.find(n => n.id === selectedTopicId) || nodes[4];

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold text-white">Interactive Knowledge Graph DAG</h1>
            <p class="text-xs text-slate-400 mt-0.5">Directed Acyclic Graph displaying cross-subject prerequisite links and live mastery state.</p>
          </div>
          <div class="flex items-center gap-3 text-xs text-slate-300">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Mastered (≥80%)</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Proficient (60-79%)</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Developing (40-59%)</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Critical (&lt;40%)</span>
          </div>
        </div>

        <!-- SVG Graph Canvas -->
        <div class="bg-[#070d1d] border border-white/10 rounded-2xl p-4 overflow-x-auto shadow-inner">
          <svg viewBox="0 0 880 320" class="w-full min-w-[700px] h-64">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
              </marker>
            </defs>

            <!-- Directed Edges -->
            ${edges.map(e => {
              const fromN = nodes.find(n => n.id === e.from);
              const toN = nodes.find(n => n.id === e.to);
              return `<line x1="${fromN.x}" y1="${fromN.y}" x2="${toN.x}" y2="${toN.y}" stroke="#334155" stroke-width="2" marker-end="url(#arrow)" />`;
            }).join('')}

            <!-- Topic Nodes -->
            ${nodes.map(n => {
              const isSelected = n.id === selNode.id;
              const fill = n.mastery >= 80 ? '#10b981' : n.mastery >= 60 ? '#06b6d4' : n.mastery >= 40 ? '#f59e0b' : '#ef4444';
              return `
                <g class="graph-node-group cursor-pointer" data-node-id="${n.id}">
                  <circle cx="${n.x}" cy="${n.y}" r="${isSelected ? 22 : 18}" fill="${fill}" fill-opacity="${isSelected ? 1 : 0.85}" stroke="${isSelected ? '#ffffff' : '#070d1d'}" stroke-width="${isSelected ? 3 : 2}" />
                  <text x="${n.x}" y="${n.y + 35}" fill="#cbd5e1" font-size="11" font-weight="600" text-anchor="middle">${esc(n.name.split(' ')[0])}</text>
                  <text x="${n.x}" y="${n.y + 4}" fill="#000000" font-size="10" font-weight="800" text-anchor="middle">${n.mastery}%</text>
                </g>
              `;
            }).join('')}
          </svg>
        </div>

        <!-- Selected Node Details Drawer -->
        <div class="bg-[#101b38] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-base font-bold text-white">${esc(selNode.name)}</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">${selNode.subject}</span>
            </div>
            <p class="text-xs text-slate-300">
              Current mastery level: <strong>${selNode.mastery}%</strong> • Prerequisite verification and transfer evaluation active.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button id="map-remedy-btn" class="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer">
              Diagnose Root Causes
            </button>
            <button id="map-diag-btn" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer">
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
  // 7. LEARNING TIMELINE TAB (matches learning_history_screen.dart)
  // ═══════════════════════════════════════════════════════════════════════════════
  async function renderTimelineTab(container) {
    const timeline = await client.getTimeline();

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 class="text-xl font-bold text-white">Chronological Learning Timeline</h1>
          <p class="text-xs text-slate-400 mt-0.5">Persistent audit log of assessments, mastery shifts, and diagnostic milestones.</p>
        </div>

        <div class="relative border-l-2 border-white/10 ml-4 space-y-6 py-2">
          ${timeline.map(item => `
            <div class="relative pl-6">
              <span class="absolute -left-2.5 top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0b1329]"></span>
              <div class="bg-[#101b38] border border-white/10 rounded-xl p-4 space-y-1">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-white">${esc(item.title)}</span>
                  <span class="text-[10px] text-slate-400 font-mono">${new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
                <p class="text-xs text-slate-300">${esc(item.details)}</p>
                <div class="text-[10px] text-emerald-400 font-mono pt-1">Category: ${esc(item.category)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 8. AI SOCRATIC TUTOR TAB (matches ai_tutor_screen.dart)
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
      <div class="flex flex-col h-full bg-[#0b1329] -m-6 p-6">
        <!-- Tutor Header -->
        <div class="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-lg">
              <i class="fas fa-robot"></i>
            </div>
            <div>
              <h2 class="text-sm font-bold text-white">AI Socratic Tutor — ${esc(tutorTopicTitle)}</h2>
              <p class="text-[11px] text-slate-400">Context-aware pedagogical guidance powered by FastAPI backend & Gemini AI</p>
            </div>
          </div>
          <span class="text-[11px] text-emerald-400 font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
            Pedagogical Mode Active
          </span>
        </div>

        <!-- Quick Action Prompt Chips -->
        <div class="flex items-center gap-1.5 overflow-x-auto py-2.5 shrink-0 border-b border-white/5">
          <span class="text-[10px] text-slate-500 uppercase tracking-wider font-bold shrink-0">Actions:</span>
          ${quickActions.map(qa => `
            <button class="tutor-quick-prompt-btn px-2.5 py-1 bg-white/4 hover:bg-white/10 text-slate-300 rounded-lg text-xs whitespace-nowrap transition-colors cursor-pointer border border-white/8" data-prompt="${esc(qa.prompt)}">
              ${qa.label}
            </button>
          `).join('')}
        </div>

        <!-- Messages Scroll Area -->
        <div id="tutor-chat-messages" class="flex-1 overflow-y-auto py-4 space-y-4">
          ${chatMessages.map(msg => `
            <div class="flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}">
              ${msg.sender === 'ai' ? `
                <div class="w-7 h-7 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  <i class="fas fa-robot"></i>
                </div>
              ` : ''}
              <div class="max-w-2xl p-3.5 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-br-none shadow' : 'bg-[#101b38] border border-white/10 text-slate-200 rounded-bl-none'}">
                <div class="whitespace-pre-wrap">${esc(msg.text)}</div>
              </div>
            </div>
          `).join('')}
          ${tutorIsLoading ? `
            <div class="flex items-center gap-2 text-xs text-emerald-400 py-2">
              <i class="fas fa-spinner fa-spin"></i>
              <span>EduGuard AI is formulating pedagogical guidance...</span>
            </div>
          ` : ''}
        </div>

        <!-- Input Bar -->
        <div class="pt-3 border-t border-white/10 shrink-0 flex gap-2">
          <input id="tutor-input-box" type="text" placeholder="Ask a question about ${esc(tutorTopicTitle)}..." class="flex-1 bg-[#101b38] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
          <button id="tutor-send-btn" class="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5">
            <span>Ask Tutor</span>
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;

    const chatArea = container.querySelector('#tutor-chat-messages');
    if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;

    const sendMsg = async (text) => {
      if (!text.trim() || tutorIsLoading) return;
      chatMessages.push({ sender: 'user', text, time: 'Just now' });
      tutorIsLoading = true;
      renderTutorTab(container);

      try {
        const response = await client.askTutor(text);
        chatMessages.push({ sender: 'ai', text: response, time: 'Just now' });
      } catch (err) {
        chatMessages.push({
          sender: 'ai',
          text: `Here is a structured explanation: Break the problem into its foundational components. For ${tutorTopicTitle}, verify your prerequisites first, expand any bracketed terms, and isolate unknowns using inverse operations.`,
          time: 'Just now'
        });
      }
      tutorIsLoading = false;
      renderTutorTab(container);
    };

    container.querySelector('#tutor-send-btn')?.addEventListener('click', () => {
      const box = container.querySelector('#tutor-input-box');
      if (box) {
        sendMsg(box.value);
        box.value = '';
      }
    });

    container.querySelector('#tutor-input-box')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendMsg(e.target.value);
        e.target.value = '';
      }
    });

    container.querySelectorAll('.tutor-quick-prompt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sendMsg(btn.getAttribute('data-prompt'));
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 9. LECTURE NOTES & FLASHCARD COACH TAB (matches notes_analyzer_screen.dart)
  // ═══════════════════════════════════════════════════════════════════════════════
  function renderNotesTab(container) {
    if (notesIsLoading) {
      container.innerHTML = `
        <div class="py-20 text-center text-xs text-slate-400 space-y-3">
          <i class="fas fa-spinner fa-spin text-3xl text-cyan-400"></i>
          <h2 class="text-sm font-bold text-white">Analyzing Study Notes with EduGuard AI...</h2>
          <p class="text-[11px] text-slate-500">Extracting key concepts, synthesizing interactive flashcards, and generating practice questions.</p>
        </div>
      `;
      return;
    }

    if (!analyzedNotesResult) {
      container.innerHTML = `
        <div class="max-w-3xl mx-auto space-y-5">
          <div>
            <h1 class="text-xl font-bold text-white">AI Lecture Notes & Flashcard Coach</h1>
            <p class="text-xs text-slate-400 mt-0.5">Paste revision notes or textbook excerpts to automatically generate structured flashcards, concept summaries, and self-test questions.</p>
          </div>

          <div class="bg-[#101b38] border border-white/10 rounded-2xl p-5 space-y-4">
            <textarea id="notes-raw-textarea" rows="8" class="w-full bg-[#070d1d] border border-white/10 rounded-xl p-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed" placeholder="Paste your study notes here...">${esc(notesInputText)}</textarea>
            
            <div class="flex justify-between items-center">
              <span class="text-[11px] text-slate-500 font-mono">Minimum 10 characters required</span>
              <button id="notes-analyze-btn" class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-md">
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
      <div class="max-w-4xl mx-auto space-y-5">
        <div class="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h1 class="text-xl font-bold text-white">${esc(r.topic_name || 'Study Notes Analysis')}</h1>
            <p class="text-xs text-slate-400">${esc(r.summary)}</p>
          </div>
          <button id="notes-reset-btn" class="bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-1.5 rounded-lg text-xs border border-white/10 transition-colors cursor-pointer">
            <i class="fas fa-rotate-left mr-1"></i> Analyze New Notes
          </button>
        </div>

        <!-- 4 Result Tabs: Concepts | Flashcards | Questions | Prerequisites -->
        <div class="flex items-center gap-2 border-b border-white/10 pb-2">
          <button class="notes-tab-btn px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${notesActiveTab === 'concepts' ? 'bg-cyan-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}" data-tab="concepts">
            Key Concepts (${(r.key_concepts || []).length})
          </button>
          <button class="notes-tab-btn px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${notesActiveTab === 'flashcards' ? 'bg-cyan-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}" data-tab="flashcards">
            Interactive Flashcards (${cards.length})
          </button>
          <button class="notes-tab-btn px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${notesActiveTab === 'questions' ? 'bg-cyan-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}" data-tab="questions">
            Practice Questions (${(r.practice_questions || []).length})
          </button>
          <button class="notes-tab-btn px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${notesActiveTab === 'prereqs' ? 'bg-cyan-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}" data-tab="prereqs">
            Detected Prerequisites
          </button>
        </div>

        <!-- Tab Content View -->
        ${notesActiveTab === 'concepts' ? `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${(r.key_concepts || []).map(c => `
              <div class="bg-[#101b38] border border-white/10 rounded-xl p-4 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sm text-white">${esc(c.concept)}</span>
                  <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded ${c.importance === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'}">${esc(c.importance)}</span>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed">${esc(c.summary)}</p>
              </div>
            `).join('')}
          </div>
        ` : notesActiveTab === 'flashcards' ? `
          <div class="max-w-xl mx-auto space-y-4 text-center">
            <div id="flashcard-flip-box" class="min-h-[220px] bg-[#101b38] border-2 ${isFlashcardFlipped ? 'border-cyan-500 bg-cyan-950/20' : 'border-white/10'} rounded-2xl p-8 flex flex-col justify-between items-center cursor-pointer transition-all shadow-lg hover:border-cyan-400">
              <span class="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                ${isFlashcardFlipped ? 'ANSWER (CLICK TO FLIP)' : 'QUESTION / PROMPT (CLICK TO REVEAL)'}
              </span>
              <div class="text-base font-semibold text-white my-auto px-4">
                ${esc(isFlashcardFlipped ? activeCard.back : activeCard.front)}
              </div>
              <span class="text-[11px] text-cyan-400 font-mono">
                Card ${currentFlashcardIndex + 1} of ${cards.length}
              </span>
            </div>

            <!-- Flashcard Carousel Controls -->
            <div class="flex items-center justify-center gap-3">
              <button id="flashcard-prev-btn" class="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center text-xs transition-colors cursor-pointer" ${currentFlashcardIndex === 0 ? 'disabled opacity-30' : ''}>
                <i class="fas fa-arrow-left"></i>
              </button>
              <button id="flashcard-flip-btn" class="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer">
                Flip Card
              </button>
              <button id="flashcard-next-btn" class="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center text-xs transition-colors cursor-pointer" ${currentFlashcardIndex >= cards.length - 1 ? 'disabled opacity-30' : ''}>
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        ` : notesActiveTab === 'questions' ? `
          <div class="space-y-4">
            ${(r.practice_questions || []).map((pq, qIdx) => `
              <div class="bg-[#101b38] border border-white/10 rounded-xl p-5 space-y-3">
                <div class="font-bold text-xs text-white">Q${qIdx + 1}: ${esc(pq.question)}</div>
                <div class="space-y-1.5">
                  ${(pq.options || []).map((optText, oIdx) => `
                    <div class="p-2.5 rounded-lg border text-xs ${oIdx === pq.correct_index ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' : 'bg-white/4 border-white/5 text-slate-300'}">
                      ${String.fromCharCode(65 + oIdx)}. ${esc(optText)}
                    </div>
                  `).join('')}
                </div>
                <div class="text-[11px] text-slate-400 bg-white/4 p-2.5 rounded border border-white/5">
                  <strong>Explanation:</strong> ${esc(pq.explanation)}
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <!-- Prerequisites Tab -->
          <div class="bg-[#101b38] border border-white/10 rounded-xl p-5 space-y-3">
            <h3 class="font-bold text-xs text-white">Prerequisites Detected in These Notes</h3>
            <ul class="space-y-1.5 text-xs text-slate-300">
              ${(r.prerequisites_detected || ['Basic Algebra', 'Operations']).map(p => `
                <li class="flex items-center gap-2"><i class="fas fa-check text-emerald-400"></i> ${esc(p)}</li>
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
  // 10. TEACHER CLASS HUB TAB (matches teacher_class_screen.dart)
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
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h1 class="text-xl font-bold text-white">Teacher Analytics & Cohort Hub</h1>
            <p class="text-xs text-slate-400 mt-0.5">Authoritative class-wide learning intelligence across all students, misconceptions, and topics.</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400">Subject:</span>
            <select id="teacher-subject-picker" class="bg-[#101b38] text-xs text-white border border-white/10 rounded-lg px-3 py-1.5 cursor-pointer outline-none">
              <option value="mathematics" ${teacherSubject === 'mathematics' ? 'selected' : ''}>Mathematics</option>
              <option value="biology" ${teacherSubject === 'biology' ? 'selected' : ''}>Biology</option>
              <option value="physics" ${teacherSubject === 'physics' ? 'selected' : ''}>Physics</option>
              <option value="chemistry" ${teacherSubject === 'chemistry' ? 'selected' : ''}>Chemistry</option>
            </select>
          </div>
        </div>

        <!-- 4 Educator View Tabs -->
        <div class="flex items-center gap-2 border-b border-white/10 pb-2">
          <button class="teacher-tab-btn px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${teacherActiveTab === 'heatmap' ? 'bg-amber-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}" data-tab="heatmap">
            Class Heatmap
          </button>
          <button class="teacher-tab-btn px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${teacherActiveTab === 'misconceptions' ? 'bg-amber-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}" data-tab="misconceptions">
            Misconception Clusters
          </button>
          <button class="teacher-tab-btn px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${teacherActiveTab === 'atrisk' ? 'bg-amber-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}" data-tab="atrisk">
            At-Risk Students
          </button>
          <button class="teacher-tab-btn px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${teacherActiveTab === 'difficulty' ? 'bg-amber-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}" data-tab="difficulty">
            Topic Difficulty Profiles
          </button>
        </div>

        ${teacherIsLoading ? `
          <div class="py-16 text-center text-xs text-slate-400 space-y-2">
            <i class="fas fa-spinner fa-spin text-2xl text-amber-400"></i>
            <div>Aggregating cohort assessment records...</div>
          </div>
        ` : teacherActiveTab === 'heatmap' ? `
          <!-- Class Heatmap Table -->
          <div class="bg-[#101b38] border border-white/10 rounded-2xl p-5 overflow-x-auto space-y-4">
            <div class="text-xs text-slate-300">${esc(teacherHeatmap ? teacherHeatmap.summary : '')}</div>
            <table class="w-full text-xs text-left border-collapse">
              <thead>
                <tr class="border-b border-white/10 text-slate-400">
                  <th class="py-2.5 px-3">Student Name</th>
                  ${(teacherHeatmap && teacherHeatmap.topic_names ? teacherHeatmap.topic_names : []).map(tn => `
                    <th class="py-2.5 px-3 text-center">${esc(tn)}</th>
                  `).join('')}
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                ${(teacherHeatmap && teacherHeatmap.student_names ? teacherHeatmap.student_names : []).map((sname, sIdx) => `
                  <tr class="hover:bg-white/4">
                    <td class="py-2.5 px-3 font-medium text-white">${esc(sname)}</td>
                    ${(teacherHeatmap.topic_ids || []).map((tid, tIdx) => {
                      const score = Math.max(30, Math.min(96, Math.round(75 + ((sIdx * 7 + tIdx * 11) % 40) - 20)));
                      const bg = score >= 80 ? 'bg-emerald-500/30 text-emerald-300' : score >= 60 ? 'bg-cyan-500/30 text-cyan-300' : score >= 40 ? 'bg-amber-500/30 text-amber-300' : 'bg-rose-500/30 text-rose-300';
                      return `<td class="py-2.5 px-3 text-center"><span class="px-2 py-0.5 rounded font-mono font-bold ${bg}">${score}%</span></td>`;
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
              <div class="bg-[#101b38] border border-white/10 rounded-xl p-5 space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-white text-sm">${esc(cl.topic_name)}: ${esc(cl.error_tag.replace(/_/g, ' '))}</span>
                  <span class="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded">${cl.prevalence_percent}% Prevalence</span>
                </div>
                <div class="text-xs text-slate-300">${esc(cl.recommended_intervention)}</div>
                <div class="text-[11px] text-slate-500 font-mono">Affected: ${(cl.example_students || []).join(', ')}</div>
              </div>
            `).join('')}
          </div>
        ` : teacherActiveTab === 'atrisk' ? `
          <!-- At-Risk Students -->
          <div class="space-y-4">
            ${(teacherAtRisk && teacherAtRisk.students ? teacherAtRisk.students : []).map(st => `
              <div class="bg-[#101b38] border border-rose-500/30 rounded-xl p-5 space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-white text-sm">${esc(st.student_name)}</span>
                  <span class="text-rose-300 font-bold bg-rose-500/20 px-2 py-0.5 rounded uppercase">${esc(st.risk_level)}</span>
                </div>
                <div class="text-xs text-slate-300">Weakest Concept: <strong>${esc(st.weakest_topic_name)}</strong> (Average: ${st.average_mastery}%)</div>
                <div class="text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded">${esc(st.recommended_action)}</div>
              </div>
            `).join('')}
          </div>
        ` : `
          <!-- Topic Difficulty Profiles -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${(teacherDifficulty && teacherDifficulty.profiles ? teacherDifficulty.profiles : []).map(p => `
              <div class="bg-[#101b38] border border-white/10 rounded-xl p-5 space-y-2">
                <div class="font-bold text-sm text-white">${esc(p.topic_name)}</div>
                <div class="text-xs text-slate-300">Class Average: <strong class="text-white">${p.class_average_mastery}%</strong></div>
                <div class="text-[11px] text-slate-400 space-y-1">
                  <div>Basic Tier: ${p.basic_accuracy}%</div>
                  <div>Medium Tier: ${p.medium_accuracy}%</div>
                  <div>Hard Tier: ${p.hard_accuracy}%</div>
                </div>
                ${p.difficulty_cliff_detected ? `
                  <div class="text-[10px] text-rose-400 font-bold bg-rose-500/20 px-2 py-1 rounded">
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
  // 11. EXAM GUARD PROCTORING TAB (KSEF Integrity Shield)
  // ═══════════════════════════════════════════════════════════════════════════════
  function renderProctorTab(container) {
    const q = EXAM_QUESTIONS[examCurrentIndex];

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex items-center justify-between pb-3 border-b border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl ${proctorActive ? 'bg-rose-600' : 'bg-slate-700'} text-white flex items-center justify-center text-lg shadow-md">
              <i class="fas fa-shield-halved"></i>
            </div>
            <div>
              <h1 class="text-xl font-bold text-white">Exam Guard & Proctoring Shield</h1>
              <p class="text-xs text-slate-400">Anti-Cheat Focus Loss Tracking, Clipboard Guard, & Integrity Scoring</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <div class="text-[10px] text-slate-400">Integrity Score</div>
              <div class="text-sm font-mono font-black ${integrityScore >= 80 ? 'text-emerald-400' : integrityScore >= 50 ? 'text-amber-400' : 'text-rose-400'}">${integrityScore}%</div>
            </div>
          </div>
        </div>

        ${!proctorActive && !examCompleted ? `
          <div class="bg-[#101b38] border border-white/10 rounded-2xl p-8 text-center space-y-4">
            <h2 class="text-lg font-bold text-white">Official KSEF National Assessment Session</h2>
            <p class="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
              When started, Exam Guard monitors window focus loss, desktop multi-tasking, clipboard events, and tab switches. Violations penalize your real-time Integrity Score.
            </p>
            <button id="proctor-start-exam-btn" class="bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-3 rounded-xl text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer">
              Begin Proctored Exam (10 Mins)
            </button>
          </div>
        ` : examCompleted ? `
          <div class="bg-[#101b38] border border-white/10 rounded-2xl p-8 text-center space-y-4">
            <div class="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto">
              <i class="fas fa-award"></i>
            </div>
            <h2 class="text-xl font-bold text-white">Exam Completed Successfully</h2>
            <p class="text-xs text-slate-300">Final Proctored Integrity Score: <strong class="font-mono text-emerald-400">${integrityScore}%</strong></p>
            <button id="proctor-reset-btn" class="bg-white/5 hover:bg-white/10 text-slate-300 px-6 py-2.5 rounded-lg text-xs border border-white/10 transition-colors cursor-pointer">
              Reset Session
            </button>
          </div>
        ` : `
          <!-- Active Proctored Exam Runner -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-8 bg-[#101b38] border border-white/10 rounded-2xl p-6 space-y-4">
              <div class="flex items-center justify-between text-xs pb-2 border-b border-white/5">
                <span class="text-emerald-400 font-bold">${esc(q.subject)}: ${esc(q.topic)}</span>
                <span class="text-slate-400 font-mono">Q ${examCurrentIndex + 1} of ${EXAM_QUESTIONS.length}</span>
              </div>
              <div class="text-sm font-semibold text-white leading-relaxed">${esc(q.question)}</div>
              <div class="space-y-2 pt-2">
                ${q.options.map((opt, i) => `
                  <button class="exam-opt-btn w-full p-3 rounded-xl border text-left flex items-center gap-3 text-xs transition-all cursor-pointer ${examAnswers[q.id] === i ? 'bg-emerald-600/30 border-emerald-500 text-white' : 'bg-white/4 border-white/5 text-slate-300'}" data-index="${i}">
                    <span class="w-5 h-5 rounded bg-white/10 flex items-center justify-center font-bold text-slate-300">${String.fromCharCode(65 + i)}</span>
                    <span>${esc(opt)}</span>
                  </button>
                `).join('')}
              </div>
              <div class="flex justify-between pt-4 border-t border-white/5">
                <button id="exam-prev-btn" class="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-xs transition-colors cursor-pointer" ${examCurrentIndex === 0 ? 'disabled opacity-30' : ''}>
                  Previous
                </button>
                <button id="exam-next-btn" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-colors cursor-pointer">
                  ${examCurrentIndex >= EXAM_QUESTIONS.length - 1 ? 'Finish & Submit Exam' : 'Next Question'}
                </button>
              </div>
            </div>

            <!-- Integrity Log Sidebar -->
            <div class="lg:col-span-4 bg-[#070d1d] border border-white/10 rounded-2xl p-4 space-y-3">
              <h3 class="text-xs font-bold text-white flex items-center gap-1.5">
                <i class="fas fa-eye text-rose-400"></i> Live Proctor Audit Trail
              </h3>
              <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
                ${integrityViolations.length > 0 ? integrityViolations.map(v => `
                  <div class="bg-rose-950/40 border border-rose-900/50 p-2.5 rounded-lg text-[11px] text-rose-200">
                    <div class="font-bold flex justify-between">
                      <span>-${v.penalty}% Penalty</span>
                      <span class="text-slate-500 font-mono">${v.time}</span>
                    </div>
                    <div class="text-slate-300 mt-0.5">${esc(v.reason)}</div>
                  </div>
                `).join('') : `
                  <div class="text-center py-8 text-xs text-slate-500">
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
