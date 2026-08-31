import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../network/socket_client.dart';
import '../theme/app_colors.dart';
import '../theme/theme_provider.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../shared/search/global_search_dialog.dart';
import '../../shared/widgets/confirmation_dialog.dart';
import 'responsive_layout.dart';

class AppShell extends ConsumerStatefulWidget {
  final StatefulNavigationShell navigationShell;
  final bool isAdmin;

  const AppShell({
    super.key,
    required this.navigationShell,
    required this.isAdmin,
  });

  @override
  ConsumerState<AppShell> createState() => _AppShellState();
}

class _AppShellState extends ConsumerState<AppShell> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  bool _isSidebarCollapsed = false;

  void _onDestinationSelected(int index) {
    widget.navigationShell.goBranch(
      index,
      initialLocation: index == widget.navigationShell.currentIndex,
    );
  }

  String _getPageTitle(int index, bool isAdmin) {
    if (isAdmin) {
      switch (index) {
        case 0:
          return 'Dashboard';
        case 1:
          return 'Participants';
        case 2:
          return 'Groups';
        case 3:
          return 'Alerts & Reminders';
        case 4:
          return 'Profile & Settings';
        default:
          return 'Alert System';
      }
    } else {
      switch (index) {
        case 0:
          return 'Dashboard';
        case 1:
          return 'My Groups';
        case 2:
          return 'Alerts & Reminders';
        case 3:
          return 'Profile & Settings';
        default:
          return 'Alert System';
      }
    }
  }

  Future<void> _handleLogout() async {
    final confirmed = await ConfirmationDialog.show(
      context,
      title: 'Sign Out?',
      message: 'Are you sure you want to sign out?',
      confirmLabel: 'Sign Out',
      isDangerous: true,
    );

    if (confirmed == true) {
      await ref.read(authProvider.notifier).logout();
      if (mounted) {
        context.go('/login');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isDesktop = ResponsiveLayout.isDesktop(context);
    final user = ref.watch(authProvider).user;
    final org = ref.watch(authProvider).organization;
    final socketClient = ref.watch(socketClientProvider);
    final currentIndex = widget.navigationShell.currentIndex;
    final currentTitle = _getPageTitle(currentIndex, widget.isAdmin);

    // Keyboard shortcut for Cmd+K / Ctrl+K
    return CallbackShortcuts(
      bindings: {
        const SingleActivator(LogicalKeyboardKey.keyK, control: true): () =>
            GlobalSearchDialog.show(context),
        const SingleActivator(LogicalKeyboardKey.keyK, meta: true): () =>
            GlobalSearchDialog.show(context),
      },
      child: Focus(
        autofocus: true,
        child: Scaffold(
          key: _scaffoldKey,
          drawer: isDesktop ? null : _buildMobileDrawer(isDark, user, org, currentIndex),
          body: Row(
            children: [
              // Desktop Persistent / Collapsible Sidebar
              if (isDesktop)
                _buildDesktopSidebar(isDark, user, org, currentIndex, socketClient),

              // Main Application Content Area
              Expanded(
                child: Column(
                  children: [
                    // Top App Header
                    _buildTopHeader(isDark, isDesktop, currentTitle, user, socketClient),

                    // Scrollable Screen Content
                    Expanded(
                      child: widget.navigationShell,
                    ),
                  ],
                ),
              ),
            ],
          ),
          // Mobile Bottom Navigation Bar
          bottomNavigationBar: isDesktop ? null : _buildMobileBottomBar(isDark, currentIndex),
        ),
      ),
    );
  }

  Widget _buildTopHeader(
    bool isDark,
    bool isDesktop,
    String title,
    dynamic user,
    SocketClient socketClient,
  ) {
    return Container(
      height: 56,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.surface,
        border: Border(
          bottom: BorderSide(
            color: isDark ? AppColors.darkBorder : AppColors.border,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          // Mobile Drawer Trigger
          if (!isDesktop) ...[
            IconButton(
              icon: const Icon(Icons.menu_rounded, size: 22),
              onPressed: () => _scaffoldKey.currentState?.openDrawer(),
              tooltip: 'Navigation Menu',
            ),
            const SizedBox(width: 8),
          ],

          // Page Title / Breadcrumbs
          Expanded(
            child: Row(
              children: [
                if (isDesktop) ...[
                  InkWell(
                    onTap: () => context.go('/dashboard'),
                    borderRadius: BorderRadius.circular(4),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      child: Text(
                        'AlertSystem',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                        ),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Icon(
                      Icons.chevron_right_rounded,
                      size: 16,
                      color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                    ),
                  ),
                ],
                Flexible(
                  child: Text(
                    title,
                    style: TextStyle(
                      fontSize: isDesktop ? 15 : 16,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),

          // Search Trigger (Cmd+K)
          InkWell(
            onTap: () => GlobalSearchDialog.show(context),
            borderRadius: BorderRadius.circular(8),
            child: Container(
              padding: EdgeInsets.symmetric(
                horizontal: isDesktop ? 12 : 8,
                vertical: 6,
              ),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isDark ? AppColors.darkBorder : AppColors.border,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.search_rounded,
                    size: 16,
                    color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                  ),
                  if (isDesktop) ...[
                    const SizedBox(width: 8),
                    Text(
                      'Search...',
                      style: TextStyle(
                        fontSize: 13,
                        color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.darkSurface : AppColors.surface,
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(
                          color: isDark ? AppColors.darkBorder : AppColors.border,
                        ),
                      ),
                      child: Text(
                        '⌘K',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: isDark ? AppColors.darkTextMuted : AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(width: 6),

          // Socket Health Status Pill
          ValueListenableBuilder<SocketConnectionStatus>(
            valueListenable: socketClient.connectionStatus,
            builder: (context, status, child) {
              final isConnected = status == SocketConnectionStatus.connected;
              return Tooltip(
                message: isConnected ? 'Real-time Connected' : 'Disconnected',
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: isDesktop ? 8 : 6,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: isConnected
                        ? (isDark ? AppColors.darkSuccessBg : AppColors.successBg)
                        : (isDark ? AppColors.darkErrorBg : AppColors.errorBg),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 7,
                        height: 7,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isConnected ? AppColors.success : AppColors.error,
                        ),
                      ),
                      if (isDesktop) ...[
                        const SizedBox(width: 6),
                        Text(
                          isConnected ? 'LIVE' : 'OFFLINE',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: isConnected ? AppColors.success : AppColors.error,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            },
          ),
          const SizedBox(width: 4),

          // Theme Toggle
          IconButton(
            icon: Icon(
              isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
              size: 19,
              color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
            ),
            tooltip: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            padding: const EdgeInsets.all(6),
            constraints: const BoxConstraints(),
            onPressed: () => ref.read(themeModeProvider.notifier).toggleTheme(),
          ),

          // Emergency Broadcast Trigger (If Admin)
          if (widget.isAdmin) ...[
            const SizedBox(width: 4),
            InkWell(
              onTap: () => context.push('/alerts/broadcast'),
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: EdgeInsets.symmetric(
                  horizontal: isDesktop ? 10 : 7,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: AppColors.error,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.campaign_rounded, size: 16, color: Colors.white),
                    if (isDesktop) ...[
                      const SizedBox(width: 6),
                      const Text(
                        'BROADCAST',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDesktopSidebar(
    bool isDark,
    dynamic user,
    dynamic org,
    int currentIndex,
    SocketClient socketClient,
  ) {
    final sidebarWidth = _isSidebarCollapsed ? 72.0 : 240.0;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      width: sidebarWidth,
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.sidebarBg,
        border: Border(
          right: BorderSide(
            color: isDark ? AppColors.darkBorder : AppColors.sidebarBorder,
            width: 1,
          ),
        ),
      ),
      child: Column(
        children: [
          // Logo & Organization Header
          Container(
            height: 56,
            padding: EdgeInsets.symmetric(
              horizontal: _isSidebarCollapsed ? 12 : 16,
            ),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: isDark ? AppColors.darkBorder : AppColors.sidebarBorder,
                  width: 1,
                ),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.notifications_active_rounded,
                    color: Colors.white,
                    size: 18,
                  ),
                ),
                if (!_isSidebarCollapsed) ...[
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          org?.name ?? user?.organizationName ?? 'Organization',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          user?.role ?? 'Participant',
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.sidebarTextMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(
                      Icons.chevron_left_rounded,
                      color: AppColors.sidebarTextMuted,
                      size: 20,
                    ),
                    onPressed: () =>
                        setState(() => _isSidebarCollapsed = !_isSidebarCollapsed),
                    tooltip: 'Collapse Sidebar',
                  ),
                ] else
                  IconButton(
                    icon: const Icon(
                      Icons.chevron_right_rounded,
                      color: AppColors.sidebarTextMuted,
                      size: 20,
                    ),
                    onPressed: () =>
                        setState(() => _isSidebarCollapsed = !_isSidebarCollapsed),
                    tooltip: 'Expand Sidebar',
                  ),
              ],
            ),
          ),

          // Navigation Links
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
              children: widget.isAdmin
                  ? [
                      _buildSidebarItem(
                        icon: Icons.dashboard_outlined,
                        selectedIcon: Icons.dashboard_rounded,
                        label: 'Dashboard',
                        isSelected: currentIndex == 0,
                        onTap: () => _onDestinationSelected(0),
                      ),
                      _buildSidebarItem(
                        icon: Icons.people_outline_rounded,
                        selectedIcon: Icons.people_rounded,
                        label: 'Participants',
                        isSelected: currentIndex == 1,
                        onTap: () => _onDestinationSelected(1),
                      ),
                      _buildSidebarItem(
                        icon: Icons.groups_outlined,
                        selectedIcon: Icons.groups_rounded,
                        label: 'Groups',
                        isSelected: currentIndex == 2,
                        onTap: () => _onDestinationSelected(2),
                      ),
                      _buildSidebarItem(
                        icon: Icons.notifications_none_rounded,
                        selectedIcon: Icons.notifications_rounded,
                        label: 'Alerts',
                        isSelected: currentIndex == 3,
                        onTap: () => _onDestinationSelected(3),
                      ),
                      _buildSidebarItem(
                        icon: Icons.person_outline_rounded,
                        selectedIcon: Icons.person_rounded,
                        label: 'Profile & Settings',
                        isSelected: currentIndex == 4,
                        onTap: () => _onDestinationSelected(4),
                      ),
                    ]
                  : [
                      _buildSidebarItem(
                        icon: Icons.dashboard_outlined,
                        selectedIcon: Icons.dashboard_rounded,
                        label: 'Dashboard',
                        isSelected: currentIndex == 0,
                        onTap: () => _onDestinationSelected(0),
                      ),
                      _buildSidebarItem(
                        icon: Icons.groups_outlined,
                        selectedIcon: Icons.groups_rounded,
                        label: 'My Groups',
                        isSelected: currentIndex == 1,
                        onTap: () => _onDestinationSelected(1),
                      ),
                      _buildSidebarItem(
                        icon: Icons.notifications_none_rounded,
                        selectedIcon: Icons.notifications_rounded,
                        label: 'Alerts',
                        isSelected: currentIndex == 2,
                        onTap: () => _onDestinationSelected(2),
                      ),
                      _buildSidebarItem(
                        icon: Icons.person_outline_rounded,
                        selectedIcon: Icons.person_rounded,
                        label: 'Profile & Settings',
                        isSelected: currentIndex == 3,
                        onTap: () => _onDestinationSelected(3),
                      ),
                    ],
            ),
          ),

          // User Footer Pill
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              border: Border(
                top: BorderSide(
                  color: isDark ? AppColors.darkBorder : AppColors.sidebarBorder,
                  width: 1,
                ),
              ),
            ),
            child: InkWell(
              onTap: () => _onDestinationSelected(widget.isAdmin ? 4 : 3),
              borderRadius: BorderRadius.circular(8),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 16,
                    backgroundColor: AppColors.primary,
                    child: Text(
                      user?.name?.isNotEmpty == true ? user.name[0].toUpperCase() : '?',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  if (!_isSidebarCollapsed) ...[
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user?.name ?? 'Participant',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            user?.email ?? '',
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.sidebarTextMuted,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(
                        Icons.logout_rounded,
                        size: 18,
                        color: AppColors.sidebarTextMuted,
                      ),
                      tooltip: 'Sign Out',
                      onPressed: _handleLogout,
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebarItem({
    required IconData icon,
    required IconData selectedIcon,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      child: Tooltip(
        message: _isSidebarCollapsed ? label : '',
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: Container(
            padding: EdgeInsets.symmetric(
              horizontal: _isSidebarCollapsed ? 12 : 12,
              vertical: 10,
            ),
            decoration: BoxDecoration(
              color: isSelected ? AppColors.sidebarActiveItem : Colors.transparent,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: _isSidebarCollapsed
                  ? MainAxisAlignment.center
                  : MainAxisAlignment.start,
              children: [
                Icon(
                  isSelected ? selectedIcon : icon,
                  size: 20,
                  color: isSelected ? Colors.white : AppColors.sidebarTextMuted,
                ),
                if (!_isSidebarCollapsed) ...[
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      label,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                        color: isSelected ? Colors.white : AppColors.sidebarText,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMobileDrawer(
    bool isDark,
    dynamic user,
    dynamic org,
    int currentIndex,
  ) {
    return Drawer(
      backgroundColor: isDark ? AppColors.darkSurface : AppColors.surface,
      child: SafeArea(
        child: Column(
          children: [
            // Drawer Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: isDark ? AppColors.darkBorder : AppColors.border,
                  ),
                ),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: AppColors.primary,
                    child: Text(
                      user?.name?.isNotEmpty == true ? user.name[0].toUpperCase() : '?',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.name ?? 'User',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          org?.name ?? user?.organizationName ?? 'Organization',
                          style: TextStyle(
                            fontSize: 12,
                            color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Navigation List
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                children: widget.isAdmin
                    ? [
                        _buildDrawerItem(
                          icon: Icons.dashboard_outlined,
                          label: 'Dashboard',
                          isSelected: currentIndex == 0,
                          isDark: isDark,
                          onTap: () {
                            Navigator.pop(context);
                            _onDestinationSelected(0);
                          },
                        ),
                        _buildDrawerItem(
                          icon: Icons.people_outline_rounded,
                          label: 'Participants',
                          isSelected: currentIndex == 1,
                          isDark: isDark,
                          onTap: () {
                            Navigator.pop(context);
                            _onDestinationSelected(1);
                          },
                        ),
                        _buildDrawerItem(
                          icon: Icons.groups_outlined,
                          label: 'Groups',
                          isSelected: currentIndex == 2,
                          isDark: isDark,
                          onTap: () {
                            Navigator.pop(context);
                            _onDestinationSelected(2);
                          },
                        ),
                        _buildDrawerItem(
                          icon: Icons.notifications_none_rounded,
                          label: 'Alerts',
                          isSelected: currentIndex == 3,
                          isDark: isDark,
                          onTap: () {
                            Navigator.pop(context);
                            _onDestinationSelected(3);
                          },
                        ),
                        _buildDrawerItem(
                          icon: Icons.person_outline_rounded,
                          label: 'Profile & Settings',
                          isSelected: currentIndex == 4,
                          isDark: isDark,
                          onTap: () {
                            Navigator.pop(context);
                            _onDestinationSelected(4);
                          },
                        ),
                      ]
                    : [
                        _buildDrawerItem(
                          icon: Icons.dashboard_outlined,
                          label: 'Dashboard',
                          isSelected: currentIndex == 0,
                          isDark: isDark,
                          onTap: () {
                            Navigator.pop(context);
                            _onDestinationSelected(0);
                          },
                        ),
                        _buildDrawerItem(
                          icon: Icons.groups_outlined,
                          label: 'My Groups',
                          isSelected: currentIndex == 1,
                          isDark: isDark,
                          onTap: () {
                            Navigator.pop(context);
                            _onDestinationSelected(1);
                          },
                        ),
                        _buildDrawerItem(
                          icon: Icons.notifications_none_rounded,
                          label: 'Alerts',
                          isSelected: currentIndex == 2,
                          isDark: isDark,
                          onTap: () {
                            Navigator.pop(context);
                            _onDestinationSelected(2);
                          },
                        ),
                        _buildDrawerItem(
                          icon: Icons.person_outline_rounded,
                          label: 'Profile & Settings',
                          isSelected: currentIndex == 3,
                          isDark: isDark,
                          onTap: () {
                            Navigator.pop(context);
                            _onDestinationSelected(3);
                          },
                        ),
                      ],
              ),
            ),

            // Drawer Footer
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(
                    color: isDark ? AppColors.darkBorder : AppColors.border,
                  ),
                ),
              ),
              child: ListTile(
                leading: const Icon(Icons.logout_rounded, color: AppColors.error),
                title: const Text(
                  'Sign Out',
                  style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w600),
                ),
                contentPadding: EdgeInsets.zero,
                onTap: () {
                  Navigator.pop(context);
                  _handleLogout();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerItem({
    required IconData icon,
    required String label,
    required bool isSelected,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      decoration: BoxDecoration(
        color: isSelected
            ? (isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        leading: Icon(
          icon,
          size: 22,
          color: isSelected
              ? AppColors.primary
              : (isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
        ),
        title: Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            color: isSelected
                ? AppColors.primary
                : (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
          ),
        ),
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _buildMobileBottomBar(bool isDark, int currentIndex) {
    final destinations = widget.isAdmin
        ? const [
            NavigationDestination(
              icon: Icon(Icons.dashboard_outlined),
              selectedIcon: Icon(Icons.dashboard_rounded),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.people_outline_rounded),
              selectedIcon: Icon(Icons.people_rounded),
              label: 'People',
            ),
            NavigationDestination(
              icon: Icon(Icons.groups_outlined),
              selectedIcon: Icon(Icons.groups_rounded),
              label: 'Groups',
            ),
            NavigationDestination(
              icon: Icon(Icons.notifications_none_rounded),
              selectedIcon: Icon(Icons.notifications_rounded),
              label: 'Alerts',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline_rounded),
              selectedIcon: Icon(Icons.person_rounded),
              label: 'Profile',
            ),
          ]
        : const [
            NavigationDestination(
              icon: Icon(Icons.dashboard_outlined),
              selectedIcon: Icon(Icons.dashboard_rounded),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.groups_outlined),
              selectedIcon: Icon(Icons.groups_rounded),
              label: 'Groups',
            ),
            NavigationDestination(
              icon: Icon(Icons.notifications_none_rounded),
              selectedIcon: Icon(Icons.notifications_rounded),
              label: 'Alerts',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline_rounded),
              selectedIcon: Icon(Icons.person_rounded),
              label: 'Profile',
            ),
          ];

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.surface,
        border: Border(
          top: BorderSide(
            color: isDark ? AppColors.darkBorder : AppColors.border,
            width: 1,
          ),
        ),
      ),
      child: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: _onDestinationSelected,
        destinations: destinations,
        height: 60,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
    );
  }
}
