const logger = require('../utils/logger');

let io;

const initializeSocketIO = (socketIO) => {
  io = socketIO;

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      logger.info(`Client ${socket.id} joined room: ${roomId}`);
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      logger.info(`Client ${socket.id} left room: ${roomId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
};

const emitToRoom = (room, event, data) => {
  if (!io) {
    logger.error('Socket.IO not initialized');
    return;
  }
  io.to(room).emit(event, data);
};

module.exports = {
  initializeSocketIO,
  emitToRoom
};