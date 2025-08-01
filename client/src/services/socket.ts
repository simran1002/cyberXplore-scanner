import { io, Socket } from 'socket.io-client';
import { FileDocument } from '../types';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    console.log('🔌 Connecting to WebSocket server...');

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from WebSocket server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚨 WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('🚨 Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected to WebSocket server (attempt ${attemptNumber})`);
    });
  }

  onFilesUpdate(callback: (files: FileDocument[]) => void): void {
    this.socket?.on('files-update', callback);
  }

  onScanStarted(callback: (data: { fileId: string; filename: string }) => void): void {
    this.socket?.on('scan-started', callback);
  }

  onScanCompleted(callback: (data: { 
    fileId: string; 
    result: 'clean' | 'infected'; 
    scannedAt: string 
  }) => void): void {
    this.socket?.on('scan-completed', callback);
  }

  requestFiles(): void {
    this.socket?.emit('get-files');
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

 
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting from WebSocket server...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
export default socketService;
