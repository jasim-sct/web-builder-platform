class User {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String role; // 'ADMIN' or 'MEMBER'
  final String organizationId;
  final String? organizationName;
  final bool isActive;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const User({
    required this.id,
    required this.name,
    required this.email,
    this.phone = '',
    this.role = 'MEMBER',
    required this.organizationId,
    this.organizationName,
    this.isActive = true,
    this.createdAt,
    this.updatedAt,
  });

  bool get isAdmin => role.toUpperCase() == 'ADMIN';
  bool get isMember => role.toUpperCase() == 'MEMBER';

  factory User.fromJson(Map<String, dynamic> json) {
    String orgId = '';
    String? orgName;

    final orgRaw = json['organizationId'];
    if (orgRaw is Map) {
      orgId = orgRaw['_id']?.toString() ?? orgRaw['id']?.toString() ?? '';
      orgName = orgRaw['name']?.toString();
    } else if (orgRaw != null) {
      orgId = orgRaw.toString();
    }

    return User(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      role: (json['role']?.toString() ?? 'MEMBER').toUpperCase(),
      organizationId: orgId,
      organizationName: orgName,
      isActive: json['isActive'] == true,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      '_id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'role': role,
      'organizationId': organizationId,
      if (organizationName != null) 'organizationName': organizationName,
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  User copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? role,
    String? organizationId,
    String? organizationName,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      organizationId: organizationId ?? this.organizationId,
      organizationName: organizationName ?? this.organizationName,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
