import 'package:flutter_test/flutter_test.dart';
import 'package:organization_alert_app/models/alert.dart';
import 'package:organization_alert_app/models/alert_delivery.dart';
import 'package:organization_alert_app/models/group.dart';
import 'package:organization_alert_app/models/organization.dart';
import 'package:organization_alert_app/models/user.dart';

void main() {
  group('Data Models Unit Tests', () {
    test('Organization fromJson and toJson', () {
      final json = {
        '_id': 'org123',
        'name': 'Acme Corp',
        'description': 'Main Org',
        'isActive': true,
      };

      final org = Organization.fromJson(json);
      expect(org.id, 'org123');
      expect(org.name, 'Acme Corp');
      expect(org.isActive, true);

      final exported = org.toJson();
      expect(exported['name'], 'Acme Corp');
      expect(exported['id'], 'org123');
    });

    test('User fromJson handles populated and unpopulated organizationId', () {
      // Unpopulated
      final json1 = {
        '_id': 'u1',
        'name': 'Sarah Connor',
        'email': 'sarah@example.com',
        'role': 'ADMIN',
        'organizationId': 'org123',
        'isActive': true,
      };

      final user1 = User.fromJson(json1);
      expect(user1.id, 'u1');
      expect(user1.isAdmin, true);
      expect(user1.organizationId, 'org123');

      // Populated
      final json2 = {
        '_id': 'u2',
        'name': 'John Doe',
        'email': 'john@example.com',
        'role': 'MEMBER',
        'organizationId': {'_id': 'org123', 'name': 'Acme Corp'},
        'isActive': true,
      };

      final user2 = User.fromJson(json2);
      expect(user2.id, 'u2');
      expect(user2.isMember, true);
      expect(user2.organizationId, 'org123');
      expect(user2.organizationName, 'Acme Corp');
    });

    test('Group fromJson parses members and calculates count', () {
      final json = {
        '_id': 'g1',
        'name': 'Core Engineering',
        'description': 'Dev team',
        'organizationId': 'org123',
        'members': [
          {'_id': 'u1', 'name': 'Dev 1', 'email': 'd1@test.com', 'role': 'MEMBER'},
          {'_id': 'u2', 'name': 'Dev 2', 'email': 'd2@test.com', 'role': 'MEMBER'},
        ],
        'isActive': true,
      };

      final group = Group.fromJson(json);
      expect(group.id, 'g1');
      expect(group.name, 'Core Engineering');
      expect(group.members.length, 2);
      expect(group.memberCount, 2);
      expect(group.members[0].name, 'Dev 1');
    });

    test('Alert fromJson handles populated and raw group/creator fields', () {
      final json = {
        '_id': 'alt1',
        'title': 'Emergency Alert',
        'message': 'Please evacuate.',
        'organizationId': 'org123',
        'groupId': {'_id': 'g1', 'name': 'Floor 2'},
        'scheduledAt': '2026-08-31T10:00:00.000Z',
        'repeatType': 'DAILY',
        'priority': 'URGENT',
        'status': 'TRIGGERED',
        'isEnabled': true,
      };

      final alert = Alert.fromJson(json);
      expect(alert.id, 'alt1');
      expect(alert.title, 'Emergency Alert');
      expect(alert.groupId, 'g1');
      expect(alert.groupName, 'Floor 2');
      expect(alert.repeatType, 'DAILY');
      expect(alert.priority, 'URGENT');
      expect(alert.isUrgent, true);
      expect(alert.isTriggered, true);
    });

    test('AlertDelivery fromJson and isAcknowledged', () {
      final json = {
        '_id': 'del1',
        'alertId': 'alt1',
        'userId': {'_id': 'u1', 'name': 'Alice', 'email': 'alice@test.com'},
        'organizationId': 'org123',
        'deliveredAt': '2026-08-31T10:00:05.000Z',
        'acknowledgedAt': '2026-08-31T10:01:20.000Z',
        'status': 'ACKNOWLEDGED',
      };

      final delivery = AlertDelivery.fromJson(json);
      expect(delivery.id, 'del1');
      expect(delivery.isAcknowledged, true);
      expect(delivery.user?.name, 'Alice');
      expect(delivery.acknowledgedAt, isNotNull);
    });
  });
}
