# CyberXplore Malware Scanner

A comprehensive full-stack application for secure file upload and malware scanning with real-time dashboard monitoring.

##  Features

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


### Backend Setup
1. Clone and install dependencies:
```bash
git clone https://github.com/simran1002/cyberXplore-scanner.git
cd cyberxplore
npm install
```

2. Configure environment variables:
```bash
cp .env
```

3. Start the backend server:
```bash
npm run build
npm start
npm run dev
```

The API will run on http://localhost:5000

### Frontend Setup
1. Navigate to frontend directory:
```bash
cd client
npm install
```

2. Start the React development server:
```bash
npm start
```

The frontend will run on http://localhost:3000

### MongoDB Setup
1. Create a MongoDB Atlas cluster or start local MongoDB
2. Add your MongoDB URI to `.env`:


## 💻 Development

### Running Locally
1. Start MongoDB:
```bash
mongod
```

2. Start backend (terminal 1):
```bash
cd cyberxplore
npm run dev
```

3. Start frontend (terminal 2):
```bash
cd cyberxplore/client
npm start
```

4. Access the application:
- Dashboard: http://localhost:3000
- API: http://localhost:5000
- API Docs: http://localhost:5000/api/docs
- Health Check: http://localhost:5000/api/health

![alt text](<Screenshot (1200).png>)
![alt text](<Screenshot (1201).png>)
![alt text](<Screenshot (1202).png>)