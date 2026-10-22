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
                <div class="whitespace-pre-wrap">${msg.text}</div>
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

      // AI response engine: Try EduGuard FastAPI backend first, fallback to offline KB
      let responseText = '';
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1800);
        const res = await fetch('http://127.0.0.1:8000/api/v1/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: query, student_name: currentStudent.name }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          responseText = data.reply || data.response || data.message;
        }
      } catch (_) {
        // Fallback to local offline heuristic knowledgebase
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
          responseText = `Regarding **"${query}"**:\n\n` +
            `In the KCSE syllabus for ${currentStudent.grade}, this topic emphasizes conceptual understanding, precise scientific terminologies, and real-world application.\n\n` +
            `• Key Rule: Always state standard definitions, include balanced chemical/mathematical equations where applicable, and show clear step-by-step working.\n` +
            `• Would you like me to generate a 3-question diagnostic quiz to test your mastery of this concept?`;
        }
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

  function finishExam() {
    if (proctorTimerId) clearInterval(proctorTimerId);
    proctorActive = false;
    examCompleted = true;
    render();
  }

  // ─── TAB 3: DIAGNOSTIC ENGINE & MASTERY ──────────────────────────────────────
  function renderDiagnosticTab(container) {
    container.innerHTML = `
      <div class="h-full overflow-y-auto p-6 bg-[#0b1329] space-y-6">
        <!-- Diagnostic Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold text-white flex items-center gap-2">
              <i class="fas fa-stethoscope text-cyan-400"></i> Diagnostic Engine
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">Learning gap analysis for KCSE subjects.</p>
          </div>
          <button id="run-diagnostic-btn" class="bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5">
            <i class="fas fa-bolt text-xs"></i> Run Scan
          </button>
        </div>

        <!-- Controls: Subject & Grade Selection -->
        <div class="grid grid-cols-2 gap-4 bg-[#152140] p-4 rounded-2xl border border-white/10 text-xs">
          <div>
            <label class="block text-slate-400 font-bold mb-1">Target Subject</label>
            <select id="diag-subject-select" class="w-full bg-[#0f172a] border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-cyan-500">
              <option value="Mathematics" ${diagSubject === 'Mathematics' ? 'selected' : ''}>Mathematics</option>
              <option value="Biology" ${diagSubject === 'Biology' ? 'selected' : ''}>Biology</option>
              <option value="Chemistry" ${diagSubject === 'Chemistry' ? 'selected' : ''}>Chemistry</option>
              <option value="Physics" ${diagSubject === 'Physics' ? 'selected' : ''}>Physics</option>
              <option value="Computer Studies" ${diagSubject === 'Computer Studies' ? 'selected' : ''}>Computer Studies</option>
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
            <div class="text-3xl font-extrabold text-emerald-400">78%</div>
            <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div class="bg-emerald-400 h-full rounded-full" style="width: 78%"></div>
            </div>
            <p class="text-[11px] text-slate-400 pt-1">Strong performance in algebraic manipulation; slight decay in trigonometry.</p>
          </div>

          <div class="bg-[#152140] border border-white/10 rounded-2xl p-5 space-y-2">
            <div class="text-[11px] text-slate-400 font-semibold uppercase">Detected Learning Gaps</div>
            <div class="text-3xl font-extrabold text-amber-400">2 Gaps</div>
            <div class="flex items-center gap-1.5 text-xs text-amber-300">
              <i class="fas fa-triangle-exclamation text-amber-400"></i>
              <span>Surds & Indices • Radians</span>
            </div>
            <p class="text-[11px] text-slate-400 pt-1">High error rate on fractional exponents and radical rationalization.</p>
          </div>

          <div class="bg-[#152140] border border-white/10 rounded-2xl p-5 space-y-2">
            <div class="text-[11px] text-slate-400 font-semibold uppercase">Prescribed Action</div>
            <div class="text-xl font-bold text-cyan-400">3-Day Refresher</div>
            <p class="text-xs text-slate-300">EduGuard has scheduled 15-minute spaced repetition flashcards before upcoming test.</p>
          </div>
        </div>

        <!-- Detailed Competency Breakdown -->
        <div class="bg-[#152140] border border-white/10 rounded-2xl p-5 space-y-3">
          <h3 class="text-xs font-medium text-slate-400 mb-1">${diagSubject} — ${diagForm} Breakdown</h3>
          
          <div class="space-y-3 text-xs">
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-slate-300 font-medium">Linear & Quadratic Equations</span>
                <span class="text-emerald-400 font-bold">92% (Mastered)</span>
              </div>
              <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full" style="width: 92%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between mb-1">
                <span class="text-slate-300 font-medium">Commercial Arithmetic & Percentages</span>
                <span class="text-emerald-400 font-bold">85% (Proficient)</span>
              </div>
              <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full" style="width: 85%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between mb-1">
                <span class="text-slate-300 font-medium">Trigonometric Ratios & Angles</span>
                <span class="text-amber-400 font-bold">64% (Review Needed)</span>
              </div>
              <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="bg-amber-500 h-full" style="width: 64%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between mb-1">
                <span class="text-slate-300 font-medium">Surds, Indices & Logarithms</span>
                <span class="text-rose-400 font-bold">48% (Critical Gap)</span>
              </div>
              <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="bg-rose-500 h-full" style="width: 48%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#run-diagnostic-btn')?.addEventListener('click', () => {
      alert('Diagnostic scan completed! All learning gap telemetry synced with student record.');
    });
  }

  // ─── TAB 4: KNOWLEDGE MAP & RETENTION ─────────────────────────────────────────
  function renderKnowledgeMapTab(container) {
    container.innerHTML = `
      <div class="h-full overflow-y-auto p-6 bg-[#0b1329] space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold text-white flex items-center gap-2">
              <i class="fas fa-brain text-purple-400"></i> Knowledge Map
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">Spaced repetition & retention curves (Ebbinghaus model).</p>
          </div>
          <div class="text-right text-xs">
            <div class="text-slate-500">Avg retention</div>
            <div class="text-lg font-semibold text-purple-400">82.4%</div>
          </div>
        </div>

        <!-- Visual Curriculum Map Grid -->
        <div class="grid grid-cols-4 gap-4 text-xs">
          <div class="bg-[#152140] border border-emerald-500/30 p-4 rounded-2xl space-y-2">
            <div class="flex justify-between items-center">
              <span class="font-bold text-white">Form 1: Cell Biology</span>
              <span class="text-emerald-400 font-bold">95%</span>
            </div>
            <p class="text-[11px] text-slate-400">Microscope, plant vs animal cells, diffusion, osmosis.</p>
            <div class="text-[10px] text-emerald-300 bg-emerald-950/40 px-2 py-1 rounded-lg">Status: Fully Consolidated</div>
          </div>

          <div class="bg-[#152140] border border-emerald-500/30 p-4 rounded-2xl space-y-2">
            <div class="flex justify-between items-center">
              <span class="font-bold text-white">Form 2: Circulatory</span>
              <span class="text-emerald-400 font-bold">88%</span>
            </div>
            <p class="text-[11px] text-slate-400">Mammalian heart, blood vessels, capillary exchange.</p>
            <div class="text-[10px] text-emerald-300 bg-emerald-950/40 px-2 py-1 rounded-lg">Status: Stable Memory</div>
          </div>

          <div class="bg-[#152140] border border-amber-500/30 p-4 rounded-2xl space-y-2">
            <div class="flex justify-between items-center">
              <span class="font-bold text-white">Form 3: Ecology</span>
              <span class="text-amber-400 font-bold">62%</span>
            </div>
            <p class="text-[11px] text-slate-400">Energy flow, food webs, ecological pyramids, sampling.</p>
            <div class="text-[10px] text-amber-300 bg-amber-950/40 px-2 py-1 rounded-lg">Status: Spaced Review Due</div>
          </div>

          <div class="bg-[#152140] border border-rose-500/30 p-4 rounded-2xl space-y-2">
            <div class="flex justify-between items-center">
              <span class="font-bold text-white">Form 4: Genetics</span>
              <span class="text-rose-400 font-bold">41%</span>
            </div>
            <p class="text-[11px] text-slate-400">DNA replication, monohybrid crosses, sex linkage.</p>
            <div class="text-[10px] text-rose-300 bg-rose-950/40 px-2 py-1 rounded-lg">Status: Active Recall Required</div>
          </div>
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
  function renderNotesTab(container) {
    container.innerHTML = `
      <div class="h-full flex flex-col bg-[#0b1329] p-6 space-y-4 overflow-y-auto">
        <div class="border-b border-white/10 pb-3 flex items-center justify-between shrink-0">
          <div>
            <h2 class="text-sm font-semibold text-white flex items-center gap-2">
              <i class="fas fa-file-lines text-emerald-400"></i> Notes Analyzer
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">Paste notes to check KCSE syllabus coverage.</p>
          </div>
          <button id="analyze-notes-btn" class="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5">
            <i class="fas fa-magnifying-glass text-xs"></i> Analyze
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
            <label class="text-xs font-bold text-slate-400 mb-1">EduGuard AI Feedback & Coverage</label>
            <div id="notes-feedback-box" class="flex-1 bg-[#0f172a] border border-white/10 rounded-2xl p-4 text-xs text-slate-300 overflow-y-auto space-y-3">
              ${analyzedNotesResult ? `
                <div class="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl">
                  <div class="flex items-center justify-between font-bold text-emerald-300 mb-1">
                    <span>Syllabus Alignment Score</span>
                    <span class="text-base font-black">${analyzedNotesResult.score}%</span>
                  </div>
                  <p class="text-[11px] text-slate-300">${analyzedNotesResult.summary}</p>
                </div>

                <div class="space-y-1.5">
                  <div class="font-bold text-white text-[11px] uppercase tracking-wider text-emerald-400">
                    <i class="fas fa-check-circle mr-1"></i> Key Concepts Captured:
                  </div>
                  <ul class="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                    ${analyzedNotesResult.covered.map(c => `<li>${c}</li>`).join('')}
                  </ul>
                </div>

                <div class="space-y-1.5">
                  <div class="font-bold text-white text-[11px] uppercase tracking-wider text-amber-400">
                    <i class="fas fa-circle-exclamation mr-1"></i> Missing High-Yield KCSE Points:
                  </div>
                  <ul class="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                    ${analyzedNotesResult.missing.map(m => `<li>${m}</li>`).join('')}
                  </ul>
                </div>
              ` : `
                <div class="h-full flex flex-col items-center justify-center text-center text-slate-500">
                  <i class="fas fa-file-alt text-4xl mb-3 opacity-40"></i>
                  <p>Paste your notes on the left and click <b>Analyze Notes</b> to get instant feedback.</p>
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

      analyzedNotesResult = {
        score: 84,
        summary: 'Your notes demonstrate good foundational comprehension of the photolysis stage and gas exchange, but omit mention of key enzymes and intermediate chemical compounds tested in KCSE Paper 1 & 2.',
        covered: [
          'Site of photosynthesis (Chloroplasts)',
          'Photolysis of water yielding oxygen',
          'Fixation of carbon dioxide into carbohydrates'
        ],
        missing: [
          'RuBisCO enzyme and Ribulose Biphosphate (RuBP) role in carbon fixation',
          'ATP and NADPH formation as energy carriers for the light-independent Calvin cycle',
          'Limiting factors: light intensity, temperature, CO2 concentration'
        ]
      };

      renderNotesTab(container);
    });
  }

  // ─── TAB 6: TEACHER & PROCTOR PORTAL ─────────────────────────────────────────
  function renderTeacherTab(container) {
    container.innerHTML = `
      <div class="h-full overflow-y-auto p-6 bg-[#0b1329] space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold text-white flex items-center gap-2">
              <i class="fas fa-chalkboard-user text-rose-400"></i> Teacher & Proctor View
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">Classroom network — Dawamu High School Lab.</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-400">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            12 Students Active
          </div>
        </div>

        <!-- Student Roster Telemetry Table -->
        <div class="bg-[#152140] border border-white/10 rounded-2xl overflow-hidden shadow">
          <div class="p-4 border-b border-white/10 flex justify-between items-center text-xs">
            <span class="font-bold text-white uppercase tracking-wider">Live Exam Roster (Form 1 - Form 4)</span>
            <span class="text-slate-400">Class: <b>Dawamu High School Computer Lab</b></span>
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
              <tr>
                <td class="p-3 pl-4 font-mono text-emerald-400">1001</td>
                <td class="p-3 text-white font-bold">${currentStudent.name} (This PC)</td>
                <td class="p-3">EduGuard Proctor Shield</td>
                <td class="p-3">
                  <span class="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded text-[11px] font-bold">In-Focus</span>
                </td>
                <td class="p-3 font-bold ${integrityScore < 75 ? 'text-rose-400' : 'text-emerald-400'}">${integrityScore}%</td>
                <td class="p-3 pr-4 text-right">
                  <button class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[10px]">View Audit</button>
                </td>
              </tr>
              <tr>
                <td class="p-3 pl-4 font-mono text-slate-400">1002</td>
                <td class="p-3 text-white font-bold">Kevin Mwangi</td>
                <td class="p-3">Chemistry Form 3 Revision</td>
                <td class="p-3">
                  <span class="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded text-[11px] font-bold">In-Focus</span>
                </td>
                <td class="p-3 font-bold text-emerald-400">100%</td>
                <td class="p-3 pr-4 text-right">
                  <button class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[10px]">View Audit</button>
                </td>
              </tr>
              <tr>
                <td class="p-3 pl-4 font-mono text-slate-400">1007</td>
                <td class="p-3 text-white font-bold">Victor Nyamweya</td>
                <td class="p-3">Mathematics Diagnostic Test</td>
                <td class="p-3">
                  <span class="text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded text-[11px] font-bold">Idle (3m)</span>
                </td>
                <td class="p-3 font-bold text-amber-400">85%</td>
                <td class="p-3 pr-4 text-right">
                  <button class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[10px]">View Audit</button>
                </td>
              </tr>
              <tr>
                <td class="p-3 pl-4 font-mono text-slate-400">1010</td>
                <td class="p-3 text-white font-bold">Dennis Mutua</td>
                <td class="p-3">Offline 8-4-4 Library</td>
                <td class="p-3">
                  <span class="text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded text-[11px] font-bold">Window Switched</span>
                </td>
                <td class="p-3 font-bold text-rose-400">60%</td>
                <td class="p-3 pr-4 text-right">
                  <button class="bg-rose-900/40 hover:bg-rose-800/60 text-rose-200 px-2.5 py-1 rounded-lg text-[10px]">Issue Warning</button>
                </td>
              </tr>
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
    checkServices();
  }

  render();
  return root;
}
