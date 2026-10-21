import 'dart:convert';
import 'package:http/http.dart' as http;
import '../services/auth_service.dart';

// ── Teacher Analytics Models ─────────────────────────────────────────────────

class StudentTopicCell {
  final String studentId;
  final String studentName;
  final String topicId;
  final String topicName;
  final double masteryScore;
  final String masteryCategory;
  final String retentionStatus;
  final String trend;
  final int attemptsCount;
  final double recentAccuracy;

  StudentTopicCell({
    required this.studentId,
    required this.studentName,
    required this.topicId,
    required this.topicName,
    required this.masteryScore,
    required this.masteryCategory,
    required this.retentionStatus,
    required this.trend,
    required this.attemptsCount,
    required this.recentAccuracy,
  });

  factory StudentTopicCell.fromJson(Map<String, dynamic> j) => StudentTopicCell(
        studentId: j['student_id'] ?? '',
        studentName: j['student_name'] ?? '',
        topicId: j['topic_id'] ?? '',
        topicName: j['topic_name'] ?? '',
        masteryScore: (j['mastery_score'] ?? 0).toDouble(),
        masteryCategory: j['mastery_category'] ?? 'not_started',
        retentionStatus: j['retention_status'] ?? 'insufficient_data',
        trend: j['trend'] ?? 'insufficient_data',
        attemptsCount: j['attempts_count'] ?? 0,
        recentAccuracy: (j['recent_accuracy'] ?? 0).toDouble(),
      );
}

class ClassHeatmapModel {
  final String subjectId;
  final String subjectName;
  final List<String> topicIds;
  final List<String> topicNames;
  final List<String> studentIds;
  final List<String> studentNames;
  final List<StudentTopicCell> cells;
  final Map<String, double> classAverages;
  final String summary;

  ClassHeatmapModel({
    required this.subjectId,
    required this.subjectName,
    required this.topicIds,
    required this.topicNames,
    required this.studentIds,
    required this.studentNames,
    required this.cells,
    required this.classAverages,
    required this.summary,
  });

  factory ClassHeatmapModel.fromJson(Map<String, dynamic> j) => ClassHeatmapModel(
        subjectId: j['subject_id'] ?? '',
        subjectName: j['subject_name'] ?? '',
        topicIds: List<String>.from(j['topic_ids'] ?? []),
        topicNames: List<String>.from(j['topic_names'] ?? []),
        studentIds: List<String>.from(j['student_ids'] ?? []),
        studentNames: List<String>.from(j['student_names'] ?? []),
        cells: (j['cells'] as List? ?? []).map((c) => StudentTopicCell.fromJson(c)).toList(),
        classAverages: Map<String, double>.from(
          (j['class_averages'] as Map? ?? {}).map((k, v) => MapEntry(k as String, (v as num).toDouble())),
        ),
        summary: j['summary'] ?? '',
      );
}

class MisconceptionClusterModel {
  final String topicId;
  final String topicName;
  final String errorTag;
  final int affectedStudentCount;
  final int totalStudents;
  final double prevalencePercent;
  final List<String> exampleStudents;
  final String recommendedIntervention;

  MisconceptionClusterModel({
    required this.topicId,
    required this.topicName,
    required this.errorTag,
    required this.affectedStudentCount,
    required this.totalStudents,
    required this.prevalencePercent,
    required this.exampleStudents,
    required this.recommendedIntervention,
  });

  factory MisconceptionClusterModel.fromJson(Map<String, dynamic> j) =>
      MisconceptionClusterModel(
        topicId: j['topic_id'] ?? '',
        topicName: j['topic_name'] ?? '',
        errorTag: j['error_tag'] ?? '',
        affectedStudentCount: j['affected_student_count'] ?? 0,
        totalStudents: j['total_students'] ?? 1,
        prevalencePercent: (j['prevalence_percent'] ?? 0).toDouble(),
        exampleStudents: List<String>.from(j['example_students'] ?? []),
        recommendedIntervention: j['recommended_intervention'] ?? '',
      );
}

class ClassMisconceptionsModel {
  final String subjectId;
  final int totalStudentsAnalyzed;
  final List<MisconceptionClusterModel> clusters;
  final String mostPrevalentError;
  final String teacherNote;

  ClassMisconceptionsModel({
    required this.subjectId,
    required this.totalStudentsAnalyzed,
    required this.clusters,
    required this.mostPrevalentError,
    required this.teacherNote,
  });

  factory ClassMisconceptionsModel.fromJson(Map<String, dynamic> j) =>
      ClassMisconceptionsModel(
        subjectId: j['subject_id'] ?? '',
        totalStudentsAnalyzed: j['total_students_analyzed'] ?? 0,
        clusters: (j['clusters'] as List? ?? []).map((c) => MisconceptionClusterModel.fromJson(c)).toList(),
        mostPrevalentError: j['most_prevalent_error'] ?? '',
        teacherNote: j['teacher_note'] ?? '',
      );
}

class AtRiskStudentModel {
  final String studentId;
  final String studentName;
  final String riskLevel;
  final List<String> riskReasons;
  final String weakestTopicId;
  final String weakestTopicName;
  final double averageMastery;
  final int topicsForgotten;
  final int topicsAtRisk;
  final String recommendedAction;

  AtRiskStudentModel({
    required this.studentId,
    required this.studentName,
    required this.riskLevel,
    required this.riskReasons,
    required this.weakestTopicId,
    required this.weakestTopicName,
    required this.averageMastery,
    required this.topicsForgotten,
    required this.topicsAtRisk,
    required this.recommendedAction,
  });

  factory AtRiskStudentModel.fromJson(Map<String, dynamic> j) => AtRiskStudentModel(
        studentId: j['student_id'] ?? '',
        studentName: j['student_name'] ?? '',
        riskLevel: j['risk_level'] ?? 'moderate',
        riskReasons: List<String>.from(j['risk_reasons'] ?? []),
        weakestTopicId: j['weakest_topic_id'] ?? '',
        weakestTopicName: j['weakest_topic_name'] ?? '',
        averageMastery: (j['average_mastery'] ?? 0).toDouble(),
        topicsForgotten: j['topics_forgotten'] ?? 0,
        topicsAtRisk: j['topics_at_risk'] ?? 0,
        recommendedAction: j['recommended_action'] ?? '',
      );
}

class AtRiskStudentsModel {
  final int totalClassSize;
  final int atRiskCount;
  final int criticalCount;
  final List<AtRiskStudentModel> students;
  final double classAverageMastery;
  final String teacherSummary;

  AtRiskStudentsModel({
    required this.totalClassSize,
    required this.atRiskCount,
    required this.criticalCount,
    required this.students,
    required this.classAverageMastery,
    required this.teacherSummary,
  });

  factory AtRiskStudentsModel.fromJson(Map<String, dynamic> j) => AtRiskStudentsModel(
        totalClassSize: j['total_class_size'] ?? 0,
        atRiskCount: j['at_risk_count'] ?? 0,
        criticalCount: j['critical_count'] ?? 0,
        students: (j['students'] as List? ?? []).map((s) => AtRiskStudentModel.fromJson(s)).toList(),
        classAverageMastery: (j['class_average_mastery'] ?? 0).toDouble(),
        teacherSummary: j['teacher_summary'] ?? '',
      );
}

class TopicDifficultyProfileModel {
  final String topicId;
  final String topicName;
  final double classAverageMastery;
  final double basicAccuracy;
  final double mediumAccuracy;
  final double hardAccuracy;
  final double applicationAccuracy;
  final bool difficultyCliffDetected;
  final int studentCount;

  TopicDifficultyProfileModel({
    required this.topicId,
    required this.topicName,
    required this.classAverageMastery,
    required this.basicAccuracy,
    required this.mediumAccuracy,
    required this.hardAccuracy,
    required this.applicationAccuracy,
    required this.difficultyCliffDetected,
    required this.studentCount,
  });

  factory TopicDifficultyProfileModel.fromJson(Map<String, dynamic> j) =>
      TopicDifficultyProfileModel(
        topicId: j['topic_id'] ?? '',
        topicName: j['topic_name'] ?? '',
        classAverageMastery: (j['class_average_mastery'] ?? 0).toDouble(),
        basicAccuracy: (j['basic_accuracy'] ?? 0).toDouble(),
        mediumAccuracy: (j['medium_accuracy'] ?? 0).toDouble(),
        hardAccuracy: (j['hard_accuracy'] ?? 0).toDouble(),
        applicationAccuracy: (j['application_accuracy'] ?? 0).toDouble(),
        difficultyCliffDetected: j['difficulty_cliff_detected'] ?? false,
        studentCount: j['student_count'] ?? 0,
      );
}

class ClassTopicDifficultyModel {
  final String subjectId;
  final List<TopicDifficultyProfileModel> profiles;
  final String hardestTopicId;
  final String hardestTopicName;
  final String easiestTopicId;
  final String easiestTopicName;

  ClassTopicDifficultyModel({
    required this.subjectId,
    required this.profiles,
    required this.hardestTopicId,
    required this.hardestTopicName,
    required this.easiestTopicId,
    required this.easiestTopicName,
  });

  factory ClassTopicDifficultyModel.fromJson(Map<String, dynamic> j) =>
      ClassTopicDifficultyModel(
        subjectId: j['subject_id'] ?? '',
        profiles: (j['profiles'] as List? ?? [])
            .map((p) => TopicDifficultyProfileModel.fromJson(p))
            .toList(),
        hardestTopicId: j['hardest_topic_id'] ?? '',
        hardestTopicName: j['hardest_topic_name'] ?? '',
        easiestTopicId: j['easiest_topic_id'] ?? '',
        easiestTopicName: j['easiest_topic_name'] ?? '',
      );
}

// ── Teacher API Service ───────────────────────────────────────────────────────

class TeacherApiService {
  static const String _base = 'http://localhost:8000/api/v1/teacher';

  static Future<ClassHeatmapModel> getClassHeatmap(String subjectId) async {
    try {
      final res = await http
          .get(Uri.parse('$_base/class-heatmap/$subjectId'), headers: AuthService.authHeaders)
          .timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) return ClassHeatmapModel.fromJson(jsonDecode(res.body));
    } catch (_) {}
    return _demoHeatmap(subjectId);
  }

  static Future<ClassMisconceptionsModel> getMisconceptions(String subjectId) async {
    try {
      final res = await http
          .get(Uri.parse('$_base/misconceptions/$subjectId'), headers: AuthService.authHeaders)
          .timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) return ClassMisconceptionsModel.fromJson(jsonDecode(res.body));
    } catch (_) {}
    return _demoMisconceptions(subjectId);
  }

  static Future<AtRiskStudentsModel> getAtRiskStudents(String subjectId) async {
    try {
      final res = await http
          .get(Uri.parse('$_base/at-risk-students/$subjectId'), headers: AuthService.authHeaders)
          .timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) return AtRiskStudentsModel.fromJson(jsonDecode(res.body));
    } catch (_) {}
    return _demoAtRisk();
  }

  static Future<ClassTopicDifficultyModel> getTopicDifficulty(String subjectId) async {
    try {
      final res = await http
          .get(Uri.parse('$_base/topic-difficulty/$subjectId'), headers: AuthService.authHeaders)
          .timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) return ClassTopicDifficultyModel.fromJson(jsonDecode(res.body));
    } catch (_) {}
    return _demoDifficulty(subjectId);
  }

  // ── Demo fallback data ────────────────────────────────────────────────────

  static ClassHeatmapModel _demoHeatmap(String subjectId) {
    final students = ['Claudia W.', 'Alice M.', 'Bob O.', 'Carol A.', 'David K.', 'Eve N.', 'Frank M.', 'Grace W.'];
    final topics = ['Factorisation', 'Quadratic Equations', 'Functions', 'Probability'];
    final scores = [82, 45, 90, 38, 70, 60, 85, 72];

    final cells = <StudentTopicCell>[];
    for (int si = 0; si < students.length; si++) {
      for (int ti = 0; ti < topics.length; ti++) {
        final base = scores[si].toDouble();
        final score = (base - ti * 8).clamp(10.0, 100.0);
        cells.add(StudentTopicCell(
          studentId: 'student_$si',
          studentName: students[si],
          topicId: 'topic_$ti',
          topicName: topics[ti],
          masteryScore: score,
          masteryCategory: score >= 80 ? 'mastered' : score >= 60 ? 'proficient' : score >= 40 ? 'developing' : 'beginning',
          retentionStatus: score >= 70 ? 'stable' : score >= 50 ? 'at_risk' : 'due',
          trend: si % 3 == 0 ? 'improving' : si % 3 == 1 ? 'stable' : 'declining',
          attemptsCount: 6 + si,
          recentAccuracy: (score * 0.9).clamp(0, 100),
        ));
      }
    }

    return ClassHeatmapModel(
      subjectId: subjectId,
      subjectName: 'Mathematics',
      topicIds: ['factorisation', 'quadratic_equations', 'functions', 'probability'],
      topicNames: topics,
      studentIds: students.map((s) => s.toLowerCase().replaceAll(' ', '_')).toList(),
      studentNames: students,
      cells: cells,
      classAverages: {for (int i = 0; i < topics.length; i++) 'topic_$i': 65.0 - i * 5},
      summary: 'Demo class of 8 students across 4 topics. Class average mastery: 63%.',
    );
  }

  static ClassMisconceptionsModel _demoMisconceptions(String subjectId) {
    return ClassMisconceptionsModel(
      subjectId: subjectId,
      totalStudentsAnalyzed: 8,
      clusters: [
        MisconceptionClusterModel(
          topicId: 'quadratic_equations',
          topicName: 'Quadratic Equations',
          errorTag: 'sign_error',
          affectedStudentCount: 5,
          totalStudents: 8,
          prevalencePercent: 62.5,
          exampleStudents: ['Bob Ochieng', 'David Kariuki', 'Frank Mutua'],
          recommendedIntervention: 'Reteach sign handling with expansion using FOIL. 5 students (62.5%) show this pattern.',
        ),
        MisconceptionClusterModel(
          topicId: 'factorisation',
          topicName: 'Factorisation',
          errorTag: 'formula_selection',
          affectedStudentCount: 3,
          totalStudents: 8,
          prevalencePercent: 37.5,
          exampleStudents: ['Bob Ochieng', 'David Kariuki'],
          recommendedIntervention: 'Clarify when to use difference-of-squares vs trinomial factoring.',
        ),
        MisconceptionClusterModel(
          topicId: 'functions',
          topicName: 'Functions',
          errorTag: 'concept_misunderstanding',
          affectedStudentCount: 2,
          totalStudents: 8,
          prevalencePercent: 25.0,
          exampleStudents: ['David Kariuki', 'Frank Mutua'],
          recommendedIntervention: 'Revisit domain/range definitions with visual mapping exercises.',
        ),
      ],
      mostPrevalentError: 'Sign Error',
      teacherNote: 'Misconception clusters from student attempt data. Address highest-prevalence errors first.',
    );
  }

  static AtRiskStudentsModel _demoAtRisk() {
    return AtRiskStudentsModel(
      totalClassSize: 8,
      atRiskCount: 3,
      criticalCount: 1,
      students: [
        AtRiskStudentModel(
          studentId: 'student_dave',
          studentName: 'David Kariuki',
          riskLevel: 'critical',
          riskReasons: ['Critically low average mastery (35%)', '3 topics at forgotten status'],
          weakestTopicId: 'quadratic_equations',
          weakestTopicName: 'Quadratic Equations',
          averageMastery: 35.0,
          topicsForgotten: 3,
          topicsAtRisk: 1,
          recommendedAction: 'Schedule immediate 1:1 tutoring on Quadratic Equations fundamentals.',
        ),
        AtRiskStudentModel(
          studentId: 'student_bob',
          studentName: 'Bob Ochieng',
          riskLevel: 'high',
          riskReasons: ['Average mastery below standard (45%)', '2 topics at forgotten status'],
          weakestTopicId: 'factorisation',
          weakestTopicName: 'Factorisation',
          averageMastery: 45.0,
          topicsForgotten: 2,
          topicsAtRisk: 2,
          recommendedAction: 'Provide worked examples on Factorisation and assign retrieval practice.',
        ),
        AtRiskStudentModel(
          studentId: 'student_frank',
          studentName: 'Frank Mutua',
          riskLevel: 'moderate',
          riskReasons: ['Average mastery approaching risk threshold (55%)'],
          weakestTopicId: 'quadratic_equations',
          weakestTopicName: 'Quadratic Equations',
          averageMastery: 55.0,
          topicsForgotten: 1,
          topicsAtRisk: 2,
          recommendedAction: 'Assign spaced retrieval practice for Quadratic Equations.',
        ),
      ],
      classAverageMastery: 67.5,
      teacherSummary: '3 of 8 students need support. 1 requires immediate intervention. Class average: 67.5%.',
    );
  }

  static ClassTopicDifficultyModel _demoDifficulty(String subjectId) {
    return ClassTopicDifficultyModel(
      subjectId: subjectId,
      profiles: [
        TopicDifficultyProfileModel(
          topicId: 'quadratic_equations',
          topicName: 'Quadratic Equations',
          classAverageMastery: 58.0,
          basicAccuracy: 72.0,
          mediumAccuracy: 58.0,
          hardAccuracy: 38.0,
          applicationAccuracy: 28.0,
          difficultyCliffDetected: true,
          studentCount: 8,
        ),
        TopicDifficultyProfileModel(
          topicId: 'factorisation',
          topicName: 'Factorisation',
          classAverageMastery: 65.0,
          basicAccuracy: 80.0,
          mediumAccuracy: 65.0,
          hardAccuracy: 50.0,
          applicationAccuracy: 40.0,
          difficultyCliffDetected: false,
          studentCount: 8,
        ),
        TopicDifficultyProfileModel(
          topicId: 'functions',
          topicName: 'Functions',
          classAverageMastery: 72.0,
          basicAccuracy: 85.0,
          mediumAccuracy: 70.0,
          hardAccuracy: 60.0,
          applicationAccuracy: 52.0,
          difficultyCliffDetected: false,
          studentCount: 8,
        ),
        TopicDifficultyProfileModel(
          topicId: 'probability',
          topicName: 'Probability',
          classAverageMastery: 78.0,
          basicAccuracy: 90.0,
          mediumAccuracy: 78.0,
          hardAccuracy: 65.0,
          applicationAccuracy: 55.0,
          difficultyCliffDetected: false,
          studentCount: 8,
        ),
      ],
      hardestTopicId: 'quadratic_equations',
      hardestTopicName: 'Quadratic Equations',
      easiestTopicId: 'probability',
      easiestTopicName: 'Probability',
    );
  }
}
