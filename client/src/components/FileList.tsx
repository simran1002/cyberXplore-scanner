import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  Filter,
  RefreshCw
} from 'lucide-react';
import { FileDocument, FilterStatus, FilterResult } from '../types';
import { formatFileSize, formatDate, getFileIcon } from '../utils/helpers';
import clsx from 'clsx';

interface FileListProps {
  files: FileDocument[];
  loading?: boolean;
  onRefresh?: () => void;
}

const FileList: React.FC<FileListProps> = ({ files, loading = false, onRefresh }) => {
  const [filteredFiles, setFilteredFiles] = useState<FileDocument[]>(files);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [resultFilter, setResultFilter] = useState<FilterResult>('all');
  const [selectedFile, setSelectedFile] = useState<FileDocument | null>(null);

  useEffect(() => {
    let filtered = files;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(file => file.status === statusFilter);
    }

    // Filter by result
    if (resultFilter !== 'all') {
      filtered = filtered.filter(file => file.result === resultFilter);
    }

    setFilteredFiles(filtered);
  }, [files, statusFilter, resultFilter]);

  const getStatusBadge = (status: string, result: string | null) => {
    switch (status) {
      case 'pending':
        return (
          <span className="status-pending flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'scanning':
        return (
          <span className="status-scanning flex items-center space-x-1">
            <Shield className="w-3 h-3 animate-spin" />
            <span>Scanning</span>
          </span>
        );
      case 'scanned':
        if (result === 'clean') {
          return (
            <span className="status-clean flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>Clean</span>
            </span>
          );
        } else if (result === 'infected') {
          return (
            <span className="status-infected flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Infected</span>
            </span>
          );
        }
        break;
      default:
        return <span className="status-badge bg-gray-100 text-gray-600">Unknown</span>;
    }
  };

  const getRowClassName = (file: FileDocument) => {
    return clsx(
      'hover:bg-gray-50 transition-colors duration-150',
      {
        'bg-danger-50 border-l-4 border-danger-500': file.result === 'infected',
        'bg-success-50 border-l-4 border-success-500': file.result === 'clean',
        'bg-warning-50 border-l-4 border-warning-500': file.status === 'scanning',
      }
    );
  };

  if (loading) {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-primary-600" />
          <span className="text-gray-600">Loading files...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="scanning">Scanning</option>
              <option value="scanned">Scanned</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Result:</label>
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value as FilterResult)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All</option>
              <option value="clean">Clean</option>
              <option value="infected">Infected</option>
            </select>
          </div>

          <button
            onClick={onRefresh}
            className="btn-secondary text-sm flex items-center space-x-1"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="card overflow-hidden">
        {filteredFiles.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No files found</p>
            <p className="text-sm text-gray-400 mt-1">
              {files.length === 0 ? 'Upload some files to get started' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scanned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFiles.map((file) => (
                  <tr key={file._id} className={getRowClassName(file)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.mimetype)}
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {file.originalName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {file.mimetype}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(file.status, file.result)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(file.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.scannedAt ? formatDate(file.scannedAt) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => setSelectedFile(file)}
                        className="text-primary-600 hover:text-primary-900 flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* File Details Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">File Details</h3>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">File Name</label>
                <p className="text-sm text-gray-900">{selectedFile.originalName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Size</label>
                <p className="text-sm text-gray-900">{formatFileSize(selectedFile.size)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Type</label>
                <p className="text-sm text-gray-900">{selectedFile.mimetype}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  {getStatusBadge(selectedFile.status, selectedFile.result)}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Uploaded</label>
                <p className="text-sm text-gray-900">{formatDate(selectedFile.uploadedAt)}</p>
              </div>
              
              {selectedFile.scannedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Scanned</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedFile.scannedAt)}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedFile(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileList;
