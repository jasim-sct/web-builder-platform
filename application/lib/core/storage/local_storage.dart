import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/user.dart';
import '../config/app_config.dart';

class LocalStorage {
  final SharedPreferences _prefs;

  LocalStorage(this._prefs);

  static Future<LocalStorage> init() async {
    final prefs = await SharedPreferences.getInstance();
    return LocalStorage(prefs);
  }

  Future<void> saveUser(User user) async {
    await _prefs.setString(AppConfig.keyUserId, user.id);
    await _prefs.setString(AppConfig.keyUserRole, user.role);
    await _prefs.setString(AppConfig.keyOrgId, user.organizationId);
    await _prefs.setString(AppConfig.keyUserData, jsonEncode(user.toJson()));
  }

  User? getUser() {
    final rawJson = _prefs.getString(AppConfig.keyUserData);
    if (rawJson == null) return null;
    try {
      final map = jsonDecode(rawJson) as Map<String, dynamic>;
      return User.fromJson(map);
    } catch (_) {
      return null;
    }
  }

  String? getUserId() => _prefs.getString(AppConfig.keyUserId);
  String? getUserRole() => _prefs.getString(AppConfig.keyUserRole);
  String? getOrganizationId() => _prefs.getString(AppConfig.keyOrgId);

  Future<void> clearSession() async {
    await _prefs.remove(AppConfig.keyUserId);
    await _prefs.remove(AppConfig.keyUserRole);
    await _prefs.remove(AppConfig.keyOrgId);
    await _prefs.remove(AppConfig.keyUserData);
  }

  Future<void> saveCustomBaseUrl(String url) async {
    await _prefs.setString(AppConfig.keyCustomBaseUrl, url);
  }

  String? getCustomBaseUrl() => _prefs.getString(AppConfig.keyCustomBaseUrl);
}
