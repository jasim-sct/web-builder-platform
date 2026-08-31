const Alert = require('../models/Alert');
const broadcastService = require('./broadcast.service');
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
   * Process all alerts currently due for execution.
   * Atomic transition prevents double-triggering across ticks.
   *
   * @param {Date} [referenceDate=new Date()]
   * @returns {Promise<Array<Object>>} List of successfully processed alert summaries
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
        // Calculate new fields
        let nextStatus = 'SCHEDULED';
        let nextTrigger = null;

        if (alert.repeatType === 'ONCE') {
          nextStatus = 'COMPLETED';
          nextTrigger = null;
        } else {
          nextTrigger = calculateNextTriggerAt(alert.repeatType, alert.nextTriggerAt || now, now);
        }

        // Atomically transition the alert to prevent race condition or duplicate processing
        const updatedAlert = await Alert.findOneAndUpdate(
          {
            _id: alert._id,
            isEnabled: true,
            status: 'SCHEDULED',
            nextTriggerAt: alert.nextTriggerAt, // ensure hasn't changed
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
          // Broadcast to current members
          try {
            const broadcastResult = await broadcastService.broadcastAlert(
              updatedAlert,
              'alert:triggered'
            );

            processedAlerts.push({
              alertId: updatedAlert._id.toString(),
              title: updatedAlert.title,
              repeatType: updatedAlert.repeatType,
              status: updatedAlert.status,
              recipientCount: broadcastResult.recipientCount,
              lastTriggeredAt: updatedAlert.lastTriggeredAt,
              nextTriggerAt: updatedAlert.nextTriggerAt,
            });
          } catch (broadcastErr) {
            console.error(`[Scheduler] Broadcast error for alert ${alert._id}:`, broadcastErr.message);
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }

    return processedAlerts;
  }
}

module.exports = new SchedulerService();
