import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/layout/responsive_layout.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../shared/empty_states/empty_state.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/priority_badge.dart';
import '../../auth/providers/auth_provider.dart';
import '../../groups/providers/groups_provider.dart';
import '../providers/alerts_provider.dart';

class CreateAlertScreen extends ConsumerStatefulWidget {
  const CreateAlertScreen({super.key});

  @override
  ConsumerState<CreateAlertScreen> createState() => _CreateAlertScreenState();
}

class _CreateAlertScreenState extends ConsumerState<CreateAlertScreen> {
  int _currentStep = 0;
  final _titleController = TextEditingController();
  final _messageController = TextEditingController();

  String? _selectedGroupId;
  DateTime _selectedDate = DateTime.now();
  TimeOfDay _selectedTime = TimeOfDay.fromDateTime(
    DateTime.now().add(const Duration(minutes: 30)),
  );
  String _selectedRepeat = 'ONCE';
  String _selectedPriority = 'NORMAL';
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    ref.read(groupsProvider.notifier).fetchGroups();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now().subtract(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() => _selectedDate = picked);
    }
  }

  Future<void> _selectTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
    );
    if (picked != null) {
      setState(() => _selectedTime = picked);
    }
  }

  void _nextStep() {
    setState(() => _errorMessage = null);
    if (_currentStep == 0) {
      if (_titleController.text.trim().isEmpty) {
        setState(() => _errorMessage = 'Please provide an alert title.');
        return;
      }
      if (_messageController.text.trim().isEmpty) {
        setState(() => _errorMessage = 'Please provide an alert message.');
        return;
      }
    } else if (_currentStep == 1) {
      if (_selectedGroupId == null) {
        setState(() => _errorMessage = 'Please select a target channel/group.');
        return;
      }
    }
    setState(() => _currentStep++);
  }

  void _prevStep() {
    if (_currentStep > 0) {
      setState(() {
        _errorMessage = null;
        _currentStep--;
      });
    }
  }

  Future<void> _handleCreate() async {
    final user = ref.read(authProvider).user;
    if (user == null) return;

    final scheduledDateTime = DateTime(
      _selectedDate.year,
      _selectedDate.month,
      _selectedDate.day,
      _selectedTime.hour,
      _selectedTime.minute,
    ).toUtc();

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await ref.read(alertsProvider.notifier).createAlert({
        'title': _titleController.text.trim(),
        'message': _messageController.text.trim(),
        'organizationId': user.organizationId,
        'groupId': _selectedGroupId,
        'scheduledAt': scheduledDateTime.toIso8601String(),
        'repeatType': _selectedRepeat,
        'priority': _selectedPriority,
        'createdBy': user.id,
      });

      if (mounted) {
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = e.toString().replaceAll('Exception: ', '');
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final groupsState = ref.watch(groupsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final stepLabels = ['Content & Priority', 'Recipients', 'Schedule', 'Review & Confirm'];

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      appBar: AppBar(
        title: const Text('Create Scheduled Alert'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: ResponsiveContainer(
          maxWidth: 680,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Wizard Progress Bar
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkSurface : AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isDark ? AppColors.darkBorder : AppColors.border,
                  ),
                ),
                child: Column(
                  children: [
                    Row(
                      children: List.generate(4, (index) {
                        final isCompleted = index < _currentStep;
                        final isCurrent = index == _currentStep;
                        return Expanded(
                          child: Container(
                            margin: EdgeInsets.only(right: index < 3 ? 8 : 0),
                            height: 4,
                            decoration: BoxDecoration(
                              color: isCompleted || isCurrent
                                  ? (isDark ? AppColors.primaryLight : AppColors.primary)
                                  : (isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant),
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        );
                      }),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Step ${_currentStep + 1} of 4: ${stepLabels[_currentStep]}',
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w600,
                            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          '${((_currentStep + 1) / 4 * 100).toInt()}%',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: isDark ? AppColors.primaryLight : AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Error Banner
              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkPriorityUrgentBg : AppColors.priorityUrgentBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 18),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(color: AppColors.error, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Step Content Card
              AppCard(
                padding: const EdgeInsets.all(24),
                child: _buildCurrentStepContent(groupsState, isDark),
              ),
              const SizedBox(height: 20),

              // Navigation Buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (_currentStep > 0)
                    AppButton(
                      label: 'Back',
                      icon: Icons.arrow_back_rounded,
                      variant: AppButtonVariant.outline,
                      onPressed: _prevStep,
                    )
                  else
                    const SizedBox.shrink(),
                  if (_currentStep < 3)
                    AppButton(
                      label: 'Continue',
                      icon: Icons.arrow_forward_rounded,
                      variant: AppButtonVariant.primary,
                      onPressed: _nextStep,
                    )
                  else
                    AppButton(
                      label: 'Schedule Alert',
                      icon: Icons.check_circle_rounded,
                      variant: AppButtonVariant.primary,
                      isLoading: _isLoading,
                      onPressed: _handleCreate,
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCurrentStepContent(dynamic groupsState, bool isDark) {
    switch (_currentStep) {
      case 0:
        return _buildStep1(isDark);
      case 1:
        return _buildStep2(groupsState, isDark);
      case 2:
        return _buildStep3(isDark);
      case 3:
        return _buildStep4(groupsState, isDark);
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildStep1(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Alert Details & Urgency',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Define the headline, description, and visual urgency for recipients.',
          style: TextStyle(fontSize: 13, color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
        ),
        const SizedBox(height: 20),

        AppTextField(
          label: 'Alert Title',
          controller: _titleController,
          hint: 'e.g. Mandatory Team Standup Reminder',
        ),
        const SizedBox(height: 16),

        AppTextField(
          label: 'Alert Message',
          controller: _messageController,
          hint: 'e.g. Please join the engineering bridge to review today sprint goals.',
          maxLines: 3,
        ),
        const SizedBox(height: 20),

        Text(
          'Priority Level',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 10),

        Row(
          children: [
            Expanded(child: _buildPriorityOption('LOW', 'Low', Icons.arrow_downward_rounded, AppColors.priorityLow, isDark)),
            const SizedBox(width: 8),
            Expanded(child: _buildPriorityOption('NORMAL', 'Normal', Icons.circle_outlined, AppColors.priorityNormal, isDark)),
            const SizedBox(width: 8),
            Expanded(child: _buildPriorityOption('HIGH', 'High', Icons.arrow_upward_rounded, AppColors.priorityHigh, isDark)),
            const SizedBox(width: 8),
            Expanded(child: _buildPriorityOption('URGENT', 'Urgent', Icons.warning_amber_rounded, AppColors.priorityUrgent, isDark)),
          ],
        ),
      ],
    );
  }

  Widget _buildPriorityOption(String value, String label, IconData icon, Color color, bool isDark) {
    final isSelected = _selectedPriority == value;
    return InkWell(
      onTap: () => setState(() => _selectedPriority = value),
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? color.withValues(alpha: isDark ? 0.25 : 0.15)
              : (isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? color : (isDark ? AppColors.darkBorder : AppColors.border),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(icon, size: 18, color: isSelected ? color : (isDark ? AppColors.darkTextMuted : AppColors.textMuted)),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected ? (isDark ? Colors.white : color) : (isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep2(dynamic groupsState, bool isDark) {
    final groups = groupsState.groups;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Select Target Channel',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Choose the specific audience channel that will receive this scheduled notification.',
          style: TextStyle(fontSize: 13, color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
        ),
        const SizedBox(height: 18),

        if (groups.isEmpty)
          EmptyState(
            title: 'No Groups Available',
            subtitle: 'Please create a group before scheduling alerts.',
            icon: Icons.groups_outlined,
            onAction: () => context.push('/groups/new'),
            actionLabel: 'Create Group',
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: groups.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final g = groups[index];
              final isSelected = _selectedGroupId == g.id;

              return InkWell(
                onTap: () => setState(() => _selectedGroupId = g.id),
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? (isDark ? AppColors.primaryLight.withValues(alpha: 0.2) : AppColors.primary.withValues(alpha: 0.08))
                        : (isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSelected
                          ? (isDark ? AppColors.primaryLight : AppColors.primary)
                          : (isDark ? AppColors.darkBorder : AppColors.border),
                      width: isSelected ? 1.5 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                        color: isSelected
                            ? (isDark ? AppColors.primaryLight : AppColors.primary)
                            : (isDark ? AppColors.darkTextMuted : AppColors.textMuted),
                        size: 20,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              g.name,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                              ),
                            ),
                            if (g.description != null && g.description!.isNotEmpty)
                              Text(
                                g.description!,
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
                          color: isDark ? AppColors.darkSurface : AppColors.surface,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '${g.memberCount} members',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
      ],
    );
  }

  Widget _buildStep3(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Schedule & Recurrence',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Set when the alert should first ring and how frequently it should re-occur.',
          style: TextStyle(fontSize: 13, color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
        ),
        const SizedBox(height: 20),

        // Date and Time Pickers
        Row(
          children: [
            Expanded(
              child: AppTextField(
                label: 'Trigger Date',
                hint: DateFormatter.formatDate(_selectedDate),
                readOnly: true,
                prefixIcon: const Icon(Icons.calendar_today_rounded, size: 18),
                onTap: _selectDate,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: AppTextField(
                label: 'Trigger Time',
                hint: _selectedTime.format(context),
                readOnly: true,
                prefixIcon: const Icon(Icons.access_time_rounded, size: 18),
                onTap: _selectTime,
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),

        Text(
          'Recurrence Pattern',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 10),

        Row(
          children: [
            Expanded(child: _buildRecurrenceOption('ONCE', 'Once', 'Single execution', isDark)),
            const SizedBox(width: 8),
            Expanded(child: _buildRecurrenceOption('DAILY', 'Daily', 'Every 24 hours', isDark)),
            const SizedBox(width: 8),
            Expanded(child: _buildRecurrenceOption('WEEKLY', 'Weekly', 'Every 7 days', isDark)),
          ],
        ),
      ],
    );
  }

  Widget _buildRecurrenceOption(String value, String title, String subtitle, bool isDark) {
    final isSelected = _selectedRepeat == value;
    return InkWell(
      onTap: () => setState(() => _selectedRepeat = value),
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark ? AppColors.primaryLight.withValues(alpha: 0.2) : AppColors.primary.withValues(alpha: 0.08))
              : (isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected
                ? (isDark ? AppColors.primaryLight : AppColors.primary)
                : (isDark ? AppColors.darkBorder : AppColors.border),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: isSelected
                    ? (isDark ? AppColors.primaryLight : AppColors.primary)
                    : (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 11,
                color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep4(dynamic groupsState, bool isDark) {
    final group = groupsState.groups.cast<dynamic>().firstWhere(
          (g) => g.id == _selectedGroupId,
          orElse: () => null,
        );

    final scheduledDateTime = DateTime(
      _selectedDate.year,
      _selectedDate.month,
      _selectedDate.day,
      _selectedTime.hour,
      _selectedTime.minute,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Review & Confirm Schedule',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Please verify the details below before creating the schedule on the server.',
          style: TextStyle(fontSize: 13, color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary),
        ),
        const SizedBox(height: 20),

        // Live Simulated Alert Card Preview
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isDark ? AppColors.darkBorder : AppColors.border,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  PriorityBadge(priority: _selectedPriority),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurface : AppColors.surface,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      _selectedRepeat,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                _titleController.text.trim(),
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                _messageController.text.trim(),
                style: TextStyle(
                  fontSize: 13,
                  color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 14),
              const Divider(),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.groups_rounded, size: 16, color: AppColors.secondary),
                      const SizedBox(width: 6),
                      Text(
                        group?.name ?? 'Target Channel',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      const Icon(Icons.access_time_rounded, size: 15, color: AppColors.textMuted),
                      const SizedBox(width: 4),
                      Text(
                        DateFormatter.formatAlertDateTime(scheduledDateTime),
                        style: TextStyle(
                          fontSize: 11.5,
                          color: isDark ? AppColors.darkTextMuted : AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}

