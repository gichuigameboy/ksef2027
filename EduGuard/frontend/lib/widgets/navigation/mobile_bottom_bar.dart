import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class MobileBottomBar extends StatelessWidget {
  final int selectedIndex;
  final Function(int) onDestinationSelected;

  const MobileBottomBar({
    Key? key,
    required this.selectedIndex,
    required this.onDestinationSelected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.darkBackground,
        border: Border(
          top: BorderSide(color: AppColors.darkBorder, width: 1),
        ),
      ),
      child: BottomNavigationBar(
        currentIndex: selectedIndex,
        onTap: onDestinationSelected,
        backgroundColor: Colors.transparent,
        selectedItemColor: AppColors.primaryGreen,
        unselectedItemColor: AppColors.textSecondaryDark,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard_rounded),
            label: "Mission",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.account_tree_outlined),
            activeIcon: Icon(Icons.account_tree_rounded),
            label: "Map",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.psychology_alt_outlined),
            activeIcon: Icon(Icons.psychology_alt_rounded),
            label: "Diagnose",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.verified_outlined),
            activeIcon: Icon(Icons.verified_rounded),
            label: "Verify",
          ),
        ],
      ),
    );
  }
}
