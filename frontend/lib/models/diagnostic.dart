import 'question.dart';

class PrereqGapModel {
  final String topicId;
  final String topicName;
  final double masteryScore;
  final bool isDirectPrerequisite;

  PrereqGapModel({
    required this.topicId,
    required this.topicName,
    required this.masteryScore,
    required this.isDirectPrerequisite,
  });

  factory PrereqGapModel.fromJson(Map<String, dynamic> json) {
    return PrereqGapModel(
      topicId: json['topic_id'] ?? '',
      topicName: json['topic_name'] ?? '',
      masteryScore: (json['mastery_score'] as num?)?.toDouble() ?? 0.0,
      isDirectPrerequisite: json['is_direct_prerequisite'] ?? false,
    );
  }
}

class DiagnosticStatusModel {
  final String diagnosticId;
  final String subjectId;
  final String selectedTopicId;
  final String topicName;
  final String status;
  final int totalQuestions;
  final int completedCount;
  final QuestionModel? currentQuestion;

  DiagnosticStatusModel({
    required this.diagnosticId,
    required this.subjectId,
    required this.selectedTopicId,
    required this.topicName,
    required this.status,
    required this.totalQuestions,
    required this.completedCount,
    this.currentQuestion,
  });

  factory DiagnosticStatusModel.fromJson(Map<String, dynamic> json) {
    return DiagnosticStatusModel(
      diagnosticId: json['diagnostic_id'] ?? '',
      subjectId: json['subject_id'] ?? '',
      selectedTopicId: json['selected_topic_id'] ?? '',
      topicName: json['topic_name'] ?? '',
      status: json['status'] ?? 'in_progress',
      totalQuestions: json['total_questions'] ?? 0,
      completedCount: json['completed_count'] ?? 0,
      currentQuestion: json['current_question'] != null
          ? QuestionModel.fromJson(json['current_question'])
          : null,
    );
  }
}

class LearningProfileModel {
  final String diagnosticId;
  final String topicId;
  final String overallStartingPoint;
  final double score;
  final int totalQuestions;
  final int completedQuestions;
  final List<String> strongAreas;
  final List<String> areasToImprove;
  final List<PrereqGapModel> prerequisiteGaps;
  final String recommendedFirstSession;

  LearningProfileModel({
    required this.diagnosticId,
    required this.topicId,
    required this.overallStartingPoint,
    required this.score,
    required this.totalQuestions,
    required this.completedQuestions,
    required this.strongAreas,
    required this.areasToImprove,
    required this.prerequisiteGaps,
    required this.recommendedFirstSession,
  });

  factory LearningProfileModel.fromJson(Map<String, dynamic> json) {
    var sAreas = json['strong_areas'] as List? ?? [];
    var iAreas = json['areas_to_improve'] as List? ?? [];
    var gaps = json['prerequisite_gaps'] as List? ?? [];

    return LearningProfileModel(
      diagnosticId: json['diagnostic_id'] ?? '',
      topicId: json['topic_id'] ?? '',
      overallStartingPoint: json['overall_starting_point'] ?? 'Developing',
      score: (json['score'] as num?)?.toDouble() ?? 0.0,
      totalQuestions: json['total_questions'] ?? 0,
      completedQuestions: json['completed_questions'] ?? 0,
      strongAreas: sAreas.map((e) => e.toString()).toList(),
      areasToImprove: iAreas.map((e) => e.toString()).toList(),
      prerequisiteGaps: gaps.map((g) => PrereqGapModel.fromJson(g)).toList(),
      recommendedFirstSession: json['recommended_first_session'] ?? 'Targeted Recovery Session',
    );
  }
}
