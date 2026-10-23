import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utilities/responsive.dart';
import '../../providers/auth_provider.dart';
import '../../providers/learning_provider.dart';
import '../../widgets/cards/mission_card.dart';
import '../../widgets/cards/mastery_card.dart';
import '../../widgets/cards/retention_card.dart';
import '../../widgets/cards/next_best_action_card.dart';
import '../../widgets/cards/insights_carousel.dart';
import '../../models/learning_intelligence.dart';
import '../../services/api_service.dart';
import 'session_screen.dart';
import 'why_struggling_screen.dart';
import 'subject_selection_screen.dart';
import 'learning_history_screen.dart';
import 'analytics_screen.dart';
import 'retention_center_screen.dart';
import 'knowledge_map_screen.dart';
import 'ai_tutor_screen.dart';
import 'notes_analyzer_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  NextBestActionModel? _nextAction;
  List<StudentInsightModel> _insights = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<LearningProvider>().loadDashboardData();
      _loadIntelligenceData();
    });
  }

  Future<void> _loadIntelligenceData() async {
    try {
      final actFuture = ApiService.getNextBestAction();
      final insFuture = ApiService.getInsights();
      final results = await Future.wait([actFuture, insFuture]);
      if (mounted) {
        setState(() {
          _nextAction = results[0] as NextBestActionModel?;
          _insights = results[1] as List<StudentInsightModel>;
        });
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isDesktop = Responsive.isDesktop(context);
    final authUser = context.watch<AuthProvider>().user;
    final displayName = authUser?.displayName.split(' ').first ?? "Student";

    return Scaffold(
      body: Consumer<LearningProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(color: AppColors.primaryGreen),
            );
          }

          final mission = provider.mission;

          return RefreshIndicator(
            onRefresh: () => provider.loadDashboardData(),
            color: AppColors.primaryGreen,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: EdgeInsets.symmetric(
                horizontal: isDesktop ? 40 : 20,
                vertical: 32,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Greeting & Status Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Good afternoon, $displayName 👋",
                            style: AppTypography.displayMedium.copyWith(
                              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            "Here is your personalized intelligence briefing for today.",
                            style: AppTypography.bodyMedium.copyWith(
                              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                            ),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.history_rounded),
                            tooltip: "Learning History",
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const LearningHistoryScreen()),
                              );
                            },
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.primaryGreenLight,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                    color: AppColors.primaryGreen,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  "Adaptive Engine Active",
                                  style: AppTypography.bodySmall.copyWith(
                                    color: AppColors.primaryGreenDark,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 28),

                  // Diagnostic Banner Quick Action
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.primaryGreen.withOpacity(0.4)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.primaryGreenLight,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.assignment_turned_in_rounded, color: AppColors.primaryGreen, size: 22),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Curriculum Diagnostic Assessments",
                                style: AppTypography.titleMedium.copyWith(fontSize: 15),
                              ),
                              Text(
                                "Establish your authentic mastery baseline and identify prerequisite gaps.",
                                style: AppTypography.bodySmall.copyWith(
                                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const SubjectSelectionScreen()),
                            );
                          },
                          child: const Text("Select Subject"),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Next Best Action Card (Section 17 & 34)
                  if (_nextAction != null) ...[
                    NextBestActionCard(
                      action: _nextAction!,
                      onStart: () {
                        provider.startSession(_nextAction!.topicId);
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => SessionScreen(
                              topicId: _nextAction!.topicId,
                              topicName: _nextAction!.topicName,
                            ),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Intelligence Navigation Shortcuts
                  Wrap(
                    spacing: 12,
                    runSpacing: 10,
                    children: [
                      _buildQuickNavButton(
                        context: context,
                        label: "Analytics & Timeline",
                        icon: Icons.analytics_outlined,
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AnalyticsScreen())),
                        isDark: isDark,
                      ),
                      _buildQuickNavButton(
                        context: context,
                        label: "Retention Center",
                        icon: Icons.replay_rounded,
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RetentionCenterScreen())),
                        isDark: isDark,
                      ),
                      _buildQuickNavButton(
                        context: context,
                        label: "Knowledge Map",
                        icon: Icons.hub_outlined,
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const KnowledgeMapScreen())),
                        isDark: isDark,
                      ),
                      _buildQuickNavButton(
                        context: context,
                        label: "EduGuard AI Tutor",
                        icon: Icons.auto_awesome,
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const AITutorScreen(
                              topicId: "quadratic_equations",
                              topicTitle: "Quadratic Equations & Core Algebra",
                            ),
                          ),
                        ),
                        isDark: isDark,
                      ),
                      _buildQuickNavButton(
                        context: context,
                        label: "AI Notes Analyzer",
                        icon: Icons.psychology_rounded,
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotesAnalyzerScreen())),
                        isDark: isDark,
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Evidence-Based Insights Carousel (Section 23 & 34)
                  if (_insights.isNotEmpty) ...[
                    InsightsCarousel(insights: _insights),
                    const SizedBox(height: 28),
                  ],

                  // Main Content: Desktop 2-column or Mobile 1-column
                  if (isDesktop)
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Left Column: Today's Learning Mission (60%)
                        Expanded(
                          flex: 6,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (mission != null)
                                MissionCard(
                                  mission: mission,
                                  onStartMission: () {
                                    provider.startSession(null);
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (_) => const SessionScreen(topicTitle: "Today's Mission")),
                                    );
                                  },
                                ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 28),
                        // Right Column: Mastery Profile Overview (40%)
                        Expanded(
                          flex: 4,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Concept Mastery Profile",
                                style: AppTypography.titleLarge.copyWith(
                                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                                ),
                              ),
                              const SizedBox(height: 16),
                              ...provider.masteries.map((rec) => Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: MasteryCard(
                                  record: rec,
                                  onWhyStruggling: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) => WhyStrugglingScreen(topicId: rec.topicId, topicName: rec.topicName),
                                      ),
                                    );
                                  },
                                ),
                              )),
                            ],
                          ),
                        ),
                      ],
                    )
                  else
                    // Mobile Stack
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (mission != null)
                          MissionCard(
                            mission: mission,
                            onStartMission: () {
                              provider.startSession(null);
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const SessionScreen(topicTitle: "Today's Mission")),
                              );
                            },
                          ),
                        const SizedBox(height: 28),
                        Text(
                          "Concept Mastery Profile",
                          style: AppTypography.titleLarge.copyWith(
                            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                          ),
                        ),
                        const SizedBox(height: 14),
                        ...provider.masteries.map((rec) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: MasteryCard(
                            record: rec,
                            onWhyStruggling: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => WhyStrugglingScreen(topicId: rec.topicId, topicName: rec.topicName),
                                ),
                              );
                            },
                          ),
                        )),
                      ],
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildQuickNavButton({
    required BuildContext context,
    required String label,
    required IconData icon,
    required VoidCallback onTap,
    required bool isDark,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightSurface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: AppColors.primaryGreen),
            const SizedBox(width: 8),
            Text(
              label,
              style: AppTypography.bodySmall.copyWith(
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

