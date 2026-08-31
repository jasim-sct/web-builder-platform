const request = require('supertest');
const app = require('../../src/app');
const { connectTestDB, clearTestDB, closeTestDB } = require('../helpers/testDatabase');
const {
  createTestOrganization,
  createTestUser,
  createTestGroup,
  createTestAlert,
} = require('../helpers/testData');
const AlertDelivery = require('../../src/models/AlertDelivery');

describe('Alert API Integration Tests', () => {
  let org;
  let group;
  let user1;
  let user2;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    org = await createTestOrganization({ name: 'Alert Testing Org' });
    user1 = await createTestUser(org._id, { name: 'User 1', email: 'u1@test.com' });
    user2 = await createTestUser(org._id, { name: 'User 2', email: 'u2@test.com' });
    group = await createTestGroup(org._id, [user1._id, user2._id]);
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('POST /api/alerts', () => {
    it('should create a scheduled alert successfully', async () => {
      const payload = {
        title: 'Weekly Sync',
        message: 'Sprint review and planning',
        organizationId: org._id.toString(),
        groupId: group._id.toString(),
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        repeatType: 'WEEKLY',
        priority: 'HIGH',
        createdBy: user1._id.toString(),
      };

      const res = await request(app)
        .post('/api/alerts')
        .send(payload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Weekly Sync');
      expect(res.body.data.repeatType).toBe('WEEKLY');
      expect(res.body.data.priority).toBe('HIGH');
      expect(res.body.data.status).toBe('SCHEDULED');
      expect(res.body.data.isEnabled).toBe(true);
    });

    it('should reject creating an alert with non-matching group and organization', async () => {
      const otherOrg = await createTestOrganization({ name: 'Other Org' });
      const otherGroup = await createTestGroup(otherOrg._id, []);

      const payload = {
        title: 'Mismatched Alert',
        message: 'Should fail',
        organizationId: org._id.toString(),
        groupId: otherGroup._id.toString(),
        scheduledAt: new Date().toISOString(),
      };

      const res = await request(app)
        .post('/api/alerts')
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Group does not belong to the specified organization');
    });
  });

  describe('GET /api/alerts and GET /api/alerts/:id', () => {
    it('should retrieve all alerts and single alert by ID', async () => {
      const alert = await createTestAlert(org._id, group._id, { title: 'Find Me Alert' });

      const listRes = await request(app)
        .get(`/api/alerts?organizationId=${org._id}`)
        .expect(200);

      expect(listRes.body.success).toBe(true);
      expect(listRes.body.data.length).toBe(1);

      const singleRes = await request(app)
        .get(`/api/alerts/${alert._id}`)
        .expect(200);

      expect(singleRes.body.success).toBe(true);
      expect(singleRes.body.data.title).toBe('Find Me Alert');
    });
  });

  describe('POST /api/alerts/:id/disable and POST /api/alerts/:id/enable', () => {
    it('should disable and re-enable an alert', async () => {
      const alert = await createTestAlert(org._id, group._id);

      // Disable
      const disRes = await request(app)
        .post(`/api/alerts/${alert._id}/disable`)
        .expect(200);

      expect(disRes.body.success).toBe(true);
      expect(disRes.body.data.isEnabled).toBe(false);
      expect(disRes.body.data.status).toBe('DISABLED');

      // Enable
      const enRes = await request(app)
        .post(`/api/alerts/${alert._id}/enable`)
        .expect(200);

      expect(enRes.body.success).toBe(true);
      expect(enRes.body.data.isEnabled).toBe(true);
      expect(enRes.body.data.status).toBe('SCHEDULED');
    });
  });

  describe('POST /api/alerts/:id/acknowledge', () => {
    it('should acknowledge an alert and prevent duplicate records', async () => {
      const alert = await createTestAlert(org._id, group._id);

      // 1. Initial acknowledgement
      const res1 = await request(app)
        .post(`/api/alerts/${alert._id}/acknowledge`)
        .send({ userId: user1._id.toString() })
        .expect(200);

      expect(res1.body.success).toBe(true);
      expect(res1.body.data.status).toBe('ACKNOWLEDGED');
      expect(res1.body.data.acknowledgedAt).toBeDefined();

      // 2. Second acknowledgement call should not create duplicate
      const res2 = await request(app)
        .post(`/api/alerts/${alert._id}/acknowledge`)
        .send({ userId: user1._id.toString() })
        .expect(200);

      expect(res2.body.success).toBe(true);

      const count = await AlertDelivery.countDocuments({
        alertId: alert._id,
        userId: user1._id,
      });
      expect(count).toBe(1);
    });
  });

  describe('GET /api/alerts/:id/deliveries', () => {
    it('should return deliveries for an alert', async () => {
      const alert = await createTestAlert(org._id, group._id);
      await AlertDelivery.create({
        alertId: alert._id,
        userId: user1._id,
        organizationId: org._id,
        status: 'DELIVERED',
      });

      const res = await request(app)
        .get(`/api/alerts/${alert._id}/deliveries`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].userId.email).toBe('u1@test.com');
    });
  });

  describe('GET /api/alerts/history and GET /api/alerts/upcoming', () => {
    it('should retrieve history and upcoming alerts appropriately', async () => {
      // Past / triggered alert
      await createTestAlert(org._id, group._id, {
        title: 'Past Alert',
        status: 'COMPLETED',
        lastTriggeredAt: new Date(Date.now() - 3600000),
      });

      // Upcoming alert
      await createTestAlert(org._id, group._id, {
        title: 'Future Alert',
        status: 'SCHEDULED',
        isEnabled: true,
        nextTriggerAt: new Date(Date.now() + 3600000),
      });

      const histRes = await request(app).get('/api/alerts/history').expect(200);
      expect(histRes.body.success).toBe(true);
      expect(histRes.body.data.length).toBe(1);
      expect(histRes.body.data[0].title).toBe('Past Alert');

      const upRes = await request(app).get('/api/alerts/upcoming').expect(200);
      expect(upRes.body.success).toBe(true);
      expect(upRes.body.data.length).toBe(1);
      expect(upRes.body.data[0].title).toBe('Future Alert');
    });
  });
});
