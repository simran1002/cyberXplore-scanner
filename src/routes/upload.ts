import express from 'express';
import File from '../models/File';
import upload, { handleUploadError } from '../middleware/upload';
import { scanQueue } from '../services/queue';
import { UploadResponse } from '../types';

const router = express.Router();

// POST /upload - File Upload API
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      } as UploadResponse);
    }

    // Create file document in database
    const fileDoc = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      status: 'pending',
      uploadedAt: new Date()
    });

    const savedFile = await fileDoc.save();

    // Enqueue scanning job
    scanQueue.enqueue({
      fileId: savedFile._id!.toString(),
      filename: savedFile.filename,
      path: savedFile.path,
      createdAt: new Date()
    });

    console.log(`📁 File uploaded: ${req.file.originalname} (${req.file.size} bytes)`);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully. Scan in progress...',
      file: {
        _id: savedFile._id,
        filename: savedFile.filename,
        originalName: savedFile.originalName,
        path: savedFile.path,
        size: savedFile.size,
        mimetype: savedFile.mimetype,
        status: savedFile.status,
        result: savedFile.result || null,
        uploadedAt: savedFile.uploadedAt,
        scannedAt: savedFile.scannedAt || null
      }
    } as UploadResponse);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during file upload'
    } as UploadResponse);
  }
});

// Error handling middleware for multer
router.use(handleUploadError);

export default router;
