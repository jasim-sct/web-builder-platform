const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const Organization = require('../../src/models/Organization');
const User = require('../../src/models/User');
const Event = require('../../src/models/Event');
const Device = require('../../src/models/Device');

describe('Event & Device Background API Tests', () => {
  let mongoServer;
  let testOrg;
  let testUser;
  let otherOrg;
  let otherUser;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    testOrg = await Organization.create({ name: 'Event Org' });
    testUser = await User.create({
      name: 'Event User',
      email: 'event@test.com',
      organizationId: testOrg._id,
    });

    otherOrg = await Organization.create({ name: 'Other Org' });
    otherUser = await User.create({
      name: 'Other User',
      email: 'other@test.com',
      organizationId: otherOrg._id,
    });
  });

  afterEach(async () => {
    await Event.deleteMany({});
    await Device.deleteMany({});
    await User.deleteMany({});
    await Organization.deleteMany({});
  });

  it('should register a device and record heartbeat', async () => {
    const regRes = await request(app)
      .post('/api/devices/register')
      .send({
        userId: testUser._id,
        deviceId: 'android_pixel_8',
        installationId: 'inst_123',
        platform: 'ANDROID',
        osVersion: '14',
      })
      .expect(200);

    expect(regRes.body.success).toBe(true);
    expect(regRes.body.data.deviceId).toBe('android_pixel_8');

    const deviceId = regRes.body.data._id;
    const hbRes = await request(app)
      .post(`/api/devices/${deviceId}/heartbeat`)
      .expect(200);

    expect(hbRes.body.success).toBe(true);
  });

  it('should create a mandatory event and acknowledge receipt idempotently across 10 rapid calls', async () => {
    const createRes = await request(app)
      .post('/api/events')
      .send({
        eventId: 'EVT-999',
        organizationId: testOrg._id,
        title: 'Emergency Drill',
        message: 'Acknowledge drill now',
        priority: 'MANDATORY',
        requiresReceive: true,
        scheduledAt: new Date(Date.now() + 60000).toISOString(),
      })
      .expect(201);

    expect(createRes.body.data.eventId).toBe('EVT-999');
    expect(createRes.body.data.priority).toBe('MANDATORY');

    // 10 Rapid Duplicate Calls (Anti-duplicate and Idempotency test)
    for (let i = 0; i < 10; i++) {
      const ackRes = await request(app)
        .post('/api/events/EVT-999/receive')
        .send({
          userId: testUser._id,
          deviceId: 'android_pixel_8',
        })
        .expect(200);

      expect(ackRes.body.data.status).toBe('RECEIVED');
      expect(ackRes.body.data.receivedBy).toHaveLength(1);
    }
  });

  it('should support multi-device receipt on the same event without conflicts', async () => {
    await Event.create({
      eventId: 'EVT-MULTI-1',
      organizationId: testOrg._id,
      title: 'Multi-Device Test Event',
      message: 'Test message',
      scheduledAt: new Date(),
    });

    // Device A receives
    const ackA = await request(app)
      .post('/api/events/EVT-MULTI-1/receive')
      .send({
        userId: testUser._id,
        deviceId: 'phone_a',
      })
      .expect(200);

    expect(ackA.body.data.receivedBy).toHaveLength(1);

    // Device B receives
    const ackB = await request(app)
      .post('/api/events/EVT-MULTI-1/receive')
      .send({
        userId: testUser._id,
        deviceId: 'tablet_b',
      })
      .expect(200);

    expect(ackB.body.data.receivedBy).toHaveLength(2);
  });

  it('should reject unauthorized cross-organization event receipt', async () => {
    await Event.create({
      eventId: 'EVT-SECURE-1',
      organizationId: testOrg._id,
      title: 'Confidential Event',
      message: 'Restricted',
      scheduledAt: new Date(),
    });

    // User from otherOrg tries to acknowledge testOrg event
    const forbiddenRes = await request(app)
      .post('/api/events/EVT-SECURE-1/receive')
      .send({
        userId: otherUser._id,
        deviceId: 'rogue_device',
      })
      .expect(403);

    expect(forbiddenRes.body.success).toBe(false);
  });

  it('should sync events by userId', async () => {
    await Event.create({
      eventId: 'EVT-SYNC-1',
      organizationId: testOrg._id,
      title: 'Sync Item',
      message: 'Testing sync',
      scheduledAt: new Date(),
    });

    const syncRes = await request(app)
      .get(`/api/events/sync?userId=${testUser._id}`)
      .expect(200);

    expect(syncRes.body.success).toBe(true);
    expect(syncRes.body.data.events).toHaveLength(1);
    expect(syncRes.body.data.events[0].eventId).toBe('EVT-SYNC-1');
  });
});
