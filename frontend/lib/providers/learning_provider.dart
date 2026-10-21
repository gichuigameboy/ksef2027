import 'package:flutter/foundation.dart';
import '../models/mastery_record.dart';
import '../models/learning_mission.dart';
import '../models/question.dart';
import '../services/api_service.dart';

class LearningProvider with ChangeNotifier {
  bool _isLoading = true;
  bool get isLoading => _isLoading;

  LearningMissionModel? _mission;
  LearningMissionModel? get mission => _mission;

  List<TopicMasteryRecord> _masteries = [];
  List<TopicMasteryRecord> get masteries => _masteries;

  // Active Session state
  List<QuestionModel> _activeQuestions = [];
  List<QuestionModel> get activeQuestions => _activeQuestions;
  int _currentQuestionIndex = 0;
  int get currentQuestionIndex => _currentQuestionIndex;
  
  AttemptResultModel? _lastAttemptResult;
  AttemptResultModel? get lastAttemptResult => _lastAttemptResult;

  String? _selectedOptionId;
  String? get selectedOptionId => _selectedOptionId;

  bool _isSubmitting = false;
  bool get isSubmitting => _isSubmitting;

  Future<void> loadDashboardData() async {
    _isLoading = true;
    notifyListeners();

    try {
      final missionFuture = ApiService.getTodayMission();
      final masteriesFuture = ApiService.getMasteryOverview();

      final results = await Future.wait([missionFuture, masteriesFuture]);
      _mission = results[0] as LearningMissionModel;
      _masteries = results[1] as List<TopicMasteryRecord>;
    } catch (e) {
      debugPrint('Error loading dashboard: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> startSession(String? topicId) async {
    _isLoading = true;
    _currentQuestionIndex = 0;
    _lastAttemptResult = null;
    _selectedOptionId = null;
    notifyListeners();

    try {
      _activeQuestions = await ApiService.getQuestionsForSession(topicId);
    } catch (e) {
      debugPrint('Error loading session questions: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void selectOption(String optionId) {
    if (_lastAttemptResult != null) return; // Answer already revealed
    _selectedOptionId = optionId;
    notifyListeners();
  }

  Future<void> submitAnswer() async {
    if (_selectedOptionId == null || _isSubmitting) return;

    final currentQuestion = _activeQuestions[_currentQuestionIndex];
    _isSubmitting = true;
    notifyListeners();

    try {
      _lastAttemptResult = await ApiService.submitAnswer(
        questionId: currentQuestion.id,
        topicId: currentQuestion.topicId,
        selectedOptionId: _selectedOptionId!,
      );

      // Refresh masteries in background to reflect real-time progress
      loadDashboardData();
    } catch (e) {
      debugPrint('Error submitting answer: $e');
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  void nextQuestion() {
    if (_currentQuestionIndex < _activeQuestions.length - 1) {
      _currentQuestionIndex++;
      _selectedOptionId = null;
      _lastAttemptResult = null;
      notifyListeners();
    }
  }
}
