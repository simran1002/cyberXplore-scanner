import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { Shield, Upload, BarChart3, Settings, RefreshCw } from 'lucide-react';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import StatsCard from './components/StatsCard';
import { apiService } from './services/api';
import { socketService } from './services/socket';
import { FileDocument, FileStats, UploadResponse } from './types';
import toast from 'react-hot-toast';

type TabType = 'upload' | 'dashboard' | 'stats';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [files, setFiles] = useState<FileDocument[]>([]);
  const [stats, setStats] = useState<FileStats>({
    total: 0,
    pending: 0,
    scanning: 0,
    scanned: 0,
    clean: 0,
    infected: 0,
    threatDetectionRate: '0.00'
  });
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  // Fetch files from API
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getFiles({ limit: 50, sortBy: 'uploadedAt', sortOrder: 'desc' });
      if (response.success) {
        setFiles(response.files);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch stats from API
  const fetchStats = useCallback(async () => {
    try {
      const response = await apiService.getStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Handle file upload success
  const handleUploadSuccess = useCallback((response: UploadResponse) => {
    if (response.file) {
      setFiles(prevFiles => [response.file!, ...prevFiles]);
      fetchStats(); // Refresh stats
    }
    // Switch to dashboard to see the uploaded file
    setActiveTab('dashboard');
  }, [fetchStats]);

  // Setup WebSocket connection
  useEffect(() => {
    const socket = socketService.connect();
    
    socket.on('connect', () => {
      setConnected(true);
      toast.success('Connected to real-time updates');
      socketService.requestFiles();
    });

    socket.on('disconnect', () => {
      setConnected(false);
      toast.error('Disconnected from real-time updates');
    });

    // Listen for file updates
    socketService.onFilesUpdate((updatedFiles) => {
      setFiles(updatedFiles);
      fetchStats();
    });

    // Listen for scan events
    socketService.onScanStarted((data) => {
      toast.loading(`Scanning ${data.filename}...`, { id: data.fileId });
      fetchFiles(); // Refresh to show updated status
    });

    socketService.onScanCompleted((data) => {
      const message = data.result === 'clean' 
        ? 'File is clean ✅' 
        : 'Threat detected! ⚠️';
      
      toast.dismiss(data.fileId);
      toast(message, {
        icon: data.result === 'clean' ? '✅' : '⚠️',
        style: {
          background: data.result === 'clean' ? '#10B981' : '#EF4444',
          color: 'white',
        },
      });
      
      fetchFiles(); // Refresh files
      fetchStats(); // Refresh stats
    });

    return () => {
      socketService.disconnect();
    };
  }, [fetchFiles, fetchStats]);

  // Initial data fetch
  useEffect(() => {
    fetchFiles();
    fetchStats();
  }, [fetchFiles, fetchStats]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFiles();
      fetchStats();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchFiles, fetchStats]);

  const tabs = [
    { id: 'upload' as TabType, label: 'Upload File', icon: Upload },
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: BarChart3 },
    { id: 'stats' as TabType, label: 'Statistics', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CyberXplore</h1>
                <p className="text-xs text-gray-500">Malware Scanner Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  connected ? 'bg-success-500' : 'bg-danger-500'
                }`} />
                <span className="text-sm text-gray-600">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <button
                onClick={() => {
                  fetchFiles();
                  fetchStats();
                }}
                className="btn-secondary flex items-center space-x-1"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                    transition-colors duration-200
                    ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload File for Malware Scanning
              </h2>
              <p className="text-gray-600">
                Upload PDF, DOCX, or image files to scan for malware and security threats
              </p>
            </div>
            
            <FileUpload 
              onUploadSuccess={handleUploadSuccess}
              onUploadError={(error) => toast.error(error)}
            />
            
            {/* Recent uploads preview */}
            {files.length > 0 && (
              <div className="mt-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Uploads
                </h3>
                <FileList 
                  files={files.slice(0, 5)} 
                  loading={loading}
                  onRefresh={fetchFiles}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">File Dashboard</h2>
                <p className="text-gray-600">Monitor all uploaded files and their scan results</p>
              </div>
            </div>
            
            <FileList 
              files={files} 
              loading={loading}
              onRefresh={fetchFiles}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Statistics</h2>
              <p className="text-gray-600">
                Overview of scan results and threat detection metrics
              </p>
            </div>
            
            <StatsCard stats={stats} loading={loading} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              © 2025 CyberXplore. Secure file scanning and malware detection.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>API Status: {connected ? '🟢 Online' : '🔴 Offline'}</span>
              <span>Files Scanned: {stats.total}</span>
              <span>Threats Detected: {stats.infected}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
