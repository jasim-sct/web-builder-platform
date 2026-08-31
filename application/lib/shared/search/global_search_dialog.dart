import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../features/alerts/providers/alerts_provider.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/groups/providers/groups_provider.dart';
import '../../features/users/providers/users_provider.dart';
import '../widgets/priority_badge.dart';

class GlobalSearchDialog extends ConsumerStatefulWidget {
  const GlobalSearchDialog({super.key});

  static Future<void> show(BuildContext context) {
    return showDialog(
      context: context,
      barrierColor: Colors.black54,
      builder: (context) => const GlobalSearchDialog(),
    );
  }

  @override
  ConsumerState<GlobalSearchDialog> createState() => _GlobalSearchDialogState();
}

class _GlobalSearchDialogState extends ConsumerState<GlobalSearchDialog> {
  final _searchController = TextEditingController();
  final _focusNode = FocusNode();
  String _query = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isAdmin = ref.watch(authProvider).isAdmin;
    final alerts = ref.watch(alertsProvider).alerts;
    final groups = ref.watch(groupsProvider).groups;
    final users = ref.watch(usersProvider).users;

    final filteredAlerts = _query.isEmpty
        ? <dynamic>[]
        : alerts.where((a) =>
            a.title.toLowerCase().contains(_query.toLowerCase()) ||
            a.message.toLowerCase().contains(_query.toLowerCase()) ||
            (a.groupName?.toLowerCase().contains(_query.toLowerCase()) ?? false)).take(4).toList();

    final filteredGroups = _query.isEmpty
        ? <dynamic>[]
        : groups.where((g) =>
            g.name.toLowerCase().contains(_query.toLowerCase()) ||
            g.description.toLowerCase().contains(_query.toLowerCase())).take(3).toList();

    final filteredUsers = _query.isEmpty
        ? <dynamic>[]
        : users.where((u) =>
            u.name.toLowerCase().contains(_query.toLowerCase()) ||
            u.email.toLowerCase().contains(_query.toLowerCase())).take(3).toList();

    final width = MediaQuery.of(context).size.width;
    final isMobile = width < 600;

    return Dialog(
      insetPadding: isMobile
          ? const EdgeInsets.symmetric(horizontal: 16, vertical: 24)
          : const EdgeInsets.symmetric(horizontal: 40, vertical: 60),
      alignment: Alignment.topCenter,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      backgroundColor: isDark ? AppColors.darkSurface : AppColors.surface,
      surfaceTintColor: Colors.transparent,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 640, maxHeight: 580),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Search Input Header
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  Icon(
                    Icons.search_rounded,
                    color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                    size: 22,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      focusNode: _focusNode,
                      onChanged: (val) => setState(() => _query = val.trim()),
                      decoration: InputDecoration(
                        hintText: 'Search alerts, groups, people, or commands...',
                        hintStyle: TextStyle(
                          color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                          fontSize: 14,
                        ),
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        filled: false,
                        contentPadding: EdgeInsets.zero,
                      ),
                      style: TextStyle(
                        color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  if (_query.isNotEmpty)
                    IconButton(
                      icon: const Icon(Icons.close_rounded, size: 18),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _query = '');
                      },
                    ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      'ESC',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: isDark ? AppColors.darkTextMuted : AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Divider(
              height: 1,
              color: isDark ? AppColors.darkBorder : AppColors.border,
            ),

            // Results List / Quick Commands
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_query.isEmpty) ...[
                      _buildSectionHeader('QUICK NAVIGATION', isDark),
                      _buildActionItem(
                        icon: Icons.dashboard_outlined,
                        title: 'Dashboard',
                        subtitle: 'Overview & recent activity',
                        isDark: isDark,
                        onTap: () {
                          Navigator.pop(context);
                          context.go('/dashboard');
                        },
                      ),
                      _buildActionItem(
                        icon: Icons.notifications_none_rounded,
                        title: 'Alerts',
                        subtitle: 'Manage upcoming & past alerts',
                        isDark: isDark,
                        onTap: () {
                          Navigator.pop(context);
                          context.go('/alerts');
                        },
                      ),
                      _buildActionItem(
                        icon: Icons.groups_outlined,
                        title: 'Groups',
                        subtitle: 'Manage teams and notification channels',
                        isDark: isDark,
                        onTap: () {
                          Navigator.pop(context);
                          context.go('/groups');
                        },
                      ),
                      if (isAdmin)
                        _buildActionItem(
                          icon: Icons.people_outline_rounded,
                          title: 'Participants',
                          subtitle: 'Manage team members and roles',
                          isDark: isDark,
                          onTap: () {
                            Navigator.pop(context);
                            context.go('/users');
                          },
                        ),
                      _buildActionItem(
                        icon: Icons.person_outline_rounded,
                        title: 'Profile & Settings',
                        subtitle: 'Theme, real-time status & host configuration',
                        isDark: isDark,
                        onTap: () {
                          Navigator.pop(context);
                          context.go('/profile');
                        },
                      ),

                      if (isAdmin) ...[
                        const SizedBox(height: 12),
                        _buildSectionHeader('ACTIONS', isDark),
                        _buildActionItem(
                          icon: Icons.add_alert_rounded,
                          title: 'Create Scheduled Alert',
                          subtitle: 'Set up single or repeating notifications',
                          color: AppColors.primary,
                          isDark: isDark,
                          onTap: () {
                            Navigator.pop(context);
                            context.push('/alerts/new');
                          },
                        ),
                        _buildActionItem(
                          icon: Icons.campaign_rounded,
                          title: 'Urgent Broadcast Now',
                          subtitle: 'Trigger immediate loud alert to groups',
                          color: AppColors.error,
                          isDark: isDark,
                          onTap: () {
                            Navigator.pop(context);
                            context.push('/alerts/broadcast');
                          },
                        ),
                      ],
                    ] else ...[
                      // Search Results
                      if (filteredAlerts.isEmpty && filteredGroups.isEmpty && filteredUsers.isEmpty)
                        Padding(
                          padding: const EdgeInsets.all(32.0),
                          child: Center(
                            child: Column(
                              children: [
                                Icon(
                                  Icons.search_off_rounded,
                                  size: 36,
                                  color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'No results for "$_query"',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                    color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                      if (filteredAlerts.isNotEmpty) ...[
                        _buildSectionHeader('ALERTS (${filteredAlerts.length})', isDark),
                        ...filteredAlerts.map((alert) => _buildActionItem(
                              icon: Icons.notifications_active_outlined,
                              title: alert.title,
                              subtitle: alert.message,
                              trailing: PriorityBadge(priority: alert.priority),
                              isDark: isDark,
                              onTap: () {
                                Navigator.pop(context);
                                context.push('/alerts/details/${alert.id}');
                              },
                            )),
                        const SizedBox(height: 12),
                      ],

                      if (filteredGroups.isNotEmpty) ...[
                        _buildSectionHeader('GROUPS (${filteredGroups.length})', isDark),
                        ...filteredGroups.map((group) => _buildActionItem(
                              icon: Icons.groups_rounded,
                              title: group.name,
                              subtitle: '${group.memberCount} members · ${group.description}',
                              isDark: isDark,
                              onTap: () {
                                Navigator.pop(context);
                                context.push('/groups/details/${group.id}');
                              },
                            )),
                        const SizedBox(height: 12),
                      ],

                      if (filteredUsers.isNotEmpty && isAdmin) ...[
                        _buildSectionHeader('PARTICIPANTS (${filteredUsers.length})', isDark),
                        ...filteredUsers.map((user) => _buildActionItem(
                              icon: Icons.person_outline_rounded,
                              title: user.name,
                              subtitle: '${user.email} · ${user.role}',
                              isDark: isDark,
                              onTap: () {
                                Navigator.pop(context);
                                context.go('/users');
                              },
                            )),
                      ],
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
          color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
        ),
      ),
    );
  }

  Widget _buildActionItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    required bool isDark,
    Color? color,
    Widget? trailing,
  }) {
    final itemColor = color ?? (isDark ? AppColors.primaryLight : AppColors.primary);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      hoverColor: isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: itemColor.withValues(alpha: isDark ? 0.2 : 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, size: 18, color: itemColor),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            if (trailing != null) trailing,
          ],
        ),
      ),
    );
  }
}
