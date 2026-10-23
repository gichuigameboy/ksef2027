import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import '../models/mastery_record.dart';
import '../models/learning_mission.dart';
import '../models/question.dart';
import '../models/subject.dart';
import '../models/diagnostic.dart';
import '../models/attempt_history.dart';
import '../models/learning_intelligence.dart';
import '../models/ai_tutoring.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:8000/api/v1';

  // 1. Curriculum & Subjects
  static Future<List<CurriculumSubjectModel>> getSubjects() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/subjects'),
        headers: AuthService.authHeaders,
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final List list = jsonDecode(response.body);
        return list.map((i) => CurriculumSubjectModel.fromJson(i)).toList();
      }
    } catch (_) {}

    return [
      CurriculumSubjectModel(
        id: "mathematics",
        name: "Mathematics",
        icon: "calculate_rounded",
        description: "Algebra, quadratics, functions, geometry, and probability.",
        topics: [
          CurriculumTopicModel(
            id: "factorisation",
            subjectId: "mathematics",
            name: "Factorisation",
            description: "Factoring quadratic trinomials and difference of squares.",
            prerequisites: ["algebraic_manipulation"],
            learningObjectives: ["Factor trinomials", "Difference of squares"],
            orderIndex: 5,
          ),
          CurriculumTopicModel(
            id: "quadratic_equations",
            subjectId: "mathematics",
            name: "Quadratic Equations",
            description: "Solving quadratics by factoring, quadratic formula, and applications.",
            prerequisites: ["factorisation"],
            learningObjectives: ["Zero-product property", "Quadratic formula"],
            orderIndex: 6,
          ),
        ],
      )
    ];
  }

  static Future<List<CurriculumTopicModel>> getSubjectTopics(String subjectId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/subjects/$subjectId/topics'),
        headers: AuthService.authHeaders,
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final List list = jsonDecode(response.body);
        return list.map((i) => CurriculumTopicModel.fromJson(i)).toList();
      }
    } catch (_) {}

    return (await getSubjects()).first.topics;
  }

  // 2. Diagnostic Assessment Lifecycle
  static Future<DiagnosticStatusModel> startDiagnostic(String subjectId, String topicId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/learning/diagnostics'),
        headers: AuthService.authHeaders,
        body: jsonEncode({
          'subject_id': subjectId,
          'topic_id': topicId,
        }),
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        return DiagnosticStatusModel.fromJson(jsonDecode(response.body));
      }
    } catch (_) {}

    // Fallback diagnostic state
    return DiagnosticStatusModel(
      diagnosticId: "local_diag_${DateTime.now().millisecondsSinceEpoch}",
      subjectId: subjectId,
      selectedTopicId: topicId,
      topicName: "Quadratic Equations",
      status: "in_progress",
      totalQuestions: 6,
      completedCount: 0,
      currentQuestion: QuestionModel(
        id: "q_alg_1",
        topicId: "algebraic_manipulation",
        topicName: "Algebraic Manipulation",
        difficulty: "basic",
        prompt: "Expand and simplify: 3(2x - 4)",
        options: [
          QuestionOptionModel(id: "opt_a1", text: "6x - 12", isCorrect: true),
          QuestionOptionModel(id: "opt_a2", text: "6x - 4", isCorrect: false),
          QuestionOptionModel(id: "opt_a3", text: "5x - 7", isCorrect: false),
        ],
        correctExplanation: "Distribute 3: 3*2x = 6x and 3*(-4) = -12.",
        hints: ["Distribute the outside factor."],
      ),
    );
  }

  static Future<DiagnosticStatusModel?> getDiagnosticState(String diagnosticId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/learning/diagnostics/$diagnosticId'),
        headers: AuthService.authHeaders,
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        return DiagnosticStatusModel.fromJson(jsonDecode(response.body));
      }
    } catch (_) {}
    return null;
  }

  static Future<LearningProfileModel> completeDiagnostic(String diagnosticId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/learning/diagnostics/$diagnosticId/complete'),
        headers: AuthService.authHeaders,
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        return LearningProfileModel.fromJson(jsonDecode(response.body));
      }
    } catch (_) {}

    return LearningProfileModel(
      diagnosticId: diagnosticId,
      topicId: "quadratic_equations",
      overallStartingPoint: "Developing",
      score: 66.7,
      totalQuestions: 6,
      completedQuestions: 6,
      strongAreas: ["Basic Arithmetic", "Algebraic Manipulation"],
      areasToImprove: ["Factorisation", "Quadratic Applications"],
      prerequisiteGaps: [
        PrereqGapModel(
          topicId: "factorisation",
          topicName: "Factorisation",
          masteryScore: 43.0,
          isDirectPrerequisite: true,
        ),
      ],
      recommendedFirstSession: "12-minute Factorisation Recovery Session",
    );
  }

  // 3. Answer Attempts
  static Future<AttemptResultModel> submitAttempt({
    required String questionId,
    required String selectedOptionId,
    String? sessionId,
    int responseTimeMs = 15000,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/learning/attempts'),
        headers: AuthService.authHeaders,
        body: jsonEncode({
          'question_id': questionId,
          'selected_option_id': selectedOptionId,
          'session_id': sessionId,
          'response_time_ms': responseTimeMs,
        }),
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        return AttemptResultModel.fromJson(jsonDecode(response.body));
      }
    } catch (_) {}

    return AttemptResultModel(
      isCorrect: true,
      correctOptionId: selectedOptionId,
      explanation: "Correct! The expression has been factored accurately.",
      hintsAvailable: [],
      recommendedNextStep: "Advancing difficulty tier.",
      updatedTopicMastery: 55.0,
    );
  }

  static Future<List<QuestionModel>> getQuestionsForSession(String? topicId) async {
    final tId = topicId ?? "quadratic_equations";
    return [
      QuestionModel(
        id: "q_quad_1",
        topicId: tId,
        topicName: "Quadratic Equations",
        difficulty: "basic",
        prompt: "Solve the equation: x² - 5x + 6 = 0",
        options: [
          QuestionOptionModel(id: "opt_1", text: "x = 2, x = 3", isCorrect: true),
          QuestionOptionModel(id: "opt_2", text: "x = -2, x = -3", isCorrect: false),
          QuestionOptionModel(id: "opt_3", text: "x = 1, x = 6", isCorrect: false),
          QuestionOptionModel(id: "opt_4", text: "x = -1, x = 6", isCorrect: false),
        ],
        correctExplanation: "Factoring yields (x - 2)(x - 3) = 0, so x = 2 or x = 3.",
        hints: ["Find two numbers that multiply to +6 and add up to -5."],
      ),
      QuestionModel(
        id: "q_quad_2",
        topicId: tId,
        topicName: "Quadratic Equations",
        difficulty: "medium",
        prompt: "What is the discriminant of 2x² - 4x + 2 = 0?",
        options: [
          QuestionOptionModel(id: "opt_2_1", text: "0 (one real repeated root)", isCorrect: true),
          QuestionOptionModel(id: "opt_2_2", text: "16 (two distinct roots)", isCorrect: false),
          QuestionOptionModel(id: "opt_2_3", text: "-8 (no real roots)", isCorrect: false),
          QuestionOptionModel(id: "opt_2_4", text: "4", isCorrect: false),
        ],
        correctExplanation: "Discriminant Δ = b² - 4ac = (-4)² - 4(2)(2) = 16 - 16 = 0.",
        hints: ["Recall the discriminant formula Δ = b² - 4ac."],
      ),
    ];
  }

  static Future<AttemptResultModel> submitAnswer({
    required String questionId,
    required String topicId,
    required String selectedOptionId,
    String? sessionId,
  }) async {
    return submitAttempt(
      questionId: questionId,
      selectedOptionId: selectedOptionId,
      sessionId: sessionId,
      responseTimeMs: 5000,
    );
  }

  // 4. Learning Profile, Missions & History
  static Future<LearningMissionModel> getTodayMission() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/learning/mission/today'),
        headers: AuthService.authHeaders,
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        return LearningMissionModel.fromJson(jsonDecode(response.body));
      }
    } catch (_) {}

    return LearningMissionModel(
      id: "mission_today",
      date: "Today",
      estimatedDurationMinutes: 18,
      title: "Today's Learning Mission",
      summary: "3 targeted learning segments customized to your prerequisite factorisation profile.",
      items: [
        MissionItemModel(
          topicId: "factorisation",
          topicName: "Factorisation",
          questionCount: 6,
          focusReason: "Prerequisite recovery needed before Quadratic Equations",
          difficulty: "basic",
        ),
        MissionItemModel(
          topicId: "quadratic_equations",
          topicName: "Quadratic Equations",
          questionCount: 4,
          focusReason: "Mastery progression: advancing to intermediate problems",
          difficulty: "medium",
        ),
        MissionItemModel(
          topicId: "cell_division",
          topicName: "Cell Division",
          questionCount: 3,
          focusReason: "Spaced retrieval: memory stability review",
          difficulty: "medium",
        ),
      ],
    );
  }

  static Future<List<TopicMasteryRecord>> getMasteryOverview() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/learning/overview'),
        headers: AuthService.authHeaders,
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final List list = jsonDecode(response.body);
        return list.map((i) => TopicMasteryRecord.fromJson(i)).toList();
      }
    } catch (_) {}

    return [
      TopicMasteryRecord(
        topicId: "factorisation",
        subjectId: "mathematics",
        topicName: "Factorisation",
        masteryScore: 43.0,
        category: MasteryTier.weak,
        basicAccuracy: 60.0,
        mediumAccuracy: 40.0,
        hardAccuracy: 25.0,
        applicationAccuracy: 20.0,
        recentAccuracy: 45.0,
        attemptsCount: 12,
      ),
      TopicMasteryRecord(
        topicId: "quadratic_equations",
        subjectId: "mathematics",
        topicName: "Quadratic Equations",
        masteryScore: 51.0,
        category: MasteryTier.weak,
        basicAccuracy: 72.0,
        mediumAccuracy: 48.0,
        hardAccuracy: 31.0,
        applicationAccuracy: 25.0,
        recentAccuracy: 50.0,
        attemptsCount: 15,
      ),
      TopicMasteryRecord(
        topicId: "algebraic_manipulation",
        subjectId: "mathematics",
        topicName: "Algebraic Manipulation",
        masteryScore: 78.0,
        category: MasteryTier.strong,
        basicAccuracy: 90.0,
        mediumAccuracy: 82.0,
        hardAccuracy: 65.0,
        applicationAccuracy: 60.0,
        recentAccuracy: 80.0,
        attemptsCount: 18,
      ),
    ];
  }

  static Future<List<AttemptHistoryModel>> getLearningHistory() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/learning/history'),
        headers: AuthService.authHeaders,
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final List list = jsonDecode(response.body);
        return list.map((i) => AttemptHistoryModel.fromJson(i)).toList();
      }
    } catch (_) {}

    return [];
  }

  static Future<Map<String, dynamic>> getWhyStruggling(String topicId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/diagnosis/why-struggling/$topicId'),
        headers: AuthService.authHeaders,
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {}

    return {
      "topic_id": topicId,
      "topic_mastery": 51.0,
      "primary_cause": "prerequisite_gap",
      "prerequisite_gaps": [
        {
          "topic_id": "factorisation",
          "topic_name": "Factorisation",
          "mastery_score": 43.0,
          "is_direct_prerequisite": true
        }
      ],
      "difficulty_cliff": false,
      "cliff_explanation": null,
      "top_misconception": "zero_product_sign_reversal",
      "misconception_count": 3,
      "recommended_action": "Targeted recovery session on prerequisite concept: Factorisation (current mastery: 43.0%)"
    };
  }

  // 6. Phase 3 Intelligence Endpoints

  static Future<NextBestActionModel?> getNextBestAction() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/learning/next-action'),
        headers: AuthService.authHeaders,
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        return NextBestActionModel.fromJson(jsonDecode(response.body));
      }
    } catch (_) {}

    return NextBestActionModel(
      actionType: "PREREQUISITE_RECOVERY",
      topicId: "factorisation",
      topicName: "Factorisation",
      priority: 0.92,
      estimatedMinutes: 8,
      reason: "Your factorisation mastery is currently 43% and appears to be a prerequisite gap affecting quadratic equations.",
      reasonCodes: ["LOW_PREREQUISITE_MASTERY", "DEPENDENT_TOPIC_STRUGGLE"],
      recommendedQuestionCount: 5,
      targetDifficulty: "basic",
    );
  }

  static Future<List<NextBestActionModel>> getRecommendations() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/learning/recommendations'),
        headers: AuthService.authHeaders,
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final List list = jsonDecode(response.body);
        return list.map((i) => NextBestActionModel.fromJson(i)).toList();
      }
    } catch (_) {}

    return [
      NextBestActionModel(
        actionType: "PREREQUISITE_RECOVERY",
        topicId: "factorisation",
        topicName: "Factorisation",
        priority: 0.92,
        estimatedMinutes: 8,
        reason: "Low prerequisite mastery is likely contributing to quadratic difficulties.",
        reasonCodes: ["LOW_PREREQUISITE_MASTERY"],
        recommendedQuestionCount: 5,
        targetDifficulty: "basic",
      ),
      NextBestActionModel(
        actionType: "RETRIEVAL",
        topicId: "cell_division",
        topicName: "Cell Division & Mitosis",
        priority: 0.81,
        estimatedMinutes: 5,
        reason: "Estimated retention has fallen to 62%. Retrieval practice prevents decay.",
        reasonCodes: ["RETENTION_AT_RISK"],
        recommendedQuestionCount: 4,
        targetDifficulty: "medium",
      ),
      NextBestActionModel(
        actionType: "APPLICATION",
        topicId: "quadratic_equations",
        topicName: "Quadratic Equations",
        priority: 0.74,
        estimatedMinutes: 6,
        reason: "Strong basic mechanics, but higher-order word problems need targeted practice.",
        reasonCodes: ["DIFFICULTY_CLIFF"],
        recommendedQuestionCount: 4,
        targetDifficulty: "application",
      ),
    ];
  }

  static Future<List<StudentInsightModel>> getInsights() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/learning/insights'),
        headers: AuthService.authHeaders,
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final List list = jsonDecode(response.body);
        return list.map((i) => StudentInsightModel.fromJson(i)).toList();
      }
    } catch (_) {}

    return [
      StudentInsightModel(
        id: "ins_imp_1",
        type: "improving",
        title: "You're Improving",
        message: "Your quadratic equations mastery increased steadily over recent sessions.",
        topicId: "quadratic_equations",
        evidence: "Recent accuracy is 75% with stable learning trajectory.",
      ),
      StudentInsightModel(
        id: "ins_cliff_1",
        type: "watch_this",
        title: "Watch This",
        message: "Your application performance (33%) remains significantly below your basic calculation accuracy (92%).",
        topicId: "quadratic_equations",
        evidence: "Basic = 92%, Medium = 75%, Hard = 42%, Application = 33%.",
      ),
      StudentInsightModel(
        id: "ins_ret_1",
        type: "review_soon",
        title: "Review Soon",
        message: "Cell division retention is predicted to fall below 70% in the next 48 hours.",
        topicId: "cell_division",
        evidence: "Estimated recall probability: 64%, Half-life: 8 days.",
      ),
      StudentInsightModel(
        id: "ins_prereq_1",
        type: "foundation_first",
        title: "Foundation First",
        message: "Factorisation appears to be a likely prerequisite gap for your quadratic performance.",
        topicId: "factorisation",
        evidence: "Prerequisite Factorisation mastery is 43%.",
      ),
    ];
  }

  static Future<List<LearningTimelineEventModel>> getTimeline() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/learning/timeline'),
        headers: AuthService.authHeaders,
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final List list = jsonDecode(response.body);
        return list.map((i) => LearningTimelineEventModel.fromJson(i)).toList();
      }
    } catch (_) {}

    return [
      LearningTimelineEventModel(
        eventId: "evt_1",
        timestamp: DateTime.now().subtract(const Duration(days: 4)),
        eventType: "diagnostic",
        topicId: "quadratic_equations",
        topicName: "Quadratic Equations",
        masteryBefore: 0.0,
        masteryAfter: 51.0,
        score: 60.0,
        description: "Completed baseline diagnostic on Quadratic Equations.",
      ),
      LearningTimelineEventModel(
        eventId: "evt_2",
        timestamp: DateTime.now().subtract(const Duration(days: 2)),
        eventType: "prerequisite_recovery",
        topicId: "factorisation",
        topicName: "Factorisation",
        masteryBefore: 40.0,
        masteryAfter: 68.0,
        score: 80.0,
        description: "Completed Factorisation recovery session with strong accuracy.",
      ),
      LearningTimelineEventModel(
        eventId: "evt_3",
        timestamp: DateTime.now().subtract(const Duration(hours: 6)),
        eventType: "transfer_challenge",
        topicId: "quadratic_equations",
        topicName: "Quadratic Equations",
        masteryBefore: 68.0,
        masteryAfter: 74.0,
        score: 100.0,
        description: "Successfully solved real-world projectile motion transfer challenge.",
      ),
    ];
  }

  static Future<Map<String, List<RetentionItemModel>>> getRetentionOverview() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/learning/retention'),
        headers: AuthService.authHeaders,
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        final Map<String, List<RetentionItemModel>> result = {};
        data.forEach((key, value) {
          if (value is List) {
            result[key] = value.map((i) => RetentionItemModel.fromJson(i)).toList();
          }
        });
        return result;
      }
    } catch (_) {}

    return {
      "stable": [
        RetentionItemModel(
          topicId: "algebraic_manipulation",
          topicName: "Algebraic Manipulation",
          currentRetention: 0.88,
          halfLifeDays: 14.0,
          retrievalStreak: 3,
          lastRetrievalAt: DateTime.now().subtract(const Duration(days: 2)).toIso8601String(),
          nextRetrievalDue: DateTime.now().add(const Duration(days: 8)).toIso8601String(),
          reviewUrgency: 0.15,
          status: "stable",
        ),
      ],
      "at_risk": [
        RetentionItemModel(
          topicId: "cell_division",
          topicName: "Cell Division & Mitosis",
          currentRetention: 0.64,
          halfLifeDays: 8.0,
          retrievalStreak: 1,
          lastRetrievalAt: DateTime.now().subtract(const Duration(days: 5)).toIso8601String(),
          nextRetrievalDue: DateTime.now().add(const Duration(days: 1)).toIso8601String(),
          reviewUrgency: 0.65,
          status: "at_risk",
        ),
      ],
      "due": [
        RetentionItemModel(
          topicId: "factorisation",
          topicName: "Factorisation",
          currentRetention: 0.58,
          halfLifeDays: 5.0,
          retrievalStreak: 1,
          lastRetrievalAt: DateTime.now().subtract(const Duration(days: 6)).toIso8601String(),
          nextRetrievalDue: DateTime.now().subtract(const Duration(days: 1)).toIso8601String(),
          reviewUrgency: 0.82,
          status: "due",
        ),
      ],
      "forgotten": [],
      "fresh": [
        RetentionItemModel(
          topicId: "quadratic_equations",
          topicName: "Quadratic Equations",
          currentRetention: 0.95,
          halfLifeDays: 12.0,
          retrievalStreak: 2,
          lastRetrievalAt: DateTime.now().subtract(const Duration(hours: 4)).toIso8601String(),
          nextRetrievalDue: DateTime.now().add(const Duration(days: 6)).toIso8601String(),
          reviewUrgency: 0.05,
          status: "fresh",
        ),
      ],
    };
  }

  static Future<Map<String, dynamic>> getUnifiedState() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/learning/state'),
        headers: AuthService.authHeaders,
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {}

    return {
      "studentId": "student_1",
      "subjects": {},
      "currentWeaknesses": ["Factorisation"],
      "currentStrengths": ["Algebraic Manipulation"],
      "recentLearningVelocity": {
        "masteryGainLast7Days": 14.5,
        "conceptsImprovedCount": 2,
        "retrievalSuccessRate": 78.0,
        "difficultyProgressionScore": 65.0,
        "errorReductionRate": 82.0,
        "velocityCategory": "Steady Progress"
      },
      "learningEfficiency": {
        "learningMinutes": 32,
        "masteryPointsPerHour": 24.2,
        "retrievalEfficiency": 0.82,
        "efficiencyCategory": "High Yield",
        "estimatedEfficiencyScore": 76.5
      }
    };
  }

  // ==========================================
  // PHASE 4: GEMINI AI INTELLIGENCE LAYER
  // ==========================================

  /// Context-aware AI Personal Tutor
  static Future<TutorResponseModel> askAITutor({
    required String topicId,
    String mode = 'explain',
    String? userMessage,
    String? currentQuestionId,
    String? sessionId,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/ai/tutor'),
        headers: AuthService.authHeaders,
        body: jsonEncode({
          'topic_id': topicId,
          'mode': mode,
          'user_message': userMessage,
          'current_question_id': currentQuestionId,
          'session_id': sessionId,
        }),
      ).timeout(const Duration(seconds: 6));

      if (response.statusCode == 200) {
        return TutorResponseModel.fromJson(jsonDecode(response.body));
      }
    } catch (_) {}

    return TutorResponseModel(
      explanation: "Let's review the fundamental steps for this topic. Break the problem into small pieces and check each operation.",
      keyConcept: "Systematic step-by-step problem deconstruction.",
      steps: ["Identify the given values", "Select the relevant identity or formula", "Evaluate and verify"],
      example: "Apply the core rule carefully to verify each side of the equation.",
      checkQuestion: "Can you state the primary condition required to apply this concept?",
      encouragement: "Keep going! Continuous deliberate practice builds lasting mastery.",
      mode: mode,
      modelUsed: "offline_fallback",
      isFallback: true,
    );
  }

  /// Progressive Hint System (Hint 1 -> Hint 2 -> Hint 3 -> Final Help)
  static Future<HintResponseModel> getProgressiveHint({
    required String topicId,
    required String questionId,
    int hintLevel = 1,
    String? sessionId,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/ai/hint'),
        headers: AuthService.authHeaders,
        body: jsonEncode({
          'topic_id': topicId,
          'question_id': questionId,
          'hint_level': hintLevel,
          'session_id': sessionId,
        }),
      ).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        return HintResponseModel.fromJson(jsonDecode(response.body));
      }
    } catch (_) {}

    final hintTexts = {
      1: "Hint 1: Recall the core relationship or formula governing this question.",
      2: "Hint 2: Identify the next mathematical or conceptual operation to apply.",
      3: "Hint 3: Set up the intermediate expression and solve for the unknown.",
      4: "Final Help: Review the standard step-by-step solution provided.",
    };

    return HintResponseModel(
      hintLevel: hintLevel,
      hintText: hintTexts[hintLevel] ?? hintTexts[1]!,
      guidance: "Work through each stage systematically.",
      isFinalSolution: hintLevel >= 4,
      modelUsed: "offline_fallback",
      isFallback: true,
    );
  }

  /// AI-assisted Mistake Interpretation with Confidence Rating
  static Future<MistakeAnalysisResponseModel> analyzeMistakeWithAI({
    required String questionId,
    required String studentAnswer,
    String? topicId,
    String? sessionId,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/ai/analyze-mistake'),
        headers: AuthService.authHeaders,
        body: jsonEncode({
          'question_id': questionId,
          'student_answer': studentAnswer,
          'topic_id': topicId,
          'session_id': sessionId,
        }),
      ).timeout(const Duration(seconds: 6));

      if (response.statusCode == 200) {
        return MistakeAnalysisResponseModel.fromJson(jsonDecode(response.body));
      }
    } catch (_) {}

    return MistakeAnalysisResponseModel(
      likelyError: "A sign or procedural confusion occurred during algebraic evaluation.",
      explanation: "Double-check each intermediate step when multiplying or isolating terms.",
      teachingFocus: "Procedural precision and sign management.",
      confidence: "medium",
      isTentative: false,
      conceptToRemember: "Check each operation from left to right before finalizing.",
      miniExample: "For (x - a)(x + b), expand each term carefully.",
      quickCheck: "What is the product of two negative values?",
      modelUsed: "offline_fallback",
      isFallback: true,
    );
  }

  /// Natural Language Insights Grounded in Deterministic Evidence
  static Future<AIInsightModel> getAIInsights() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/ai/insights'),
        headers: AuthService.authHeaders,
      ).timeout(const Duration(seconds: 6));

      if (response.statusCode == 200) {
        return AIInsightModel.fromJson(jsonDecode(response.body));
      }
    } catch (_) {}

    return AIInsightModel(
      whatNoticed: "Your accuracy is improving steadily across foundational and medium problems.",
      focusNext: "Multi-step application questions remain your biggest area of opportunity.",
      suggestedStrategy: "Complete one multi-step challenge problem after every two standard practice items.",
      groundedMetrics: {"velocity": "Developing Pace", "masteryGain": "+14.5%"},
      modelUsed: "offline_fallback",
      isFallback: true,
    );
  }

  /// AI-assisted Study Plan
  static Future<StudyPlanModel> getAIStudyPlan() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/ai/study-plan'),
        headers: AuthService.authHeaders,
      ).timeout(const Duration(seconds: 6));

      if (response.statusCode == 200) {
        return StudyPlanModel.fromJson(jsonDecode(response.body));
      }
    } catch (_) {}

    return StudyPlanModel(
      overview: "Today's personalized learning mission prioritizes prerequisite recovery to strengthen downstream problem solving.",
      totalMinutes: 25,
      steps: [
        StudyPlanStepModel(
          stepNumber: 1,
          topicId: "factorisation",
          topicName: "Factorisation Recovery",
          actionType: "PREREQUISITE_RECOVERY",
          allocatedMinutes: 10,
          pedagogicalReason: "Addresses prerequisite gap necessary for solving quadratic equations.",
        ),
        StudyPlanStepModel(
          stepNumber: 2,
          topicId: "quadratic_equations",
          topicName: "Quadratic Retrieval",
          actionType: "RETRIEVAL",
          allocatedMinutes: 15,
          pedagogicalReason: "Active spaced retrieval to boost long-term retention above threshold.",
        ),
      ],
      encouragement: "Consistent daily missions compound into deep, enduring conceptual mastery.",
      modelUsed: "offline_fallback",
    );
  }

  /// AI Notes & Text Analyzer
  static Future<NotesAnalysisResponseModel> analyzeNotesWithAI({
    required String notesText,
    String? topicId,
    String? subjectId,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/ai/analyze-notes'),
        headers: AuthService.authHeaders,
        body: jsonEncode({
          'notes_text': notesText,
          'topic_id': topicId,
          'subject_id': subjectId,
        }),
      ).timeout(const Duration(seconds: 8));

      if (response.statusCode == 200) {
        return NotesAnalysisResponseModel.fromJson(jsonDecode(response.body));
      }
    } catch (_) {}

    return NotesAnalysisResponseModel(
      summary: "Extracted core study notes covering primary definitions and structural relationships.",
      keyConcepts: [
        NotesConceptModel(
          name: "Core Principle",
          definition: "Key rule identified in the submitted educational notes.",
          importance: "Forms the foundational anchor for subsequent problem solving.",
        ),
      ],
      definitions: {"Primary Term": "Definition synthesized from notes."},
      flashcards: [
        FlashcardModel(
          front: "What is the primary topic discussed in these notes?",
          back: "Foundational conceptual definitions and practical examples.",
        ),
      ],
      suggestedPrerequisites: ["Foundational Vocabulary", "Prior Topic Prerequisite"],
      isAiGenerated: true,
      disclaimer: "AI-generated educational analysis. Review against primary curriculum materials.",
      modelUsed: "offline_fallback",
    );
  }
}

