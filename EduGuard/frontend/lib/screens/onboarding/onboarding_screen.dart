import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/auth_provider.dart';
import '../student/diagnostic_intro_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({Key? key}) : super(key: key);

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _nameController = TextEditingController();
  final Set<String> _selectedSubjects = {"mathematics"};
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().user;
    if (user != null) {
      _nameController.text = user.displayName;
    }
  }

  Future<void> _completeOnboarding() async {
    setState(() => _isSaving = true);

    await context.read<AuthProvider>().completeOnboarding(
      _nameController.text.trim().isEmpty ? "Student" : _nameController.text.trim(),
      _selectedSubjects.toList(),
    );

    if (!mounted) return;
    setState(() => _isSaving = false);

    // Prompt student into initial Mathematics diagnostic
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => const DiagnosticIntroScreen(
          subjectId: "mathematics",
          subjectName: "Mathematics",
          topicId: "quadratic_equations",
          topicName: "Quadratic Equations",
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 540),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Step Indicator
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primaryGreenLight,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        "STEP 1 OF 2",
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.primaryGreenDark,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      "Setup your learning profile",
                      style: AppTypography.bodySmall.copyWith(
                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Text(
                  "Welcome to EduGuard",
                  style: AppTypography.displayMedium.copyWith(
                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  "Configure your academic focus so our adaptive engines can personalize your practice and diagnose prerequisite gaps.",
                  style: AppTypography.bodyMedium.copyWith(
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                  ),
                ),
                const SizedBox(height: 32),

                // Name Input
                Text(
                  "What should we call you?",
                  style: AppTypography.titleMedium.copyWith(
                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _nameController,
                  decoration: InputDecoration(
                    hintText: "Claudia Waithaka",
                    filled: true,
                    fillColor: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                    ),
                  ),
                ),
                const SizedBox(height: 28),

                // Subject Selection
                Text(
                  "Select your focus subjects",
                  style: AppTypography.titleMedium.copyWith(
                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                  ),
                ),
                const SizedBox(height: 12),
                _buildSubjectTile("mathematics", "Mathematics", "Algebra, quadratics, functions & geometry", Icons.calculate_rounded, isDark),
                const SizedBox(height: 10),
                _buildSubjectTile("biology", "Biological Sciences", "Cell division, genetics, physiology", Icons.biotech_rounded, isDark),
                const SizedBox(height: 10),
                _buildSubjectTile("physics", "Physics", "Mechanics, kinematics, forces & energy", Icons.bolt_rounded, isDark),
                const SizedBox(height: 32),

                // CTA
                SizedBox(
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _selectedSubjects.isEmpty || _isSaving ? null : _completeOnboarding,
                    child: _isSaving
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text("Continue to Baseline Diagnostic"),
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

  Widget _buildSubjectTile(String id, String title, String desc, IconData icon, bool isDark) {
    final isSelected = _selectedSubjects.contains(id);
    return InkWell(
      onTap: () {
        setState(() {
          if (isSelected) {
            if (_selectedSubjects.length > 1) _selectedSubjects.remove(id);
          } else {
            _selectedSubjects.add(id);
          }
        });
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primaryGreen : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isSelected 
                    ? (isDark ? AppColors.primaryGreenDark : AppColors.primaryGreenLight)
                    : (isDark ? AppColors.darkSurfaceElevated : AppColors.lightBorderSubtle),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: isSelected ? AppColors.primaryGreen : AppColors.textSecondaryLight, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTypography.titleMedium.copyWith(
                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                      fontSize: 15,
                    ),
                  ),
                  Text(
                    desc,
                    style: AppTypography.bodySmall.copyWith(
                      color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                    ),
                  ),
                ],
              ),
            ),
            Checkbox(
              value: isSelected,
              activeColor: AppColors.primaryGreen,
              onChanged: (_) {
                setState(() {
                  if (isSelected) {
                    if (_selectedSubjects.length > 1) _selectedSubjects.remove(id);
                  } else {
                    _selectedSubjects.add(id);
                  }
                });
              },
            ),
          ],
        ),
      ),
    );
  }
}
