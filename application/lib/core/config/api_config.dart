import 'package:flutter/foundation.dart';

class ApiConfig {
  static const String defaultAndroidEmulatorBaseUrl = 'http://10.0.2.2:5000';
  static const String defaultLocalBaseUrl = 'http://localhost:5000';

  // Configurable dynamic base URL
  static String _customBaseUrl = '';

  static String get baseUrl {
    if (_customBaseUrl.isNotEmpty) {
      return _customBaseUrl;
    }
    // If running on Android emulator, use 10.0.2.2, else localhost
    if (defaultTargetPlatform == TargetPlatform.android) {
      return defaultAndroidEmulatorBaseUrl;
    }
    return defaultLocalBaseUrl;
  }

  static void setBaseUrl(String url) {
    _customBaseUrl = url.trim();
  }

  static String get apiBaseUrl => '$baseUrl/api';
  static String get socketUrl => baseUrl;

  // Endpoints
  static const String health = '/health';
  static const String organizations = '/organizations';
  static const String users = '/users';
  static const String groups = '/groups';
  static const String alerts = '/alerts';
  static const String alertBroadcast = '/alerts/broadcast';
  static const String alertHistory = '/alerts/history';
  static const String alertUpcoming = '/alerts/upcoming';
}
