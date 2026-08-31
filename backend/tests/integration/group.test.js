const request = require('supertest');
const app = require('../../src/app');
const { connectTestDB, clearTestDB, closeTestDB } = require('../helpers/testDatabase');
const {
  createTestOrganization,
  createTestUser,
  createTestGroup,
} = require('../helpers/testData');

describe('Group API Integration Tests', () => {
  let org;
  let userA;
  let userB;
  let otherOrgUser;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    org = await createTestOrganization({ name: 'Acme Engineering Org' });
    const otherOrg = await createTestOrganization({ name: 'Other Org' });

    userA = await createTestUser(org._id, { name: 'User A', email: 'a@acme.com' });
    userB = await createTestUser(org._id, { name: 'User B', email: 'b@acme.com' });
    otherOrgUser = await createTestUser(otherOrg._id, { name: 'Other User', email: 'other@other.com' });
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('POST /api/groups', () => {
    it('should create a new group', async () => {
      const payload = {
        name: 'Backend Devs',
        description: 'Node.js & Databases',
        organizationId: org._id.toString(),
      };

      const res = await request(app)
        .post('/api/groups')
        .send(payload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Backend Devs');
      expect(res.body.data.members).toEqual([]);
    });

    it('should fail if group name is empty', async () => {
      const res = await request(app)
        .post('/api/groups')
        .send({ name: '', organizationId: org._id.toString() })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/groups/:id/members/:userId (Membership Management)', () => {
    it('should add members to group and prevent duplicate members', async () => {
      const group = await createTestGroup(org._id, []);

      // 1. Add userA
      const res1 = await request(app)
        .post(`/api/groups/${group._id}/members/${userA._id}`)
        .expect(200);

      expect(res1.body.success).toBe(true);
      expect(res1.body.data.members.length).toBe(1);
      expect(res1.body.data.members[0]._id.toString()).toBe(userA._id.toString());

      // 2. Add userB
      const res2 = await request(app)
        .post(`/api/groups/${group._id}/members/${userB._id}`)
        .expect(200);

      expect(res2.body.success).toBe(true);
      expect(res2.body.data.members.length).toBe(2);

      // 3. Attempt to add userA again (duplicate prevention)
      const resDup = await request(app)
        .post(`/api/groups/${group._id}/members/${userA._id}`)
        .expect(409);

      expect(resDup.body.success).toBe(false);
      expect(resDup.body.message).toContain('already a member');
    });

    it('should reject adding a user belonging to a different organization', async () => {
      const group = await createTestGroup(org._id, []);

      const res = await request(app)
        .post(`/api/groups/${group._id}/members/${otherOrgUser._id}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('does not belong to the same organization');
    });
  });

  describe('GET /api/groups/:id/members', () => {
    it('should retrieve list of members with user details', async () => {
      const group = await createTestGroup(org._id, [userA._id, userB._id]);

      const res = await request(app)
        .get(`/api/groups/${group._id}/members`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].email).toBeDefined();
    });
  });

  describe('DELETE /api/groups/:id/members/:userId', () => {
    it('should remove a member from group', async () => {
      const group = await createTestGroup(org._id, [userA._id, userB._id]);

      const res = await request(app)
        .delete(`/api/groups/${group._id}/members/${userA._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.members.length).toBe(1);
      expect(res.body.data.members[0]._id.toString()).toBe(userB._id.toString());
    });

    it('should return 404 if user to remove is not a member', async () => {
      const group = await createTestGroup(org._id, [userA._id]);

      const res = await request(app)
        .delete(`/api/groups/${group._id}/members/${userB._id}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not a member');
    });
  });

  describe('DELETE /api/groups/:id', () => {
    it('should delete group', async () => {
      const group = await createTestGroup(org._id);

      const res = await request(app)
        .delete(`/api/groups/${group._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      await request(app)
        .get(`/api/groups/${group._id}`)
        .expect(404);
    });
  });
});
