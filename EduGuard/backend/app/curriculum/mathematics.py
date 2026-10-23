from app.curriculum.base import CurriculumSubject, CurriculumTopic

MATHEMATICS_CURRICULUM = CurriculumSubject(
    id="mathematics",
    name="Mathematics",
    icon="calculate_rounded",
    description="Algebra, quadratics, functions, geometry, and probability.",
    topics=[
        CurriculumTopic(
            id="arithmetic",
            subject_id="mathematics",
            name="Basic Arithmetic & Number Operations",
            description="Integers, operations, order of operations, and prime factorization.",
            prerequisites=[],
            learning_objectives=["Master BODMAS", "Prime factor decomposition"],
            order_index=1
        ),
        CurriculumTopic(
            id="fractions",
            subject_id="mathematics",
            name="Fractions, Decimals & Ratios",
            description="Rational numbers, proportions, and simplifying ratios.",
            prerequisites=["arithmetic"],
            learning_objectives=["Add/subtract dissimilar fractions", "Solve ratio problems"],
            order_index=2
        ),
        CurriculumTopic(
            id="algebraic_manipulation",
            subject_id="mathematics",
            name="Algebraic Manipulation",
            description="Expanding brackets, collecting like terms, and working with algebraic expressions.",
            prerequisites=["fractions"],
            learning_objectives=["Expand single and double brackets", "Simplify multi-variable terms"],
            order_index=3
        ),
        CurriculumTopic(
            id="linear_equations",
            subject_id="mathematics",
            name="Linear Equations",
            description="Single-variable and multi-step linear equation solving.",
            prerequisites=["algebraic_manipulation"],
            learning_objectives=["Isolate variables with inverse operations", "Solve equations with variables on both sides"],
            order_index=4
        ),
        CurriculumTopic(
            id="factorisation",
            subject_id="mathematics",
            name="Factorisation",
            description="Common factors, difference of two squares, and factoring trinomials.",
            prerequisites=["algebraic_manipulation"],
            learning_objectives=["Factor out greatest common factor", "Factor quadratic trinomials x^2 + bx + c", "Identify difference of squares"],
            order_index=5
        ),
        CurriculumTopic(
            id="quadratic_equations",
            subject_id="mathematics",
            name="Quadratic Equations",
            description="Solving quadratics by factoring, quadratic formula, and completing the square.",
            prerequisites=["factorisation"],
            learning_objectives=["Solve by factoring using zero-product property", "Apply the quadratic formula", "Determine discriminant and nature of roots"],
            order_index=6
        ),
        CurriculumTopic(
            id="quadratic_applications",
            subject_id="mathematics",
            name="Quadratic Applications & Modeling",
            description="Real-world projectile motion, area optimization, and revenue curves.",
            prerequisites=["quadratic_equations"],
            learning_objectives=["Formulate quadratic word problems", "Find maximum/minimum vertices in context"],
            order_index=7
        ),
        CurriculumTopic(
            id="simultaneous_equations",
            subject_id="mathematics",
            name="Simultaneous Equations",
            description="Systems of equations solved by substitution and elimination.",
            prerequisites=["linear_equations"],
            learning_objectives=["Solve by elimination", "Solve by substitution", "Intersection of lines"],
            order_index=8
        ),
        CurriculumTopic(
            id="probability_basics",
            subject_id="mathematics",
            name="Probability Foundations",
            description="Sample spaces, theoretical vs experimental probability, and Venn diagrams.",
            prerequisites=["fractions"],
            learning_objectives=["Calculate simple event probabilities", "Complementary events"],
            order_index=9
        ),
        CurriculumTopic(
            id="independent_events",
            subject_id="mathematics",
            name="Independent vs Mutually Exclusive Events",
            description="Compound events, tree diagrams, and addition/multiplication rules.",
            prerequisites=["probability_basics"],
            learning_objectives=["Distinguish independent from dependent", "Apply P(A and B) = P(A) * P(B)"],
            order_index=10
        )
    ]
)
