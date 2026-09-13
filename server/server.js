const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Import Routes and Middlewares
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const activityRoutes = require('./routes/activityRoutes');
const aiRoutes = require('./routes/aiRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const documentRoutes = require('./routes/documentRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');
const { testConnection } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Global Middleware
// 1. Enable Cross-Origin Resource Sharing (CORS)
const frontendUrl = process.env.FRONTEND_URL;
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (such as mobile apps, curl, same-origin, or reverse proxies)
    if (!origin) return callback(null, true);

    // Support configurable production frontend origin(s) (supports comma-separated list)
    if (frontendUrl) {
      const allowedOrigins = frontendUrl.split(',').map((u) => u.trim().replace(/\/+$/, ''));
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
    }

    // Allow localhost origins for local development
    if (process.env.NODE_ENV !== 'production' || !frontendUrl) {
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
    }

    // If FRONTEND_URL is not defined, allow incoming origin for preview/staging
    if (!frontendUrl) {
      return callback(null, true);
    }

    callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// 2. Parse incoming JSON payloads in request bodies
app.use(express.json());

// Routes
// 1. Root test endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Project & Task Manager API is running'
  });
});

// 2. Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy'
  });
});

// 3. Mount Resource Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/voice', voiceRoutes);

// 4. Catch-all for undefined routes (404)
app.use(notFoundHandler);

// 5. Centralized Error Handling Middleware (must be registered last)
app.use(errorHandler);

// Start the Express HTTP server
app.listen(PORT, HOST, async () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  // Test database connection safely on startup
  await testConnection();
});
