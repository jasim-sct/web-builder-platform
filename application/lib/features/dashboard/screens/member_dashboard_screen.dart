import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../shared/empty_states/empty_state.dart';
import '../../../shared/loading/loading_view.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/priority_badge.dart';
import '../../alerts/providers/alerts_provider.dart';
import '../../alerts/widgets/alert_card.dart';
import '../../auth/providers/auth_provider.dart';
import '../../groups/providers/groups_provider.dart';

class MemberDashboardScreen extends ConsumerWidget {
  const MemberDashboardScreen({super.key});

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  Future<void> _refreshAll(WidgetRef ref) async {
    ref.invalidate(upcomingAlertsProvider);
    await ref.read(groupsProvider.notifier).fetchGroups();
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final myGroups = ref.watch(memberAssignedGroupsProvider);
    final upcomingAsync = ref.watch(upcomingAlertsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${_getGreeting()}, ${user?.name ?? 'Member'}', style: AppTextStyles.headingSmall),
            Text(
              user?.organizationName ?? 'Organization Participant',
              style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => _refreshAll(ref),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // My Groups Section
              Text('My Groups', style: AppTextStyles.headingSmall),
              const SizedBox(height: 10),

              if (myGroups.isEmpty)
                AppCard(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline, color: AppColors.textMuted, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'You have not been added to any groups yet.',
                          style: AppTextStyles.bodySmall,
                        ),
                      ),
                    ],
                  ),
                )
              else
                SizedBox(
                  height: 44,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: myGroups.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      final group = myGroups[index];
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.group_outlined, size: 16, color: AppColors.primary),
                            const SizedBox(width: 6),
                            Text(group.name, style: AppTextStyles.labelMedium),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              const SizedBox(height: 24),

              // Imminent / Next Alert Feature Card
              upcomingAsync.when(
                data: (list) {
                  if (list.isEmpty) return const SizedBox.shrink();
                  final nextAlert = list.first;

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Next Alert', style: AppTextStyles.headingSmall),
                      const SizedBox(height: 10),
                      AppCard(
                        color: nextAlert.isUrgent
                            ? AppColors.priorityUrgentBg
                            : AppColors.surface,
                        border: BorderSide(
                          color: nextAlert.isUrgent ? AppColors.error : AppColors.primaryLight,
                          width: 1.5,
                        ),
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      Icons.alarm_on_rounded,
                                      color: nextAlert.isUrgent ? AppColors.error : AppColors.primary,
                                      size: 22,
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      DateFormatter.formatTime(nextAlert.nextTriggerAt ?? nextAlert.scheduledAt),
                                      style: AppTextStyles.headingMedium.copyWith(
                                        color: nextAlert.isUrgent ? AppColors.error : AppColors.primary,
                                      ),
                                    ),
                                  ],
                                ),
                                PriorityBadge(priority: nextAlert.priority),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(nextAlert.title, style: AppTextStyles.headingSmall),
                            const SizedBox(height: 4),
                            Text(nextAlert.message, style: AppTextStyles.bodyMedium),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                const Icon(Icons.groups_outlined, size: 16, color: AppColors.textMuted),
                                const SizedBox(width: 6),
                                Text(
                                  nextAlert.groupName ?? 'Target Group',
                                  style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            AppButton(
                              label: 'View Details',
                              variant: AppButtonVariant.outline,
                              width: double.infinity,
                              onPressed: () => context.push('/alerts/details/${nextAlert.id}'),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  );
                },
                loading: () => const SizedBox.shrink(),
                error: (_, __) => const SizedBox.shrink(),
              ),

              // Upcoming Alerts List
              Text('Upcoming', style: AppTextStyles.headingSmall),
              const SizedBox(height: 10),

              upcomingAsync.when(
                data: (list) {
                  if (list.isEmpty) {
                    return const EmptyState(
                      title: 'No upcoming alerts',
                      subtitle: 'You are all caught up!',
                      icon: Icons.check_circle_outline_rounded,
                    );
                  }
                  return ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: list.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final alert = list[index];
                      return AlertCard(
                        alert: alert,
                        isMemberView: true,
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
