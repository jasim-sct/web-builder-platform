const { connectTestDB, clearTestDB, closeTestDB } = require('../helpers/testDatabase');
const {
  createTestOrganization,
  createTestUser,
  createTestGroup,
  createTestAlert,
} = require('../helpers/testData');
const Alert = require('../../src/models/Alert');
const AlertDelivery = require('../../src/models/AlertDelivery');
const schedulerService = require('../../src/services/scheduler.service');

describe('Scheduler Service Integration Tests', () => {
  let org;
  let group;
  let user1;
  let user2;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    org = await createTestOrganization({ name: 'Scheduler Testing Org' });
    user1 = await createTestUser(org._id, { name: 'User 1', email: 'sched1@test.com' });
    user2 = await createTestUser(org._id, { name: 'User 2', email: 'sched2@test.com' });
    group = await createTestGroup(org._id, [user1._id, user2._id]);
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  it('should process ONCE alerts and mark them COMPLETED', async () => {
    const pastTime = new Date(Date.now() - 5000);
    const alert = await createTestAlert(org._id, group._id, {
      title: 'One-time Reminder',
      repeatType: 'ONCE',
      scheduledAt: pastTime,
      nextTriggerAt: pastTime,
      status: 'SCHEDULED',
      isEnabled: true,
    });

    const processed = await schedulerService.processDueAlerts();

    expect(processed.length).toBe(1);
    expect(processed[0].alertId).toBe(alert._id.toString());
    expect(processed[0].status).toBe('COMPLETED');
    expect(processed[0].recipientCount).toBe(2);

    const updatedAlert = await Alert.findById(alert._id);
    expect(updatedAlert.status).toBe('COMPLETED');
    expect(updatedAlert.nextTriggerAt).toBeNull();
    expect(updatedAlert.lastTriggeredAt).toBeDefined();

    const deliveries = await AlertDelivery.find({ alertId: alert._id });
    expect(deliveries.length).toBe(2);
  });

  it('should process DAILY alerts and schedule next trigger 24 hours later', async () => {
    const pastTime = new Date(Date.now() - 5000);
    const alert = await createTestAlert(org._id, group._id, {
      title: 'Daily Meeting',
      repeatType: 'DAILY',
      scheduledAt: pastTime,
      nextTriggerAt: pastTime,
      status: 'SCHEDULED',
      isEnabled: true,
    });

    const processed = await schedulerService.processDueAlerts();

    expect(processed.length).toBe(1);
    expect(processed[0].alertId).toBe(alert._id.toString());
    expect(processed[0].status).toBe('SCHEDULED');

    const updatedAlert = await Alert.findById(alert._id);
    expect(updatedAlert.status).toBe('SCHEDULED');
    expect(updatedAlert.nextTriggerAt).not.toBeNull();
    expect(new Date(updatedAlert.nextTriggerAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('should process WEEKLY alerts and schedule next trigger 7 days later', async () => {
    const pastTime = new Date(Date.now() - 5000);
    const alert = await createTestAlert(org._id, group._id, {
      title: 'Weekly All Hands',
      repeatType: 'WEEKLY',
      scheduledAt: pastTime,
      nextTriggerAt: pastTime,
      status: 'SCHEDULED',
      isEnabled: true,
    });

    const processed = await schedulerService.processDueAlerts();

    expect(processed.length).toBe(1);
    expect(processed[0].alertId).toBe(alert._id.toString());
    expect(processed[0].status).toBe('SCHEDULED');

    const updatedAlert = await Alert.findById(alert._id);
    expect(updatedAlert.status).toBe('SCHEDULED');
    const diffDays =
      (new Date(updatedAlert.nextTriggerAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThanOrEqual(6.9);
  });

  it('should prevent double triggers in consecutive scheduler cycles', async () => {
    const pastTime = new Date(Date.now() - 5000);
    await createTestAlert(org._id, group._id, {
      title: 'No Double Trigger',
      repeatType: 'ONCE',
      scheduledAt: pastTime,
      nextTriggerAt: pastTime,
      status: 'SCHEDULED',
      isEnabled: true,
    });

    // First cycle
    const cycle1 = await schedulerService.processDueAlerts();
    expect(cycle1.length).toBe(1);

    // Second cycle immediately after
    const cycle2 = await schedulerService.processDueAlerts();
    expect(cycle2.length).toBe(0);
  });

  it('should not process disabled alerts even if their nextTriggerAt is in past', async () => {
    const pastTime = new Date(Date.now() - 5000);
    await createTestAlert(org._id, group._id, {
      title: 'Disabled Alert',
      repeatType: 'ONCE',
      scheduledAt: pastTime,
      nextTriggerAt: pastTime,
      status: 'DISABLED',
      isEnabled: false,
    });

    const processed = await schedulerService.processDueAlerts();
    expect(processed.length).toBe(0);
  });
});
