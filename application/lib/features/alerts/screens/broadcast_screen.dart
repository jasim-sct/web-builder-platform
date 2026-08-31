import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/layout/responsive_layout.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/validators.dart';
import '../../../models/group.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_dropdown.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/confirmation_dialog.dart';
import '../../auth/providers/auth_provider.dart';
import '../../groups/providers/groups_provider.dart';
import '../providers/alerts_provider.dart';

class BroadcastScreen extends ConsumerStatefulWidget {
  const BroadcastScreen({super.key});

  @override
  ConsumerState<BroadcastScreen> createState() => _BroadcastScreenState();
}

class _BroadcastScreenState extends ConsumerState<BroadcastScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController(text: 'URGENT NOTICE');
  final _messageController = TextEditingController();

  String? _selectedGroupId;
  String _selectedPriority = 'URGENT';
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

  Future<void> _handleBroadcast() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedGroupId == null) {
      setState(() => _errorMessage = 'Please select a target group for broadcast');
      return;
    }

    final user = ref.read(authProvider).user;
    if (user == null) return;

    final groupsState = ref.read(groupsProvider);
    final group = groupsState.groups.firstWhere(
      (g) => g.id == _selectedGroupId,
      orElse: () => Group(id: '', name: 'Selected Group', organizationId: ''),
    );

    final confirmed = await ConfirmationDialog.show(
      context,
      title: '⚠ Broadcast Emergency Alert',
      message: 'This message will immediately ring all connected participants in "${group.name}".',
      extraContent: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.priorityUrgentBg,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            const Icon(Icons.people_alt_rounded, color: AppColors.error, size: 20),
            const SizedBox(width: 8),
            Text(
              '${group.memberCount} participants will receive this instantly.',
              style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.error, fontSize: 13),
            ),
          ],
        ),
      ),
      confirmLabel: 'Broadcast Now',
      isDangerous: true,
    );

    if (confirmed != true) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await ref.read(alertsProvider.notifier).broadcastNow({
        'title': _titleController.text.trim(),
        'message': _messageController.text.trim(),
        'organizationId': user.organizationId,
        'groupId': _selectedGroupId,
        'priority': _selectedPriority,
        'createdBy': user.id,
      });

      final recipientCount = res['recipientCount'] ?? group.memberCount;

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Broadcast sent successfully to $recipientCount participants.'),
            backgroundColor: AppColors.success,
          ),
        );
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
    final selectedGroup = groupsState.groups.cast<Group?>().firstWhere(
          (g) => g?.id == _selectedGroupId,
          orElse: () => null,
        );
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      appBar: AppBar(
        title: const Text('Emergency Broadcast'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: ResponsiveContainer(
          maxWidth: 640,
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Warning Notice Banner
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkPriorityUrgentBg : AppColors.priorityUrgentBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppColors.error.withValues(alpha: isDark ? 0.5 : 0.3),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.error.withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.campaign_rounded, color: AppColors.error, size: 22),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Immediate broadcasts bypass all scheduling queues and ring all active participants in real time.',
                          style: TextStyle(
                            color: isDark ? AppColors.errorLight : AppColors.error,
                            fontSize: 13,
                            height: 1.4,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                if (_errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkPriorityUrgentBg : AppColors.priorityUrgentBg,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(_errorMessage!, style: const TextStyle(color: AppColors.error, fontSize: 13)),
                  ),
                  const SizedBox(height: 16),
                ],

                // Form Card
                AppCard(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Target Group
                      AppDropdown<String>(
                        label: 'Target Channel',
                        value: _selectedGroupId,
                        hint: 'Select channel to alert',
                        items: groupsState.groups.map((g) {
                          return DropdownMenuItem(
                            value: g.id,
                            child: Text('${g.name} (${g.memberCount} members)'),
                          );
                        }).toList(),
                        onChanged: (val) => setState(() => _selectedGroupId = val),
                      ),
                      const SizedBox(height: 16),

                      if (selectedGroup != null) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          decoration: BoxDecoration(
                            color: isDark ? AppColors.darkSurfaceVariant : AppColors.surfaceVariant,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Icons.people_outline_rounded,
                                size: 16,
                                color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Audience: ${selectedGroup.memberCount} participants will be alerted instantly',
                                style: TextStyle(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w500,
                                  color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      AppTextField(
                        label: 'Broadcast Title',
                        controller: _titleController,
                        validator: (v) => Validators.requiredField(v, 'Title'),
                      ),
                      const SizedBox(height: 16),

                      AppTextField(
                        label: 'Message',
                        controller: _messageController,
                        hint: 'Type emergency broadcast message...',
                        maxLines: 4,
                        validator: (v) => Validators.requiredField(v, 'Message'),
                      ),
                      const SizedBox(height: 16),

                      AppDropdown<String>(
                        label: 'Urgency Priority',
                        value: _selectedPriority,
                        items: const [
                          DropdownMenuItem(value: 'URGENT', child: Text('Urgent (Immediate Audible Alarm)')),
                          DropdownMenuItem(value: 'HIGH', child: Text('High Priority')),
                          DropdownMenuItem(value: 'NORMAL', child: Text('Normal Priority')),
                        ],
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedPriority = val);
                        },
                      ),
                      const SizedBox(height: 28),

                      AppButton(
                        label: 'SEND BROADCAST NOW',
                        icon: Icons.campaign_rounded,
                        variant: AppButtonVariant.danger,
                        size: AppButtonSize.large,
                        width: double.infinity,
                        isLoading: _isLoading,
                        onPressed: _handleBroadcast,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

