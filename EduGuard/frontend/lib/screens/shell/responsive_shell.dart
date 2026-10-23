import 'package:flutter/material.dart';
import '../../core/utilities/responsive.dart';
import '../../widgets/navigation/desktop_sidebar.dart';
import '../../widgets/navigation/mobile_bottom_bar.dart';
import '../student/dashboard_screen.dart';
import '../student/subject_selection_screen.dart';
import '../student/why_struggling_screen.dart';
import '../student/learning_history_screen.dart';
import '../student/analytics_screen.dart';
import '../student/retention_center_screen.dart';
import '../student/knowledge_map_screen.dart';
import '../student/ai_tutor_screen.dart';
import '../student/notes_analyzer_screen.dart';
import '../teacher/teacher_class_screen.dart';

class ResponsiveShell extends StatefulWidget {
  const ResponsiveShell({Key? key}) : super(key: key);

  @override
  State<ResponsiveShell> createState() => _ResponsiveShellState();
}

class _ResponsiveShellState extends State<ResponsiveShell> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final isDesktop = Responsive.isDesktop(context);

    final pages = [
      const DashboardScreen(),
      const SubjectSelectionScreen(),
      const WhyStrugglingScreen(topicId: "quadratic_equations", topicName: "Quadratic Equations"),
      const AnalyticsScreen(),
      const RetentionCenterScreen(),
      const KnowledgeMapScreen(),
      const LearningHistoryScreen(),
      const AITutorScreen(topicId: "quadratic_equations", topicTitle: "Quadratic Equations"),
      const NotesAnalyzerScreen(initialTopicId: "quadratic_equations", initialSubjectId: "mathematics"),
      const TeacherClassScreen(),
    ];

    if (isDesktop) {
      return Scaffold(
        body: Row(
          children: [
            DesktopSidebar(
              selectedIndex: _selectedIndex,
              onDestinationSelected: (index) {
                setState(() {
                  _selectedIndex = index;
                });
              },
            ),
            Expanded(
              child: IndexedStack(
                index: _selectedIndex.clamp(0, pages.length - 1),
                children: pages,
              ),
            ),
          ],
        ),
      );
    }

    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex >= pages.length ? 0 : _selectedIndex,
        children: pages,
      ),
      bottomNavigationBar: MobileBottomBar(
        selectedIndex: _selectedIndex >= 4 ? 0 : _selectedIndex,
        onDestinationSelected: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
      ),
    );
  }
}
