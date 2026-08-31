const { Server } = require('socket.io');
const { registerSocketHandlers } = require('./handlers');

let io = null;

const initSocket = (httpServer, corsOptions = {}) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      ...corsOptions,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    registerSocketHandlers(io, socket);
  });

  return io;
};

const getIO = () => {
  return io;
};

module.exports = {
  initSocket,
  getIO,
};
