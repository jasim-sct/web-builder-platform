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
    final org = ref.watch(authProvider).organization;
    final myGroups = ref.watch(memberAssignedGroupsProvider);
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
                // Header Greeting
                Row(
                  children: [
                    CircleAvatar(
                      radius: isDesktop ? 24 : 20,
                      backgroundColor: AppColors.primary,
                      child: Text(
                        user?.name.isNotEmpty == true ? user!.name[0].toUpperCase() : '?',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 16),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${_getGreeting()}, ${user?.name ?? 'Member'}',
                            style: TextStyle(
                              fontSize: isDesktop ? 22 : 18,
                              fontWeight: FontWeight.w700,
                              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                              letterSpacing: -0.4,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${org?.name ?? user?.organizationName ?? 'Organization'} · Participant Portal',
                            style: TextStyle(
                              fontSize: 13,
                              color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // My Subscribed Channels / Groups Row
                Text(
                  'My Channels & Groups',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 10),

                if (myGroups.isEmpty)
                  AppCard(
                    padding: const EdgeInsets.all(14),
                    child: Row(
                      children: [
                        Icon(Icons.info_outline_rounded,
                            color: isDark ? AppColors.darkTextMuted : AppColors.textMuted, size: 18),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'You have not been assigned to any groups yet.',
                            style: TextStyle(
                              fontSize: 13,
                              color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: myGroups.map((g) {
                      return InkWell(
                        onTap: () => context.push('/groups/details/${g.id}'),
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isDark ? AppColors.darkSurfaceVariant : AppColors.surface,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isDark ? AppColors.darkBorder : AppColors.border,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.groups_rounded, size: 15, color: AppColors.secondary),
                              const SizedBox(width: 6),
                              Text(
                                g.name,
                                style: TextStyle(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w600,
                                  color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                const SizedBox(height: 28),

                // Imminent / Next Alert Feature Card (Hero)
                upcomingAsync.when(
                  data: (list) {
                    if (list.isEmpty) return const SizedBox.shrink();
                    final nextAlert = list.first;
                    final isUrgent = nextAlert.isUrgent;

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Next Active Alert',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 10),
                        AppCard(
                          onTap: () => context.push('/alerts/details/${nextAlert.id}'),
                          color: isUrgent
                              ? (isDark ? AppColors.darkPriorityUrgentBg : AppColors.priorityUrgentBg)
                              : (isDark ? AppColors.darkPriorityNormalBg : AppColors.priorityNormalBg),
                          border: BorderSide(
                            color: isUrgent ? AppColors.error : AppColors.primaryLight,
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
                                        color: isUrgent ? AppColors.error : AppColors.primaryLight,
                                        size: 20,
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        DateFormatter.formatTime(
                                            nextAlert.nextTriggerAt ?? nextAlert.scheduledAt),
                                        style: TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w700,
                                          color: isUrgent
                                              ? AppColors.error
                                              : (isDark ? AppColors.darkTextPrimary : AppColors.primary),
                                        ),
                                      ),
                                    ],
                                  ),
                                  PriorityBadge(priority: nextAlert.priority),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Text(
                                nextAlert.title,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                nextAlert.message,
                                style: TextStyle(
                                  fontSize: 13.5,
                                  color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                                ),
                              ),
                              const SizedBox(height: 14),
                              Row(
                                children: [
                                  Icon(
                                    Icons.groups_outlined,
                                    size: 15,
                                    color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    nextAlert.groupName ?? 'Target Channel',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                                    ),
                                  ),
                                  const Spacer(),
                                  AppButton(
                                    label: 'View Details',
                                    variant: AppButtonVariant.outline,
                                    size: AppButtonSize.small,
                                    onPressed: () =>
                                        context.push('/alerts/details/${nextAlert.id}'),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 28),
                      ],
                    );
                  },
                  loading: () => const SizedBox.shrink(),
                  error: (_, __) => const SizedBox.shrink(),
                ),

                // Upcoming Alerts List Section
                Text(
                  'Upcoming Reminders',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 10),

                upcomingAsync.when(
                  data: (list) {
                    if (list.isEmpty) {
                      return AppCard(
                        padding: const EdgeInsets.all(32),
                        child: const EmptyState(
                          title: 'You are all caught up!',
                          subtitle: 'No upcoming alerts scheduled for your groups.',
                          icon: Icons.check_circle_outline_rounded,
                        ),
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
                  loading: () => Column(
                    children: const [
                      SkeletonLoader(width: double.infinity, height: 80),
                      SizedBox(height: 10),
                      SkeletonLoader(width: double.infinity, height: 80),
                    ],
                  ),
                  error: (err, _) => Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text('Error loading alerts: $err',
                        style: const TextStyle(color: AppColors.error)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

