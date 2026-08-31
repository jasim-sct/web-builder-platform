import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
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

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${_getGreeting()}, ${user?.name ?? 'Admin'}', style: AppTextStyles.headingSmall),
            Text(
              org?.name ?? user?.organizationName ?? 'Organization Dashboard',
              style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.campaign_rounded, color: AppColors.error),
            tooltip: 'Broadcast Now',
            onPressed: () => context.push('/alerts/broadcast'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => _refreshAll(ref),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Overview Header
              Text('Overview', style: AppTextStyles.headingSmall),
              const SizedBox(height: 12),

              // Metrics Grid
              Row(
                children: [
                  Expanded(
                    child: _MetricCard(
                      label: 'Users',
                      value: metrics.totalUsers.toString(),
                      icon: Icons.people_outline_rounded,
                      color: AppColors.primary,
                      onTap: () => context.go('/users'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _MetricCard(
                      label: 'Groups',
                      value: metrics.totalGroups.toString(),
                      icon: Icons.groups_outlined,
                      color: AppColors.secondary,
                      onTap: () => context.go('/groups'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _MetricCard(
                      label: 'Active Alerts',
                      value: metrics.activeAlerts.toString(),
                      icon: Icons.alarm_rounded,
                      color: AppColors.priorityNormal,
                      onTap: () => context.go('/alerts'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _MetricCard(
                      label: 'Today',
                      value: metrics.todayAlerts.toString(),
                      icon: Icons.calendar_today_outlined,
                      color: AppColors.priorityHigh,
                      onTap: () => context.go('/alerts'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 28),

              // Quick Actions
              Text('Quick Actions', style: AppTextStyles.headingSmall),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  AppButton(
                    label: '+ Add User',
                    icon: Icons.person_add_outlined,
                    variant: AppButtonVariant.outline,
                    onPressed: () => context.push('/users/new'),
                  ),
                  AppButton(
                    label: '+ Create Group',
                    icon: Icons.group_add_outlined,
                    variant: AppButtonVariant.outline,
                    onPressed: () => context.push('/groups/new'),
                  ),
                  AppButton(
                    label: '+ Create Alert',
                    icon: Icons.add_alert_outlined,
                    variant: AppButtonVariant.primary,
                    onPressed: () => context.push('/alerts/new'),
                  ),
                  AppButton(
                    label: 'Broadcast Now',
                    icon: Icons.campaign_outlined,
                    variant: AppButtonVariant.danger,
                    onPressed: () => context.push('/alerts/broadcast'),
                  ),
                ],
              ),
              const SizedBox(height: 28),

              // Upcoming Alerts Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Upcoming Alerts', style: AppTextStyles.headingSmall),
                  TextButton(
                    onPressed: () => context.go('/alerts'),
                    child: const Text('View All'),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              upcomingAsync.when(
                data: (upcomingList) {
                  if (upcomingList.isEmpty) {
                    return const EmptyState(
                      title: 'No upcoming alerts',
                      subtitle: 'Create a scheduled alert or broadcast to groups.',
                      icon: Icons.notifications_off_outlined,
                    );
                  }
                  return ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: upcomingList.take(4).length,
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
                loading: () => const SizedBox(
                  height: 140,
                  child: LoadingView(message: 'Loading upcoming alerts...'),
                ),
                error: (err, _) => Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text('Error loading alerts: $err', style: const TextStyle(color: AppColors.error)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final VoidCallback? onTap;

  const _MetricCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: AppTextStyles.headingMedium.copyWith(color: AppColors.textPrimary),
              ),
              Text(
                label,
                style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.w500),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
