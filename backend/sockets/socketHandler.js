const jwt  = require('jsonwebtoken');
const File = require('../models/File');

function auth(socket, next) {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) return next(new Error('Auth required'));
  try { const d = jwt.verify(token, process.env.JWT_SECRET); socket.userId = d.id; next(); }
  catch { next(new Error('Invalid token')); }
}

exports.initSocketHandlers = (io) => {
  io.use(auth);
  io.on('connection', (socket) => {
    console.log('[Socket] Connected:', socket.id);

    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`);
      socket.currentProject = projectId;
      socket.to(`project:${projectId}`).emit('user:joined', { socketId: socket.id });
    });

    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit('user:left', { socketId: socket.id });
    });

    socket.on('code:change', async ({ projectId, fileId, content, cursorPosition }) => {
      socket.to(`project:${projectId}`).emit('code:change', { fileId, content, cursorPosition, socketId: socket.id });
      try { await File.findByIdAndUpdate(fileId, { $set: { content, lastModified: new Date() } }); }
      catch (err) { console.error('[Socket] Save error:', err.message); }
    });

    socket.on('cursor:move', (data) => {
      if (socket.currentProject)
        socket.to(`project:${socket.currentProject}`).emit('cursor:move', { ...data, socketId: socket.id });
    });

    socket.on('disconnect', () => {
      if (socket.currentProject)
        io.to(`project:${socket.currentProject}`).emit('user:left', { socketId: socket.id });
    });
  });
};
