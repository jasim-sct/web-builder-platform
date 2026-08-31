const request = require('supertest');
const app = require('../../src/app');
const { connectTestDB, clearTestDB, closeTestDB } = require('../helpers/testDatabase');
const { createTestOrganization } = require('../helpers/testData');

describe('Organization API Integration Tests', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('POST /api/organizations', () => {
    it('should create a new organization successfully', async () => {
      const payload = {
        name: 'Globex Corporation',
        description: 'High-tech multinational',
        createdBy: 'Admin Lead',
      };

      const res = await request(app)
        .post('/api/organizations')
        .send(payload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Globex Corporation');
      expect(res.body.data.description).toBe('High-tech multinational');
      expect(res.body.data.isActive).toBe(true);
      expect(res.body.data._id).toBeDefined();
    });

    it('should fail if organization name is missing or empty', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .send({ name: '   ', description: 'Invalid empty name' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Organization name');
    });
  });

  describe('GET /api/organizations', () => {
    it('should retrieve list of organizations', async () => {
      await createTestOrganization({ name: 'Org A' });
      await createTestOrganization({ name: 'Org B' });

      const res = await request(app)
        .get('/api/organizations')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    it('should filter organizations by isActive', async () => {
      await createTestOrganization({ name: 'Active Org', isActive: true });
      await createTestOrganization({ name: 'Inactive Org', isActive: false });

      const res = await request(app)
        .get('/api/organizations?isActive=true')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Active Org');
    });
  });

  describe('GET /api/organizations/:id', () => {
    it('should retrieve a single organization by ID', async () => {
      const org = await createTestOrganization({ name: 'Specific Org' });

      const res = await request(app)
        .get(`/api/organizations/${org._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Specific Org');
    });

    it('should return 404 for non-existent organization ID', async () => {
      const nonExistentId = '65e0a0000000000000000000';
      const res = await request(app)
        .get(`/api/organizations/${nonExistentId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid ObjectId format', async () => {
      const res = await request(app)
        .get('/api/organizations/invalid-id-123')
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/organizations/:id', () => {
    it('should update an existing organization', async () => {
      const org = await createTestOrganization({ name: 'Old Org Name' });

      const res = await request(app)
        .put(`/api/organizations/${org._id}`)
        .send({ name: 'Updated Org Name', isActive: false })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Org Name');
      expect(res.body.data.isActive).toBe(false);
    });
  });

  describe('DELETE /api/organizations/:id', () => {
    it('should delete an organization', async () => {
      const org = await createTestOrganization();

      const res = await request(app)
        .delete(`/api/organizations/${org._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      // Verify deletion
      await request(app)
        .get(`/api/organizations/${org._id}`)
        .expect(404);
    });
  });
});
