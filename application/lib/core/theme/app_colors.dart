import 'package:flutter/material.dart';

class AppColors {
  // Brand & Accent Colors (Modern Indigo / Slate Palette)
  static const Color primary = Color(0xFF4F46E5); // Indigo 600
  static const Color primaryLight = Color(0xFF6366F1); // Indigo 500
  static const Color primaryDark = Color(0xFF3730A3); // Indigo 800
  static const Color primaryHover = Color(0xFF4338CA); // Indigo 700

  static const Color secondary = Color(0xFF0EA5E9); // Sky 500
  static const Color secondaryLight = Color(0xFF38BDF8); // Sky 400
  static const Color secondaryDark = Color(0xFF0284C7); // Sky 600

  // Light Mode Surfaces & Text
  static const Color background = Color(0xFFF8FAFC); // Slate 50
  static const Color surface = Color(0xFFFFFFFF); // Pure White
  static const Color surfaceVariant = Color(0xFFF1F5F9); // Slate 100
  static const Color surfaceElevated = Color(0xFFFFFFFF); // Elevated card
  static const Color border = Color(0xFFE2E8F0); // Slate 200
  static const Color borderSubtle = Color(0xFFF1F5F9); // Slate 100
  static const Color borderHover = Color(0xFFCBD5E1); // Slate 300

  static const Color textPrimary = Color(0xFF0F172A); // Slate 900
  static const Color textSecondary = Color(0xFF475569); // Slate 600
  static const Color textMuted = Color(0xFF94A3B8); // Slate 400
  static const Color textDisabled = Color(0xFFCBD5E1); // Slate 300

  // Semantic Priorities (Light Mode)
  static const Color priorityLow = Color(0xFF64748B); // Slate 500
  static const Color priorityLowBg = Color(0xFFF1F5F9); // Slate 100
  static const Color priorityLowBorder = Color(0xFFE2E8F0);

  static const Color priorityNormal = Color(0xFF2563EB); // Blue 600
  static const Color priorityNormalBg = Color(0xFFEFF6FF); // Blue 50
  static const Color priorityNormalBorder = Color(0xFFBFDBFE);

  static const Color priorityHigh = Color(0xFFD97706); // Amber 600
  static const Color priorityHighBg = Color(0xFFFEF3C7); // Amber 50
  static const Color priorityHighBorder = Color(0xFFFDE68A);

  static const Color priorityUrgent = Color(0xFFDC2626); // Red 600
  static const Color priorityUrgentBg = Color(0xFFFEE2E2); // Red 50
  static const Color priorityUrgentBorder = Color(0xFFFECACA);

  // Status Colors (Light Mode)
  static const Color success = Color(0xFF16A34A); // Green 600
  static const Color successLight = Color(0xFF4ADE80); // Green 400
  static const Color successBg = Color(0xFFDCFCE7); // Green 50
  static const Color successBorder = Color(0xFFBBF7D0);

  static const Color warning = Color(0xFFF59E0B); // Amber 500
  static const Color warningLight = Color(0xFFFBBF24); // Amber 400
  static const Color warningBg = Color(0xFFFEF3C7);
  static const Color warningBorder = Color(0xFFFDE68A);

  static const Color error = Color(0xFFEF4444); // Red 500
  static const Color errorLight = Color(0xFFF87171); // Red 400
  static const Color errorBg = Color(0xFFFEE2E2);
  static const Color errorBorder = Color(0xFFFECACA);

  static const Color info = Color(0xFF0284C7); // Sky 600
  static const Color infoLight = Color(0xFF38BDF8); // Sky 400
  static const Color infoBg = Color(0xFFE0F2FE); // Sky 50
  static const Color infoBorder = Color(0xFFBAE6FD);

  static const Color disabled = Color(0xFF94A3B8);

  // Dark Mode Tokens (Linear / Vercel Dark Style)
  static const Color darkBackground = Color(0xFF0B0F17); // Deepest Slate
  static const Color darkSurface = Color(0xFF111827); // Dark Gray 900
  static const Color darkSurfaceVariant = Color(0xFF1F2937); // Dark Gray 800
  static const Color darkSurfaceElevated = Color(0xFF1E293B); // Slate 800
  static const Color darkBorder = Color(0xFF1F2937); // Dark Border
  static const Color darkBorderSubtle = Color(0xFF182234);
  static const Color darkBorderHover = Color(0xFF374151);

  static const Color darkTextPrimary = Color(0xFFF8FAFC); // Slate 50
  static const Color darkTextSecondary = Color(0xFF94A3B8); // Slate 400
  static const Color darkTextMuted = Color(0xFF64748B); // Slate 500
  static const Color darkTextDisabled = Color(0xFF475569); // Slate 600

  // Dark Semantic Backgrounds & Borders
  static const Color darkPriorityLowBg = Color(0xFF1E293B);
  static const Color darkPriorityNormalBg = Color(0xFF1E3A8A);
  static const Color darkPriorityHighBg = Color(0xFF451A03);
  static const Color darkPriorityUrgentBg = Color(0xFF450A0A);

  static const Color darkSuccessBg = Color(0xFF052E16);
  static const Color darkWarningBg = Color(0xFF451A03);
  static const Color darkErrorBg = Color(0xFF450A0A);
  static const Color darkInfoBg = Color(0xFF082F49);

  // Sidebar Specific Tokens
  static const Color sidebarBg = Color(0xFF0F172A); // Slate 900
  static const Color sidebarSurface = Color(0xFF1E293B); // Slate 800
  static const Color sidebarText = Color(0xFFE2E8F0);
  static const Color sidebarTextMuted = Color(0xFF94A3B8);
  static const Color sidebarActiveItem = Color(0xFF4F46E5);
  static const Color sidebarBorder = Color(0xFF1E293B);
}
