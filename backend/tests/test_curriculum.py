import pytest
import networkx as nx
from app.curriculum.registry import curriculum_registry
from app.engines.knowledge_graph import KnowledgeGraphEngine

def test_curriculum_registry_subjects():
    subjects = curriculum_registry.get_all_subjects()
    assert len(subjects) >= 3
    subject_ids = [s.id for s in subjects]
    assert "mathematics" in subject_ids
    assert "biology" in subject_ids
    assert "physics" in subject_ids

def test_curriculum_dag_is_acyclic():
    """Verifies that the prerequisite dependency graph contains no cycles."""
    edges = curriculum_registry.get_graph_edges()
    graph = nx.DiGraph()
    graph.add_edges_from(edges)
    assert nx.is_directed_acyclic_graph(graph) is True

def test_curriculum_prerequisite_chain():
    kg = KnowledgeGraphEngine()
    # Factorisation should be a prerequisite of Quadratic Equations
    prereqs = kg.get_prerequisites("quadratic_equations")
    assert "factorisation" in prereqs

    # Algebraic manipulation should be an ancestor of Quadratic Equations
    ancestors = kg.get_all_ancestors("quadratic_equations")
    assert "algebraic_manipulation" in ancestors
    assert "factorisation" in ancestors
