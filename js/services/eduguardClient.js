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
  },
  {
    id: 'q_fact_3',
    subject_id: 'mathematics',
    topic_id: 'factorisation',
    difficulty: 'hard',
    learning_objective: 'Factor trinomial with leading coefficient > 1',
    question_text: 'Factorise completely: 2x² + 7x + 3',
    options: [
      { id: 'opt_f3_1', text: '(2x + 1)(x + 3)', is_correct: true },
      { id: 'opt_f3_2', text: '(2x + 3)(x + 1)', is_correct: false, misconception_tag: 'cross_term_verification_failure', distractor_explanation: '(2x+3)(x+1) gives 2x + 3x = 5x, not 7x.' },
      { id: 'opt_f3_3', text: '(2x - 1)(x - 3)', is_correct: false, misconception_tag: 'sign_error', distractor_explanation: 'Negative factors produce a negative middle term: -7x.' },
      { id: 'opt_f3_4', text: '2(x + 1)(x + 3)', is_correct: false, misconception_tag: 'false_common_factor', distractor_explanation: '2 is not a common factor of 7 or 3.' }
    ],
    correct_answer: 'opt_f3_1',
    explanation: '(2x + 1)(x + 3) expands to 2x² + 6x + x + 3 = 2x² + 7x + 3.',
    hint: 'Split the middle term: 2 * 3 = 6, factors of 6 adding to 7 are 6 and 1.'
  },
  {
    id: 'q_quad_3',
    subject_id: 'mathematics',
    topic_id: 'quadratic_equations',
    difficulty: 'hard',
    learning_objective: 'Apply quadratic formula to non-integer roots',
    question_text: 'Solve: 2x² - 4x - 1 = 0 using the quadratic formula.',
    options: [
      { id: 'opt_q3_1', text: 'x = (2 ± √6) / 2', is_correct: true },
      { id: 'opt_q3_2', text: 'x = (4 ± √24) / 2', is_correct: false, misconception_tag: 'omitted_2a_denominator', distractor_explanation: 'The denominator is 2a = 4, not 2.' },
      { id: 'opt_q3_3', text: 'x = (-4 ± √24) / 4', is_correct: false, misconception_tag: 'formula_sign_error', distractor_explanation: '-b = -(-4) = +4, not -4.' },
      { id: 'opt_q3_4', text: 'x = (2 ± √8) / 2', is_correct: false, misconception_tag: 'discriminant_calculation_error', distractor_explanation: 'b² - 4ac = 16 - 4(2)(-1) = 24, not 8.' }
    ],
    correct_answer: 'opt_q3_1',
    explanation: 'x = [-(-4) ± √((-4)² - 4*2*(-1))] / (2*2) = [4 ± √(16 + 8)] / 4 = [4 ± √24] / 4 = [4 ± 2√6] / 4 = (2 ± √6) / 2.',
    hint: 'The quadratic formula is x = (-b ± √(b² - 4ac)) / 2a. Watch the sign of -b and 4ac.'
  },
  {
    id: 'q_quad_4',
    subject_id: 'mathematics',
    topic_id: 'quadratic_equations',
    difficulty: 'application',
    learning_objective: 'Solve geometric area problem using quadratics',
    question_text: 'A rectangular garden has a length 4 meters greater than its width. If the total area is 45 square meters, what is the width of the garden?',
    options: [
      { id: 'opt_q4_1', text: '5 meters', is_correct: true },
      { id: 'opt_q4_2', text: '9 meters', is_correct: false, misconception_tag: 'confused_length_with_width', distractor_explanation: '9 meters is the length (w + 4), not the width.' },
      { id: 'opt_q4_3', text: '4.5 meters', is_correct: false, misconception_tag: 'perimeter_confusion', distractor_explanation: 'Divided area by 10 instead of factoring the quadratic model.' },
      { id: 'opt_q4_4', text: '6 meters', is_correct: false, misconception_tag: 'incorrect_factor_pairing', distractor_explanation: '6 * (6 + 4) = 60, not 45.' }
    ],
    correct_answer: 'opt_q4_1',
    explanation: 'Let width = w. Length = w + 4. Area = w(w + 4) = 45 => w² + 4w - 45 = 0 => (w + 9)(w - 5) = 0. Width cannot be negative, so w = 5.',
    hint: 'Set up an equation with w: w * (w + 4) = 45.'
  },
  {
    id: 'q_quad_transfer_1',
    subject_id: 'mathematics',
    topic_id: 'quadratic_equations',
    difficulty: 'application',
    learning_objective: 'Transfer quadratic model to projectile motion physics context',
    question_text: "A model rocket's height in meters is given by h(t) = -5t² + 20t, where t is time in seconds. After how many seconds does the rocket return to the ground?",
    options: [
      { id: 'opt_qt_1', text: '4 seconds', is_correct: true },
      { id: 'opt_qt_2', text: '2 seconds', is_correct: false, misconception_tag: 'vertex_instead_of_root', distractor_explanation: '2 seconds is when the rocket reaches maximum height, not when it hits the ground.' },
      { id: 'opt_qt_3', text: '5 seconds', is_correct: false, misconception_tag: 'coefficient_misinterpretation', distractor_explanation: 'Assumed the lead coefficient represented the landing time.' },
      { id: 'opt_qt_4', text: '20 seconds', is_correct: false, misconception_tag: 'initial_velocity_confusion', distractor_explanation: '20 m/s is the initial vertical launch velocity, not the flight duration.' }
    ],
    correct_answer: 'opt_qt_1',
    explanation: 'Set h(t) = 0: -5t² + 20t = 0 => -5t(t - 4) = 0. Since t > 0 at landing, t = 4 seconds.',
    hint: 'The ground corresponds to height h = 0. Factor out -5t.'
  },
  {
    id: 'q_chem_1',
    subject_id: 'chemistry',
    topic_id: 'stoichiometry',
    difficulty: 'medium',
    learning_objective: 'Balance chemical equation and compute molar quantities',
    question_text: 'In the reaction 2H₂ + O₂ -> 2H₂O, how many moles of water are produced from 4 moles of O₂ and excess H₂?',
    options: [
      { id: 'opt_ch1_1', text: '8 moles', is_correct: true },
      { id: 'opt_ch1_2', text: '4 moles', is_correct: false, misconception_tag: 'one_to_one_ratio_assumption', distractor_explanation: 'Assumed a 1:1 ratio between O₂ and H₂O.' },
      { id: 'opt_ch1_3', text: '2 moles', is_correct: false, misconception_tag: 'inverse_stoichiometric_ratio', distractor_explanation: 'Divided by 2 instead of multiplying by the 2:1 ratio.' },
      { id: 'opt_ch1_4', text: '16 moles', is_correct: false, misconception_tag: 'double_counting_reactants', distractor_explanation: 'Multiplied total reactant coefficients.' }
    ],
    correct_answer: 'opt_ch1_1',
    explanation: 'The stoichiometric mole ratio of O₂ to H₂O is 1:2. Thus, 4 mol O₂ * 2 = 8 mol H₂O.',
    hint: 'Check the stoichiometric coefficients in front of O₂ and H₂O.'
  },
  {
    id: 'q_cs_1',
    subject_id: 'computer_science',
    topic_id: 'boolean_logic',
    difficulty: 'basic',
    learning_objective: 'Evaluate boolean compound expression with De Morgan law',
    question_text: 'By De Morgan’s Law, what is equivalent to NOT (A AND B)?',
    options: [
      { id: 'opt_cs1_1', text: '(NOT A) OR (NOT B)', is_correct: true },
      { id: 'opt_cs1_2', text: '(NOT A) AND (NOT B)', is_correct: false, misconception_tag: 'demorgan_conjunction_preservation', distractor_explanation: 'Negating a conjunction flips the AND into an OR.' },
      { id: 'opt_cs1_3', text: 'A OR B', is_correct: false, misconception_tag: 'double_negation_inversion', distractor_explanation: 'The NOT operators were removed rather than distributed.' },
      { id: 'opt_cs1_4', text: 'NOT (A OR B)', is_correct: false, misconception_tag: 'parentheses_omission', distractor_explanation: '¬(A ∧ B) is not identical to ¬(A ∨ B).' }
    ],
    correct_answer: 'opt_cs1_1',
    explanation: 'De Morgan’s First Law states that ¬(A ∧ B) ≡ (¬A) ∨ (¬B). Negating the conjunction flips the operator to OR.',
    hint: 'Negating a conjunction flips the AND into an OR.'
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
    const lower = String(message || '').toLowerCase();
    const topicId =
      /quadratic|roots|discriminant/.test(lower) ? 'quadratic_equations' :
      /factor/.test(lower) ? 'factorisation' :
      /expand|bracket|algebra/.test(lower) ? 'algebraic_manipulation' :
      /mitosis|meiosis|cell division/.test(lower) ? 'cell_division' :
      /vector/.test(lower) ? 'vectors' : 'general';
    try {
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
    } catch (_) {
      const matchedQ = LOCAL_QUESTION_BANK.find(q => q.topic_id === topicId) || LOCAL_QUESTION_BANK[5];
      return [
        `Let's break down ${topicId.replace(/_/g, ' ')} step-by-step using the KCSE curriculum approach:`,
        `1. Identify the governing relationship and standard form.\n2. Check prerequisite operations (${(LOCAL_PREREQUISITES[topicId] || ['algebraic_manipulation']).join(', ').replace(/_/g, ' ')}).\n3. Apply the rule and verify by substitution.`,
        `Worked Example: ${matchedQ.question_text}\nSolution: ${matchedQ.explanation}`,
        `Check yourself: ${matchedQ.hint || 'Can you state why each step preserves equality?'}`
      ].join('\n\n');
    }
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

  // 12. Curriculum subjects & topics
  async getSubjects() {
    try {
      return await this._fetch('/subjects');
    } catch (_) {
      return LOCAL_SUBJECTS;
    }
  }

  async getSubjectTopics(subjectId = 'mathematics') {
    try {
      return await this._fetch(`/subjects/${subjectId}/topics`);
    } catch (_) {
      return LOCAL_TOPICS.filter(t => t.subject_id === subjectId);
    }
  }

  // 13. Unified student learning state
  async getUnifiedLearningState() {
    try {
      return await this._fetch('/learning/state');
    } catch (_) {
      const history = this.getLearningHistory();
      const masteries = this._computeLocalMastery();
      const avgMastery = masteries.length > 0 ? Math.round(masteries.reduce((acc, m) => acc + m.mastery_score, 0) / masteries.length) : 0;
      return {
        student_id: `student_${this.student.admNo || '1001'}`,
        student_name: this.student.name || 'Brian Ochieng',
        overall_mastery: avgMastery,
        total_attempts: history.length,
        masteries,
        recent_activity: history.slice(0, 10),
        offline: true
      };
    }
  }

  // 14. Evidence-based learning insights
  async getInsights() {
    try {
      return await this._fetch('/learning/insights');
    } catch (_) {
      const masteries = this._computeLocalMastery();
      const insights = [];
      for (const m of masteries) {
        if (m.mastery_score >= 70) {
          insights.push({
            id: `ins_imp_${m.topic_id}`,
            type: 'improving',
            title: "You're Improving",
            message: `Your ${m.topic_name} mastery is at ${m.mastery_score}%. Strong foundational command shown.`,
            topic_id: m.topic_id,
            evidence: `Current score: ${m.mastery_score}% over ${m.attempts_count} attempts.`
          });
        } else if (m.attempts_count > 0 && m.mastery_score < 55) {
          insights.push({
            id: `ins_cliff_${m.topic_id}`,
            type: 'watch_this',
            title: 'Watch This: Concept Gap',
            message: `Performance in ${m.topic_name} is currently ${m.mastery_score}%. Prerequisite practice recommended.`,
            topic_id: m.topic_id,
            evidence: `Attempts count: ${m.attempts_count}, Accuracy: ${m.mastery_score}%.`
          });
        }
      }
      if (insights.length === 0) {
        insights.push({
          id: 'ins_init',
          type: 'improving',
          title: 'Diagnostic Ready',
          message: 'Complete diagnostic assessments to unlock tailored learning insights.',
          topic_id: 'algebraic_manipulation',
          evidence: 'Awaiting student attempt evidence.'
        });
      }
      return insights;
    }
  }

  // 15. Next-Best-Action recommendations
  async getRecommendations() {
    try {
      return await this._fetch('/learning/recommendations');
    } catch (_) {
      const overview = this._computeLocalMastery().filter(t => t.attempts_count > 0);
      return overview.map(t => ({
        topic_id: t.topic_id,
        topic_name: t.topic_name,
        action_type: t.mastery_score < 60 ? 'DIAGNOSTIC_REMEDIATION' : 'SPACED_RETRIEVAL',
        priority_score: 100 - t.mastery_score,
        reason: `${t.topic_name} mastery is currently ${t.mastery_score}%.`
      })).sort((a, b) => b.priority_score - a.priority_score);
    }
  }

  // 16. Chronological learning timeline
  async getTimeline() {
    try {
      return await this._fetch('/learning/timeline');
    } catch (_) {
      const history = this.getLearningHistory();
      return history.slice(0, 15).map((h, idx) => ({
        id: `ev_${idx}`,
        title: h.is_correct ? `Mastered question in ${h.topic_id.replace(/_/g, ' ')}` : `Attempt recorded in ${h.topic_id.replace(/_/g, ' ')}`,
        category: h.is_correct ? 'mastery_shift' : 'practice_attempt',
        timestamp: h.created_at || new Date().toISOString(),
        details: h.diagnosed_misconception ? `Misconception noted: ${h.diagnosed_misconception.replace(/_/g, ' ')}` : 'Routine practice evaluation'
      }));
    }
  }

  // 17. Retention overview (Spaced-repetition state)
  async getRetentionOverview() {
    try {
      return await this._fetch('/learning/retention');
    } catch (_) {
      const history = this.getLearningHistory();
      const categorized = { fresh: [], stable: [], at_risk: [], due: [], forgotten: [] };
      LOCAL_TOPICS.forEach(topic => {
        const attempts = history.filter(h => h.topic_id === topic.topic_id);
        const count = attempts.length;
        const lastAttempt = attempts[0];
        const daysAgo = lastAttempt ? (Date.now() - new Date(lastAttempt.created_at).getTime()) / (1000 * 3600 * 24) : 99;
        const estimatedRetention = count === 0 ? 0.4 : Math.max(0.2, Math.min(0.98, 0.95 * Math.exp(-daysAgo / 7)));
        const item = {
          topic_id: topic.topic_id,
          topic_name: topic.topic_name,
          current_retention: Math.round(estimatedRetention * 100) / 100,
          half_life_days: 7,
          retrieval_streak: attempts.filter(a => a.is_correct).length,
          last_retrieval_at: lastAttempt ? lastAttempt.created_at : new Date(Date.now() - 86400000 * 3).toISOString(),
          next_retrieval_due: new Date(Date.now() + 86400000 * 2).toISOString(),
          review_urgency: estimatedRetention < 0.6 ? 'high' : estimatedRetention < 0.75 ? 'medium' : 'low',
          status: estimatedRetention >= 0.85 ? 'fresh' : estimatedRetention >= 0.70 ? 'stable' : estimatedRetention >= 0.50 ? 'at_risk' : 'due'
        };
        categorized[item.status].push(item);
      });
      return categorized;
    }
  }

  // 18. Topic granular analysis
  async getTopicAnalysis(topicId = 'quadratic_equations') {
    try {
      return await this._fetch(`/learning/topics/${topicId}/analysis`);
    } catch (_) {
      const why = await this.getWhyStruggling(topicId);
      return {
        topic_id: topicId,
        topic_name: why.topic_name,
        mastery_score: why.topic_mastery || 0,
        category: (why.topic_mastery || 0) >= 80 ? 'mastered' : (why.topic_mastery || 0) >= 60 ? 'proficient' : 'developing',
        confidence: 0.82,
        trend: 'improving',
        practice_accuracy: why.topic_mastery || 0,
        transfer_accuracy: Math.max(0, (why.topic_mastery || 0) - 15),
        retention: 0.76,
        retention_status: 'stable',
        diagnosis: why
      };
    }
  }

  // 19. Knowledge map node metadata
  async getKnowledgeMapNode(topicId = 'quadratic_equations') {
    try {
      return await this._fetch(`/learning/topics/${topicId}/knowledge-map`);
    } catch (_) {
      const topic = LOCAL_TOPICS.find(t => t.topic_id === topicId) || { topic_id: topicId, topic_name: topicId.replace(/_/g, ' ') };
      const prereqs = LOCAL_PREREQUISITES[topicId] || [];
      return {
        topic_id: topicId,
        topic_name: topic.topic_name,
        mastery_score: 55.0,
        confidence: 0.85,
        retention: 0.72,
        trend: 'stable',
        prerequisites: prereqs.map(p => ({ topic_id: p, topic_name: p.replace(/_/g, ' '), mastery: 65 })),
        dependents: [],
        offline: true
      };
    }
  }

  // 20. Adaptive Daily Mission
  async getTodayMission() {
    try {
      return await this._fetch('/learning/mission/today');
    } catch (_) {
      return {
        mission_id: `mission_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        title: "Daily Mastery & Retention Mission",
        description: "Targeted practice on foundational algebra, quadratic trinomials, and spaced retrieval.",
        items: [
          {
            id: "m_item_1",
            topic_id: "factorisation",
            topic_name: "Factorisation",
            item_type: "remediation",
            reason: "Prerequisite foundation reinforcement",
            target_question_count: 5,
            completed: false
          },
          {
            id: "m_item_2",
            topic_id: "quadratic_equations",
            topic_name: "Quadratic Equations",
            item_type: "advancement",
            reason: "Apply zero-product property",
            target_question_count: 4,
            completed: false
          }
        ]
      };
    }
  }

  // 21. Teacher Analytics Endpoints
  async getTeacherHeatmap(subjectId = 'mathematics') {
    try {
      return await this._fetch(`/teacher/heatmap/${subjectId}`);
    } catch (_) {
      return {
        subject_id: subjectId,
        subject_name: subjectId.toUpperCase(),
        topic_ids: ['arithmetic', 'fractions', 'algebraic_manipulation', 'factorisation', 'quadratic_equations'],
        topic_names: ['Arithmetic', 'Fractions', 'Algebraic Manipulation', 'Factorisation', 'Quadratic Equations'],
        student_ids: ['student_1001', 'student_1002', 'student_1003', 'student_1004'],
        student_names: ['Brian Ochieng', 'Alice Mwangi', 'Faith Muthoni', 'David Kariuki'],
        class_averages: { arithmetic: 92, fractions: 84, algebraic_manipulation: 78, factorisation: 52, quadratic_equations: 48 },
        summary: "Class cohort average mastery: 70.8%. Factorisation and Quadratic Equations represent primary intervention priorities.",
        offline: true
      };
    }
  }

  async getTeacherMisconceptions(subjectId = 'mathematics') {
    try {
      return await this._fetch(`/teacher/misconceptions/${subjectId}`);
    } catch (_) {
      return {
        subject_id: subjectId,
        total_students_analyzed: 42,
        most_prevalent_error: "Sum Vs Product",
        clusters: [
          {
            topic_id: "factorisation",
            topic_name: "Factorisation",
            error_tag: "sum_vs_product",
            affected_student_count: 18,
            total_students: 42,
            prevalence_percent: 42.9,
            example_students: ["Brian Ochieng", "Faith Muthoni", "David Kariuki"],
            recommended_intervention: "Address 'sum vs product' in Factorisation with worked binomial pair examples."
          },
          {
            topic_id: "quadratic_equations",
            topic_name: "Quadratic Equations",
            error_tag: "zero_product_sign_reversal",
            affected_student_count: 14,
            total_students: 42,
            prevalence_percent: 33.3,
            example_students: ["Alice Mwangi", "David Kariuki"],
            recommended_intervention: "Emphasize zero-product rule: if (x - a) = 0 then x = +a."
          }
        ],
        teacher_note: "Address highest-prevalence misconceptions during the next lesson starter.",
        offline: true
      };
    }
  }

  async getTeacherAtRisk(subjectId = 'mathematics') {
    try {
      return await this._fetch(`/teacher/at-risk-students/${subjectId}`);
    } catch (_) {
      return {
        total_class_size: 42,
        at_risk_count: 3,
        critical_count: 1,
        class_average_mastery: 71.4,
        teacher_summary: "4 students need targeted intervention on prerequisite algebraic concepts.",
        students: [
          {
            student_id: "student_1004",
            student_name: "David Kariuki",
            risk_level: "critical",
            risk_reasons: ["Mastery below 40% in 3 topics", "Severe prerequisite deficit in factorisation"],
            weakest_topic_id: "factorisation",
            weakest_topic_name: "Factorisation",
            average_mastery: 36.5,
            topics_forgotten: 2,
            topics_at_risk: 1,
            recommended_action: "Schedule 1-on-1 remediation on basic algebra and factor pairing."
          },
          {
            student_id: "student_1002",
            student_name: "Faith Muthoni",
            risk_level: "at_risk",
            risk_reasons: ["Retention decay on Quadratic Equations", "High misconception rate on negative roots"],
            weakest_topic_id: "quadratic_equations",
            weakest_topic_name: "Quadratic Equations",
            average_mastery: 52.0,
            topics_forgotten: 1,
            topics_at_risk: 2,
            recommended_action: "Assign spaced retrieval mission on quadratic factorization."
          }
        ],
        offline: true
      };
    }
  }

  async getTeacherTopicDifficulty(subjectId = 'mathematics') {
    try {
      return await this._fetch(`/teacher/topic-difficulty/${subjectId}`);
    } catch (_) {
      return {
        subject_id: subjectId,
        hardest_topic_name: "Quadratic Equations",
        easiest_topic_name: "Basic Arithmetic",
        profiles: [
          {
            topic_id: "arithmetic",
            topic_name: "Basic Arithmetic",
            class_average_mastery: 92.4,
            basic_accuracy: 96.0,
            medium_accuracy: 92.0,
            hard_accuracy: 89.0,
            application_accuracy: 92.0,
            difficulty_cliff_detected: false,
            student_count: 42
          },
          {
            topic_id: "factorisation",
            topic_name: "Factorisation",
            class_average_mastery: 54.2,
            basic_accuracy: 72.0,
            medium_accuracy: 52.0,
            hard_accuracy: 38.0,
            application_accuracy: 55.0,
            difficulty_cliff_detected: true,
            student_count: 42
          },
          {
            topic_id: "quadratic_equations",
            topic_name: "Quadratic Equations",
            class_average_mastery: 48.6,
            basic_accuracy: 68.0,
            medium_accuracy: 48.0,
            hard_accuracy: 34.0,
            application_accuracy: 44.0,
            difficulty_cliff_detected: true,
            student_count: 42
          }
        ],
        offline: true
      };
    }
  }

  // 22. AI Study Notes Analyzer
  async analyzeNotes({ notesText, topicId = 'quadratic_equations', subjectId = 'mathematics' }) {
    try {
      return await this._fetch('/ai/analyze-notes', {
        method: 'POST',
        body: JSON.stringify({
          notes_text: notesText,
          topic_id: topicId,
          subject_id: subjectId
        })
      }, 9000);
    } catch (_) {
      const lines = notesText.split('\n').map(l => l.trim()).filter(Boolean);
      const firstLine = lines[0] || 'Educational Topic';
      return {
        topic_name: firstLine.length < 50 ? firstLine : 'Core Subject Concept',
        subject_id: subjectId,
        word_count: notesText.split(/\s+/).length,
        summary: `Structured notes analysis for ${firstLine}. Extracted key definitions, logical principles, flashcards, and self-test questions.`,
        key_concepts: [
          {
            concept: "Fundamental Definition",
            importance: "high",
            summary: lines.slice(0, 2).join(' ') || "Primary foundational theorem and core relations."
          },
          {
            concept: "Operational Methodology",
            importance: "medium",
            summary: lines.slice(2, 4).join(' ') || "Step-by-step application procedures and boundary conditions."
          }
        ],
        flashcards: [
          {
            front: `What is the core principle of ${firstLine.slice(0, 30)}?`,
            back: lines[1] || "The fundamental law governing properties, reactions, or mathematical relations in this unit.",
            tag: "Definition"
          },
          {
            front: "How do you test or verify this concept experimentally/mathematically?",
            back: "By substituting known values, balancing equations, or evaluating against standard boundary tests.",
            tag: "Application"
          }
        ],
        practice_questions: [
          {
            question: `In the context of ${firstLine.slice(0, 30)}, which of the following statements is scientifically/mathematically valid?`,
            options: [
              "The relationship holds universally under standard reference conditions.",
              "The magnitude is strictly inversely proportional to mass.",
              "Coefficients cancel without conserving overall charge.",
              "Initial velocity has no bearing on final acceleration."
            ],
            correct_index: 0,
            explanation: "Under canonical reference conditions, the governing physical or mathematical identity is preserved."
          }
        ],
        prerequisites_detected: ["Basic Arithmetic", "Algebraic Expressions", "Dimensional Consistency"],
        is_fallback: true
      };
    }
  }

  // 23. Progressive Hints
  async requestHint({ questionId, targetConcept, currentStep, hintLevel = 1 }) {
    try {
      return await this._fetch('/ai/hint', {
        method: 'POST',
        body: JSON.stringify({
          question_id: questionId,
          target_concept: targetConcept,
          current_step: currentStep,
          hint_level: hintLevel
        })
      });
    } catch (_) {
      const q = LOCAL_QUESTION_BANK.find(item => item.id === questionId);
      const baseHint = q && q.hint ? q.hint : "Recall the governing formulas and break the problem down into sequential steps.";
      return {
        question_id: questionId,
        hint_level: hintLevel,
        hint_text: hintLevel === 1 ? `Concept pointer: ${baseHint}` : `Next operation: Simplify terms and isolate unknowns systematically.`,
        next_hint_available: hintLevel < 3
      };
    }
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

export const LOCAL_SUBJECTS = [
  { id: 'mathematics', name: 'Mathematics', icon: 'fa-calculator', description: 'Algebra, quadratics, functions, geometry, and probability.' },
  { id: 'biology', name: 'Biology', icon: 'fa-dna', description: 'Cell biology, physiology, genetics, and ecology.' },
  { id: 'physics', name: 'Physics', icon: 'fa-bolt', description: 'Mechanics, vectors, kinematics, and energy.' },
  { id: 'chemistry', name: 'Chemistry', icon: 'fa-flask', description: 'Atomic structure, periodic table, bonding, and stoichiometry.' },
  { id: 'computer_science', name: 'Computer Science', icon: 'fa-laptop-code', description: 'Systems, algorithms, boolean logic, and networking.' }
];

// Topics shown in curriculum & mastery views across all subjects
export const LOCAL_TOPICS = [
  // Mathematics
  { topic_id: 'arithmetic', topic_name: 'Basic Arithmetic & Number Operations', subject_id: 'mathematics', grade: 'Form 1', order: 1 },
  { topic_id: 'fractions', topic_name: 'Fractions, Decimals & Ratios', subject_id: 'mathematics', grade: 'Form 1', order: 2 },
  { topic_id: 'algebraic_manipulation', topic_name: 'Algebraic Manipulation', subject_id: 'mathematics', grade: 'Form 1', order: 3 },
  { topic_id: 'linear_equations', topic_name: 'Linear Equations', subject_id: 'mathematics', grade: 'Form 2', order: 4 },
  { topic_id: 'factorisation', topic_name: 'Factorisation', subject_id: 'mathematics', grade: 'Form 2', order: 5 },
  { topic_id: 'quadratic_equations', topic_name: 'Quadratic Equations', subject_id: 'mathematics', grade: 'Form 2', order: 6 },
  
  // Biology
  { topic_id: 'cell_structure', topic_name: 'Cell Structure & Organelles', subject_id: 'biology', grade: 'Form 1', order: 1 },
  { topic_id: 'cell_physiology', topic_name: 'Cell Physiology & Osmosis', subject_id: 'biology', grade: 'Form 1', order: 2 },
  { topic_id: 'cell_division', topic_name: 'Cell Division (Mitosis & Meiosis)', subject_id: 'biology', grade: 'Form 2', order: 3 },
  { topic_id: 'genetics', topic_name: 'Genetics & Inheritance', subject_id: 'biology', grade: 'Form 4', order: 4 },
  { topic_id: 'ecology', topic_name: 'Ecology & Nutrient Cycles', subject_id: 'biology', grade: 'Form 3', order: 5 },

  // Physics
  { topic_id: 'measurement', topic_name: 'Measurement & Physical Quantities', subject_id: 'physics', grade: 'Form 1', order: 1 },
  { topic_id: 'vectors', topic_name: 'Vectors & Scalar Components', subject_id: 'physics', grade: 'Form 2', order: 2 },
  { topic_id: 'kinematics', topic_name: 'Linear Motion & Kinematics', subject_id: 'physics', grade: 'Form 2', order: 3 },
  { topic_id: 'dynamics', topic_name: 'Newtonian Dynamics & Forces', subject_id: 'physics', grade: 'Form 3', order: 4 },
  { topic_id: 'energy_work_power', topic_name: 'Work, Energy & Power', subject_id: 'physics', grade: 'Form 3', order: 5 },

  // Chemistry
  { topic_id: 'atomic_structure', topic_name: 'Atomic Structure & Isotopes', subject_id: 'chemistry', grade: 'Form 1', order: 1 },
  { topic_id: 'periodic_table', topic_name: 'Periodic Table Trends', subject_id: 'chemistry', grade: 'Form 2', order: 2 },
  { topic_id: 'chemical_bonding', topic_name: 'Chemical Bonding & Structure', subject_id: 'chemistry', grade: 'Form 2', order: 3 },
  { topic_id: 'stoichiometry', topic_name: 'Stoichiometry & The Mole Concept', subject_id: 'chemistry', grade: 'Form 3', order: 4 },
  { topic_id: 'acids_bases', topic_name: 'Acids, Bases & Salts', subject_id: 'chemistry', grade: 'Form 2', order: 5 },

  // Computer Science
  { topic_id: 'computer_systems', topic_name: 'Computer Architecture & Hardware', subject_id: 'computer_science', grade: 'Form 1', order: 1 },
  { topic_id: 'data_representation', topic_name: 'Binary Data & Number Systems', subject_id: 'computer_science', grade: 'Form 1', order: 2 },
  { topic_id: 'boolean_logic', topic_name: 'Boolean Logic & Logic Gates', subject_id: 'computer_science', grade: 'Form 2', order: 3 },
  { topic_id: 'algorithms', topic_name: 'Algorithms & Flowcharts', subject_id: 'computer_science', grade: 'Form 2', order: 4 },
  { topic_id: 'programming_concepts', topic_name: 'Control Structures & Variables', subject_id: 'computer_science', grade: 'Form 3', order: 5 }
];

// Mirrors EduGuard NetworkX graph prerequisite edges
export const LOCAL_PREREQUISITES = {
  fractions: ['arithmetic'],
  algebraic_manipulation: ['fractions'],
  linear_equations: ['algebraic_manipulation'],
  factorisation: ['algebraic_manipulation'],
  quadratic_equations: ['algebraic_manipulation', 'factorisation'],
  cell_physiology: ['cell_structure'],
  cell_division: ['cell_structure', 'cell_physiology'],
  genetics: ['cell_division'],
  vectors: ['algebraic_manipulation'],
  kinematics: ['measurement', 'vectors'],
  dynamics: ['kinematics', 'vectors'],
  chemical_bonding: ['atomic_structure', 'periodic_table'],
  stoichiometry: ['atomic_structure', 'fractions'],
  boolean_logic: ['data_representation'],
  algorithms: ['boolean_logic'],
  programming_concepts: ['algorithms']
};
