import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../models/group.dart';
import '../../../shared/empty_states/empty_state.dart';
import '../../../shared/loading/loading_view.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/confirmation_dialog.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/groups_provider.dart';
import 'create_group_dialog.dart';

class GroupsListScreen extends ConsumerStatefulWidget {
  const GroupsListScreen({super.key});

  @override
  ConsumerState<GroupsListScreen> createState() => _GroupsListScreenState();
}

class _GroupsListScreenState extends ConsumerState<GroupsListScreen> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearch(String val) {
    ref.read(groupsProvider.notifier).fetchGroups(searchQuery: val);
  }

  Future<void> _showCreateGroup() async {
    final created = await showDialog<bool>(
      context: context,
      builder: (ctx) => const CreateGroupDialog(),
    );
    if (created == true) {
      ref.read(groupsProvider.notifier).fetchGroups();
    }
  }

  Future<void> _handleDeleteGroup(Group group) async {
    final confirmed = await ConfirmationDialog.show(
      context,
      title: 'Delete Group?',
      message: 'Are you sure you want to delete "${group.name}"? Active alerts targeting this group will be affected.',
      confirmLabel: 'Delete',
      isDangerous: true,
    );

    if (confirmed == true) {
      await ref.read(groupsProvider.notifier).deleteGroup(group.id);
    }
  }

  @override
  Widget build(BuildContext context) {
    final groupsState = ref.watch(groupsProvider);
    final isAdmin = ref.watch(authProvider).isAdmin;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Groups'),
      ),
      floatingActionButton: isAdmin
          ? FloatingActionButton.extended(
              onPressed: _showCreateGroup,
              icon: const Icon(Icons.group_add_rounded),
              label: const Text('Create Group'),
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            )
          : null,
      body: Column(
        children: [
          // Search Header
          Container(
            color: AppColors.surface,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearch,
              decoration: InputDecoration(
                hintText: 'Search groups...',
                prefixIcon: const Icon(Icons.search_rounded),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded),
                        onPressed: () {
                          _searchController.clear();
                          _onSearch('');
                        },
                      )
                    : null,
              ),
            ),
          ),
          const Divider(height: 1),

          // Groups List
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => ref.read(groupsProvider.notifier).fetchGroups(
                    searchQuery: _searchController.text,
                  ),
              child: Builder(
                builder: (context) {
                  if (groupsState.isLoading && groupsState.groups.isEmpty) {
                    return const LoadingView(message: 'Loading groups...');
                  }

                  if (groupsState.groups.isEmpty) {
                    return const EmptyState(
                      title: 'No groups found',
                      subtitle: 'Create a group to organize organization participants.',
                      icon: Icons.groups_outlined,
                    );
                  }

                  return ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: groupsState.groups.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final group = groupsState.groups[index];

                      return AppCard(
                        onTap: () => context.push('/groups/details/${group.id}'),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.secondary.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.groups_rounded, color: AppColors.secondary, size: 24),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(group.name, style: AppTextStyles.headingSmall),
                                  if (group.description.isNotEmpty) ...[
                                    const SizedBox(height: 2),
                                    Text(
                                      group.description,
                                      style: AppTextStyles.bodySmall,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                  const SizedBox(height: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: AppColors.surfaceVariant,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      '${group.memberCount} members',
                                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (isAdmin)
                              IconButton(
                                icon: const Icon(Icons.delete_outline_rounded, color: AppColors.error, size: 20),
                                onPressed: () => _handleDeleteGroup(group),
                              )
                            else
                              const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                          ],
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
