import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/config/api_config.dart';
import '../../../models/group.dart';
import '../../../models/user.dart';
import '../../auth/providers/auth_provider.dart';

class GroupsState {
  final List<Group> groups;
  final bool isLoading;
  final String? error;

  const GroupsState({
    this.groups = const [],
    this.isLoading = false,
    this.error,
  });

  GroupsState copyWith({
    List<Group>? groups,
    bool? isLoading,
    String? error,
  }) {
    return GroupsState(
      groups: groups ?? this.groups,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class GroupsNotifier extends StateNotifier<GroupsState> {
  final Ref _ref;

  GroupsNotifier(this._ref) : super(const GroupsState()) {
    fetchGroups();
  }

  Future<void> fetchGroups({String? searchQuery}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final api = _ref.read(apiClientProvider);
      final currentUser = _ref.read(authProvider).user;

      final query = <String, dynamic>{};
      if (currentUser != null) {
        query['organizationId'] = currentUser.organizationId;
      }

      final res = await api.get(ApiConfig.groups, queryParameters: query);
      if (res is List) {
        List<Group> list = res.map((e) => Group.fromJson(e as Map<String, dynamic>)).toList();
        if (searchQuery != null && searchQuery.trim().isNotEmpty) {
          final q = searchQuery.trim().toLowerCase();
          list = list.where((g) => g.name.toLowerCase().contains(q)).toList();
        }
        state = state.copyWith(groups: list, isLoading: false);
      } else {
        state = state.copyWith(groups: [], isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<Group> createGroup(Map<String, dynamic> data) async {
    final api = _ref.read(apiClientProvider);
    final res = await api.post(ApiConfig.groups, data: data);
    final created = Group.fromJson(res as Map<String, dynamic>);
    state = state.copyWith(groups: [created, ...state.groups]);
    return created;
  }

  Future<Group> updateGroup(String id, Map<String, dynamic> data) async {
    final api = _ref.read(apiClientProvider);
    final res = await api.put('${ApiConfig.groups}/$id', data: data);
    final updated = Group.fromJson(res as Map<String, dynamic>);
    state = state.copyWith(
      groups: state.groups.map((g) => g.id == id ? updated : g).toList(),
    );
    return updated;
  }

  Future<void> deleteGroup(String id) async {
    final api = _ref.read(apiClientProvider);
    await api.delete('${ApiConfig.groups}/$id');
    state = state.copyWith(
      groups: state.groups.where((g) => g.id != id).toList(),
    );
  }

  Future<Group> addMember(String groupId, String userId) async {
    final api = _ref.read(apiClientProvider);
    final res = await api.post('${ApiConfig.groups}/$groupId/members/$userId');
    final updated = Group.fromJson(res as Map<String, dynamic>);
    state = state.copyWith(
      groups: state.groups.map((g) => g.id == groupId ? updated : g).toList(),
    );
    return updated;
  }

  Future<Group> removeMember(String groupId, String userId) async {
    final api = _ref.read(apiClientProvider);
    final res = await api.delete('${ApiConfig.groups}/$groupId/members/$userId');
    final updated = Group.fromJson(res as Map<String, dynamic>);
    state = state.copyWith(
      groups: state.groups.map((g) => g.id == groupId ? updated : g).toList(),
    );
    return updated;
  }

  Future<List<User>> fetchGroupMembers(String groupId) async {
    final api = _ref.read(apiClientProvider);
    final res = await api.get('${ApiConfig.groups}/$groupId/members');
    if (res is List) {
      return res.map((e) => User.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  }
}

final groupsProvider = StateNotifierProvider<GroupsNotifier, GroupsState>((ref) {
  return GroupsNotifier(ref);
});

final memberAssignedGroupsProvider = Provider<List<Group>>((ref) {
  final groups = ref.watch(groupsProvider).groups;
  final currentUser = ref.watch(authProvider).user;
  if (currentUser == null) return [];

  return groups.where((g) {
    return g.members.any((m) => m.id == currentUser.id) ||
        g.memberIds.contains(currentUser.id);
  }).toList();
});
