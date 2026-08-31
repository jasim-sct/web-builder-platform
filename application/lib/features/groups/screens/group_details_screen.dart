import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
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
      title: 'Remove Member?',
      message: 'Remove ${user.name} from this group? They will no longer receive future alerts dispatched to this group.',
      confirmLabel: 'Remove',
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
        name: 'Group Details',
        organizationId: '',
      ),
    );
    final isAdmin = ref.watch(authProvider).isAdmin;

    return Scaffold(
      appBar: AppBar(
        title: Text(group.name),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Group Header Card
            AppCard(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.groups_rounded, color: AppColors.primary, size: 28),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(group.name, style: AppTextStyles.headingMedium),
                            const SizedBox(height: 4),
                            Text(
                              '${_members.length} participants',
                              style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.w600, color: AppColors.primary),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  if (group.description.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    const Divider(),
                    const SizedBox(height: 12),
                    Text('Description', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textMuted)),
                    const SizedBox(height: 4),
                    Text(group.description, style: AppTextStyles.bodyMedium),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Members Header with Action
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Group Members (${_members.length})', style: AppTextStyles.headingSmall),
                if (isAdmin)
                  AppButton(
                    label: '+ Add Member',
                    icon: Icons.person_add_alt_1_rounded,
                    onPressed: () => _showAddMembers(group),
                  ),
              ],
            ),
            const SizedBox(height: 12),

            if (_isLoadingMembers)
              const SizedBox(height: 140, child: LoadingView(message: 'Loading members...'))
            else if (_members.isEmpty)
              const EmptyState(
                title: 'No members in this group',
                subtitle: 'Add participants to start sending group alerts.',
                icon: Icons.group_off_outlined,
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _members.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, index) {
                  final member = _members[index];
                  final isMemberAdmin = member.isAdmin;

                  return AppCard(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: isMemberAdmin ? AppColors.primary : AppColors.secondary,
                          child: Text(
                            member.name.isNotEmpty ? member.name[0].toUpperCase() : '?',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(member.name, style: AppTextStyles.labelMedium),
                              Text(member.email, style: AppTextStyles.bodySmall),
                            ],
                          ),
                        ),
                        if (isAdmin)
                          IconButton(
                            icon: const Icon(Icons.remove_circle_outline_rounded, color: AppColors.error, size: 22),
                            tooltip: 'Remove from group',
                            onPressed: () => _handleRemoveMember(member),
                          ),
                      ],
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
