import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/diagnostic.dart';
import '../../providers/learning_provider.dart';
import 'session_screen.dart';

class DiagnosticResultsScreen extends StatelessWidget {
  final LearningProfileModel profile;

  const DiagnosticResultsScreen({Key? key, required this.profile}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text("Learning Profile", style: AppTypography.titleMedium),
        elevation: 0,
        backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
        foregroundColor: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
        automaticallyImplyLeading: false,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 680),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreenLight,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    "ASSESSMENT COMPLETE",
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.primaryGreenDark,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.8,
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  "Your Learning Profile",
                  style: AppTypography.displayMedium.copyWith(
                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  "Synthesized by EduGuard's deterministic mastery and knowledge graph engines.",
                  style: AppTypography.bodyMedium.copyWith(
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                  ),
                ),
                const SizedBox(height: 28),

                // Overall Starting Point Card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(22),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              "Overall Starting Point",
                              style: AppTypography.titleMedium.copyWith(
                                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.masteryDeveloping.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                profile.overallStartingPoint,
                                style: AppTypography.labelMedium.copyWith(
                                  color: AppColors.masteryDeveloping,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Text(
                          "Baseline diagnostic accuracy: ${profile.score.toStringAsFixed(1)}% across ${profile.completedQuestions} questions.",
                          style: AppTypography.bodyMedium.copyWith(
                            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 18),

                // Prerequisite Gap Alert (The core differentiator!)
                if (profile.prerequisiteGaps.isNotEmpty) ...[
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.masteryCritical.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: AppColors.masteryCritical.withOpacity(0.3),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.warning_amber_rounded, color: AppColors.masteryCritical, size: 22),
                            const SizedBox(width: 10),
                            Text(
                              "Likely Prerequisite Knowledge Gap Detected",
                              style: AppTypography.titleMedium.copyWith(
                                fontSize: 16,
                                color: AppColors.masteryCritical,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          "Your diagnostic indicates that difficulty in Quadratic Equations is rooted in prerequisite Factorisation (${profile.prerequisiteGaps.first.masteryScore.toInt()}% mastery). Repairing factor-pair selection will unlock higher-tier quadratic solving.",
                          style: AppTypography.bodyMedium.copyWith(
                            height: 1.5,
                            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                ],

                // Strong Areas vs Areas to Improve
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(18),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.check_circle_outline, color: AppColors.primaryGreen, size: 18),
                                  const SizedBox(width: 8),
                                  Text(
                                    "Strong Areas",
                                    style: AppTypography.titleMedium.copyWith(fontSize: 14),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              ...profile.strongAreas.map((s) => Padding(
                                padding: const EdgeInsets.only(bottom: 6),
                                child: Text("• $s", style: AppTypography.bodySmall),
                              )),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(18),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.trending_up, color: AppColors.masteryDeveloping, size: 18),
                                  const SizedBox(width: 8),
                                  Text(
                                    "Areas to Improve",
                                    style: AppTypography.titleMedium.copyWith(fontSize: 14),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              ...profile.areasToImprove.map((a) => Padding(
                                padding: const EdgeInsets.only(bottom: 6),
                                child: Text("• $a", style: AppTypography.bodySmall),
                              )),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 28),

                // Recommended First Action
                Container(
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkSurfaceElevated : AppColors.primaryGreenLight,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.primaryGreen.withOpacity(0.3)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "RECOMMENDED FIRST SESSION",
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.primaryGreen,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        profile.recommendedFirstSession,
                        style: AppTypography.titleMedium.copyWith(
                          fontSize: 18,
                          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                        ),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton(
                          onPressed: () {
                            context.read<LearningProvider>().loadDashboardData();
                            context.read<LearningProvider>().startSession("factorisation");
                            Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const SessionScreen(topicTitle: "Factorisation Recovery"),
                              ),
                            );
                          },
                          child: const Text("Start Learning"),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
