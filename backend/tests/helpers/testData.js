const Organization = require('../../src/models/Organization');
const User = require('../../src/models/User');
const Group = require('../../src/models/Group');
const Alert = require('../../src/models/Alert');

const createTestOrganization = async (overrides = {}) => {
  const defaultOrg = {
    name: 'Acme Corp',
    description: 'A test organization',
    isActive: true,
    ...overrides,
  };
  return await Organization.create(defaultOrg);
};

const createTestUser = async (organizationId, overrides = {}) => {
  const defaultUser = {
    name: 'John Doe',
    email: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}@example.com`,
    phone: '+1234567890',
    role: 'MEMBER',
    organizationId,
    isActive: true,
    ...overrides,
  };
  return await User.create(defaultUser);
};

const createTestAdmin = async (organizationId, overrides = {}) => {
  return await createTestUser(organizationId, {
    name: 'Admin User',
    role: 'ADMIN',
    ...overrides,
  });
};

const createTestGroup = async (organizationId, members = [], overrides = {}) => {
  const defaultGroup = {
    name: 'Core Engineering',
    description: 'Engineering team group',
    organizationId,
    members,
    isActive: true,
    ...overrides,
  };
  return await Group.create(defaultGroup);
};

const createTestAlert = async (organizationId, groupId, overrides = {}) => {
  const defaultAlert = {
    title: 'Daily Standup',
    message: 'Standup starts in 5 minutes.',
    organizationId,
    groupId,
    scheduledAt: new Date(Date.now() + 60000),
    repeatType: 'ONCE',
    priority: 'NORMAL',
    status: 'SCHEDULED',
    isEnabled: true,
    nextTriggerAt: new Date(Date.now() + 60000),
    ...overrides,
  };
  return await Alert.create(defaultAlert);
};

module.exports = {
  createTestOrganization,
  createTestUser,
  createTestAdmin,
  createTestGroup,
  createTestAlert,
};
