import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/layout/responsive_layout.dart';
import '../../../core/theme/app_colors.dart';
import '../../../models/alert.dart';
import '../../../models/group.dart';
import '../../../models/user.dart';
import '../../../shared/empty_states/empty_state.dart';
import '../../../shared/loading/loading_view.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/confirmation_dialog.dart';
import '../../alerts/providers/alerts_provider.dart';
import '../../alerts/widgets/alert_card.dart';
import '../../auth/providers/auth_provider.dart';
import '../../groups/providers/groups_provider.dart';
import '../providers/users_provider.dart';
import 'edit_user_dialog.dart';

class UserDetailsScreen extends ConsumerStatefulWidget {
  final String userId;

  const UserDetailsScreen({super.key, required this.userId});

  @override
  ConsumerState<UserDetailsScreen> createState() => _UserDetailsScreenState();
}

class _UserDetailsScreenState extends ConsumerState<UserDetailsScreen> {
  bool _isActionLoading = false;

  void _showEditUser(User user) {
    showDialog(
      context: context,
      barrierColor: Colors.black54,
      builder: (_) => EditUserDialog(user: user),
    );
  }

  Future<void> _handleToggleActive(User user) async {
    setState(() => _isActionLoading = true);
    try {
      await ref.read(usersProvider.notifier).updateUser(user.id, {
        'isActive': !user.isActive,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              !user.isActive ? '${user.name} activated' : '${user.name} deactivated',
            ),
            backgroundColor: !user.isActive ? AppColors.success : AppColors.warning,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error updating status: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _isActionLoading = false);
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

    if (confirmed == true && mounted) {
      setState(() => _isActionLoading = true);
      try {
        await ref.read(usersProvider.notifier).deleteUser(user.id);
        if (mounted) {
          context.pop();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('${user.name} has been deleted.')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error deleting participant: $e'), backgroundColor: AppColors.error),
          );
        }
      } finally {
        if (mounted) setState(() => _isActionLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isDesktop = ResponsiveLayout.isDesktop(context);
    final isAdmin = ref.watch(authProvider).isAdmin;

    final userAsync = ref.watch(singleUserProvider(widget.userId));
    final groups = ref.watch(groupsProvider).groups;
    final alertsState = ref.watch(alertsProvider);

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      appBar: AppBar(
        title: const Text('Participant Dossier'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          tooltip: 'Back to Directory',
          onPressed: () => context.canPop() ? context.pop() : context.go('/users'),
        ),
      ),
      body: userAsync.when(
        data: (user) {
          if (user == null) {
            return Center(
              child: EmptyState(
                title: 'Participant Not Found',
                subtitle: 'The requested user could not be found or has been removed.',
                icon: Icons.person_off_outlined,
                onAction: () => context.go('/users'),
                actionLabel: 'Return to Directory',
              ),
            );
          }

          // Compute user's assigned groups
          final assignedGroups = groups.where((g) {
            return g.members.any((m) => m.id == user.id) || g.memberIds.contains(user.id);
          }).toList();

          // Compute alerts targeting those groups
          final assignedGroupIds = assignedGroups.map((g) => g.id).toSet();
          final targetedAlerts = alertsState.alerts.where((a) {
            return assignedGroupIds.contains(a.groupId);
          }).toList();

          return SingleChildScrollView(
            padding: EdgeInsets.symmetric(
              horizontal: ResponsiveLayout.horizontalPadding(context),
              vertical: 20,
            ),
            child: ResponsiveContainer(
              maxWidth: 1024,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Profile Overview Header Card
                  _buildProfileCard(context, user, assignedGroups.length, targetedAlerts.length, isDark, isDesktop, isAdmin),
                  const SizedBox(height: 24),

                  // Responsive 2-Column Content Layout (Desktop) or Stacked (Mobile)
                  if (isDesktop)
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Left Column: Assigned Channels / Groups
                        Expanded(
                          flex: 5,
                          child: _buildAssignedGroupsSection(context, user, assignedGroups, isDark, isAdmin),
                        ),
                        const SizedBox(width: 24),

                        // Right Column: Targeted Alerts Stream
                        Expanded(
                          flex: 5,
                          child: _buildTargetedAlertsSection(context, user, targetedAlerts, isDark),
                        ),
                      ],
                    )
                  else ...[
                    _buildAssignedGroupsSection(context, user, assignedGroups, isDark, isAdmin),
                    const SizedBox(height: 24),
                    _buildTargetedAlertsSection(context, user, targetedAlerts, isDark),
                  ],
                ],
              ),
            ),
          );
        },
        loading: () => const LoadingView(message: 'Loading participant dossier...'),
        error: (err, _) => Center(
          child: EmptyState(
            title: 'Error loading participant',
            subtitle: err.toString(),
            icon: Icons.error_outline_rounded,
            onAction: () => ref.refresh(singleUserProvider(widget.userId)),
            actionLabel: 'Retry',
          ),
        ),
      ),
    );
  }

  Widget _buildProfileCard(
    BuildContext context,
    User user,
    int groupCount,
    int alertCount,
    bool isDark,
    bool isDesktop,
    bool isAdmin,
  ) {
    return AppCard(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Avatar
              CircleAvatar(
                radius: isDesktop ? 32 : 26,
                backgroundColor: user.isAdmin
                    ? (isDark ? AppColors.primaryLight : AppColors.primary)
                    : (isDark ? AppColors.secondaryDark : AppColors.secondary),
                child: Text(
                  user.name.isNotEmpty ? user.name[0].toUpperCase() : '?',
                  style: TextStyle(
                    fontSize: isDesktop ? 24 : 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(width: 18),

              // Name, email, phone & badges
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            user.name,
                            style: TextStyle(
                              fontSize: isDesktop ? 22 : 18,
                              fontWeight: FontWeight.w700,
                              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                              letterSpacing: -0.4,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                          decoration: BoxDecoration(
                            color: user.isAdmin
                                ? (isDark ? AppColors.darkPriorityNormalBg : AppColors.priorityNormalBg)
                                : (isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            user.role,
                            style: TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.3,
                              color: user.isAdmin
                                  ? (isDark ? AppColors.primaryLight : AppColors.primary)
                                  : (isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user.email,
                      style: TextStyle(
                        fontSize: 13,
                        color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                      ),
                    ),
                    if (user.phone.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Icon(
                            Icons.phone_rounded,
                            size: 13,
                            color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            user.phone,
                            style: TextStyle(
                              fontSize: 12.5,
                              color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),

              // Action Toolbar
              if (isAdmin) ...[
                if (isDesktop) ...[
                  AppButton(
                    label: 'Edit',
                    icon: Icons.edit_outlined,
                    variant: AppButtonVariant.secondary,
                    size: AppButtonSize.small,
                    onPressed: () => _showEditUser(user),
                  ),
                  const SizedBox(width: 8),
                  AppButton(
                    label: user.isActive ? 'Deactivate' : 'Activate',
                    icon: user.isActive ? Icons.pause_circle_outline_rounded : Icons.play_circle_outline_rounded,
                    variant: AppButtonVariant.outline,
                    size: AppButtonSize.small,
                    isLoading: _isActionLoading,
                    onPressed: () => _handleToggleActive(user),
                  ),
                  const SizedBox(width: 8),
                  AppButton(
                    label: 'Delete',
                    icon: Icons.delete_outline_rounded,
                    variant: AppButtonVariant.danger,
                    size: AppButtonSize.small,
                    isLoading: _isActionLoading,
                    onPressed: () => _handleDelete(user),
                  ),
                ] else ...[
                  PopupMenuButton<String>(
                    icon: const Icon(Icons.more_vert_rounded),
                    onSelected: (val) {
                      if (val == 'edit') _showEditUser(user);
                      if (val == 'toggle') _handleToggleActive(user);
                      if (val == 'delete') _handleDelete(user);
                    },
                    itemBuilder: (_) => [
                      const PopupMenuItem(value: 'edit', child: Text('Edit Profile')),
                      PopupMenuItem(
                        value: 'toggle',
                        child: Text(user.isActive ? 'Deactivate User' : 'Activate User'),
                      ),
                      const PopupMenuItem(
                        value: 'delete',
                        child: Text('Delete User', style: TextStyle(color: AppColors.error)),
                      ),
                    ],
                  ),
                ],
              ],
            ],
          ),
          const SizedBox(height: 20),
          const Divider(),
          const SizedBox(height: 16),

          // Clickable Metric Indicators
          Row(
            children: [
              Expanded(
                child: _ClickableMetricPill(
                  label: 'ENROLLED CHANNELS',
                  value: groupCount.toString(),
                  icon: Icons.groups_rounded,
                  accentColor: AppColors.secondary,
                  onTap: () => context.push('/groups'),
                  tooltip: 'View all channels',
                  isDark: isDark,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _ClickableMetricPill(
                  label: 'TARGETED ALERTS',
                  value: alertCount.toString(),
                  icon: Icons.alarm_rounded,
                  accentColor: AppColors.priorityNormal,
                  onTap: () => context.push('/alerts'),
                  tooltip: 'View all alerts',
                  isDark: isDark,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _ClickableMetricPill(
                  label: 'DELIVERY STATUS',
                  value: user.isActive ? 'ACTIVE' : 'INACTIVE',
                  icon: user.isActive ? Icons.check_circle_rounded : Icons.cancel_rounded,
                  accentColor: user.isActive ? AppColors.success : AppColors.error,
                  onTap: null,
                  tooltip: 'Account Status',
                  isDark: isDark,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAssignedGroupsSection(
    BuildContext context,
    User user,
    List<Group> assignedGroups,
    bool isDark,
    bool isAdmin,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Enrolled Channels (${assignedGroups.length})',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
              ),
            ),
            TextButton.icon(
              onPressed: () => context.push('/groups'),
              icon: const Icon(Icons.arrow_forward_rounded, size: 14),
              label: const Text('All Channels'),
            ),
          ],
        ),
        const SizedBox(height: 10),

        if (assignedGroups.isEmpty)
          AppCard(
            padding: const EdgeInsets.all(24),
            child: EmptyState(
              title: 'Not Enrolled in Any Channels',
              subtitle: '${user.name} is not currently a member of any target notification groups.',
              icon: Icons.groups_outlined,
              onAction: isAdmin ? () => context.push('/groups') : null,
              actionLabel: isAdmin ? 'Browse Channels' : null,
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: assignedGroups.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final group = assignedGroups[index];
              return AppCard(
                onTap: () => context.push('/groups/details/${group.id}'),
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.secondary.withValues(alpha: isDark ? 0.2 : 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.groups_rounded, color: AppColors.secondary, size: 18),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            group.name,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                            ),
                          ),
                          if (group.description.isNotEmpty) ...[
                            const SizedBox(height: 2),
                            Text(
                              group.description,
                              style: TextStyle(
                                fontSize: 12,
                                color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
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
                    const SizedBox(width: 6),
                    Icon(
                      Icons.chevron_right_rounded,
                      size: 18,
                      color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                    ),
                  ],
                ),
              );
            },
          ),
      ],
    );
  }

  Widget _buildTargetedAlertsSection(
    BuildContext context,
    User user,
    List<Alert> targetedAlerts,
    bool isDark,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Associated Alerts (${targetedAlerts.length})',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
              ),
            ),
            TextButton.icon(
              onPressed: () => context.push('/alerts'),
              icon: const Icon(Icons.arrow_forward_rounded, size: 14),
              label: const Text('Alert Center'),
            ),
          ],
        ),
        const SizedBox(height: 10),

        if (targetedAlerts.isEmpty)
          AppCard(
            padding: const EdgeInsets.all(24),
            child: EmptyState(
              title: 'No Targeted Alerts',
              subtitle: 'No active scheduled alerts currently target channels containing ${user.name}.',
              icon: Icons.notifications_none_rounded,
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: targetedAlerts.take(5).length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final alert = targetedAlerts[index];
              return AlertCard(
                alert: alert,
                onTap: () => context.push('/alerts/details/${alert.id}'),
              );
            },
          ),
      ],
    );
  }
}

class _ClickableMetricPill extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color accentColor;
  final VoidCallback? onTap;
  final String tooltip;
  final bool isDark;

  const _ClickableMetricPill({
    required this.label,
    required this.value,
    required this.icon,
    required this.accentColor,
    required this.onTap,
    required this.tooltip,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final content = Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.border,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.3,
                    color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Icon(icon, size: 14, color: accentColor),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );

    if (onTap == null) return content;

    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: content,
      ),
    );
  }
}
