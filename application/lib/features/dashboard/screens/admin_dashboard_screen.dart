import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/layout/responsive_layout.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../shared/empty_states/empty_state.dart';
import '../../../shared/loading/loading_view.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../alerts/providers/alerts_provider.dart';
import '../../alerts/widgets/alert_card.dart';
import '../../auth/providers/auth_provider.dart';
import '../../groups/providers/groups_provider.dart';
import '../../users/providers/users_provider.dart';
import '../providers/dashboard_provider.dart';

class AdminDashboardScreen extends ConsumerWidget {
  const AdminDashboardScreen({super.key});

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  Future<void> _refreshAll(WidgetRef ref) async {
    ref.invalidate(upcomingAlertsProvider);
    await ref.read(usersProvider.notifier).fetchUsers();
    await ref.read(groupsProvider.notifier).fetchGroups();
    await ref.read(alertsProvider.notifier).fetchAlerts();
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final org = authState.organization;
    final metrics = ref.watch(dashboardMetricsProvider);
    final upcomingAsync = ref.watch(upcomingAlertsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isDesktop = ResponsiveLayout.isDesktop(context);

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      body: RefreshIndicator(
        onRefresh: () => _refreshAll(ref),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: ResponsiveContainer(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Greeting & Action Bar
                _buildHeader(context, user, org, isDark, isDesktop),
                const SizedBox(height: 24),

                // Metrics Grid (Adaptive: 4 cols on desktop, 2 cols on tablet/mobile)
                _buildMetricsGrid(context, metrics, isDark),
                const SizedBox(height: 28),

                // Main Content Area: Responsive 2-column or stacked
                if (isDesktop)
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Left Column: Upcoming Alerts
                      Expanded(
                        flex: 6,
                        child: _buildUpcomingSection(context, upcomingAsync, isDark),
                      ),
                      const SizedBox(width: 24),

                      // Right Column: Quick Actions & Live Stats
                      Expanded(
                        flex: 4,
                        child: Column(
                          children: [
                            _buildQuickActionsCard(context, isDark),
                            const SizedBox(height: 20),
                            _buildLiveChannelCard(context, ref, isDark),
                          ],
                        ),
                      ),
                    ],
                  )
                else ...[
                  // Mobile & Tablet Stacked View
                  _buildQuickActionsCard(context, isDark),
                  const SizedBox(height: 24),
                  _buildUpcomingSection(context, upcomingAsync, isDark),
                  const SizedBox(height: 24),
                  _buildLiveChannelCard(context, ref, isDark),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(
    BuildContext context,
    dynamic user,
    dynamic org,
    bool isDark,
    bool isDesktop,
  ) {
    final now = DateTime.now();
    final dateStr = DateFormatter.formatDate(now);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${_getGreeting()}, ${user?.name ?? 'Admin'}',
                style: TextStyle(
                  fontSize: isDesktop ? 24 : 20,
                  fontWeight: FontWeight.w700,
                  color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '$dateStr · ${org?.name ?? user?.organizationName ?? 'Enterprise Workspace'}',
                style: TextStyle(
                  fontSize: 13,
                  color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
        if (isDesktop) ...[
          AppButton(
            label: 'Schedule Alert',
            icon: Icons.add_alert_rounded,
            variant: AppButtonVariant.primary,
            onPressed: () => context.push('/alerts/new'),
          ),
          const SizedBox(width: 10),
          AppButton(
            label: 'Broadcast Now',
            icon: Icons.campaign_rounded,
            variant: AppButtonVariant.danger,
            onPressed: () => context.push('/alerts/broadcast'),
          ),
        ],
      ],
    );
  }

  Widget _buildMetricsGrid(BuildContext context, dynamic metrics, bool isDark) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final is4Col = width >= 900;
        final is1Col = width < 380;

        final statCards = [
          _StatMetricCard(
            title: 'TOTAL PARTICIPANTS',
            value: metrics.totalUsers.toString(),
            subtitle: 'Registered users',
            icon: Icons.people_outline_rounded,
            accentColor: AppColors.primaryLight,
            onTap: () => context.push('/users'),
          ),
          _StatMetricCard(
            title: 'ACTIVE GROUPS',
            value: metrics.totalGroups.toString(),
            subtitle: 'Target channels',
            icon: Icons.groups_outlined,
            accentColor: AppColors.secondary,
            onTap: () => context.push('/groups'),
          ),
          _StatMetricCard(
            title: 'SCHEDULED ALERTS',
            value: metrics.activeAlerts.toString(),
            subtitle: 'Active reminders',
            icon: Icons.alarm_rounded,
            accentColor: AppColors.priorityNormal,
            onTap: () => context.push('/alerts?tab=upcoming'),
          ),
          _StatMetricCard(
            title: "TODAY'S OCCURRENCES",
            value: metrics.todayAlerts.toString(),
            subtitle: 'Alerts today',
            icon: Icons.calendar_today_outlined,
            accentColor: AppColors.priorityHigh,
            onTap: () => context.push('/alerts?filter=today'),
          ),
        ];

        if (is4Col) {
          return Row(
            children: statCards
                .map((card) => Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        child: card,
                      ),
                    ))
                .toList(),
          );
        }

        if (is1Col) {
          return Column(
            children: statCards
                .map((card) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: card,
                    ))
                .toList(),
          );
        }

        // 2x2 Grid on Tablet / Mobile
        return Column(
          children: [
            Row(
              children: [
                Expanded(child: statCards[0]),
                const SizedBox(width: 10),
                Expanded(child: statCards[1]),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(child: statCards[2]),
                const SizedBox(width: 10),
                Expanded(child: statCards[3]),
              ],
            ),
          ],
        );
      },
    );
  }

  Widget _buildUpcomingSection(
    BuildContext context,
    AsyncValue<List<dynamic>> upcomingAsync,
    bool isDark,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Upcoming Alerts & Agenda',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
              ),
            ),
            TextButton.icon(
              onPressed: () => context.go('/alerts'),
              icon: const Icon(Icons.arrow_forward_rounded, size: 14),
              label: const Text('View All'),
            ),
          ],
        ),
        const SizedBox(height: 10),

        upcomingAsync.when(
          data: (upcomingList) {
            if (upcomingList.isEmpty) {
              return AppCard(
                padding: const EdgeInsets.all(32),
                child: EmptyState(
                  title: 'No upcoming alerts',
                  subtitle: 'Schedule a recurring reminder or broadcast directly to channels.',
                  icon: Icons.notifications_none_rounded,
                  onAction: () => context.push('/alerts/new'),
                  actionLabel: 'Create Scheduled Alert',
                ),
              );
            }

            return ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: upcomingList.take(5).length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final alert = upcomingList[index];
                return AlertCard(
                  alert: alert,
                  onTap: () => context.push('/alerts/details/${alert.id}'),
                );
              },
            );
          },
          loading: () => Column(
            children: const [
              SkeletonLoader(width: double.infinity, height: 90),
              SizedBox(height: 10),
              SkeletonLoader(width: double.infinity, height: 90),
            ],
          ),
          error: (err, _) => AppCard(
            padding: const EdgeInsets.all(20),
            child: Text('Error loading alerts: $err', style: const TextStyle(color: AppColors.error)),
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActionsCard(BuildContext context, bool isDark) {
    return AppCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Quick Actions',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              AppButton(
                label: 'Add Participant',
                icon: Icons.person_add_outlined,
                variant: AppButtonVariant.secondary,
                size: AppButtonSize.small,
                onPressed: () => context.push('/users/new'),
              ),
              AppButton(
                label: 'Create Group',
                icon: Icons.group_add_outlined,
                variant: AppButtonVariant.secondary,
                size: AppButtonSize.small,
                onPressed: () => context.push('/groups/new'),
              ),
              AppButton(
                label: 'Schedule Alert',
                icon: Icons.add_alert_outlined,
                variant: AppButtonVariant.primary,
                size: AppButtonSize.small,
                onPressed: () => context.push('/alerts/new'),
              ),
              AppButton(
                label: 'Emergency Broadcast',
                icon: Icons.campaign_rounded,
                variant: AppButtonVariant.danger,
                size: AppButtonSize.small,
                onPressed: () => context.push('/alerts/broadcast'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLiveChannelCard(BuildContext context, WidgetRef ref, bool isDark) {
    final groups = ref.watch(groupsProvider).groups;

    return AppCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Active Channels',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                ),
              ),
              TextButton(
                onPressed: () => context.go('/groups'),
                child: const Text('Manage', style: TextStyle(fontSize: 12)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (groups.isEmpty)
            Text(
              'No groups created yet.',
              style: TextStyle(fontSize: 12, color: isDark ? AppColors.darkTextMuted : AppColors.textMuted),
            )
          else
            ...groups.take(4).map((g) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6.0),
                  child: InkWell(
                    onTap: () => context.push('/groups/details/${g.id}'),
                    borderRadius: BorderRadius.circular(8),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppColors.secondary.withValues(alpha: isDark ? 0.2 : 0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Icon(Icons.groups_rounded, size: 14, color: AppColors.secondary),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            g.name,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                            ),
                          ),
                        ),
                        Text(
                          '${g.memberCount} members',
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                )),
        ],
      ),
    );
  }
}

class _StatMetricCard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;
  final IconData icon;
  final Color accentColor;
  final VoidCallback? onTap;

  const _StatMetricCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.accentColor,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AppCard(
      onTap: onTap,
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.3,
                    color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: accentColor.withValues(alpha: isDark ? 0.2 : 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: accentColor, size: 15),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 11,
              color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Text(
                'Explore',
                style: TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.primaryLight : AppColors.primary,
                ),
              ),
              const SizedBox(width: 3),
              Icon(
                Icons.arrow_forward_rounded,
                size: 11,
                color: isDark ? AppColors.primaryLight : AppColors.primary,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

