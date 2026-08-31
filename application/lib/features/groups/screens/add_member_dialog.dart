import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../models/group.dart';
import '../../../shared/loading/loading_view.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../users/providers/users_provider.dart';
import '../providers/groups_provider.dart';

class AddMemberDialog extends ConsumerStatefulWidget {
  final Group group;

  const AddMemberDialog({super.key, required this.group});

  @override
  ConsumerState<AddMemberDialog> createState() => _AddMemberDialogState();
}

class _AddMemberDialogState extends ConsumerState<AddMemberDialog> {
  final Set<String> _selectedUserIds = {};
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    ref.read(usersProvider.notifier).fetchUsers();
  }

  Future<void> _handleAddMembers() async {
    if (_selectedUserIds.isEmpty) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      for (final uId in _selectedUserIds) {
        await ref.read(groupsProvider.notifier).addMember(widget.group.id, uId);
      }
      if (mounted) {
        Navigator.of(context).pop(true);
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
    final usersState = ref.watch(usersProvider);
    final existingMemberIds = {
      ...widget.group.memberIds,
      ...widget.group.members.map((m) => m.id),
    };

    final availableUsers = usersState.users.where((u) => !existingMemberIds.contains(u.id)).toList();

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text('Add Members to ${widget.group.name}', style: AppTextStyles.headingSmall),
      content: SizedBox(
        width: double.maxFinite,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_errorMessage != null) ...[
              Text(
                _errorMessage!,
                style: const TextStyle(color: Colors.red, fontSize: 13),
              ),
              const SizedBox(height: 10),
            ],
            if (usersState.isLoading)
              const SizedBox(height: 120, child: LoadingView(message: 'Loading participants...'))
            else if (availableUsers.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24.0),
                child: Center(
                  child: Text(
                    'All organization participants are already members of this group.',
                    style: AppTextStyles.bodySmall,
                    textAlign: TextAlign.center,
                  ),
                ),
              )
            else
              ConstrainedBox(
                constraints: const BoxConstraints(maxHeight: 280),
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: availableUsers.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 6),
                  itemBuilder: (context, index) {
                    final user = availableUsers[index];
                    final isSelected = _selectedUserIds.contains(user.id);

                    return AppCard(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      border: isSelected
                          ? const BorderSide(color: AppColors.primary, width: 1.5)
                          : null,
                      onTap: () {
                        setState(() {
                          if (isSelected) {
                            _selectedUserIds.remove(user.id);
                          } else {
                            _selectedUserIds.add(user.id);
                          }
                        });
                      },
                      child: Row(
                        children: [
                          Checkbox(
                            value: isSelected,
                            activeColor: AppColors.primary,
                            onChanged: (val) {
                              setState(() {
                                if (val == true) {
                                  _selectedUserIds.add(user.id);
                                } else {
                                  _selectedUserIds.remove(user.id);
                                }
                              });
                            },
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(user.name, style: AppTextStyles.labelMedium),
                                Text(user.email, style: AppTextStyles.bodySmall),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(false),
          child: const Text('Cancel'),
        ),
        AppButton(
          label: 'Add Selected (${_selectedUserIds.length})',
          isLoading: _isLoading,
          onPressed: _selectedUserIds.isEmpty ? null : _handleAddMembers,
        ),
      ],
    );
  }
}
