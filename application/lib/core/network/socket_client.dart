import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../config/api_config.dart';

enum SocketConnectionStatus {
  disconnected,
  connecting,
  connected,
  error,
}

class SocketClient {
  static final SocketClient _instance = SocketClient._internal();
  factory SocketClient() => _instance;
  SocketClient._internal();

  io.Socket? _socket;
  String? _currentUserId;

  final ValueNotifier<SocketConnectionStatus> connectionStatus =
      ValueNotifier(SocketConnectionStatus.disconnected);

  final _alertTriggeredController = StreamController<Map<String, dynamic>>.broadcast();
  final _alertBroadcastController = StreamController<Map<String, dynamic>>.broadcast();
  final _alertUpdatedController = StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get onAlertTriggered => _alertTriggeredController.stream;
  Stream<Map<String, dynamic>> get onAlertBroadcast => _alertBroadcastController.stream;
  Stream<Map<String, dynamic>> get onAlertUpdated => _alertUpdatedController.stream;

  bool get isConnected => _socket?.connected == true;

  void initAndConnect({String? userId}) {
    if (userId != null) {
      _currentUserId = userId;
    }

    if (_socket != null) {
      if (_socket!.connected) {
        if (_currentUserId != null) {
          identify(_currentUserId!);
        }
        return;
      }
      _socket!.disconnect();
      _socket!.dispose();
    }

    connectionStatus.value = SocketConnectionStatus.connecting;

    try {
      _socket = io.io(
        ApiConfig.socketUrl,
        io.OptionBuilder()
            .setTransports(['websocket', 'polling'])
            .disableAutoConnect()
            .enableReconnection()
            .setReconnectionAttempts(999)
            .setReconnectionDelay(2000)
            .build(),
      );

      _socket!.onConnect((_) {
        debugPrint('[SocketClient] Connected to ${ApiConfig.socketUrl}');
        connectionStatus.value = SocketConnectionStatus.connected;
        if (_currentUserId != null) {
          identify(_currentUserId!);
        }
      });

      _socket!.onDisconnect((reason) {
        debugPrint('[SocketClient] Disconnected: $reason');
        connectionStatus.value = SocketConnectionStatus.disconnected;
      });

      _socket!.onConnectError((err) {
        debugPrint('[SocketClient] Connect Error: $err');
        connectionStatus.value = SocketConnectionStatus.error;
      });

      _socket!.onError((err) {
        debugPrint('[SocketClient] General Socket Error: $err');
      });

      _socket!.on('alert:triggered', (data) {
        debugPrint('[SocketClient] alert:triggered received: $data');
        if (data is Map) {
          _alertTriggeredController.add(Map<String, dynamic>.from(data));
        }
      });

      _socket!.on('alert:broadcast', (data) {
        debugPrint('[SocketClient] alert:broadcast received: $data');
        if (data is Map) {
          _alertBroadcastController.add(Map<String, dynamic>.from(data));
        }
      });

      _socket!.on('alert:updated', (data) {
        debugPrint('[SocketClient] alert:updated received: $data');
        if (data is Map) {
          _alertUpdatedController.add(Map<String, dynamic>.from(data));
        }
      });

      _socket!.connect();
    } catch (e) {
      debugPrint('[SocketClient] Initialization exception: $e');
      connectionStatus.value = SocketConnectionStatus.error;
    }
  }

  void identify(String userId) {
    _currentUserId = userId;
    if (_socket != null && _socket!.connected) {
      debugPrint('[SocketClient] Emitting identify for userId: $userId');
      _socket!.emit('identify', {'userId': userId});
    }
  }

  void joinGroup(String groupId) {
    if (_socket != null && _socket!.connected) {
      _socket!.emit('join:group', {'groupId': groupId});
    }
  }

  void leaveGroup(String groupId) {
    if (_socket != null && _socket!.connected) {
      _socket!.emit('leave:group', {'groupId': groupId});
    }
  }

  void acknowledgeAlert(String alertId, String userId) {
    if (_socket != null && _socket!.connected) {
      _socket!.emit('alert:acknowledge', {
        'alertId': alertId,
        'userId': userId,
      });
    }
  }

  void disconnect() {
    _currentUserId = null;
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    connectionStatus.value = SocketConnectionStatus.disconnected;
  }
}
