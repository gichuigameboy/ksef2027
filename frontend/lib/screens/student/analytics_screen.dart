import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utilities/responsive.dart';
import '../../models/learning_intelligence.dart';
import '../../models/ai_tutoring.dart';
import '../../services/api_service.dart';
import 'ai_tutor_screen.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({Key? key}) : super(key: key);

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _unifiedState;
  List<LearningTimelineEventModel> _timeline = [];
  AIInsightModel? _aiInsight;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final stateFuture = ApiService.getUnifiedState();
      final timelineFuture = ApiService.getTimeline();
      final insightFuture = ApiService.getAIInsights();
      final results = await Future.wait([stateFuture, timelineFuture, insightFuture]);
      setState(() {
        _unifiedState = results[0] as Map<String, dynamic>;
        _timeline = results[1] as List<LearningTimelineEventModel>;
        _aiInsight = results[2] as AIInsightModel;
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isDesktop = Responsive.isDesktop(context);

    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: AppColors.primaryGreen)),
      );
    }

    final vel = _unifiedState?["recentLearningVelocity"] ?? {};
    final eff = _unifiedState?["learningEfficiency"] ?? {};

    return Scaffold(
      appBar: AppBar(
        title: const Text("Learning Intelligence Analytics"),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        color: AppColors.primaryGreen,
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(
            horizontal: isDesktop ? 40 : 20,
            vertical: 24,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Learning Progress & Efficiency",
                style: AppTypography.displaySmall.copyWith(
                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                "Holistic metrics measuring genuine conceptual understanding rather than raw question counts.",
                style: AppTypography.bodyMedium.copyWith(
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                ),
              ),
              const SizedBox(height: 24),

              // AI Intelligence Insights Card
              if (_aiInsight != null) ...[
                _buildAIInsightsCard(isDark),
                const SizedBox(height: 24),
              ],

              // KPI Row: Learning Velocity & Learning Efficiency
              LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth > 700;
                  return isWide
                      ? Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(child: _buildVelocityCard(vel, isDark)),
                            const SizedBox(width: 16),
                            Expanded(child: _buildEfficiencyCard(eff, isDark)),
                          ],
                        )
                      : Column(
                          children: [
                            _buildVelocityCard(vel, isDark),
                            const SizedBox(height: 16),
                            _buildEfficiencyCard(eff, isDark),
                          ],
                        );
                },
              ),

              const SizedBox(height: 32),

              // Learning Timeline Section
              Text(
                "Milestone Learning Timeline",
                style: AppTypography.titleLarge.copyWith(
                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                "Meaningful diagnostic completions, prerequisite recoveries, and transfer challenges.",
                style: AppTypography.bodySmall.copyWith(
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                ),
              ),
              const SizedBox(height: 16),
              _buildTimelineList(isDark),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildVelocityCard(Map<String, dynamic> vel, bool isDark) {
    final cat = vel["velocityCategory"] ?? "Developing Pace";
    final gain = vel["masteryGainLast7Days"] ?? 0.0;
    final improved = vel["conceptsImprovedCount"] ?? 0;
    final retrieval = vel["retrievalSuccessRate"] ?? 0.0;
    final progression = vel["difficultyProgressionScore"] ?? 0.0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.speed_rounded, color: AppColors.primaryGreen, size: 22),
                  const SizedBox(width: 8),
                  Text("Learning Velocity", style: AppTypography.titleMedium),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  cat,
                  style: AppTypography.labelSmall.copyWith(
                    color: AppColors.primaryGreen,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatCol("+${gain}%", "7-Day Mastery Gain", isDark),
              _buildStatCol("$improved", "Concepts Improved", isDark),
              _buildStatCol("${retrieval.toInt()}%", "Retrieval Success", isDark),
              _buildStatCol("${progression.toInt()}", "Progression Score", isDark),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEfficiencyCard(Map<String, dynamic> eff, bool isDark) {
    final cat = eff["efficiencyCategory"] ?? "Steady";
    final mins = eff["learningMinutes"] ?? 0;
    final ptsHr = eff["masteryPointsPerHour"] ?? 0.0;
    final score = eff["estimatedEfficiencyScore"] ?? 0.0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.bolt_rounded, color: Color(0xFFFFB74D), size: 22),
                  const SizedBox(width: 8),
                  Text("Learning Efficiency", style: AppTypography.titleMedium),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFB74D).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  cat,
                  style: AppTypography.labelSmall.copyWith(
                    color: const Color(0xFFFFB74D),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatCol("${mins}m", "Active Learning Time", isDark),
              _buildStatCol("${ptsHr}/hr", "Mastery Yield", isDark),
              _buildStatCol("${score.toInt()}/100", "Efficiency Index", isDark),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatCol(String value, String label, bool isDark) {
    return Column(
      children: [
        Text(
          value,
          style: AppTypography.titleLarge.copyWith(
            fontWeight: FontWeight.w700,
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: AppTypography.bodySmall.copyWith(
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            fontSize: 11,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildTimelineList(bool isDark) {
    if (_timeline.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
        ),
        child: const Center(child: Text("No timeline milestones recorded yet.")),
      );
    }

    return Column(
      children: _timeline.map((e) {
        IconData icon;
        Color color;
        switch (e.eventType) {
          case "diagnostic":
            icon = Icons.assignment_turned_in_rounded;
            color = const Color(0xFF64B5F6);
            break;
          case "prerequisite_recovery":
            icon = Icons.build_circle_rounded;
            color = AppColors.primaryGreen;
            break;
          case "transfer_challenge":
            icon = Icons.transform_rounded;
            color = const Color(0xFFBA68C8);
            break;
          default:
            icon = Icons.auto_awesome_rounded;
            color = AppColors.primaryGreen;
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          e.topicName,
                          style: AppTypography.titleMedium.copyWith(
                            fontWeight: FontWeight.w600,
                            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                          ),
                        ),
                        Text(
                          "${e.timestamp.month}/${e.timestamp.day}",
                          style: AppTypography.bodySmall.copyWith(
                            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      e.description,
                      style: AppTypography.bodySmall.copyWith(
                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildAIInsightsCard(bool isDark) {
    final insight = _aiInsight!;

    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.primaryGreen.withOpacity(0.4),
          width: 1.5,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.auto_awesome, color: AppColors.primaryGreen, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("EduGuard AI Learning Insights", style: AppTypography.titleMedium.copyWith(fontSize: 16)),
                    Text(
                      "Grounded in verified mastery trends & deterministic retention telemetry",
                      style: AppTypography.bodySmall.copyWith(
                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),

          // 1. What EduGuard Noticed
          Text("What EduGuard Noticed", style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.primaryGreen)),
          const SizedBox(height: 4),
          Text(insight.whatNoticed, style: AppTypography.bodyMedium.copyWith(height: 1.45)),
          const SizedBox(height: 14),

          // 2. Focus Next
          Text("Focus Next", style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.accentTeal)),
          const SizedBox(height: 4),
          Text(insight.focusNext, style: AppTypography.bodyMedium.copyWith(height: 1.45)),
          const SizedBox(height: 14),

          // 3. Suggested Strategy
          Text("Suggested Strategy", style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: Colors.orange)),
          const SizedBox(height: 4),
          Text(insight.suggestedStrategy, style: AppTypography.bodyMedium.copyWith(height: 1.45)),
        ],
      ),
    );
  }
}
