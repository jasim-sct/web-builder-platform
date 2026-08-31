import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final bool showDot;

  const StatusBadge({
    super.key,
    required this.status,
    this.showDot = true,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color bg;
    Color fg;
    Color dot;

    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'ACKNOWLEDGED':
        bg = isDark ? AppColors.darkSuccessBg : AppColors.successBg;
        fg = AppColors.success;
        dot = AppColors.success;
        break;
      case 'TRIGGERED':
        bg = isDark ? AppColors.darkPriorityUrgentBg : AppColors.priorityUrgentBg;
        fg = AppColors.priorityUrgent;
        dot = AppColors.priorityUrgent;
        break;
      case 'DISABLED':
      case 'CANCELLED':
        bg = isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant;
        fg = isDark ? AppColors.darkTextMuted : AppColors.textMuted;
        dot = isDark ? AppColors.darkTextMuted : AppColors.textMuted;
        break;
      case 'SCHEDULED':
      case 'DELIVERED':
      default:
        bg = isDark ? AppColors.darkPriorityNormalBg : AppColors.priorityNormalBg;
        fg = isDark ? AppColors.primaryLight : AppColors.priorityNormal;
        dot = isDark ? AppColors.primaryLight : AppColors.priorityNormal;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showDot) ...[
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                color: dot,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 5),
          ],
          Text(
            status.toUpperCase(),
            style: TextStyle(
              color: fg,
              fontSize: 10.5,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }
}

