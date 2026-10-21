import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utilities/responsive.dart';
import '../../models/teacher_analytics.dart';

class TeacherClassScreen extends StatefulWidget {
  const TeacherClassScreen({Key? key}) : super(key: key);

  @override
  State<TeacherClassScreen> createState() => _TeacherClassScreenState();
}

class _TeacherClassScreenState extends State<TeacherClassScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedSubject = 'mathematics';
  bool _isLoading = true;

  ClassHeatmapModel? _heatmap;
  ClassMisconceptionsModel? _misconceptions;
  AtRiskStudentsModel? _atRisk;
  ClassTopicDifficultyModel? _difficulty;

  final List<Map<String, String>> _subjects = [
    {'id': 'mathematics', 'name': 'Mathematics'},
    {'id': 'biology', 'name': 'Biology'},
    {'id': 'chemistry', 'name': 'Chemistry'},
    {'id': 'physics', 'name': 'Physics'},
  ];

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
      final heatmapFut = TeacherApiService.getClassHeatmap(_selectedSubject);
      final miscFut = TeacherApiService.getMisconceptions(_selectedSubject);
      final atRiskFut = TeacherApiService.getAtRiskStudents(_selectedSubject);
      final diffFut = TeacherApiService.getTopicDifficulty(_selectedSubject);

      final results = await Future.wait([heatmapFut, miscFut, atRiskFut, diffFut]);

      if (mounted) {
        setState(() {
          _heatmap = results[0] as ClassHeatmapModel;
          _misconceptions = results[1] as ClassMisconceptionsModel;
          _atRisk = results[2] as AtRiskStudentsModel;
          _difficulty = results[3] as ClassTopicDifficultyModel;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _onSubjectChanged(String? newSubject) {
    if (newSubject != null && newSubject != _selectedSubject) {
      setState(() => _selectedSubject = newSubject);
      _loadData();
    }
  }

  Color _getMasteryColor(double score, bool isDark) {
    if (score >= 0.85) return const Color(0xFF10B981); // Mastered
    if (score >= 0.70) return const Color(0xFF3B82F6); // Proficient
    if (score >= 0.50) return const Color(0xFFF59E0B); // Developing
    if (score > 0.0) return const Color(0xFFEF4444);  // Emerging
    return isDark ? AppColors.darkBorder : Colors.grey.shade300;
  }

  String _getMasteryLabel(double score) {
    if (score >= 0.85) return "Mastered";
    if (score >= 0.70) return "Proficient";
    if (score >= 0.50) return "Developing";
    if (score > 0.0) return "Emerging";
    return "Not Started";
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isDesktop = Responsive.isDesktop(context);

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primaryGreen.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.school_rounded, color: AppColors.primaryGreen, size: 20),
            ),
            const SizedBox(width: 12),
            Text(
              "Teacher Intelligence Hub",
              style: AppTypography.titleMedium.copyWith(
                fontWeight: FontWeight.w700,
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ),
            ),
          ],
        ),
        elevation: 0,
        backgroundColor: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
        actions: [
          // Subject Dropdown
          Container(
            margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : Colors.grey.shade100,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedSubject,
                dropdownColor: isDark ? AppColors.darkSurface : Colors.white,
                icon: const Icon(Icons.arrow_drop_down_rounded, color: AppColors.primaryGreen),
                items: _subjects.map((s) {
                  return DropdownMenuItem<String>(
                    value: s['id'],
                    child: Text(
                      s['name']!,
                      style: AppTypography.labelMedium.copyWith(
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  );
                }).toList(),
                onChanged: _onSubjectChanged,
              ),
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          isScrollable: !isDesktop,
          indicatorColor: AppColors.primaryGreen,
          labelColor: AppColors.primaryGreen,
          unselectedLabelColor: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
          labelStyle: AppTypography.labelLarge.copyWith(fontWeight: FontWeight.w600),
          tabs: const [
            Tab(icon: Icon(Icons.grid_on_rounded, size: 18), text: "Mastery Heatmap"),
            Tab(icon: Icon(Icons.warning_amber_rounded, size: 18), text: "Misconception Clusters"),
            Tab(icon: Icon(Icons.person_search_rounded, size: 18), text: "At-Risk Interventions"),
            Tab(icon: Icon(Icons.leaderboard_rounded, size: 18), text: "Difficulty Cliffs"),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGreen))
          : TabBarView(
              controller: _tabController,
              children: [
                _buildHeatmapTab(isDark, isDesktop),
                _buildMisconceptionsTab(isDark),
                _buildAtRiskTab(isDark),
                _buildDifficultyTab(isDark),
              ],
            ),
    );
  }

  // ── Tab 1: Mastery Heatmap ──────────────────────────────────────────────────

  Widget _buildHeatmapTab(bool isDark, bool isDesktop) {
    if (_heatmap == null || _heatmap!.cells.isEmpty) {
      return const Center(child: Text("No heatmap data available."));
    }

    final hm = _heatmap!;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Class Summary Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline_rounded, color: AppColors.primaryGreen, size: 22),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    hm.summary.isNotEmpty
                        ? hm.summary
                        : "Class-wide mastery matrix across students and topics. Green indicates mastery, amber developing, red requires intervention.",
                    style: AppTypography.bodyMedium.copyWith(
                      color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Legend
          Wrap(
            spacing: 16,
            runSpacing: 8,
            children: [
              _buildLegendItem("Mastered (≥85%)", const Color(0xFF10B981)),
              _buildLegendItem("Proficient (70-84%)", const Color(0xFF3B82F6)),
              _buildLegendItem("Developing (50-69%)", const Color(0xFFF59E0B)),
              _buildLegendItem("Emerging (<50%)", const Color(0xFFEF4444)),
              _buildLegendItem("Not Started", isDark ? AppColors.darkBorder : Colors.grey.shade300),
            ],
          ),
          const SizedBox(height: 20),

          // Heatmap Grid
          Card(
            color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: DataTable(
                  columnSpacing: 16,
                  horizontalMargin: 12,
                  headingRowColor: MaterialStateProperty.all(
                    isDark ? AppColors.darkSurface : Colors.grey.shade100,
                  ),
                  columns: [
                    const DataColumn(
                      label: Text("Student", style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                    ...hm.topicNames.map(
                      (name) => DataColumn(
                        label: SizedBox(
                          width: 110,
                          child: Text(
                            name,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ),
                    ),
                  ],
                  rows: hm.studentNames.asMap().entries.map((entry) {
                    final studentIndex = entry.key;
                    final studentName = entry.value;
                    final studentId = hm.studentIds.length > studentIndex ? hm.studentIds[studentIndex] : '';

                    return DataRow(
                      cells: [
                        DataCell(
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 12,
                                backgroundColor: AppColors.primaryGreen.withOpacity(0.2),
                                child: Text(
                                  studentName.isNotEmpty ? studentName[0] : 'S',
                                  style: const TextStyle(fontSize: 10, color: AppColors.primaryGreen, fontWeight: FontWeight.bold),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(studentName, style: const TextStyle(fontWeight: FontWeight.w500)),
                            ],
                          ),
                        ),
                        ...hm.topicIds.map((topicId) {
                          final cell = hm.cells.firstWhere(
                            (c) => c.studentId == studentId && c.topicId == topicId,
                            orElse: () => StudentTopicCell(
                              studentId: studentId,
                              studentName: studentName,
                              topicId: topicId,
                              topicName: '',
                              masteryScore: 0.0,
                              masteryCategory: 'not_started',
                              retentionStatus: 'none',
                              trend: 'stable',
                              attemptsCount: 0,
                              recentAccuracy: 0.0,
                            ),
                          );

                          final color = _getMasteryColor(cell.masteryScore, isDark);
                          return DataCell(
                            InkWell(
                              onTap: () => _showCellDetailDialog(cell),
                              borderRadius: BorderRadius.circular(6),
                              child: Container(
                                width: 100,
                                padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
                                decoration: BoxDecoration(
                                  color: color.withOpacity(0.18),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: color.withOpacity(0.6), width: 1),
                                ),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Text(
                                      cell.masteryScore > 0 ? "${(cell.masteryScore * 100).round()}%" : "-",
                                      style: TextStyle(
                                        color: color,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                    Text(
                                      _getMasteryLabel(cell.masteryScore),
                                      style: TextStyle(
                                        color: color.withOpacity(0.9),
                                        fontSize: 9,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        }),
                      ],
                    );
                  }).toList(),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(3),
          ),
        ),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }

  void _showCellDetailDialog(StudentTopicCell cell) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
        title: Text(
          "${cell.studentName} — ${cell.topicName}",
          style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDetailRow("Mastery Score", "${(cell.masteryScore * 100).round()}% (${cell.masteryCategory})"),
            _buildDetailRow("Retention Status", cell.retentionStatus.toUpperCase()),
            _buildDetailRow("Learning Trend", cell.trend.toUpperCase()),
            _buildDetailRow("Total Practice Attempts", "${cell.attemptsCount}"),
            _buildDetailRow("Recent Accuracy", "${(cell.recentAccuracy * 100).round()}%"),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Close", style: TextStyle(color: AppColors.primaryGreen)),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        ],
      ),
    );
  }

  // ── Tab 2: Misconception Clusters ──────────────────────────────────────────

  Widget _buildMisconceptionsTab(bool isDark) {
    if (_misconceptions == null || _misconceptions!.clusters.isEmpty) {
      return const Center(child: Text("No misconception clusters detected."));
    }

    final m = _misconceptions!;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
          ),
          child: Row(
            children: [
              const Icon(Icons.lightbulb_outline_rounded, color: AppColors.accentWarning, size: 24),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  m.teacherNote.isNotEmpty
                      ? m.teacherNote
                      : "Aggregated pattern errors detected across multiple students. Targeted reteaching in these areas will yield maximum impact.",
                  style: AppTypography.bodyMedium.copyWith(
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        ...m.clusters.map((c) => _buildClusterCard(c, isDark)),
      ],
    );
  }

  Widget _buildClusterCard(MisconceptionClusterModel c, bool isDark) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        c.topicName,
                        style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        "Error Signature: ${c.errorTag.replaceAll('_', ' ').toUpperCase()}",
                        style: AppTypography.labelSmall.copyWith(
                          color: AppColors.accentWarning,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.accentWarning.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.accentWarning.withOpacity(0.4)),
                  ),
                  child: Text(
                    "${c.prevalencePercent.round()}% of class affected",
                    style: const TextStyle(
                      color: AppColors.accentWarning,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Text(
              "Recommended Class Intervention:",
              style: AppTypography.labelMedium.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurface : Colors.grey.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                c.recommendedIntervention,
                style: AppTypography.bodyMedium.copyWith(height: 1.4),
              ),
            ),
            if (c.exampleStudents.isNotEmpty) ...[
              const SizedBox(height: 12),
              Wrap(
                spacing: 6,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  const Text("Affected Students: ", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
                  ...c.exampleStudents.map(
                    (s) => Chip(
                      label: Text(s, style: const TextStyle(fontSize: 11)),
                      backgroundColor: isDark ? AppColors.darkSurface : Colors.grey.shade200,
                      padding: EdgeInsets.zero,
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  // ── Tab 3: At-Risk Students ────────────────────────────────────────────────

  Widget _buildAtRiskTab(bool isDark) {
    if (_atRisk == null || _atRisk!.students.isEmpty) {
      return const Center(child: Text("No at-risk students identified."));
    }

    final ar = _atRisk!;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Row(
          children: [
            Expanded(
              child: _buildMetricMiniCard(
                title: "At-Risk Total",
                value: "${ar.atRiskCount} / ${ar.totalClassSize}",
                icon: Icons.group_outlined,
                color: AppColors.accentWarning,
                isDark: isDark,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildMetricMiniCard(
                title: "Critical Interventions",
                value: "${ar.criticalCount}",
                icon: Icons.emergency_outlined,
                color: AppColors.accentCritical,
                isDark: isDark,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildMetricMiniCard(
                title: "Class Average",
                value: "${(ar.classAverageMastery * 100).round()}%",
                icon: Icons.insights_outlined,
                color: AppColors.primaryGreen,
                isDark: isDark,
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        ...ar.students.map((s) => _buildAtRiskCard(s, isDark)),
      ],
    );
  }

  Widget _buildMetricMiniCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 6),
              Text(title, style: AppTypography.labelSmall.copyWith(color: AppColors.textSecondaryDark)),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTypography.titleMedium.copyWith(
              fontWeight: FontWeight.w700,
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAtRiskCard(AtRiskStudentModel s, bool isDark) {
    final isCritical = s.riskLevel == 'critical';
    final badgeColor = isCritical ? AppColors.accentCritical : AppColors.accentWarning;

    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: isCritical ? AppColors.accentCritical.withOpacity(0.5) : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
          width: isCritical ? 1.5 : 1.0,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: badgeColor.withOpacity(0.15),
                      child: Text(
                        s.studentName.isNotEmpty ? s.studentName[0] : 'S',
                        style: TextStyle(color: badgeColor, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(s.studentName, style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.bold)),
                        Text(
                          "Avg Mastery: ${(s.averageMastery * 100).round()}% | Weakest: ${s.weakestTopicName}",
                          style: AppTypography.labelSmall.copyWith(
                            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: badgeColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: badgeColor),
                  ),
                  child: Text(
                    s.riskLevel.toUpperCase(),
                    style: TextStyle(color: badgeColor, fontWeight: FontWeight.bold, fontSize: 11),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: s.riskReasons
                  .map((r) => Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.darkSurface : Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text("• $r", style: const TextStyle(fontSize: 11)),
                      ))
                  .toList(),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.primaryGreen.withOpacity(0.08),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.primaryGreen.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.bolt_rounded, size: 16, color: AppColors.primaryGreen),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      s.recommendedAction,
                      style: AppTypography.bodySmall.copyWith(
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Tab 4: Difficulty Cliffs ───────────────────────────────────────────────

  Widget _buildDifficultyTab(bool isDark) {
    if (_difficulty == null || _difficulty!.profiles.isEmpty) {
      return const Center(child: Text("No topic difficulty data available."));
    }

    final d = _difficulty!;
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
          ),
          child: Row(
            children: [
              const Icon(Icons.trending_down_rounded, color: AppColors.accentCritical, size: 22),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  "Difficulty Cliff Analysis isolates where student accuracy drastically plunges from Basic/Medium tiers to Hard/Application tiers, signaling a missing conceptual bridge.",
                  style: AppTypography.bodyMedium.copyWith(
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        ...d.profiles.map((p) => _buildTopicCliffCard(p, isDark)),
      ],
    );
  }

  Widget _buildTopicCliffCard(TopicDifficultyProfileModel p, bool isDark) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: p.difficultyCliffDetected
              ? AppColors.accentCritical.withOpacity(0.5)
              : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
          width: p.difficultyCliffDetected ? 1.5 : 1.0,
        ),
      ),
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
                    p.topicName,
                    style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.bold),
                  ),
                ),
                if (p.difficultyCliffDetected)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.accentCritical.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.accentCritical),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.warning_rounded, size: 14, color: AppColors.accentCritical),
                        SizedBox(width: 4),
                        Text(
                          "CLIFF DETECTED",
                          style: TextStyle(color: AppColors.accentCritical, fontWeight: FontWeight.bold, fontSize: 10),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 14),
            _buildAccuracyBar("Basic Tier", p.basicAccuracy, const Color(0xFF10B981)),
            const SizedBox(height: 8),
            _buildAccuracyBar("Medium Tier", p.mediumAccuracy, const Color(0xFF3B82F6)),
            const SizedBox(height: 8),
            _buildAccuracyBar("Hard Tier", p.hardAccuracy, const Color(0xFFF59E0B)),
            const SizedBox(height: 8),
            _buildAccuracyBar("Application Tier", p.applicationAccuracy, const Color(0xFFEF4444)),
          ],
        ),
      ),
    );
  }

  Widget _buildAccuracyBar(String label, double accuracy, Color color) {
    final pct = (accuracy * 100).round();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
            Text("$pct%", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color)),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: accuracy.clamp(0.0, 1.0),
            minHeight: 6,
            backgroundColor: color.withOpacity(0.15),
            valueColor: AlwaysStoppedAnimation<Color>(color),
          ),
        ),
      ],
    );
  }
}
