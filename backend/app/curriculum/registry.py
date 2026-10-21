from typing import List, Dict, Optional, Tuple
from app.curriculum.base import CurriculumSubject, CurriculumTopic
from app.curriculum.mathematics import MATHEMATICS_CURRICULUM
from app.curriculum.biology import BIOLOGY_CURRICULUM
from app.curriculum.physics import PHYSICS_CURRICULUM
from app.curriculum.chemistry import CHEMISTRY_CURRICULUM
from app.curriculum.computer_science import COMPUTER_SCIENCE_CURRICULUM

class CurriculumRegistry:
    """
    Central Curriculum Registry.
    Guarantees that database models, seeders, and NetworkX Knowledge Graph
    engines always derive from identical subject and prerequisite definitions.
    Supports cross-subject prerequisites (e.g., Mathematics -> Physics / Chemistry / CS).
    """

    def __init__(self):
        self._subjects: Dict[str, CurriculumSubject] = {
            "mathematics": MATHEMATICS_CURRICULUM,
            "biology": BIOLOGY_CURRICULUM,
            "physics": PHYSICS_CURRICULUM,
            "chemistry": CHEMISTRY_CURRICULUM,
            "computer_science": COMPUTER_SCIENCE_CURRICULUM
        }
        self._topics: Dict[str, CurriculumTopic] = {}
        for subject in self._subjects.values():
            for topic in subject.topics:
                self._topics[topic.id] = topic

    def get_all_subjects(self) -> List[CurriculumSubject]:
        return list(self._subjects.values())

    def get_subject(self, subject_id: str) -> Optional[CurriculumSubject]:
        return self._subjects.get(subject_id)

    def get_topic(self, topic_id: str) -> Optional[CurriculumTopic]:
        return self._topics.get(topic_id)

    def get_topics_for_subject(self, subject_id: str) -> List[CurriculumTopic]:
        subject = self.get_subject(subject_id)
        if not subject:
            return []
        return subject.topics

    def get_graph_edges(self) -> List[Tuple[str, str]]:
        """
        Returns all prerequisite edges as (prerequisite_id, dependent_topic_id)
        for constructing the NetworkX Directed Acyclic Graph.
        """
        edges = []
        for topic in self._topics.values():
            for prereq_id in topic.prerequisites:
                edges.append((prereq_id, topic.id))
        return edges

    def get_topic_names_map(self) -> Dict[str, str]:
        return {t.id: t.name for t in self._topics.values()}

# Global singleton instance
curriculum_registry = CurriculumRegistry()
