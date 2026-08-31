class AppConfig {
  static const String appName = 'Org Alert & Reminder';
  static const String appVersion = '1.0.0';

  static const Duration connectTimeout = Duration(seconds: 10);
  static const Duration receiveTimeout = Duration(seconds: 10);

  // Storage Keys
  static const String keyUserId = 'saved_user_id';
  static const String keyUserRole = 'saved_user_role';
  static const String keyOrgId = 'saved_org_id';
  static const String keyUserData = 'saved_user_data';
  static const String keyCustomBaseUrl = 'saved_custom_base_url';
}
