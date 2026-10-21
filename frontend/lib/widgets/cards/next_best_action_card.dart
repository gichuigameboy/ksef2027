import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/learning_intelligence.dart';

class NextBestActionCard extends StatelessWidget {
  final NextBestActionModel action;
  final VoidCallback onStart;

  const NextBestActionCard({
    Key? key,
    required this.action,
    required this.onStart,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    IconData actionIcon;
    Color badgeColor;
    String badgeText;

    switch (action.actionType) {
      case "PREREQUISITE_RECOVERY":
        actionIcon = Icons.build_circle_rounded;
        badgeColor = const Color(0xFFE57373);
        badgeText = "Prerequisite Gap";
        break;
      case "RETRIEVAL":
        actionIcon = Icons.replay_circle_filled_rounded;
        badgeColor = const Color(0xFFFFB74D);
        badgeText = "Retention Due";
        break;
      case "APPLICATION":
        actionIcon = Icons.rocket_launch_rounded;
        badgeColor = const Color(0xFF64B5F6);
        badgeText = "Application";
        break;
      case "TRANSFER":
        actionIcon = Icons.transform_rounded;
        badgeColor = const Color(0xFFBA68C8);
        badgeText = "Transfer Challenge";
        break;
      default:
        actionIcon = Icons.auto_awesome_rounded;
        badgeColor = AppColors.primaryGreen;
        badgeText = "Recommended Next";
    }

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppColors.primaryGreen.withOpacity(0.35) : AppColors.primaryGreen.withOpacity(0.4),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryGreen.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(actionIcon, color: AppColors.primaryGreen, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: badgeColor.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            badgeText.toUpperCase(),
                            style: AppTypography.labelSmall.copyWith(
                              color: badgeColor,
                              fontWeight: FontWeight.w700,
                              fontSize: 10,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          "Priority ${(action.priority * 100).toInt()}%",
                          style: AppTypography.bodySmall.copyWith(
                            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      action.topicName,
                      style: AppTypography.titleLarge.copyWith(
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            action.reason,
            style: AppTypography.bodyMedium.copyWith(
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              height: 1.45,
            ),
          ),
          const SizedBox(height: 18),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.timer_outlined,
                    size: 16,
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    "${action.estimatedMinutes} mins • ${action.recommendedQuestionCount} questions",
                    style: AppTypography.bodySmall.copyWith(
                      color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: onStart,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                icon: const Icon(Icons.play_arrow_rounded, size: 18),
                label: Text(
                  "Start ${action.estimatedMinutes}-min Session",
                  style: AppTypography.labelLarge.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
