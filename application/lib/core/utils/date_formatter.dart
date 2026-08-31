import 'package:intl/intl.dart';

class DateFormatter {
  static String formatAlertDateTime(DateTime? dateTime) {
    if (dateTime == null) return 'Not scheduled';

    final local = dateTime.toLocal();
    final now = DateTime.now();

    final today = DateTime(now.year, now.month, now.day);
    final tomorrow = today.add(const Duration(days: 1));
    final yesterday = today.subtract(const Duration(days: 1));
    final itemDay = DateTime(local.year, local.month, local.day);

    final timeStr = DateFormat('h:mm a').format(local);

    if (itemDay == today) {
      return 'Today · $timeStr';
    } else if (itemDay == tomorrow) {
      return 'Tomorrow · $timeStr';
    } else if (itemDay == yesterday) {
      return 'Yesterday · $timeStr';
    } else {
      final dateStr = DateFormat('d MMM yyyy').format(local);
      return '$dateStr · $timeStr';
    }
  }

  static String formatDate(DateTime? dateTime) {
    if (dateTime == null) return '';
    return DateFormat('d MMM yyyy').format(dateTime.toLocal());
  }

  static String formatTime(DateTime? dateTime) {
    if (dateTime == null) return '';
    return DateFormat('h:mm a').format(dateTime.toLocal());
  }
}
