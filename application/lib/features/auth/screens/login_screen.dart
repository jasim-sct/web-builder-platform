import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/api_config.dart';
import '../../../core/layout/responsive_layout.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/validators.dart';
import '../../../models/user.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  List<User> _backendUsers = [];
  bool _isLoadingUsers = false;
  String _userSearchQuery = '';

  @override
  void initState() {
    super.initState();
    _fetchBackendUsers();
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _fetchBackendUsers() async {
    setState(() => _isLoadingUsers = true);
    try {
      final users = await ref.read(authProvider.notifier).fetchAllUsersFromBackend();
      if (mounted) {
        setState(() {
          _backendUsers = users;
          _isLoadingUsers = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingUsers = false);
    }
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    await ref.read(authProvider.notifier).loginWithEmail(_emailController.text.trim());
    if (mounted && ref.read(authProvider).isAuthenticated) {
      context.go('/dashboard');
    }
  }

  Future<void> _handleSelectUser(User user) async {
    await ref.read(authProvider.notifier).loginWithUser(user);
    if (mounted && ref.read(authProvider).isAuthenticated) {
      context.go('/dashboard');
    }
  }

  void _showServerSettingsDialog() {
    final urlController = TextEditingController(text: ApiConfig.baseUrl);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: isDark ? AppColors.darkSurface : AppColors.surface,
        title: const Text('Backend Server Configuration'),
        content: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Configure the REST & Socket.IO server host for desktop, web, or mobile testing.',
                style: TextStyle(
                  fontSize: 13,
                  color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 16),
              AppTextField(
                label: 'Server URL',
                controller: urlController,
                hint: 'http://localhost:5000',
              ),
            ],
          ),
        ),
        actionsPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          AppButton(
            label: 'Save & Reconnect',
            onPressed: () async {
              final newUrl = urlController.text.trim();
              if (newUrl.isNotEmpty) {
                await ref.read(authProvider.notifier).updateCustomBaseUrl(newUrl);
                if (ctx.mounted) {
                  Navigator.pop(ctx);
                }
                _fetchBackendUsers();
              }
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isDesktop = ResponsiveLayout.isDesktop(context);

    final filteredUsers = _userSearchQuery.isEmpty
        ? _backendUsers
        : _backendUsers.where((u) =>
            u.name.toLowerCase().contains(_userSearchQuery.toLowerCase()) ||
            u.email.toLowerCase().contains(_userSearchQuery.toLowerCase()) ||
            u.role.toLowerCase().contains(_userSearchQuery.toLowerCase())).toList();

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      body: SafeArea(
        child: isDesktop
            ? _buildDesktopLayout(isDark, authState, filteredUsers)
            : _buildMobileLayout(isDark, authState, filteredUsers),
      ),
    );
  }

  Widget _buildDesktopLayout(
    bool isDark,
    AuthState authState,
    List<User> filteredUsers,
  ) {
    return Row(
      children: [
        // Left Hero Branding Panel (Linear / Stripe Style)
        Expanded(
          flex: 5,
          child: Container(
            padding: const EdgeInsets.all(48),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : AppColors.sidebarBg,
              border: Border(
                right: BorderSide(
                  color: isDark ? AppColors.darkBorder : AppColors.sidebarBorder,
                ),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Logo
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.notifications_active_rounded,
                        color: Colors.white,
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'AlertSystem',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: -0.3,
                      ),
                    ),
                  ],
                ),
                const Spacer(),

                // Hero Headline
                const Text(
                  'Enterprise Real-Time Alert\n& Scheduled Reminder Platform',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    letterSpacing: -0.8,
                    height: 1.25,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Deliver high-priority instant broadcasts, recurring group reminders, and delivery confirmation metrics to teams with zero latency.',
                  style: TextStyle(
                    fontSize: 15,
                    color: AppColors.sidebarTextMuted,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 36),

                // Feature Highlights
                _buildFeatureRow(
                  Icons.bolt_rounded,
                  'Real-Time Push & Socket.IO Alerts',
                  'Instant delivery confirmation with audible alerts.',
                ),
                const SizedBox(height: 16),
                _buildFeatureRow(
                  Icons.calendar_month_rounded,
                  'Automated Scheduling & Recurrence',
                  'Daily, weekly, and custom scheduled event notifications.',
                ),
                const SizedBox(height: 16),
                _buildFeatureRow(
                  Icons.groups_rounded,
                  'Group & Organization Targeting',
                  'Organize participants into granular channels.',
                ),

                const Spacer(),

                // Bottom Org Info
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Version 1.0 · Enterprise Edition',
                      style: TextStyle(fontSize: 12, color: AppColors.sidebarTextMuted),
                    ),
                    IconButton(
                      icon: const Icon(Icons.settings_outlined, color: AppColors.sidebarTextMuted, size: 18),
                      tooltip: 'Server Settings',
                      onPressed: _showServerSettingsDialog,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        // Right Form Panel
        Expanded(
          flex: 6,
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 32),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: _buildFormContent(isDark, authState, filteredUsers),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFeatureRow(IconData icon, String title, String subtitle) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Icon(icon, size: 16, color: AppColors.primaryLight),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.sidebarTextMuted,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMobileLayout(
    bool isDark,
    AuthState authState,
    List<User> filteredUsers,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 440),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with Server Settings
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.notifications_active_rounded,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        'AlertSystem',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: Icon(
                      Icons.settings_outlined,
                      size: 20,
                      color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                    ),
                    tooltip: 'Server Settings',
                    onPressed: _showServerSettingsDialog,
                  ),
                ],
              ),
              const SizedBox(height: 28),

              _buildFormContent(isDark, authState, filteredUsers),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFormContent(
    bool isDark,
    AuthState authState,
    List<User> filteredUsers,
  ) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Sign In',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Enter your participant email or choose from the demo accounts below.',
            style: TextStyle(
              fontSize: 13.5,
              color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 24),

          // Error Alert Banner
          if (authState.error != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkPriorityUrgentBg : AppColors.priorityUrgentBg,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: AppColors.error.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 18),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      authState.error!,
                      style: const TextStyle(color: AppColors.error, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
          ],

          // Email Input
          AppTextField(
            label: 'Email Address',
            controller: _emailController,
            hint: 'name@organization.com',
            keyboardType: TextInputType.emailAddress,
            prefixIcon: const Icon(Icons.email_outlined, size: 18),
            validator: Validators.email,
          ),
          const SizedBox(height: 16),

          // Submit Button
          AppButton(
            label: 'Sign In with Email',
            icon: Icons.arrow_forward_rounded,
            size: AppButtonSize.large,
            width: double.infinity,
            isLoading: authState.isLoading,
            onPressed: _handleLogin,
          ),
          const SizedBox(height: 32),

          // Divider Section
          Row(
            children: [
              Expanded(
                child: Divider(
                  color: isDark ? AppColors.darkBorder : AppColors.border,
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                child: Text(
                  'OR QUICK-SELECT PARTICIPANT',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                    color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                  ),
                ),
              ),
              Expanded(
                child: Divider(
                  color: isDark ? AppColors.darkBorder : AppColors.border,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Search User Filter if list is long
          if (_backendUsers.length > 3) ...[
            TextField(
              onChanged: (val) => setState(() => _userSearchQuery = val),
              decoration: InputDecoration(
                hintText: 'Filter participants...',
                prefixIcon: const Icon(Icons.search_rounded, size: 18),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
              style: TextStyle(
                fontSize: 13,
                color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
          ],

          // Participant List
          if (_isLoadingUsers)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(24.0),
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          else if (_backendUsers.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Text(
                      'No participants found or backend starting up.',
                      style: TextStyle(
                        fontSize: 13,
                        color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    TextButton.icon(
                      icon: const Icon(Icons.refresh_rounded, size: 16),
                      label: const Text('Refresh from Server'),
                      onPressed: _fetchBackendUsers,
                    ),
                  ],
                ),
              ),
            )
          else ...[
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: filteredUsers.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final user = filteredUsers[index];
                final isAdmin = user.isAdmin;

                return AppCard(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  onTap: () => _handleSelectUser(user),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 16,
                        backgroundColor: isAdmin
                            ? (isDark ? AppColors.primaryLight : AppColors.primary)
                            : (isDark ? AppColors.secondaryDark : AppColors.secondary),
                        child: Text(
                          user.name.isNotEmpty ? user.name[0].toUpperCase() : '?',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user.name,
                              style: TextStyle(
                                fontSize: 13.5,
                                fontWeight: FontWeight.w600,
                                color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                              ),
                            ),
                            Text(
                              user.email,
                              style: TextStyle(
                                fontSize: 12,
                                color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: isAdmin
                              ? (isDark ? AppColors.darkPriorityNormalBg : AppColors.priorityNormalBg)
                              : (isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          user.role,
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.bold,
                            color: isAdmin
                                ? (isDark ? AppColors.primaryLight : AppColors.primary)
                                : (isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ],
      ),
    );
  }
}

