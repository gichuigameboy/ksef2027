import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/subject.dart';
import '../../services/api_service.dart';
import 'diagnostic_intro_screen.dart';

class SubjectSelectionScreen extends StatefulWidget {
  const SubjectSelectionScreen({Key? key}) : super(key: key);

  @override
  State<SubjectSelectionScreen> createState() => _SubjectSelectionScreenState();
}

class _SubjectSelectionScreenState extends State<SubjectSelectionScreen> {
  bool _isLoading = true;
  List<CurriculumSubjectModel> _subjects = [];
  String? _selectedSubjectId;

  @override
  void initState() {
    super.initState();
    _loadSubjects();
  }

  Future<void> _loadSubjects() async {
    final subs = await ApiService.getSubjects();
    setState(() {
      _subjects = subs;
      if (subs.isNotEmpty) {
        _selectedSubjectId = subs.first.id;
      }
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: AppColors.primaryGreen)),
      );
    }

    final selectedSubject = _subjects.firstWhere(
      (s) => s.id == _selectedSubjectId,
      orElse: () => _subjects.first,
    );

    return Scaffold(
      appBar: AppBar(
        title: Text("Curriculum Browser", style: AppTypography.titleMedium),
        elevation: 0,
        backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
        foregroundColor: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 820),
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
            children: [
              Text(
                "Select a Topic for Diagnostic Assessment",
                style: AppTypography.displayMedium.copyWith(
                  fontSize: 22,
                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                "EduGuard's prerequisite DAG automatically includes prerequisite questions to identify root causes of struggle.",
                style: AppTypography.bodyMedium.copyWith(
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                ),
              ),
              const SizedBox(height: 24),

              // Subject Tabs
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: _subjects.map((sub) {
                  final isSelected = sub.id == _selectedSubjectId;
                  return ChoiceChip(
                    label: Text(sub.name),
                    selected: isSelected,
                    selectedColor: isDark ? AppColors.primaryGreenDark : AppColors.primaryGreenLight,
                    labelStyle: AppTypography.labelMedium.copyWith(
                      color: isSelected 
                          ? AppColors.primaryGreen 
                          : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    ),
                    onSelected: (_) {
                      setState(() {
                        _selectedSubjectId = sub.id;
                      });
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 28),

              // Topics List
              Text(
                "${selectedSubject.name} Topics (${selectedSubject.topics.length})",
                style: AppTypography.titleMedium.copyWith(
                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                ),
              ),
              const SizedBox(height: 14),

              ...selectedSubject.topics.map((topic) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Row(
                      children: [
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: isDark ? AppColors.darkSurfaceElevated : AppColors.lightBackground,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                            ),
                          ),
                          child: Center(
                            child: Text(
                              "${topic.orderIndex}",
                              style: AppTypography.bodySmall.copyWith(
                                fontWeight: FontWeight.w700,
                                color: AppColors.primaryGreen,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                topic.name,
                                style: AppTypography.titleMedium.copyWith(
                                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                                  fontSize: 15,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                topic.description,
                                style: AppTypography.bodySmall.copyWith(
                                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                                ),
                              ),
                              if (topic.prerequisites.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    Text(
                                      "Prerequisites: ",
                                      style: AppTypography.bodySmall.copyWith(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                        color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                                      ),
                                    ),
                                    ...topic.prerequisites.map((p) => Container(
                                      margin: const EdgeInsets.only(right: 6),
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: isDark ? AppColors.darkSurface : AppColors.lightBorderSubtle,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        p.replaceAll('_', ' '),
                                        style: AppTypography.bodySmall.copyWith(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.primaryGreen,
                                        ),
                                      ),
                                    )),
                                  ],
                                ),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(width: 14),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => DiagnosticIntroScreen(
                                  subjectId: selectedSubject.id,
                                  subjectName: selectedSubject.name,
                                  topicId: topic.id,
                                  topicName: topic.name,
                                ),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          ),
                          child: const Text("Start Diagnostic"),
                        ),
                      ],
                    ),
                  ),
                ),
              )),
            ],
          ),
        ),
      ),
    );
  }
}
