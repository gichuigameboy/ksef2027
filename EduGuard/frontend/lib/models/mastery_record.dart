enum MasteryTier {
  critical,
  weak,
  developing,
  strong,
  mastered,
}

class TopicMasteryRecord {
  final String topicId;
  final String subjectId;
  final String topicName;
  final double masteryScore;
  final MasteryTier category;
  final double basicAccuracy;
  final double mediumAccuracy;
  final double hardAccuracy;
  final double applicationAccuracy;
  final double recentAccuracy;
  final int attemptsCount;

  TopicMasteryRecord({
    required this.topicId,
    required this.subjectId,
    required this.topicName,
    required this.masteryScore,
    required this.category,
    required this.basicAccuracy,
    required this.mediumAccuracy,
    required this.hardAccuracy,
    required this.applicationAccuracy,
    required this.recentAccuracy,
    required this.attemptsCount,
  });

  factory TopicMasteryRecord.fromJson(Map<String, dynamic> json) {
    MasteryTier tier = MasteryTier.developing;
    final catStr = json['category'] as String? ?? 'developing';
    if (catStr == 'critical') tier = MasteryTier.critical;
    else if (catStr == 'weak') tier = MasteryTier.weak;
    else if (catStr == 'developing') tier = MasteryTier.developing;
    else if (catStr == 'strong') tier = MasteryTier.strong;
    else if (catStr == 'mastered') tier = MasteryTier.mastered;

    return TopicMasteryRecord(
      topicId: json['topic_id'] ?? '',
      subjectId: json['subject_id'] ?? '',
      topicName: json['topic_name'] ?? '',
      masteryScore: (json['mastery_score'] as num?)?.toDouble() ?? 0.0,
      category: tier,
      basicAccuracy: (json['basic_accuracy'] as num?)?.toDouble() ?? 0.0,
      mediumAccuracy: (json['medium_accuracy'] as num?)?.toDouble() ?? 0.0,
      hardAccuracy: (json['hard_accuracy'] as num?)?.toDouble() ?? 0.0,
      applicationAccuracy: (json['application_accuracy'] as num?)?.toDouble() ?? 0.0,
      recentAccuracy: (json['recent_accuracy'] as num?)?.toDouble() ?? 0.0,
      attemptsCount: json['attempts_count'] ?? 0,
    );
  }
}
