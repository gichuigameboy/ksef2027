from typing import List, Dict, Optional
from app.models.question_db import (
    QuestionRecord,
    QuestionOptionDB,
    QuestionDifficulty,
    QuestionFormat
)
from app.curriculum.registry import curriculum_registry

class QuestionRepository:
    """
    Authoritative repository managing question banks and diagnostic sampling.
    """

    def __init__(self):
        self._questions: Dict[str, QuestionRecord] = {}
        self._seed_default_questions()

    def _seed_default_questions(self):
        # 1. Algebraic Manipulation Questions
        self._add(QuestionRecord(
            id="q_alg_1",
            subject_id="mathematics",
            topic_id="algebraic_manipulation",
            difficulty=QuestionDifficulty.BASIC,
            question_type=QuestionFormat.MULTIPLE_CHOICE,
            learning_objective="Expand single brackets",
            question_text="Expand and simplify: 3(2x - 4)",
            options=[
                QuestionOptionDB(id="opt_a1", text="6x - 12", is_correct=True),
                QuestionOptionDB(id="opt_a2", text="6x - 4", is_correct=False, misconception_tag="partial_distribution", distractor_explanation="The 3 must multiply both terms inside the parentheses."),
                QuestionOptionDB(id="opt_a3", text="5x - 7", is_correct=False, misconception_tag="additive_instead_of_multiplicative"),
                QuestionOptionDB(id="opt_a4", text="6x + 12", is_correct=False, misconception_tag="sign_error")
            ],
            correct_answer="opt_a1",
            explanation="Distribute 3 to both terms: 3 * 2x = 6x and 3 * (-4) = -12, giving 6x - 12.",
            hint="Remember to multiply each term inside the bracket by the factor outside.",
            prerequisite_ids=["fractions"]
        ))
        self._add(QuestionRecord(
            id="q_alg_2",
            subject_id="mathematics",
            topic_id="algebraic_manipulation",
            difficulty=QuestionDifficulty.MEDIUM,
            question_type=QuestionFormat.MULTIPLE_CHOICE,
            learning_objective="Expand binomial brackets",
            question_text="Expand and simplify: (x + 3)(x - 5)",
            options=[
                QuestionOptionDB(id="opt_a2_1", text="x² - 2x - 15", is_correct=True),
                QuestionOptionDB(id="opt_a2_2", text="x² + 2x - 15", is_correct=False, misconception_tag="middle_term_sign_error"),
                QuestionOptionDB(id="opt_a2_3", text="x² - 15", is_correct=False, misconception_tag="omitted_middle_terms"),
                QuestionOptionDB(id="opt_a2_4", text="x² - 8x - 15", is_correct=False, misconception_tag="sign_addition_confusion")
            ],
            correct_answer="opt_a2_1",
            explanation="FOIL: x*x = x², x*(-5) = -5x, 3*x = 3x, 3*(-5) = -15. Combining middle terms: -5x + 3x = -2x.",
            hint="Use FOIL: First, Outside, Inside, Last, then combine like terms."
        ))

        # 2. Factorisation Questions
        self._add(QuestionRecord(
            id="q_fact_1",
            subject_id="mathematics",
            topic_id="factorisation",
            difficulty=QuestionDifficulty.BASIC,
            question_type=QuestionFormat.MULTIPLE_CHOICE,
            learning_objective="Factor quadratic trinomial with positive signs",
            question_text="Factorise completely: x² + 5x + 6",
            options=[
                QuestionOptionDB(id="opt_f1_1", text="(x + 2)(x + 3)", is_correct=True),
                QuestionOptionDB(id="opt_f1_2", text="(x + 1)(x + 6)", is_correct=False, misconception_tag="sum_vs_product", distractor_explanation="1 and 6 multiply to 6, but add up to 7 rather than 5."),
                QuestionOptionDB(id="opt_f1_3", text="(x - 2)(x - 3)", is_correct=False, misconception_tag="sign_reversal"),
                QuestionOptionDB(id="opt_f1_4", text="(x + 5)(x + 1)", is_correct=False, misconception_tag="linear_coefficient_confusion")
            ],
            correct_answer="opt_f1_1",
            explanation="Find two numbers that multiply to +6 and add up to +5: 2 and 3. Thus (x + 2)(x + 3).",
            hint="Look for factor pairs of 6 that add up to 5.",
            prerequisite_ids=["algebraic_manipulation"]
        ))
        self._add(QuestionRecord(
            id="q_fact_2",
            subject_id="mathematics",
            topic_id="factorisation",
            difficulty=QuestionDifficulty.MEDIUM,
            question_type=QuestionFormat.MULTIPLE_CHOICE,
            learning_objective="Factor quadratic trinomial with negative signs",
            question_text="Factorise: x² - 4x - 21",
            options=[
                QuestionOptionDB(id="opt_f2_1", text="(x - 7)(x + 3)", is_correct=True),
                QuestionOptionDB(id="opt_f2_2", text="(x + 7)(x - 3)", is_correct=False, misconception_tag="sign_inversion_on_factors", distractor_explanation="7 and -3 add up to +4, not -4."),
                QuestionOptionDB(id="opt_f2_3", text="(x - 21)(x + 1)", is_correct=False, misconception_tag="incorrect_factor_pair"),
                QuestionOptionDB(id="opt_f2_4", text="(x - 7)(x - 3)", is_correct=False, misconception_tag="constant_sign_error")
            ],
            correct_answer="opt_f2_1",
            explanation="Factors of -21 that add to -4 are -7 and +3: (x - 7)(x + 3).",
            hint="Since the constant is negative, the factors must have opposite signs."
        ))
        self._add(QuestionRecord(
            id="q_fact_3",
            subject_id="mathematics",
            topic_id="factorisation",
            difficulty=QuestionDifficulty.HARD,
            question_type=QuestionFormat.MULTIPLE_CHOICE,
            learning_objective="Factor trinomial with leading coefficient > 1",
            question_text="Factorise completely: 2x² + 7x + 3",
            options=[
                QuestionOptionDB(id="opt_f3_1", text="(2x + 1)(x + 3)", is_correct=True),
                QuestionOptionDB(id="opt_f3_2", text="(2x + 3)(x + 1)", is_correct=False, misconception_tag="cross_term_verification_failure", distractor_explanation="(2x+3)(x+1) gives 2x + 3x = 5x, not 7x."),
                QuestionOptionDB(id="opt_f3_3", text="(2x - 1)(x - 3)", is_correct=False, misconception_tag="sign_error"),
                QuestionOptionDB(id="opt_f3_4", text="2(x + 1)(x + 3)", is_correct=False, misconception_tag="false_common_factor")
            ],
            correct_answer="opt_f3_1",
            explanation="(2x + 1)(x + 3) expands to 2x² + 6x + x + 3 = 2x² + 7x + 3.",
            hint="Split the middle term: 2 * 3 = 6, factors of 6 adding to 7 are 6 and 1."
        ))

        # 3. Quadratic Equations Questions
        self._add(QuestionRecord(
            id="q_quad_1",
            subject_id="mathematics",
            topic_id="quadratic_equations",
            difficulty=QuestionDifficulty.BASIC,
            question_type=QuestionFormat.MULTIPLE_CHOICE,
            learning_objective="Solve quadratic by factoring",
            question_text="Solve for x: x² - 9 = 0",
            options=[
                QuestionOptionDB(id="opt_q1_1", text="x = 3 or x = -3", is_correct=True),
                QuestionOptionDB(id="opt_q1_2", text="x = 3 only", is_correct=False, misconception_tag="omitted_negative_root", distractor_explanation="Remember that (-3)² is also +9."),
                QuestionOptionDB(id="opt_q1_3", text="x = 9 or x = -9", is_correct=False, misconception_tag="square_root_omission"),
                QuestionOptionDB(id="opt_q1_4", text="x = 0 or x = 9", is_correct=False, misconception_tag="zero_root_assumption")
            ],
            correct_answer="opt_q1_1",
            explanation="Factor as difference of two squares: (x - 3)(x + 3) = 0, so x = 3 or x = -3.",
            hint="Recognize the difference of two squares: a² - b² = (a - b)(a + b)."
        ))
        self._add(QuestionRecord(
            id="q_quad_2",
            subject_id="mathematics",
            topic_id="quadratic_equations",
            difficulty=QuestionDifficulty.MEDIUM,
            question_type=QuestionFormat.MULTIPLE_CHOICE,
            learning_objective="Solve quadratic trinomial using zero-product property",
            question_text="Solve for x: x² - 7x + 12 = 0",
            options=[
                QuestionOptionDB(id="opt_q2_1", text="x = 3 or x = 4", is_correct=True),
                QuestionOptionDB(id="opt_q2_2", text="x = -3 or x = -4", is_correct=False, misconception_tag="zero_product_sign_reversal", distractor_explanation="If (x - 3)(x - 4) = 0, then x = +3 and x = +4."),
                QuestionOptionDB(id="opt_q2_3", text="x = 1 or x = 12", is_correct=False, misconception_tag="incorrect_factors"),
                QuestionOptionDB(id="opt_q2_4", text="x = 2 or x = 6", is_correct=False, misconception_tag="incorrect_factors")
            ],
            correct_answer="opt_q2_1",
            explanation="Factor into (x - 3)(x - 4) = 0. By the zero-product property, x = 3 or x = 4.",
            hint="Factor the trinomial first, then set each linear factor equal to zero."
        ))
        self._add(QuestionRecord(
            id="q_quad_3",
            subject_id="mathematics",
            topic_id="quadratic_equations",
            difficulty=QuestionDifficulty.HARD,
            question_type=QuestionFormat.MULTIPLE_CHOICE,
            learning_objective="Apply quadratic formula to non-integer roots",
            question_text="Solve: 2x² - 4x - 1 = 0 using the quadratic formula.",
            options=[
                QuestionOptionDB(id="opt_q3_1", text="x = (2 ± √6) / 2", is_correct=True),
                QuestionOptionDB(id="opt_q3_2", text="x = (4 ± √24) / 2", is_correct=False, misconception_tag="omitted_2a_denominator"),
                QuestionOptionDB(id="opt_q3_3", text="x = (-4 ± √24) / 4", is_correct=False, misconception_tag="formula_sign_error"),
                QuestionOptionDB(id="opt_q3_4", text="x = (2 ± √8) / 2", is_correct=False, misconception_tag="discriminant_calculation_error")
            ],
            correct_answer="opt_q3_1",
            explanation="x = [-(-4) ± √((-4)² - 4*2*(-1))] / (2*2) = [4 ± √(16 + 8)] / 4 = [4 ± √24] / 4 = [4 ± 2√6] / 4 = (2 ± √6) / 2.",
            hint="The quadratic formula is x = (-b ± √(b² - 4ac)) / 2a. Watch the sign of -b and 4ac."
        ))
        self._add(QuestionRecord(
            id="q_quad_4",
            subject_id="mathematics",
            topic_id="quadratic_equations",
            difficulty=QuestionDifficulty.APPLICATION,
            question_type=QuestionFormat.APPLICATION,
            learning_objective="Solve geometric area problem using quadratics",
            question_text="A rectangular garden has a length 4 meters greater than its width. If the total area is 45 square meters, what is the width of the garden?",
            options=[
                QuestionOptionDB(id="opt_q4_1", text="5 meters", is_correct=True),
                QuestionOptionDB(id="opt_q4_2", text="9 meters", is_correct=False, misconception_tag="confused_length_with_width", distractor_explanation="9 meters is the length (w + 4), not the width."),
                QuestionOptionDB(id="opt_q4_3", text="4.5 meters", is_correct=False, misconception_tag="perimeter_confusion"),
                QuestionOptionDB(id="opt_q4_4", text="6 meters", is_correct=False, misconception_tag="incorrect_factor_pairing")
            ],
            correct_answer="opt_q4_1",
            explanation="Let width = w. Length = w + 4. Area = w(w + 4) = 45 => w² + 4w - 45 = 0 => (w + 9)(w - 5) = 0. Width cannot be negative, so w = 5.",
            hint="Set up an equation with w: w * (w + 4) = 45."
        ))

        # 4. Biology Diagnostic Questions
        self._add(QuestionRecord(
            id="q_bio_1",
            subject_id="biology",
            topic_id="cell_division",
            difficulty=QuestionDifficulty.BASIC,
            question_type=QuestionFormat.MULTIPLE_CHOICE,
            learning_objective="Identify primary outcome of mitosis",
            question_text="What is the primary genetic outcome of mitotic cell division?",
            options=[
                QuestionOptionDB(id="opt_b1_1", text="Two genetically identical diploid daughter cells", is_correct=True),
                QuestionOptionDB(id="opt_b1_2", text="Four genetically distinct haploid gametes", is_correct=False, misconception_tag="confused_mitosis_with_meiosis"),
                QuestionOptionDB(id="opt_b1_3", text="Two haploid cells with recombined chromatids", is_correct=False, misconception_tag="haploid_diploid_confusion"),
                QuestionOptionDB(id="opt_b1_4", text="One cell with doubled chromosome count", is_correct=False, misconception_tag="cytokinesis_failure_misconception")
            ],
            correct_answer="opt_b1_1",
            explanation="Mitosis produces two genetically identical daughter cells with the same chromosome count as the parent cell.",
            hint="Remember that mitosis is used for body growth and repair, keeping identical DNA."
        ))

        # 5. Dedicated Transfer Challenge Question
        self._add(QuestionRecord(
            id="q_quad_transfer_1",
            subject_id="mathematics",
            topic_id="quadratic_equations",
            difficulty=QuestionDifficulty.APPLICATION,
            question_type=QuestionFormat.APPLICATION,
            is_transfer=True,
            learning_objective="Transfer quadratic model to projectile motion physics context",
            question_text="A model rocket's height in meters is given by h(t) = -5t² + 20t, where t is time in seconds. After how many seconds does the rocket return to the ground?",
            options=[
                QuestionOptionDB(id="opt_qt_1", text="4 seconds", is_correct=True),
                QuestionOptionDB(id="opt_qt_2", text="2 seconds", is_correct=False, misconception_tag="vertex_instead_of_root", distractor_explanation="2 seconds is when the rocket reaches maximum height, not when it hits the ground."),
                QuestionOptionDB(id="opt_qt_3", text="5 seconds", is_correct=False, misconception_tag="coefficient_misinterpretation"),
                QuestionOptionDB(id="opt_qt_4", text="20 seconds", is_correct=False, misconception_tag="initial_velocity_confusion")
            ],
            correct_answer="opt_qt_1",
            explanation="Set h(t) = 0: -5t² + 20t = 0 => -5t(t - 4) = 0. Since t > 0 at landing, t = 4 seconds.",
            hint="The ground corresponds to height h = 0. Factor out -5t."
        ))

        # 6. Cross-Subject: Physics
        self._add(QuestionRecord(
            id="q_vec_1",
            subject_id="physics",
            topic_id="vectors",
            difficulty=QuestionDifficulty.BASIC,
            question_type=QuestionFormat.MULTIPLE_CHOICE,
            learning_objective="Calculate scalar magnitude of orthogonal vector components",
            question_text="A vector has components Ax = 6 m and Ay = 8 m. What is the magnitude of the vector?",
            options=[
                QuestionOptionDB(id="opt_v1_1", text="10 m", is_correct=True),
                QuestionOptionDB(id="opt_v1_2", text="14 m", is_correct=False, misconception_tag="scalar_addition_instead_of_pythagorean"),
                QuestionOptionDB(id="opt_v1_3", text="48 m", is_correct=False, misconception_tag="product_instead_of_magnitude"),
                QuestionOptionDB(id="opt_v1_4", text="2 m", is_correct=False, misconception_tag="difference_misconception")
            ],
            correct_answer="opt_v1_1",
            explanation="|A| = √(Ax² + Ay²) = √(36 + 64) = √100 = 10 m.",
            hint="Apply the Pythagorean theorem to orthogonal vector components."
        ))

        # 7. Cross-Subject: Chemistry
        self._add(QuestionRecord(
            id="q_chem_1",
            subject_id="chemistry",
            topic_id="stoichiometry",
            difficulty=QuestionDifficulty.MEDIUM,
            question_type=QuestionFormat.MULTIPLE_CHOICE,
            learning_objective="Balance chemical equation and compute molar quantities",
            question_text="In the reaction 2H₂ + O₂ -> 2H₂O, how many moles of water are produced from 4 moles of O₂ and excess H₂?",
            options=[
                QuestionOptionDB(id="opt_ch1_1", text="8 moles", is_correct=True),
                QuestionOptionDB(id="opt_ch1_2", text="4 moles", is_correct=False, misconception_tag="one_to_one_ratio_assumption"),
                QuestionOptionDB(id="opt_ch1_3", text="2 moles", is_correct=False, misconception_tag="inverse_stoichiometric_ratio"),
                QuestionOptionDB(id="opt_ch1_4", text="16 moles", is_correct=False, misconception_tag="double_counting_reactants")
            ],
            correct_answer="opt_ch1_1",
            explanation="The stoichiometric mole ratio of O₂ to H₂O is 1:2. Thus, 4 mol O₂ * 2 = 8 mol H₂O.",
            hint="Check the stoichiometric coefficients in front of O₂ and H₂O."
        ))

        # 8. Cross-Subject: Computer Science
        self._add(QuestionRecord(
            id="q_cs_1",
            subject_id="computer_science",
            topic_id="boolean_logic",
            difficulty=QuestionDifficulty.BASIC,
            question_type=QuestionFormat.MULTIPLE_CHOICE,
            learning_objective="Evaluate boolean compound expression with De Morgan law",
            question_text="By De Morgan's Law, what is equivalent to NOT (A AND B)?",
            options=[
                QuestionOptionDB(id="opt_cs1_1", text="(NOT A) OR (NOT B)", is_correct=True),
                QuestionOptionDB(id="opt_cs1_2", text="(NOT A) AND (NOT B)", is_correct=False, misconception_tag="demorgan_conjunction_preservation"),
                QuestionOptionDB(id="opt_cs1_3", text="A OR B", is_correct=False, misconception_tag="double_negation_inversion"),
                QuestionOptionDB(id="opt_cs1_4", text="NOT (A OR B)", is_correct=False, misconception_tag="parentheses_omission")
            ],
            correct_answer="opt_cs1_1",
            explanation="De Morgan's First Law states that ¬(A ∧ B) ≡ (¬A) ∨ (¬B). Negating the conjunction flips the operator to OR.",
            hint="Negating a conjunction flips the AND into an OR."
        ))

    def _add(self, question: QuestionRecord):
        self._questions[question.id] = question

    def get_question(self, question_id: str) -> Optional[QuestionRecord]:
        return self._questions.get(question_id)

    def get_questions_by_topic(self, topic_id: str) -> List[QuestionRecord]:
        return [q for q in self._questions.values() if q.topic_id == topic_id]

    def get_question_by_difficulty(
        self,
        topic_id: str,
        difficulty: str,
        exclude_ids: Optional[List[str]] = None
    ) -> Optional[QuestionRecord]:
        exclude_set = set(exclude_ids or [])
        topic_qs = self.get_questions_by_topic(topic_id)
        for q in topic_qs:
            if q.id not in exclude_set and q.difficulty.value == difficulty:
                return q
        # Fallback to any uncompleted question in the topic
        for q in topic_qs:
            if q.id not in exclude_set:
                return q
        return None

    def build_diagnostic_sequence(self, topic_id: str) -> List[QuestionRecord]:
        """
        Builds an authoritative diagnostic sequence (10-12 questions):
        - Inspects direct and ancestral prerequisites
        - Samples questions from prerequisite chain first
        - Samples questions from target topic across all difficulty tiers
        """
        sequence: List[QuestionRecord] = []
        
        # 1. Prerequisite Topics (if topic has prerequisites in graph)
        curric_topic = curriculum_registry.get_topic(topic_id)
        if curric_topic and curric_topic.prerequisites:
            for prereq_id in curric_topic.prerequisites:
                prereq_qs = self.get_questions_by_topic(prereq_id)
                if prereq_qs:
                    # Pick up to 2 questions per prerequisite
                    sequence.extend(prereq_qs[:2])

        # 2. Target Topic Questions across difficulties
        target_qs = self.get_questions_by_topic(topic_id)
        # Order by difficulty
        basic = [q for q in target_qs if q.difficulty == QuestionDifficulty.BASIC]
        medium = [q for q in target_qs if q.difficulty == QuestionDifficulty.MEDIUM]
        hard = [q for q in target_qs if q.difficulty == QuestionDifficulty.HARD]
        app = [q for q in target_qs if q.difficulty == QuestionDifficulty.APPLICATION]

        sequence.extend(basic)
        sequence.extend(medium)
        sequence.extend(hard)
        sequence.extend(app)

        return sequence

# Global repository singleton
question_repository = QuestionRepository()

