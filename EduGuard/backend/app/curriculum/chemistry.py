from app.curriculum.base import CurriculumSubject, CurriculumTopic

CHEMISTRY_CURRICULUM = CurriculumSubject(
    id="chemistry",
    name="Chemistry",
    icon="science_rounded",
    description="Atomic structure, chemical bonding, stoichiometry, and chemical equilibria.",
    topics=[
        CurriculumTopic(
            id="atomic_structure",
            subject_id="chemistry",
            name="Atomic Structure & Periodic Trends",
            description="Protons, neutrons, electron configurations, ionization energy, and electronegativity.",
            prerequisites=[],
            learning_objectives=[
                "Write electron configurations using the Aufbau principle",
                "Explain periodic trends across periods and groups"
            ],
            order_index=1
        ),
        CurriculumTopic(
            id="chemical_bonding",
            subject_id="chemistry",
            name="Chemical Bonding & Molecular Structure",
            description="Ionic, covalent, and metallic bonds, Lewis structures, and VSEPR molecular geometry.",
            prerequisites=["atomic_structure"],
            learning_objectives=[
                "Draw valid Lewis electron-dot structures",
                "Predict 3D molecular shapes using VSEPR theory"
            ],
            order_index=2
        ),
        CurriculumTopic(
            id="stoichiometry",
            subject_id="chemistry",
            name="Stochiometry & Quantitative Chemistry",
            description="Mole concept, molar mass, balancing chemical equations, and limiting reactants.",
            prerequisites=["chemical_bonding", "algebraic_manipulation"],
            learning_objectives=[
                "Balance complex chemical equations",
                "Determine theoretical yields and identify limiting reactants"
            ],
            order_index=3
        ),
        CurriculumTopic(
            id="chemical_equilibrium",
            subject_id="chemistry",
            name="Chemical Equilibrium & Le Chatelier",
            description="Dynamic equilibrium, equilibrium constant Kc, and shifts under disturbance.",
            prerequisites=["stoichiometry"],
            learning_objectives=[
                "Formulate equilibrium constant expressions",
                "Predict direction of shift using Le Chatelier's principle"
            ],
            order_index=4
        )
    ]
)
