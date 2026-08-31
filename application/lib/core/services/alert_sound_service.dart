import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';

class AlertSoundService {
  static final AlertSoundService _instance = AlertSoundService._internal();
  factory AlertSoundService() => _instance;
  AlertSoundService._internal();

  AudioPlayer? _player;

  Future<void> playAlertSound() async {
    try {
      _player ??= AudioPlayer();
      await _player!.stop();
      await _player!.play(AssetSource('audio/alert.mp3'));
    } catch (e) {
      debugPrint('[AlertSoundService] Audio playback skipped or failed: $e');
    }
  }

  Future<void> stopAlertSound() async {
    try {
      await _player?.stop();
    } catch (_) {}
  }

  void dispose() {
    _player?.dispose();
    _player = null;
  }
}
