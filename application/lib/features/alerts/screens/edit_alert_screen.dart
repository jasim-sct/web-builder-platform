import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/date_formatter.dart';
import '../../../core/utils/validators.dart';
import '../../../models/alert.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_dropdown.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../groups/providers/groups_provider.dart';
import '../providers/alerts_provider.dart';

class EditAlertScreen extends ConsumerStatefulWidget {
  final Alert alert;

  const EditAlertScreen({super.key, required this.alert});

  @override
  ConsumerState<EditAlertScreen> createState() => _EditAlertScreenState();
}

class _EditAlertScreenState extends ConsumerState<EditAlertScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _titleController;
  late final TextEditingController _messageController;

  late String _selectedGroupId;
  late DateTime _selectedDate;
  late TimeOfDay _selectedTime;
  late String _selectedRepeat;
  late String _selectedPriority;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.alert.title);
    _messageController = TextEditingController(text: widget.alert.message);
    _selectedGroupId = widget.alert.groupId;
    _selectedDate = widget.alert.scheduledAt.toLocal();
    _selectedTime = TimeOfDay.fromDateTime(widget.alert.scheduledAt.toLocal());
    _selectedRepeat = widget.alert.repeatType;
    _selectedPriority = widget.alert.priority;
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

  Future<void> _handleUpdate() async {
    if (!_formKey.currentState!.validate()) return;

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
      await ref.read(alertsProvider.notifier).updateAlert(widget.alert.id, {
        'title': _titleController.text.trim(),
        'message': _messageController.text.trim(),
        'groupId': _selectedGroupId,
        'scheduledAt': scheduledDateTime.toIso8601String(),
        'repeatType': _selectedRepeat,
        'priority': _selectedPriority,
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
        title: const Text('Edit Alert'),
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
                validator: (v) => Validators.requiredField(v, 'Title'),
              ),
              const SizedBox(height: 16),

              AppTextField(
                label: 'Message',
                controller: _messageController,
                maxLines: 3,
                validator: (v) => Validators.requiredField(v, 'Message'),
              ),
              const SizedBox(height: 16),

              AppDropdown<String>(
                label: 'Target Group',
                value: _selectedGroupId,
                items: groupsState.groups.map((g) {
                  return DropdownMenuItem(
                    value: g.id,
                    child: Text('${g.name} (${g.memberCount} members)'),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedGroupId = val);
                },
              ),
              const SizedBox(height: 16),

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
                label: 'Save Changes',
                width: double.infinity,
                isLoading: _isLoading,
                onPressed: _handleUpdate,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
