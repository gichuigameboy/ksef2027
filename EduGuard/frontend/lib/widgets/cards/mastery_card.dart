import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/mastery_record.dart';

class MasteryCard extends StatelessWidget {
  final TopicMasteryRecord record;
  final VoidCallback? onWhyStruggling;

  const MasteryCard({
    Key? key,
    required this.record,
    this.onWhyStruggling,
  }) : super(key: key);

  Color _getCategoryColor(MasteryTier tier) {
    switch (tier) {
      case MasteryTier.mastered:
        return AppColors.masteryMastered;
      case MasteryTier.strong:
        return AppColors.masteryStrong;
      case MasteryTier.developing:
        return AppColors.masteryDeveloping;
      case MasteryTier.weak:
        return AppColors.masteryWeak;
      case MasteryTier.critical:
        return AppColors.masteryCritical;
    }
  }

  String _getCategoryLabel(MasteryTier tier) {
    switch (tier) {
      case MasteryTier.mastered:
        return "Mastered (90-100%)";
      case MasteryTier.strong:
        return "Strong (75-89%)";
      case MasteryTier.developing:
        return "Developing (60-74%)";
      case MasteryTier.weak:
        return "Weak (40-59%)";
      case MasteryTier.critical:
        return "Critical Support (0-39%)";
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final catColor = _getCategoryColor(record.category);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    record.topicName,
                    style: AppTypography.titleMedium.copyWith(
                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: catColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '${record.masteryScore.toStringAsFixed(0)}% Mastery',
                    style: AppTypography.labelMedium.copyWith(
                      color: catColor,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              _getCategoryLabel(record.category),
              style: AppTypography.bodySmall.copyWith(
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              ),
            ),
            const SizedBox(height: 14),

            // Progress Bar
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: record.masteryScore / 100.0,
                backgroundColor: isDark ? AppColors.darkSurfaceElevated : AppColors.lightBorderSubtle,
                valueColor: AlwaysStoppedAnimation<Color>(catColor),
                minHeight: 6,
              ),
            ),
            const SizedBox(height: 16),

            // Multi-dimensional breakdown chips
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStatMetric("Basic", "${record.basicAccuracy.toInt()}%", isDark),
                _buildStatMetric("Medium", "${record.mediumAccuracy.toInt()}%", isDark),
                _buildStatMetric("Hard", "${record.hardAccuracy.toInt()}%", isDark),
                _buildStatMetric("Application", "${record.applicationAccuracy.toInt()}%", isDark),
              ],
            ),

            if (record.category == MasteryTier.weak || record.category == MasteryTier.critical) ...[
              const SizedBox(height: 14),
              InkWell(
                onTap: onWhyStruggling,
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.masteryCritical.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: AppColors.masteryCritical.withOpacity(0.2),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.help_outline_rounded, size: 15, color: AppColors.masteryCritical),
                      const SizedBox(width: 6),
                      Text(
                        "Why am I struggling?",
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.masteryCritical,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatMetric(String label, String value, bool isDark) {
    return Column(
      children: [
        Text(
          value,
          style: AppTypography.bodyMedium.copyWith(
            fontWeight: FontWeight.w600,
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          ),
        ),
        Text(
          label,
          style: AppTypography.bodySmall.copyWith(
            fontSize: 11,
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
          ),
        ),
      ],
    );
  }
}
