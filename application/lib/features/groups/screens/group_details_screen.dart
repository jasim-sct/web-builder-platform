import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/layout/responsive_layout.dart';
import '../../../core/theme/app_colors.dart';
import '../../../models/group.dart';
import '../../../models/user.dart';
import '../../../shared/empty_states/empty_state.dart';
import '../../../shared/loading/loading_view.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/confirmation_dialog.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/groups_provider.dart';
import 'add_member_dialog.dart';

class GroupDetailsScreen extends ConsumerStatefulWidget {
  final String groupId;

  const GroupDetailsScreen({super.key, required this.groupId});

  @override
  ConsumerState<GroupDetailsScreen> createState() => _GroupDetailsScreenState();
}

class _GroupDetailsScreenState extends ConsumerState<GroupDetailsScreen> {
  List<User> _members = [];
  bool _isLoadingMembers = false;
  String _memberSearchQuery = '';

  @override
  void initState() {
    super.initState();
    _fetchMembers();
  }

  Future<void> _fetchMembers() async {
    setState(() => _isLoadingMembers = true);
    try {
      final members = await ref.read(groupsProvider.notifier).fetchGroupMembers(widget.groupId);
      if (mounted) {
        setState(() {
          _members = members;
          _isLoadingMembers = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingMembers = false);
    }
  }

  Future<void> _showAddMembers(Group group) async {
    final added = await showDialog<bool>(
      context: context,
      builder: (ctx) => AddMemberDialog(group: group),
    );
    if (added == true) {
      _fetchMembers();
      ref.read(groupsProvider.notifier).fetchGroups();
    }
  }

  Future<void> _handleRemoveMember(User user) async {
    final confirmed = await ConfirmationDialog.show(
      context,
      title: 'Remove Participant?',
      message: 'Remove ${user.name} from this channel? They will no longer receive future alerts dispatched to this group.',
      confirmLabel: 'Remove Member',
      isDangerous: true,
    );

    if (confirmed == true) {
      await ref.read(groupsProvider.notifier).removeMember(widget.groupId, user.id);
      _fetchMembers();
    }
  }

  @override
  Widget build(BuildContext context) {
    final groupsState = ref.watch(groupsProvider);
    final group = groupsState.groups.firstWhere(
      (g) => g.id == widget.groupId,
      orElse: () => Group(
        id: widget.groupId,
        name: 'Channel Details',
        organizationId: '',
      ),
    );
    final isAdmin = ref.watch(authProvider).isAdmin;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final filteredMembers = _memberSearchQuery.isEmpty
        ? _members
        : _members.where((m) =>
            m.name.toLowerCase().contains(_memberSearchQuery.toLowerCase()) ||
            m.email.toLowerCase().contains(_memberSearchQuery.toLowerCase())).toList();

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      appBar: AppBar(
        title: Text(group.name),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: ResponsiveContainer(
          maxWidth: 880,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Channel Hero Info Card
              AppCard(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.secondary.withValues(alpha: isDark ? 0.25 : 0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.groups_rounded, color: AppColors.secondary, size: 28),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                group.name,
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w700,
                                  color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                                  letterSpacing: -0.3,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${_members.length} enrolled participants',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: isDark ? AppColors.primaryLight : AppColors.primary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (isAdmin) ...[
                          AppButton(
                            label: ResponsiveLayout.isSmallMobile(context) ? 'Add' : 'Add Member',
                            icon: Icons.person_add_alt_1_rounded,
                            size: AppButtonSize.small,
                            onPressed: () => _showAddMembers(group),
                          ),
                          const SizedBox(width: 8),
                        ],
                        AppButton(
                          label: ResponsiveLayout.isSmallMobile(context) ? 'Alerts' : 'Channel Alerts',
                          icon: Icons.notifications_active_outlined,
                          variant: AppButtonVariant.outline,
                          size: AppButtonSize.small,
                          onPressed: () => context.push('/alerts?groupId=${group.id}'),
                        ),
                      ],
                    ),
                    if (group.description.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      const Divider(),
                      const SizedBox(height: 12),
                      Text(
                        'DESCRIPTION',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.4,
                          color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        group.description,
                        style: TextStyle(
                          fontSize: 13.5,
                          color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Members Roster Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Enrolled Members (${_members.length})',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                    ),
                  ),
                  if (isAdmin)
                    TextButton.icon(
                      onPressed: () => _showAddMembers(group),
                      icon: const Icon(Icons.person_add_rounded, size: 14),
                      label: const Text('Add Participants'),
                    ),
                ],
              ),
              const SizedBox(height: 12),

              // Filter Member search
              if (_members.length > 4) ...[
                TextField(
                  onChanged: (val) => setState(() => _memberSearchQuery = val),
                  decoration: InputDecoration(
                    hintText: 'Filter members in this group...',
                    prefixIcon: const Icon(Icons.search_rounded, size: 18),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                  style: TextStyle(
                    fontSize: 13,
                    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
              ],

              if (_isLoadingMembers)
                Column(
                  children: const [
                    SkeletonLoader(width: double.infinity, height: 60),
                    SizedBox(height: 8),
                    SkeletonLoader(width: double.infinity, height: 60),
                  ],
                )
              else if (_members.isEmpty)
                AppCard(
                  padding: const EdgeInsets.all(28),
                  child: EmptyState(
                    title: 'No members in this group',
                    subtitle: 'Enroll participants to ensure they receive alerts targeted to this channel.',
                    icon: Icons.group_off_outlined,
                    onAction: isAdmin ? () => _showAddMembers(group) : null,
                    actionLabel: isAdmin ? 'Add Members' : null,
                  ),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: filteredMembers.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final member = filteredMembers[index];
                    final isMemberAdmin = member.isAdmin;

                    return AppCard(
                      onTap: () => context.push('/users/details/${member.id}'),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 18,
                            backgroundColor: isMemberAdmin
                                ? (isDark ? AppColors.primaryLight : AppColors.primary)
                                : (isDark ? AppColors.secondaryDark : AppColors.secondary),
                            child: Text(
                              member.name.isNotEmpty ? member.name[0].toUpperCase() : '?',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  member.name,
                                  style: TextStyle(
                                    fontSize: 13.5,
                                    fontWeight: FontWeight.w600,
                                    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                                  ),
                                ),
                                Text(
                                  member.email,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              member.role,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                              ),
                            ),
                          ),
                          if (isAdmin) ...[
                            const SizedBox(width: 8),
                            IconButton(
                              icon: Icon(
                                Icons.remove_circle_outline_rounded,
                                color: isDark ? AppColors.errorLight : AppColors.error,
                                size: 20,
                              ),
                              tooltip: 'Remove from group',
                              onPressed: () => _handleRemoveMember(member),
                            ),
                          ],
                          const SizedBox(width: 4),
                          Icon(
                            Icons.chevron_right_rounded,
                            size: 16,
                            color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                          ),
                        ],
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}

