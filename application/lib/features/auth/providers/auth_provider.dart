import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/config/api_config.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/socket_client.dart';
import '../../../core/storage/local_storage.dart';
import '../../../models/organization.dart';
import '../../../models/user.dart';

final localStorageProvider = Provider<LocalStorage>((ref) {
  throw UnimplementedError('localStorageProvider must be initialized in main');
});

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});

final socketClientProvider = Provider<SocketClient>((ref) {
  return SocketClient();
});

class AuthState {
  final User? user;
  final Organization? organization;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.user,
    this.organization,
    this.isLoading = false,
    this.error,
  });

  bool get isAuthenticated => user != null;
  bool get isAdmin => user?.isAdmin ?? false;

  AuthState copyWith({
    User? user,
    Organization? organization,
    bool? isLoading,
    String? error,
    bool clearUser = false,
  }) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      organization: clearUser ? null : (organization ?? this.organization),
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final LocalStorage _localStorage;
  final ApiClient _apiClient;
  final SocketClient _socketClient;

  AuthNotifier(this._localStorage, this._apiClient, this._socketClient)
      : super(const AuthState(isLoading: true)) {
    _initSession();
  }

  void _initSession() {
    final customUrl = _localStorage.getCustomBaseUrl();
    if (customUrl != null && customUrl.isNotEmpty) {
      ApiConfig.setBaseUrl(customUrl);
    }

    final savedUser = _localStorage.getUser();
    if (savedUser != null) {
      state = AuthState(user: savedUser);
      _socketClient.initAndConnect(userId: savedUser.id);
      _loadOrganizationDetails(savedUser.organizationId);
    } else {
      state = const AuthState(isLoading: false);
    }
  }

  Future<void> _loadOrganizationDetails(String orgId) async {
    try {
      final res = await _apiClient.get('${ApiConfig.organizations}/$orgId');
      if (res is Map<String, dynamic>) {
        final org = Organization.fromJson(res);
        state = state.copyWith(organization: org);
      }
    } catch (_) {
      // Non-blocking
    }
  }

  Future<List<User>> fetchAllUsersFromBackend() async {
    try {
      final res = await _apiClient.get(ApiConfig.users);
      if (res is List) {
        return res.map((item) => User.fromJson(item as Map<String, dynamic>)).toList();
      }
      return [];
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<void> loginWithUser(User user) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _localStorage.saveUser(user);
      state = AuthState(user: user, isLoading: false);

      // Connect socket and join rooms
      _socketClient.initAndConnect(userId: user.id);
      _loadOrganizationDetails(user.organizationId);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> loginWithEmail(String email) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final users = await fetchAllUsersFromBackend();
      final target = users.firstWhere(
        (u) => u.email.trim().toLowerCase() == email.trim().toLowerCase(),
        orElse: () => throw Exception('No user found with email "$email"'),
      );
      await loginWithUser(target);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> logout() async {
    _socketClient.disconnect();
    await _localStorage.clearSession();
    state = const AuthState(user: null, organization: null, isLoading: false);
  }

  Future<void> updateCustomBaseUrl(String newUrl) async {
    ApiConfig.setBaseUrl(newUrl);
    await _localStorage.saveCustomBaseUrl(newUrl);
    if (state.user != null) {
      _socketClient.initAndConnect(userId: state.user!.id);
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final storage = ref.watch(localStorageProvider);
  final api = ref.watch(apiClientProvider);
  final socket = ref.watch(socketClientProvider);
  return AuthNotifier(storage, api, socket);
});
