from app.curriculum.base import CurriculumSubject, CurriculumTopic

BIOLOGY_CURRICULUM = CurriculumSubject(
    id="biology",
    name="Biological Sciences",
    icon="biotech_rounded",
    description="Cellular biology, cell division, molecular genetics, and energetics.",
    topics=[
        CurriculumTopic(
            id="cell_structure",
            subject_id="biology",
            name="Cell Structure & Organelles",
            description="Eukaryotic vs prokaryotic cells, membrane transport, and organelle functions.",
            prerequisites=[],
            learning_objectives=["Identify plant vs animal organelles", "Understand passive vs active transport"],
            order_index=1
        ),
        CurriculumTopic(
            id="cell_division",
            subject_id="biology",
            name="Cell Division",
            description="Cell cycle regulation, DNA replication checkpoints, and importance of division.",
            prerequisites=["cell_structure"],
            learning_objectives=["Understand interphase and G1/S/G2 checkpoints", "Differentiate somatic vs gametic division"],
            order_index=2
        ),
        CurriculumTopic(
            id="mitosis",
            subject_id="biology",
            name="Mitosis & Tissue Growth",
            description="Stages of mitosis (Prophase, Metaphase, Anaphase, Telophase) and cytokinesis.",
            prerequisites=["cell_division"],
            learning_objectives=["Sequence mitotic phases", "Analyze chromosome movement and spindle fibers"],
            order_index=3
        ),
        CurriculumTopic(
            id="meiosis",
            subject_id="biology",
            name="Meiosis & Genetic Diversity",
            description="Reduction division, crossing over in Prophase I, and independent assortment.",
            prerequisites=["cell_division"],
            learning_objectives=["Contrast haploid and diploid states", "Explain sources of genetic variation"],
            order_index=4
        ),
        CurriculumTopic(
            id="photosynthesis",
            subject_id="biology",
            name="Photosynthesis & Energy Conversion",
            description="Light-dependent reactions, Calvin cycle, and chlorophyll absorption spectra.",
            prerequisites=["cell_structure"],
            learning_objectives=["Write the overall chemical equation", "Differentiate thylakoid vs stroma reactions"],
            order_index=5
        )
    ]
)
