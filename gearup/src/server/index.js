const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { StatusCodes } = require('http-status-codes');

const { errorHandler } = require('./middlewares/errorHandler');
const { notFoundHandler } = require('./middlewares/notFoundHandler');
const routes = require('./routes');
const logger = require('./utils/logger');
const { initializeSocketIO } = require('./services/socket');
const config = require('./config');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST']
  }
});

// Initialize Socket.IO
initializeSocketIO(io);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: logger.stream }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({ status: 'OK' });
});

// API routes
app.use('/api/v1', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.port || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, server };