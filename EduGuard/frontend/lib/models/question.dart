class QuestionOptionModel {
  final String id;
  final String text;
  final bool isCorrect;
  final String? misconceptionId;
  final String? distractorExplanation;

  QuestionOptionModel({
    required this.id,
    required this.text,
    required this.isCorrect,
    this.misconceptionId,
    this.distractorExplanation,
  });

  factory QuestionOptionModel.fromJson(Map<String, dynamic> json) {
    return QuestionOptionModel(
      id: json['id'] ?? '',
      text: json['text'] ?? '',
      isCorrect: json['is_correct'] ?? false,
      misconceptionId: json['misconception_id'],
      distractorExplanation: json['distractor_explanation'],
    );
  }
}

class QuestionModel {
  final String id;
  final String topicId;
  final String topicName;
  final String difficulty;
  final String prompt;
  final List<QuestionOptionModel> options;
  final String correctExplanation;
  final List<String> hints;

  QuestionModel({
    required this.id,
    required this.topicId,
    required this.topicName,
    required this.difficulty,
    required this.prompt,
    required this.options,
    required this.correctExplanation,
    required this.hints,
  });

  String get questionText => prompt;
  String? get hint => hints.isNotEmpty ? hints.first : null;

  factory QuestionModel.fromJson(Map<String, dynamic> json) {
    var rawOptions = json['options'] as List? ?? [];
    var rawHints = json['hints'] as List? ?? [];
    return QuestionModel(
      id: json['id'] ?? '',
      topicId: json['topic_id'] ?? '',
      topicName: json['topic_name'] ?? '',
      difficulty: json['difficulty'] ?? 'basic',
      prompt: json['prompt'] ?? '',
      options: rawOptions.map((o) => QuestionOptionModel.fromJson(o)).toList(),
      correctExplanation: json['correct_explanation'] ?? '',
      hints: rawHints.map((h) => h.toString()).toList(),
    );
  }
}

class AttemptResultModel {
  final bool isCorrect;
  final String correctOptionId;
  final String explanation;
  final String? diagnosedMisconception;
  final List<String> hintsAvailable;
  final String? recommendedNextStep;
  final double? updatedTopicMastery;

  AttemptResultModel({
    required this.isCorrect,
    required this.correctOptionId,
    required this.explanation,
    this.diagnosedMisconception,
    required this.hintsAvailable,
    this.recommendedNextStep,
    this.updatedTopicMastery,
  });

  factory AttemptResultModel.fromJson(Map<String, dynamic> json) {
    var rawHints = json['hints_available'] as List? ?? [];
    return AttemptResultModel(
      isCorrect: json['is_correct'] ?? false,
      correctOptionId: json['correct_option_id'] ?? '',
      explanation: json['explanation'] ?? '',
      diagnosedMisconception: json['diagnosed_misconception'],
      hintsAvailable: rawHints.map((h) => h.toString()).toList(),
      recommendedNextStep: json['recommended_next_step'],
      updatedTopicMastery: (json['updated_topic_mastery'] as num?)?.toDouble(),
    );
  }
}
