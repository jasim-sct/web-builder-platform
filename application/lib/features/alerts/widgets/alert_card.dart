import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../models/alert.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/priority_badge.dart';
import '../../../shared/widgets/status_badge.dart';

class AlertCard extends StatelessWidget {
  final Alert alert;
  final VoidCallback? onTap;
  final VoidCallback? onAcknowledge;
  final VoidCallback? onTrigger;
  final bool isMemberView;

  const AlertCard({
    super.key,
    required this.alert,
    this.onTap,
    this.onAcknowledge,
    this.onTrigger,
    this.isMemberView = false,
  });

  @override
  Widget build(BuildContext context) {
    final isUrgent = alert.isUrgent;

    return AppCard(
      onTap: onTap,
      border: isUrgent
          ? BorderSide(color: AppColors.error.withOpacity(0.6), width: 1.5)
          : null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Priority + Status + Repeat
          Row(
            children: [
              PriorityBadge(priority: alert.priority),
              const SizedBox(width: 8),
              if (alert.repeatType != 'ONCE') ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceVariant,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.repeat_rounded, size: 12, color: AppColors.textSecondary),
                      const SizedBox(width: 3),
                      Text(
                        alert.repeatType,
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
              ],
              const Spacer(),
              StatusBadge(status: alert.status),
            ],
          ),
          const SizedBox(height: 12),

          // Title & Message
          Text(
            alert.title,
            style: AppTextStyles.headingSmall.copyWith(
              color: isUrgent ? AppColors.error : AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            alert.message,
            style: AppTextStyles.bodyMedium,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 12),

          // Target Group & Time Footer
          Row(
            children: [
              const Icon(Icons.group_outlined, size: 16, color: AppColors.textMuted),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  alert.groupName ?? 'Target Group',
                  style: AppTextStyles.bodySmall.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const Icon(Icons.schedule_rounded, size: 15, color: AppColors.textMuted),
              const SizedBox(width: 4),
              Text(
                DateFormatter.formatAlertDateTime(alert.nextTriggerAt ?? alert.scheduledAt),
                style: AppTextStyles.bodySmall,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
