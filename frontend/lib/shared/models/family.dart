class Family {
  final String id;
  final String familyName;
  final String? description;
  final String emoji;
  final String inviteCode;
  final String subscriptionType;
  final List<FamilyMember>? members;

  Family({
    required this.id,
    required this.familyName,
    this.description,
    this.emoji = '👨‍👩‍👧‍👦',
    required this.inviteCode,
    this.subscriptionType = 'free',
    this.members,
  });

  factory Family.fromJson(Map<String, dynamic> json) {
    return Family(
      id: json['id'] as String,
      familyName: json['family_name'] as String,
      description: json['description'] as String?,
      emoji: json['emoji'] as String? ?? '👨‍👩‍👧‍👦',
      inviteCode: json['invite_code'] as String,
      subscriptionType: json['subscription_type'] as String? ?? 'free',
      members: json['members'] != null
          ? (json['members'] as List)
              .map((m) => FamilyMember.fromJson(m as Map<String, dynamic>))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'family_name': familyName,
      'description': description,
      'emoji': emoji,
      'invite_code': inviteCode,
      'subscription_type': subscriptionType,
      if (members != null) 'members': members!.map((m) => m.toJson()).toList(),
    };
  }
}

class FamilyMember {
  final String id;
  final String userId;
  final String role;
  final DateTime joinedAt;

  FamilyMember({
    required this.id,
    required this.userId,
    required this.role,
    required this.joinedAt,
  });

  factory FamilyMember.fromJson(Map<String, dynamic> json) {
    return FamilyMember(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      role: json['role'] as String,
      joinedAt: DateTime.parse(json['joined_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'role': role,
      'joined_at': joinedAt.toIso8601String(),
    };
  }
}
