class AttemptHistoryModel {
  final String attemptId;
  final String studentId;
  final String questionId;
  final String subjectId;
  final String topicId;
  final String answer;
  final bool isCorrect;
  final String difficulty;
  final String? errorCategory;
  final DateTime createdAt;

  AttemptHistoryModel({
    required this.attemptId,
    required this.studentId,
    required this.questionId,
    required this.subjectId,
    required this.topicId,
    required this.answer,
    required this.isCorrect,
    required this.difficulty,
    this.errorCategory,
    required this.createdAt,
  });

  factory AttemptHistoryModel.fromJson(Map<String, dynamic> json) {
    return AttemptHistoryModel(
      attemptId: json['attempt_id'] ?? '',
      studentId: json['student_id'] ?? '',
      questionId: json['question_id'] ?? '',
      subjectId: json['subject_id'] ?? '',
      topicId: json['topic_id'] ?? '',
      answer: json['answer'] ?? '',
      isCorrect: json['is_correct'] ?? false,
      difficulty: json['difficulty'] ?? 'basic',
      errorCategory: json['error_category'],
      createdAt: json['created_at'] != null 
          ? DateTime.tryParse(json['created_at']) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}
