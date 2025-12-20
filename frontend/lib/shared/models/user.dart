class User {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String? avatarUrl;
  final DateTime? dateOfBirth;
  final bool emailVerified;

  User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    this.avatarUrl,
    this.dateOfBirth,
    this.emailVerified = false,
  });

  String get fullName => '$firstName $lastName';

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      firstName: json['first_name'] as String,
      lastName: json['last_name'] as String,
      avatarUrl: json['avatar_url'] as String?,
      dateOfBirth: json['date_of_birth'] != null
          ? DateTime.parse(json['date_of_birth'] as String)
          : null,
      emailVerified: json['email_verified'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'first_name': firstName,
      'last_name': lastName,
      'avatar_url': avatarUrl,
      'date_of_birth': dateOfBirth?.toIso8601String(),
      'email_verified': emailVerified,
    };
  }
}
