import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../models/user.dart';
import '../../../shared/empty_states/empty_state.dart';
import '../../../shared/loading/loading_view.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/confirmation_dialog.dart';
import '../providers/users_provider.dart';
import 'add_user_dialog.dart';
import 'edit_user_dialog.dart';

class UsersListScreen extends ConsumerStatefulWidget {
  const UsersListScreen({super.key});

  @override
  ConsumerState<UsersListScreen> createState() => _UsersListScreenState();
}

class _UsersListScreenState extends ConsumerState<UsersListScreen> {
  final _searchController = TextEditingController();
  String? _selectedRoleFilter;

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
      message: 'Are you sure you want to delete ${user.name}? This will remove them from all groups and cannot be undone.',
      confirmLabel: 'Delete',
      isDangerous: true,
    );

    if (confirmed == true) {
      await ref.read(usersProvider.notifier).deleteUser(user.id);
    }
  }

  @override
  Widget build(BuildContext context) {
    final usersState = ref.watch(usersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Participants'),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddUser,
        icon: const Icon(Icons.person_add_rounded),
        label: const Text('Add Participant'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            color: AppColors.surface,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  onChanged: _onSearch,
                  decoration: InputDecoration(
                    hintText: 'Search by name or email...',
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
                const SizedBox(height: 10),
                Row(
                  children: [
                    _FilterChip(
                      label: 'All',
                      isSelected: _selectedRoleFilter == null,
                      onTap: () {
                        setState(() => _selectedRoleFilter = null);
                        _onSearch(_searchController.text);
                      },
                    ),
                    const SizedBox(width: 8),
                    _FilterChip(
                      label: 'Admins',
                      isSelected: _selectedRoleFilter == 'ADMIN',
                      onTap: () {
                        setState(() => _selectedRoleFilter = 'ADMIN');
                        _onSearch(_searchController.text);
                      },
                    ),
                    const SizedBox(width: 8),
                    _FilterChip(
                      label: 'Members',
                      isSelected: _selectedRoleFilter == 'MEMBER',
                      onTap: () {
                        setState(() => _selectedRoleFilter = 'MEMBER');
                        _onSearch(_searchController.text);
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Users List
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => ref.read(usersProvider.notifier).fetchUsers(
                    searchQuery: _searchController.text,
                    role: _selectedRoleFilter,
                  ),
              child: Builder(
                builder: (context) {
                  if (usersState.isLoading && usersState.users.isEmpty) {
                    return const LoadingView(message: 'Loading participants...');
                  }

                  if (usersState.users.isEmpty) {
                    return const EmptyState(
                      title: 'No participants found',
                      subtitle: 'Add a new participant to the organization.',
                      icon: Icons.person_off_outlined,
                    );
                  }

                  return ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: usersState.users.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final user = usersState.users[index];
                      final isAdmin = user.isAdmin;

                      return AppCard(
                        onTap: () => _showEditUser(user),
                        child: Row(
                          children: [
                            CircleAvatar(
                              backgroundColor: user.isActive
                                  ? (isAdmin ? AppColors.primary : AppColors.secondary)
                                  : AppColors.textMuted,
                              child: Text(
                                user.name.isNotEmpty ? user.name[0].toUpperCase() : '?',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(user.name, style: AppTextStyles.labelMedium),
                                      if (!user.isActive) ...[
                                        const SizedBox(width: 6),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: AppColors.surfaceVariant,
                                            borderRadius: BorderRadius.circular(4),
                                          ),
                                          child: const Text('Inactive', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                                        ),
                                      ],
                                    ],
                                  ),
                                  Text(user.email, style: AppTextStyles.bodySmall),
                                  if (user.phone.isNotEmpty)
                                    Text(user.phone, style: AppTextStyles.bodySmall),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: isAdmin ? AppColors.priorityNormalBg : AppColors.surfaceVariant,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                user.role,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: isAdmin ? AppColors.primary : AppColors.textSecondary,
                                ),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline_rounded, color: AppColors.error, size: 20),
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
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isSelected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
