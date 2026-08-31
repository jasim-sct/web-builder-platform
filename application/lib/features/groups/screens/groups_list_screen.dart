import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/layout/responsive_layout.dart';
import '../../../core/theme/app_colors.dart';
import '../../../models/group.dart';
import '../../../shared/empty_states/empty_state.dart';
import '../../../shared/loading/loading_view.dart';
import '../../../shared/widgets/app_button.dart';
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
      title: 'Delete Channel?',
      message: 'Are you sure you want to delete "${group.name}"? Active scheduled alerts targeting this channel will be affected.',
      confirmLabel: 'Delete Channel',
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isDesktop = ResponsiveLayout.isDesktop(context);

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      floatingActionButton: isAdmin && !isDesktop
          ? FloatingActionButton.extended(
              onPressed: _showCreateGroup,
              icon: const Icon(Icons.group_add_rounded),
              label: const Text('New Channel'),
              backgroundColor: isDark ? AppColors.primaryLight : AppColors.primary,
              foregroundColor: Colors.white,
            )
          : null,
      body: ResponsiveContainer(
        padding: EdgeInsets.symmetric(
          horizontal: ResponsiveLayout.horizontalPadding(context),
          vertical: 16,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Action Bar on Desktop
            if (isDesktop) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Target Groups & Channels',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Organize organization participants into broadcast channels and departments.',
                        style: TextStyle(
                          fontSize: 13,
                          color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  if (isAdmin)
                    AppButton(
                      label: '+ Create Group',
                      icon: Icons.group_add_rounded,
                      variant: AppButtonVariant.primary,
                      onPressed: _showCreateGroup,
                    ),
                ],
              ),
              const SizedBox(height: 16),
            ],

            // Search Header Box
            Container(
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurface : AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isDark ? AppColors.darkBorder : AppColors.border,
                ),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              child: TextField(
                controller: _searchController,
                onChanged: _onSearch,
                decoration: InputDecoration(
                  hintText: 'Search groups by name or description...',
                  prefixIcon: const Icon(Icons.search_rounded, size: 18),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 10),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear_rounded, size: 16),
                          onPressed: () {
                            _searchController.clear();
                            _onSearch('');
                          },
                        )
                      : null,
                ),
                style: TextStyle(
                  fontSize: 13,
                  color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Groups Grid / List
            Expanded(
              child: RefreshIndicator(
                onRefresh: () => ref.read(groupsProvider.notifier).fetchGroups(
                      searchQuery: _searchController.text,
                    ),
                child: Builder(
                  builder: (context) {
                    if (groupsState.isLoading && groupsState.groups.isEmpty) {
                      return Column(
                        children: const [
                          SkeletonLoader(width: double.infinity, height: 80),
                          SizedBox(height: 10),
                          SkeletonLoader(width: double.infinity, height: 80),
                        ],
                      );
                    }

                    if (groupsState.groups.isEmpty) {
                      return AppCard(
                        padding: const EdgeInsets.all(32),
                        child: EmptyState(
                          title: 'No groups found',
                          subtitle: _searchController.text.isNotEmpty
                              ? 'No groups match your search query.'
                              : 'Create a group to organize participants and send scheduled alerts.',
                          icon: Icons.groups_outlined,
                          onAction: isAdmin ? _showCreateGroup : null,
                          actionLabel: isAdmin ? 'Create Group' : null,
                        ),
                      );
                    }

                    if (isDesktop) {
                      return GridView.builder(
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          childAspectRatio: 2.8,
                        ),
                        itemCount: groupsState.groups.length,
                        itemBuilder: (context, index) {
                          final group = groupsState.groups[index];
                          return _buildGroupCard(context, group, isAdmin, isDark);
                        },
                      );
                    }

                    return ListView.separated(
                      itemCount: groupsState.groups.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final group = groupsState.groups[index];
                        return _buildGroupCard(context, group, isAdmin, isDark);
                      },
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGroupCard(
    BuildContext context,
    Group group,
    bool isAdmin,
    bool isDark,
  ) {
    return AppCard(
      onTap: () => context.push('/groups/details/${group.id}'),
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.secondary.withValues(alpha: isDark ? 0.2 : 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.groups_rounded, color: AppColors.secondary, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  group.name,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                    letterSpacing: -0.2,
                  ),
                ),
                if (group.description.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    group.description,
                    style: TextStyle(
                      fontSize: 12.5,
                      color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '${group.memberCount} members',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                    ),
                  ),
                ),
              ],
            ),
          ),
          if (isAdmin)
            IconButton(
              icon: Icon(
                Icons.delete_outline_rounded,
                color: isDark ? AppColors.errorLight : AppColors.error,
                size: 18,
              ),
              tooltip: 'Delete Group',
              onPressed: () => _handleDeleteGroup(group),
            )
          else
            Icon(
              Icons.chevron_right_rounded,
              color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
            ),
        ],
      ),
    );
  }
}

