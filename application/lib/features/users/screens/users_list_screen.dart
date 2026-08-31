import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/layout/responsive_layout.dart';
import '../../../core/theme/app_colors.dart';
import '../../../models/user.dart';
import '../../../shared/empty_states/empty_state.dart';
import '../../../shared/loading/loading_view.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/confirmation_dialog.dart';
import '../../groups/providers/groups_provider.dart';
import '../providers/users_provider.dart';
import 'add_user_dialog.dart';
import 'edit_user_dialog.dart';

class UsersListScreen extends ConsumerStatefulWidget {
  final String? initialRole;
  final String? initialGroupId;

  const UsersListScreen({
    super.key,
    this.initialRole,
    this.initialGroupId,
  });

  @override
  ConsumerState<UsersListScreen> createState() => _UsersListScreenState();
}

class _UsersListScreenState extends ConsumerState<UsersListScreen> {
  final _searchController = TextEditingController();
  String? _selectedRoleFilter;
  String? _selectedGroupId;

  @override
  void initState() {
    super.initState();
    _selectedRoleFilter = widget.initialRole;
    _selectedGroupId = widget.initialGroupId;
  }

  @override
  void didUpdateWidget(UsersListScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialRole != oldWidget.initialRole) {
      _selectedRoleFilter = widget.initialRole;
    }
    if (widget.initialGroupId != oldWidget.initialGroupId) {
      _selectedGroupId = widget.initialGroupId;
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearch(String val) {
    ref.read(usersProvider.notifier).fetchUsers(
          searchQuery: val,
          role: _selectedRoleFilter,
        );
  }

  Future<void> _showAddUser() async {
    final created = await showDialog<bool>(
      context: context,
      builder: (ctx) => const AddUserDialog(),
    );
    if (created == true) {
      ref.read(usersProvider.notifier).fetchUsers();
    }
  }

  Future<void> _showEditUser(User user) async {
    final updated = await showDialog<bool>(
      context: context,
      builder: (ctx) => EditUserDialog(user: user),
    );
    if (updated == true) {
      ref.read(usersProvider.notifier).fetchUsers();
    }
  }

  Future<void> _handleDelete(User user) async {
    final confirmed = await ConfirmationDialog.show(
      context,
      title: 'Delete Participant?',
      message: 'Are you sure you want to permanently delete ${user.name}? This will remove them from all assigned groups.',
      confirmLabel: 'Delete Participant',
      isDangerous: true,
    );

    if (confirmed == true) {
      await ref.read(usersProvider.notifier).deleteUser(user.id);
    }
  }

  @override
  Widget build(BuildContext context) {
    final usersState = ref.watch(usersProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isDesktop = ResponsiveLayout.isDesktop(context);

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      floatingActionButton: !isDesktop
          ? FloatingActionButton.extended(
              onPressed: _showAddUser,
              icon: const Icon(Icons.person_add_rounded),
              label: const Text('Add User'),
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
                        'Participant Directory',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Manage organization users, roles, phone numbers, and notification status.',
                        style: TextStyle(
                          fontSize: 13,
                          color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  AppButton(
                    label: '+ Add Participant',
                    icon: Icons.person_add_rounded,
                    variant: AppButtonVariant.primary,
                    onPressed: _showAddUser,
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],

            // Search & Filter Box
            Container(
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurface : AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isDark ? AppColors.darkBorder : AppColors.border,
                ),
              ),
              padding: const EdgeInsets.all(12),
              child: Column(
                children: [
                  TextField(
                    controller: _searchController,
                    onChanged: _onSearch,
                    decoration: InputDecoration(
                      hintText: 'Search by name, email, or phone...',
                      prefixIcon: const Icon(Icons.search_rounded, size: 18),
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 8),
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
                  const SizedBox(height: 10),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildRoleFilterChip('All Roles', null, isDark),
                        const SizedBox(width: 8),
                        _buildRoleFilterChip('Admins', 'ADMIN', isDark),
                        const SizedBox(width: 8),
                        _buildRoleFilterChip('Members', 'MEMBER', isDark),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Group Filter Banner
            if (_selectedGroupId != null) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isDark
                        ? AppColors.primaryLight.withValues(alpha: 0.3)
                        : AppColors.primary.withValues(alpha: 0.3),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.groups_rounded,
                      size: 16,
                      color: isDark ? AppColors.secondary : AppColors.secondary,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _getGroupFilterSummary(ref),
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    InkWell(
                      onTap: () => setState(() => _selectedGroupId = null),
                      borderRadius: BorderRadius.circular(4),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Clear',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: isDark ? AppColors.primaryLight : AppColors.primary,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Icon(
                              Icons.close_rounded,
                              size: 14,
                              color: isDark ? AppColors.primaryLight : AppColors.primary,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Users List Content
            Expanded(
              child: RefreshIndicator(
                onRefresh: () => ref.read(usersProvider.notifier).fetchUsers(
                      searchQuery: _searchController.text,
                      role: _selectedRoleFilter,
                    ),
                child: Builder(
                  builder: (context) {
                    var displayedUsers = usersState.users;
                    if (_selectedGroupId != null) {
                      final groups = ref.watch(groupsProvider).groups;
                      final group = groups.where((g) => g.id == _selectedGroupId).firstOrNull;
                      if (group != null) {
                        final memberIdSet = {
                          ...group.memberIds,
                          ...group.members.map((m) => m.id),
                        };
                        displayedUsers = displayedUsers.where((u) => memberIdSet.contains(u.id)).toList();
                      }
                    }

                    if (usersState.isLoading && displayedUsers.isEmpty) {
                      return Column(
                        children: const [
                          SkeletonLoader(width: double.infinity, height: 70),
                          SizedBox(height: 8),
                          SkeletonLoader(width: double.infinity, height: 70),
                        ],
                      );
                    }

                    if (displayedUsers.isEmpty) {
                      return AppCard(
                        padding: const EdgeInsets.all(32),
                        child: EmptyState(
                          title: 'No participants found',
                          subtitle: _searchController.text.isNotEmpty || _selectedGroupId != null
                              ? 'No users match your filter criteria.'
                              : 'Add participants to begin sending scheduled alerts.',
                          icon: Icons.person_off_outlined,
                          onAction: _showAddUser,
                          actionLabel: 'Add Participant',
                        ),
                      );
                    }

                    return ListView.separated(
                      itemCount: displayedUsers.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final user = displayedUsers[index];
                        final isAdmin = user.isAdmin;

                        return AppCard(
                          onTap: () => context.push('/users/details/${user.id}'),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 18,
                                backgroundColor: user.isActive
                                    ? (isAdmin
                                        ? (isDark ? AppColors.primaryLight : AppColors.primary)
                                        : (isDark ? AppColors.secondaryDark : AppColors.secondary))
                                    : (isDark ? AppColors.darkSurfaceVariant : AppColors.border),
                                child: Text(
                                  user.name.isNotEmpty ? user.name[0].toUpperCase() : '?',
                                  style: TextStyle(
                                    color: user.isActive ? Colors.white : (isDark ? AppColors.darkTextMuted : AppColors.textMuted),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          user.name,
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w600,
                                            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                                          ),
                                        ),
                                        if (!user.isActive) ...[
                                          const SizedBox(width: 8),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant,
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: Text(
                                              'Inactive',
                                              style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w500,
                                                color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      user.email,
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                                      ),
                                    ),
                                    if (user.phone.isNotEmpty)
                                      Text(
                                        user.phone,
                                        style: TextStyle(
                                          fontSize: 11.5,
                                          color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: isAdmin
                                      ? (isDark ? AppColors.darkPriorityNormalBg : AppColors.priorityNormalBg)
                                      : (isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  user.role,
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: isAdmin
                                        ? (isDark ? AppColors.primaryLight : AppColors.primary)
                                        : (isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              IconButton(
                                icon: Icon(
                                  Icons.edit_outlined,
                                  color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                                  size: 18,
                                ),
                                tooltip: 'Edit',
                                onPressed: () => _showEditUser(user),
                              ),
                              IconButton(
                                icon: Icon(
                                  Icons.delete_outline_rounded,
                                  color: isDark ? AppColors.errorLight : AppColors.error,
                                  size: 18,
                                ),
                                tooltip: 'Delete',
                                onPressed: () => _handleDelete(user),
                              ),
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
      ),
    );
  }

  String _getGroupFilterSummary(WidgetRef ref) {
    if (_selectedGroupId != null) {
      final groups = ref.watch(groupsProvider).groups;
      final group = groups.where((g) => g.id == _selectedGroupId).firstOrNull;
      return "Enrolled in Channel: ${group?.name ?? 'Group'}";
    }
    return "Filtered Members";
  }

  Widget _buildRoleFilterChip(String label, String? roleValue, bool isDark) {
    final isSelected = _selectedRoleFilter == roleValue;
    return InkWell(
      onTap: () {
        setState(() => _selectedRoleFilter = roleValue);
        _onSearch(_searchController.text);
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark ? AppColors.primaryLight : AppColors.primary)
              : (isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11.5,
            fontWeight: FontWeight.w600,
            color: isSelected
                ? Colors.white
                : (isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
          ),
        ),
      ),
    );
  }
}

