import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/learning_intelligence.dart';

class InsightsCarousel extends StatelessWidget {
  final List<StudentInsightModel> insights;
  final Function(String topicId)? onTopicTap;

  const InsightsCarousel({
    Key? key,
    required this.insights,
    this.onTopicTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (insights.isEmpty) return const SizedBox.shrink();

    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.lightbulb_outline_rounded, color: AppColors.primaryGreen, size: 20),
            const SizedBox(width: 8),
            Text(
              "Evidence-Based Learning Insights",
              style: AppTypography.titleMedium.copyWith(
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 160,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: insights.length,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (context, index) {
              final item = insights[index];
              return _buildInsightCard(context, item, isDark);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildInsightCard(BuildContext context, StudentInsightModel item, bool isDark) {
    Color accentColor;
    IconData icon;

    switch (item.type) {
      case "improving":
        accentColor = AppColors.primaryGreen;
        icon = Icons.trending_up_rounded;
        break;
      case "watch_this":
        accentColor = const Color(0xFFFF9800);
        icon = Icons.warning_amber_rounded;
        break;
      case "review_soon":
        accentColor = const Color(0xFFFFB74D);
        icon = Icons.schedule_rounded;
        break;
      case "foundation_first":
        accentColor = const Color(0xFF42A5F5);
        icon = Icons.layers_rounded;
        break;
      default:
        accentColor = AppColors.primaryGreen;
        icon = Icons.insights_rounded;
    }

    return Container(
      width: 290,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: accentColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: accentColor, size: 16),
              ),
              const SizedBox(width: 8),
              Text(
                item.title,
                style: AppTypography.titleSmall.copyWith(
                  color: accentColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Expanded(
            child: Text(
              item.message,
              style: AppTypography.bodySmall.copyWith(
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                height: 1.35,
              ),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            item.evidence,
            style: AppTypography.bodySmall.copyWith(
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              fontSize: 11,
              fontStyle: FontStyle.italic,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
