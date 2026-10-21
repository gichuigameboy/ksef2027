enum UserRole {
  student,
  teacher,
  admin,
}

class UserModel {
  final String uid;
  final String email;
  final String displayName;
  final UserRole role;
  final bool onboardingComplete;
  final List<String> enrolledSubjects;

  UserModel({
    required this.uid,
    required this.email,
    required this.displayName,
    required this.role,
    required this.onboardingComplete,
    required this.enrolledSubjects,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final roleStr = json['role'] as String? ?? 'student';
    UserRole r = UserRole.student;
    if (roleStr == 'teacher') r = UserRole.teacher;
    if (roleStr == 'admin') r = UserRole.admin;

    var subs = json['enrolled_subjects'] as List? ?? [];

    return UserModel(
      uid: json['uid'] ?? '',
      email: json['email'] ?? '',
      displayName: json['display_name'] ?? 'Student',
      role: r,
      onboardingComplete: json['onboarding_complete'] ?? false,
      enrolledSubjects: subs.map((e) => e.toString()).toList(),
    );
  }
}
