import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../services/api_service.dart';

class WhyStrugglingScreen extends StatefulWidget {
  final String topicId;
  final String topicName;

  const WhyStrugglingScreen({
    Key? key,
    required this.topicId,
    required this.topicName,
  }) : super(key: key);

  @override
  State<WhyStrugglingScreen> createState() => _WhyStrugglingScreenState();
}

class _WhyStrugglingScreenState extends State<WhyStrugglingScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _diagnosis;

  @override
  void initState() {
    super.initState();
    _loadDiagnosis();
  }

  Future<void> _loadDiagnosis() async {
    final res = await ApiService.getWhyStruggling(widget.topicId);
    setState(() {
      _diagnosis = res;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text("Root-Cause Diagnosis", style: AppTypography.titleMedium),
        elevation: 0,
        backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
        foregroundColor: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGreen))
          : Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 760),
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                  children: [
                    // Heading
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.masteryCritical.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.psychology_alt_rounded, color: AppColors.masteryCritical, size: 24),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Why am I struggling with ${widget.topicName}?",
                                style: AppTypography.titleLarge.copyWith(
                                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                                ),
                              ),
                              Text(
                                "Deterministic learning analytics & prerequisite graph analysis",
                                style: AppTypography.bodySmall.copyWith(
                                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 28),

                    // Primary Cause Card
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(22),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "PRIMARY ROOT CAUSE IDENTIFIED",
                              style: AppTypography.bodySmall.copyWith(
                                letterSpacing: 0.8,
                                fontWeight: FontWeight.w700,
                                color: AppColors.masteryCritical,
                              ),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              "Prerequisite Knowledge Gap: Factorisation",
                              style: AppTypography.titleMedium.copyWith(
                                fontSize: 18,
                                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              "Your performance log shows that your difficulty with Quadratic Equations (51% mastery) is stemming from an unmastered prerequisite concept: Factorisation (currently at 43% mastery). When solving quadratics by factoring, errors frequently occur in finding binomial factor pairs rather than applying the zero-product rule.",
                              style: AppTypography.bodyMedium.copyWith(
                                height: 1.5,
                                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Prerequisite Chain Visualization
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(22),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Prerequisite Dependency Chain",
                              style: AppTypography.titleMedium.copyWith(
                                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                              ),
                            ),
                            const SizedBox(height: 16),
                            _buildPrereqNode("Algebraic Manipulation", "78% Mastery", AppColors.primaryGreen, true, isDark),
                            _buildPrereqArrow(isDark),
                            _buildPrereqNode("Factorisation", "43% Mastery (Weak Link)", AppColors.masteryCritical, true, isDark),
                            _buildPrereqArrow(isDark),
                            _buildPrereqNode("Quadratic Equations", "51% Mastery (Current)", AppColors.masteryDeveloping, false, isDark),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Next Recommended Action
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.darkSurfaceElevated : AppColors.primaryGreenLight,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: AppColors.primaryGreen.withOpacity(0.3),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.recommend_rounded, color: AppColors.primaryGreen, size: 20),
                              const SizedBox(width: 8),
                              Text(
                                "Recommended Adaptive Action",
                                style: AppTypography.titleMedium.copyWith(
                                  color: AppColors.primaryGreen,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _diagnosis?['recommended_action'] ?? "Complete a targeted prerequisite recovery session.",
                            style: AppTypography.bodyMedium.copyWith(
                              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                            ),
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () {
                              Navigator.pop(context);
                            },
                            child: const Text("Launch 12-Minute Factorisation Recovery Session"),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildPrereqNode(String name, String status, Color color, bool isPrereq, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.lightBackground,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            name,
            style: AppTypography.bodyMedium.copyWith(
              fontWeight: FontWeight.w600,
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              status,
              style: AppTypography.bodySmall.copyWith(
                fontWeight: FontWeight.w700,
                color: color,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPrereqArrow(bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Center(
        child: Icon(
          Icons.arrow_downward_rounded,
          size: 16,
          color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
        ),
      ),
    );
  }
}
