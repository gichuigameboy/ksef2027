import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/attempt_history.dart';
import '../../services/api_service.dart';

class LearningHistoryScreen extends StatefulWidget {
  const LearningHistoryScreen({Key? key}) : super(key: key);

  @override
  State<LearningHistoryScreen> createState() => _LearningHistoryScreenState();
}

class _LearningHistoryScreenState extends State<LearningHistoryScreen> {
  bool _isLoading = true;
  List<AttemptHistoryModel> _history = [];

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    final list = await ApiService.getLearningHistory();
    setState(() {
      _history = list;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text("Learning History", style: AppTypography.titleMedium),
        elevation: 0,
        backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
        foregroundColor: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGreen))
          : Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 760),
                child: _history.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.history_rounded, size: 48, color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight),
                            const SizedBox(height: 16),
                            Text("No learning attempts recorded yet.", style: AppTypography.titleMedium),
                            const SizedBox(height: 6),
                            Text("Complete a diagnostic or retrieval session to build your learning log.", style: AppTypography.bodySmall),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
                        itemCount: _history.length,
                        itemBuilder: (context, index) {
                          final att = _history[index];
                          final timeStr = DateFormat.yMMMd().add_jm().format(att.createdAt);

                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                              ),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: att.isCorrect
                                        ? AppColors.primaryGreen.withOpacity(0.12)
                                        : AppColors.masteryCritical.withOpacity(0.12),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    att.isCorrect ? Icons.check : Icons.close,
                                    color: att.isCorrect ? AppColors.primaryGreen : AppColors.masteryCritical,
                                    size: 16,
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        att.topicId.replaceAll('_', ' ').titleCase(),
                                        style: AppTypography.titleMedium.copyWith(fontSize: 15),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        timeStr,
                                        style: AppTypography.bodySmall.copyWith(
                                          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                                        ),
                                      ),
                                      if (att.errorCategory != null) ...[
                                        const SizedBox(height: 4),
                                        Text(
                                          "Note: ${att.errorCategory}",
                                          style: AppTypography.bodySmall.copyWith(
                                            color: AppColors.masteryCritical,
                                            fontSize: 11,
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightBorderSubtle,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    att.difficulty.toUpperCase(),
                                    style: AppTypography.bodySmall.copyWith(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.primaryGreen,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
              ),
            ),
    );
  }
}

extension StringExtension on String {
  String titleCase() {
    if (isEmpty) return this;
    return split(' ').map((word) {
      if (word.isEmpty) return word;
      return word[0].toUpperCase() + word.substring(1).toLowerCase();
    }).join(' ');
  }
}
