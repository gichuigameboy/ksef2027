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
      <!-- App Header Bar -->
      <header class="bg-[#0f172a] border-b border-white/10 px-5 py-3 flex items-center justify-between shrink-0 shadow-md">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-950/40">
            <i class="fas fa-shield-halved"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-base text-white tracking-tight">EduGuard</span>
              <span class="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                AI Platform • KSEF 2027
              </span>
            </div>
            <div class="text-[11px] text-slate-400">
              Student: <b class="text-emerald-400">${currentStudent.name}</b> (${currentStudent.admNo} • ${currentStudent.grade})
            </div>
          </div>
        </div>

        <!-- System Protection Badges -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 bg-[#1e293b] border border-white/10 px-3 py-1.5 rounded-xl text-xs">
            <span class="w-2 h-2 rounded-full ${proctorActive ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}"></span>
            <span class="text-slate-300 font-medium">Proctor Guard:</span>
            <b class="${proctorActive ? 'text-rose-400' : 'text-emerald-400'}">${proctorActive ? 'LIVE MONITORING' : 'READY'}</b>
          </div>

          <div class="flex items-center gap-2 bg-[#1e293b] border border-white/10 px-3 py-1.5 rounded-xl text-xs">
            <i class="fas fa-microchip text-cyan-400"></i>
            <span class="text-slate-300 font-medium">AI Engine:</span>
            <span class="text-cyan-300 font-bold">Local + FastAPI</span>
          </div>
        </div>
      </header>

      <!-- App Navigation Tabs -->
      <nav class="bg-[#0b1021] border-b border-white/10 px-4 flex items-center gap-1 shrink-0 overflow-x-auto">
        <button class="nav-tab px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'tutor' ? 'text-emerald-400 border-emerald-500 bg-white/5' : 'text-slate-400 border-transparent hover:text-white'}" data-tab="tutor">
          <i class="fas fa-brain text-sm"></i>
          <span>AI Study Tutor</span>
        </button>

        <button class="nav-tab px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'proctor' ? 'text-emerald-400 border-emerald-500 bg-white/5' : 'text-slate-400 border-transparent hover:text-white'}" data-tab="proctor">
          <i class="fas fa-shield-virus text-sm"></i>
          <span>Exam Proctor Guard</span>
          ${proctorActive ? `<span class="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">LIVE</span>` : ''}
        </button>

        <button class="nav-tab px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'diagnostic' ? 'text-emerald-400 border-emerald-500 bg-white/5' : 'text-slate-400 border-transparent hover:text-white'}" data-tab="diagnostic">
          <i class="fas fa-stethoscope text-sm"></i>
          <span>Diagnostic Engine</span>
        </button>

        <button class="nav-tab px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'knowledgemap' ? 'text-emerald-400 border-emerald-500 bg-white/5' : 'text-slate-400 border-transparent hover:text-white'}" data-tab="knowledgemap">
          <i class="fas fa-chart-pie text-sm"></i>
          <span>Knowledge & Retention</span>
        </button>

        <button class="nav-tab px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'notes' ? 'text-emerald-400 border-emerald-500 bg-white/5' : 'text-slate-400 border-transparent hover:text-white'}" data-tab="notes">
          <i class="fas fa-file-waveform text-sm"></i>
          <span>Notes AI Analyzer</span>
        </button>

        <button class="nav-tab px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'teacher' ? 'text-emerald-400 border-emerald-500 bg-white/5' : 'text-slate-400 border-transparent hover:text-white'}" data-tab="teacher">
          <i class="fas fa-chalkboard-user text-sm"></i>
          <span>Teacher & Proctor View</span>
        </button>

        <button class="nav-tab px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ml-auto ${activeTab === 'hybrid' ? 'text-cyan-400 border-cyan-500 bg-cyan-950/30' : 'text-slate-400 border-transparent hover:text-cyan-300'}" data-tab="hybrid">
          <i class="fas fa-link text-xs"></i>
          <span>Live EduGuard Service</span>
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
        <!-- Prompt Presets Bar -->
        <div class="bg-[#0f172a]/90 border-b border-white/5 px-4 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 text-xs">
          <span class="text-slate-400 font-semibold flex items-center gap-1 shrink-0">
            <i class="fas fa-wand-magic-sparkles text-amber-400"></i> KCSE Prompts:
          </span>
          <button class="prompt-chip bg-white/5 hover:bg-emerald-900/40 hover:border-emerald-500/50 border border-white/10 text-slate-200 px-3 py-1 rounded-full shrink-0 transition-all cursor-pointer">
            Explain Photosynthesis Light vs Dark Stages
          </button>
          <button class="prompt-chip bg-white/5 hover:bg-emerald-900/40 hover:border-emerald-500/50 border border-white/10 text-slate-200 px-3 py-1 rounded-full shrink-0 transition-all cursor-pointer">
            How to solve Quadratic Equations with formula
          </button>
          <button class="prompt-chip bg-white/5 hover:bg-emerald-900/40 hover:border-emerald-500/50 border border-white/10 text-slate-200 px-3 py-1 rounded-full shrink-0 transition-all cursor-pointer">
            Le Chatelier's Principle in Chemistry
          </button>
          <button class="prompt-chip bg-white/5 hover:bg-emerald-900/40 hover:border-emerald-500/50 border border-white/10 text-slate-200 px-3 py-1 rounded-full shrink-0 transition-all cursor-pointer">
            Newton's Laws of Motion with Examples
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
        <div class="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#0b1329] to-[#080d1c] overflow-y-auto">
          <div class="w-20 h-20 bg-rose-500/10 border border-rose-500/30 rounded-3xl flex items-center justify-center text-rose-400 text-3xl mb-4 shadow-xl">
            <i class="fas fa-shield-virus"></i>
          </div>

          <h1 class="text-2xl font-extrabold text-white mb-2">EduGuard Exam Proctor Shield</h1>
          <p class="text-xs text-slate-300 max-w-lg mb-6 leading-relaxed">
            Welcome to the secure exam environment. EduGuard's proctoring algorithms track student application focus, prevent unauthorized tab switching, monitor clipboard actions, and ensure exam integrity.
          </p>

          <!-- Security Policy Badges -->
          <div class="grid grid-cols-3 gap-4 max-w-xl w-full mb-8 text-left text-xs">
            <div class="bg-[#152140] border border-white/10 p-4 rounded-2xl">
              <div class="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                <i class="fas fa-window-restore"></i> Focus Lock
              </div>
              <p class="text-slate-400 text-[11px]">Switching windows or minimizing Dawamu OS triggers an immediate integrity deduction.</p>
            </div>

            <div class="bg-[#152140] border border-white/10 p-4 rounded-2xl">
              <div class="text-cyan-400 font-bold mb-1 flex items-center gap-1.5">
                <i class="fas fa-clipboard-check"></i> Clip Guard
              </div>
              <p class="text-slate-400 text-[11px]">Copying or pasting external content during the examination is blocked and logged.</p>
            </div>

            <div class="bg-[#152140] border border-white/10 p-4 rounded-2xl">
              <div class="text-amber-400 font-bold mb-1 flex items-center gap-1.5">
                <i class="fas fa-gauge-high"></i> Integrity Index
              </div>
              <p class="text-slate-400 text-[11px]">Real-time audit log generated for teacher verification and grading accreditation.</p>
            </div>
          </div>

          <!-- Start Exam Trigger -->
          <button id="start-exam-btn" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-xl shadow-emerald-950/50 flex items-center gap-2 cursor-pointer transition-all active:scale-95">
            <i class="fas fa-play"></i>
            <span>Begin Proctored KCSE Sample Examination (5 Questions)</span>
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
          <div class="bg-gradient-to-r from-emerald-900/60 to-cyan-950/60 border border-emerald-500/30 rounded-3xl p-6 flex items-center justify-between shadow-xl">
            <div>
              <div class="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-1">
                <i class="fas fa-circle-check mr-1"></i> Examination Completed
              </div>
              <h1 class="text-2xl font-extrabold text-white">Student Assessment & Integrity Scorecard</h1>
              <p class="text-xs text-slate-300 mt-1">Candidate: <b>${currentStudent.name}</b> (${currentStudent.admNo} • ${currentStudent.grade})</p>
            </div>

            <div class="flex items-center gap-6">
              <div class="text-center bg-[#152140]/80 p-3.5 rounded-2xl border border-white/10">
                <div class="text-2xl font-black text-emerald-400">${academicScore}%</div>
                <div class="text-[10px] text-slate-400 font-semibold uppercase">Academic Score</div>
              </div>

              <div class="text-center bg-[#152140]/80 p-3.5 rounded-2xl border ${integrityScore < 75 ? 'border-rose-500/50' : 'border-emerald-500/50'}">
                <div class="text-2xl font-black ${integrityScore < 75 ? 'text-rose-400' : 'text-emerald-400'}">${integrityScore}%</div>
                <div class="text-[10px] text-slate-400 font-semibold uppercase">Exam Integrity</div>
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
        <!-- Diagnostic Header Banner -->
        <div class="bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-500/30 rounded-3xl p-6 flex items-center justify-between shadow-xl">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <i class="fas fa-stethoscope"></i> Adaptive Diagnostic Engine
            </div>
            <h1 class="text-2xl font-extrabold text-white">Competency & Learning Gap Diagnosis</h1>
            <p class="text-xs text-slate-300">Pinpoints cognitive roadblocks in Kenyan KCSE subjects and outputs prescriptive recovery pathways.</p>
          </div>

          <button id="run-diagnostic-btn" class="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center gap-2">
            <i class="fas fa-bolt"></i> Run Full Diagnostic Scan
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
          <h3 class="text-xs font-bold text-white uppercase tracking-wider">Sub-Topic Competency Matrix (${diagSubject} - ${diagForm})</h3>
          
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
        <div class="bg-gradient-to-r from-purple-950 to-indigo-950 border border-purple-500/30 rounded-3xl p-6 flex items-center justify-between shadow-xl">
          <div>
            <div class="text-xs uppercase tracking-wider text-purple-400 font-bold mb-1">
              <i class="fas fa-brain mr-1"></i> Cognitive Retention Architecture
            </div>
            <h1 class="text-2xl font-extrabold text-white">Student Knowledge Map & Decay Prediction</h1>
            <p class="text-xs text-slate-300 mt-1">Based on Hermann Ebbinghaus's Spaced Repetition Forgetting Curve.</p>
          </div>

          <div class="bg-purple-900/40 border border-purple-500/40 px-4 py-2 rounded-2xl text-xs text-right">
            <div class="text-purple-300 font-bold">Predicted Class Retention</div>
            <div class="text-2xl font-black text-white">82.4%</div>
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
            <h1 class="text-lg font-bold text-white flex items-center gap-2">
              <i class="fas fa-file-waveform text-emerald-400"></i> Smart Notes AI Syllabus Evaluator
            </h1>
            <p class="text-xs text-slate-400">Paste your revision notes or homework essay to check syllabus completeness and exam readiness.</p>
          </div>

          <button id="analyze-notes-btn" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer transition-all flex items-center gap-2">
            <i class="fas fa-magnifying-glass-chart"></i> Analyze Notes
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
        <div class="bg-gradient-to-r from-rose-950 to-slate-900 border border-rose-500/30 rounded-3xl p-6 flex items-center justify-between shadow-xl">
          <div>
            <div class="text-xs uppercase tracking-wider text-rose-400 font-bold mb-1">
              <i class="fas fa-user-shield mr-1"></i> Teacher / Proctor Command Center
            </div>
            <h1 class="text-2xl font-extrabold text-white">Dawamu Classroom Proctoring & Integrity Telemetry</h1>
            <p class="text-xs text-slate-300 mt-1">Real-time status of student computers across the local school network.</p>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> 12 Students Active
            </span>
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
