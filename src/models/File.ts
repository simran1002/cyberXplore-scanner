import mongoose, { Schema, Document } from 'mongoose';
import { FileDocument } from '../types';

interface IFile extends Omit<FileDocument, '_id'>, Document {}

const FileSchema: Schema = new Schema({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true,
    min: 0
  },
  mimetype: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'scanning', 'scanned'],
    default: 'pending',
    required: true
  },
  result: {
    type: String,
    enum: ['clean', 'infected', 'pending'],
    default: 'pending',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  scannedAt: {
    type: Date
  },
  hash: {
    type: String,
    sparse: true
  }
}, {
  timestamps: true
});

FileSchema.index({ status: 1, uploadedAt: -1 });
FileSchema.index({ result: 1 });
FileSchema.index({ hash: 1 });

export default mongoose.model<IFile>('File', FileSchema);
