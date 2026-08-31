import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:vibration/vibration.dart';
import 'alert_sound_service.dart';

class AlertFeedbackService {
  static final AlertFeedbackService _instance = AlertFeedbackService._internal();
  factory AlertFeedbackService() => _instance;
  AlertFeedbackService._internal();

  final AlertSoundService _soundService = AlertSoundService();

  Future<void> triggerAlertFeedback({bool isUrgent = false}) async {
    // 1. Play Alert Sound
    _soundService.playAlertSound();

    // 2. Vibrate
    try {
      final hasVibrator = await Vibration.hasVibrator();
      if (hasVibrator == true) {
        if (isUrgent) {
          // Double pulse pattern for urgent alerts
          await Vibration.vibrate(pattern: [0, 400, 200, 400]);
        } else {
          await Vibration.vibrate(duration: 500);
        }
      } else {
        // Fallback to basic HapticFeedback if platform plugin vibrator not available
        HapticFeedback.heavyImpact();
      }
    } catch (e) {
      debugPrint('[AlertFeedbackService] Vibration error or unsupported: $e');
      try {
        HapticFeedback.vibrate();
      } catch (_) {}
    }
  }

  Future<void> stopFeedback() async {
    await _soundService.stopAlertSound();
    try {
      await Vibration.cancel();
    } catch (_) {}
  }
}
