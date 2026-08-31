import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/layout/responsive_layout.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/empty_states/empty_state.dart';
import '../../../shared/loading/loading_view.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../auth/providers/auth_provider.dart';
import '../../groups/providers/groups_provider.dart';
import '../providers/alerts_provider.dart';
import '../widgets/alert_card.dart';

class AlertsListScreen extends ConsumerStatefulWidget {
  final String? initialPriority;
  final String? initialGroupId;
  final String? initialTab; // 'upcoming' or 'history'
  final bool filterToday;

  const AlertsListScreen({
    super.key,
    this.initialPriority,
    this.initialGroupId,
    this.initialTab,
    this.filterToday = false,
  });

  @override
  ConsumerState<AlertsListScreen> createState() => _AlertsListScreenState();
}

class _AlertsListScreenState extends ConsumerState<AlertsListScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  final _searchController = TextEditingController();
  String? _selectedPriorityFilter;
  String? _selectedGroupId;
  bool _filterToday = false;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    final initialIndex = widget.initialTab?.toLowerCase() == 'history' ? 1 : 0;
    _tabController = TabController(length: 2, vsync: this, initialIndex: initialIndex);
    _selectedPriorityFilter = widget.initialPriority;
    _selectedGroupId = widget.initialGroupId;
    _filterToday = widget.filterToday;
  }

  @override
  void didUpdateWidget(AlertsListScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialPriority != oldWidget.initialPriority) {
      _selectedPriorityFilter = widget.initialPriority;
    }
    if (widget.initialGroupId != oldWidget.initialGroupId) {
      _selectedGroupId = widget.initialGroupId;
    }
    if (widget.filterToday != oldWidget.filterToday) {
      _filterToday = widget.filterToday;
    }
    if (widget.initialTab != oldWidget.initialTab && widget.initialTab != null) {
      _tabController.animateTo(widget.initialTab?.toLowerCase() == 'history' ? 1 : 0);
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isDesktop = ResponsiveLayout.isDesktop(context);

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      floatingActionButton: isAdmin && !isDesktop
          ? FloatingActionButton.extended(
              onPressed: () => context.push('/alerts/new'),
              icon: const Icon(Icons.add_alert_rounded),
              label: const Text('New Alert'),
              backgroundColor: isDark ? AppColors.primaryLight : AppColors.primary,
              foregroundColor: Colors.white,
            )
          : null,
      body: ResponsiveContainer(
        padding: EdgeInsets.symmetric(
          horizontal: ResponsiveLayout.horizontalPadding(context),
          vertical: 16,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Action Bar on Desktop
            if (isDesktop && isAdmin) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Alerts & Scheduled Reminders',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Manage upcoming scheduled alarms, broadcast alerts, and delivery history.',
                        style: TextStyle(
                          fontSize: 13,
                          color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      AppButton(
                        label: 'Emergency Broadcast',
                        icon: Icons.campaign_rounded,
                        variant: AppButtonVariant.danger,
                        onPressed: () => context.push('/alerts/broadcast'),
                      ),
                      const SizedBox(width: 10),
                      AppButton(
                        label: '+ Create Alert',
                        icon: Icons.add_alert_rounded,
                        variant: AppButtonVariant.primary,
                        onPressed: () => context.push('/alerts/new'),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],

            // Tabs & Search Filter Header
            Container(
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurface : AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isDark ? AppColors.darkBorder : AppColors.border,
                ),
              ),
              padding: const EdgeInsets.all(12),
              child: Column(
                children: [
                  // Tab Switcher + Search Box
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          height: 40,
                          decoration: BoxDecoration(
                            color: isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: TabBar(
                            controller: _tabController,
                            indicator: BoxDecoration(
                              color: isDark ? AppColors.primaryLight : AppColors.primary,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            labelColor: Colors.white,
                            unselectedLabelColor:
                                isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                            dividerColor: Colors.transparent,
                            indicatorSize: TabBarIndicatorSize.tab,
                            tabs: const [
                              Tab(text: 'Upcoming'),
                              Tab(text: 'History'),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Search + Priority Filter Chips
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          onChanged: (val) => setState(() => _searchQuery = val.trim()),
                          decoration: InputDecoration(
                            hintText: 'Search by title, group, or message...',
                            prefixIcon: const Icon(Icons.search_rounded, size: 18),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            suffixIcon: _searchQuery.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear_rounded, size: 16),
                                    onPressed: () {
                                      _searchController.clear();
                                      setState(() => _searchQuery = '');
                                    },
                                  )
                                : null,
                          ),
                          style: TextStyle(
                            fontSize: 13,
                            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Priority Filter Chips Row
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        Text(
                          'Priority:',
                          style: TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                            color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                          ),
                        ),
                        const SizedBox(width: 8),
                        _buildFilterChip('All', null, isDark),
                        const SizedBox(width: 6),
                        _buildFilterChip('Urgent', 'URGENT', isDark),
                        const SizedBox(width: 6),
                        _buildFilterChip('High', 'HIGH', isDark),
                        const SizedBox(width: 6),
                        _buildFilterChip('Normal', 'NORMAL', isDark),
                        const SizedBox(width: 6),
                        _buildFilterChip('Low', 'LOW', isDark),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Active Filter Pill/Banner if deep linked
            if (_filterToday || _selectedGroupId != null) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isDark
                        ? AppColors.primaryLight.withValues(alpha: 0.3)
                        : AppColors.primary.withValues(alpha: 0.3),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.filter_alt_rounded,
                      size: 16,
                      color: isDark ? AppColors.primaryLight : AppColors.primary,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _getFilterSummary(ref),
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    InkWell(
                      onTap: () {
                        setState(() {
                          _filterToday = false;
                          _selectedGroupId = null;
                        });
                      },
                      borderRadius: BorderRadius.circular(4),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Clear',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: isDark ? AppColors.primaryLight : AppColors.primary,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Icon(
                              Icons.close_rounded,
                              size: 14,
                              color: isDark ? AppColors.primaryLight : AppColors.primary,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Tab Views Content
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  // Upcoming Tab
                  RefreshIndicator(
                    onRefresh: _refreshUpcoming,
                    child: upcomingAsync.when(
                      data: (list) => _buildAlertsList(list, isDark, true),
                      loading: () => Column(
                        children: const [
                          SkeletonLoader(width: double.infinity, height: 90),
                          SizedBox(height: 10),
                          SkeletonLoader(width: double.infinity, height: 90),
                        ],
                      ),
                      error: (err, _) => Center(
                        child: Text('Error: $err', style: const TextStyle(color: AppColors.error)),
                      ),
                    ),
                  ),

                  // History Tab
                  RefreshIndicator(
                    onRefresh: _refreshHistory,
                    child: historyAsync.when(
                      data: (list) => _buildAlertsList(list, isDark, false),
                      loading: () => Column(
                        children: const [
                          SkeletonLoader(width: double.infinity, height: 90),
                          SizedBox(height: 10),
                          SkeletonLoader(width: double.infinity, height: 90),
                        ],
                      ),
                      error: (err, _) => Center(
                        child: Text('Error: $err', style: const TextStyle(color: AppColors.error)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getFilterSummary(WidgetRef ref) {
    final parts = <String>[];
    if (_filterToday) {
      parts.add("Today's Occurrences");
    }
    if (_selectedGroupId != null) {
      final groups = ref.watch(groupsProvider).groups;
      final group = groups.where((g) => g.id == _selectedGroupId).firstOrNull;
      parts.add("Group: ${group?.name ?? 'Channel'}");
    }
    return "Filtered by: ${parts.join(' · ')}";
  }

  Widget _buildFilterChip(String label, String? priorityValue, bool isDark) {
    final isSelected = _selectedPriorityFilter == priorityValue;
    return InkWell(
      onTap: () => setState(() => _selectedPriorityFilter = priorityValue),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark ? AppColors.primaryLight : AppColors.primary)
              : (isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: isSelected
                ? Colors.white
                : (isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
          ),
        ),
      ),
    );
  }

  Widget _buildAlertsList(List<dynamic> list, bool isDark, bool isUpcoming) {
    var filtered = list;

    if (_selectedPriorityFilter != null) {
      filtered = filtered.where((a) => a.priority == _selectedPriorityFilter).toList();
    }

    if (_selectedGroupId != null) {
      filtered = filtered.where((a) => a.groupId == _selectedGroupId).toList();
    }

    if (_filterToday) {
      final now = DateTime.now();
      filtered = filtered.where((a) {
        final t = a.nextTriggerAt ?? a.scheduledAt;
        return t.year == now.year && t.month == now.month && t.day == now.day;
      }).toList();
    }

    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((a) =>
          a.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          a.message.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (a.groupName?.toLowerCase().contains(_searchQuery.toLowerCase()) ?? false)).toList();
    }

    if (filtered.isEmpty) {
      return AppCard(
        padding: const EdgeInsets.all(32),
        child: EmptyState(
          title: isUpcoming ? 'No upcoming alerts' : 'No alert history',
          subtitle: isUpcoming
              ? (_searchQuery.isNotEmpty || _selectedPriorityFilter != null || _selectedGroupId != null || _filterToday
                  ? 'No alerts match your filter criteria.'
                  : 'Create scheduled alerts for your groups and teams.')
              : 'Triggered and completed alerts will appear in your audit history.',
          icon: isUpcoming
              ? Icons.notifications_none_rounded
              : Icons.history_toggle_off_rounded,
          onAction: isUpcoming ? () => context.push('/alerts/new') : null,
          actionLabel: isUpcoming ? 'Create Alert' : null,
        ),
      );
    }

    return ListView.separated(
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
  }
}

