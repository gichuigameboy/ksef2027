import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/learning_provider.dart';
import 'providers/diagnostic_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/onboarding/onboarding_screen.dart';
import 'screens/shell/responsive_shell.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const EduGuardApp());
}

class EduGuardApp extends StatefulWidget {
  const EduGuardApp({Key? key}) : super(key: key);

  @override
  State<EduGuardApp> createState() => _EduGuardAppState();
}

class _EduGuardAppState extends State<EduGuardApp> {
  ThemeMode _themeMode = ThemeMode.light;

  void toggleTheme() {
    setState(() {
      _themeMode = _themeMode == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => LearningProvider()),
        ChangeNotifierProvider(create: (_) => DiagnosticProvider()),
      ],
      child: MaterialApp(
        title: 'EduGuard — Educational Intelligence',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: _themeMode,
        home: const AuthGate(),
      ),
    );
  }
}

class AuthGate extends StatelessWidget {
  const AuthGate({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    if (auth.isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: Color(0xFF10A37F))),
      );
    }

    if (!auth.isAuthenticated) {
      return const LoginScreen();
    }

    if (!auth.onboardingComplete) {
      return const OnboardingScreen();
    }

    return const ResponsiveShell();
  }
}
