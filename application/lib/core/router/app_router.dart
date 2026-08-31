import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/alerts/screens/alert_details_screen.dart';
import '../../features/alerts/screens/alerts_list_screen.dart';
import '../../features/alerts/screens/broadcast_screen.dart';
import '../../features/alerts/screens/create_alert_screen.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/splash_screen.dart';
import '../../features/dashboard/screens/admin_dashboard_screen.dart';
import '../../features/dashboard/screens/member_dashboard_screen.dart';
import '../../features/groups/screens/group_details_screen.dart';
import '../../features/groups/screens/groups_list_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/users/screens/add_user_dialog.dart';
import '../../features/users/screens/users_list_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isAuth = authState.isAuthenticated;
      final isLoggingIn = state.matchedLocation == '/login';
      final isSplash = state.matchedLocation == '/';

      if (isSplash) return null;

      if (!isAuth && !isLoggingIn) {
        return '/login';
      }

      if (isAuth && isLoggingIn) {
        return '/dashboard';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return _ScaffoldWithNavBar(
            navigationShell: navigationShell,
            isAdmin: authState.isAdmin,
          );
        },
        branches: authState.isAdmin
            ? [
                // 0: Admin Dashboard
                StatefulShellBranch(
                  routes: [
                    GoRoute(
                      path: '/dashboard',
                      builder: (context, state) => const AdminDashboardScreen(),
                    ),
                  ],
                ),
                // 1: Users
                StatefulShellBranch(
                  routes: [
                    GoRoute(
                      path: '/users',
                      builder: (context, state) => const UsersListScreen(),
                      routes: [
                        GoRoute(
                          path: 'new',
                          builder: (context, state) => const AddUserDialog(),
                        ),
                      ],
                    ),
                  ],
                ),
                // 2: Groups
                StatefulShellBranch(
                  routes: [
                    GoRoute(
                      path: '/groups',
                      builder: (context, state) => const GroupsListScreen(),
                      routes: [
                        GoRoute(
                          path: 'details/:id',
                          builder: (context, state) {
                            final id = state.pathParameters['id'] ?? '';
                            return GroupDetailsScreen(groupId: id);
                          },
                        ),
                      ],
                    ),
                  ],
                ),
                // 3: Alerts
                StatefulShellBranch(
                  routes: [
                    GoRoute(
                      path: '/alerts',
                      builder: (context, state) => const AlertsListScreen(),
                      routes: [
                        GoRoute(
                          path: 'new',
                          builder: (context, state) => const CreateAlertScreen(),
                        ),
                        GoRoute(
                          path: 'broadcast',
                          builder: (context, state) => const BroadcastScreen(),
                        ),
                        GoRoute(
                          path: 'details/:id',
                          builder: (context, state) {
                            final id = state.pathParameters['id'] ?? '';
                            return AlertDetailsScreen(alertId: id);
                          },
                        ),
                      ],
                    ),
                  ],
                ),
                // 4: Profile
                StatefulShellBranch(
                  routes: [
                    GoRoute(
                      path: '/profile',
                      builder: (context, state) => const ProfileScreen(),
                    ),
                  ],
                ),
              ]
            : [
                // 0: Member Dashboard
                StatefulShellBranch(
                  routes: [
                    GoRoute(
                      path: '/dashboard',
                      builder: (context, state) => const MemberDashboardScreen(),
                    ),
                  ],
                ),
                // 1: Groups (Member view)
                StatefulShellBranch(
                  routes: [
                    GoRoute(
                      path: '/groups',
                      builder: (context, state) => const GroupsListScreen(),
                      routes: [
                        GoRoute(
                          path: 'details/:id',
                          builder: (context, state) {
                            final id = state.pathParameters['id'] ?? '';
                            return GroupDetailsScreen(groupId: id);
                          },
                        ),
                      ],
                    ),
                  ],
                ),
                // 2: Alerts
                StatefulShellBranch(
                  routes: [
                    GoRoute(
                      path: '/alerts',
                      builder: (context, state) => const AlertsListScreen(),
                      routes: [
                        GoRoute(
                          path: 'details/:id',
                          builder: (context, state) {
                            final id = state.pathParameters['id'] ?? '';
                            return AlertDetailsScreen(alertId: id);
                          },
                        ),
                      ],
                    ),
                  ],
                ),
                // 3: Profile
                StatefulShellBranch(
                  routes: [
                    GoRoute(
                      path: '/profile',
                      builder: (context, state) => const ProfileScreen(),
                    ),
                  ],
                ),
              ],
      ),
    ],
  );
});

class _ScaffoldWithNavBar extends StatelessWidget {
  final StatefulNavigationShell navigationShell;
  final bool isAdmin;

  const _ScaffoldWithNavBar({
    required this.navigationShell,
    required this.isAdmin,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) {
          navigationShell.goBranch(
            index,
            initialLocation: index == navigationShell.currentIndex,
          );
        },
        destinations: isAdmin
            ? const [
                NavigationDestination(
                  icon: Icon(Icons.dashboard_outlined),
                  selectedIcon: Icon(Icons.dashboard_rounded),
                  label: 'Dashboard',
                ),
                NavigationDestination(
                  icon: Icon(Icons.people_outline_rounded),
                  selectedIcon: Icon(Icons.people_rounded),
                  label: 'Participants',
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
                  label: 'Dashboard',
                ),
                NavigationDestination(
                  icon: Icon(Icons.groups_outlined),
                  selectedIcon: Icon(Icons.groups_rounded),
                  label: 'My Groups',
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
              ],
      ),
    );
  }
}
