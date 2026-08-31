import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../core/utils/validators.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_dropdown.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../auth/providers/auth_provider.dart';
import '../../groups/providers/groups_provider.dart';
import '../providers/alerts_provider.dart';

class CreateAlertScreen extends ConsumerStatefulWidget {
  const CreateAlertScreen({super.key});

  @override
  ConsumerState<CreateAlertScreen> createState() => _CreateAlertScreenState();
}

class _CreateAlertScreenState extends ConsumerState<CreateAlertScreen> {
  final _formKey = GlobalKey<FormState>();
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

  Future<void> _handleCreate() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedGroupId == null) {
      setState(() => _errorMessage = 'Please select a target group');
      return;
    }

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

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Scheduled Alert'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
                ),
                const SizedBox(height: 16),
              ],

              AppTextField(
                label: 'Alert Title',
                controller: _titleController,
                hint: 'e.g. Daily Standup Reminder',
                validator: (v) => Validators.requiredField(v, 'Title'),
              ),
              const SizedBox(height: 16),

              AppTextField(
                label: 'Message',
                controller: _messageController,
                hint: 'e.g. Please join the video conference now.',
                maxLines: 3,
                validator: (v) => Validators.requiredField(v, 'Message'),
              ),
              const SizedBox(height: 16),

              // Target Group Dropdown
              AppDropdown<String>(
                label: 'Target Group',
                value: _selectedGroupId,
                hint: 'Select target group',
                items: groupsState.groups.map((g) {
                  return DropdownMenuItem(
                    value: g.id,
                    child: Text('${g.name} (${g.memberCount} members)'),
                  );
                }).toList(),
                onChanged: (val) => setState(() => _selectedGroupId = val),
              ),
              const SizedBox(height: 16),

              // Date and Time Pickers
              Row(
                children: [
                  Expanded(
                    child: AppTextField(
                      label: 'Date',
                      hint: DateFormatter.formatDate(_selectedDate),
                      readOnly: true,
                      prefixIcon: const Icon(Icons.calendar_today_rounded, size: 18),
                      onTap: _selectDate,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: AppTextField(
                      label: 'Time',
                      hint: _selectedTime.format(context),
                      readOnly: true,
                      prefixIcon: const Icon(Icons.access_time_rounded, size: 18),
                      onTap: _selectTime,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Repeat Type Dropdown
              AppDropdown<String>(
                label: 'Repeat Type',
                value: _selectedRepeat,
                items: const [
                  DropdownMenuItem(value: 'ONCE', child: Text('Once (Single Trigger)')),
                  DropdownMenuItem(value: 'DAILY', child: Text('Daily (Every 24 Hours)')),
                  DropdownMenuItem(value: 'WEEKLY', child: Text('Weekly (Every 7 Days)')),
                ],
                onChanged: (val) {
                  if (val != null) setState(() => _selectedRepeat = val);
                },
              ),
              const SizedBox(height: 16),

              // Priority Dropdown
              AppDropdown<String>(
                label: 'Priority',
                value: _selectedPriority,
                items: const [
                  DropdownMenuItem(value: 'LOW', child: Text('Low Priority')),
                  DropdownMenuItem(value: 'NORMAL', child: Text('Normal Priority')),
                  DropdownMenuItem(value: 'HIGH', child: Text('High Priority')),
                  DropdownMenuItem(value: 'URGENT', child: Text('Urgent (Prominent Ring)')),
                ],
                onChanged: (val) {
                  if (val != null) setState(() => _selectedPriority = val);
                },
              ),
              const SizedBox(height: 32),

              AppButton(
                label: 'Schedule Alert',
                icon: Icons.alarm_add_rounded,
                width: double.infinity,
                isLoading: _isLoading,
                onPressed: _handleCreate,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
