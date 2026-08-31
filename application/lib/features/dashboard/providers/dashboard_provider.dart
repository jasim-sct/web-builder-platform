import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../alerts/providers/alerts_provider.dart';
import '../../groups/providers/groups_provider.dart';
import '../../users/providers/users_provider.dart';

class DashboardMetrics {
  final int totalUsers;
  final int totalGroups;
  final int activeAlerts;
  final int todayAlerts;

  const DashboardMetrics({
    this.totalUsers = 0,
    this.totalGroups = 0,
    this.activeAlerts = 0,
    this.todayAlerts = 0,
  });
}

final dashboardMetricsProvider = Provider<DashboardMetrics>((ref) {
  final users = ref.watch(usersProvider).users;
  final groups = ref.watch(groupsProvider).groups;
  final alerts = ref.watch(alertsProvider).alerts;

  final now = DateTime.now();
  final todayStart = DateTime(now.year, now.month, now.day);
  final todayEnd = todayStart.add(const Duration(days: 1));

  final activeCount = alerts.where((a) => a.isEnabled && a.status == 'SCHEDULED').length;
  final todayCount = alerts.where((a) {
    final alertDate = (a.lastTriggeredAt ?? a.scheduledAt).toLocal();
    return alertDate.isAfter(todayStart) && alertDate.isBefore(todayEnd);
  }).length;

  return DashboardMetrics(
    totalUsers: users.length,
    totalGroups: groups.length,
    activeAlerts: activeCount,
    todayAlerts: todayCount,
  );
});
