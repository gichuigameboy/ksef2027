import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

class RetentionAlertCard extends StatelessWidget {
  final String topicName;
  final double retentionPercent;
  final int daysSinceReview;
  final VoidCallback onStartRetrieval;

  const RetentionAlertCard({
    Key? key,
    required this.topicName,
    required this.retentionPercent,
    required this.daysSinceReview,
    required this.onStartRetrieval,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: AppColors.masteryDeveloping.withOpacity(0.35),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.masteryDeveloping.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.timelapse_rounded,
              color: AppColors.masteryDeveloping,
              size: 22,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      "Retention Decay Alert",
                      style: AppTypography.titleMedium.copyWith(
                        fontSize: 13,
                        color: AppColors.masteryDeveloping,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.masteryDeveloping.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        "${(retentionPercent * 100).toInt()}% recall",
                        style: AppTypography.bodySmall.copyWith(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: AppColors.masteryDeveloping,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  "$topicName has passed its optimal memory interval ($daysSinceReview days ago). Retrieval practice scheduled to prevent loss.",
                  style: AppTypography.bodySmall.copyWith(
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          OutlinedButton(
            onPressed: onStartRetrieval,
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.masteryDeveloping,
              side: BorderSide(color: AppColors.masteryDeveloping.withOpacity(0.5)),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
            child: const Text("Retrieve"),
          ),
        ],
      ),
    );
  }
}
