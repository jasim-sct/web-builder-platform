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

describe('Broadcast & Trigger Integration Tests', () => {
  let org;
  let group;
  let userA;
  let userB;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    org = await createTestOrganization({ name: 'Broadcast Org' });
    userA = await createTestUser(org._id, { name: 'Alice', email: 'alice@test.com' });
    userB = await createTestUser(org._id, { name: 'Bob', email: 'bob@test.com' });
    group = await createTestGroup(org._id, [userA._id, userB._id]);
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('POST /api/alerts/:id/trigger', () => {
    it('should trigger an existing alert immediately and create delivery records', async () => {
      const alert = await createTestAlert(org._id, group._id, {
        title: 'Emergency Drill',
        repeatType: 'ONCE',
        status: 'SCHEDULED',
      });

      const res = await request(app)
        .post(`/api/alerts/${alert._id}/trigger`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.alertId).toBe(alert._id.toString());
      expect(res.body.data.recipientCount).toBe(2);
      expect(res.body.data.status).toBe('COMPLETED');

      // Verify delivery records in database
      const deliveries = await AlertDelivery.find({ alertId: alert._id });
      expect(deliveries.length).toBe(2);
      const deliveryUserIds = deliveries.map((d) => d.userId.toString());
      expect(deliveryUserIds).toContain(userA._id.toString());
      expect(deliveryUserIds).toContain(userB._id.toString());
    });

    it('should fail if attempting to trigger a disabled alert', async () => {
      const alert = await createTestAlert(org._id, group._id, {
        isEnabled: false,
        status: 'DISABLED',
      });

      const res = await request(app)
        .post(`/api/alerts/${alert._id}/trigger`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Cannot trigger a disabled alert');
    });
  });

  describe('POST /api/alerts/broadcast', () => {
    it('should perform an immediate direct broadcast to a group', async () => {
      const payload = {
        organizationId: org._id.toString(),
        groupId: group._id.toString(),
        title: 'URGENT ANNOUNCEMENT',
        message: 'Please evacuate the floor immediately.',
        priority: 'URGENT',
        createdBy: userA._id.toString(),
      };

      const res = await request(app)
        .post('/api/alerts/broadcast')
        .send(payload)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('URGENT ANNOUNCEMENT');
      expect(res.body.data.recipientCount).toBe(2);
      expect(res.body.data.alertId).toBeDefined();

      const deliveries = await AlertDelivery.find({ alertId: res.body.data.alertId });
      expect(deliveries.length).toBe(2);
    });
  });
});
