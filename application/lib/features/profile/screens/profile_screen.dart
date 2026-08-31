import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/api_config.dart';
import '../../../core/network/socket_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/confirmation_dialog.dart';
import '../../auth/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  void _showServerSettingsDialog(BuildContext context, WidgetRef ref) {
    final urlController = TextEditingController(text: ApiConfig.baseUrl);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Change Backend URL'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Set custom backend server IP or hostname for testing on physical devices.',
              style: AppTextStyles.bodySmall,
            ),
            const SizedBox(height: 16),
            AppTextField(
              label: 'Server Base URL',
              controller: urlController,
              hint: 'http://10.0.2.2:5000',
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          AppButton(
            label: 'Apply & Reconnect',
            onPressed: () async {
              final newUrl = urlController.text.trim();
              if (newUrl.isNotEmpty) {
                await ref.read(authProvider.notifier).updateCustomBaseUrl(newUrl);
                if (ctx.mounted) {
                  Navigator.pop(ctx);
                }
              }
            },
          ),
        ],
      ),
    );
  }

  Future<void> _handleLogout(BuildContext context, WidgetRef ref) async {
    final confirmed = await ConfirmationDialog.show(
      context,
      title: 'Sign Out?',
      message: 'Are you sure you want to sign out? You will need to select or sign in as a participant again.',
      confirmLabel: 'Sign Out',
      isDangerous: true,
    );

    if (confirmed == true) {
      await ref.read(authProvider.notifier).logout();
      if (context.mounted) {
        context.go('/login');
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final org = authState.organization;
    final socketClient = ref.watch(socketClientProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // User Avatar & Name
            Center(
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 36,
                    backgroundColor: (user?.isAdmin ?? false)
                        ? AppColors.primary
                        : AppColors.secondary,
                    child: Text(
                      user?.name.isNotEmpty == true ? user!.name[0].toUpperCase() : '?',
                      style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(user?.name ?? 'User', style: AppTextStyles.headingMedium),
                  const SizedBox(height: 4),
                  Text(user?.email ?? '', style: AppTextStyles.bodyMedium),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: (user?.isAdmin ?? false) ? AppColors.priorityNormalBg : AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      user?.role ?? 'MEMBER',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: (user?.isAdmin ?? false) ? AppColors.primary : AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Organization Card
            AppCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('ORGANIZATION', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textMuted)),
                  const SizedBox(height: 8),
                  Text(org?.name ?? user?.organizationName ?? 'Default Organization', style: AppTextStyles.headingSmall),
                  if (org?.description.isNotEmpty == true) ...[
                    const SizedBox(height: 4),
                    Text(org!.description, style: AppTextStyles.bodySmall),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Connection & Server Status Card
            AppCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('SERVER & REAL-TIME CONNECTION', style: AppTextStyles.labelSmall.copyWith(color: AppColors.textMuted)),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      ValueListenableBuilder<SocketConnectionStatus>(
                        valueListenable: socketClient.connectionStatus,
                        builder: (context, status, child) {
                          Color indicatorColor = AppColors.error;
                          String label = 'Disconnected';

                          switch (status) {
                            case SocketConnectionStatus.connected:
                              indicatorColor = AppColors.success;
                              label = 'Connected (Real-time Active)';
                              break;
                            case SocketConnectionStatus.connecting:
                              indicatorColor = AppColors.warning;
                              label = 'Connecting...';
                              break;
                            case SocketConnectionStatus.error:
                            case SocketConnectionStatus.disconnected:
                              indicatorColor = AppColors.error;
                              label = 'Disconnected';
                              break;
                          }

                          return Row(
                            children: [
                              Container(
                                width: 10,
                                height: 10,
                                decoration: BoxDecoration(
                                  color: indicatorColor,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(label, style: AppTextStyles.labelMedium),
                            ],
                          );
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text('Host: ${ApiConfig.baseUrl}', style: AppTextStyles.bodySmall),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: () => _showServerSettingsDialog(context, ref),
                    icon: const Icon(Icons.edit_road_rounded, size: 16),
                    label: const Text('Change Server Host'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Sign Out
            AppButton(
              label: 'Sign Out / Switch Participant',
              icon: Icons.logout_rounded,
              variant: AppButtonVariant.outline,
              width: double.infinity,
              onPressed: () => _handleLogout(context, ref),
            ),
          ],
        ),
      ),
    );
  }
}
