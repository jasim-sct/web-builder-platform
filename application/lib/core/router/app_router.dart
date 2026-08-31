import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../layout/app_shell.dart';
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
import '../../features/users/screens/user_details_screen.dart';
import '../../features/users/screens/users_list_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/dashboard',
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
          return AppShell(
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
                // 1: Users / Participants
                StatefulShellBranch(
                  routes: [
                    GoRoute(
                      path: '/users',
                      builder: (context, state) {
                        final role = state.uri.queryParameters['role'];
                        final groupId = state.uri.queryParameters['groupId'];
                        return UsersListScreen(
                          initialRole: role,
                          initialGroupId: groupId,
                        );
                      },
                      routes: [
                        GoRoute(
                          path: 'new',
                          builder: (context, state) => const AddUserDialog(),
                        ),
                        GoRoute(
                          path: 'details/:id',
                          builder: (context, state) {
                            final id = state.pathParameters['id'] ?? '';
                            return UserDetailsScreen(userId: id);
                          },
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
                      builder: (context, state) {
                        final priority = state.uri.queryParameters['priority'];
                        final groupId = state.uri.queryParameters['groupId'];
                        final tab = state.uri.queryParameters['tab'];
                        final filter = state.uri.queryParameters['filter'];
                        final filterToday =
                            filter == 'today' || state.uri.queryParameters['today'] == 'true';
                        return AlertsListScreen(
                          initialPriority: priority,
                          initialGroupId: groupId,
                          initialTab: tab,
                          filterToday: filterToday,
                        );
                      },
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
                      builder: (context, state) {
                        final priority = state.uri.queryParameters['priority'];
                        final groupId = state.uri.queryParameters['groupId'];
                        final tab = state.uri.queryParameters['tab'];
                        final filter = state.uri.queryParameters['filter'];
                        final filterToday =
                            filter == 'today' || state.uri.queryParameters['today'] == 'true';
                        return AlertsListScreen(
                          initialPriority: priority,
                          initialGroupId: groupId,
                          initialTab: tab,
                          filterToday: filterToday,
                        );
                      },
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
