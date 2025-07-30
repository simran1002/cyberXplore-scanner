const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = 5000;

// In-memory storage for demo
let files = [];
let fileIdCounter = 1;

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Create uploads directory
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}-${randomString}${extension}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Malware scanner simulation
const dangerousKeywords = [
  'rm -rf', 'eval', 'bitcoin', 'malware', 'virus', 'trojan', 'ransomware',
  'keylogger', 'backdoor', 'rootkit', 'spyware', 'worm', 'exploit'
];

async function scanFile(fileData) {
  // Simulate scanning delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000));
  
  let threats = [];
  
  try {
    // Read file content for text files
    if (fileData.size < 1024 * 1024) { // Only read files smaller than 1MB
      const content = fs.readFileSync(fileData.path, 'utf8').toLowerCase();
      
      for (const keyword of dangerousKeywords) {
        if (content.includes(keyword.toLowerCase())) {
          threats.push(keyword);
        }
      }
    }
  } catch (error) {
    // If file can't be read as text, that's fine
  }
  
  // Check filename
  const filename = fileData.originalName.toLowerCase();
  const suspiciousNames = ['virus', 'malware', 'trojan', 'hack', 'crack'];
  
  for (const suspicious of suspiciousNames) {
    if (filename.includes(suspicious)) {
      threats.push(`Suspicious filename: ${suspicious}`);
    }
  }
  
  const result = threats.length > 0 ? 'infected' : 'clean';
  
  // Update file status
  const fileIndex = files.findIndex(f => f._id === fileData._id);
  if (fileIndex !== -1) {
    files[fileIndex].status = 'scanned';
    files[fileIndex].result = result;
    files[fileIndex].scannedAt = new Date().toISOString();
    
    // Emit scan completion
    io.emit('scan-completed', {
      fileId: fileData._id,
      result: result,
      scannedAt: files[fileIndex].scannedAt
    });
    
    // Send updated files list
    io.emit('files-update', files);
    
    console.log(`✅ Scan completed for ${fileData.originalName}: ${result.toUpperCase()}`);
    if (threats.length > 0) {
      console.log(`⚠️  Threats detected: ${threats.join(', ')}`);
    }
  }
}

// Routes
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const fileData = {
      _id: fileIdCounter++,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      status: 'pending',
      result: null,
      uploadedAt: new Date().toISOString(),
      scannedAt: null
    };

    files.unshift(fileData);

    console.log(`📁 File uploaded: ${req.file.originalname} (${req.file.size} bytes)`);

    // Start scanning in background
    setTimeout(() => {
      fileData.status = 'scanning';
      io.emit('scan-started', { fileId: fileData._id, filename: fileData.filename });
      scanFile(fileData);
    }, 1000);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully. Scan in progress...',
      file: fileData
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during file upload'
    });
  }
});

app.get('/api/files', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;
  const result = req.query.result;

  let filteredFiles = files;

  if (status && ['pending', 'scanning', 'scanned'].includes(status)) {
    filteredFiles = filteredFiles.filter(file => file.status === status);
  }

  if (result && ['clean', 'infected'].includes(result)) {
    filteredFiles = filteredFiles.filter(file => file.result === result);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

  res.json({
    success: true,
    files: paginatedFiles,
    total: filteredFiles.length,
    page,
    limit,
    totalPages: Math.ceil(filteredFiles.length / limit),
    hasNext: endIndex < filteredFiles.length,
    hasPrev: page > 1
  });
});

app.get('/api/files/stats/summary', (req, res) => {
  const stats = {
    total: files.length,
    pending: files.filter(f => f.status === 'pending').length,
    scanning: files.filter(f => f.status === 'scanning').length,
    scanned: files.filter(f => f.status === 'scanned').length,
    clean: files.filter(f => f.result === 'clean').length,
    infected: files.filter(f => f.result === 'infected').length
  };

  stats.threatDetectionRate = stats.total > 0 ? 
    ((stats.infected / stats.total) * 100).toFixed(2) : '0.00';

  res.json({
    success: true,
    stats
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CyberXplore Malware Scanner API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });

  socket.on('get-files', () => {
    socket.emit('files-update', files.slice(0, 50));
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 CyberXplore Malware Scanner API running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:3000`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 API Docs: http://localhost:${PORT}/api/docs`);
});
