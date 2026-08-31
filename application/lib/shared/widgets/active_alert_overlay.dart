import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/alert.dart';
import 'app_button.dart';
import 'priority_badge.dart';

class ActiveAlertOverlay extends StatelessWidget {
  final Alert alert;
  final VoidCallback onAcknowledge;
  final VoidCallback onDismiss;
  final bool isAcknowledging;

  const ActiveAlertOverlay({
    super.key,
    required this.alert,
    required this.onAcknowledge,
    required this.onDismiss,
    this.isAcknowledging = false,
  });

  @override
  Widget build(BuildContext context) {
    final isUrgent = alert.isUrgent;

    return Material(
      color: Colors.black.withOpacity(0.75),
      child: SafeArea(
        child: Center(
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 24),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: isUrgent ? AppColors.error : AppColors.primary,
                width: 2.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: (isUrgent ? AppColors.error : AppColors.primary).withOpacity(0.3),
                  blurRadius: 30,
                  spreadRadius: 4,
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Top Bell / Urgent Icon
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isUrgent ? AppColors.priorityUrgentBg : AppColors.priorityNormalBg,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isUrgent ? Icons.warning_rounded : Icons.notifications_active_rounded,
                    size: 40,
                    color: isUrgent ? AppColors.error : AppColors.primary,
                  ),
                ),
                const SizedBox(height: 16),

                // Title
                Text(
                  alert.title.toUpperCase(),
                  style: AppTextStyles.headingMedium.copyWith(
                    color: isUrgent ? AppColors.error : AppColors.textPrimary,
                    letterSpacing: 0.5,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),

                // Message
                Text(
                  alert.message,
                  style: AppTextStyles.bodyLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                const Divider(),
                const SizedBox(height: 12),

                // Group & Priority Details
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('TARGET GROUP', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textMuted)),
                        const SizedBox(height: 2),
                        Text(
                          alert.groupName ?? 'Your Group',
                          style: AppTextStyles.labelMedium,
                        ),
                      ],
                    ),
                    PriorityBadge(priority: alert.priority),
                  ],
                ),
                const SizedBox(height: 12),

                // Time
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    DateFormatter.formatAlertDateTime(alert.lastTriggeredAt ?? alert.scheduledAt),
                    style: AppTextStyles.bodySmall,
                  ),
                ),
                const SizedBox(height: 24),

                // Acknowledge Button
                AppButton(
                  label: 'ACKNOWLEDGE',
                  icon: Icons.check_circle_outline_rounded,
                  variant: isUrgent ? AppButtonVariant.danger : AppButtonVariant.primary,
                  width: double.infinity,
                  isLoading: isAcknowledging,
                  onPressed: onAcknowledge,
                ),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: onDismiss,
                  child: const Text('Dismiss for now', style: TextStyle(color: AppColors.textMuted)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
