import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/auth_provider.dart';

class DesktopSidebar extends StatelessWidget {
  final int selectedIndex;
  final Function(int) onDestinationSelected;

  const DesktopSidebar({
    Key? key,
    required this.selectedIndex,
    required this.onDestinationSelected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final displayName = user?.displayName ?? "Student";
    final initials = displayName.split(' ').map((n) => n.isNotEmpty ? n[0] : '').take(2).join();

    return Container(
      width: 250,
      decoration: const BoxDecoration(
        color: AppColors.darkBackground,
        border: Border(
          right: BorderSide(color: AppColors.darkBorder, width: 1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Logo & Brand Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
            child: Row(
              children: [
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreen,
                    borderRadius: BorderRadius.circular(9),
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.auto_awesome,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'EduGuard',
                  style: AppTypography.titleLarge.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.5,
                  ),
                ),
              ],
            ),
          ),

          // Navigation Items List
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: [
                _buildSectionHeader("LEARNING CORE"),
                _buildNavItem(
                  index: 0,
                  icon: Icons.dashboard_outlined,
                  selectedIcon: Icons.dashboard_rounded,
                  label: "Dashboard",
                ),
                _buildNavItem(
                  index: 1,
                  icon: Icons.menu_book_outlined,
                  selectedIcon: Icons.menu_book_rounded,
                  label: "Curriculum & Diag",
                ),
                _buildNavItem(
                  index: 2,
                  icon: Icons.psychology_alt_outlined,
                  selectedIcon: Icons.psychology_alt_rounded,
                  label: "Why Am I Struggling?",
                ),
                _buildNavItem(
                  index: 3,
                  icon: Icons.analytics_outlined,
                  selectedIcon: Icons.analytics_rounded,
                  label: "Analytics & Velocity",
                ),
                _buildNavItem(
                  index: 4,
                  icon: Icons.replay_outlined,
                  selectedIcon: Icons.replay_rounded,
                  label: "Retention Center",
                ),
                _buildNavItem(
                  index: 5,
                  icon: Icons.hub_outlined,
                  selectedIcon: Icons.hub_rounded,
                  label: "Knowledge Map",
                ),
                _buildNavItem(
                  index: 6,
                  icon: Icons.history_rounded,
                  selectedIcon: Icons.history_edu_rounded,
                  label: "Learning Timeline",
                ),
                const SizedBox(height: 8),
                _buildSectionHeader("AI INTELLIGENCE"),
                _buildNavItem(
                  index: 7,
                  icon: Icons.smart_toy_outlined,
                  selectedIcon: Icons.smart_toy_rounded,
                  label: "AI Socratic Tutor",
                ),
                _buildNavItem(
                  index: 8,
                  icon: Icons.note_alt_outlined,
                  selectedIcon: Icons.note_alt_rounded,
                  label: "Lecture Notes Coach",
                ),
                const SizedBox(height: 8),
                _buildSectionHeader("EDUCATOR VIEW"),
                _buildNavItem(
                  index: 9,
                  icon: Icons.school_outlined,
                  selectedIcon: Icons.school_rounded,
                  label: "Teacher Class Hub",
                ),
              ],
            ),
          ),

          // User Profile Snippet & Logout
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              border: Border(
                top: BorderSide(color: AppColors.darkBorder, width: 1),
              ),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: AppColors.darkSurfaceElevated,
                  child: Text(
                    initials.isEmpty ? "EG" : initials,
                    style: AppTypography.labelMedium.copyWith(
                      color: AppColors.primaryGreen,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        displayName,
                        style: AppTypography.labelMedium.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        user?.email ?? "student@eduguard.edu",
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.textSecondaryDark,
                          fontSize: 11,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.logout_rounded, size: 18, color: AppColors.textSecondaryDark),
                  tooltip: "Sign out",
                  onPressed: () {
                    context.read<AuthProvider>().logout();
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 12, top: 12, bottom: 6),
      child: Text(
        title,
        style: TextStyle(
          color: AppColors.textSecondaryDark.withOpacity(0.6),
          fontSize: 10,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.1,
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData icon,
    required IconData selectedIcon,
    required String label,
  }) {
    final isSelected = selectedIndex == index;
    return Container(
      margin: const EdgeInsets.only(bottom: 3),
      decoration: BoxDecoration(
        color: isSelected ? AppColors.darkSurface : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
      ),
      child: ListTile(
        dense: true,
        horizontalTitleGap: 10,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
        leading: Icon(
          isSelected ? selectedIcon : icon,
          color: isSelected ? AppColors.primaryGreen : AppColors.textSecondaryDark,
          size: 19,
        ),
        title: Text(
          label,
          style: AppTypography.bodyMedium.copyWith(
            color: isSelected ? Colors.white : AppColors.textSecondaryDark,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
            fontSize: 13,
          ),
        ),
        onTap: () => onDestinationSelected(index),
      ),
    );
  }
}
