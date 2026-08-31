import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

enum AppButtonVariant { primary, secondary, danger, outline, ghost }
enum AppButtonSize { small, medium, large }

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData? icon;
  final Widget? customIcon;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final double? width;

  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.isLoading = false,
    this.icon,
    this.customIcon,
    this.variant = AppButtonVariant.primary,
    this.size = AppButtonSize.medium,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color bg;
    Color fg;
    BorderSide? border;

    switch (variant) {
      case AppButtonVariant.primary:
        bg = isDark ? AppColors.primaryLight : AppColors.primary;
        fg = Colors.white;
        break;
      case AppButtonVariant.secondary:
        bg = isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant;
        fg = isDark ? AppColors.darkTextPrimary : AppColors.textPrimary;
        break;
      case AppButtonVariant.danger:
        bg = AppColors.error;
        fg = Colors.white;
        break;
      case AppButtonVariant.outline:
        bg = Colors.transparent;
        fg = isDark ? AppColors.darkTextPrimary : AppColors.textPrimary;
        border = BorderSide(
          color: isDark ? AppColors.darkBorder : AppColors.border,
          width: 1,
        );
        break;
      case AppButtonVariant.ghost:
        bg = Colors.transparent;
        fg = isDark ? AppColors.darkTextSecondary : AppColors.textSecondary;
        break;
    }

    double verticalPad;
    double horizontalPad;
    double fontSize;
    double iconSize;

    switch (size) {
      case AppButtonSize.small:
        verticalPad = 8;
        horizontalPad = 12;
        fontSize = 12;
        iconSize = 15;
        break;
      case AppButtonSize.medium:
        verticalPad = 11;
        horizontalPad = 16;
        fontSize = 13.5;
        iconSize = 17;
        break;
      case AppButtonSize.large:
        verticalPad = 14;
        horizontalPad = 22;
        fontSize = 15;
        iconSize = 19;
        break;
    }

    Widget content = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (isLoading)
          SizedBox(
            width: iconSize,
            height: iconSize,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(fg),
            ),
          )
        else ...[
          if (customIcon != null) ...[
            customIcon!,
            const SizedBox(width: 8),
          ] else if (icon != null) ...[
            Icon(icon, size: iconSize, color: fg),
            const SizedBox(width: 8),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.w600,
              color: fg,
              letterSpacing: -0.1,
            ),
          ),
        ],
      ],
    );

    return SizedBox(
      width: width,
      child: Material(
        color: bg,
        borderRadius: BorderRadius.circular(8),
        child: InkWell(
          onTap: isLoading ? null : onPressed,
          borderRadius: BorderRadius.circular(8),
          child: Container(
            padding: EdgeInsets.symmetric(
              horizontal: horizontalPad,
              vertical: verticalPad,
            ),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              border: border != null ? Border.fromBorderSide(border) : null,
            ),
            alignment: Alignment.center,
            child: content,
          ),
        ),
      ),
    );
  }
}
