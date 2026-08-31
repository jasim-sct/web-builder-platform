import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class PriorityBadge extends StatelessWidget {
  final String priority;
  final bool showIcon;

  const PriorityBadge({
    super.key,
    required this.priority,
    this.showIcon = true,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color bg;
    Color fg;
    Color border;
    IconData icon;

    switch (priority.toUpperCase()) {
      case 'URGENT':
        bg = isDark ? AppColors.darkPriorityUrgentBg : AppColors.priorityUrgentBg;
        fg = AppColors.priorityUrgent;
        border = isDark ? AppColors.priorityUrgent.withValues(alpha: 0.3) : AppColors.priorityUrgentBorder;
        icon = Icons.warning_amber_rounded;
        break;
      case 'HIGH':
        bg = isDark ? AppColors.darkPriorityHighBg : AppColors.priorityHighBg;
        fg = AppColors.priorityHigh;
        border = isDark ? AppColors.priorityHigh.withValues(alpha: 0.3) : AppColors.priorityHighBorder;
        icon = Icons.error_outline_rounded;
        break;
      case 'LOW':
        bg = isDark ? AppColors.darkPriorityLowBg : AppColors.priorityLowBg;
        fg = isDark ? AppColors.darkTextSecondary : AppColors.priorityLow;
        border = isDark ? AppColors.darkBorder : AppColors.priorityLowBorder;
        icon = Icons.info_outline_rounded;
        break;
      case 'NORMAL':
      default:
        bg = isDark ? AppColors.darkPriorityNormalBg : AppColors.priorityNormalBg;
        fg = isDark ? AppColors.primaryLight : AppColors.priorityNormal;
        border = isDark ? AppColors.primaryLight.withValues(alpha: 0.3) : AppColors.priorityNormalBorder;
        icon = Icons.notifications_none_rounded;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: border, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon) ...[
            Icon(icon, size: 12, color: fg),
            const SizedBox(width: 4),
          ],
          Text(
            priority.toUpperCase(),
            style: TextStyle(
              color: fg,
              fontSize: 10.5,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }
}

