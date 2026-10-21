from app.curriculum.base import CurriculumSubject, CurriculumTopic

PHYSICS_CURRICULUM = CurriculumSubject(
    id="physics",
    name="Physics",
    icon="bolt_rounded",
    description="Mechanics, kinematics, forces, energy, and momentum.",
    topics=[
        CurriculumTopic(
            id="vectors",
            subject_id="physics",
            name="Vectors & Scalars",
            description="Vector components, addition by components, and trigonometry in physics.",
            prerequisites=[],
            learning_objectives=["Resolve vectors into orthogonal components", "Add vectors graphically and analytically"],
            order_index=1
        ),
        CurriculumTopic(
            id="kinematics",
            subject_id="physics",
            name="1D & 2D Kinematics",
            description="Displacement, velocity, acceleration, and equations of uniform motion.",
            prerequisites=["vectors"],
            learning_objectives=["Apply the kinematic equations", "Analyze projectile trajectories"],
            order_index=2
        ),
        CurriculumTopic(
            id="newtons_laws",
            subject_id="physics",
            name="Newton's Laws of Motion",
            description="Inertia, F=ma, action-reaction pairs, and free body diagrams.",
            prerequisites=["kinematics", "vectors"],
            learning_objectives=["Construct accurate free-body diagrams", "Solve multi-body force systems"],
            order_index=3
        ),
        CurriculumTopic(
            id="work_energy",
            subject_id="physics",
            name="Work, Energy & Power",
            description="Work-energy theorem, kinetic vs potential energy, and conservation of mechanical energy.",
            prerequisites=["newtons_laws"],
            learning_objectives=["Calculate work done by variable and constant forces", "Apply conservation of mechanical energy"],
            order_index=4
        )
    ]
)
