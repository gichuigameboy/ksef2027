import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/learning_provider.dart';
import '../../models/question.dart';
import '../../models/ai_tutoring.dart';
import '../../services/api_service.dart';
import 'ai_tutor_screen.dart';

class SessionScreen extends StatefulWidget {
  final String topicTitle;
  final String? topicId;

  const SessionScreen({
    Key? key,
    String? topicTitle,
    String? topicName,
    this.topicId,
  }) : topicTitle = topicTitle ?? topicName ?? "Practice Session",
       super(key: key);

  @override
  State<SessionScreen> createState() => _SessionScreenState();
}

class _SessionScreenState extends State<SessionScreen> {
  int _currentHintLevel = 0;
  HintResponseModel? _activeHint;
  bool _isLoadingHint = false;

  MistakeAnalysisResponseModel? _aiMistakeAnalysis;
  bool _isLoadingMistake = false;

  void _requestNextProgressiveHint(String topicId, String questionId) async {
    if (_isLoadingHint) return;

    final nextLevel = (_currentHintLevel < 4) ? _currentHintLevel + 1 : 4;
    setState(() => _isLoadingHint = true);

    try {
      final hintRes = await ApiService.getProgressiveHint(
        topicId: topicId,
        questionId: questionId,
        hintLevel: nextLevel,
      );
      setState(() {
        _currentHintLevel = nextLevel;
        _activeHint = hintRes;
        _isLoadingHint = false;
      });
    } catch (_) {
      setState(() => _isLoadingHint = false);
    }
  }

  void _requestAIMistakeAnalysis(String questionId, String studentAnswer, String topicId) async {
    if (_isLoadingMistake) return;

    setState(() => _isLoadingMistake = true);
    try {
      final analysis = await ApiService.analyzeMistakeWithAI(
        questionId: questionId,
        studentAnswer: studentAnswer,
        topicId: topicId,
      );
      setState(() {
        _aiMistakeAnalysis = analysis;
        _isLoadingMistake = false;
      });
    } catch (_) {
      setState(() => _isLoadingMistake = false);
    }
  }

  void _resetQuestionAIState() {
    setState(() {
      _currentHintLevel = 0;
      _activeHint = null;
      _aiMistakeAnalysis = null;
      _isLoadingHint = false;
      _isLoadingMistake = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.topicTitle, style: AppTypography.titleMedium),
        elevation: 0,
        backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
        foregroundColor: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.auto_awesome, color: AppColors.primaryGreen),
            tooltip: "Open AI Tutor",
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => AITutorScreen(
                    topicId: "current_topic",
                    topicTitle: widget.topicTitle,
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: Consumer<LearningProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator(color: AppColors.primaryGreen));
          }

          if (provider.activeQuestions.isEmpty) {
            return Center(
              child: Text(
                "No practice questions currently queued.",
                style: AppTypography.bodyMedium,
              ),
            );
          }

          final question = provider.activeQuestions[provider.currentQuestionIndex];
          final result = provider.lastAttemptResult;

          return Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 720),
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                children: [
                  // Step Progress Indicator
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "Question ${provider.currentQuestionIndex + 1} of ${provider.activeQuestions.length}",
                        style: AppTypography.bodySmall.copyWith(
                          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightBorderSubtle,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          question.difficulty.toUpperCase(),
                          style: AppTypography.bodySmall.copyWith(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primaryGreen,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: (provider.currentQuestionIndex + 1) / provider.activeQuestions.length,
                      backgroundColor: isDark ? AppColors.darkSurface : AppColors.lightBorder,
                      valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primaryGreen),
                      minHeight: 5,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Question Prompt Card
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            question.prompt,
                            style: AppTypography.titleLarge.copyWith(
                              fontSize: 18,
                              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                            ),
                          ),

                          const SizedBox(height: 16),
                          // In-Question AI Scaffolding Toolbar
                          Row(
                            children: [
                              OutlinedButton.icon(
                                icon: _isLoadingHint
                                    ? const SizedBox(
                                        width: 14,
                                        height: 14,
                                        child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primaryGreen),
                                      )
                                    : const Icon(Icons.lightbulb_outline_rounded, size: 16),
                                label: Text(
                                  _currentHintLevel == 0
                                      ? "Get Hint"
                                      : (_currentHintLevel >= 4 ? "Full Solution" : "Hint $_currentHintLevel (Next)"),
                                  style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600),
                                ),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: AppColors.primaryGreen,
                                  side: const BorderSide(color: AppColors.primaryGreen),
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                ),
                                onPressed: () => _requestNextProgressiveHint(question.topicId, question.id),
                              ),
                              const SizedBox(width: 8),
                              TextButton.icon(
                                icon: const Icon(Icons.auto_awesome, size: 16, color: AppColors.accentTeal),
                                label: Text(
                                  "Ask AI Tutor",
                                  style: AppTypography.bodySmall.copyWith(color: AppColors.accentTeal, fontWeight: FontWeight.w600),
                                ),
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => AITutorScreen(
                                        topicId: question.topicId,
                                        topicTitle: widget.topicTitle,
                                        questionId: question.id,
                                        initialPrompt: "I need help understanding this question: \"${question.prompt}\"",
                                        initialMode: "explain",
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ],
                          ),

                          // Active Progressive Hint Display
                          if (_activeHint != null) ...[
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightBorderSubtle,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: AppColors.primaryGreen.withOpacity(0.5)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.lightbulb_rounded, size: 16, color: AppColors.primaryGreen),
                                      const SizedBox(width: 6),
                                      Text(
                                        _activeHint!.isFinalSolution
                                            ? "Final Worked Help"
                                            : "Progressive Hint Level ${_activeHint!.hintLevel} of 3",
                                        style: AppTypography.bodySmall.copyWith(
                                          color: AppColors.primaryGreen,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    _activeHint!.hintText,
                                    style: AppTypography.bodySmall.copyWith(
                                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                                      height: 1.4,
                                    ),
                                  ),
                                  if (_activeHint!.guidance.isNotEmpty && !_activeHint!.isFinalSolution) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      "Next: ${_activeHint!.guidance}",
                                      style: AppTypography.bodySmall.copyWith(
                                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                                        fontStyle: FontStyle.italic,
                                        fontSize: 11,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Option Tiles
                  ...question.options.map((opt) {
                    final isSelected = provider.selectedOptionId == opt.id;
                    Color borderColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;
                    Color bgColor = isDark ? AppColors.darkSurface : AppColors.lightSurface;

                    if (result != null) {
                      if (opt.id == result.correctOptionId) {
                        borderColor = AppColors.primaryGreen;
                        bgColor = isDark ? AppColors.primaryGreenDark.withOpacity(0.3) : AppColors.primaryGreenLight;
                      } else if (isSelected && !result.isCorrect) {
                        borderColor = AppColors.masteryCritical;
                        bgColor = AppColors.masteryCritical.withOpacity(0.1);
                      }
                    } else if (isSelected) {
                      borderColor = AppColors.primaryGreen;
                      bgColor = isDark ? AppColors.darkSurfaceElevated : AppColors.lightBorderSubtle;
                    }

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: InkWell(
                        onTap: result != null ? null : () => provider.selectOption(opt.id),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: bgColor,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: borderColor, width: isSelected ? 1.5 : 1),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 22,
                                height: 22,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: isSelected ? AppColors.primaryGreen : AppColors.textTertiaryLight,
                                    width: 1.5,
                                  ),
                                  color: isSelected ? AppColors.primaryGreen : Colors.transparent,
                                ),
                                child: isSelected
                                    ? const Icon(Icons.check, size: 14, color: Colors.white)
                                    : null,
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Text(
                                  opt.text,
                                  style: AppTypography.bodyMedium.copyWith(
                                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),

                  // Instant Mistake Diagnosis & Feedback Card
                  if (result != null) ...[
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: result.isCorrect
                            ? (isDark ? AppColors.primaryGreenDark.withOpacity(0.25) : AppColors.primaryGreenLight)
                            : (AppColors.masteryCritical.withOpacity(0.08)),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: result.isCorrect ? AppColors.primaryGreen : AppColors.masteryCritical,
                          width: 1,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                result.isCorrect ? Icons.check_circle_rounded : Icons.info_rounded,
                                color: result.isCorrect ? AppColors.primaryGreen : AppColors.masteryCritical,
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                result.isCorrect ? "Correct Recall!" : "Misconception Detected",
                                style: AppTypography.titleMedium.copyWith(
                                  fontSize: 15,
                                  color: result.isCorrect ? AppColors.primaryGreen : AppColors.masteryCritical,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            result.explanation,
                            style: AppTypography.bodyMedium.copyWith(
                              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                            ),
                          ),
                          if (result.diagnosedMisconception != null) ...[
                            const SizedBox(height: 8),
                            Text(
                              "Deterministic Root Cause: ${result.diagnosedMisconception}",
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.masteryCritical,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],

                          // AI Mistake Interpretation Button (if incorrect)
                          if (!result.isCorrect) ...[
                            const SizedBox(height: 12),
                            if (_aiMistakeAnalysis == null)
                              OutlinedButton.icon(
                                icon: _isLoadingMistake
                                    ? const SizedBox(
                                        width: 14,
                                        height: 14,
                                        child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.masteryCritical),
                                      )
                                    : const Icon(Icons.psychology_rounded, size: 16),
                                label: const Text("Explain My Mistake with AI"),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: AppColors.masteryCritical,
                                  side: const BorderSide(color: AppColors.masteryCritical),
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                ),
                                onPressed: () => _requestAIMistakeAnalysis(
                                  question.id,
                                  provider.selectedOptionId ?? "",
                                  question.topicId,
                                ),
                              )
                            else ...[
                              // AI Mistake Interpretation Box
                              Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: isDark ? AppColors.darkSurfaceElevated : Colors.white,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: AppColors.masteryCritical.withOpacity(0.4)),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(Icons.auto_awesome, size: 14, color: AppColors.accentTeal),
                                        const SizedBox(width: 6),
                                        Text(
                                          "AI Mistake Diagnosis",
                                          style: AppTypography.bodySmall.copyWith(
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.accentTeal,
                                          ),
                                        ),
                                        const Spacer(),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: _aiMistakeAnalysis!.confidence == "high"
                                                ? AppColors.primaryGreen.withOpacity(0.15)
                                                : Colors.orange.withOpacity(0.15),
                                            borderRadius: BorderRadius.circular(4),
                                          ),
                                          child: Text(
                                            _aiMistakeAnalysis!.confidence == "high"
                                                ? "HIGH CONFIDENCE"
                                                : "TENTATIVE AI",
                                            style: AppTypography.bodySmall.copyWith(
                                              fontSize: 9,
                                              fontWeight: FontWeight.w700,
                                              color: _aiMistakeAnalysis!.confidence == "high"
                                                  ? AppColors.primaryGreen
                                                  : Colors.orange,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      _aiMistakeAnalysis!.likelyError,
                                      style: AppTypography.bodySmall.copyWith(
                                        fontWeight: FontWeight.w600,
                                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      _aiMistakeAnalysis!.explanation,
                                      style: AppTypography.bodySmall.copyWith(
                                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                                      ),
                                    ),
                                    if (_aiMistakeAnalysis!.conceptToRemember.isNotEmpty) ...[
                                      const SizedBox(height: 8),
                                      Text(
                                        "Key Rule: ${_aiMistakeAnalysis!.conceptToRemember}",
                                        style: AppTypography.bodySmall.copyWith(
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.primaryGreen,
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ],
                          ],
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 28),

                  // Bottom Action Button
                  SizedBox(
                    height: 50,
                    child: ElevatedButton(
                      onPressed: provider.selectedOptionId == null
                          ? null
                          : (result == null
                              ? () => provider.submitAnswer()
                              : () {
                                  _resetQuestionAIState();
                                  provider.nextQuestion();
                                }),
                      child: Text(
                        result == null ? "Submit Answer" : "Next Question",
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
