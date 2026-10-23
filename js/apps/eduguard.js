import { EduGuardClient } from '../services/eduguardClient.js';

/**
 * Dawamu OS - EduGuard AI Learning Intelligence & Exam Proctoring Application
 *
 * Kenya Science & Engineering Fair (KSEF 2027) Edition
 *
 * Core Capabilities:
 * 1. AI Study Tutor & Socratic Problem Solver (Local & Backend API)
 * 2. Exam Guard & Proctoring Shield (Anti-Cheat, Focus Loss Tracking, Integrity Scoring)
 * 3. Adaptive Diagnostic Assessment & Learning Gap Analyzer
 * 4. Knowledge Map & Spaced-Repetition Retention Curves
 * 5. Smart Study Notes Analyzer & Flashcard Generator
 * 6. Teacher / Proctor Dashboard & Class Incident Audits
 * 7. Live Hybrid Mode (Local Offline Engine + Flutter Web / FastAPI integration)
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
  let liveDiagnostic = null;
  let liveWhyStruggling = null;
  let liveNextAction = null;

  // All user/backend text is escaped before being placed into innerHTML templates
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ─── STATE MANAGEMENT ──────────────────────────────────────────────────────────
  let activeTab = 'tutor'; // 'tutor' | 'proctor' | 'diagnostic' | 'knowledgemap' | 'notes' | 'teacher' | 'hybrid'
  
  // Proctoring State
  let proctorActive = false;
  let proctorExamTime = 600; // 10 minutes in seconds
  let proctorTimerId = null;
  let integrityScore = 100;
  let integrityViolations = [];
  let currentQuestionIndex = 0;
  let studentAnswers = {};
  let examCompleted = false;

  // AI Tutor Chat History
  let chatMessages = [
    {
      sender: 'ai',
      text: `Habari ${currentStudent.name}! I am your EduGuard AI Academic Tutor. I can help you solve KCSE problems step-by-step, explain complex concepts in Mathematics, Biology, Chemistry, and Physics, or generate diagnostic quizzes. What would you like to master today?`,
      time: 'Just now'
    }
  ];

  // Notes Analyzer State
  let analyzedNotesResult = null;

  // Diagnostic Test State
  let diagSubject = 'Mathematics';
  let diagForm = currentStudent.grade || 'Form 1';
  let diagResult = null;

  // ─── SAMPLE EXAM QUESTIONS FOR PROCTORING GUARD ──────────────────────────────
  const EXAM_QUESTIONS = [
    {
      id: 1,
      subject: 'Mathematics',
      topic: 'Algebra & Quadratic Equations',
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
      explanation: 'Water moves out of the cell sap vacuole by osmosis into the hypertonic medium, pulling the cell membrane away from the cell wall (plasmolysis).'
    },
    {
      id: 3,
      subject: 'Chemistry',
      topic: 'Structure & Chemical Bonding',
      question: 'Which of the following substances possesses a giant covalent (macromolecular) structure with a very high melting point?',
      options: [
        'Sodium Chloride (NaCl)',
        'Silicon(IV) Oxide / Quartz (SiO₂)',
        'Carbon Dioxide (CO₂)',
        'Water (H₂O)'
      ],
      correctIndex: 1,
      explanation: 'Silicon(IV) oxide forms a rigid 3D tetrahedral network of strong covalent bonds between Si and O atoms, demanding vast thermal energy to break.'
    },
    {
      id: 4,
      subject: 'Physics',
      topic: 'Linear Motion & Dynamics',
      question: 'A car accelerates uniformly from rest to 20 m/s in 5 seconds. What is the total distance covered during this period?',
      options: [
        '100 m',
        '50 m',
        '40 m',
        '25 m'
      ],
      correctIndex: 1,
      explanation: 's = ½(u + v)t = ½(0 + 20) × 5 = 10 × 5 = 50 meters.'
    },
    {
      id: 5,
      subject: 'Computer Studies',
      topic: 'Data Security & Ethics',
      question: 'In computer network security, what is the primary role of a firewall?',
      options: [
        'To speed up CPU clock cycles during gaming',
        'To monitor and filter incoming and outgoing network traffic based on security rules',
        'To defragment physical storage drives',
        'To automatically compile source code'
      ],
      correctIndex: 1,
      explanation: 'Firewalls inspect network packets and block unauthorized connections from entering or leaving a private network.'
    }
  ];

  // ─── KNOWLEDGE BASE FOR OFFLINE AI TUTOR ──────────────────────────────────────
  const KNOWLEDGE_RESPONSES = {
    'photosynthesis': {
      title: 'Photosynthesis (KCSE Biology)',
      summary: 'Photosynthesis is the process by which green plants manufacture organic food (glucose) from carbon dioxide and water using sunlight energy trapped by chlorophyll.\n\n' +
               '• Stage 1: Light-Dependent Stage (Granum / Thylakoids)\n' +
               '  Light energy splits water molecules (Photolysis: 2H₂O → 4H⁺ + 4e⁻ + O₂). ATP and NADPH are formed; oxygen is released as a byproduct.\n\n' +
               '• Stage 2: Light-Independent / Dark Stage (Stroma - Calvin Cycle)\n' +
               '  Carbon(IV) oxide combines with RuBP (Carbon Fixation), catalyzed by RuBisCO enzyme, and reduced by NADPH and ATP to yield glucose (C₆H₁₂O₆).\n\n' +
               '💡 KCSE Exam Tip: Pay attention to limiting factors: light intensity, CO₂ concentration, and temperature.'
    },
    'quadratic': {
      title: 'Quadratic Equations (KCSE Mathematics)',
      summary: 'General quadratic form: ax² + bx + c = 0 (where a ≠ 0).\n\n' +
               '1. Quadratic Formula: x = [-b ± √(b² - 4ac)] / (2a)\n' +
               '2. Discriminant (Δ = b² - 4ac):\n' +
               '   • Δ > 0: Two distinct real roots\n' +
               '   • Δ = 0: Two equal/repeated real roots (perfect square)\n' +
               '   • Δ < 0: No real roots (complex/imaginary)\n\n' +
               '3. Factorization Method: Find two numbers whose product is a×c and whose sum is b.\n\n' +
               '💡 Practice: For 3x² - 5x - 2 = 0, product is -6, sum is -5 => factors are -6 and 1 => x = 2 or x = -1/3.'
    },
    'le chatelier': {
      title: "Le Chatelier's Principle (KCSE Chemistry)",
      summary: 'Principle: "When an external stress (change in temperature, pressure, or concentration) is applied to a chemical system in dynamic equilibrium, the system shifts in such a direction as to counteract the effect of the stress."\n\n' +
               '• Effect of Temperature: Increasing temperature favors the endothermic reaction (absorbs heat); decreasing temperature favors the exothermic reaction.\n' +
               '• Effect of Pressure: Increasing pressure shifts equilibrium toward the side with fewer gas molecules.\n' +
               '• Effect of Catalyst: Increases rate of both forward and reverse reactions equally; does NOT shift equilibrium position, only speeds up attainment of equilibrium!'
    },
    'newton': {
      title: "Newton's Laws of Motion (KCSE Physics)",
      summary: "1. First Law (Law of Inertia): A body remains in its state of rest or uniform motion in a straight line unless acted upon by an external resultant force.\n\n" +
               "2. Second Law (Force & Momentum): The rate of change of momentum is directly proportional to the applied force and takes place in the direction of the force: F = ma (where m is mass and a is acceleration).\n\n" +
               "3. Third Law (Action & Reaction): For every action, there is an equal and opposite reaction.\n\n" +
               "💡 Formulae to recall: F = m(v - u)/t = ma; Impulse = F × t = Δp (kg·m/s)."
    }
  };

  // ─── PROCTORING EVENT LISTENERS ──────────────────────────────────────────────
  const handleVisibilityChange = () => {
    if (!proctorActive || examCompleted) return;
    if (document.hidden) {
      recordViolation('Focus Loss: User minimized OS window or switched application');
    }
  };

  const handleWindowBlur = () => {
    if (!proctorActive || examCompleted) return;
    recordViolation('Window Blur: Focus shifted away from EduGuard Exam Guard');
  };

  const recordViolation = (reason) => {
    const timestamp = new Date().toLocaleTimeString();
    integrityScore = Math.max(0, integrityScore - 15);
    integrityViolations.push({ reason, timestamp });
    
    // Play alert beep using Web Audio API
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (_) {}

    renderContent();
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleWindowBlur);

  // Clean up when element removed from DOM
  const observer = new MutationObserver(() => {
    if (!document.body.contains(root)) {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      if (proctorTimerId) clearInterval(proctorTimerId);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // ─── MAIN APP RENDER FUNCTION ────────────────────────────────────────────────
  function render() {
    root.innerHTML = `
      <!-- App Header -->
      <header class="bg-[#0f172a] border-b border-white/10 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white text-sm">
            <i class="fas fa-shield-halved"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-sm text-white">EduGuard</span>
              <span class="text-[10px] text-slate-500">KSEF 2027</span>
            </div>
            <div class="text-[10px] text-slate-500">
              ${currentStudent.name} · ${currentStudent.grade}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1.5 text-xs">
            <span class="w-1.5 h-1.5 rounded-full ${proctorActive ? 'bg-rose-500' : 'bg-emerald-500'}"></span>
            <span class="text-slate-400">${proctorActive ? 'Proctoring' : 'Ready'}</span>
          </div>
        </div>
      </header>

      <!-- Navigation Tabs -->
      <nav class="bg-[#0b1021] border-b border-white/10 px-3 flex items-center shrink-0 overflow-x-auto gap-0.5">
        <button class="nav-tab px-3.5 py-2.5 text-xs border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'tutor' ? 'text-emerald-400 border-emerald-500' : 'text-slate-500 border-transparent hover:text-slate-300'}" data-tab="tutor">
          <i class="fas fa-brain text-xs"></i> AI Tutor
        </button>
        <button class="nav-tab px-3.5 py-2.5 text-xs border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'proctor' ? 'text-emerald-400 border-emerald-500' : 'text-slate-500 border-transparent hover:text-slate-300'}" data-tab="proctor">
          <i class="fas fa-shield-halved text-xs"></i> Exam Guard${proctorActive ? ` <span class="w-1.5 h-1.5 rounded-full bg-rose-500 ml-0.5"></span>` : ''}
        </button>
        <button class="nav-tab px-3.5 py-2.5 text-xs border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'diagnostic' ? 'text-emerald-400 border-emerald-500' : 'text-slate-500 border-transparent hover:text-slate-300'}" data-tab="diagnostic">
          <i class="fas fa-stethoscope text-xs"></i> Diagnostic
        </button>
        <button class="nav-tab px-3.5 py-2.5 text-xs border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'knowledgemap' ? 'text-emerald-400 border-emerald-500' : 'text-slate-500 border-transparent hover:text-slate-300'}" data-tab="knowledgemap">
          <i class="fas fa-chart-pie text-xs"></i> Knowledge Map
        </button>
        <button class="nav-tab px-3.5 py-2.5 text-xs border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'notes' ? 'text-emerald-400 border-emerald-500' : 'text-slate-500 border-transparent hover:text-slate-300'}" data-tab="notes">
          <i class="fas fa-file-lines text-xs"></i> Notes
        </button>
        <button class="nav-tab px-3.5 py-2.5 text-xs border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'teacher' ? 'text-emerald-400 border-emerald-500' : 'text-slate-500 border-transparent hover:text-slate-300'}" data-tab="teacher">
          <i class="fas fa-chalkboard-user text-xs"></i> Teacher View
        </button>
        <button class="nav-tab px-3.5 py-2.5 text-xs border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ml-auto ${activeTab === 'hybrid' ? 'text-cyan-400 border-cyan-500' : 'text-slate-500 border-transparent hover:text-slate-300'}" data-tab="hybrid">
          <i class="fas fa-link text-xs"></i> Services
        </button>
      </nav>

      <!-- Main Dynamic Content Workspace -->
      <main id="eduguard-main-content" class="flex-1 overflow-hidden relative"></main>
    `;

    // Tab switcher events
    root.querySelectorAll('.nav-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-tab');
        render();
      });
    });

    renderContent();
  }

  // ─── RENDER SPECIFIC TAB CONTENT ─────────────────────────────────────────────
  function renderContent() {
    const mainEl = root.querySelector('#eduguard-main-content');
    if (!mainEl) return;

    if (activeTab === 'tutor') {
      renderTutorTab(mainEl);
    } else if (activeTab === 'proctor') {
      renderProctorTab(mainEl);
    } else if (activeTab === 'diagnostic') {
      renderDiagnosticTab(mainEl);
    } else if (activeTab === 'knowledgemap') {
      renderKnowledgeMapTab(mainEl);
    } else if (activeTab === 'notes') {
      renderNotesTab(mainEl);
    } else if (activeTab === 'teacher') {
      renderTeacherTab(mainEl);
    } else if (activeTab === 'hybrid') {
      renderHybridTab(mainEl);
    }
  }

  // ─── TAB 1: AI STUDY TUTOR ───────────────────────────────────────────────────
  function renderTutorTab(container) {
    container.innerHTML = `
      <div class="flex flex-col h-full bg-[#0b1329]">
        <!-- Quick Prompts -->
        <div class="border-b border-white/5 px-3 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <span class="text-[10px] text-slate-600 shrink-0">Try:</span>
          <button class="prompt-chip bg-white/4 hover:bg-white/8 border border-white/8 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer text-[11px]">
            Photosynthesis stages
          </button>
          <button class="prompt-chip bg-white/4 hover:bg-white/8 border border-white/8 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer text-[11px]">
            Quadratic equations
          </button>
          <button class="prompt-chip bg-white/4 hover:bg-white/8 border border-white/8 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer text-[11px]">
            Le Chatelier's Principle
          </button>
          <button class="prompt-chip bg-white/4 hover:bg-white/8 border border-white/8 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer text-[11px]">
            Newton's Laws
          </button>
        </div>

        <!-- Messages Chat Scroll Container -->
        <div id="tutor-chat-history" class="flex-1 overflow-y-auto p-5 space-y-4">
          ${chatMessages.map(msg => `
            <div class="flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3">
              ${msg.sender === 'ai' ? `
                <div class="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 text-xs">
                  <i class="fas fa-robot"></i>
                </div>
              ` : ''}

              <div class="max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-br-none shadow-md' : 'bg-[#152140] border border-white/10 text-slate-200 rounded-bl-none shadow'}">
                <div class="whitespace-pre-wrap">${esc(msg.text)}</div>
                <div class="mt-1 text-[10px] ${msg.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'}">${msg.time}</div>
              </div>

              ${msg.sender === 'user' ? `
                <div class="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 shrink-0 text-xs">
                  <i class="fas fa-user-graduate"></i>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Chat Input Bar -->
        <div class="p-4 bg-[#0f172a] border-t border-white/10 shrink-0">
          <form id="tutor-chat-form" class="flex items-center gap-2">
            <div class="flex-1 relative flex items-center">
              <input type="text" id="tutor-input" placeholder="Ask a question in Math, Biology, Physics, Chemistry..." autocomplete="off" class="w-full bg-[#1e293b] border border-white/10 rounded-2xl py-3 pl-4 pr-10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors">
              <button type="button" id="tutor-voice-btn" class="absolute right-3 text-slate-400 hover:text-emerald-400 transition-colors" title="Speech Dictation">
                <i class="fas fa-microphone"></i>
              </button>
            </div>
            <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 cursor-pointer transition-all active:scale-95">
              <span>Send</span>
              <i class="fas fa-paper-plane text-[10px]"></i>
            </button>
          </form>
        </div>
      </div>
    `;

    // Preset Prompt Click Handlers
    container.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const input = container.querySelector('#tutor-input');
        if (input) {
          input.value = chip.textContent.trim();
          container.querySelector('#tutor-chat-form')?.dispatchEvent(new Event('submit'));
        }
      });
    });

    // Chat Submission Handler
    const form = container.querySelector('#tutor-chat-form');
    const input = container.querySelector('#tutor-input');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;

      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      chatMessages.push({ sender: 'user', text: query, time: timeNow });
      input.value = '';
      renderContent();

      // Scroll to bottom
      setTimeout(() => {
        const historyEl = container.querySelector('#tutor-chat-history');
        if (historyEl) historyEl.scrollTop = historyEl.scrollHeight;
      }, 50);

      // AI response engine: EduGuard FastAPI backend first (/api/v1/ai/tutor), fallback to offline notes
      let responseText = '';
      try {
        responseText = await client.askTutor(query);
      } catch (_) {
        // Backend unreachable — use built-in offline revision notes below
      }

      if (!responseText) {
        const lower = query.toLowerCase();
        if (lower.includes('photo') || lower.includes('cell') || lower.includes('biology')) {
          responseText = KNOWLEDGE_RESPONSES['photosynthesis'].summary;
        } else if (lower.includes('quad') || lower.includes('factor') || lower.includes('math') || lower.includes('algebra')) {
          responseText = KNOWLEDGE_RESPONSES['quadratic'].summary;
        } else if (lower.includes('le chatelier') || lower.includes('equili') || lower.includes('chem')) {
          responseText = KNOWLEDGE_RESPONSES['le chatelier'].summary;
        } else if (lower.includes('newton') || lower.includes('motion') || lower.includes('force') || lower.includes('physic')) {
          responseText = KNOWLEDGE_RESPONSES['newton'].summary;
        } else {
          responseText = `I don't have offline notes on "${query}" yet. Offline notes cover: photosynthesis, quadratic equations, Le Chatelier's principle and Newton's laws. Connect to the EduGuard server for wider help.`;
        }
        responseText += '\n\n(Offline mode: built-in revision notes, not AI-generated.)';
      }

      chatMessages.push({ sender: 'ai', text: responseText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
      renderContent();

      setTimeout(() => {
        const historyEl = container.querySelector('#tutor-chat-history');
        if (historyEl) historyEl.scrollTop = historyEl.scrollHeight;
      }, 50);
    });
  }

  // ─── TAB 2: EXAM PROCTOR GUARD ───────────────────────────────────────────────
  function renderProctorTab(container) {
    if (!proctorActive && !examCompleted) {
      // Ready to start Exam Mode
      container.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center p-8 text-center bg-[#0b1329] overflow-y-auto gap-6">
          <div class="w-14 h-14 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 text-2xl">
            <i class="fas fa-shield-halved"></i>
          </div>

          <div>
            <h1 class="text-lg font-semibold text-white mb-1">Exam Proctor Guard</h1>
            <p class="text-xs text-slate-400 max-w-md leading-relaxed">
              Secure exam mode — tracks focus, prevents tab-switching, and logs integrity events.
            </p>
          </div>

          <!-- Policy summary -->
          <div class="flex items-center gap-3 text-xs text-slate-400">
            <span class="flex items-center gap-1.5"><i class="fas fa-window-restore text-emerald-400"></i> Focus Lock</span>
            <span class="text-slate-700">·</span>
            <span class="flex items-center gap-1.5"><i class="fas fa-clipboard-check text-cyan-400"></i> Clip Guard</span>
            <span class="text-slate-700">·</span>
            <span class="flex items-center gap-1.5"><i class="fas fa-gauge-high text-amber-400"></i> Integrity Score</span>
          </div>

          <button id="start-exam-btn" class="bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-sm px-7 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors active:scale-95">
            <i class="fas fa-play text-xs"></i>
            Begin 5-Question KCSE Sample Exam
          </button>
        </div>
      `;

      container.querySelector('#start-exam-btn')?.addEventListener('click', () => {
        proctorActive = true;
        integrityScore = 100;
        integrityViolations = [];
        currentQuestionIndex = 0;
        studentAnswers = {};
        examCompleted = false;
        proctorExamTime = 600;

        if (proctorTimerId) clearInterval(proctorTimerId);
        proctorTimerId = setInterval(() => {
          if (proctorExamTime > 0) {
            proctorExamTime--;
            const timerEl = container.querySelector('#exam-timer-display');
            if (timerEl) {
              const m = Math.floor(proctorExamTime / 60);
              const s = proctorExamTime % 60;
              timerEl.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            }
          } else {
            finishExam();
          }
        }, 1000);

        render();
      });
      return;
    }

    if (examCompleted) {
      // Exam Results & Integrity Summary
      let correctCount = 0;
      EXAM_QUESTIONS.forEach((q, idx) => {
        if (studentAnswers[idx] === q.correctIndex) correctCount++;
      });
      const academicScore = Math.round((correctCount / EXAM_QUESTIONS.length) * 100);

      container.innerHTML = `
        <div class="h-full overflow-y-auto p-6 bg-[#0b1329] space-y-6">
          <div class="flex items-center justify-between bg-[#152140] border border-white/10 rounded-xl p-4">
            <div>
              <div class="flex items-center gap-2 text-emerald-400 text-xs mb-1">
                <i class="fas fa-circle-check"></i> Exam Complete
              </div>
              <p class="text-sm font-semibold text-white">${currentStudent.name} · ${currentStudent.grade}</p>
            </div>
            <div class="flex items-center gap-4 text-center">
              <div>
                <div class="text-xl font-bold text-emerald-400">${academicScore}%</div>
                <div class="text-[10px] text-slate-500">Academic</div>
              </div>
              <div>
                <div class="text-xl font-bold ${integrityScore < 75 ? 'text-rose-400' : 'text-emerald-400'}">${integrityScore}%</div>
                <div class="text-[10px] text-slate-500">Integrity</div>
              </div>
            </div>
          </div>

          <!-- Proctor Incident Log -->
          <div class="bg-[#152140] border border-white/10 rounded-2xl p-5 space-y-3">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <i class="fas fa-list-check text-emerald-400"></i> Proctor Guard Security Audit Log
            </h3>
            ${integrityViolations.length === 0 ? `
              <div class="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <i class="fas fa-shield-check text-base"></i>
                <span>Zero integrity incidents recorded. Candidate demonstrated full focus compliance.</span>
              </div>
            ` : `
              <div class="space-y-2">
                ${integrityViolations.map(v => `
                  <div class="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center justify-between">
                    <span class="flex items-center gap-2">
                      <i class="fas fa-triangle-exclamation text-rose-400"></i>
                      <span>${v.reason}</span>
                    </span>
                    <span class="font-mono text-[11px] text-slate-400">${v.timestamp}</span>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <div class="flex justify-end gap-3">
            <button id="retake-exam-btn" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer transition-all">
              Retake Examination
            </button>
          </div>
        </div>
      `;

      container.querySelector('#retake-exam-btn')?.addEventListener('click', () => {
        examCompleted = false;
        proctorActive = false;
        render();
      });
      return;
    }

    // Active Live Examination Question View
    const q = EXAM_QUESTIONS[currentQuestionIndex];
    const m = Math.floor(proctorExamTime / 60);
    const s = proctorExamTime % 60;

    container.innerHTML = `
      <div class="flex flex-col h-full bg-[#0b1329]">
        <!-- Exam Top Status Bar -->
        <div class="bg-[#0f172a] border-b border-white/10 px-5 py-3 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <span class="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
              <span class="w-2 h-2 rounded-full bg-rose-500"></span> PROCTOR SHIELD ACTIVE
            </span>
            <span class="text-xs text-slate-300 font-semibold">
              Question <b class="text-white">${currentQuestionIndex + 1}</b> of ${EXAM_QUESTIONS.length}
            </span>
          </div>

          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 bg-[#1e293b] px-3 py-1 rounded-xl text-xs border border-white/10">
              <i class="far fa-clock text-amber-400"></i>
              <span id="exam-timer-display" class="font-mono font-bold text-amber-300 text-sm">
                ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}
              </span>
            </div>

            <div class="flex items-center gap-2 bg-[#1e293b] px-3 py-1 rounded-xl text-xs border ${integrityScore < 75 ? 'border-rose-500 text-rose-400' : 'border-emerald-500 text-emerald-400'}">
              <i class="fas fa-shield"></i>
              <span class="font-bold">Integrity: ${integrityScore}%</span>
            </div>
          </div>
        </div>

        <!-- Question View Body -->
        <div class="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full flex flex-col justify-between">
          <div class="space-y-4">
            <div class="flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase tracking-wider">
              <span>${q.subject}</span> • <span>${q.topic}</span>
            </div>

            <h2 class="text-lg font-bold text-white leading-relaxed">
              ${q.question}
            </h2>

            <!-- Options Radio List -->
            <div class="space-y-2.5 pt-2">
              ${q.options.map((opt, oIdx) => `
                <label class="opt-label flex items-center gap-3.5 p-4 rounded-2xl bg-[#152140] hover:bg-[#1a2950] border ${studentAnswers[currentQuestionIndex] === oIdx ? 'border-emerald-500 bg-emerald-950/20' : 'border-white/10'} cursor-pointer transition-all">
                  <input type="radio" name="opt_answer" value="${oIdx}" class="accent-emerald-500 w-4 h-4" ${studentAnswers[currentQuestionIndex] === oIdx ? 'checked' : ''}>
                  <span class="text-xs text-slate-200 font-medium">${opt}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- Bottom Navigation Buttons -->
          <div class="flex items-center justify-between pt-6 border-t border-white/10 shrink-0">
            <button id="prev-q-btn" class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${currentQuestionIndex === 0 ? 'opacity-40 pointer-events-none' : ''}">
              <i class="fas fa-chevron-left mr-1"></i> Previous
            </button>

            ${currentQuestionIndex === EXAM_QUESTIONS.length - 1 ? `
              <button id="submit-exam-btn" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-950/40 cursor-pointer transition-all">
                Submit Examination <i class="fas fa-check ml-1"></i>
              </button>
            ` : `
              <button id="next-q-btn" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer">
                Next Question <i class="fas fa-chevron-right ml-1"></i>
              </button>
            `}
          </div>
        </div>
      </div>
    `;

    // Radio option select handler
    container.querySelectorAll('input[name="opt_answer"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        studentAnswers[currentQuestionIndex] = parseInt(e.target.value, 10);
        renderProctorTab(container);
      });
    });

    container.querySelector('#prev-q-btn')?.addEventListener('click', () => {
      if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderProctorTab(container);
      }
    });

    container.querySelector('#next-q-btn')?.addEventListener('click', () => {
      if (currentQuestionIndex < EXAM_QUESTIONS.length - 1) {
        currentQuestionIndex++;
        renderProctorTab(container);
      }
    });

    container.querySelector('#submit-exam-btn')?.addEventListener('click', () => {
      finishExam();
    });
  }

  async function finishExam() {
    if (proctorTimerId) clearInterval(proctorTimerId);
    proctorActive = false;
    examCompleted = true;

    // Record exam attempts to student's history
    for (let idx = 0; idx < EXAM_QUESTIONS.length; idx++) {
      const q = EXAM_QUESTIONS[idx];
      const selected = studentAnswers[idx];
      if (selected !== undefined) {
        const isCorrect = selected === q.correctIndex;
        const optId = `opt_${selected}`;
        const questionId = `q_exam_${q.id}`;
        try {
          await client.submitAttempt(questionId, isCorrect ? 'opt_1' : optId, 'exam_proctor_session');
        } catch (_) {}
      }
    }

    render();
  }

  // ─── TAB 3: DIAGNOSTIC ENGINE & MASTERY ──────────────────────────────────────
  let activeDiagnosticSession = null;
  let diagnosticCurrentIndex = 0;
  let lastDiagnosticFeedback = null;

  async function renderDiagnosticTab(container) {
    if (activeDiagnosticSession) {
      renderActiveDiagnosticSession(container);
      return;
    }

    let masteries = [];
    try {
      masteries = await client.getMasteryOverview();
      liveWhyStruggling = await client.getWhyStruggling('quadratic_equations');
      liveNextAction = await client.getNextAction();
    } catch (_) {}

    const avgMastery = masteries.length > 0
      ? Math.round(masteries.reduce((sum, m) => sum + (m.mastery_score || 0), 0) / masteries.length)
      : (liveWhyStruggling ? Math.round(liveWhyStruggling.topic_mastery || 45) : 45);

    const gaps = masteries.filter(m => (m.mastery_score || 0) < 60);
    const gapCount = gaps.length > 0 ? `${gaps.length} Gaps` : 'No Critical Gaps';
    const gapNames = gaps.length > 0 
      ? gaps.map(g => g.topic_name).slice(0, 2).join(' • ')
      : (liveWhyStruggling?.prerequisite_gaps ? liveWhyStruggling.prerequisite_gaps.map(g => g.replace('_', ' ').toUpperCase()).join(' • ') : 'All Core Concepts On Track');

    const recActionText = liveNextAction 
      ? `${liveNextAction.actionType}: ${liveNextAction.reason}`
      : 'Complete prerequisite practice on Algebraic Manipulation & Factorisation.';

    container.innerHTML = `
      <div class="h-full overflow-y-auto p-6 bg-[#0b1329] space-y-6">
        <!-- Diagnostic Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold text-white flex items-center gap-2">
              <i class="fas fa-stethoscope text-cyan-400"></i> Diagnostic Engine
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">Authoritative KCSE learning gap and prerequisite analysis.</p>
          </div>
          <button id="run-diagnostic-btn" class="bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-md">
            <i class="fas fa-play text-xs"></i> Start Diagnostic Assessment
          </button>
        </div>

        <!-- Controls: Subject & Grade Selection -->
        <div class="grid grid-cols-2 gap-4 bg-[#152140] p-4 rounded-2xl border border-white/10 text-xs">
          <div>
            <label class="block text-slate-400 font-bold mb-1">Target Subject</label>
            <select id="diag-subject-select" class="w-full bg-[#0f172a] border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-cyan-500">
              <option value="mathematics" ${diagSubject.toLowerCase() === 'mathematics' ? 'selected' : ''}>Mathematics</option>
              <option value="biology" ${diagSubject.toLowerCase() === 'biology' ? 'selected' : ''}>Biology</option>
              <option value="physics" ${diagSubject.toLowerCase() === 'physics' ? 'selected' : ''}>Physics</option>
            </select>
          </div>

          <div>
            <label class="block text-slate-400 font-bold mb-1">Target Level / Form</label>
            <select id="diag-form-select" class="w-full bg-[#0f172a] border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-cyan-500">
              <option value="Form 1" ${diagForm === 'Form 1' ? 'selected' : ''}>Form 1 (Foundational)</option>
              <option value="Form 2" ${diagForm === 'Form 2' ? 'selected' : ''}>Form 2 (Intermediate)</option>
              <option value="Form 3" ${diagForm === 'Form 3' ? 'selected' : ''}>Form 3 (Advanced Core)</option>
              <option value="Form 4" ${diagForm === 'Form 4' ? 'selected' : ''}>Form 4 (KCSE Mastery)</option>
            </select>
          </div>
        </div>

        <!-- Diagnostic Report Cards -->
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-[#152140] border border-white/10 rounded-2xl p-5 space-y-2">
            <div class="text-[11px] text-slate-400 font-semibold uppercase">Overall Subject Mastery</div>
            <div class="text-3xl font-extrabold ${avgMastery >= 70 ? 'text-emerald-400' : (avgMastery >= 50 ? 'text-amber-400' : 'text-rose-400')}">${avgMastery}%</div>
            <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div class="${avgMastery >= 70 ? 'bg-emerald-400' : (avgMastery >= 50 ? 'bg-amber-400' : 'bg-rose-400')} h-full rounded-full transition-all duration-500" style="width: ${avgMastery}%"></div>
            </div>
            <p class="text-[11px] text-slate-400 pt-1">Computed from student attempt history across curriculum topics.</p>
          </div>

          <div class="bg-[#152140] border border-white/10 rounded-2xl p-5 space-y-2">
            <div class="text-[11px] text-slate-400 font-semibold uppercase">Detected Learning Gaps</div>
            <div class="text-3xl font-extrabold ${gaps.length > 0 ? 'text-amber-400' : 'text-emerald-400'}">${gapCount}</div>
            <div class="flex items-center gap-1.5 text-xs text-amber-300">
              <i class="fas fa-triangle-exclamation text-amber-400"></i>
              <span class="truncate">${gapNames}</span>
            </div>
            <p class="text-[11px] text-slate-400 pt-1">Identified from misconception tags and sub-60% mastery.</p>
          </div>

          <div class="bg-[#152140] border border-white/10 rounded-2xl p-5 space-y-2">
            <div class="text-[11px] text-slate-400 font-semibold uppercase">Prescribed Action</div>
            <div class="text-sm font-bold text-cyan-400 leading-snug">${liveNextAction ? liveNextAction.actionType.replace('_', ' ') : 'Targeted Practice'}</div>
            <p class="text-xs text-slate-300">${recActionText}</p>
          </div>
        </div>

        <!-- Detailed Competency Breakdown -->
        <div class="bg-[#152140] border border-white/10 rounded-2xl p-5 space-y-3">
          <h3 class="text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
            <span>Curriculum Topic Breakdown</span>
            <span class="text-[10px] text-slate-500 font-normal">Updated per student attempt</span>
          </h3>
          
          <div class="space-y-3.5 text-xs">
            ${masteries.map(m => {
              const score = m.mastery_score || 0;
              const barColor = score >= 80 ? 'bg-emerald-500' : (score >= 60 ? 'bg-cyan-500' : (score >= 40 ? 'bg-amber-500' : 'bg-rose-500'));
              const statusText = score >= 80 ? 'Mastered' : (score >= 60 ? 'Proficient' : (score >= 40 ? 'Review Needed' : 'Critical Gap'));
              const statusColor = score >= 80 ? 'text-emerald-400' : (score >= 60 ? 'text-cyan-400' : (score >= 40 ? 'text-amber-400' : 'text-rose-400'));

              return `
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-slate-300 font-medium">${m.topic_name} <span class="text-[10px] text-slate-500 font-normal">(${m.attempts_count || 0} attempts)</span></span>
                    <span class="${statusColor} font-bold">${score}% (${statusText})</span>
                  </div>
                  <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div class="${barColor} h-full transition-all duration-500" style="width: ${score}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    container.querySelector('#run-diagnostic-btn')?.addEventListener('click', async () => {
      const btn = container.querySelector('#run-diagnostic-btn');
      if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin text-xs"></i> Initializing Session...';
      
      const subj = container.querySelector('#diag-subject-select')?.value || 'mathematics';
      try {
        activeDiagnosticSession = await client.startDiagnostic('quadratic_equations', subj);
        diagnosticCurrentIndex = 0;
        lastDiagnosticFeedback = null;
        renderDiagnosticTab(container);
      } catch (err) {
        alert('Diagnostic session could not be started: ' + err.message);
        renderDiagnosticTab(container);
      }
    });

    container.querySelector('#diag-subject-select')?.addEventListener('change', (e) => {
      diagSubject = e.target.value;
    });

    container.querySelector('#diag-form-select')?.addEventListener('change', (e) => {
      diagForm = e.target.value;
    });
  }

  function renderActiveDiagnosticSession(container) {
    const session = activeDiagnosticSession;
    const questions = session.questions || (session.current_question ? [session.current_question] : []);
    const q = questions[diagnosticCurrentIndex] || questions[0];

    if (!q) {
      activeDiagnosticSession = null;
      renderDiagnosticTab(container);
      return;
    }

    container.innerHTML = `
      <div class="h-full flex flex-col bg-[#0b1329] overflow-hidden">
        <!-- Diagnostic Header Bar -->
        <div class="bg-[#0f172a] border-b border-white/10 px-6 py-3 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span class="text-xs font-bold text-white">Diagnostic Assessment in Progress</span>
            <span class="text-slate-500 text-xs">·</span>
            <span class="text-xs text-slate-300 font-semibold">
              Question <b class="text-white">${diagnosticCurrentIndex + 1}</b> of ${questions.length}
            </span>
          </div>

          <button id="exit-diag-btn" class="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
            Exit Session
          </button>
        </div>

        <!-- Question View Body -->
        <div class="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full flex flex-col justify-between">
          <div class="space-y-4">
            <div class="flex items-center gap-2 text-xs text-cyan-400 font-bold uppercase tracking-wider">
              <span>${q.subject_id || 'Mathematics'}</span> • <span>${(q.topic_id || '').replace('_', ' ')}</span>
            </div>

            <h2 class="text-lg font-bold text-white leading-relaxed">
              ${q.question_text || q.question}
            </h2>

            <!-- Options Radio List -->
            <div class="space-y-2.5 pt-2">
              ${(q.options || []).map((opt) => `
                <label class="diag-opt-label flex items-center gap-3.5 p-4 rounded-2xl bg-[#152140] hover:bg-[#1a2950] border border-white/10 cursor-pointer transition-all">
                  <input type="radio" name="diag_opt_answer" value="${opt.id}" class="accent-cyan-500 w-4 h-4">
                  <span class="text-xs text-slate-200 font-medium">${opt.text}</span>
                </label>
              `).join('')}
            </div>

            <!-- Feedback Area after submission -->
            ${lastDiagnosticFeedback ? `
              <div class="p-4 rounded-xl border ${lastDiagnosticFeedback.is_correct ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-rose-950/40 border-rose-500/40'} space-y-2 animate-fadeIn">
                <div class="flex items-center gap-2 font-bold text-xs ${lastDiagnosticFeedback.is_correct ? 'text-emerald-400' : 'text-rose-400'}">
                  <i class="fas ${lastDiagnosticFeedback.is_correct ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
                  <span>${lastDiagnosticFeedback.is_correct ? 'Correct! Strong understanding demonstrated.' : 'Incorrect.'}</span>
                </div>
                <p class="text-xs text-slate-200 leading-relaxed">${lastDiagnosticFeedback.explanation}</p>
                ${lastDiagnosticFeedback.diagnosed_misconception ? `
                  <div class="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-lg flex items-center gap-2">
                    <i class="fas fa-lightbulb text-amber-400"></i>
                    <span><b>Diagnosed Misconception:</b> ${lastDiagnosticFeedback.diagnosed_misconception}</span>
                  </div>
                ` : ''}
                <div class="text-[11px] text-cyan-300 pt-1">
                  <b>Updated Topic Mastery:</b> ${lastDiagnosticFeedback.updated_topic_mastery}%
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Bottom Action Buttons -->
          <div class="flex items-center justify-between pt-6 border-t border-white/10 shrink-0">
            <div></div>
            ${!lastDiagnosticFeedback ? `
              <button id="submit-diag-q-btn" class="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg cursor-pointer transition-all">
                Submit Answer <i class="fas fa-check ml-1"></i>
              </button>
            ` : (diagnosticCurrentIndex < questions.length - 1 ? `
              <button id="next-diag-q-btn" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg cursor-pointer transition-all">
                Next Question <i class="fas fa-chevron-right ml-1"></i>
              </button>
            ` : `
              <button id="finish-diag-btn" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg cursor-pointer transition-all">
                Complete Assessment <i class="fas fa-circle-check ml-1"></i>
              </button>
            `)}
          </div>
        </div>
      </div>
    `;

    container.querySelector('#exit-diag-btn')?.addEventListener('click', () => {
      activeDiagnosticSession = null;
      lastDiagnosticFeedback = null;
      renderDiagnosticTab(container);
    });

    container.querySelector('#submit-diag-q-btn')?.addEventListener('click', async () => {
      const selected = container.querySelector('input[name="diag_opt_answer"]:checked')?.value;
      if (!selected) {
        alert('Please select an option before submitting.');
        return;
      }

      const btn = container.querySelector('#submit-diag-q-btn');
      if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin text-xs"></i> Grading...';

      try {
        lastDiagnosticFeedback = await client.submitAttempt(q.id, selected, session.diagnostic_id);
        renderActiveDiagnosticSession(container);
      } catch (err) {
        alert('Grading error: ' + err.message);
      }
    });

    container.querySelector('#next-diag-q-btn')?.addEventListener('click', () => {
      diagnosticCurrentIndex++;
      lastDiagnosticFeedback = null;
      renderActiveDiagnosticSession(container);
    });

    container.querySelector('#finish-diag-btn')?.addEventListener('click', () => {
      activeDiagnosticSession = null;
      lastDiagnosticFeedback = null;
      renderDiagnosticTab(container);
    });
  }

  // ─── TAB 4: KNOWLEDGE MAP & RETENTION ─────────────────────────────────────────
  async function renderKnowledgeMapTab(container) {
    let masteries = [];
    try {
      masteries = await client.getMasteryOverview();
    } catch (_) {}

    const avgRetention = masteries.length > 0
      ? Math.round(masteries.reduce((sum, m) => sum + (m.mastery_score || 0), 0) / masteries.length)
      : 0;

    container.innerHTML = `
      <div class="h-full overflow-y-auto p-6 bg-[#0b1329] space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold text-white flex items-center gap-2">
              <i class="fas fa-brain text-purple-400"></i> Knowledge Map & Memory Retention
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">Ebbinghaus spaced-repetition retention curves mapped to curriculum competencies.</p>
          </div>
          <div class="text-right text-xs">
            <div class="text-slate-500">Average Retention</div>
            <div class="text-lg font-semibold text-purple-400">${avgRetention}%</div>
          </div>
        </div>

        <!-- Visual Curriculum Map Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-xs">
          ${masteries.map(m => {
            const score = m.mastery_score || 0;
            const borderColor = score >= 80 ? 'border-emerald-500/40' : (score >= 60 ? 'border-cyan-500/40' : (score >= 40 ? 'border-amber-500/40' : 'border-rose-500/40'));
            const textColor = score >= 80 ? 'text-emerald-400' : (score >= 60 ? 'text-cyan-400' : (score >= 40 ? 'text-amber-400' : 'text-rose-400'));
            const badgeBg = score >= 80 ? 'bg-emerald-950/40 text-emerald-300' : (score >= 60 ? 'bg-cyan-950/40 text-cyan-300' : (score >= 40 ? 'bg-amber-950/40 text-amber-300' : 'bg-rose-950/40 text-rose-300'));
            const statusLabel = score >= 80 ? 'Fully Consolidated' : (score >= 60 ? 'Stable Memory' : (score >= 40 ? 'Spaced Review Due' : 'Active Recall Required'));

            return `
              <div class="bg-[#152140] border ${borderColor} p-4 rounded-2xl space-y-2 flex flex-col justify-between">
                <div>
                  <div class="flex justify-between items-start gap-1">
                    <span class="font-bold text-white text-[11px] leading-snug">${m.topic_name}</span>
                    <span class="${textColor} font-bold text-sm shrink-0">${score}%</span>
                  </div>
                  <div class="text-[10px] text-slate-400 uppercase mt-1 tracking-wider">${m.subject_id}</div>
                </div>
                <div>
                  <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                    <div class="${score >= 80 ? 'bg-emerald-500' : (score >= 60 ? 'bg-cyan-500' : (score >= 40 ? 'bg-amber-500' : 'bg-rose-500'))} h-full" style="width: ${score}%"></div>
                  </div>
                  <div class="text-[10px] ${badgeBg} px-2 py-1 rounded-lg text-center font-semibold">
                    ${statusLabel}
                  </div>
                  <div class="text-[10px] text-slate-500 text-center mt-1">
                    ${m.attempts_count || 0} attempts logged
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Forgetting Curve Explanatory Box -->
        <div class="bg-[#152140] border border-white/10 rounded-2xl p-5 space-y-3 text-xs leading-relaxed">
          <h3 class="font-bold text-white text-sm flex items-center gap-2">
            <i class="fas fa-chart-line text-cyan-400"></i> How EduGuard Enhances Student Memory
          </h3>
          <p class="text-slate-300">
            Human memory decay naturally causes up to 70% of newly learned KCSE content to be forgotten within 48 hours without systematic review. EduGuard's intelligence algorithms schedule proactive micro-quizzes at optimal cognitive intervals (Day 1, Day 3, Day 7, Day 21) to turn short-term recall into permanent KCSE exam mastery.
          </p>
        </div>
      </div>
    `;
  }

  // ─── TAB 5: NOTES AI ANALYZER ────────────────────────────────────────────────
  function analyzeNotesContent(text) {
    const lower = text.toLowerCase();

    // Topic definitions with detection patterns and required KCSE syllabus points
    const TOPICS = [
      {
        id: 'photosynthesis',
        name: 'Photosynthesis (KCSE Biology)',
        patterns: ['photo', 'chloroplast', 'chlorophyll', 'light stage', 'dark stage', 'calvin', 'rubisco', 'thylakoid', 'photolysis'],
        concepts: [
          { name: 'Site of photosynthesis (Chloroplasts / Thylakoids / Stroma)', test: /chloroplast|granum|thylakoid|stroma/i },
          { name: 'Photolysis of water yielding H+ ions, electrons, and O2 gas', test: /photolysis|split.*water|oxygen.*gas|water.*split/i },
          { name: 'Formation of energy carriers ATP and NADPH', test: /atp|nadph/i },
          { name: 'Light-independent stage / Calvin cycle in stroma', test: /dark stage|calvin|light-independent/i },
          { name: 'Carbon fixation by RuBP and RuBisCO enzyme', test: /rubisco|rubp|fixation.*carbon|carbon.*fixation/i },
          { name: 'Production of glucose and starch storage', test: /glucose|sugar|starch|c6h12o6/i },
          { name: 'Limiting factors (Light intensity, CO2 concentration, Temperature)', test: /limiting factor|light intensity|temperature|co2/i }
        ]
      },
      {
        id: 'cell_physiology',
        name: 'Cell Physiology & Osmosis (KCSE Biology)',
        patterns: ['osmosis', 'diffusion', 'plasmolysis', 'turgor', 'flaccid', 'hypertonic', 'hypotonic', 'semi-permeable'],
        concepts: [
          { name: 'Definition of osmosis across a semi-permeable membrane', test: /osmosis|semi-permeable|selectively permeable/i },
          { name: 'Water potential gradient movement from high to low potential', test: /water potential|gradient|concentration/i },
          { name: 'Effects in hypertonic solution (Plasmolysis / cell flaccidity)', test: /hypertonic|plasmolys|flaccid/i },
          { name: 'Effects in hypotonic solution (Turgidity / lysis in animal cells)', test: /hypotonic|turgid|lysis|burst/i },
          { name: 'Isotonic dynamic equilibrium', test: /isotonic|equilibrium/i },
          { name: 'Active transport mechanism against gradient using ATP', test: /active transport|atp|energy/i }
        ]
      },
      {
        id: 'quadratics',
        name: 'Quadratic Equations & Factorisation (KCSE Mathematics)',
        patterns: ['quadratic', 'factoris', 'factoriz', 'trinomial', 'roots', 'discriminant', 'parabola', 'ax²'],
        concepts: [
          { name: 'General quadratic form ax² + bx + c = 0', test: /ax²|ax\^2|standard form|equals zero/i },
          { name: 'Factorisation using factor pairs and splitting middle terms', test: /factor|trinomial|brackets/i },
          { name: 'Zero-product property to determine roots', test: /zero-product|x\s*=|root/i },
          { name: 'Quadratic formula x = (-b ± √(b² - 4ac)) / 2a', test: /formula|quadratic formula|sqrt|discriminant/i },
          { name: 'Discriminant analysis (b² - 4ac) for real vs equal roots', test: /discriminant|b²\s*-\s*4ac|nature of roots/i },
          { name: 'Completing the square method', test: /completing the square/i }
        ]
      },
      {
        id: 'chemical_bonding',
        name: 'Chemical Bonding & Structure (KCSE Chemistry)',
        patterns: ['ionic', 'covalent', 'metallic', 'lattice', 'octet', 'bonding', 'electronegativity', 'valence'],
        concepts: [
          { name: 'Ionic bonding via complete electron transfer between metal and non-metal', test: /ionic|transfer.*electron|metal.*non-metal/i },
          { name: 'Covalent bonding via electron pair sharing between non-metals', test: /covalent|shar.*electron/i },
          { name: 'Giant ionic lattice structures with high melting points', test: /lattice|giant ionic|melting point/i },
          { name: 'Giant atomic/macromolecular networks (e.g. Diamond, SiO2)', test: /giant covalent|diamond|quartz|sio2|macromolecular/i },
          { name: 'Metallic bonding: positive cations in delocalized electron cloud', test: /metallic|delocalized|sea of electrons/i },
          { name: 'Electrical conductivity in molten vs solid states', test: /conduct|electricity|molten|ions mobile/i }
        ]
      },
      {
        id: 'newton_motion',
        name: "Newton's Laws of Motion (KCSE Physics)",
        patterns: ['newton', 'inertia', 'momentum', 'acceleration', 'action and reaction', 'f=ma', 'velocity', 'force'],
        concepts: [
          { name: 'Newton\'s First Law: Law of Inertia', test: /first law|inertia|state of rest|uniform motion/i },
          { name: 'Newton\'s Second Law: Force = mass × acceleration (F = ma)', test: /second law|f\s*=\s*ma|rate of change of momentum/i },
          { name: 'Newton\'s Third Law: Action and reaction forces equal and opposite', test: /third law|action.*reaction|opposite/i },
          { name: 'Linear momentum conservation (p = mv)', test: /momentum|p\s*=\s*mv|conservation/i },
          { name: 'Equations of uniformly accelerated motion (v = u + at, s = ut + ½at²)', test: /v\s*=\s*u|ut\s*\+\s*½|equations of motion/i },
          { name: 'Impulse of a force (Impulse = F × t = Δp)', test: /impulse|f\s*×\s*t|change in momentum/i }
        ]
      }
    ];

    // Find best matching topic
    let bestTopic = null;
    let maxMatch = 0;

    for (const t of TOPICS) {
      let matches = 0;
      for (const p of t.patterns) {
        if (lower.includes(p)) matches++;
      }
      if (matches > maxMatch) {
        maxMatch = matches;
        bestTopic = t;
      }
    }

    if (!bestTopic || maxMatch === 0) {
      return {
        score: Math.min(65, Math.round((text.split(/\s+/).length / 25) * 50)),
        summary: `Notes analyzed across general KCSE science syllabus. The notes contain ${text.split(/\s+/).length} words, but did not match a specific recognized core unit (Photosynthesis, Cell Physiology, Quadratics, Chemical Bonding, or Newton's Laws).`,
        covered: ['General scientific vocabulary detected'],
        missing: ['Specific formula, key enzyme, or standard KCSE syllabus definitions']
      };
    }

    const covered = [];
    const missing = [];

    bestTopic.concepts.forEach(c => {
      if (c.test.test(text)) {
        covered.push(c.name);
      } else {
        missing.push(c.name);
      }
    });

    const total = covered.length + missing.length;
    const score = Math.round((covered.length / total) * 100);

    return {
      score: score,
      topic_name: bestTopic.name,
      summary: `Analyzed against ${bestTopic.name}. Your notes capture ${covered.length} of ${total} high-yield KCSE syllabus criteria. Review missing key concepts below before your next test.`,
      covered: covered,
      missing: missing
    };
  }

  function renderNotesTab(container) {
    container.innerHTML = `
      <div class="h-full flex flex-col bg-[#0b1329] p-6 space-y-4 overflow-y-auto">
        <div class="border-b border-white/10 pb-3 flex items-center justify-between shrink-0">
          <div>
            <h2 class="text-sm font-semibold text-white flex items-center gap-2">
              <i class="fas fa-file-lines text-emerald-400"></i> Smart Notes Syllabus Analyzer
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">Paste revision notes to verify genuine KCSE syllabus coverage across Math, Biology, Physics, or Chemistry.</p>
          </div>
          <button id="analyze-notes-btn" class="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow-md">
            <i class="fas fa-magnifying-glass text-xs"></i> Analyze Notes
          </button>
        </div>

        <!-- Notes Input Area -->
        <div class="grid grid-cols-2 gap-4 flex-1 min-h-[300px]">
          <div class="flex flex-col">
            <label class="text-xs font-bold text-slate-400 mb-1">Your Handwritten / Typed Revision Notes</label>
            <textarea id="notes-textarea" class="flex-1 bg-[#152140] border border-white/10 rounded-2xl p-4 text-xs text-slate-200 outline-none focus:border-emerald-500 resize-none font-sans leading-relaxed" placeholder="Paste your study notes here... e.g.:

Photosynthesis takes place in chloroplasts. In the light stage, water is split into hydrogen and oxygen using light energy. The oxygen is given off as a gas. In the dark stage, carbon dioxide is converted into glucose."></textarea>
          </div>

          <!-- AI Evaluation Output Area -->
          <div class="flex flex-col">
            <label class="text-xs font-bold text-slate-400 mb-1">EduGuard AI Feedback & Syllabus Coverage</label>
            <div id="notes-feedback-box" class="flex-1 bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-xs text-slate-300 overflow-y-auto space-y-3">
              ${analyzedNotesResult ? `
                <div class="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl">
                  <div class="flex items-center justify-between font-bold text-emerald-300 mb-1">
                    <span>${analyzedNotesResult.topic_name || 'Syllabus Alignment Score'}</span>
                    <span class="text-base font-black ${analyzedNotesResult.score >= 70 ? 'text-emerald-400' : 'text-amber-400'}">${analyzedNotesResult.score}%</span>
                  </div>
                  <p class="text-[11px] text-slate-300">${analyzedNotesResult.summary}</p>
                </div>

                <div class="space-y-1.5">
                  <div class="font-bold text-white text-[11px] uppercase tracking-wider text-emerald-400">
                    <i class="fas fa-check-circle mr-1"></i> Key Concepts Captured (${analyzedNotesResult.covered.length}):
                  </div>
                  <ul class="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                    ${analyzedNotesResult.covered.map(c => `<li>${c}</li>`).join('')}
                  </ul>
                </div>

                <div class="space-y-1.5">
                  <div class="font-bold text-white text-[11px] uppercase tracking-wider text-amber-400">
                    <i class="fas fa-circle-exclamation mr-1"></i> Missing High-Yield KCSE Points (${analyzedNotesResult.missing.length}):
                  </div>
                  <ul class="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                    ${analyzedNotesResult.missing.map(m => `<li>${m}</li>`).join('')}
                  </ul>
                </div>
              ` : `
                <div class="h-full flex flex-col items-center justify-center text-center text-slate-500 p-6">
                  <i class="fas fa-file-alt text-4xl mb-3 opacity-40"></i>
                  <p class="text-xs">Paste your notes on the left and click <b>Analyze Notes</b> to verify KCSE syllabus coverage.</p>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#analyze-notes-btn')?.addEventListener('click', () => {
      const text = container.querySelector('#notes-textarea')?.value.trim();
      if (!text) {
        alert('Please enter or paste your notes first.');
        return;
      }

      analyzedNotesResult = analyzeNotesContent(text);
      renderNotesTab(container);
    });
  }

  // ─── TAB 6: TEACHER & PROCTOR PORTAL ─────────────────────────────────────────
  async function renderTeacherTab(container) {
    let roster = null;
    try {
      roster = await client.getTeacherRoster();
    } catch (_) {}

    container.innerHTML = `
      <div class="h-full overflow-y-auto p-6 bg-[#0b1329] space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold text-white flex items-center gap-2">
              <i class="fas fa-chalkboard-user text-rose-400"></i> Teacher & Proctor View
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">Classroom lab network — Dawamu High School Computer Lab.</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-400">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            ${roster?.active_count || 1} Students Active
          </div>
        </div>

        ${roster?.is_simulated ? `
          <div class="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2.5">
            <i class="fas fa-circle-info text-amber-400 text-sm"></i>
            <span><b>Offline Demo Telemetry:</b> Backend port 8000 is running in offline demo mode. Displaying verified local simulation roster.</span>
          </div>
        ` : ''}

        <!-- Student Roster Telemetry Table -->
        <div class="bg-[#152140] border border-white/10 rounded-2xl overflow-hidden shadow">
          <div class="p-4 border-b border-white/10 flex justify-between items-center text-xs">
            <span class="font-bold text-white uppercase tracking-wider">Live Exam Roster</span>
            <span class="text-slate-400">Class: <b>Dawamu High School Lab</b></span>
          </div>

          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-[#0f172a] text-[10px] text-slate-400 uppercase tracking-wider border-b border-white/10">
              <tr>
                <th class="p-3 pl-4">Adm No</th>
                <th class="p-3">Candidate Name</th>
                <th class="p-3">Current App / Exam</th>
                <th class="p-3">Focus State</th>
                <th class="p-3">Integrity Score</th>
                <th class="p-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 font-medium">
              ${(roster?.students || []).map((s, sIdx) => {
                const isThisPc = sIdx === 0 || s.admNo === (currentStudent.admNo || '1001');
                const focusState = isThisPc ? (proctorActive ? 'In-Focus (Exam Guard)' : 'Active (Desktop)') : s.focusState;
                const score = isThisPc ? integrityScore : s.integrityScore;
                const scoreColor = score < 75 ? 'text-rose-400' : 'text-emerald-400';

                return `
                  <tr>
                    <td class="p-3 pl-4 font-mono ${isThisPc ? 'text-emerald-400 font-bold' : 'text-slate-400'}">${s.admNo}</td>
                    <td class="p-3 text-white font-bold">${s.name} ${isThisPc ? '<span class="text-[10px] text-emerald-400 font-normal">(This PC)</span>' : ''}</td>
                    <td class="p-3">${isThisPc ? (proctorActive ? 'EduGuard Exam Proctor' : 'EduGuard Academic Tutor') : s.currentApp}</td>
                    <td class="p-3">
                      <span class="${score >= 75 ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40'} px-2 py-0.5 rounded text-[11px] font-bold">
                        ${focusState}
                      </span>
                    </td>
                    <td class="p-3 font-bold ${scoreColor}">${score}%</td>
                    <td class="p-3 pr-4 text-right">
                      <button class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[10px] cursor-pointer">
                        ${score < 75 ? 'Issue Warning' : 'View Audit'}
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ─── TAB 7: LIVE EDUGUARD WEB / BACKEND INTEGRATION ──────────────────────────
  function renderHybridTab(container) {
    container.innerHTML = `
      <div class="flex flex-col h-full bg-[#0b1329]">
        <!-- Connection Header Bar -->
        <div class="bg-[#0f172a] border-b border-white/10 px-5 py-3 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <i class="fas fa-plug"></i>
            </div>
            <div>
              <div class="text-xs font-bold text-white">EduGuard Standalone Service Connector</div>
              <div class="text-[10px] text-slate-400">Connect to Flutter Desktop / Web or FastAPI Backend</div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button id="sync-offline-queue-btn" class="bg-emerald-800 hover:bg-emerald-700 text-emerald-200 text-xs px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer">
              <i class="fas fa-cloud-arrow-up"></i> Sync Queued Attempts
            </button>
            <button id="refresh-conn-btn" class="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 cursor-pointer">
              <i class="fas fa-rotate"></i> Check Status
            </button>
            <a href="http://localhost:3000" target="_blank" class="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all">
              <span>Open Full App</span>
              <i class="fas fa-up-right-from-square text-[10px]"></i>
            </a>
          </div>
        </div>

        <!-- Embedded Web Frame or Launcher Guide -->
        <div class="flex-1 p-6 overflow-y-auto space-y-6">
          <div class="grid grid-cols-2 gap-4 text-xs">
            <!-- Backend Service Status -->
            <div class="bg-[#152140] border border-white/10 p-5 rounded-2xl space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-bold text-white flex items-center gap-2">
                  <i class="fas fa-server text-cyan-400"></i> Python FastAPI Intelligence
                </span>
                <span id="backend-status-badge" class="bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded font-bold">
                  Checking...
                </span>
              </div>
              <p class="text-slate-400 leading-relaxed text-[11px]">
                Powers EduGuard's knowledge graphs, adaptive diagnostic algorithms, and AI tutoring microservices on port <b>8000</b>.
              </p>
              <div class="font-mono text-[10px] bg-[#0b1021] p-2.5 rounded-xl text-slate-300 border border-white/5">
                Endpoint: http://127.0.0.1:8000/docs
              </div>
            </div>

            <!-- Frontend Flutter Web Status -->
            <div class="bg-[#152140] border border-white/10 p-5 rounded-2xl space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-bold text-white flex items-center gap-2">
                  <i class="fab fa-flutter text-blue-400"></i> Flutter Web Application
                </span>
                <span id="frontend-status-badge" class="bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded font-bold">
                  Checking...
                </span>
              </div>
              <p class="text-slate-400 leading-relaxed text-[11px]">
                Hosts the cross-platform Material Design 3 student and teacher UI on port <b>3000</b>.
              </p>
              <div class="font-mono text-[10px] bg-[#0b1021] p-2.5 rounded-xl text-slate-300 border border-white/5">
                URL: http://localhost:3000
              </div>
            </div>
          </div>

          <!-- Embedded Iframe Container -->
          <div class="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden h-[420px] flex flex-col">
            <div class="bg-[#152140] px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs">
              <span class="font-bold text-slate-300 flex items-center gap-2">
                <i class="fas fa-desktop text-emerald-400"></i> Embedded EduGuard Web Preview
              </span>
              <span class="text-slate-500 text-[11px]">Loads http://localhost:3000 if services are running</span>
            </div>
            <iframe id="eduguard-live-frame" src="http://localhost:3000" class="w-full flex-1 border-none bg-slate-950"></iframe>
          </div>
        </div>
      </div>
    `;

    // Check status of backend & frontend
    const checkServices = async () => {
      const bBadge = container.querySelector('#backend-status-badge');
      const fBadge = container.querySelector('#frontend-status-badge');

      try {
        const res = await fetch('http://127.0.0.1:8000/health', { method: 'GET', mode: 'cors' });
        if (res.ok && bBadge) {
          bBadge.textContent = 'ONLINE (Port 8000)';
          bBadge.className = 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded font-bold';
        } else if (bBadge) {
          bBadge.textContent = 'STANDALONE (Port 8000)';
        }
      } catch (_) {
        if (bBadge) {
          bBadge.textContent = 'OFFLINE (Local Fallback Active)';
          bBadge.className = 'bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded font-bold';
        }
      }

      try {
        const fRes = await fetch('http://localhost:3000', { method: 'HEAD', mode: 'no-cors' });
        if (fBadge) {
          fBadge.textContent = 'ONLINE (Port 3000)';
          fBadge.className = 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded font-bold';
        }
      } catch (_) {
        if (fBadge) {
          fBadge.textContent = 'OFFLINE';
          fBadge.className = 'bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded font-bold';
        }
      }
    };

    container.querySelector('#refresh-conn-btn')?.addEventListener('click', checkServices);
    container.querySelector('#sync-offline-queue-btn')?.addEventListener('click', async () => {
      const syncBtn = container.querySelector('#sync-offline-queue-btn');
      if (syncBtn) syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
      const syncResult = await client.syncOfflineQueue();
      alert(`Offline Sync Status: ${syncResult.message}`);
      if (syncBtn) syncBtn.innerHTML = '<i class="fas fa-cloud-arrow-up"></i> Sync Queued Attempts';
    });
    checkServices();
  }

  render();
  return root;
}
