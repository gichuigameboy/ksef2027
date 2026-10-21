import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  UserModel? _user;
  bool _isLoading = true;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;
  bool get onboardingComplete => _user?.onboardingComplete ?? false;

  AuthProvider() {
    loadCurrentUser();
  }

  Future<void> loadCurrentUser() async {
    _isLoading = true;
    notifyListeners();

    try {
      _user = await AuthService.getCurrentUser();
    } catch (e) {
      debugPrint("Error loading current user: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    final success = await AuthService.login(email, password);
    if (success) {
      _user = await AuthService.getCurrentUser();
    }
    _isLoading = false;
    notifyListeners();
    return success;
  }

  Future<bool> register(String email, String password, String name) async {
    _isLoading = true;
    notifyListeners();

    final success = await AuthService.register(email, password, name);
    if (success) {
      _user = await AuthService.getCurrentUser();
    }
    _isLoading = false;
    notifyListeners();
    return success;
  }

  Future<bool> completeOnboarding(String name, List<String> subjects) async {
    _isLoading = true;
    notifyListeners();

    final success = await AuthService.completeOnboarding(name, subjects);
    if (success) {
      _user = await AuthService.getCurrentUser();
    }
    _isLoading = false;
    notifyListeners();
    return success;
  }

  void logout() {
    AuthService.logout();
    _user = null;
    notifyListeners();
  }
}
