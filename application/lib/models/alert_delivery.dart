import 'user.dart';

class AlertDelivery {
  final String id;
  final String alertId;
  final String userId;
  final User? user;
  final String organizationId;
  final DateTime deliveredAt;
  final DateTime? acknowledgedAt;
  final String status; // 'DELIVERED' or 'ACKNOWLEDGED'
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const AlertDelivery({
    required this.id,
    required this.alertId,
    required this.userId,
    this.user,
    required this.organizationId,
    required this.deliveredAt,
    this.acknowledgedAt,
    this.status = 'DELIVERED',
    this.createdAt,
    this.updatedAt,
  });

  bool get isAcknowledged => status.toUpperCase() == 'ACKNOWLEDGED';

  factory AlertDelivery.fromJson(Map<String, dynamic> json) {
    String uId = '';
    User? parsedUser;
    final userRaw = json['userId'];
    if (userRaw is Map<String, dynamic>) {
      uId = userRaw['_id']?.toString() ?? userRaw['id']?.toString() ?? '';
      parsedUser = User.fromJson(userRaw);
    } else if (userRaw != null) {
      uId = userRaw.toString();
    }

    String aId = '';
    final alertRaw = json['alertId'];
    if (alertRaw is Map) {
      aId = alertRaw['_id']?.toString() ?? alertRaw['id']?.toString() ?? '';
    } else if (alertRaw != null) {
      aId = alertRaw.toString();
    }

    String orgId = '';
    final orgRaw = json['organizationId'];
    if (orgRaw is Map) {
      orgId = orgRaw['_id']?.toString() ?? orgRaw['id']?.toString() ?? '';
    } else if (orgRaw != null) {
      orgId = orgRaw.toString();
    }

    return AlertDelivery(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      alertId: aId,
      userId: uId,
      user: parsedUser,
      organizationId: orgId,
      deliveredAt: json['deliveredAt'] != null
          ? DateTime.tryParse(json['deliveredAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      acknowledgedAt: json['acknowledgedAt'] != null
          ? DateTime.tryParse(json['acknowledgedAt'].toString())
          : null,
      status: (json['status']?.toString() ?? 'DELIVERED').toUpperCase(),
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
      'alertId': alertId,
      'userId': user != null ? user!.toJson() : userId,
      'organizationId': organizationId,
      'deliveredAt': deliveredAt.toIso8601String(),
      'acknowledgedAt': acknowledgedAt?.toIso8601String(),
      'status': status,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }
}
