import 'package:flutter/foundation.dart';
import '../models/diagnostic.dart';
import '../models/question.dart';
import '../services/api_service.dart';

class DiagnosticProvider with ChangeNotifier {
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  DiagnosticStatusModel? _sessionState;
  DiagnosticStatusModel? get sessionState => _sessionState;

  LearningProfileModel? _learningProfile;
  LearningProfileModel? get learningProfile => _learningProfile;

  String? _selectedOptionId;
  String? get selectedOptionId => _selectedOptionId;

  AttemptResultModel? _lastAttemptResult;
  AttemptResultModel? get lastAttemptResult => _lastAttemptResult;

  bool _isSubmitting = false;
  bool get isSubmitting => _isSubmitting;

  Future<void> startDiagnostic(String subjectId, String topicId) async {
    _isLoading = true;
    _learningProfile = null;
    _lastAttemptResult = null;
    _selectedOptionId = null;
    notifyListeners();

    try {
      _sessionState = await ApiService.startDiagnostic(subjectId, topicId);
    } catch (e) {
      debugPrint("Error starting diagnostic: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> resumeDiagnostic(String diagnosticId) async {
    _isLoading = true;
    _lastAttemptResult = null;
    _selectedOptionId = null;
    notifyListeners();

    try {
      _sessionState = await ApiService.getDiagnosticState(diagnosticId);
    } catch (e) {
      debugPrint("Error resuming diagnostic: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void selectOption(String optionId) {
    if (_lastAttemptResult != null) return; // Locked once evaluated
    _selectedOptionId = optionId;
    notifyListeners();
  }

  Future<void> submitCurrentAnswer() async {
    if (_sessionState == null || _sessionState!.currentQuestion == null || _selectedOptionId == null) {
      return;
    }

    _isSubmitting = true;
    notifyListeners();

    try {
      final currentQ = _sessionState!.currentQuestion!;
      _lastAttemptResult = await ApiService.submitAttempt(
        questionId: currentQ.id,
        selectedOptionId: _selectedOptionId!,
        sessionId: _sessionState!.diagnosticId,
      );
    } catch (e) {
      debugPrint("Error submitting attempt: $e");
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  Future<void> advanceOrComplete() async {
    if (_sessionState == null) return;

    _isLoading = true;
    _selectedOptionId = null;
    _lastAttemptResult = null;
    notifyListeners();

    try {
      final state = await ApiService.getDiagnosticState(_sessionState!.diagnosticId);
      if (state != null && state.currentQuestion != null) {
        _sessionState = state;
      } else {
        // Complete the assessment and fetch learning profile
        _learningProfile = await ApiService.completeDiagnostic(_sessionState!.diagnosticId);
      }
    } catch (e) {
      debugPrint("Error advancing diagnostic: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
