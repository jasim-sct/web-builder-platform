const Alert = require('../models/Alert');
const { calculateNextTriggerAt } = require('../utils/date');
const config = require('../config/env');

class SchedulerService {
  constructor() {
    this.timer = null;
    this.isRunning = false;
    this.isProcessing = false;
  }

  /**
   * Start the interval-based scheduler.
   * @param {number} [intervalMs]
   */
  start(intervalMs) {
    if (this.isRunning) {
      return;
    }

    const interval = intervalMs || config.schedulerIntervalMs || 1000;
    this.isRunning = true;

    this.timer = setInterval(async () => {
      try {
        await this.processDueAlerts();
      } catch (err) {
        if (!config.isTest) {
          console.error('[Scheduler] Error processing due alerts cycle:', err.message);
        }
      }
    }, interval);

    if (!config.isTest) {
      console.log(`[Scheduler] Scheduler started (interval: ${interval}ms)`);
    }
  }

  /**
   * Stop the scheduler interval.
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    if (!config.isTest) {
      console.log('[Scheduler] Scheduler stopped');
    }
  }

  /**
   * Process due alerts for **server-side lifecycle metadata only**.
   *
   * Android devices execute pre-synchronized schedules locally via AlarmManager.
   * This tick must NOT broadcast/socket-ring clients at fire time.
   *
   * @param {Date} [referenceDate=new Date()]
   * @returns {Promise<Array<Object>>} Processed alert summaries
   */
  async processDueAlerts(referenceDate = new Date()) {
    if (this.isProcessing) {
      return [];
    }

    this.isProcessing = true;
    const processedAlerts = [];

    try {
      const now = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);

      // Find all enabled alerts scheduled for execution at or before 'now'
      const dueAlerts = await Alert.find({
        isEnabled: true,
        status: 'SCHEDULED',
        nextTriggerAt: { $lte: now, $ne: null },
      });

      for (const alert of dueAlerts) {
        // ONCE alerts are executed on-device via AlarmManager after sync.
        // Server must not complete them at fire time — that would cancel local alarms on sync.
        if (alert.repeatType === 'ONCE') {
          continue;
        }

        let nextStatus = 'SCHEDULED';
        let nextTrigger = calculateNextTriggerAt(
          alert.repeatType,
          alert.nextTriggerAt || now,
          now
        );

        const updatedAlert = await Alert.findOneAndUpdate(
          {
            _id: alert._id,
            isEnabled: true,
            status: 'SCHEDULED',
            nextTriggerAt: alert.nextTriggerAt,
          },
          {
            $set: {
              status: nextStatus,
              lastTriggeredAt: now,
              nextTriggerAt: nextTrigger,
            },
          },
          { new: true }
        );

        if (updatedAlert) {
          processedAlerts.push({
            alertId: updatedAlert._id.toString(),
            title: updatedAlert.title,
            repeatType: updatedAlert.repeatType,
            status: updatedAlert.status,
            executionMode: 'SERVER_RECURRENCE_METADATA_ONLY',
            lastTriggeredAt: updatedAlert.lastTriggeredAt,
            nextTriggerAt: updatedAlert.nextTriggerAt,
          });
        }
      }
    } finally {
      this.isProcessing = false;
    }

    return processedAlerts;
  }
}

module.exports = new SchedulerService();
