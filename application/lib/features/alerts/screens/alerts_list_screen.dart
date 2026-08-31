import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../shared/empty_states/empty_state.dart';
import '../../../shared/loading/loading_view.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/alerts_provider.dart';
import '../widgets/alert_card.dart';

class AlertsListScreen extends ConsumerStatefulWidget {
  const AlertsListScreen({super.key});

  @override
  ConsumerState<AlertsListScreen> createState() => _AlertsListScreenState();
}

class _AlertsListScreenState extends ConsumerState<AlertsListScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  String? _selectedPriorityFilter;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _refreshUpcoming() async {
    ref.invalidate(upcomingAlertsProvider);
  }

  Future<void> _refreshHistory() async {
    ref.invalidate(alertHistoryProvider);
  }

  @override
  Widget build(BuildContext context) {
    final isAdmin = ref.watch(authProvider).isAdmin;
    final upcomingAsync = ref.watch(upcomingAlertsProvider);
    final historyAsync = ref.watch(alertHistoryProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Alerts & Reminders'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
          tabs: const [
            Tab(text: 'Upcoming', icon: Icon(Icons.schedule_rounded, size: 18)),
            Tab(text: 'History', icon: Icon(Icons.history_rounded, size: 18)),
          ],
        ),
      ),
      floatingActionButton: isAdmin
          ? FloatingActionButton.extended(
              onPressed: () => context.push('/alerts/new'),
              icon: const Icon(Icons.add_alert_rounded),
              label: const Text('Create Alert'),
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            )
          : null,
      body: Column(
        children: [
          // Filter Row
          Container(
            color: AppColors.surface,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  const Text('Priority:', style: AppTextStyles.labelSmall),
                  const SizedBox(width: 8),
                  _FilterPriorityChip(
                    label: 'All',
                    isSelected: _selectedPriorityFilter == null,
                    onTap: () => setState(() => _selectedPriorityFilter = null),
                  ),
                  const SizedBox(width: 6),
                  _FilterPriorityChip(
                    label: 'Urgent',
                    isSelected: _selectedPriorityFilter == 'URGENT',
                    onTap: () => setState(() => _selectedPriorityFilter = 'URGENT'),
                  ),
                  const SizedBox(width: 6),
                  _FilterPriorityChip(
                    label: 'High',
                    isSelected: _selectedPriorityFilter == 'HIGH',
                    onTap: () => setState(() => _selectedPriorityFilter = 'HIGH'),
                  ),
                  const SizedBox(width: 6),
                  _FilterPriorityChip(
                    label: 'Normal',
                    isSelected: _selectedPriorityFilter == 'NORMAL',
                    onTap: () => setState(() => _selectedPriorityFilter = 'NORMAL'),
                  ),
                  const SizedBox(width: 6),
                  _FilterPriorityChip(
                    label: 'Low',
                    isSelected: _selectedPriorityFilter == 'LOW',
                    onTap: () => setState(() => _selectedPriorityFilter = 'LOW'),
                  ),
                ],
              ),
            ),
          ),
          const Divider(height: 1),

          // Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // Upcoming Tab
                RefreshIndicator(
                  onRefresh: _refreshUpcoming,
                  child: upcomingAsync.when(
                    data: (list) {
                      var filtered = list;
                      if (_selectedPriorityFilter != null) {
                        filtered = filtered.where((a) => a.priority == _selectedPriorityFilter).toList();
                      }

                      if (filtered.isEmpty) {
                        return const EmptyState(
                          title: 'No upcoming alerts',
                          subtitle: 'Create scheduled alerts for your groups.',
                          icon: Icons.notifications_none_rounded,
                        );
                      }

                      return ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: filtered.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          final alert = filtered[index];
                          return AlertCard(
                            alert: alert,
                            onTap: () => context.push('/alerts/details/${alert.id}'),
                          );
                        },
                      );
                    },
                    loading: () => const LoadingView(message: 'Loading upcoming alerts...'),
                    error: (err, _) => Center(child: Text('Error: $err')),
                  ),
                ),

                // History Tab
                RefreshIndicator(
                  onRefresh: _refreshHistory,
                  child: historyAsync.when(
                    data: (list) {
                      var filtered = list;
                      if (_selectedPriorityFilter != null) {
                        filtered = filtered.where((a) => a.priority == _selectedPriorityFilter).toList();
                      }

                      if (filtered.isEmpty) {
                        return const EmptyState(
                          title: 'No alert history',
                          subtitle: 'Triggered and completed alerts will appear here.',
                          icon: Icons.history_toggle_off_rounded,
                        );
                      }

                      return ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: filtered.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          final alert = filtered[index];
                          return AlertCard(
                            alert: alert,
                            onTap: () => context.push('/alerts/details/${alert.id}'),
                          );
                        },
                      );
                    },
                    loading: () => const LoadingView(message: 'Loading alert history...'),
                    error: (err, _) => Center(child: Text('Error: $err')),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterPriorityChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterPriorityChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: isSelected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
