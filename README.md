# CyberXplore Malware Scanner

A comprehensive full-stack application for secure file upload and malware scanning with real-time dashboard monitoring.

## 🚀 Features

- **Secure File Upload**: Support for PDF, DOCX, and image files (max 5MB)
- **Real-time Malware Scanning**: Simulated malware detection with dangerous keyword analysis
- **Live Dashboard**: Real-time updates via WebSocket connections
- **Responsive UI**: Modern, mobile-friendly interface built with React and Tailwind CSS
- **File Management**: Complete file history with filtering and search capabilities
- **Security Alerts**: Optional Slack/webhook notifications for detected threats
- **Statistics Dashboard**: Comprehensive analytics and threat detection metrics

## 🛠 Tech Stack

### Backend
- **Node.js** with **TypeScript**
- **Express.js** for REST API
- **MongoDB** for data persistence
- **Socket.IO** for real-time communication
- **Multer** for file upload handling
- **Custom in-memory queue** for background job processing

### Frontend
- **React** with **TypeScript**
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time updates
- **React Dropzone** for drag-and-drop file uploads
- **Lucide React** for icons
- **React Hot Toast** for notifications

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cyberxplore
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cyberxplore
NODE_ENV=development
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
SLACK_WEBHOOK_URL=your_slack_webhook_url_here
CORS_ORIGIN=http://localhost:3000
```

### 5. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows
net start MongoDB

# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 6. Run the Application

#### Quick Demo (No MongoDB Required)
For a quick demonstration without setting up MongoDB:
```bash
npm run demo
```

Or run components separately:
```bash
# Terminal 1: Start demo backend
npm run server:demo

# Terminal 2: Start frontend
cd client
npm start
```

#### Development Mode (Requires MongoDB)
Start both backend and frontend simultaneously:
```bash
npm run dev
```

This will start:
- Backend API server on `http://localhost:5000`
- Frontend React app on `http://localhost:3000`

#### Production Mode
```bash
# Build the application
npm run build
npm run client:build

# Start the production server
npm start
```

## 🎯 Usage

### File Upload
1. Navigate to the **Upload File** tab
2. Drag and drop a file or click to select
3. Supported formats: PDF, DOCX, JPG, PNG (max 5MB)
4. File will be automatically queued for scanning

### Dashboard Monitoring
1. Switch to the **Dashboard** tab to view all files
2. Monitor real-time scan progress
3. Filter files by status (pending, scanning, scanned) or result (clean, infected)
4. Click "View" to see detailed file information

### Statistics
1. Visit the **Statistics** tab for comprehensive metrics
2. View threat detection rates
3. Monitor scan activity and queue status

## 🔍 How Malware Scanning Works

The application simulates malware scanning by:

1. **File Analysis**: Reads file content (first 10KB for text-based files)
2. **Keyword Detection**: Scans for dangerous keywords including:
   - System commands: `rm -rf`, `eval`, `exec`, `system`
   - Malware signatures: `virus`, `trojan`, `ransomware`, `keylogger`
   - Security threats: `exploit`, `payload`, `injection`
3. **Filename Analysis**: Checks for suspicious filename patterns
4. **Result Classification**: Files are marked as "clean" or "infected"
5. **Notifications**: Infected files trigger security alerts

## 📊 API Endpoints

### File Upload
```http
POST /api/upload
Content-Type: multipart/form-data

# Response
{
  "success": true,
  "message": "File uploaded successfully. Scan in progress...",
  "file": { ... }
}
```

### Get Files
```http
GET /api/files?page=1&limit=10&status=scanned&result=clean

# Response
{
  "success": true,
  "files": [...],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

### Get Statistics
```http
GET /api/files/stats/summary

# Response
{
  "success": true,
  "stats": {
    "total": 100,
    "clean": 85,
    "infected": 15,
    "threatDetectionRate": "15.00"
  }
}
```

### Health Check
```http
GET /api/health

# Response
{
  "success": true,
  "message": "CyberXplore Malware Scanner API is running"
}
```

## 🔔 Slack Integration (Optional)

To enable Slack notifications for detected threats:

1. Create a Slack webhook URL in your Slack workspace
2. Add the webhook URL to your `.env` file:
   ```env
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```
3. Restart the application

When malware is detected, you'll receive formatted alerts in your Slack channel.

## 🛡 Security Features

- **File Type Validation**: Only allows specific file types
- **File Size Limits**: Maximum 5MB per file
- **Rate Limiting**: API request throttling
- **CORS Protection**: Configurable cross-origin policies
- **Input Sanitization**: Secure file handling
- **Error Handling**: Comprehensive error management

## 🧪 Testing

### Test File Upload
Create test files with dangerous keywords to trigger malware detection:

```bash
# Create a test infected file
echo "This file contains malware and eval() function" > test-infected.txt
```

### API Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Upload file
curl -X POST -F "file=@test-file.pdf" http://localhost:5000/api/upload

# Get files
curl http://localhost:5000/api/files
```

## 🚀 Deployment

### Docker (Recommended)
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Cloud Deployment
- **Backend**: Deploy to Heroku, AWS, or DigitalOcean
- **Database**: Use MongoDB Atlas for managed database
- **Frontend**: Deploy to Netlify or Vercel

## 📈 Performance Optimization

- **File Deduplication**: Implement Redis caching for duplicate file detection
- **Queue Scaling**: Replace in-memory queue with RabbitMQ for production
- **CDN Integration**: Use AWS S3 + CloudFront for file storage
- **Database Indexing**: Optimize MongoDB queries with proper indexing

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Check if MongoDB is running
   mongosh --eval "db.adminCommand('ismaster')"
   ```

2. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   npx kill-port 5000
   ```

3. **File Upload Fails**
   - Check file size (max 5MB)
   - Verify file type is supported
   - Ensure uploads directory exists

### Debug Mode
Enable debug logging:
```env
NODE_ENV=development
DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the CyberXplore Developer Challenge
- Inspired by modern cybersecurity practices
- Uses industry-standard security frameworks

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@cyberxplore.com
- Documentation: [Wiki](https://github.com/your-repo/wiki)

---

**⚠️ Security Notice**: This application is for educational and demonstration purposes. In production environments, implement additional security measures including proper malware scanning engines, sandboxing, and comprehensive threat detection systems.
