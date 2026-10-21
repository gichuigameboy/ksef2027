import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/auth_provider.dart';
import 'auth_widgets.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({Key? key}) : super(key: key);

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isEmailLoading = false;
  bool _isGoogleLoading = false;
  bool _passwordVisible = false;
  String? _errorMessage;

  // ── Google Sign-Up ────────────────────────────────────────────────────────

  Future<void> _handleGoogleSignUp() async {
    setState(() {
      _isGoogleLoading = true;
      _errorMessage = null;
    });

    final success = await context.read<AuthProvider>().signInWithGoogle();

    if (!mounted) return;
    setState(() => _isGoogleLoading = false);

    if (!success) {
      setState(() {
        _errorMessage = context.read<AuthProvider>().error ??
            'Google sign-in failed. Please try again.';
      });
    } else {
      Navigator.pop(context);
    }
  }

  // ── Email/Password Registration ───────────────────────────────────────────

  Future<void> _handleSignup() async {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (name.isEmpty) {
      setState(() => _errorMessage = 'Please enter your full name.');
      return;
    }
    if (email.isEmpty) {
      setState(() => _errorMessage = 'Please enter your email address.');
      return;
    }
    if (password.length < 6) {
      setState(
          () => _errorMessage = 'Password must be at least 6 characters.');
      return;
    }

    setState(() {
      _isEmailLoading = true;
      _errorMessage = null;
    });

    final success =
        await context.read<AuthProvider>().register(email, password, name);

    if (!mounted) return;
    setState(() => _isEmailLoading = false);

    if (success) {
      Navigator.pop(context);
    } else {
      setState(() {
        _errorMessage = context.read<AuthProvider>().error ??
            'Registration failed. Please try again.';
      });
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
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

    final bool anyLoading = _isEmailLoading || _isGoogleLoading;

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
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Create an account',
                  style: AppTypography.displayMedium.copyWith(
                    color: textPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Start measuring authentic understanding with adaptive intelligence.',
                  style:
                      AppTypography.bodyMedium.copyWith(color: textSecondary),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 28),

                // ── Error ────────────────────────────────────────────────
                if (_errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.masteryCritical.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                          color: AppColors.masteryCritical.withOpacity(0.3)),
                    ),
                    child: Text(
                      _errorMessage!,
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.masteryCritical,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                ],

                // ── Google Sign-Up ───────────────────────────────────────
                AuthGoogleButton(
                  loading: _isGoogleLoading,
                  disabled: anyLoading,
                  isDark: isDark,
                  onPressed: _handleGoogleSignUp,
                  label: 'Sign up with Google',
                ),
                const SizedBox(height: 20),

                // ── Divider ──────────────────────────────────────────────
                AuthOrDivider(
                    textSecondary: textSecondary, borderColor: borderColor),
                const SizedBox(height: 20),

                // ── Full Name ────────────────────────────────────────────
                Text(
                  'Full name',
                  style:
                      AppTypography.labelMedium.copyWith(color: textPrimary),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: _nameController,
                  enabled: !anyLoading,
                  textCapitalization: TextCapitalization.words,
                  decoration: _inputDecoration(
                    hint: 'Claudia Waithaka',
                    prefix: Icons.person_outline_rounded,
                    surfaceColor: surfaceColor,
                    borderColor: borderColor,
                    textSecondary: textSecondary,
                  ),
                ),
                const SizedBox(height: 16),

                // ── Email ────────────────────────────────────────────────
                Text(
                  'Email address',
                  style:
                      AppTypography.labelMedium.copyWith(color: textPrimary),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  enabled: !anyLoading,
                  decoration: _inputDecoration(
                    hint: 'you@school.edu',
                    prefix: Icons.mail_outline_rounded,
                    surfaceColor: surfaceColor,
                    borderColor: borderColor,
                    textSecondary: textSecondary,
                  ),
                ),
                const SizedBox(height: 16),

                // ── Password ─────────────────────────────────────────────
                Text(
                  'Password',
                  style:
                      AppTypography.labelMedium.copyWith(color: textPrimary),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: _passwordController,
                  obscureText: !_passwordVisible,
                  enabled: !anyLoading,
                  onSubmitted: (_) => _handleSignup(),
                  decoration: _inputDecoration(
                    hint: '••••••••',
                    prefix: Icons.lock_outline_rounded,
                    surfaceColor: surfaceColor,
                    borderColor: borderColor,
                    textSecondary: textSecondary,
                    suffix: IconButton(
                      icon: Icon(
                        _passwordVisible
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined,
                        size: 20,
                        color: textSecondary,
                      ),
                      onPressed: () => setState(
                          () => _passwordVisible = !_passwordVisible),
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Minimum 6 characters.',
                  style: AppTypography.bodySmall.copyWith(color: textSecondary),
                ),
                const SizedBox(height: 28),

                // ── Create Account button ────────────────────────────────
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: anyLoading ? null : _handleSignup,
                    child: _isEmailLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white),
                          )
                        : const Text('Create Account'),
                  ),
                ),
                const SizedBox(height: 20),

                // ── Switch to Sign In ────────────────────────────────────
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Already have an account? ',
                      style: AppTypography.bodySmall
                          .copyWith(color: textSecondary),
                    ),
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Text(
                        'Sign in',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.primaryGreen,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration({
    required String hint,
    required IconData prefix,
    required Color surfaceColor,
    required Color borderColor,
    required Color textSecondary,
    Widget? suffix,
  }) {
    return InputDecoration(
      hintText: hint,
      prefixIcon: Icon(prefix, size: 20, color: textSecondary),
      suffixIcon: suffix,
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
    );
  }
}
