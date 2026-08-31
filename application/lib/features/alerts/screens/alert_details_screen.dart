import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/layout/responsive_layout.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../models/alert.dart';
import '../../../shared/empty_states/empty_state.dart';
import '../../../shared/loading/loading_view.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/confirmation_dialog.dart';
import '../../../shared/widgets/priority_badge.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/alerts_provider.dart';
import 'edit_alert_screen.dart';

class AlertDetailsScreen extends ConsumerStatefulWidget {
  final String alertId;

  const AlertDetailsScreen({super.key, required this.alertId});

  @override
  ConsumerState<AlertDetailsScreen> createState() => _AlertDetailsScreenState();
}

class _AlertDetailsScreenState extends ConsumerState<AlertDetailsScreen> {
  bool _isActionLoading = false;

  Future<void> _handleTrigger(Alert alert) async {
    final confirmed = await ConfirmationDialog.show(
      context,
      title: 'Broadcast this alert now?',
      message: 'This will immediately notify all current members of "${alert.groupName ?? 'Target Channel'}".',
      confirmLabel: 'Broadcast Now',
      isDangerous: alert.isUrgent,
    );

    if (confirmed == true) {
      setState(() => _isActionLoading = true);
      try {
        final res = await ref.read(alertsProvider.notifier).triggerAlert(alert.id);
        final count = res['recipientCount'] ?? 0;
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Alert broadcast successfully. $count participants notified.'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
          );
        }
      } finally {
        if (mounted) setState(() => _isActionLoading = false);
      }
    }
  }

  Future<void> _handleToggleEnable(Alert alert) async {
    setState(() => _isActionLoading = true);
    try {
      await ref.read(alertsProvider.notifier).toggleAlertEnabled(alert.id, !alert.isEnabled);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _isActionLoading = false);
    }
  }

  Future<void> _handleDelete(Alert alert) async {
    final confirmed = await ConfirmationDialog.show(
      context,
      title: 'Delete Alert?',
      message: 'Are you sure you want to permanently delete this alert and its delivery records?',
      confirmLabel: 'Delete',
      isDangerous: true,
    );

    if (confirmed == true) {
      await ref.read(alertsProvider.notifier).deleteAlert(alert.id);
      if (mounted) context.pop();
    }
  }

  Future<void> _handleAcknowledge(Alert alert) async {
    setState(() => _isActionLoading = true);
    try {
      await ref.read(alertsProvider.notifier).acknowledgeAlert(alert.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Alert acknowledged ✓'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _isActionLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final alertsState = ref.watch(alertsProvider);
    final alert = alertsState.alerts.firstWhere(
      (a) => a.id == widget.alertId,
      orElse: () => Alert(
        id: widget.alertId,
        title: 'Alert Details',
        message: '',
        organizationId: '',
        groupId: '',
        scheduledAt: DateTime.now(),
      ),
    );

    final isAdmin = ref.watch(authProvider).isAdmin;
    final deliveriesAsync = ref.watch(alertDeliveriesProvider(widget.alertId));
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      appBar: AppBar(
        title: const Text('Alert Workspace'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        actions: [
          if (isAdmin) ...[
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              tooltip: 'Edit Alert',
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => EditAlertScreen(alert: alert)),
                );
              },
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded, color: AppColors.error),
              tooltip: 'Delete Alert',
              onPressed: () => _handleDelete(alert),
            ),
          ],
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: ResponsiveContainer(
          maxWidth: 960,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Primary Overview Card
              AppCard(
                padding: const EdgeInsets.all(24),
                border: alert.isUrgent
                    ? BorderSide(
                        color: AppColors.error.withValues(alpha: isDark ? 0.6 : 0.4),
                        width: 1.5,
                      )
                    : null,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header badges & enable switch
                    Row(
                      children: [
                        PriorityBadge(priority: alert.priority),
                        const SizedBox(width: 8),
                        StatusBadge(status: alert.status),
                        const Spacer(),
                        if (isAdmin) ...[
                          Text(
                            alert.isEnabled ? 'Enabled' : 'Disabled',
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Switch(
                            value: alert.isEnabled,
                            activeThumbColor: isDark ? AppColors.primaryLight : AppColors.primary,
                            onChanged: _isActionLoading ? null : (_) => _handleToggleEnable(alert),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Title
                    Text(
                      alert.title,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: alert.isUrgent
                            ? AppColors.error
                            : (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
                        letterSpacing: -0.4,
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Message Box
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        alert.message,
                        style: TextStyle(
                          fontSize: 14,
                          height: 1.45,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Divider(),
                    const SizedBox(height: 14),

                    // Metadata Key-Values
                    _DetailRow(
                      label: 'Target Channel',
                      value: alert.groupName ?? 'Target Channel',
                      icon: Icons.groups_rounded,
                      isDark: isDark,
                      onTap: alert.groupId.isNotEmpty
                          ? () => context.push('/groups/details/${alert.groupId}')
                          : null,
                    ),
                    _DetailRow(
                      label: 'Scheduled Trigger',
                      value: DateFormatter.formatAlertDateTime(alert.scheduledAt),
                      icon: Icons.schedule_rounded,
                      isDark: isDark,
                    ),
                    _DetailRow(
                      label: 'Recurrence Pattern',
                      value: alert.repeatType,
                      icon: Icons.repeat_rounded,
                      isDark: isDark,
                    ),
                    if (alert.lastTriggeredAt != null)
                      _DetailRow(
                        label: 'Last Broadcast',
                        value: DateFormatter.formatAlertDateTime(alert.lastTriggeredAt),
                        icon: Icons.campaign_rounded,
                        isDark: isDark,
                      ),
                    if (alert.nextTriggerAt != null)
                      _DetailRow(
                        label: 'Next Scheduled Occurrence',
                        value: DateFormatter.formatAlertDateTime(alert.nextTriggerAt),
                        icon: Icons.alarm_rounded,
                        isDark: isDark,
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Action Buttons
              if (isAdmin) ...[
                Row(
                  children: [
                    Expanded(
                      child: AppButton(
                        label: 'Broadcast Now',
                        icon: Icons.campaign_rounded,
                        variant: alert.isUrgent ? AppButtonVariant.danger : AppButtonVariant.primary,
                        size: AppButtonSize.large,
                        isLoading: _isActionLoading,
                        onPressed: alert.isEnabled ? () => _handleTrigger(alert) : null,
                      ),
                    ),
                  ],
                ),
              ] else ...[
                AppButton(
                  label: 'Acknowledge Receipt',
                  icon: Icons.check_circle_outline_rounded,
                  variant: AppButtonVariant.primary,
                  size: AppButtonSize.large,
                  width: double.infinity,
                  isLoading: _isActionLoading,
                  onPressed: () => _handleAcknowledge(alert),
                ),
              ],
              const SizedBox(height: 28),

              // Delivery & Acknowledgment Log Section
              Text(
                'Delivery & Audit Log',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 10),

              deliveriesAsync.when(
                data: (deliveries) {
                  if (deliveries.isEmpty) {
                    return AppCard(
                      padding: const EdgeInsets.all(24),
                      child: EmptyState(
                        title: 'No delivery logs recorded yet',
                        subtitle: 'When this alert triggers, real-time participant delivery & acknowledgment records will appear here.',
                        icon: Icons.mark_email_read_outlined,
                      ),
                    );
                  }

                  final ackCount = deliveries.where((d) => d.isAcknowledged).length;
                  final total = deliveries.length;
                  final ackRate = total > 0 ? (ackCount / total * 100).toStringAsFixed(0) : '0';

                  return Column(
                    children: [
                      // Rate Summary Card
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.darkSurface : AppColors.surface,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isDark ? AppColors.darkBorder : AppColors.border,
                          ),
                        ),
                        child: Row(
                          children: [
                            Expanded(child: _buildMiniStat('DELIVERED', total.toString(), isDark)),
                            Expanded(child: _buildMiniStat('ACKNOWLEDGED', ackCount.toString(), isDark)),
                            Expanded(child: _buildMiniStat('RESPONSE RATE', '$ackRate%', isDark)),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Deliveries List
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: deliveries.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 6),
                        itemBuilder: (context, index) {
                          final item = deliveries[index];
                          final isAck = item.isAcknowledged;
                          final participantId = item.user?.id ?? item.userId;

                          return AppCard(
                            onTap: participantId.isNotEmpty
                                ? () => context.push('/users/details/$participantId')
                                : null,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            child: Row(
                              children: [
                                Icon(
                                  isAck ? Icons.check_circle_rounded : Icons.mark_email_read_outlined,
                                  color: isAck ? AppColors.success : (isDark ? AppColors.primaryLight : AppColors.primary),
                                  size: 18,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item.user?.name ?? 'Participant',
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                          color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                                        ),
                                      ),
                                      Text(
                                        isAck
                                            ? 'Acknowledged ${DateFormatter.formatAlertDateTime(item.acknowledgedAt)}'
                                            : 'Delivered ${DateFormatter.formatAlertDateTime(item.deliveredAt)}',
                                        style: TextStyle(
                                          fontSize: 11.5,
                                          color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                StatusBadge(status: item.status),
                                if (participantId.isNotEmpty) ...[
                                  const SizedBox(width: 6),
                                  Icon(
                                    Icons.chevron_right_rounded,
                                    size: 16,
                                    color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                                  ),
                                ],
                              ],
                            ),
                          );
                        },
                      ),
                    ],
                  );
                },
                loading: () => const SkeletonLoader(width: double.infinity, height: 120),
                error: (err, _) => Text(
                  'Error loading deliveries: $err',
                  style: const TextStyle(color: AppColors.error),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMiniStat(String label, String value, bool isDark) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.3,
            color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w800,
            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final bool isDark;
  final VoidCallback? onTap;

  const _DetailRow({
    required this.label,
    required this.value,
    required this.icon,
    required this.isDark,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final rowContent = Padding(
      padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
      child: Row(
        children: [
          Icon(icon, size: 16, color: isDark ? AppColors.darkTextMuted : AppColors.textMuted),
          const SizedBox(width: 8),
          Expanded(
            flex: 5,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12.5,
                color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            flex: 5,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Flexible(
                  child: Text(
                    value,
                    textAlign: TextAlign.right,
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: onTap != null
                          ? (isDark ? AppColors.primaryLight : AppColors.primary)
                          : (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
                      decoration: onTap != null ? TextDecoration.underline : null,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (onTap != null) ...[
                  const SizedBox(width: 4),
                  Icon(
                    Icons.arrow_outward_rounded,
                    size: 13,
                    color: isDark ? AppColors.primaryLight : AppColors.primary,
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );

    if (onTap == null) return rowContent;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: rowContent,
    );
  }
}

