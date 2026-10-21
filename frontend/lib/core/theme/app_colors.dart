import 'package:flutter/material.dart';

class AppColors {
  // Light Palette (ChatGPT-inspired clean, calm, premium)
  static const Color lightBackground = Color(0xFFF7F7F5);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightSurfaceElevated = Color(0xFFFAFAFA);
  static const Color lightBorder = Color(0xFFE5E7EB);
  static const Color lightBorderSubtle = Color(0xFFF0F0EE);
  
  // Dark Palette (ChatGPT-inspired intentional dark mode)
  static const Color darkBackground = Color(0xFF171717);
  static const Color darkSurface = Color(0xFF212121);
  static const Color darkSurfaceElevated = Color(0xFF2A2A2A);
  static const Color darkBorder = Color(0xFF2F2F2F);
  static const Color darkBorderSubtle = Color(0xFF242424);

  // Brand Primary Accent (Sophisticated emerald green)
  static const Color primaryGreen = Color(0xFF10A37F);
  static const Color primaryGreenHover = Color(0xFF0E8E6E);
  static const Color primaryGreenLight = Color(0xFFE6F7F2);
  static const Color primaryGreenDark = Color(0xFF134E42);

  // Typography & Neutrals
  static const Color textPrimaryLight = Color(0xFF171717);
  static const Color textSecondaryLight = Color(0xFF6B7280);
  static const Color textTertiaryLight = Color(0xFF9CA3AF);

  static const Color textPrimaryDark = Color(0xFFF5F5F5);
  static const Color textSecondaryDark = Color(0xFFA3A3A3);
  static const Color textTertiaryDark = Color(0xFF6B7280);

  // Muted Semantic Accents (For mastery categories and alerts)
  static const Color masteryMastered = Color(0xFF10A37F);  // 90-100%
  static const Color masteryStrong = Color(0xFF0D9488);    // 75-89% (Teal)
  static const Color masteryDeveloping = Color(0xFFD97706); // 60-74% (Muted Amber)
  static const Color masteryWeak = Color(0xFFEA580C);       // 40-59% (Muted Rust/Orange)
  static const Color masteryCritical = Color(0xFFDC2626);   // 0-39% (Muted Soft Red)

  static const Color accentCritical = Color(0xFFEF4444);
  static const Color accentWarning = Color(0xFFF59E0B);
  static const Color accentSuccess = Color(0xFF10B981);
  static const Color accentInfo = Color(0xFF3B82F6);
  static const Color accentTeal = Color(0xFF0D9488);

  static const Color infoBlue = Color(0xFF2563EB);
  static const Color infoBlueLight = Color(0xFFEFF6FF);
}
