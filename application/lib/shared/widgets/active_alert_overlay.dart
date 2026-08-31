import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/alert.dart';
import 'app_button.dart';
import 'priority_badge.dart';

class ActiveAlertOverlay extends StatefulWidget {
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
  State<ActiveAlertOverlay> createState() => _ActiveAlertOverlayState();
}

class _ActiveAlertOverlayState extends State<ActiveAlertOverlay>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulseController;
  late final Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isUrgent = widget.alert.isUrgent;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accentColor = isUrgent ? AppColors.error : AppColors.primaryLight;

    return Material(
      color: Colors.black.withValues(alpha: 0.75),
      child: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkSurface : AppColors.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: accentColor,
                    width: 2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: accentColor.withValues(alpha: 0.25),
                      blurRadius: 32,
                      spreadRadius: 4,
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Animated Alert Icon
                    ScaleTransition(
                      scale: _scaleAnimation,
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: accentColor.withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          isUrgent
                              ? Icons.warning_rounded
                              : Icons.notifications_active_rounded,
                          size: 36,
                          color: accentColor,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Priority Pill
                    PriorityBadge(priority: widget.alert.priority),
                    const SizedBox(height: 12),

                    // Title
                    Text(
                      widget.alert.title.toUpperCase(),
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: isUrgent
                            ? AppColors.error
                            : (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
                        letterSpacing: 0.3,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 10),

                    // Message Box
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: isDark
                            ? AppColors.darkSurfaceVariant
                            : AppColors.surfaceVariant,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        widget.alert.message,
                        style: TextStyle(
                          fontSize: 14,
                          height: 1.45,
                          color: isDark
                              ? AppColors.darkTextPrimary
                              : AppColors.textPrimary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Target Group and Time Metadata
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.groups_outlined,
                              size: 16,
                              color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              widget.alert.groupName ?? 'Target Group',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          DateFormatter.formatAlertDateTime(
                            widget.alert.lastTriggeredAt ?? widget.alert.scheduledAt,
                          ),
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Acknowledge Button
                    AppButton(
                      label: 'ACKNOWLEDGE ALERT',
                      icon: Icons.check_circle_rounded,
                      variant: isUrgent ? AppButtonVariant.danger : AppButtonVariant.primary,
                      size: AppButtonSize.large,
                      width: double.infinity,
                      isLoading: widget.isAcknowledging,
                      onPressed: widget.onAcknowledge,
                    ),
                    const SizedBox(height: 10),

                    // Dismiss for now
                    TextButton(
                      onPressed: widget.onDismiss,
                      child: Text(
                        'Dismiss for now',
                        style: TextStyle(
                          fontSize: 13,
                          color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

