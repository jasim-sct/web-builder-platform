import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({
    super.key,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;

    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'ACKNOWLEDGED':
        bg = AppColors.successBg;
        fg = AppColors.success;
        break;
      case 'TRIGGERED':
        bg = AppColors.priorityUrgentBg;
        fg = AppColors.priorityUrgent;
        break;
      case 'DISABLED':
      case 'CANCELLED':
        bg = AppColors.surfaceVariant;
        fg = AppColors.textMuted;
        break;
      case 'SCHEDULED':
      case 'DELIVERED':
      default:
        bg = AppColors.priorityNormalBg;
        fg = AppColors.priorityNormal;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          color: fg,
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.2,
        ),
      ),
    );
  }
}
