import 'package:flutter_test/flutter_test.dart';
import 'package:organization_alert_app/core/utils/date_formatter.dart';

void main() {
  group('DateFormatter Unit Tests', () {
    test('formats null as Not scheduled', () {
      expect(DateFormatter.formatAlertDateTime(null), 'Not scheduled');
    });

    test('formats today timestamps with Today prefix', () {
      final now = DateTime.now();
      final formatted = DateFormatter.formatAlertDateTime(now);
      expect(formatted.startsWith('Today ·'), true);
    });

    test('formats tomorrow timestamps with Tomorrow prefix', () {
      final tomorrow = DateTime.now().add(const Duration(days: 1));
      final formatted = DateFormatter.formatAlertDateTime(tomorrow);
      expect(formatted.startsWith('Tomorrow ·'), true);
    });

    test('formats dates and times consistently', () {
      final date = DateTime(2026, 8, 31, 14, 30);
      expect(DateFormatter.formatDate(date), contains('2026'));
      expect(DateFormatter.formatTime(date), contains('2:30 PM'));
    });
  });
}
