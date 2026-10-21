import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utilities/responsive.dart';
import '../../services/api_service.dart';
import 'session_screen.dart';

class KnowledgeMapScreen extends StatefulWidget {
  const KnowledgeMapScreen({Key? key}) : super(key: key);

  @override
  State<KnowledgeMapScreen> createState() => _KnowledgeMapScreenState();
}

class _KnowledgeMapScreenState extends State<KnowledgeMapScreen> {
  String _selectedTopicId = "quadratic_equations";
  String _selectedTopicName = "Quadratic Equations";
  Map<String, dynamic>? _selectedNodeData;
  bool _isLoadingNode = false;

  final List<Map<String, dynamic>> _nodes = [
    {
      "id": "arithmetic",
      "name": "Arithmetic Operations",
      "subject": "Mathematics",
      "level": 1,
      "mastery": 92.0,
      "status": "mastered",
      "prereqs": []
    },
    {
      "id": "fractions",
      "name": "Fractions & Decimals",
      "subject": "Mathematics",
      "level": 2,
      "mastery": 88.0,
      "status": "strong",
      "prereqs": ["arithmetic"]
    },
    {
      "id": "algebraic_manipulation",
      "name": "Algebraic Manipulation",
      "subject": "Mathematics",
      "level": 3,
      "mastery": 80.0,
      "status": "strong",
      "prereqs": ["fractions"]
    },
    {
      "id": "factorisation",
      "name": "Factorisation",
      "subject": "Mathematics",
      "level": 4,
      "mastery": 43.0,
      "status": "weak",
      "prereqs": ["algebraic_manipulation"]
    },
    {
      "id": "quadratic_equations",
      "name": "Quadratic Equations",
      "subject": "Mathematics",
      "level": 5,
      "mastery": 51.0,
      "status": "developing",
      "prereqs": ["factorisation"]
    },
    {
      "id": "vectors",
      "name": "Vectors & Scalars",
      "subject": "Physics",
      "level": 3,
      "mastery": 70.0,
      "status": "developing",
      "prereqs": ["algebraic_manipulation"]
    },
    {
      "id": "kinematics",
      "name": "Kinematics & Motion",
      "subject": "Physics",
      "level": 4,
      "mastery": 45.0,
      "status": "weak",
      "prereqs": ["vectors"]
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadNodeDetails(_selectedTopicId, _selectedTopicName);
  }

  Future<void> _loadNodeDetails(String topicId, String topicName) async {
    setState(() {
      _selectedTopicId = topicId;
      _selectedTopicName = topicName;
      _isLoadingNode = true;
    });

    try {
      final res = await ApiService.getWhyStruggling(topicId);
      setState(() {
        _selectedNodeData = res;
        _isLoadingNode = false;
      });
    } catch (_) {
      setState(() => _isLoadingNode = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isDesktop = Responsive.isDesktop(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text("Prerequisite Knowledge Map"),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: isDesktop
          ? Row(
              children: [
                Expanded(flex: 3, child: _buildGraphArea(isDark)),
                Container(
                  width: 360,
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                    border: Border(
                      left: BorderSide(
                        color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                      ),
                    ),
                  ),
                  child: _buildInspector(isDark),
                ),
              ],
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  _buildGraphArea(isDark),
                  const SizedBox(height: 24),
                  _buildInspector(isDark),
                ],
              ),
            ),
    );
  }

  Widget _buildGraphArea(bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.hub_rounded, color: AppColors.primaryGreen, size: 20),
              const SizedBox(width: 8),
              Text(
                "Concept Dependency Graph (DAG)",
                style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w600),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            "Select any concept to inspect prerequisite health and deterministic root causes.",
            style: AppTypography.bodySmall.copyWith(
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: ListView.separated(
              itemCount: _nodes.length,
              separatorBuilder: (context, index) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Icon(
                      Icons.arrow_downward_rounded,
                      size: 18,
                      color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                    ),
                  ),
                );
              },
              itemBuilder: (context, index) {
                final node = _nodes[index];
                final isSelected = node["id"] == _selectedTopicId;
                final mastery = (node["mastery"] as num).toDouble();

                Color statusColor;
                if (mastery >= 85) {
                  statusColor = AppColors.primaryGreen;
                } else if (mastery >= 65) {
                  statusColor = const Color(0xFF64B5F6);
                } else if (mastery >= 50) {
                  statusColor = const Color(0xFFFFB74D);
                } else {
                  statusColor = const Color(0xFFE57373);
                }

                return InkWell(
                  onTap: () => _loadNodeDetails(node["id"], node["name"]),
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isSelected
                            ? AppColors.primaryGreen
                            : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                        width: isSelected ? 2 : 1,
                      ),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: AppColors.primaryGreen.withOpacity(0.15),
                                blurRadius: 10,
                              ),
                            ]
                          : [],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 10,
                              height: 10,
                              decoration: BoxDecoration(
                                color: statusColor,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  node["name"],
                                  style: AppTypography.titleSmall.copyWith(
                                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                                  ),
                                ),
                                Text(
                                  "${node['subject']} • Level ${node['level']}",
                                  style: AppTypography.bodySmall.copyWith(
                                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: statusColor.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            "${mastery.toInt()}%",
                            style: AppTypography.labelSmall.copyWith(
                              color: statusColor,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInspector(bool isDark) {
    if (_isLoadingNode) {
      return const Center(child: CircularProgressIndicator(color: AppColors.primaryGreen));
    }

    final diag = _selectedNodeData;
    final prereqGaps = (diag?["prerequisite_gaps"] as List?) ?? [];
    final recAction = diag?["recommended_action"] ?? "Standard practice recommended.";

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.info_outline_rounded, color: AppColors.primaryGreen, size: 20),
              const SizedBox(width: 8),
              Text(
                "Node Inspector",
                style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w600),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            _selectedTopicName,
            style: AppTypography.titleLarge.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 14),
          _buildInspectorRow("Current Mastery", "${diag?['topic_mastery'] ?? 50.0}%", isDark),
          _buildInspectorRow("Retention Status", "Estimated Recall 74%", isDark),
          _buildInspectorRow("Learning Trend", "Improving Trajectory", isDark),
          const SizedBox(height: 18),
          const Divider(),
          const SizedBox(height: 14),
          Text(
            "Prerequisite Health",
            style: AppTypography.labelLarge.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          if (prereqGaps.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFE57373).withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE57373).withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.warning_rounded, color: Color(0xFFE57373), size: 16),
                      SizedBox(width: 6),
                      Text("Prerequisite Gap Detected", style: TextStyle(color: Color(0xFFE57373), fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    "${prereqGaps[0]['topic_name']} is currently at ${prereqGaps[0]['mastery_score']}% mastery.",
                    style: AppTypography.bodySmall,
                  ),
                ],
              ),
            )
          else
            Text(
              "All foundational prerequisites are solid.",
              style: AppTypography.bodySmall.copyWith(color: AppColors.primaryGreen),
            ),
          const SizedBox(height: 18),
          Text(
            "Deterministic Recommendation",
            style: AppTypography.labelLarge.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          Text(
            recAction,
            style: AppTypography.bodySmall.copyWith(
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              height: 1.4,
            ),
          ),
          const Spacer(),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => SessionScreen(
                      topicId: _selectedTopicId,
                      topicName: _selectedTopicName,
                    ),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              icon: const Icon(Icons.play_arrow_rounded, size: 20),
              label: const Text("Launch Practice Session"),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInspectorRow(String label, String value, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: AppTypography.bodySmall.copyWith(
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            ),
          ),
          Text(
            value,
            style: AppTypography.bodySmall.copyWith(
              fontWeight: FontWeight.w600,
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
            ),
          ),
        ],
      ),
    );
  }
}
