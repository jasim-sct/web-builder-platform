import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class PriorityBadge extends StatelessWidget {
  final String priority;

  const PriorityBadge({
    super.key,
    required this.priority,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    IconData icon;

    switch (priority.toUpperCase()) {
      case 'URGENT':
        bg = AppColors.priorityUrgentBg;
        fg = AppColors.priorityUrgent;
        icon = Icons.warning_rounded;
        break;
      case 'HIGH':
        bg = AppColors.priorityHighBg;
        fg = AppColors.priorityHigh;
        icon = Icons.error_outline_rounded;
        break;
      case 'LOW':
        bg = AppColors.priorityLowBg;
        fg = AppColors.priorityLow;
        icon = Icons.info_outline_rounded;
        break;
      case 'NORMAL':
      default:
        bg = AppColors.priorityNormalBg;
        fg = AppColors.priorityNormal;
        icon = Icons.notifications_none_rounded;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: fg.withOpacity(0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: fg),
          const SizedBox(width: 4),
          Text(
            priority.toUpperCase(),
            style: TextStyle(
              color: fg,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }
}
