require('dotenv').config();
const express      = require('express');
const http         = require('http');
const { Server }   = require('socket.io');
const mongoose     = require('mongoose');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const authRoutes    = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const fileRoutes    = require('./routes/files');
const aiRoutes      = require('./routes/ai');
const githubRoutes  = require('./routes/github');
const { initSocketHandlers } = require('./sockets/socketHandler');
const errorHandler  = require('./middleware/errorHandler');

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] },
});
app.set('io', io);

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/api/auth',     authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/files',    fileRoutes);
app.use('/api/ai',       aiRoutes);
app.use('/api/github',   githubRoutes);
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));
app.use(errorHandler);

initSocketHandlers(io);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('[DB] MongoDB connected');
    server.listen(PORT, () => console.log('[Server] Running on port ' + PORT));
  })
  .catch(err => { console.error('[DB] Error:', err.message); process.exit(1); });
