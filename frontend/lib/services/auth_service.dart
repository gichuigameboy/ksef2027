import 'dart:async';
import 'dart:convert';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import '../models/user.dart';

/// Central Firebase Auth service.
///
/// [authHeaders] stays synchronous so every existing [ApiService] call
/// continues to work unchanged. The cached token is refreshed automatically
/// whenever Firebase fires an [idTokenChanges] event (including the automatic
/// 1-hour refresh) and explicitly after every sign-in call.
class AuthService {
  static const String _baseUrl = 'http://localhost:8000/api/v1';
  static final FirebaseAuth _auth = FirebaseAuth.instance;

  // ── Cached token (updated on every idTokenChanges event) ─────────────────
  static String? _cachedToken;
  static UserModel? _cachedUser;
  static StreamSubscription<User?>? _tokenSub;

  /// Call once from [main()] after [Firebase.initializeApp()].
  static void initialize() {
    _tokenSub?.cancel();
    _tokenSub = _auth.idTokenChanges().listen((user) async {
      if (user != null) {
        try {
          _cachedToken = await user.getIdToken();
        } catch (_) {
          _cachedToken = null;
        }
      } else {
        _cachedToken = null;
        _cachedUser = null;
      }
    });
  }

  // ── Public surface ────────────────────────────────────────────────────────

  static bool get isAuthenticated => _auth.currentUser != null;

  /// Synchronous headers used by ApiService throughout the codebase.
  static Map<String, String> get authHeaders => {
        'Content-Type': 'application/json',
        if (_cachedToken != null) 'Authorization': 'Bearer $_cachedToken',
      };

  // ── Auth state stream (used by AuthProvider) ──────────────────────────────

  static Stream<User?> get authStateChanges => _auth.authStateChanges();

  // ── User profile ──────────────────────────────────────────────────────────

  static Future<UserModel?> getCurrentUser() async {
    final firebaseUser = _auth.currentUser;
    if (firebaseUser == null) return null;

    // Ensure the cached token is fresh before hitting the backend.
    await _refreshToken();

    try {
      final response = await http
          .get(
            Uri.parse('$_baseUrl/auth/me'),
            headers: authHeaders,
          )
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        _cachedUser = UserModel.fromJson(jsonDecode(response.body));
        return _cachedUser;
      }
    } catch (e) {
      debugPrint('Auth /me offline or error: $e');
    }

    // Fallback: build a minimal profile from Firebase user data.
    return _cachedUser ??
        UserModel(
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? 'Student',
          role: UserRole.student,
          onboardingComplete: false,
          enrolledSubjects: [],
        );
  }

  // ── Sign in / Sign up ─────────────────────────────────────────────────────

  /// Email + password sign-in.
  /// Returns [null] on success, a human-readable error string on failure.
  static Future<String?> login(String email, String password) async {
    try {
      await _auth.signInWithEmailAndPassword(email: email, password: password);
      await _refreshToken();
      return null; // success
    } on FirebaseAuthException catch (e) {
      return _friendlyError(e);
    } catch (e) {
      return 'Sign-in failed. Please try again.';
    }
  }

  /// Email + password registration.
  /// Returns [null] on success, a human-readable error string on failure.
  static Future<String?> register(
      String email, String password, String name) async {
    try {
      final cred = await _auth.createUserWithEmailAndPassword(
          email: email, password: password);
      await cred.user?.updateDisplayName(name);
      await _refreshToken();
      return null; // success
    } on FirebaseAuthException catch (e) {
      return _friendlyError(e);
    } catch (e) {
      return 'Registration failed. Please try again.';
    }
  }

  /// Google Sign-In via popup (web).
  /// Returns [null] on success, a human-readable error string on failure.
  static Future<String?> signInWithGoogle() async {
    try {
      final provider = GoogleAuthProvider()
        ..addScope('email')
        ..addScope('profile');
      await _auth.signInWithPopup(provider);
      await _refreshToken();
      return null; // success
    } on FirebaseAuthException catch (e) {
      if (e.code == 'popup-closed-by-user' ||
          e.code == 'cancelled-popup-request') {
        return null; // user dismissed — not an error
      }
      return _friendlyError(e);
    } catch (e) {
      return 'Google sign-in failed. Please try again.';
    }
  }

  /// Sends a password-reset email.
  /// Returns [null] on success, a human-readable error string on failure.
  static Future<String?> sendPasswordResetEmail(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email.trim());
      return null; // success
    } on FirebaseAuthException catch (e) {
      return _friendlyError(e);
    } catch (e) {
      return 'Could not send reset email. Please try again.';
    }
  }

  // ── Onboarding ────────────────────────────────────────────────────────────

  static Future<bool> completeOnboarding(
      String name, List<String> subjects) async {
    await _refreshToken();
    try {
      final response = await http
          .post(
            Uri.parse('$_baseUrl/auth/onboarding'),
            headers: authHeaders,
            body: jsonEncode({
              'display_name': name,
              'selected_subjects': subjects,
            }),
          )
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        _patchCachedUser(name, subjects);
        return true;
      }
    } catch (_) {}

    // Offline fallback — update the local model anyway.
    _patchCachedUser(name, subjects);
    return true;
  }

  // ── Sign out ──────────────────────────────────────────────────────────────

  static Future<void> logout() async {
    _cachedUser = null;
    _cachedToken = null;
    await _auth.signOut();
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  static Future<void> _refreshToken() async {
    final user = _auth.currentUser;
    if (user != null) {
      try {
        _cachedToken = await user.getIdToken(true);
      } catch (_) {}
    }
  }

  static void _patchCachedUser(String name, List<String> subjects) {
    if (_cachedUser != null) {
      _cachedUser = UserModel(
        uid: _cachedUser!.uid,
        email: _cachedUser!.email,
        displayName: name,
        role: _cachedUser!.role,
        onboardingComplete: true,
        enrolledSubjects: subjects,
      );
    }
  }

  static String _friendlyError(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return 'No account found with that email address.';
      case 'wrong-password':
        return 'Incorrect password. Please try again.';
      case 'email-already-in-use':
        return 'An account with this email already exists.';
      case 'invalid-email':
        return 'Please enter a valid email address.';
      case 'weak-password':
        return 'Password must be at least 6 characters.';
      case 'user-disabled':
        return 'This account has been disabled. Contact support.';
      case 'too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';
      case 'network-request-failed':
        return 'Network error. Check your connection and try again.';
      case 'account-exists-with-different-credential':
        return 'An account already exists with a different sign-in method.';
      case 'invalid-credential':
        return 'Invalid credentials. Please check your email and password.';
      default:
        return e.message ?? 'Authentication failed. Please try again.';
    }
  }
}
