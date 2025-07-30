import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, AlertCircle, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { UploadResponse } from '../types';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUploadSuccess?: (response: UploadResponse) => void;
  onUploadError?: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      const error = 'File size exceeds 5MB limit';
      toast.error(error);
      onUploadError?.(error);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiService.uploadFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        toast.success('File uploaded successfully! Scan in progress...');
        onUploadSuccess?.(response);
      } else {
        throw new Error(response.error || 'Upload failed');
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Upload failed';
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [onUploadSuccess, onUploadError]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: uploading
  });

  const getFileIcon = (isDragActive: boolean) => {
    if (isDragActive) {
      return <Upload className="w-12 h-12 text-primary-500" />;
    }
    return (
      <div className="flex space-x-2">
        <FileText className="w-8 h-8 text-gray-400" />
        <Image className="w-8 h-8 text-gray-400" />
      </div>
    );
  };

  const getBorderColor = () => {
    if (isDragReject) return 'border-danger-300 bg-danger-50';
    if (isDragActive) return 'border-primary-300 bg-primary-50';
    if (uploading) return 'border-warning-300 bg-warning-50';
    return 'border-gray-300 hover:border-gray-400';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 ${getBorderColor()}
          ${uploading ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {getFileIcon(isDragActive)}
          
          <div className="space-y-2">
            {uploading ? (
              <>
                <p className="text-lg font-medium text-warning-700">
                  Uploading file...
                </p>
                <div className="w-64 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">{uploadProgress}%</p>
              </>
            ) : isDragReject ? (
              <>
                <AlertCircle className="w-8 h-8 text-danger-500 mx-auto" />
                <p className="text-lg font-medium text-danger-700">
                  Invalid file type
                </p>
                <p className="text-sm text-gray-500">
                  Please upload PDF, DOCX, or image files only
                </p>
              </>
            ) : isDragActive ? (
              <>
                <p className="text-lg font-medium text-primary-700">
                  Drop the file here
                </p>
                <p className="text-sm text-gray-500">
                  Release to upload
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-700">
                  Drag & drop a file here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOCX, JPG, PNG (max 5MB)
                </p>
              </>
            )}
          </div>
        </div>

        {uploadProgress === 100 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
            <div className="flex items-center space-x-2 text-success-600">
              <CheckCircle className="w-8 h-8" />
              <span className="text-lg font-medium">Upload Complete!</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>
          <strong>Security Notice:</strong> All uploaded files are automatically scanned for malware.
          Files containing suspicious content will be flagged and quarantined.
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
