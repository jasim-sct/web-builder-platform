require('dotenv').config();
const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Group = require('../models/Group');
const Alert = require('../models/Alert');

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected to MongoDB.');

  try {
    // 1. Create or find Organization
    let org = await Organization.findOne({ name: 'Acme Corporation' });
    if (!org) {
      org = await Organization.create({
        name: 'Acme Corporation',
        description: 'Main technology and product development headquarters',
        isActive: true,
      });
      console.log('✔ Created Organization:', org.name, `(${org._id})`);
    } else {
      console.log('ℹ Found existing Organization:', org.name, `(${org._id})`);
    }

    // 2. Create Users
    const usersToCreate = [
      {
        name: 'Jasim Ahmed',
        email: 'mjasimmc@gmail.com',
        phone: '+1 555-0100',
        role: 'ADMIN',
        organizationId: org._id,
        isActive: true,
      },
      {
        name: 'Admin User',
        email: 'admin@acme.com',
        phone: '+1 555-0101',
        role: 'ADMIN',
        organizationId: org._id,
        isActive: true,
      },
      {
        name: 'Alice Johnson',
        email: 'alice@acme.com',
        phone: '+1 555-0102',
        role: 'MEMBER',
        organizationId: org._id,
        isActive: true,
      },
      {
        name: 'Bob Smith',
        email: 'bob@acme.com',
        phone: '+1 555-0103',
        role: 'MEMBER',
        organizationId: org._id,
        isActive: true,
      },
      {
        name: 'Charlie Brown',
        email: 'charlie@acme.com',
        phone: '+1 555-0104',
        role: 'MEMBER',
        organizationId: org._id,
        isActive: true,
      },
    ];

    const usersMap = {};
    for (const userData of usersToCreate) {
      let user = await User.findOne({ email: userData.email, organizationId: org._id });
      if (!user) {
        user = await User.create(userData);
        console.log(`✔ Created User: ${user.name} (${user.role}) - ${user.email}`);
      } else {
        console.log(`ℹ Found User: ${user.name} (${user.role}) - ${user.email}`);
      }
      usersMap[userData.email] = user;
    }

    // 3. Create Groups
    const groupsToCreate = [
      {
        name: 'Engineering Team',
        description: 'Frontend, Backend, and Mobile Core Engineers',
        organizationId: org._id,
        members: [
          usersMap['mjasimmc@gmail.com']._id,
          usersMap['admin@acme.com']._id,
          usersMap['alice@acme.com']._id,
          usersMap['bob@acme.com']._id,
        ],
      },
      {
        name: 'Operations & Support',
        description: 'Customer success and DevOps operations',
        organizationId: org._id,
        members: [
          usersMap['bob@acme.com']._id,
          usersMap['charlie@acme.com']._id,
        ],
      },
      {
        name: 'All Organization Staff',
        description: 'Company-wide general announcement channel',
        organizationId: org._id,
        members: [
          usersMap['mjasimmc@gmail.com']._id,
          usersMap['admin@acme.com']._id,
          usersMap['alice@acme.com']._id,
          usersMap['bob@acme.com']._id,
          usersMap['charlie@acme.com']._id,
        ],
      },
    ];

    const groupsMap = {};
    for (const groupData of groupsToCreate) {
      let group = await Group.findOne({ name: groupData.name, organizationId: org._id });
      if (!group) {
        group = await Group.create(groupData);
        console.log(`✔ Created Group: ${group.name} (${group.members.length} members)`);
      } else {
        group.members = groupData.members;
        await group.save();
        console.log(`ℹ Updated Group: ${group.name} (${group.members.length} members)`);
      }
      groupsMap[groupData.name] = group;
    }

    // 4. Create Sample Alerts
    const now = new Date();
    const alertsToCreate = [
      {
        title: 'Daily Engineering Standup',
        message: 'Please join the daily progress review video conference.',
        organizationId: org._id,
        groupId: groupsMap['Engineering Team']._id,
        scheduledAt: new Date(now.getTime() + 15 * 60000), // in 15 minutes
        repeatType: 'DAILY',
        priority: 'NORMAL',
        status: 'SCHEDULED',
        isEnabled: true,
        createdBy: usersMap['mjasimmc@gmail.com']._id,
      },
      {
        title: 'Weekly Infrastructure Check',
        message: 'DevOps team routine server and database backup validation.',
        organizationId: org._id,
        groupId: groupsMap['Operations & Support']._id,
        scheduledAt: new Date(now.getTime() + 60 * 60000), // in 1 hour
        repeatType: 'WEEKLY',
        priority: 'HIGH',
        status: 'SCHEDULED',
        isEnabled: true,
        createdBy: usersMap['admin@acme.com']._id,
      },
      {
        title: 'Emergency Safety Reminder',
        message: 'Quarterly organization fire and safety procedure review.',
        organizationId: org._id,
        groupId: groupsMap['All Organization Staff']._id,
        scheduledAt: new Date(now.getTime() + 120 * 60000), // in 2 hours
        repeatType: 'ONCE',
        priority: 'URGENT',
        status: 'SCHEDULED',
        isEnabled: true,
        createdBy: usersMap['mjasimmc@gmail.com']._id,
      },
    ];

    for (const alertData of alertsToCreate) {
      const existingAlert = await Alert.findOne({
        title: alertData.title,
        organizationId: org._id,
      });

      if (!existingAlert) {
        const createdAlert = await Alert.create(alertData);
        console.log(`✔ Created Alert: "${createdAlert.title}" [${createdAlert.priority}]`);
      } else {
        console.log(`ℹ Existing Alert: "${existingAlert.title}"`);
      }
    }

    console.log('\n🎉 Database successfully seeded with test users and sample data!');
    console.log('You can now log in directly using:');
    console.log(' 👉 mjasimmc@gmail.com (ADMIN)');
    console.log(' 👉 admin@acme.com (ADMIN)');
    console.log(' 👉 alice@acme.com (MEMBER)');
    console.log(' 👉 bob@acme.com (MEMBER)');
    console.log(' 👉 charlie@acme.com (MEMBER)');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

seed();
