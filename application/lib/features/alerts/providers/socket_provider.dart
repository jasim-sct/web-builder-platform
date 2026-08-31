import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/socket_client.dart';
import '../../../core/services/alert_feedback_service.dart';
import '../../../models/alert.dart';
import '../../auth/providers/auth_provider.dart';

class ActiveAlertState {
  final Alert? activeAlert;
  final bool isAcknowledging;
  final String? message;

  const ActiveAlertState({
    this.activeAlert,
    this.isAcknowledging = false,
    this.message,
  });

  bool get hasActiveAlert => activeAlert != null;

  ActiveAlertState copyWith({
    Alert? activeAlert,
    bool? isAcknowledging,
    String? message,
    bool clearActiveAlert = false,
  }) {
    return ActiveAlertState(
      activeAlert: clearActiveAlert ? null : (activeAlert ?? this.activeAlert),
      isAcknowledging: isAcknowledging ?? this.isAcknowledging,
      message: message,
    );
  }
}

class SocketNotifier extends StateNotifier<ActiveAlertState> {
  final SocketClient _socketClient;
  final Ref _ref;
  final AlertFeedbackService _feedbackService = AlertFeedbackService();

  StreamSubscription? _triggeredSub;
  StreamSubscription? _broadcastSub;

  SocketNotifier(this._socketClient, this._ref) : super(const ActiveAlertState()) {
    _subscribeToSocketEvents();
  }

  void _subscribeToSocketEvents() {
    _triggeredSub = _socketClient.onAlertTriggered.listen((data) {
      _handleIncomingAlert(data);
    });

    _broadcastSub = _socketClient.onAlertBroadcast.listen((data) {
      _handleIncomingAlert(data);
    });
  }

  void _handleIncomingAlert(Map<String, dynamic> data) {
    try {
      final alert = Alert.fromJson(data);
      state = state.copyWith(activeAlert: alert);

      // Trigger sound and vibration
      _feedbackService.triggerAlertFeedback(isUrgent: alert.isUrgent);
    } catch (e) {
      debugPrint('[SocketNotifier] Error parsing incoming alert: $e');
    }
  }

  Future<void> acknowledgeActiveAlert() async {
    final alert = state.activeAlert;
    final currentUser = _ref.read(authProvider).user;

    if (alert == null || currentUser == null) {
      dismissActiveAlert();
      return;
    }

    state = state.copyWith(isAcknowledging: true);
    await _feedbackService.stopFeedback();

    try {
      // Call REST API acknowledgement
      final api = _ref.read(apiClientProvider);
      await api.post(
        '/alerts/${alert.id}/acknowledge',
        data: {'userId': currentUser.id},
      );

      // Also emit via socket
      _socketClient.acknowledgeAlert(alert.id, currentUser.id);

      state = state.copyWith(
        isAcknowledging: false,
        clearActiveAlert: true,
        message: 'Alert acknowledged ✓',
      );
    } catch (e) {
      // If REST fails, try socket
      _socketClient.acknowledgeAlert(alert.id, currentUser.id);
      state = state.copyWith(
        isAcknowledging: false,
        clearActiveAlert: true,
        message: 'Alert acknowledged ✓',
      );
    }
  }

  void dismissActiveAlert() {
    _feedbackService.stopFeedback();
    state = state.copyWith(clearActiveAlert: true);
  }

  @override
  void dispose() {
    _triggeredSub?.cancel();
    _broadcastSub?.cancel();
    _feedbackService.stopFeedback();
    super.dispose();
  }
}

final socketAlertProvider = StateNotifierProvider<SocketNotifier, ActiveAlertState>((ref) {
  final socketClient = ref.watch(socketClientProvider);
  return SocketNotifier(socketClient, ref);
});
