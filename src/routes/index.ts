import express from 'express';
import uploadRoutes from './upload';
import filesRoutes from './files';
import { scanQueue } from '../services/queue';
import { scanWorker } from '../services/worker';

const router = express.Router();

// Mount route modules
router.use('/upload', uploadRoutes);
router.use('/files', filesRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CyberXplore Malware Scanner API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// System status endpoint
router.get('/status', (req, res) => {
  const queueStatus = scanQueue.getQueueStatus();
  const workerStatus = scanWorker.getStatus();

  res.json({
    success: true,
    status: {
      api: 'running',
      database: 'connected',
      queue: queueStatus,
      worker: workerStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    }
  });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    endpoints: {
      'POST /api/upload': {
        description: 'Upload a file for malware scanning',
        accepts: 'multipart/form-data',
        fileField: 'file',
        maxSize: '5MB',
        allowedTypes: ['.pdf', '.docx', '.jpg', '.png']
      },
      'GET /api/files': {
        description: 'Get list of uploaded files',
        queryParams: {
          page: 'Page number (default: 1)',
          limit: 'Items per page (default: 10)',
          status: 'Filter by status (pending, scanning, scanned)',
          result: 'Filter by result (clean, infected)',
          sortBy: 'Sort field (default: uploadedAt)',
          sortOrder: 'Sort order (asc, desc, default: desc)'
        }
      },
      'GET /api/files/:id': {
        description: 'Get specific file details'
      },
      'GET /api/files/stats/summary': {
        description: 'Get file statistics summary'
      },
      'GET /api/health': {
        description: 'API health check'
      },
      'GET /api/status': {
        description: 'System status information'
      }
    }
  });
});

export default router;
