import 'package:flutter/foundation.dart';

class TutorResponseModel {
  final String explanation;
  final String keyConcept;
  final List<String> steps;
  final String? example;
  final String? checkQuestion;
  final String encouragement;
  final String mode;
  final String modelUsed;
  final bool isFallback;

  TutorResponseModel({
    required this.explanation,
    required this.keyConcept,
    required this.steps,
    this.example,
    this.checkQuestion,
    required this.encouragement,
    this.mode = 'explain',
    this.modelUsed = 'gemini-2.5-flash',
    this.isFallback = false,
  });

  factory TutorResponseModel.fromJson(Map<String, dynamic> json) {
    return TutorResponseModel(
      explanation: json['explanation'] ?? '',
      keyConcept: json['key_concept'] ?? '',
      steps: (json['steps'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      example: json['example'],
      checkQuestion: json['check_question'],
      encouragement: json['encouragement'] ?? '',
      mode: json['mode'] ?? 'explain',
      modelUsed: json['model_used'] ?? 'gemini-2.5-flash',
      isFallback: json['is_fallback'] ?? false,
    );
  }
}

class HintResponseModel {
  final int hintLevel;
  final String hintText;
  final String guidance;
  final bool isFinalSolution;
  final String modelUsed;
  final bool isFallback;

  HintResponseModel({
    required this.hintLevel,
    required this.hintText,
    required this.guidance,
    required this.isFinalSolution,
    this.modelUsed = 'gemini-2.5-flash',
    this.isFallback = false,
  });

  factory HintResponseModel.fromJson(Map<String, dynamic> json) {
    return HintResponseModel(
      hintLevel: json['hint_level'] ?? 1,
      hintText: json['hint_text'] ?? '',
      guidance: json['guidance'] ?? '',
      isFinalSolution: json['is_final_solution'] ?? false,
      modelUsed: json['model_used'] ?? 'gemini-2.5-flash',
      isFallback: json['is_fallback'] ?? false,
    );
  }
}

class MistakeAnalysisResponseModel {
  final String likelyError;
  final String explanation;
  final String teachingFocus;
  final String confidence; // low, medium, high
  final bool isTentative;
  final String conceptToRemember;
  final String? miniExample;
  final String? quickCheck;
  final String modelUsed;
  final bool isFallback;

  MistakeAnalysisResponseModel({
    required this.likelyError,
    required this.explanation,
    required this.teachingFocus,
    required this.confidence,
    required this.isTentative,
    required this.conceptToRemember,
    this.miniExample,
    this.quickCheck,
    this.modelUsed = 'gemini-2.5-pro',
    this.isFallback = false,
  });

  factory MistakeAnalysisResponseModel.fromJson(Map<String, dynamic> json) {
    return MistakeAnalysisResponseModel(
      likelyError: json['likely_error'] ?? '',
      explanation: json['explanation'] ?? '',
      teachingFocus: json['teaching_focus'] ?? '',
      confidence: json['confidence'] ?? 'medium',
      isTentative: json['is_tentative'] ?? false,
      conceptToRemember: json['concept_to_remember'] ?? '',
      miniExample: json['mini_example'],
      quickCheck: json['quick_check'],
      modelUsed: json['model_used'] ?? 'gemini-2.5-pro',
      isFallback: json['is_fallback'] ?? false,
    );
  }
}

class AIInsightModel {
  final String whatNoticed;
  final String focusNext;
  final String suggestedStrategy;
  final Map<String, dynamic> groundedMetrics;
  final String modelUsed;
  final bool isFallback;

  AIInsightModel({
    required this.whatNoticed,
    required this.focusNext,
    required this.suggestedStrategy,
    required this.groundedMetrics,
    this.modelUsed = 'gemini-2.5-flash',
    this.isFallback = false,
  });

  factory AIInsightModel.fromJson(Map<String, dynamic> json) {
    return AIInsightModel(
      whatNoticed: json['what_noticed'] ?? '',
      focusNext: json['focus_next'] ?? '',
      suggestedStrategy: json['suggested_strategy'] ?? '',
      groundedMetrics: json['grounded_metrics'] ?? {},
      modelUsed: json['model_used'] ?? 'gemini-2.5-flash',
      isFallback: json['is_fallback'] ?? false,
    );
  }
}

class StudyPlanStepModel {
  final int stepNumber;
  final String topicId;
  final String topicName;
  final String actionType;
  final int allocatedMinutes;
  final String pedagogicalReason;

  StudyPlanStepModel({
    required this.stepNumber,
    required this.topicId,
    required this.topicName,
    required this.actionType,
    required this.allocatedMinutes,
    required this.pedagogicalReason,
  });

  factory StudyPlanStepModel.fromJson(Map<String, dynamic> json) {
    return StudyPlanStepModel(
      stepNumber: json['step_number'] ?? 1,
      topicId: json['topic_id'] ?? '',
      topicName: json['topic_name'] ?? '',
      actionType: json['action_type'] ?? 'PRACTICE',
      allocatedMinutes: json['allocated_minutes'] ?? 10,
      pedagogicalReason: json['pedagogical_reason'] ?? '',
    );
  }
}

class StudyPlanModel {
  final String overview;
  final int totalMinutes;
  final List<StudyPlanStepModel> steps;
  final String encouragement;
  final String modelUsed;

  StudyPlanModel({
    required this.overview,
    required this.totalMinutes,
    required this.steps,
    required this.encouragement,
    this.modelUsed = 'gemini-2.5-flash',
  });

  factory StudyPlanModel.fromJson(Map<String, dynamic> json) {
    return StudyPlanModel(
      overview: json['overview'] ?? '',
      totalMinutes: json['total_minutes'] ?? 25,
      steps: (json['steps'] as List<dynamic>?)
              ?.map((e) => StudyPlanStepModel.fromJson(e))
              .toList() ??
          [],
      encouragement: json['encouragement'] ?? '',
      modelUsed: json['model_used'] ?? 'gemini-2.5-flash',
    );
  }
}

class FlashcardModel {
  final String front;
  final String back;

  FlashcardModel({required this.front, required this.back});

  factory FlashcardModel.fromJson(Map<String, dynamic> json) {
    return FlashcardModel(
      front: json['front'] ?? '',
      back: json['back'] ?? '',
    );
  }
}

class NotesConceptModel {
  final String name;
  final String definition;
  final String importance;

  NotesConceptModel({
    required this.name,
    required this.definition,
    required this.importance,
  });

  factory NotesConceptModel.fromJson(Map<String, dynamic> json) {
    return NotesConceptModel(
      name: json['name'] ?? '',
      definition: json['definition'] ?? '',
      importance: json['importance'] ?? '',
    );
  }
}

class NotesAnalysisResponseModel {
  final String summary;
  final List<NotesConceptModel> keyConcepts;
  final Map<String, String> definitions;
  final List<FlashcardModel> flashcards;
  final List<String> suggestedPrerequisites;
  final bool isAiGenerated;
  final String disclaimer;
  final String modelUsed;

  NotesAnalysisResponseModel({
    required this.summary,
    required this.keyConcepts,
    required this.definitions,
    required this.flashcards,
    required this.suggestedPrerequisites,
    this.isAiGenerated = true,
    required this.disclaimer,
    this.modelUsed = 'gemini-2.5-pro',
  });

  factory NotesAnalysisResponseModel.fromJson(Map<String, dynamic> json) {
    var defsRaw = json['definitions'] as Map<String, dynamic>? ?? {};
    Map<String, String> defs = {};
    defsRaw.forEach((k, v) => defs[k] = v.toString());

    return NotesAnalysisResponseModel(
      summary: json['summary'] ?? '',
      keyConcepts: (json['key_concepts'] as List<dynamic>?)
              ?.map((e) => NotesConceptModel.fromJson(e))
              .toList() ??
          [],
      definitions: defs,
      flashcards: (json['flashcards'] as List<dynamic>?)
              ?.map((e) => FlashcardModel.fromJson(e))
              .toList() ??
          [],
      suggestedPrerequisites: (json['suggested_prerequisites'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      isAiGenerated: json['is_ai_generated'] ?? true,
      disclaimer: json['disclaimer'] ?? '',
      modelUsed: json['model_used'] ?? 'gemini-2.5-pro',
    );
  }
}
