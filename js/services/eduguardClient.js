/**
 * EduGuard Unified API Client & Offline Storage Adapter
 *
 * Connects the Dawamu OS renderer frontend directly to the genuine FastAPI
 * EduGuard backend running on port 8000, while providing authentic offline
 * evaluation, misconception diagnosis, local question banks, and sync queueing.
 */

const API_BASE = 'http://127.0.0.1:8000/api/v1';

// ─── AUTHENTIC LOCAL CURRICULUM QUESTION BANK FOR OFFLINE MODE ───────────────
export const LOCAL_QUESTION_BANK = [
  {
    id: 'q_alg_1',
    subject_id: 'mathematics',
    topic_id: 'algebraic_manipulation',
    difficulty: 'basic',
    learning_objective: 'Expand single brackets',
    question_text: 'Expand and simplify: 3(2x - 4)',
    options: [
      { id: 'opt_a1', text: '6x - 12', is_correct: true },
      { id: 'opt_a2', text: '6x - 4', is_correct: false, misconception_tag: 'partial_distribution', distractor_explanation: 'The 3 must multiply both terms inside the parentheses.' },
      { id: 'opt_a3', text: '5x - 7', is_correct: false, misconception_tag: 'additive_instead_of_multiplicative', distractor_explanation: '3 was added instead of multiplied.' },
      { id: 'opt_a4', text: '6x + 12', is_correct: false, misconception_tag: 'sign_error', distractor_explanation: 'Multiplying +3 by -4 results in -12, not +12.' }
    ],
    correct_answer: 'opt_a1',
    explanation: 'Distribute 3 to both terms: 3 * 2x = 6x and 3 * (-4) = -12, giving 6x - 12.',
    hint: 'Remember to multiply each term inside the bracket by the factor outside.'
  },
  {
    id: 'q_alg_2',
    subject_id: 'mathematics',
    topic_id: 'algebraic_manipulation',
    difficulty: 'medium',
    learning_objective: 'Expand binomial brackets',
    question_text: 'Expand and simplify: (x + 3)(x - 5)',
    options: [
      { id: 'opt_a2_1', text: 'x² - 2x - 15', is_correct: true },
      { id: 'opt_a2_2', text: 'x² + 2x - 15', is_correct: false, misconception_tag: 'middle_term_sign_error', distractor_explanation: '-5x + 3x = -2x, not +2x.' },
      { id: 'opt_a2_3', text: 'x² - 15', is_correct: false, misconception_tag: 'omitted_middle_terms', distractor_explanation: 'The outer and inner products (-5x and 3x) were omitted.' },
      { id: 'opt_a2_4', text: 'x² - 8x - 15', is_correct: false, misconception_tag: 'sign_addition_confusion', distractor_explanation: 'Added magnitudes without respecting opposite signs.' }
    ],
    correct_answer: 'opt_a2_1',
    explanation: 'FOIL: x*x = x², x*(-5) = -5x, 3*x = 3x, 3*(-5) = -15. Combining middle terms: -5x + 3x = -2x.',
    hint: 'Use FOIL: First, Outside, Inside, Last, then combine like terms.'
  },
  {
    id: 'q_fact_1',
    subject_id: 'mathematics',
    topic_id: 'factorisation',
    difficulty: 'basic',
    learning_objective: 'Factor quadratic trinomial with positive signs',
    question_text: 'Factorise completely: x² + 5x + 6',
    options: [
      { id: 'opt_f1_1', text: '(x + 2)(x + 3)', is_correct: true },
      { id: 'opt_f1_2', text: '(x + 1)(x + 6)', is_correct: false, misconception_tag: 'sum_vs_product', distractor_explanation: '1 and 6 multiply to 6, but add up to 7 rather than 5.' },
      { id: 'opt_f1_3', text: '(x - 2)(x - 3)', is_correct: false, misconception_tag: 'sign_reversal', distractor_explanation: 'Negative factors produce a negative middle term: -5x.' },
      { id: 'opt_f1_4', text: '(x + 5)(x + 1)', is_correct: false, misconception_tag: 'linear_coefficient_confusion', distractor_explanation: '5 and 1 multiply to 5, not 6.' }
    ],
    correct_answer: 'opt_f1_1',
    explanation: 'Find two numbers that multiply to +6 and add up to +5: 2 and 3. Thus (x + 2)(x + 3).',
    hint: 'Look for factor pairs of 6 that add up to 5.'
  },
  {
    id: 'q_fact_2',
    subject_id: 'mathematics',
    topic_id: 'factorisation',
    difficulty: 'medium',
    learning_objective: 'Factor quadratic trinomial with negative signs',
    question_text: 'Factorise: x² - 4x - 21',
    options: [
      { id: 'opt_f2_1', text: '(x - 7)(x + 3)', is_correct: true },
      { id: 'opt_f2_2', text: '(x + 7)(x - 3)', is_correct: false, misconception_tag: 'sign_inversion_on_factors', distractor_explanation: '+7 and -3 add up to +4, not -4.' },
      { id: 'opt_f2_3', text: '(x - 21)(x + 1)', is_correct: false, misconception_tag: 'incorrect_factor_pair', distractor_explanation: '-21 and 1 add up to -20, not -4.' },
      { id: 'opt_f2_4', text: '(x - 7)(x - 3)', is_correct: false, misconception_tag: 'constant_sign_error', distractor_explanation: '(-7)*(-3) = +21, but the constant is -21.' }
    ],
    correct_answer: 'opt_f2_1',
    explanation: 'Factors of -21 that add to -4 are -7 and +3: (x - 7)(x + 3).',
    hint: 'Since the constant is negative, the factors must have opposite signs.'
  },
  {
    id: 'q_quad_1',
    subject_id: 'mathematics',
    topic_id: 'quadratic_equations',
    difficulty: 'basic',
    learning_objective: 'Solve quadratic by factoring difference of two squares',
    question_text: 'Solve for x: x² - 9 = 0',
    options: [
      { id: 'opt_q1_1', text: 'x = 3 or x = -3', is_correct: true },
      { id: 'opt_q1_2', text: 'x = 3 only', is_correct: false, misconception_tag: 'omitted_negative_root', distractor_explanation: 'Remember that (-3)² is also +9.' },
      { id: 'opt_q1_3', text: 'x = 9 or x = -9', is_correct: false, misconception_tag: 'square_root_omission', distractor_explanation: 'Did not take the square root of 9.' },
      { id: 'opt_q1_4', text: 'x = 0 or x = 9', is_correct: false, misconception_tag: 'zero_root_assumption', distractor_explanation: 'x = 0 does not satisfy 0² - 9 = 0.' }
    ],
    correct_answer: 'opt_q1_1',
    explanation: 'Factor as difference of two squares: (x - 3)(x + 3) = 0, so x = 3 or x = -3.',
    hint: 'Recognize the difference of two squares: a² - b² = (a - b)(a + b).'
  },
  {
    id: 'q_quad_2',
    subject_id: 'mathematics',
    topic_id: 'quadratic_equations',
    difficulty: 'medium',
    learning_objective: 'Solve quadratic trinomial using zero-product property',
    question_text: 'Solve for x: x² - 7x + 12 = 0',
    options: [
      { id: 'opt_q2_1', text: 'x = 3 or x = 4', is_correct: true },
      { id: 'opt_q2_2', text: 'x = -3 or x = -4', is_correct: false, misconception_tag: 'zero_product_sign_reversal', distractor_explanation: 'If (x - 3)(x - 4) = 0, then x = +3 and x = +4.' },
      { id: 'opt_q2_3', text: 'x = 1 or x = 12', is_correct: false, misconception_tag: 'incorrect_factors', distractor_explanation: '1 and 12 add to 13, not 7.' },
      { id: 'opt_q2_4', text: 'x = 2 or x = 6', is_correct: false, misconception_tag: 'incorrect_factors', distractor_explanation: '2 and 6 add to 8, not 7.' }
    ],
    correct_answer: 'opt_q2_1',
    explanation: 'Factor into (x - 3)(x - 4) = 0. By the zero-product property, x = 3 or x = 4.',
    hint: 'Factor the trinomial first, then set each linear factor equal to zero.'
  },
  {
    id: 'q_bio_1',
    subject_id: 'biology',
    topic_id: 'cell_division',
    difficulty: 'basic',
    learning_objective: 'Identify primary outcome of mitosis',
    question_text: 'What is the primary genetic outcome of mitotic cell division?',
    options: [
      { id: 'opt_b1_1', text: 'Two genetically identical diploid daughter cells', is_correct: true },
      { id: 'opt_b1_2', text: 'Four genetically distinct haploid gametes', is_correct: false, misconception_tag: 'confused_mitosis_with_meiosis', distractor_explanation: 'Meiosis yields four haploid gametes; mitosis yields two diploid identical cells.' },
      { id: 'opt_b1_3', text: 'Two haploid cells with recombined chromatids', is_correct: false, misconception_tag: 'haploid_diploid_confusion', distractor_explanation: 'Mitosis maintains the diploid chromosome number.' },
      { id: 'opt_b1_4', text: 'One cell with doubled chromosome count', is_correct: false, misconception_tag: 'cytokinesis_failure_misconception', distractor_explanation: 'Cytokinesis divides the cytoplasm into two cells.' }
    ],
    correct_answer: 'opt_b1_1',
    explanation: 'Mitosis produces two genetically identical daughter cells with the same chromosome count as the parent cell.',
    hint: 'Remember that mitosis is used for body growth and repair, keeping identical DNA.'
  },
  {
    id: 'q_vec_1',
    subject_id: 'physics',
    topic_id: 'vectors',
    difficulty: 'basic',
    learning_objective: 'Calculate scalar magnitude of orthogonal vector components',
    question_text: 'A vector has components Ax = 6 m and Ay = 8 m. What is the magnitude of the vector?',
    options: [
      { id: 'opt_v1_1', text: '10 m', is_correct: true },
      { id: 'opt_v1_2', text: '14 m', is_correct: false, misconception_tag: 'scalar_addition_instead_of_pythagorean', distractor_explanation: 'Components must be combined via Pythagorean theorem, not simple addition.' },
      { id: 'opt_v1_3', text: '48 m', is_correct: false, misconception_tag: 'product_instead_of_magnitude', distractor_explanation: 'Multiplied the components instead of finding the square root of sum of squares.' },
      { id: 'opt_v1_4', text: '2 m', is_correct: false, misconception_tag: 'difference_misconception', distractor_explanation: 'Subtracted components instead of finding the vector hypotenuse.' }
    ],
    correct_answer: 'opt_v1_1',
    explanation: '|A| = √(Ax² + Ay²) = √(36 + 64) = √100 = 10 m.',
    hint: 'Apply the Pythagorean theorem to orthogonal vector components: R² = Rx² + Ry².'
  }
];

export class EduGuardClient {
  constructor(student = null) {
    this.student = student || {
      admNo: '1001',
      name: 'Brian Ochieng',
      grade: 'Form 1',
      token: 'token_student_1'
    };
    this.isOnline = navigator.onLine;
    this._token = this.student.token || `token_student_${this.student.admNo || '1'}`;
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this._token}`
    };
  }

  async _fetch(endpoint, options = {}, timeoutMs = 2500) {
    const url = `${API_BASE}${endpoint}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {})
        },
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  // 1. Health check
  async checkHealth() {
    try {
      const res = await fetch('http://127.0.0.1:8000/health', { signal: AbortSignal.timeout(1000) });
      return res.ok;
    } catch (_) {
      return false;
    }
  }

  // 2. Fetch authenticated profile
  async getMyProfile() {
    try {
      return await this._fetch('/auth/me');
    } catch (err) {
      return {
        uid: `student_${this.student.admNo}`,
        display_name: this.student.name,
        role: 'student',
        enrolled_subjects: ['mathematics', 'biology', 'chemistry', 'physics'],
        offline: true
      };
    }
  }

  // 3. Start a real diagnostic session
  async startDiagnostic(topicId = 'quadratic_equations', subjectId = 'mathematics') {
    try {
      const result = await this._fetch('/learning/diagnostics', {
        method: 'POST',
        body: JSON.stringify({ subject_id: subjectId, topic_id: topicId })
      });
      return result;
    } catch (err) {
      console.warn('EduGuard Backend unreachable, falling back to local curriculum session:', err);
      return this._getLocalDiagnosticFallback(topicId, subjectId);
    }
  }

  // 4. Submit an attempt for grading with idempotency key
  async submitAttempt(questionId, selectedOptionId, sessionId = null, responseTimeMs = 12000, topicId = null) {
    const idempotencyKey = `idemp_${this.student.admNo || '1001'}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    try {
      const result = await this._fetch('/learning/attempts', {
        method: 'POST',
        body: JSON.stringify({
          question_id: questionId,
          selected_option_id: selectedOptionId,
          session_id: sessionId,
          response_time_ms: responseTimeMs,
          idempotency_key: idempotencyKey
        })
      });

      // Cache attempt locally
      this._saveLocalAttempt(questionId, selectedOptionId, result, idempotencyKey, topicId);
      return result;
    } catch (err) {
      // Backend reachable but rejected the request (e.g. 404 unknown question): surface it,
      // do not silently re-grade locally or queue something the server will never accept.
      if (/^HTTP \d{3}/.test(err.message)) throw err;
      console.warn('EduGuard: backend unreachable, offline grading used:', err);
      const graded = this._gradeOfflineAttempt(questionId, selectedOptionId, idempotencyKey);
      this._enqueueOfflineAttempt({
        question_id: questionId,
        selected_option_id: selectedOptionId,
        session_id: sessionId,
        response_time_ms: responseTimeMs,
        idempotency_key: idempotencyKey,
        offline_result: graded
      });
      return graded;
    }
  }

  // 5. "Why am I struggling?" — backend first, otherwise derived ONLY from real local attempts
  async getWhyStruggling(topicId = 'quadratic_equations') {
    try {
      return await this._fetch(`/diagnosis/why-struggling/${topicId}`);
    } catch (err) {
      const topicAttempts = this.getLearningHistory().filter(h => h.topic_id === topicId);
      const topicName = topicId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      if (topicAttempts.length === 0) {
        return {
          topic_id: topicId,
          topic_name: topicName,
          topic_mastery: null,
          primary_cause: 'insufficient_data',
          prerequisite_gaps: [],
          misconceptions: [],
          recommended_action: 'Not enough data yet. Complete a diagnostic assessment first.',
          offline: true
        };
      }
      const correct = topicAttempts.filter(a => a.is_correct).length;
      const misconceptions = [...new Set(topicAttempts.map(a => a.diagnosed_misconception).filter(Boolean))];
      // Prerequisite gaps = prerequisite topics the student has actually attempted and scored < 60% on
      const prereqs = LOCAL_PREREQUISITES[topicId] || [];
      const prerequisite_gaps = prereqs.filter(p => {
        const pa = this.getLearningHistory().filter(h => h.topic_id === p);
        return pa.length > 0 && (pa.filter(a => a.is_correct).length / pa.length) < 0.6;
      });
      return {
        topic_id: topicId,
        topic_name: topicName,
        topic_mastery: Math.round((correct / topicAttempts.length) * 100),
        primary_cause: prerequisite_gaps.length ? 'prerequisite_gap' : (misconceptions.length ? 'misconception' : 'none_detected'),
        prerequisite_gaps,
        misconceptions,
        recommended_action: prerequisite_gaps.length
          ? `Practise ${prerequisite_gaps.join(', ').replace(/_/g, ' ')} before retesting this topic.`
          : (misconceptions.length ? `Review: ${misconceptions[0].replace(/_/g, ' ')}.` : 'Keep practising at a harder difficulty.'),
        offline: true
      };
    }
  }

  // 6. Next action — backend first, otherwise the weakest topic the student has actually attempted
  async getNextAction() {
    try {
      return await this._fetch('/learning/next-action');
    } catch (err) {
      const overview = this._computeLocalMastery().filter(t => t.attempts_count > 0);
      if (overview.length === 0) {
        return {
          actionType: 'START_DIAGNOSTIC',
          topicId: null,
          topicName: null,
          reason: 'No attempts recorded yet. Start a diagnostic assessment to find your learning gaps.',
          offline: true
        };
      }
      const weakest = overview.sort((a, b) => a.mastery_score - b.mastery_score)[0];
      return {
        actionType: weakest.mastery_score < 60 ? 'TARGETED_PRACTICE' : 'ADVANCE',
        topicId: weakest.topic_id,
        topicName: weakest.topic_name,
        reason: weakest.mastery_score < 60
          ? `${weakest.topic_name} is your weakest topic (${weakest.mastery_score}% over ${weakest.attempts_count} attempts).`
          : `All attempted topics are at or above 60%. Lowest: ${weakest.topic_name} (${weakest.mastery_score}%).`,
        offline: true
      };
    }
  }

  // 6b. AI tutor — real backend route is POST /api/v1/ai/tutor (TutorRequest schema)
  async askTutor(message) {
    const lower = message.toLowerCase();
    const topicId =
      /quadratic|roots|discriminant/.test(lower) ? 'quadratic_equations' :
      /factor/.test(lower) ? 'factorisation' :
      /expand|bracket|algebra/.test(lower) ? 'algebraic_manipulation' :
      /mitosis|meiosis|cell division/.test(lower) ? 'cell_division' :
      /vector/.test(lower) ? 'vectors' : 'general';
    const res = await this._fetch('/ai/tutor', {
      method: 'POST',
      body: JSON.stringify({ topic_id: topicId, mode: 'explain', user_message: message })
    }, 8000);
    const parts = [res.explanation];
    if (res.steps && res.steps.length) parts.push(res.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'));
    if (res.example) parts.push(`Example: ${res.example}`);
    if (res.check_question) parts.push(`Check yourself: ${res.check_question}`);
    if (res.is_fallback) parts.push('(EduGuard rule-based fallback answer — Gemini AI not configured)');
    return parts.filter(Boolean).join('\n\n');
  }

  // 7. Mastery overview — backend first, otherwise computed from real local attempts
  async getMasteryOverview() {
    try {
      return await this._fetch('/learning/overview');
    } catch (err) {
      return this._computeLocalMastery();
    }
  }

  _computeLocalMastery() {
    const history = this.getLearningHistory();
    return LOCAL_TOPICS.map(({ topic_id, topic_name, subject_id }) => {
      const attempts = history.filter(h => h.topic_id === topic_id);
      const count = attempts.length;
      const score = count > 0 ? Math.round((attempts.filter(a => a.is_correct).length / count) * 100) : 0;
      let category = 'NOT_ASSESSED';
      if (count > 0) category = score >= 80 ? 'MASTERED' : score >= 60 ? 'PROFICIENT' : score >= 40 ? 'DEVELOPING' : 'CRITICAL';
      return { topic_id, subject_id, topic_name, mastery_score: score, category, attempts_count: count };
    });
  }

  // 8. Learning history (local cache, scoped per student admission number)
  getLearningHistory() {
    try {
      return JSON.parse(localStorage.getItem(this._historyKey()) || '[]');
    } catch (_) {
      return [];
    }
  }

  // 9. Diagnostic session state (backend serves one question at a time)
  async getDiagnosticState(diagnosticId) {
    return await this._fetch(`/learning/diagnostics/${diagnosticId}`);
  }

  async completeDiagnostic(diagnosticId) {
    if (String(diagnosticId).startsWith('offline_')) return { offline: true };
    try {
      return await this._fetch(`/learning/diagnostics/${diagnosticId}/complete`, { method: 'POST' });
    } catch (_) {
      return { offline: true };
    }
  }

  // 10. Record a result that was graded locally against a known answer key
  //     (e.g. the built-in Exam Guard sample paper, which is not in the backend bank).
  //     Stored locally only; never queued for the backend because the backend cannot grade it.
  recordLocalResult({ questionId, topicId, isCorrect, misconception = null }) {
    this._saveLocalAttempt(questionId, null, {
      attempt_id: `att_local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      is_correct: !!isCorrect,
      diagnosed_misconception: misconception
    }, null, topicId);
  }

  // 11. Teacher roster — the EduGuard backend has no live roster endpoint, so this view can
  //     only show this computer's own session. We do NOT invent classmates.
  async getTeacherRoster() {
    return {
      is_simulated: false,
      is_local_only: true,
      notice: 'Live classroom roster requires a lab server, which is not implemented. Showing this computer only.',
      active_count: 1,
      students: [
        {
          admNo: this.student.admNo || '—',
          name: this.student.name || 'Student'
        }
      ]
    };
  }

  getPendingQueueCount() {
    try {
      return JSON.parse(localStorage.getItem(this._queueKey()) || '[]').length;
    } catch (_) {
      return 0;
    }
  }

  // ─── OFFLINE LOCAL STORAGE & SYNC ENGINE ───────────────────────────────────
  _historyKey() { return `eduguard_attempts_${this.student.admNo || 'guest'}`; }
  _queueKey() { return `eduguard_offline_queue_${this.student.admNo || 'guest'}`; }

  _saveLocalAttempt(questionId, selectedOptionId, result, idempotencyKey, topicIdOverride = null) {
    try {
      const existing = this.getLearningHistory();
      // Idempotency: never record the same submission twice
      if (idempotencyKey && existing.some(e => e.idempotency_key === idempotencyKey)) return;
      const q = LOCAL_QUESTION_BANK.find(item => item.id === questionId);
      existing.unshift({
        attempt_id: result.attempt_id,
        idempotency_key: idempotencyKey,
        question_id: questionId,
        topic_id: topicIdOverride || (q ? q.topic_id : 'general'),
        selected_option_id: selectedOptionId,
        is_correct: !!result.is_correct,
        diagnosed_misconception: result.diagnosed_misconception || null,
        created_at: new Date().toISOString()
      });
      localStorage.setItem(this._historyKey(), JSON.stringify(existing.slice(0, 200)));
    } catch (_) {}
  }

  _enqueueOfflineAttempt(attemptPayload) {
    try {
      const queue = JSON.parse(localStorage.getItem(this._queueKey()) || '[]');
      if (queue.some(q => q.idempotency_key === attemptPayload.idempotency_key)) return;
      queue.push(attemptPayload);
      localStorage.setItem(this._queueKey(), JSON.stringify(queue));
    } catch (_) {}
  }

  async syncOfflineQueue() {
    const isHealthy = await this.checkHealth();
    if (!isHealthy) return { synced: 0, pending: this.getPendingQueueCount(), message: 'Backend is offline — attempts remain queued.' };

    const queue = JSON.parse(localStorage.getItem(this._queueKey()) || '[]');
    if (queue.length === 0) return { synced: 0, pending: 0, message: 'Queue is empty.' };

    let syncedCount = 0;
    let rejected = 0;
    const remaining = [];

    for (const item of queue) {
      try {
        // Same idempotency key as the original offline submission, so the backend
        // will not double-count if a previous sync partially succeeded.
        await this._fetch('/learning/attempts', {
          method: 'POST',
          body: JSON.stringify({
            question_id: item.question_id,
            selected_option_id: item.selected_option_id,
            session_id: item.session_id && !String(item.session_id).startsWith('offline_') ? item.session_id : null,
            response_time_ms: item.response_time_ms,
            idempotency_key: item.idempotency_key
          })
        });
        syncedCount++;
      } catch (err) {
        // 4xx = permanently invalid (e.g. unknown question); drop instead of retrying forever
        if (/HTTP 4\d\d/.test(err.message)) rejected++;
        else remaining.push(item);
      }
    }

    localStorage.setItem(this._queueKey(), JSON.stringify(remaining));
    return {
      synced: syncedCount,
      rejected,
      pending: remaining.length,
      message: `Synced ${syncedCount}, rejected ${rejected}, still pending ${remaining.length}.`
    };
  }

  _getLocalDiagnosticFallback(topicId, subjectId) {
    // Questions for the chosen topic plus its prerequisites, from the same bank the backend uses
    const wanted = [...(LOCAL_PREREQUISITES[topicId] || []), topicId];
    let questions = LOCAL_QUESTION_BANK.filter(q => wanted.includes(q.topic_id));
    if (questions.length === 0) questions = LOCAL_QUESTION_BANK.filter(q => q.subject_id === subjectId);

    return {
      diagnostic_id: `offline_diag_${Date.now()}`,
      subject_id: subjectId,
      selected_topic_id: topicId,
      topic_name: topicId.replace(/_/g, ' '),
      status: 'in_progress',
      total_questions: questions.length,
      completed_count: 0,
      questions,
      current_question: questions[0] || null,
      offline: true
    };
  }

  _gradeOfflineAttempt(questionId, selectedOptionId, idempotencyKey) {
    const question = LOCAL_QUESTION_BANK.find(q => q.id === questionId);

    if (!question) {
      // We have no answer key for this question offline. Do NOT guess.
      return {
        attempt_id: null,
        idempotency_key: idempotencyKey,
        is_correct: null,
        ungraded: true,
        correct_option_id: null,
        explanation: 'This question cannot be graded offline. Your answer has been queued and will be graded when the EduGuard server is reachable.',
        diagnosed_misconception: null,
        hints_available: [],
        recommended_next_step: null,
        updated_topic_mastery: null,
        offline: true
      };
    }

    const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
    const isCorrect = !!selectedOption && selectedOptionId === question.correct_answer;
    const misconception = !isCorrect && selectedOption ? (selectedOption.misconception_tag || null) : null;
    const explanation = !isCorrect && selectedOption && selectedOption.distractor_explanation
      ? `${selectedOption.distractor_explanation} ${question.explanation}`
      : question.explanation;

    const result = {
      attempt_id: `att_offline_${Date.now()}`,
      idempotency_key: idempotencyKey,
      is_correct: isCorrect,
      correct_option_id: question.correct_answer,
      explanation,
      diagnosed_misconception: misconception,
      hints_available: question.hint ? [question.hint] : [],
      recommended_next_step: isCorrect ? 'Advance to a harder question.' : (misconception ? `Review concept: ${misconception.replace(/_/g, ' ')}` : 'Review prerequisite concepts.'),
      updated_topic_mastery: 0,
      offline: true
    };

    this._saveLocalAttempt(questionId, selectedOptionId, result, idempotencyKey);
    // Mastery = simple accuracy over all recorded attempts on this topic (including this one)
    const topicHistory = this.getLearningHistory().filter(h => h.topic_id === question.topic_id);
    result.updated_topic_mastery = Math.round((topicHistory.filter(h => h.is_correct).length / topicHistory.length) * 100);
    return result;
  }
}

// Topics shown in offline mastery views (only topics that the local bank can actually assess)
export const LOCAL_TOPICS = [
  { topic_id: 'algebraic_manipulation', topic_name: 'Algebraic Manipulation', subject_id: 'mathematics' },
  { topic_id: 'factorisation', topic_name: 'Factorisation', subject_id: 'mathematics' },
  { topic_id: 'quadratic_equations', topic_name: 'Quadratic Equations', subject_id: 'mathematics' },
  { topic_id: 'cell_division', topic_name: 'Cell Division', subject_id: 'biology' },
  { topic_id: 'vectors', topic_name: 'Vectors', subject_id: 'physics' }
];

// Mirrors EduGuard/backend/app/curriculum prerequisites for the locally assessable topics
export const LOCAL_PREREQUISITES = {
  factorisation: ['algebraic_manipulation'],
  quadratic_equations: ['algebraic_manipulation', 'factorisation']
};
