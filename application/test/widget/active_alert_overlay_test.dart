import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:organization_alert_app/models/alert.dart';
import 'package:organization_alert_app/shared/widgets/active_alert_overlay.dart';

void main() {
  testWidgets('ActiveAlertOverlay displays alert and triggers acknowledge callback', (tester) async {
    final alert = Alert(
      id: 'a1',
      title: 'FIRE EVACUATION',
      message: 'Please leave the building immediately.',
      organizationId: 'org1',
      groupId: 'g1',
      groupName: 'All Staff',
      scheduledAt: DateTime(2026, 8, 31, 11, 0),
      priority: 'URGENT',
      status: 'TRIGGERED',
    );

    bool acknowledged = false;
    bool dismissed = false;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ActiveAlertOverlay(
            alert: alert,
            onAcknowledge: () => acknowledged = true,
            onDismiss: () => dismissed = true,
          ),
        ),
      ),
    );

    expect(find.text('FIRE EVACUATION'), findsOneWidget);
    expect(find.text('Please leave the building immediately.'), findsOneWidget);
    expect(find.text('All Staff'), findsOneWidget);
    expect(find.text('URGENT'), findsOneWidget);
    expect(find.text('ACKNOWLEDGE'), findsOneWidget);

    await tester.tap(find.text('ACKNOWLEDGE'));
    await tester.pump();

    expect(acknowledged, true);
    expect(dismissed, false);
  });
}
