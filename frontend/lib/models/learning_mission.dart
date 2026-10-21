class MissionItemModel {
  final String topicId;
  final String topicName;
  final int questionCount;
  final String focusReason;
  final String difficulty;

  MissionItemModel({
    required this.topicId,
    required this.topicName,
    required this.questionCount,
    required this.focusReason,
    required this.difficulty,
  });

  factory MissionItemModel.fromJson(Map<String, dynamic> json) {
    return MissionItemModel(
      topicId: json['topic_id'] ?? '',
      topicName: json['topic_name'] ?? '',
      questionCount: json['question_count'] ?? 3,
      focusReason: json['focus_reason'] ?? '',
      difficulty: json['difficulty'] ?? 'medium',
    );
  }
}

class LearningMissionModel {
  final String id;
  final String date;
  final int estimatedDurationMinutes;
  final String title;
  final String summary;
  final List<MissionItemModel> items;

  LearningMissionModel({
    required this.id,
    required this.date,
    required this.estimatedDurationMinutes,
    required this.title,
    required this.summary,
    required this.items,
  });

  factory LearningMissionModel.fromJson(Map<String, dynamic> json) {
    var rawItems = json['items'] as List? ?? [];
    return LearningMissionModel(
      id: json['id'] ?? '',
      date: json['date'] ?? '',
      estimatedDurationMinutes: json['estimated_duration_minutes'] ?? 15,
      title: json['title'] ?? "Today's Learning Mission",
      summary: json['summary'] ?? '',
      items: rawItems.map((i) => MissionItemModel.fromJson(i)).toList(),
    );
  }
}
