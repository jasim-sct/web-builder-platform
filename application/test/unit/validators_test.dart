import 'package:flutter_test/flutter_test.dart';
import 'package:organization_alert_app/core/utils/validators.dart';

void main() {
  group('Validators Unit Tests', () {
    test('requiredField returns error on null or empty', () {
      expect(Validators.requiredField(null, 'Title'), 'Title is required');
      expect(Validators.requiredField('   ', 'Name'), 'Name is required');
      expect(Validators.requiredField('Valid Text', 'Name'), isNull);
    });

    test('email validator verifies email pattern', () {
      expect(Validators.email(''), 'Email is required');
      expect(Validators.email('not-an-email'), 'Enter a valid email address');
      expect(Validators.email('user@test'), 'Enter a valid email address');
      expect(Validators.email('user@test.com'), isNull);
    });
  });
}
