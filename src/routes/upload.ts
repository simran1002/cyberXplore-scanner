import express from 'express';
import File from '../models/File';
import upload, { handleUploadError } from '../middleware/upload';
import { scanQueue } from '../services/queue';
import { UploadResponse } from '../types';

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      } as UploadResponse);
    }

    // Ensure result and status are explicitly set to 'pending'
    const newFile = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      status: 'pending',
      result: 'pending',  // Explicitly set
      uploadedAt: new Date()
    });

    const savedFile = await newFile.save();

    scanQueue.enqueue({
      fileId: savedFile._id.toString(),
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
        status: savedFile.status || 'pending',  // Fallback to prevent null
        result: savedFile.result || 'pending',  // Fallback to prevent null
        uploadedAt: savedFile.uploadedAt,
        scannedAt: savedFile.scannedAt || undefined // Use undefined instead of null
      }
    } as UploadResponse);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during file upload'
    } as UploadResponse);
  }
});

export default router;
