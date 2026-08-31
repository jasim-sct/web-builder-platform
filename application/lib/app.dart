import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/config/app_config.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_provider.dart';
import 'features/alerts/providers/socket_provider.dart';
import 'shared/widgets/active_alert_overlay.dart';

class OrganizationAlertApp extends ConsumerWidget {
  const OrganizationAlertApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(themeModeProvider);
    final activeAlertState = ref.watch(socketAlertProvider);

    return MaterialApp.router(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      routerConfig: router,
      builder: (context, child) {
        return Stack(
          children: [
            if (child != null) child,
            if (activeAlertState.hasActiveAlert)
              ActiveAlertOverlay(
                alert: activeAlertState.activeAlert!,
                isAcknowledging: activeAlertState.isAcknowledging,
                onAcknowledge: () =>
                    ref.read(socketAlertProvider.notifier).acknowledgeActiveAlert(),
                onDismiss: () =>
                    ref.read(socketAlertProvider.notifier).dismissActiveAlert(),
              ),
          ],
        );
      },
    );
  }
}
