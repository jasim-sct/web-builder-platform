const Device = require('../models/Device');
const config = require('../config/env');

/**
 * Optional FCM high-priority data push when FCM_SERVER_KEY is configured.
 * Does not require firebase-admin — uses legacy HTTP API.
 */
class PushService {
  isEnabled() {
    return Boolean(process.env.FCM_SERVER_KEY);
  }

  /**
   * @param {string[]} userIds
   * @param {Object} dataPayload - string key/value pairs
   */
  async sendToUsers(userIds, dataPayload) {
    if (!this.isEnabled() || !userIds?.length) {
      return { sent: 0, skipped: userIds?.length || 0 };
    }

    const devices = await Device.find({
      userId: { $in: userIds },
      isActive: true,
      pushToken: { $ne: '' },
    });

    let sent = 0;
    for (const device of devices) {
      try {
        const ok = await this.sendDataMessage(device.pushToken, dataPayload);
        if (ok) sent++;
      } catch (err) {
        if (!config.isTest) {
          console.warn(`[Push] Failed for device ${device.deviceId}:`, err.message);
        }
      }
    }
    return { sent, skipped: devices.length - sent };
  }

  async sendDataMessage(pushToken, data) {
    const key = process.env.FCM_SERVER_KEY;
    if (!key || !pushToken) return false;

    const body = {
      to: pushToken,
      priority: 'high',
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
    };

    const res = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${key}`,
      },
      body: JSON.stringify(body),
    });

    return res.ok;
  }
}

module.exports = new PushService();
