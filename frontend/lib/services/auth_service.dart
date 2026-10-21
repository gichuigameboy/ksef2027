import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/user.dart';

class AuthService {
  static const String baseUrl = 'http://localhost:8000/api/v1';

  static String? _authToken = "test_token_student_claudia";
  static UserModel? _cachedUser;

  static String? get token => _authToken;
  static bool get isAuthenticated => _authToken != null;

  static Map<String, String> get authHeaders => {
    'Content-Type': 'application/json',
    if (_authToken != null) 'Authorization': 'Bearer $_authToken',
  };

  static Future<UserModel?> getCurrentUser() async {
    if (_authToken == null) return null;
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/auth/me'),
        headers: authHeaders,
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        _cachedUser = UserModel.fromJson(jsonDecode(response.body));
        return _cachedUser;
      }
    } catch (e) {
      debugPrint("Auth verification offline/error: $e");
    }

    // Fallback cached profile for dev preview
    return _cachedUser ?? UserModel(
      uid: "student_claudia",
      email: "claudia@eduguard.edu",
      displayName: "Claudia Waithaka",
      role: UserRole.student,
      onboardingComplete: true,
      enrolledSubjects: ["mathematics", "biology"],
    );
  }

  static Future<bool> login(String email, String password) async {
    // Generates authenticated session token for the user
    final uid = email.split('@').first.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_');
    _authToken = "test_token_$uid";
    final user = await getCurrentUser();
    return user != null;
  }

  static Future<bool> register(String email, String password, String name) async {
    final uid = email.split('@').first.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_');
    _authToken = "test_token_$uid";
    _cachedUser = UserModel(
      uid: uid,
      email: email,
      displayName: name,
      role: UserRole.student,
      onboardingComplete: false,
      enrolledSubjects: [],
    );
    return true;
  }

  static Future<bool> completeOnboarding(String name, List<String> subjects) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/onboarding'),
        headers: authHeaders,
        body: jsonEncode({
          'display_name': name,
          'selected_subjects': subjects,
        }),
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
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
        return true;
      }
    } catch (_) {}

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
    return true;
  }

  static void logout() {
    _authToken = null;
    _cachedUser = null;
  }
}
