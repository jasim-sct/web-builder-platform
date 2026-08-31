const http = require('http');
const ioClient = require('socket.io-client');
const request = require('supertest');
const app = require('../../src/app');
const { initSocket } = require('../../src/socket/socket');
const { connectTestDB, clearTestDB, closeTestDB } = require('../helpers/testDatabase');
const {
  createTestOrganization,
  createTestUser,
  createTestGroup,
  createTestAlert,
} = require('../helpers/testData');
const Group = require('../../src/models/Group');
const AlertDelivery = require('../../src/models/AlertDelivery');

describe('Socket.IO Real-Time & Centralized Membership Tests', () => {
  let server;
  let serverPort;
  let clientSockets = [];

  const createClientSocket = () => {
    const socket = ioClient(`http://localhost:${serverPort}`, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });
    clientSockets.push(socket);
    return socket;
  };

  beforeAll(async () => {
    await connectTestDB();

    server = http.createServer(app);
    initSocket(server);

    await new Promise((resolve) => {
      server.listen(0, () => {
        serverPort = server.address().port;
        resolve();
      });
    });
  });

  afterEach(async () => {
    for (const socket of clientSockets) {
      if (socket.connected) {
        socket.disconnect();
      }
    }
    clientSockets = [];
    await clearTestDB();
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      server.close(resolve);
    });
    await closeTestDB();
  });

  describe('Client Identification and Room Joins', () => {
    it('should identify user and join organization & group rooms', async () => {
      const org = await createTestOrganization();
      const user = await createTestUser(org._id, { name: 'Socket Tester' });
      const group1 = await createTestGroup(org._id, [user._id], { name: 'Group 1' });
      const group2 = await createTestGroup(org._id, [user._id], { name: 'Group 2' });

      const client = createClientSocket();

      await new Promise((resolve, reject) => {
        client.on('connect', () => {
          client.emit('identify', { userId: user._id.toString() }, (res) => {
            try {
              expect(res.success).toBe(true);
              expect(res.data.userId).toBe(user._id.toString());
              expect(res.data.groupCount).toBe(2);
              resolve();
            } catch (err) {
              reject(err);
            }
          });
        });
      });
    });
  });

  describe('Immediate Broadcast & Group Targeting Isolation', () => {
    it('should broadcast only to members of the targeted group', async () => {
      const org = await createTestOrganization();
      const userA = await createTestUser(org._id, { name: 'User A', email: 'a@target.com' });
      const userB = await createTestUser(org._id, { name: 'User B', email: 'b@target.com' });
      const userC = await createTestUser(org._id, { name: 'User C', email: 'c@othergroup.com' });

      const devGroup = await createTestGroup(org._id, [userA._id, userB._id], { name: 'Developers' });
      const designGroup = await createTestGroup(org._id, [userC._id], { name: 'Designers' });

      const clientA = createClientSocket();
      const clientB = createClientSocket();
      const clientC = createClientSocket();

      // Connect and identify all 3 clients
      await Promise.all([
        new Promise((resolve) => {
          clientA.on('connect', () => {
            clientA.emit('identify', { userId: userA._id.toString() }, resolve);
          });
        }),
        new Promise((resolve) => {
          clientB.on('connect', () => {
            clientB.emit('identify', { userId: userB._id.toString() }, resolve);
          });
        }),
        new Promise((resolve) => {
          clientC.on('connect', () => {
            clientC.emit('identify', { userId: userC._id.toString() }, resolve);
          });
        }),
      ]);

      let receivedA = null;
      let receivedB = null;
      let receivedC = null;

      clientA.on('alert:broadcast', (data) => {
        receivedA = data;
      });
      clientB.on('alert:broadcast', (data) => {
        receivedB = data;
      });
      clientC.on('alert:broadcast', (data) => {
        receivedC = data;
      });

      // Send broadcast to Developers group
      const res = await request(app)
        .post('/api/alerts/broadcast')
        .send({
          organizationId: org._id.toString(),
          groupId: devGroup._id.toString(),
          title: 'Deploy Alert',
          message: 'Deploying release 1.0 to staging',
          priority: 'HIGH',
        })
        .expect(200);

      expect(res.body.success).toBe(true);

      // Wait for socket propagation
      await new Promise((r) => setTimeout(r, 200));

      expect(receivedA).not.toBeNull();
      expect(receivedA.title).toBe('Deploy Alert');
      expect(receivedB).not.toBeNull();
      expect(receivedB.title).toBe('Deploy Alert');
      expect(receivedC).toBeNull(); // Client C was NOT in Developers group
    });
  });

  describe('Centralized Group Membership Dynamic Resolution Test', () => {
    it('should resolve alert recipients dynamically after group membership changes', async () => {
      // 1. Create Organization
      const org = await createTestOrganization();

      // 2. Create Users A, B, C
      const userA = await createTestUser(org._id, { name: 'Jasim', email: 'jasim@org.com' });
      const userB = await createTestUser(org._id, { name: 'Rahul', email: 'rahul@org.com' });
      const userC = await createTestUser(org._id, { name: 'Ahmed', email: 'ahmed@org.com' });

      // 3. Create Group with A, B, C
      const group = await createTestGroup(
        org._id,
        [userA._id, userB._id, userC._id],
        { name: 'Core Devs' }
      );

      // 4. Create Alert targeting Group
      const alert = await createTestAlert(org._id, group._id, {
        title: 'Standup Alert',
        message: 'Standup time!',
      });

      // 5. Connect Sockets for A, B, C
      const clientA = createClientSocket();
      const clientB = createClientSocket();
      const clientC = createClientSocket();

      await Promise.all([
        new Promise((resolve) => {
          clientA.on('connect', () => {
            clientA.emit('identify', { userId: userA._id.toString() }, resolve);
          });
        }),
        new Promise((resolve) => {
          clientB.on('connect', () => {
            clientB.emit('identify', { userId: userB._id.toString() }, resolve);
          });
        }),
        new Promise((resolve) => {
          clientC.on('connect', () => {
            clientC.emit('identify', { userId: userC._id.toString() }, resolve);
          });
        }),
      ]);

      // 6. Remove User B from Group via API
      await request(app)
        .delete(`/api/groups/${group._id}/members/${userB._id}`)
        .expect(200);

      // Client B leaves the group room as they were removed
      clientB.emit('leave:group', { groupId: group._id.toString() });
      await new Promise((r) => setTimeout(r, 50));

      let receivedA = null;
      let receivedB = null;
      let receivedC = null;

      clientA.on('alert:triggered', (data) => {
        receivedA = data;
      });
      clientB.on('alert:triggered', (data) => {
        receivedB = data;
      });
      clientC.on('alert:triggered', (data) => {
        receivedC = data;
      });

      // 7. Trigger the scheduled alert via API
      const triggerRes = await request(app)
        .post(`/api/alerts/${alert._id}/trigger`)
        .expect(200);

      expect(triggerRes.body.success).toBe(true);
      expect(triggerRes.body.data.recipientCount).toBe(2);

      // Wait for socket propagation
      await new Promise((r) => setTimeout(r, 200));

      // 8. Verify A and C received the alert, while B did NOT
      expect(receivedA).not.toBeNull();
      expect(receivedC).not.toBeNull();
      expect(receivedB).toBeNull();

      // 9. Verify MongoDB AlertDelivery records
      const deliveries = await AlertDelivery.find({ alertId: alert._id });
      expect(deliveries.length).toBe(2);
      const deliveryUserIds = deliveries.map((d) => d.userId.toString());
      expect(deliveryUserIds).toContain(userA._id.toString());
      expect(deliveryUserIds).toContain(userC._id.toString());
      expect(deliveryUserIds).not.toContain(userB._id.toString());
    });
  });

  describe('Socket Alert Acknowledgement', () => {
    it('should acknowledge an alert via socket event', async () => {
      const org = await createTestOrganization();
      const user = await createTestUser(org._id);
      const group = await createTestGroup(org._id, [user._id]);
      const alert = await createTestAlert(org._id, group._id);

      // Trigger alert first so delivery record exists
      await request(app).post(`/api/alerts/${alert._id}/trigger`).expect(200);

      const client = createClientSocket();

      await new Promise((resolve, reject) => {
        client.on('connect', () => {
          client.emit('identify', { userId: user._id.toString() }, () => {
            client.emit(
              'alert:acknowledge',
              { alertId: alert._id.toString(), userId: user._id.toString() },
              (ackRes) => {
                try {
                  expect(ackRes.success).toBe(true);
                  expect(ackRes.data.status).toBe('ACKNOWLEDGED');
                  resolve();
                } catch (err) {
                  reject(err);
                }
              }
            );
          });
        });
      });

      const delivery = await AlertDelivery.findOne({
        alertId: alert._id,
        userId: user._id,
      });
      expect(delivery.status).toBe('ACKNOWLEDGED');
      expect(delivery.acknowledgedAt).not.toBeNull();
    });
  });
});
