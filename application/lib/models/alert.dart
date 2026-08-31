class Alert {
  final String id;
  final String title;
  final String message;
  final String organizationId;
  final String groupId;
  final String? groupName;
  final DateTime scheduledAt;
  final String repeatType; // 'ONCE', 'DAILY', 'WEEKLY'
  final String priority; // 'LOW', 'NORMAL', 'HIGH', 'URGENT'
  final String status; // 'SCHEDULED', 'TRIGGERED', 'DISABLED', 'CANCELLED', 'COMPLETED'
  final bool isEnabled;
  final String? createdBy;
  final String? creatorName;
  final DateTime? lastTriggeredAt;
  final DateTime? nextTriggerAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Alert({
    required this.id,
    required this.title,
    required this.message,
    required this.organizationId,
    required this.groupId,
    this.groupName,
    required this.scheduledAt,
    this.repeatType = 'ONCE',
    this.priority = 'NORMAL',
    this.status = 'SCHEDULED',
    this.isEnabled = true,
    this.createdBy,
    this.creatorName,
    this.lastTriggeredAt,
    this.nextTriggerAt,
    this.createdAt,
    this.updatedAt,
  });

  bool get isUrgent => priority.toUpperCase() == 'URGENT';
  bool get isHigh => priority.toUpperCase() == 'HIGH';
  bool get isCompleted => status.toUpperCase() == 'COMPLETED';
  bool get isTriggered => status.toUpperCase() == 'TRIGGERED';
  bool get isDisabled => !isEnabled || status.toUpperCase() == 'DISABLED';

  factory Alert.fromJson(Map<String, dynamic> json) {
    String orgId = '';
    final orgRaw = json['organizationId'];
    if (orgRaw is Map) {
      orgId = orgRaw['_id']?.toString() ?? orgRaw['id']?.toString() ?? '';
    } else if (orgRaw != null) {
      orgId = orgRaw.toString();
    }

    String grpId = '';
    String? grpName;
    final grpRaw = json['groupId'];
    if (grpRaw is Map) {
      grpId = grpRaw['_id']?.toString() ?? grpRaw['id']?.toString() ?? '';
      grpName = grpRaw['name']?.toString();
    } else if (grpRaw != null) {
      grpId = grpRaw.toString();
    }

    String? crtId;
    String? crtName;
    final crtRaw = json['createdBy'];
    if (crtRaw is Map) {
      crtId = crtRaw['_id']?.toString() ?? crtRaw['id']?.toString();
      crtName = crtRaw['name']?.toString();
    } else if (crtRaw != null) {
      crtId = crtRaw.toString();
    }

    final scheduled = json['scheduledAt'] != null
        ? DateTime.tryParse(json['scheduledAt'].toString()) ?? DateTime.now()
        : DateTime.now();

    return Alert(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? json['alertId']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      message: json['message']?.toString() ?? '',
      organizationId: orgId,
      groupId: grpId,
      groupName: grpName,
      scheduledAt: scheduled,
      repeatType: (json['repeatType']?.toString() ?? 'ONCE').toUpperCase(),
      priority: (json['priority']?.toString() ?? 'NORMAL').toUpperCase(),
      status: (json['status']?.toString() ?? 'SCHEDULED').toUpperCase(),
      isEnabled: json['isEnabled'] != false,
      createdBy: crtId,
      creatorName: crtName,
      lastTriggeredAt: json['lastTriggeredAt'] != null
          ? DateTime.tryParse(json['lastTriggeredAt'].toString())
          : null,
      nextTriggerAt: json['nextTriggerAt'] != null
          ? DateTime.tryParse(json['nextTriggerAt'].toString())
          : null,
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
      'title': title,
      'message': message,
      'organizationId': organizationId,
      'groupId': groupId,
      if (groupName != null) 'groupName': groupName,
      'scheduledAt': scheduledAt.toIso8601String(),
      'repeatType': repeatType,
      'priority': priority,
      'status': status,
      'isEnabled': isEnabled,
      'createdBy': createdBy,
      if (creatorName != null) 'creatorName': creatorName,
      'lastTriggeredAt': lastTriggeredAt?.toIso8601String(),
      'nextTriggerAt': nextTriggerAt?.toIso8601String(),
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  Alert copyWith({
    String? id,
    String? title,
    String? message,
    String? organizationId,
    String? groupId,
    String? groupName,
    DateTime? scheduledAt,
    String? repeatType,
    String? priority,
    String? status,
    bool? isEnabled,
    String? createdBy,
    String? creatorName,
    DateTime? lastTriggeredAt,
    DateTime? nextTriggerAt,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Alert(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      organizationId: organizationId ?? this.organizationId,
      groupId: groupId ?? this.groupId,
      groupName: groupName ?? this.groupName,
      scheduledAt: scheduledAt ?? this.scheduledAt,
      repeatType: repeatType ?? this.repeatType,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      isEnabled: isEnabled ?? this.isEnabled,
      createdBy: createdBy ?? this.createdBy,
      creatorName: creatorName ?? this.creatorName,
      lastTriggeredAt: lastTriggeredAt ?? this.lastTriggeredAt,
      nextTriggerAt: nextTriggerAt ?? this.nextTriggerAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
