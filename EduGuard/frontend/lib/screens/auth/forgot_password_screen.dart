import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/auth_provider.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({Key? key}) : super(key: key);

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  bool _isSending = false;
  bool _sent = false;
  String? _error;

  Future<void> _handleSend() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      setState(() => _error = 'Please enter your email address.');
      return;
    }

    setState(() {
      _isSending = true;
      _error = null;
    });

    final err =
        await context.read<AuthProvider>().sendPasswordResetEmail(email);

    if (!mounted) return;
    setState(() {
      _isSending = false;
      if (err == null) {
        _sent = true;
      } else {
        _error = err;
      }
    });
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPrimary =
        isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final textSecondary =
        isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final surfaceColor =
        isDark ? AppColors.darkSurface : AppColors.lightSurface;
    final borderColor =
        isDark ? AppColors.darkBorder : AppColors.lightBorder;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_rounded, color: textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 350),
              child: _sent ? _buildSuccessState(textPrimary, textSecondary) : _buildForm(isDark, textPrimary, textSecondary, surfaceColor, borderColor),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildForm(
    bool isDark,
    Color textPrimary,
    Color textSecondary,
    Color surfaceColor,
    Color borderColor,
  ) {
    return Column(
      key: const ValueKey('form'),
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Icon
        Center(
          child: Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: AppColors.primaryGreen.withOpacity(0.12),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Center(
              child: Icon(Icons.lock_reset_rounded,
                  color: AppColors.primaryGreen, size: 28),
            ),
          ),
        ),
        const SizedBox(height: 24),

        Text(
          'Reset your password',
          style: AppTypography.displayMedium.copyWith(
            color: textPrimary,
            fontWeight: FontWeight.w700,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 10),
        Text(
          "Enter the email address linked to your account and we'll send you a reset link.",
          style: AppTypography.bodyMedium.copyWith(color: textSecondary),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 32),

        // Error message
        if (_error != null) ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.masteryCritical.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                  color: AppColors.masteryCritical.withOpacity(0.3)),
            ),
            child: Text(
              _error!,
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.masteryCritical,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(height: 18),
        ],

        // Email Field
        Text(
          'Email address',
          style: AppTypography.labelMedium.copyWith(color: textPrimary),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          autofocus: true,
          onSubmitted: (_) => _handleSend(),
          decoration: InputDecoration(
            hintText: 'you@school.edu',
            prefixIcon: Icon(Icons.mail_outline_rounded,
                color: textSecondary, size: 20),
            filled: true,
            fillColor: surfaceColor,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: borderColor),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: borderColor),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide:
                  const BorderSide(color: AppColors.primaryGreen, width: 1.5),
            ),
          ),
        ),
        const SizedBox(height: 24),

        // Send Button
        SizedBox(
          height: 48,
          child: ElevatedButton(
            onPressed: _isSending ? null : _handleSend,
            child: _isSending
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white),
                  )
                : const Text('Send Reset Link'),
          ),
        ),
      ],
    );
  }

  Widget _buildSuccessState(Color textPrimary, Color textSecondary) {
    return Column(
      key: const ValueKey('success'),
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Center(
          child: Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: AppColors.primaryGreen.withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: const Center(
              child: Icon(Icons.mark_email_read_rounded,
                  color: AppColors.primaryGreen, size: 36),
            ),
          ),
        ),
        const SizedBox(height: 24),
        Text(
          'Check your inbox',
          style: AppTypography.displayMedium.copyWith(
            color: textPrimary,
            fontWeight: FontWeight.w700,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 10),
        Text(
          "We've sent a password reset link to ${_emailController.text.trim()}. Check your spam folder if you don't see it.",
          style: AppTypography.bodyMedium.copyWith(color: textSecondary),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 32),

        OutlinedButton(
          onPressed: () => Navigator.pop(context),
          style: OutlinedButton.styleFrom(
            minimumSize: const Size.fromHeight(48),
            side:
                const BorderSide(color: AppColors.primaryGreen, width: 1.5),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: Text(
            'Back to Sign In',
            style: AppTypography.labelMedium.copyWith(
              color: AppColors.primaryGreen,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Resend link
        Center(
          child: GestureDetector(
            onTap: () => setState(() => _sent = false),
            child: Text(
              "Didn't receive it? Try again",
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.primaryGreen,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
