import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/auth_provider.dart';
import 'auth_widgets.dart';
import 'forgot_password_screen.dart';
import 'signup_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isEmailLoading = false;
  bool _isGoogleLoading = false;
  bool _passwordVisible = false;
  String? _errorMessage;

  // ── Google Sign-In ────────────────────────────────────────────────────────

  Future<void> _handleGoogleSignIn() async {
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
    }
  }

  // ── Email/Password Sign-In ────────────────────────────────────────────────

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      setState(
          () => _errorMessage = 'Please enter your email and password.');
      return;
    }

    setState(() {
      _isEmailLoading = true;
      _errorMessage = null;
    });

    final success = await context
        .read<AuthProvider>()
        .login(email, password);

    if (!mounted) return;
    setState(() => _isEmailLoading = false);

    if (!success) {
      setState(() {
        _errorMessage = context.read<AuthProvider>().error ??
            'Invalid credentials. Please check your email and password.';
      });
    }
  }

  @override
  void dispose() {
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
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // ── Logo ──────────────────────────────────────────────────
                Center(
                  child: Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: AppColors.primaryGreen,
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: const Center(
                      child: Icon(Icons.auto_awesome,
                          color: Colors.white, size: 26),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                Text(
                  'Welcome back',
                  style: AppTypography.displayMedium.copyWith(
                    color: textPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Sign in to your EduGuard educational intelligence dashboard.',
                  style:
                      AppTypography.bodyMedium.copyWith(color: textSecondary),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),

                // ── Error ──────────────────────────────────────────────────
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

                // ── Google Sign-In ─────────────────────────────────────────
                AuthGoogleButton(
                  loading: _isGoogleLoading,
                  disabled: anyLoading,
                  isDark: isDark,
                  onPressed: _handleGoogleSignIn,
                ),
                const SizedBox(height: 20),

                // ── Divider ────────────────────────────────────────────────
                AuthOrDivider(textSecondary: textSecondary, borderColor: borderColor),
                const SizedBox(height: 20),

                // ── Email ──────────────────────────────────────────────────
                Text(
                  'Email address',
                  style: AppTypography.labelMedium.copyWith(color: textPrimary),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  enabled: !anyLoading,
                  onSubmitted: (_) => _handleLogin(),
                  decoration: _inputDecoration(
                    hint: 'you@school.edu',
                    prefix: Icons.mail_outline_rounded,
                    surfaceColor: surfaceColor,
                    borderColor: borderColor,
                    textSecondary: textSecondary,
                  ),
                ),
                const SizedBox(height: 16),

                // ── Password ───────────────────────────────────────────────
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Password',
                      style: AppTypography.labelMedium
                          .copyWith(color: textPrimary),
                    ),
                    GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const ForgotPasswordScreen()),
                        );
                      },
                      child: Text(
                        'Forgot password?',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.primaryGreen,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: _passwordController,
                  obscureText: !_passwordVisible,
                  enabled: !anyLoading,
                  onSubmitted: (_) => _handleLogin(),
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
                      onPressed: () =>
                          setState(() => _passwordVisible = !_passwordVisible),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // ── Sign In button ─────────────────────────────────────────
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: anyLoading ? null : _handleLogin,
                    child: _isEmailLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white),
                          )
                        : const Text('Sign In with Email'),
                  ),
                ),
                const SizedBox(height: 24),

                // ── Switch to Sign Up ──────────────────────────────────────
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Don't have an account? ",
                      style: AppTypography.bodySmall
                          .copyWith(color: textSecondary),
                    ),
                    GestureDetector(
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const SignupScreen()),
                      ),
                      child: Text(
                        'Sign up',
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


