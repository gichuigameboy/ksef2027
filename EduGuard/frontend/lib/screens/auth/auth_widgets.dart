/// Shared auth UI widgets used across login and signup screens.
library;

import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

/// Google "Continue with Google" button with inline coloured logo.
class AuthGoogleButton extends StatelessWidget {
  final bool loading;
  final bool disabled;
  final bool isDark;
  final VoidCallback onPressed;
  final String label;

  const AuthGoogleButton({
    Key? key,
    required this.loading,
    required this.disabled,
    required this.isDark,
    required this.onPressed,
    this.label = 'Continue with Google',
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final borderColor =
        isDark ? AppColors.darkBorder : AppColors.lightBorder;
    final surfaceColor =
        isDark ? AppColors.darkSurface : AppColors.lightSurface;
    final textPrimary =
        isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;

    return SizedBox(
      height: 48,
      child: OutlinedButton(
        onPressed: disabled ? null : onPressed,
        style: OutlinedButton.styleFrom(
          backgroundColor: surfaceColor,
          side: BorderSide(color: borderColor, width: 1.2),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12)),
        ),
        child: loading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const GoogleLogoIcon(size: 20),
                  const SizedBox(width: 10),
                  Text(
                    label,
                    style: AppTypography.labelMedium.copyWith(
                      color: textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

/// "── or ──" divider used between Google and email/password sections.
class AuthOrDivider extends StatelessWidget {
  final Color textSecondary;
  final Color borderColor;

  const AuthOrDivider({
    Key? key,
    required this.textSecondary,
    required this.borderColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Divider(color: borderColor, thickness: 1)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(
            'or',
            style: AppTypography.bodySmall.copyWith(color: textSecondary),
          ),
        ),
        Expanded(child: Divider(color: borderColor, thickness: 1)),
      ],
    );
  }
}

/// Inline Google 'G' logo drawn with a CustomPainter — no asset required.
class GoogleLogoIcon extends StatelessWidget {
  final double size;
  const GoogleLogoIcon({Key? key, required this.size}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _GoogleLogoPainter()),
    );
  }
}

class _GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final r = size.width / 2;

    const colors = [
      Color(0xFF4285F4),
      Color(0xFF34A853),
      Color(0xFFFBBC05),
      Color(0xFFEA4335),
    ];
    const starts = [0.0, 90.0, 180.0, 270.0];

    for (int i = 0; i < 4; i++) {
      final paint = Paint()
        ..color = colors[i]
        ..style = PaintingStyle.stroke
        ..strokeWidth = size.width * 0.18;
      canvas.drawArc(
        Rect.fromCircle(center: Offset(cx, cy), radius: r * 0.72),
        _deg(starts[i]),
        _deg(80),
        false,
        paint,
      );
    }

    // Horizontal bar of the 'G'
    final barPaint = Paint()
      ..color = const Color(0xFF4285F4)
      ..strokeWidth = size.width * 0.18
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(Offset(cx, cy), Offset(cx + r * 0.72, cy), barPaint);
  }

  double _deg(double d) => d * 3.141592653589793 / 180;

  @override
  bool shouldRepaint(_) => false;
}
