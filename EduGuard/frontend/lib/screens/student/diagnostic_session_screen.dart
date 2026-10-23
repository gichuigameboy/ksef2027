import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/diagnostic_provider.dart';
import 'diagnostic_results_screen.dart';

class DiagnosticSessionScreen extends StatelessWidget {
  final String topicName;

  const DiagnosticSessionScreen({Key? key, required this.topicName}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Consumer<DiagnosticProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator(color: AppColors.primaryGreen)),
          );
        }

        // If completed, transition to Learning Profile results screen
        if (provider.learningProfile != null) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (_) => DiagnosticResultsScreen(profile: provider.learningProfile!),
              ),
            );
          });
          return const Scaffold(
            body: Center(child: CircularProgressIndicator(color: AppColors.primaryGreen)),
          );
        }

        final state = provider.sessionState;
        if (state == null || state.currentQuestion == null) {
          return Scaffold(
            appBar: AppBar(title: Text(topicName)),
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("No active question in this diagnostic."),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text("Return to Dashboard"),
                  ),
                ],
              ),
            ),
          );
        }

        final question = state.currentQuestion!;
        final result = provider.lastAttemptResult;
        final currentNumber = state.completedCount + 1;
        final totalQuestions = state.totalQuestions;

        return Scaffold(
          appBar: AppBar(
            title: Text(
              "Diagnostic: ${state.topicName}",
              style: AppTypography.titleMedium,
            ),
            elevation: 0,
            backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
            foregroundColor: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
            leading: IconButton(
              icon: const Icon(Icons.close_rounded),
              onPressed: () => Navigator.pop(context),
            ),
          ),
          body: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 720),
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                children: [
                  // Progress Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "Question $currentNumber of $totalQuestions",
                        style: AppTypography.bodySmall.copyWith(
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
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
                  const SizedBox(height: 10),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: currentNumber / (totalQuestions > 0 ? totalQuestions : 1),
                      backgroundColor: isDark ? AppColors.darkSurface : AppColors.lightBorder,
                      valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primaryGreen),
                      minHeight: 5,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Prompt Card
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            question.questionText,
                            style: AppTypography.titleLarge.copyWith(
                              fontSize: 18,
                              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                            ),
                          ),
                          if (question.hint != null) ...[
                            const SizedBox(height: 16),
                            Theme(
                              data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                              child: ExpansionTile(
                                tilePadding: EdgeInsets.zero,
                                leading: const Icon(Icons.lightbulb_outline_rounded, size: 18, color: AppColors.primaryGreen),
                                title: Text(
                                  "View Hint",
                                  style: AppTypography.bodySmall.copyWith(
                                    color: AppColors.primaryGreen,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                children: [
                                  Align(
                                    alignment: Alignment.centerLeft,
                                    child: Text(
                                      question.hint!,
                                      style: AppTypography.bodySmall.copyWith(
                                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Sanitized Options
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
                        onTap: () => provider.selectOption(opt.id),
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
                                child: isSelected ? const Icon(Icons.check, size: 14, color: Colors.white) : null,
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

                  // Evaluated Feedback Card (Only after submission)
                  if (result != null) ...[
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: result.isCorrect
                            ? (isDark ? AppColors.primaryGreenDark.withOpacity(0.2) : AppColors.primaryGreenLight)
                            : (AppColors.masteryCritical.withOpacity(0.08)),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: result.isCorrect ? AppColors.primaryGreen : AppColors.masteryCritical,
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
                                result.isCorrect ? "Correct Recall" : "Misconception Detected",
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
                            const SizedBox(height: 6),
                            Text(
                              "Root Cause: ${result.diagnosedMisconception}",
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.masteryCritical,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
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
                              ? () => provider.submitCurrentAnswer()
                              : () => provider.advanceOrComplete()),
                      child: provider.isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : Text(
                              result == null ? "Submit Answer" : "Next Diagnostic Question",
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
