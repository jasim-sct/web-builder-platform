import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isUrgent = alert.isUrgent;

    BorderSide? customBorder;
    if (isUrgent) {
      customBorder = BorderSide(
        color: AppColors.error.withValues(alpha: isDark ? 0.6 : 0.4),
        width: 1.5,
      );
    }

    return AppCard(
      onTap: onTap,
      border: customBorder,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Priority + Repeat Type + Status
          Row(
            children: [
              PriorityBadge(priority: alert.priority),
              const SizedBox(width: 8),
              if (alert.repeatType != 'ONCE') ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.repeat_rounded,
                        size: 11,
                        color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                      ),
                      const SizedBox(width: 3),
                      Text(
                        alert.repeatType,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                        ),
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

          // Title
          Text(
            alert.title,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: isUrgent
                  ? AppColors.error
                  : (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
              letterSpacing: -0.2,
            ),
          ),
          const SizedBox(height: 4),

          // Message
          Text(
            alert.message,
            style: TextStyle(
              fontSize: 13,
              color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
              height: 1.4,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 14),

          // Footer Info (Target Group, Next Trigger)
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () {
                    if (alert.groupId.isNotEmpty) {
                      context.push('/groups/details/${alert.groupId}');
                    }
                  },
                  borderRadius: BorderRadius.circular(4),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.groups_outlined,
                        size: 14,
                        color: isDark ? AppColors.primaryLight : AppColors.primary,
                      ),
                      const SizedBox(width: 4),
                      Flexible(
                        child: Text(
                          alert.groupName ?? 'Target Group',
                          style: TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                            color: isDark ? AppColors.primaryLight : AppColors.primary,
                            decoration: TextDecoration.underline,
                            decorationColor: (isDark ? AppColors.primaryLight : AppColors.primary).withValues(alpha: 0.5),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Icon(
                Icons.schedule_rounded,
                size: 13,
                color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
              ),
              const SizedBox(width: 4),
              Text(
                DateFormatter.formatAlertDateTime(
                  alert.nextTriggerAt ?? alert.scheduledAt,
                ),
                style: TextStyle(
                  fontSize: 11,
                  color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

