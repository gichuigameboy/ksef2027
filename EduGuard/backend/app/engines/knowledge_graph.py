import networkx as nx
from typing import List, Dict, Optional, Tuple, Set, Any
from app.curriculum.registry import curriculum_registry

class KnowledgeGraphEngine:
    """
    Curriculum Prerequisite Knowledge Graph Engine 2.0.
    Models curriculum concepts as a strictly Directed Acyclic Graph (DAG) with dependency relations:
    prerequisite -> dependent_topic.

    Features:
    - Multi-level prerequisite and ancestor traversal with topological sorting
    - Root-cause candidate detection using depth and distance weighting
    - DAG validation and cycle prevention
    - Enriched node-state generation for visualization (Mastery, Retention, Trend, Prerequisite health)
    - Cross-subject dependency traversal
    """

    def __init__(self):
        self.graph = nx.DiGraph()
        self._initialize_from_registry()

    def _initialize_from_registry(self):
        """
        Loads prerequisite graph edges and metadata dynamically
        from the central CurriculumRegistry.
        """
        edges = curriculum_registry.get_graph_edges()
        self.graph.add_edges_from(edges)
        self.topic_names = curriculum_registry.get_topic_names_map()

    def is_acyclic(self) -> bool:
        """Validates that the entire prerequisite network is a valid DAG."""
        return nx.is_directed_acyclic_graph(self.graph)

    def get_prerequisites(self, topic_id: str) -> List[str]:
        """Returns direct prerequisite parent topics."""
        if topic_id not in self.graph:
            return []
        return list(self.graph.predecessors(topic_id))

    def get_dependents(self, topic_id: str) -> List[str]:
        """Returns topics that depend on this topic."""
        if topic_id not in self.graph:
            return []
        return list(self.graph.successors(topic_id))

    def get_all_ancestors(self, topic_id: str) -> Set[str]:
        """Returns all prerequisite topics in the entire dependency chain."""
        if topic_id not in self.graph:
            return set()
        return nx.ancestors(self.graph, topic_id)

    def find_prerequisite_gaps(
        self,
        topic_id: str,
        student_mastery_map: Dict[str, float],
        gap_threshold: float = 60.0
    ) -> List[Dict[str, Any]]:
        """
        Root-Cause Analysis Engine:
        Searches all upstream ancestor topics of `topic_id`.
        Weighs distance: direct parents have higher impact than distant ancestors.
        Returns sorted list of likely prerequisite gaps.
        """
        ancestors = self.get_all_ancestors(topic_id)
        gaps = []
        direct_prereqs = set(self.get_prerequisites(topic_id))

        for ancestor in ancestors:
            score = student_mastery_map.get(ancestor, 0.0)
            if score < gap_threshold:
                is_direct = ancestor in direct_prereqs
                # Calculate topological shortest path distance
                try:
                    distance = nx.shortest_path_length(self.graph, ancestor, topic_id)
                except (nx.NetworkXNoPath, nx.NodeNotFound):
                    distance = 1

                # Root cause impact score: lower mastery + closer distance = higher likelihood
                impact = round((100.0 - score) / (distance * 1.0), 1)

                gaps.append({
                    "topic_id": ancestor,
                    "topic_name": self.topic_names.get(ancestor, ancestor.replace("_", " ").title()),
                    "mastery_score": score,
                    "is_direct_prerequisite": is_direct,
                    "graph_distance": distance,
                    "impact_score": impact,
                    "attribution_note": (
                        f"Likely prerequisite gap ({score}% mastery) "
                        f"{'directly preceding' if is_direct else f'{distance} levels upstream from'} this topic."
                    )
                })

        # Sort: direct prerequisites first, then by impact score descending
        gaps.sort(key=lambda x: (not x["is_direct_prerequisite"], -x["impact_score"]))
        return gaps

    def get_node_visualization_data(
        self,
        topic_id: str,
        mastery_score: float,
        confidence: float,
        retention: float,
        trend: str,
        student_mastery_map: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Generates enriched node metadata for interactive knowledge map display.
        """
        prereq_gaps = self.find_prerequisite_gaps(topic_id, student_mastery_map)
        direct_prereqs = self.get_prerequisites(topic_id)
        prereq_details = []
        for p in direct_prereqs:
            m = student_mastery_map.get(p, 0.0)
            prereq_details.append({
                "topic_id": p,
                "topic_name": self.topic_names.get(p, p),
                "mastery": m,
                "status": "Solid" if m >= 70.0 else ("Developing" if m >= 50.0 else "Weak")
            })

        # Recommendation logic
        if prereq_gaps:
            top = prereq_gaps[0]
            recommendation = f"Repair {top['topic_name']} before attempting advanced {self.topic_names.get(topic_id, topic_id)} applications."
        elif mastery_score >= 80.0 and retention < 0.70:
            recommendation = "High mastery at risk of decay. Schedule a 5-minute retrieval session."
        elif mastery_score < 60.0:
            recommendation = "Strengthen foundational concepts with guided problem sets."
        else:
            recommendation = "Ready for higher-order application and transfer challenges."

        return {
            "topic_id": topic_id,
            "topic_name": self.topic_names.get(topic_id, topic_id),
            "mastery": mastery_score,
            "confidence": confidence,
            "retention": retention,
            "trend": trend,
            "prerequisites": prereq_details,
            "has_prerequisite_gap": len(prereq_gaps) > 0,
            "recommendation": recommendation
        }
