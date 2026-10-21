class NextBestActionModel {
  final String actionType;
  final String topicId;
  final String topicName;
  final double priority;
  final int estimatedMinutes;
  final String reason;
  final List<String> reasonCodes;
  final int recommendedQuestionCount;
  final String targetDifficulty;

  NextBestActionModel({
    required this.actionType,
    required this.topicId,
    required this.topicName,
    required this.priority,
    required this.estimatedMinutes,
    required this.reason,
    required this.reasonCodes,
    required this.recommendedQuestionCount,
    required this.targetDifficulty,
  });

  factory NextBestActionModel.fromJson(Map<String, dynamic> json) {
    return NextBestActionModel(
      actionType: json['actionType'] ?? 'PREREQUISITE_RECOVERY',
      topicId: json['topicId'] ?? '',
      topicName: json['topicName'] ?? '',
      priority: (json['priority'] as num?)?.toDouble() ?? 0.8,
      estimatedMinutes: json['estimatedMinutes'] ?? 8,
      reason: json['reason'] ?? '',
      reasonCodes: (json['reasonCodes'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      recommendedQuestionCount: json['recommendedQuestionCount'] ?? 5,
      targetDifficulty: json['targetDifficulty'] ?? 'medium',
    );
  }
}

class StudentInsightModel {
  final String id;
  final String type; // improving, watch_this, review_soon, foundation_first
  final String title;
  final String message;
  final String topicId;
  final String evidence;

  StudentInsightModel({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    required this.topicId,
    required this.evidence,
  });

  factory StudentInsightModel.fromJson(Map<String, dynamic> json) {
    return StudentInsightModel(
      id: json['id'] ?? '',
      type: json['type'] ?? 'improving',
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      topicId: json['topic_id'] ?? '',
      evidence: json['evidence'] ?? '',
    );
  }
}

class RetentionItemModel {
  final String topicId;
  final String topicName;
  final double currentRetention;
  final double halfLifeDays;
  final int retrievalStreak;
  final String lastRetrievalAt;
  final String nextRetrievalDue;
  final double reviewUrgency;
  final String status;

  RetentionItemModel({
    required this.topicId,
    required this.topicName,
    required this.currentRetention,
    required this.halfLifeDays,
    required this.retrievalStreak,
    required this.lastRetrievalAt,
    required this.nextRetrievalDue,
    required this.reviewUrgency,
    required this.status,
  });

  factory RetentionItemModel.fromJson(Map<String, dynamic> json) {
    return RetentionItemModel(
      topicId: json['topic_id'] ?? '',
      topicName: json['topic_name'] ?? '',
      currentRetention: (json['current_retention'] as num?)?.toDouble() ?? 0.5,
      halfLifeDays: (json['half_life_days'] as num?)?.toDouble() ?? 7.0,
      retrievalStreak: json['retrieval_streak'] ?? 0,
      lastRetrievalAt: json['last_retrieval_at'] ?? '',
      nextRetrievalDue: json['next_retrieval_due'] ?? '',
      reviewUrgency: (json['review_urgency'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] ?? 'stable',
    );
  }
}

class LearningTimelineEventModel {
  final String eventId;
  final DateTime timestamp;
  final String eventType;
  final String topicId;
  final String topicName;
  final double masteryBefore;
  final double masteryAfter;
  final double score;
  final String description;

  LearningTimelineEventModel({
    required this.eventId,
    required this.timestamp,
    required this.eventType,
    required this.topicId,
    required this.topicName,
    required this.masteryBefore,
    required this.masteryAfter,
    required this.score,
    required this.description,
  });

  factory LearningTimelineEventModel.fromJson(Map<String, dynamic> json) {
    return LearningTimelineEventModel(
      eventId: json['eventId'] ?? '',
      timestamp: json['timestamp'] != null
          ? DateTime.tryParse(json['timestamp']) ?? DateTime.now()
          : DateTime.now(),
      eventType: json['eventType'] ?? 'diagnostic',
      topicId: json['topicId'] ?? '',
      topicName: json['topicName'] ?? '',
      masteryBefore: (json['masteryBefore'] as num?)?.toDouble() ?? 0.0,
      masteryAfter: (json['masteryAfter'] as num?)?.toDouble() ?? 0.0,
      score: (json['score'] as num?)?.toDouble() ?? 0.0,
      description: json['description'] ?? '',
    );
  }
}
