class AppConstants {
  // Roles
  static const String roleAdmin = 'ADMIN';
  static const String roleMember = 'MEMBER';

  // Alert Priorities
  static const String priorityLow = 'LOW';
  static const String priorityNormal = 'NORMAL';
  static const String priorityHigh = 'HIGH';
  static const String priorityUrgent = 'URGENT';

  // Alert Repeat Types
  static const String repeatOnce = 'ONCE';
  static const String repeatDaily = 'DAILY';
  static const String repeatWeekly = 'WEEKLY';

  // Alert Statuses
  static const String statusScheduled = 'SCHEDULED';
  static const String statusTriggered = 'TRIGGERED';
  static const String statusDisabled = 'DISABLED';
  static const String statusCancelled = 'CANCELLED';
  static const String statusCompleted = 'COMPLETED';

  // Delivery Statuses
  static const String deliveryDelivered = 'DELIVERED';
  static const String deliveryAcknowledged = 'ACKNOWLEDGED';
}
