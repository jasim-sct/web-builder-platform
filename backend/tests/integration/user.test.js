const request = require('supertest');
const app = require('../../src/app');
const { connectTestDB, clearTestDB, closeTestDB } = require('../helpers/testDatabase');
const { createTestOrganization, createTestUser, createTestAdmin } = require('../helpers/testData');

describe('User API Integration Tests', () => {
  let testOrg;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    testOrg = await createTestOrganization({ name: 'Acme Test Org' });
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('POST /api/users', () => {
    it('should create an ADMIN user successfully', async () => {
      const payload = {
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        phone: '+15551234',
        role: 'ADMIN',
        organizationId: testOrg._id.toString(),
      };

      const res = await request(app)
        .post('/api/users')
        .send(payload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Sarah Connor');
      expect(res.body.data.email).toBe('sarah@example.com');
      expect(res.body.data.role).toBe('ADMIN');
      expect(res.body.data.organizationId).toBe(testOrg._id.toString());
      expect(res.body.data.isActive).toBe(true);
    });

    it('should create a MEMBER user by default', async () => {
      const payload = {
        name: 'John Connor',
        email: 'john@example.com',
        organizationId: testOrg._id.toString(),
      };

      const res = await request(app)
        .post('/api/users')
        .send(payload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('MEMBER');
    });

    it('should prevent duplicate email in the same organization', async () => {
      await createTestUser(testOrg._id, { email: 'duplicate@example.com' });

      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'Another User',
          email: 'duplicate@example.com',
          organizationId: testOrg._id.toString(),
        })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('should fail if organization does not exist', async () => {
      const nonExistentOrgId = '65e0a0000000000000000000';
      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'Invalid User',
          email: 'test@example.com',
          organizationId: nonExistentOrgId,
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Organization does not exist');
    });
  });

  describe('GET /api/users', () => {
    it('should retrieve all users with filtering by role and organization', async () => {
      const otherOrg = await createTestOrganization({ name: 'Other Org' });
      await createTestAdmin(testOrg._id, { email: 'admin1@acme.com' });
      await createTestUser(testOrg._id, { email: 'member1@acme.com' });
      await createTestUser(otherOrg._id, { email: 'member2@other.com' });

      const res = await request(app)
        .get(`/api/users?organizationId=${testOrg._id}&role=ADMIN`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].email).toBe('admin1@acme.com');
      expect(res.body.data[0].role).toBe('ADMIN');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should retrieve a single user by ID', async () => {
      const user = await createTestUser(testOrg._id, { name: 'Specific User' });

      const res = await request(app)
        .get(`/api/users/${user._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Specific User');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user information and deactivate user', async () => {
      const user = await createTestUser(testOrg._id, { name: 'Active User' });

      const res = await request(app)
        .put(`/api/users/${user._id}`)
        .send({ name: 'Deactivated User', isActive: false, role: 'ADMIN' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Deactivated User');
      expect(res.body.data.isActive).toBe(false);
      expect(res.body.data.role).toBe('ADMIN');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      const user = await createTestUser(testOrg._id);

      const res = await request(app)
        .delete(`/api/users/${user._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      await request(app)
        .get(`/api/users/${user._id}`)
        .expect(404);
    });
  });
});
