import 'user.dart';

class Group {
  final String id;
  final String name;
  final String description;
  final String organizationId;
  final List<User> members;
  final List<String> memberIds;
  final bool isActive;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Group({
    required this.id,
    required this.name,
    this.description = '',
    required this.organizationId,
    this.members = const [],
    this.memberIds = const [],
    this.isActive = true,
    this.createdAt,
    this.updatedAt,
  });

  int get memberCount => members.isNotEmpty ? members.length : memberIds.length;

  factory Group.fromJson(Map<String, dynamic> json) {
    String orgId = '';
    final orgRaw = json['organizationId'];
    if (orgRaw is Map) {
      orgId = orgRaw['_id']?.toString() ?? orgRaw['id']?.toString() ?? '';
    } else if (orgRaw != null) {
      orgId = orgRaw.toString();
    }

    final List<User> parsedMembers = [];
    final List<String> parsedMemberIds = [];

    if (json['members'] is List) {
      for (final m in json['members']) {
        if (m is Map<String, dynamic>) {
          parsedMembers.add(User.fromJson(m));
          parsedMemberIds.add(m['_id']?.toString() ?? m['id']?.toString() ?? '');
        } else if (m != null) {
          parsedMemberIds.add(m.toString());
        }
      }
    }

    return Group(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      organizationId: orgId,
      members: parsedMembers,
      memberIds: parsedMemberIds,
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
      'description': description,
      'organizationId': organizationId,
      'members': members.isNotEmpty
          ? members.map((m) => m.toJson()).toList()
          : memberIds,
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  Group copyWith({
    String? id,
    String? name,
    String? description,
    String? organizationId,
    List<User>? members,
    List<String>? memberIds,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Group(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      organizationId: organizationId ?? this.organizationId,
      members: members ?? this.members,
      memberIds: memberIds ?? this.memberIds,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
