import axios from 'axios';
import { UploadResponse, FilesResponse, StatsResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('🚨 API Request Error:', error);
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('🚨 API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
 
  uploadFile: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  getFiles: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    result?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<FilesResponse> => {
    const response = await api.get('/files', { params });
    return response.data;
  },

  getFile: async (id: string): Promise<{ success: boolean; file: any }> => {
    const response = await api.get(`/files/${id}`);
    return response.data;
  },

  
  getStats: async (): Promise<StatsResponse> => {
    const response = await api.get('/files/stats/summary');
    return response.data;
  },

  
  healthCheck: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.get('/health');
    return response.data;
  },


  getStatus: async (): Promise<any> => {
    const response = await api.get('/status');
    return response.data;
  },
};

export default api;
