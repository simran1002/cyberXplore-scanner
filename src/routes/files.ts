import express from 'express';
import File from '../models/File';
import { FilesResponse } from '../types';

const router = express.Router();

// GET /files - Fetch all files with optional filtering and pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const result = req.query.result as string;
    const sortBy = req.query.sortBy as string || 'uploadedAt';
    const sortOrder = req.query.sortOrder as string || 'desc';

    // Build filter object
    const filter: any = {};
    if (status && ['pending', 'scanning', 'scanned'].includes(status)) {
      filter.status = status;
    }
    if (result && ['clean', 'infected'].includes(result)) {
      filter.result = result;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [files, total] = await Promise.all([
      File.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      File.countDocuments(filter)
    ]);

    res.json({
      success: true,
      files,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    } as FilesResponse & { totalPages: number; hasNext: boolean; hasPrev: boolean });

  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching files'
    });
  }
});

// GET /files/:id - Get specific file details
router.get('/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.json({
      success: true,
      file
    });

  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching file'
    });
  }
});

// GET /files/stats/summary - Get file statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [
      totalFiles,
      pendingFiles,
      scanningFiles,
      scannedFiles,
      cleanFiles,
      infectedFiles
    ] = await Promise.all([
      File.countDocuments(),
      File.countDocuments({ status: 'pending' }),
      File.countDocuments({ status: 'scanning' }),
      File.countDocuments({ status: 'scanned' }),
      File.countDocuments({ result: 'clean' }),
      File.countDocuments({ result: 'infected' })
    ]);

    res.json({
      success: true,
      stats: {
        total: totalFiles,
        pending: pendingFiles,
        scanning: scanningFiles,
        scanned: scannedFiles,
        clean: cleanFiles,
        infected: infectedFiles,
        threatDetectionRate: totalFiles > 0 ? ((infectedFiles / totalFiles) * 100).toFixed(2) : '0.00'
      }
    });

  } catch (error) {
    console.error('Error fetching file stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching statistics'
    });
  }
});

export default router;
