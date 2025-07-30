import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

import { connectDatabase } from './config/database';
import routes from './routes';
import { scanWorker } from './services/worker';
import { scanQueue } from './services/queue';
import File from './models/File';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded files)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api', routes);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });

  // Send initial file list
  socket.on('get-files', async () => {
    try {
      const files = await File.find().sort({ uploadedAt: -1 }).limit(50);
      socket.emit('files-update', files);
    } catch (error) {
      console.error('Error sending files:', error);
    }
  });
});

// Listen for scan completion to notify clients
scanQueue.on('job-processing', async (job) => {
  // Notify clients that scanning started
  io.emit('scan-started', { fileId: job.fileId, filename: job.filename });
  
  // Wait for scan completion and notify
  setTimeout(async () => {
    try {
      const updatedFile = await File.findById(job.fileId);
      if (updatedFile && updatedFile.status === 'scanned') {
        io.emit('scan-completed', {
          fileId: job.fileId,
          result: updatedFile.result,
          scannedAt: updatedFile.scannedAt
        });
        
        // Send updated file list
        const allFiles = await File.find().sort({ uploadedAt: -1 }).limit(50);
        io.emit('files-update', allFiles);
      }
    } catch (error) {
      console.error('Error notifying scan completion:', error);
    }
  }, 6000); // Wait 6 seconds (max scan time + buffer)
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start scan worker
    scanWorker.start();
    
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 CyberXplore Malware Scanner API running on port ${PORT}`);
      console.log(`📊 Dashboard: http://localhost:3000`);
      console.log(`🔍 API Docs: http://localhost:${PORT}/api/docs`);
      console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
