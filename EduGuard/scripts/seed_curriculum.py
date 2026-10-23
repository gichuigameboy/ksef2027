"""
Curriculum Seed Script for EduGuard.
Seeds subjects, topics, and prerequisite graph structure into memory / Firestore.
"""

CURRICULUM_DATA = {
    "subjects": [
        {
            "id": "mathematics",
            "name": "Mathematics",
            "icon": "calculate_rounded",
            "description": "Foundational algebra, functions, geometry, calculus, and probability."
        },
        {
            "id": "biology",
            "name": "Biological Sciences",
            "icon": "biotech_rounded",
            "description": "Cellular biology, genetics, physiology, and ecosystems."
        }
    ],
    "topics": [
        {
            "id": "algebraic_manipulation",
            "subject_id": "mathematics",
            "name": "Algebraic Manipulation",
            "prerequisites": ["fractions"],
            "difficulty_tiers": ["basic", "medium", "hard"]
        },
        {
            "id": "factorisation",
            "subject_id": "mathematics",
            "name": "Factorisation",
            "prerequisites": ["algebraic_manipulation"],
            "difficulty_tiers": ["basic", "medium", "hard"]
        },
        {
            "id": "quadratic_equations",
            "subject_id": "mathematics",
            "name": "Quadratic Equations",
            "prerequisites": ["factorisation"],
            "difficulty_tiers": ["basic", "medium", "hard", "application"]
        },
        {
            "id": "probability_basics",
            "subject_id": "mathematics",
            "name": "Probability Foundations",
            "prerequisites": ["fractions"],
            "difficulty_tiers": ["basic", "medium", "hard"]
        },
        {
            "id": "cell_division",
            "subject_id": "biology",
            "name": "Cell Division",
            "prerequisites": ["cell_structure"],
            "difficulty_tiers": ["basic", "medium", "hard"]
        }
    ]
}

if __name__ == "__main__":
    print("EduGuard Curriculum Definition:")
    print(f"Loaded {len(CURRICULUM_DATA['subjects'])} subjects and {len(CURRICULUM_DATA['topics'])} topics.")
    for topic in CURRICULUM_DATA["topics"]:
        print(f"- {topic['name']} (Prerequisites: {', '.join(topic['prerequisites'])})")
