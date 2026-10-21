class CurriculumTopicModel {
  final String id;
  final String subjectId;
  final String name;
  final String description;
  final List<String> prerequisites;
  final List<String> learningObjectives;
  final int orderIndex;

  CurriculumTopicModel({
    required this.id,
    required this.subjectId,
    required this.name,
    required this.description,
    required this.prerequisites,
    required this.learningObjectives,
    required this.orderIndex,
  });

  factory CurriculumTopicModel.fromJson(Map<String, dynamic> json) {
    var prereqs = json['prerequisites'] as List? ?? [];
    var objs = json['learning_objectives'] as List? ?? [];

    return CurriculumTopicModel(
      id: json['id'] ?? '',
      subjectId: json['subject_id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      prerequisites: prereqs.map((e) => e.toString()).toList(),
      learningObjectives: objs.map((e) => e.toString()).toList(),
      orderIndex: json['order_index'] ?? 0,
    );
  }
}

class CurriculumSubjectModel {
  final String id;
  final String name;
  final String icon;
  final String description;
  final List<CurriculumTopicModel> topics;

  CurriculumSubjectModel({
    required this.id,
    required this.name,
    required this.icon,
    required this.description,
    required this.topics,
  });

  factory CurriculumSubjectModel.fromJson(Map<String, dynamic> json) {
    var tList = json['topics'] as List? ?? [];
    return CurriculumSubjectModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      icon: json['icon'] ?? 'school',
      description: json['description'] ?? '',
      topics: tList.map((t) => CurriculumTopicModel.fromJson(t)).toList(),
    );
  }
}
