import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/diagnostic_provider.dart';
import 'diagnostic_session_screen.dart';

class DiagnosticIntroScreen extends StatelessWidget {
  final String subjectId;
  final String subjectName;
  final String topicId;
  final String topicName;

  const DiagnosticIntroScreen({
    Key? key,
    required this.subjectId,
    required this.subjectName,
    required this.topicId,
    required this.topicName,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_rounded, color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 580),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreenLight,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    "DIAGNOSTIC ASSESSMENT",
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.primaryGreenDark,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.8,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  topicName,
                  style: AppTypography.displayMedium.copyWith(
                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  "Curriculum: $subjectName",
                  style: AppTypography.titleMedium.copyWith(
                    color: AppColors.primaryGreen,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  "This diagnostic is designed to measure whether your studying has produced durable understanding. It assesses both foundational prerequisites and multi-step transfer problems.",
                  style: AppTypography.bodyMedium.copyWith(
                    height: 1.5,
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                  ),
                ),
                const SizedBox(height: 28),

                // Diagnostic Parameters
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        _buildParamRow(Icons.help_outline_rounded, "Questions", "6–10 targeted problems", isDark),
                        const Divider(height: 24),
                        _buildParamRow(Icons.timer_outlined, "Estimated Time", "12–15 minutes", isDark),
                        const Divider(height: 24),
                        _buildParamRow(Icons.account_tree_outlined, "Prerequisite Testing", "Includes ancestral checks (e.g. Factorisation)", isDark),
                        const Divider(height: 24),
                        _buildParamRow(Icons.save_outlined, "Progress Preserved", "Resume anytime if interrupted", isDark),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // Start Assessment Button
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: () async {
                      await context.read<DiagnosticProvider>().startDiagnostic(subjectId, topicId);
                      if (context.mounted) {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (_) => DiagnosticSessionScreen(topicName: topicName),
                          ),
                        );
                      }
                    },
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text("Begin Diagnostic Assessment"),
                        SizedBox(width: 8),
                        Icon(Icons.arrow_forward_rounded, size: 18),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildParamRow(IconData icon, String label, String value, bool isDark) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppColors.primaryGreen),
        const SizedBox(width: 14),
        Text(
          label,
          style: AppTypography.bodyMedium.copyWith(
            fontWeight: FontWeight.w600,
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          ),
        ),
        const Spacer(),
        Text(
          value,
          style: AppTypography.bodySmall.copyWith(
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
          ),
        ),
      ],
    );
  }
}
