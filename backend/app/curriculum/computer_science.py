from app.curriculum.base import CurriculumSubject, CurriculumTopic

COMPUTER_SCIENCE_CURRICULUM = CurriculumSubject(
    id="computer_science",
    name="Computer Science",
    icon="terminal_rounded",
    description="Boolean logic, control flow, data structures, and computational thinking.",
    topics=[
        CurriculumTopic(
            id="boolean_logic",
            subject_id="computer_science",
            name="Boolean Logic & Digital Truth Tables",
            description="AND, OR, NOT, XOR operations, De Morgan's Laws, and logic gates.",
            prerequisites=[],
            learning_objectives=[
                "Construct and evaluate truth tables for composite propositions",
                "Apply De Morgan's laws to simplify boolean expressions"
            ],
            order_index=1
        ),
        CurriculumTopic(
            id="control_structures",
            subject_id="computer_science",
            name="Control Flow & Conditionals",
            description="Branching logic, loops (while/for), iteration, and guard clauses.",
            prerequisites=["boolean_logic"],
            learning_objectives=[
                "Trace nested loop execution and state transformations",
                "Design terminating loop conditions without off-by-one errors"
            ],
            order_index=2
        ),
        CurriculumTopic(
            id="arrays_and_lists",
            subject_id="computer_science",
            name="Linear Data Structures & Arrays",
            description="Contiguous memory indexing, traversal, dynamic arrays, and element search.",
            prerequisites=["control_structures"],
            learning_objectives=[
                "Perform bounds checking and memory layout analysis",
                "Implement linear search and prefix sums"
            ],
            order_index=3
        ),
        CurriculumTopic(
            id="search_and_sort_algorithms",
            subject_id="computer_science",
            name="Algorithmic Complexity & Sorting",
            description="Big-O asymptotic analysis, binary search, and divide-and-conquer algorithms.",
            prerequisites=["arrays_and_lists", "algebraic_manipulation"],
            learning_objectives=[
                "Derive Big-O time and space complexity",
                "Implement binary search on sorted partitions"
            ],
            order_index=4
        )
    ]
)
