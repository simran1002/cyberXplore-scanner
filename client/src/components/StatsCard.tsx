import React from 'react';
import { 
  FileText, 
  Clock, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { FileStats } from '../types';

interface StatsCardProps {
  stats: FileStats;
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats, loading = false }) => {
  const statItems = [
    {
      label: 'Total Files',
      value: stats.total,
      icon: FileText,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
    },
    {
      label: 'Scanning',
      value: stats.scanning,
      icon: Shield,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
      animate: true,
    },
    {
      label: 'Clean',
      value: stats.clean,
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
    },
    {
      label: 'Infected',
      value: stats.infected,
      icon: AlertTriangle,
      color: 'text-danger-600',
      bgColor: 'bg-danger-100',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="card p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="card p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {item.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {item.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${item.bgColor}`}>
                  <Icon 
                    className={`w-6 h-6 ${item.color} ${item.animate ? 'animate-spin' : ''}`} 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Threat Detection Rate */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Threat Detection Rate</h3>
            <TrendingUp className="w-5 h-5 text-primary-600" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-danger-600">
                {stats.threatDetectionRate}%
              </span>
              <span className="text-sm text-gray-500">
                {stats.infected} of {stats.total} files
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-danger-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(parseFloat(stats.threatDetectionRate), 100)}%` }}
              />
            </div>
            
            <p className="text-xs text-gray-500">
              Percentage of files identified as threats
            </p>
          </div>
        </div>

        {/* Scan Activity */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Scan Activity</h3>
            <Activity className="w-5 h-5 text-primary-600" />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed Scans</span>
              <span className="text-lg font-semibold text-gray-900">
                {stats.scanned}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="text-lg font-semibold text-primary-600">
                {stats.scanning}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Queue</span>
              <span className="text-lg font-semibold text-warning-600">
                {stats.pending}
              </span>
            </div>
            
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Success Rate</span>
                <span className="text-lg font-bold text-success-600">
                  {stats.scanned > 0 ? 
                    ((stats.clean / stats.scanned) * 100).toFixed(1) : '0.0'
                  }%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      {stats.total > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Scan Status Overview</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Processing Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {((stats.scanned / stats.total) * 100).toFixed(1)}% Complete
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(stats.scanned / stats.total) * 100}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>{stats.scanned} scanned</span>
              <span>{stats.pending + stats.scanning} remaining</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
