import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utilities/responsive.dart';
import '../../models/learning_intelligence.dart';
import '../../services/api_service.dart';
import 'session_screen.dart';

class RetentionCenterScreen extends StatefulWidget {
  const RetentionCenterScreen({Key? key}) : super(key: key);

  @override
  State<RetentionCenterScreen> createState() => _RetentionCenterScreenState();
}

class _RetentionCenterScreenState extends State<RetentionCenterScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = true;
  Map<String, List<RetentionItemModel>> _retentionData = {};

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final data = await ApiService.getRetentionOverview();
      setState(() {
        _retentionData = data;
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

    return Scaffold(
      appBar: AppBar(
        title: const Text("Spaced Retention Center"),
        elevation: 0,
        backgroundColor: Colors.transparent,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primaryGreen,
          labelColor: isDark ? Colors.white : Colors.black87,
          tabs: [
            Tab(text: "Due (${_retentionData['due']?.length ?? 0})"),
            Tab(text: "At Risk (${_retentionData['at_risk']?.length ?? 0})"),
            Tab(text: "Stable (${_retentionData['stable']?.length ?? 0})"),
            Tab(text: "Fresh (${_retentionData['fresh']?.length ?? 0})"),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGreen))
          : TabBarView(
              controller: _tabController,
              children: [
                _buildRetentionList(_retentionData['due'] ?? [], "Review Due", const Color(0xFFE57373), isDark),
                _buildRetentionList(_retentionData['at_risk'] ?? [], "At Risk of Decay", const Color(0xFFFFB74D), isDark),
                _buildRetentionList(_retentionData['stable'] ?? [], "Stable Knowledge", AppColors.primaryGreen, isDark),
                _buildRetentionList(_retentionData['fresh'] ?? [], "Recently Reinforced", const Color(0xFF64B5F6), isDark),
              ],
            ),
    );
  }

  Widget _buildRetentionList(List<RetentionItemModel> items, String categoryTitle, Color accentColor, bool isDark) {
    if (items.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.done_all_rounded, size: 48, color: accentColor.withOpacity(0.5)),
              const SizedBox(height: 16),
              Text(
                "No topics in $categoryTitle",
                style: AppTypography.titleMedium.copyWith(
                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                "All concepts are currently in healthy memory stability states.",
                style: AppTypography.bodySmall.copyWith(
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        final pct = (item.currentRetention * 100).toInt();

        return Container(
          margin: const EdgeInsets.only(bottom: 14),
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      item.topicName,
                      style: AppTypography.titleMedium.copyWith(
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: accentColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      "$pct% Recall",
                      style: AppTypography.labelSmall.copyWith(
                        color: accentColor,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: item.currentRetention,
                  backgroundColor: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                  valueColor: AlwaysStoppedAnimation<Color>(accentColor),
                  minHeight: 6,
                ),
              ),
              const SizedBox(height: 14),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "Stability: ${item.halfLifeDays}d half-life • Streak: ${item.retrievalStreak}x",
                    style: AppTypography.bodySmall.copyWith(
                      color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                      fontSize: 12,
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => SessionScreen(
                            topicId: item.topicId,
                            topicName: item.topicName,
                          ),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: accentColor,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text("Spaced Review"),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
