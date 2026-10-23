import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  UserModel? _user;
  bool _isLoading = true;
  String? _error;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;
  bool get onboardingComplete => _user?.onboardingComplete ?? false;
  String? get error => _error;

  AuthProvider() {
    // React to Firebase auth state changes (login, logout, token refresh).
    AuthService.authStateChanges.listen(_onAuthStateChanged);
  }

  Future<void> _onAuthStateChanged(User? firebaseUser) async {
    if (firebaseUser == null) {
      _user = null;
      _isLoading = false;
      notifyListeners();
      return;
    }

    _isLoading = true;
    notifyListeners();

    _user = await AuthService.getCurrentUser();
    _isLoading = false;
    notifyListeners();
  }

  // ── Email/Password ────────────────────────────────────────────────────────

  /// Returns [true] on success. On failure [error] is populated.
  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _error = null;

    final err = await AuthService.login(email, password);
    _isLoading = false;
    if (err != null) {
      _error = err;
      notifyListeners();
      return false;
    }
    // _onAuthStateChanged will update _user and call notifyListeners.
    return true;
  }

  /// Returns [true] on success. On failure [error] is populated.
  Future<bool> register(String email, String password, String name) async {
    _setLoading(true);
    _error = null;

    final err = await AuthService.register(email, password, name);
    _isLoading = false;
    if (err != null) {
      _error = err;
      notifyListeners();
      return false;
    }
    return true;
  }

  // ── Google Sign-In ────────────────────────────────────────────────────────

  /// Returns [true] on success. On failure [error] is populated.
  Future<bool> signInWithGoogle() async {
    _setLoading(true);
    _error = null;

    final err = await AuthService.signInWithGoogle();
    _isLoading = false;
    if (err != null) {
      _error = err;
      notifyListeners();
      return false;
    }
    return true;
  }

  // ── Password Reset ────────────────────────────────────────────────────────

  /// Sends a password-reset email.
  /// Returns [null] on success, an error message string on failure.
  Future<String?> sendPasswordResetEmail(String email) async {
    return AuthService.sendPasswordResetEmail(email);
  }

  // ── Onboarding ────────────────────────────────────────────────────────────

  Future<bool> completeOnboarding(String name, List<String> subjects) async {
    _setLoading(true);

    final success = await AuthService.completeOnboarding(name, subjects);
    if (success) {
      _user = await AuthService.getCurrentUser();
    }
    _isLoading = false;
    notifyListeners();
    return success;
  }

  // ── Sign out ──────────────────────────────────────────────────────────────

  void logout() {
    AuthService.logout(); // async fire-and-forget; authStateChanges handles UI.
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
