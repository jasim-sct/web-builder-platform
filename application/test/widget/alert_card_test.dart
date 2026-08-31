import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:organization_alert_app/features/alerts/widgets/alert_card.dart';
import 'package:organization_alert_app/models/alert.dart';

void main() {
  testWidgets('AlertCard displays alert title, message, group name and priority', (tester) async {
    final alert = Alert(
      id: 'a1',
      title: 'Daily Meeting',
      message: 'Standup starts in 5 minutes.',
      organizationId: 'org1',
      groupId: 'g1',
      groupName: 'Dev Team',
      scheduledAt: DateTime(2026, 8, 31, 10, 0),
      priority: 'HIGH',
      status: 'SCHEDULED',
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: AlertCard(alert: alert),
        ),
      ),
    );

    expect(find.text('Daily Meeting'), findsOneWidget);
    expect(find.text('Standup starts in 5 minutes.'), findsOneWidget);
    expect(find.text('Dev Team'), findsOneWidget);
    expect(find.text('HIGH'), findsOneWidget);
    expect(find.text('SCHEDULED'), findsOneWidget);
  });
}
