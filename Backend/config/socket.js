const socketIO = require('socket.io');

let io;

exports.initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*', // Note: should restrict in production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join room based on User ID or Job ID for isolated events
    socket.on('join', (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    // Receive live location updates from Provider En Route
    socket.on('updateLocation', (data) => {
      // Broadcast this location update to anyone tracking this job (Customer/Ops)
      io.to(data.jobId).emit('locationUpdated', data);
    });
    
    // Status update triggers
    socket.on('jobStatusUpdate', (data) => {
       // Broadcast status update
       io.to(data.jobId).emit('statusChanged', data);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

exports.getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
