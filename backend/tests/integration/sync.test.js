const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const Organization = require('../../src/models/Organization');
const User = require('../../src/models/User');
const Group = require('../../src/models/Group');
const Alert = require('../../src/models/Alert');

describe('Sync API Integration Tests', () => {
  let mongoServer;
  let testOrg;
  let testAdmin;
  let testMember;
  let testGroup;
  let testAlert;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    testOrg = await Organization.create({
      name: 'Sync Org',
      description: 'Sync test organization',
    });

    testAdmin = await User.create({
      name: 'Admin User',
      email: 'admin@sync.com',
      role: 'ADMIN',
      organizationId: testOrg._id,
    });

    testMember = await User.create({
      name: 'Member User',
      email: 'member@sync.com',
      role: 'MEMBER',
      organizationId: testOrg._id,
    });

    testGroup = await Group.create({
      name: 'Engineering',
      description: 'Eng team',
      organizationId: testOrg._id,
      members: [testAdmin._id, testMember._id],
    });

    testAlert = await Alert.create({
      title: 'Sprint Planning',
      message: 'Join planning room',
      organizationId: testOrg._id,
      groupId: testGroup._id,
      scheduledAt: new Date(Date.now() + 3600000),
      priority: 'HIGH',
      status: 'SCHEDULED',
      createdBy: testAdmin._id,
    });
  });

  afterEach(async () => {
    await Alert.deleteMany({});
    await Group.deleteMany({});
    await User.deleteMany({});
    await Organization.deleteMany({});
  });

  it('should return complete sync payload by userId', async () => {
    const res = await request(app)
      .get(`/api/sync?userId=${testMember._id}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user._id).toBe(testMember._id.toString());
    expect(res.body.data.organization._id).toBe(testOrg._id.toString());
    expect(res.body.data.groups).toHaveLength(1);
    expect(res.body.data.alerts).toHaveLength(1);
    expect(res.body.data.alerts[0]._id).toBe(testAlert._id.toString());
    expect(res.body.data.memberships).toHaveLength(2);
    expect(res.body.data.serverTime).toBeDefined();
    expect(res.body.data.version).toBeDefined();
  });

  it('should return complete sync payload by organizationId', async () => {
    const res = await request(app)
      .get(`/api/sync?organizationId=${testOrg._id}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.organization._id).toBe(testOrg._id.toString());
    expect(res.body.data.groups).toHaveLength(1);
    expect(res.body.data.alerts).toHaveLength(1);
  });
});
