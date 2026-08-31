const { connectTestDB, clearTestDB, closeTestDB } = require('../helpers/testDatabase');
const {
  createTestOrganization,
  createTestUser,
  createTestGroup,
  createTestAlert,
} = require('../helpers/testData');
const Alert = require('../../src/models/Alert');
const schedulerService = require('../../src/services/scheduler.service');

describe('Scheduler Service Integration Tests', () => {
  let org;
  let group;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    org = await createTestOrganization({ name: 'Scheduler Testing Org' });
    const user1 = await createTestUser(org._id, { name: 'User 1', email: 'sched1@test.com' });
    const user2 = await createTestUser(org._id, { name: 'User 2', email: 'sched2@test.com' });
    group = await createTestGroup(org._id, [user1._id, user2._id]);
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  it('should NOT auto-complete ONCE alerts — Android owns local execution', async () => {
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
    expect(processed.length).toBe(0);

    const updatedAlert = await Alert.findById(alert._id);
    expect(updatedAlert.status).toBe('SCHEDULED');
    expect(updatedAlert.nextTriggerAt).not.toBeNull();
  });

  it('should advance DAILY recurrence metadata without client broadcast', async () => {
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
    expect(processed[0].executionMode).toBe('SERVER_RECURRENCE_METADATA_ONLY');

    const updatedAlert = await Alert.findById(alert._id);
    expect(updatedAlert.status).toBe('SCHEDULED');
    expect(updatedAlert.nextTriggerAt).not.toBeNull();
    expect(new Date(updatedAlert.nextTriggerAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('should advance WEEKLY recurrence metadata', async () => {
    const pastTime = new Date(Date.now() - 5000);
    await createTestAlert(org._id, group._id, {
      title: 'Weekly All Hands',
      repeatType: 'WEEKLY',
      scheduledAt: pastTime,
      nextTriggerAt: pastTime,
      status: 'SCHEDULED',
      isEnabled: true,
    });

    const processed = await schedulerService.processDueAlerts();
    expect(processed.length).toBe(1);
  });

  it('should not process disabled alerts', async () => {
    const pastTime = new Date(Date.now() - 5000);
    await createTestAlert(org._id, group._id, {
      title: 'Disabled Alert',
      repeatType: 'DAILY',
      scheduledAt: pastTime,
      nextTriggerAt: pastTime,
      status: 'DISABLED',
      isEnabled: false,
    });

    const processed = await schedulerService.processDueAlerts();
    expect(processed.length).toBe(0);
  });
});
