import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../models/alert.dart';
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
      message: 'This will immediately notify all current members of "${alert.groupName ?? 'Target Group'}".',
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

    return Scaffold(
      appBar: AppBar(
        title: const Text('Alert Details'),
        actions: [
          if (isAdmin)
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              tooltip: 'Edit Alert',
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => EditAlertScreen(alert: alert)),
                );
              },
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Info Card
            AppCard(
              padding: const EdgeInsets.all(20),
              border: alert.isUrgent
                  ? BorderSide(color: AppColors.error.withOpacity(0.6), width: 1.5)
                  : null,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      PriorityBadge(priority: alert.priority),
                      const SizedBox(width: 8),
                      StatusBadge(status: alert.status),
                      const Spacer(),
                      if (isAdmin)
                        Switch(
                          value: alert.isEnabled,
                          activeColor: AppColors.primary,
                          onChanged: _isActionLoading ? null : (_) => _handleToggleEnable(alert),
                        ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    alert.title,
                    style: AppTextStyles.headingMedium.copyWith(
                      color: alert.isUrgent ? AppColors.error : AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(alert.message, style: AppTextStyles.bodyLarge),
                  const SizedBox(height: 18),
                  const Divider(),
                  const SizedBox(height: 12),

                  _DetailRow(label: 'Target Group', value: alert.groupName ?? 'Group'),
                  _DetailRow(
                    label: 'Scheduled Time',
                    value: DateFormatter.formatAlertDateTime(alert.scheduledAt),
                  ),
                  _DetailRow(label: 'Repeat Type', value: alert.repeatType),
                  if (alert.lastTriggeredAt != null)
                    _DetailRow(
                      label: 'Last Triggered',
                      value: DateFormatter.formatAlertDateTime(alert.lastTriggeredAt),
                    ),
                  if (alert.nextTriggerAt != null)
                    _DetailRow(
                      label: 'Next Trigger',
                      value: DateFormatter.formatAlertDateTime(alert.nextTriggerAt),
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
                      label: 'Trigger Now',
                      icon: Icons.campaign_rounded,
                      variant: AppButtonVariant.primary,
                      isLoading: _isActionLoading,
                      onPressed: alert.isEnabled ? () => _handleTrigger(alert) : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  AppButton(
                    label: 'Delete',
                    icon: Icons.delete_outline_rounded,
                    variant: AppButtonVariant.danger,
                    onPressed: () => _handleDelete(alert),
                  ),
                ],
              ),
              const SizedBox(height: 24),
            ] else ...[
              AppButton(
                label: 'Acknowledge Receipt',
                icon: Icons.check_circle_outline_rounded,
                variant: AppButtonVariant.primary,
                width: double.infinity,
                isLoading: _isActionLoading,
                onPressed: () => _handleAcknowledge(alert),
              ),
              const SizedBox(height: 24),
            ],

            // Deliveries Section
            Text('Delivery & Acknowledgement Status', style: AppTextStyles.headingSmall),
            const SizedBox(height: 10),

            deliveriesAsync.when(
              data: (deliveries) {
                if (deliveries.isEmpty) {
                  return AppCard(
                    padding: const EdgeInsets.all(16),
                    child: const Center(
                      child: Text(
                        'No delivery records yet. Alert will record participant deliveries when triggered.',
                        style: AppTextStyles.bodySmall,
                        textAlign: TextAlign.center,
                      ),
                    ),
                  );
                }

                return ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: deliveries.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 6),
                  itemBuilder: (context, index) {
                    final item = deliveries[index];
                    final isAck = item.isAcknowledged;

                    return AppCard(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      child: Row(
                        children: [
                          Icon(
                            isAck ? Icons.check_circle_rounded : Icons.mark_email_read_outlined,
                            color: isAck ? AppColors.success : AppColors.primary,
                            size: 20,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item.user?.name ?? 'Participant', style: AppTextStyles.labelMedium),
                                Text(
                                  isAck
                                      ? 'Acknowledged at ${DateFormatter.formatAlertDateTime(item.acknowledgedAt)}'
                                      : 'Delivered at ${DateFormatter.formatAlertDateTime(item.deliveredAt)}',
                                  style: AppTextStyles.bodySmall,
                                ),
                              ],
                            ),
                          ),
                          StatusBadge(status: item.status),
                        ],
                      ),
                    );
                  },
                );
              },
              loading: () => const SizedBox(height: 100, child: LoadingView(message: 'Loading deliveries...')),
              error: (err, _) => Text('Error loading deliveries: $err', style: const TextStyle(color: AppColors.error)),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
          Text(value, style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
