import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/config/api_config.dart';
import '../../../models/user.dart';
import '../../auth/providers/auth_provider.dart';

class UsersState {
  final List<User> users;
  final bool isLoading;
  final String? error;

  const UsersState({
    this.users = const [],
    this.isLoading = false,
    this.error,
  });

  UsersState copyWith({
    List<User>? users,
    bool? isLoading,
    String? error,
  }) {
    return UsersState(
      users: users ?? this.users,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class UsersNotifier extends StateNotifier<UsersState> {
  final Ref _ref;

  UsersNotifier(this._ref) : super(const UsersState()) {
    fetchUsers();
  }

  Future<void> fetchUsers({String? role, bool? isActive, String? searchQuery}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final api = _ref.read(apiClientProvider);
      final currentUser = _ref.read(authProvider).user;

      final query = <String, dynamic>{};
      if (currentUser != null) {
        query['organizationId'] = currentUser.organizationId;
      }
      if (role != null && role.isNotEmpty) query['role'] = role;
      if (isActive != null) query['isActive'] = isActive.toString();

      final res = await api.get(ApiConfig.users, queryParameters: query);
      if (res is List) {
        List<User> list = res.map((e) => User.fromJson(e as Map<String, dynamic>)).toList();
        if (searchQuery != null && searchQuery.trim().isNotEmpty) {
          final q = searchQuery.trim().toLowerCase();
          list = list.where((u) => u.name.toLowerCase().contains(q) || u.email.toLowerCase().contains(q)).toList();
        }
        state = state.copyWith(users: list, isLoading: false);
      } else {
        state = state.copyWith(users: [], isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<User> createUser(Map<String, dynamic> data) async {
    final api = _ref.read(apiClientProvider);
    final res = await api.post(ApiConfig.users, data: data);
    final user = User.fromJson(res as Map<String, dynamic>);
    state = state.copyWith(users: [user, ...state.users]);
    return user;
  }

  Future<User> updateUser(String id, Map<String, dynamic> data) async {
    final api = _ref.read(apiClientProvider);
    final res = await api.put('${ApiConfig.users}/$id', data: data);
    final updated = User.fromJson(res as Map<String, dynamic>);
    state = state.copyWith(
      users: state.users.map((u) => u.id == id ? updated : u).toList(),
    );
    return updated;
  }

  Future<void> deleteUser(String id) async {
    final api = _ref.read(apiClientProvider);
    await api.delete('${ApiConfig.users}/$id');
    state = state.copyWith(
      users: state.users.where((u) => u.id != id).toList(),
    );
  }
}

final usersProvider = StateNotifierProvider<UsersNotifier, UsersState>((ref) {
  return UsersNotifier(ref);
});

final singleUserProvider = FutureProvider.family.autoDispose<User?, String>((ref, userId) async {
  final usersState = ref.watch(usersProvider);
  final existing = usersState.users.where((u) => u.id == userId).firstOrNull;
  if (existing != null) return existing;

  final api = ref.watch(apiClientProvider);
  try {
    final res = await api.get('${ApiConfig.users}/$userId');
    if (res is Map<String, dynamic>) {
      return User.fromJson(res);
    }
  } catch (_) {
    // If not found or error, return null
  }
  return null;
});
