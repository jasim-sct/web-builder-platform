import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/config/api_config.dart';
import '../../../models/alert.dart';
import '../../../models/alert_delivery.dart';
import '../../auth/providers/auth_provider.dart';

// Upcoming Alerts Provider
final upcomingAlertsProvider = FutureProvider.autoDispose<List<Alert>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final user = ref.watch(authProvider).user;

  final Map<String, dynamic> query = {};
  if (user != null) {
    query['organizationId'] = user.organizationId;
  }

  final res = await api.get(ApiConfig.alertUpcoming, queryParameters: query);
  if (res is List) {
    return res.map((item) => Alert.fromJson(item as Map<String, dynamic>)).toList();
  }
  return [];
});

// Alert History Provider
final alertHistoryProvider = FutureProvider.autoDispose<List<Alert>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final user = ref.watch(authProvider).user;

  final Map<String, dynamic> query = {};
  if (user != null) {
    query['organizationId'] = user.organizationId;
  }

  final res = await api.get(ApiConfig.alertHistory, queryParameters: query);
  if (res is List) {
    return res.map((item) => Alert.fromJson(item as Map<String, dynamic>)).toList();
  }
  return [];
});

// Alert Deliveries Provider for a specific alert
final alertDeliveriesProvider =
    FutureProvider.family.autoDispose<List<AlertDelivery>, String>((ref, alertId) async {
  final api = ref.watch(apiClientProvider);
  final res = await api.get('${ApiConfig.alerts}/$alertId/deliveries');
  if (res is List) {
    return res.map((item) => AlertDelivery.fromJson(item as Map<String, dynamic>)).toList();
  }
  return [];
});

// Alerts State Notifier for CRUD and Actions
class AlertsState {
  final List<Alert> alerts;
  final bool isLoading;
  final String? error;

  const AlertsState({
    this.alerts = const [],
    this.isLoading = false,
    this.error,
  });

  AlertsState copyWith({
    List<Alert>? alerts,
    bool? isLoading,
    String? error,
  }) {
    return AlertsState(
      alerts: alerts ?? this.alerts,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class AlertsNotifier extends StateNotifier<AlertsState> {
  final Ref _ref;

  AlertsNotifier(this._ref) : super(const AlertsState()) {
    fetchAlerts();
  }

  Future<void> fetchAlerts({
    String? groupId,
    String? status,
    String? priority,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final api = _ref.read(apiClientProvider);
      final user = _ref.read(authProvider).user;

      final query = <String, dynamic>{};
      if (user != null) {
        query['organizationId'] = user.organizationId;
      }
      if (groupId != null && groupId.isNotEmpty) query['groupId'] = groupId;
      if (status != null && status.isNotEmpty) query['status'] = status;
      if (priority != null && priority.isNotEmpty) query['priority'] = priority;

      final res = await api.get(ApiConfig.alerts, queryParameters: query);
      if (res is List) {
        final alerts = res.map((e) => Alert.fromJson(e as Map<String, dynamic>)).toList();
        state = state.copyWith(alerts: alerts, isLoading: false);
      } else {
        state = state.copyWith(alerts: [], isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<Alert> createAlert(Map<String, dynamic> data) async {
    final api = _ref.read(apiClientProvider);
    final res = await api.post(ApiConfig.alerts, data: data);
    final created = Alert.fromJson(res as Map<String, dynamic>);
    state = state.copyWith(alerts: [created, ...state.alerts]);
    _ref.invalidate(upcomingAlertsProvider);
    return created;
  }

  Future<Alert> updateAlert(String id, Map<String, dynamic> data) async {
    final api = _ref.read(apiClientProvider);
    final res = await api.put('${ApiConfig.alerts}/$id', data: data);
    final updated = Alert.fromJson(res as Map<String, dynamic>);

    state = state.copyWith(
      alerts: state.alerts.map((a) => a.id == id ? updated : a).toList(),
    );
    _ref.invalidate(upcomingAlertsProvider);
    _ref.invalidate(alertHistoryProvider);
    return updated;
  }

  Future<void> deleteAlert(String id) async {
    final api = _ref.read(apiClientProvider);
    await api.delete('${ApiConfig.alerts}/$id');
    state = state.copyWith(
      alerts: state.alerts.where((a) => a.id != id).toList(),
    );
    _ref.invalidate(upcomingAlertsProvider);
    _ref.invalidate(alertHistoryProvider);
  }

  Future<Alert> toggleAlertEnabled(String id, bool enable) async {
    final api = _ref.read(apiClientProvider);
    final action = enable ? 'enable' : 'disable';
    final res = await api.post('${ApiConfig.alerts}/$id/$action');
    final updated = Alert.fromJson(res as Map<String, dynamic>);

    state = state.copyWith(
      alerts: state.alerts.map((a) => a.id == id ? updated : a).toList(),
    );
    _ref.invalidate(upcomingAlertsProvider);
    return updated;
  }

  Future<Map<String, dynamic>> triggerAlert(String id) async {
    final api = _ref.read(apiClientProvider);
    final res = await api.post('${ApiConfig.alerts}/$id/trigger');
    _ref.invalidate(upcomingAlertsProvider);
    _ref.invalidate(alertHistoryProvider);
    fetchAlerts();
    return res is Map<String, dynamic> ? res : {};
  }

  Future<Map<String, dynamic>> broadcastNow(Map<String, dynamic> data) async {
    final api = _ref.read(apiClientProvider);
    final res = await api.post(ApiConfig.alertBroadcast, data: data);
    _ref.invalidate(alertHistoryProvider);
    fetchAlerts();
    return res is Map<String, dynamic> ? res : {};
  }

  Future<void> acknowledgeAlert(String id) async {
    final user = _ref.read(authProvider).user;
    if (user == null) return;

    final api = _ref.read(apiClientProvider);
    await api.post(
      '${ApiConfig.alerts}/$id/acknowledge',
      data: {'userId': user.id},
    );
    _ref.invalidate(alertHistoryProvider);
  }
}

final alertsProvider = StateNotifierProvider<AlertsNotifier, AlertsState>((ref) {
  return AlertsNotifier(ref);
});
