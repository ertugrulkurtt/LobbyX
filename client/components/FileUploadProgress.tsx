import React from 'react';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { formatFileSize, getFileIcon } from '../lib/fileService';

interface FileUploadProgressProps {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  onCancel?: () => void;
}

export default function FileUploadProgress({ 
  file, 
  progress, 
  status, 
  error, 
  onCancel 
}: FileUploadProgressProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <Upload className="w-4 h-4 text-neon-cyan animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-neon-green" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return 'bg-neon-cyan';
      case 'completed':
        return 'bg-neon-green';
      case 'error':
        return 'bg-red-400';
      default:
        return 'bg-gaming-muted';
    }
  };

  return (
    <div className="bg-gaming-surface/80 backdrop-blur-sm border border-gaming-border rounded-lg p-3 mb-3">
      <div className="flex items-center space-x-3">
        {/* File Icon */}
        <div className="text-2xl">{getFileIcon(file.type)}</div>
        
        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gaming-text truncate">
              {file.name}
            </p>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              {status === 'uploading' && onCancel && (
                <button
                  onClick={onCancel}
                  className="p-1 rounded hover:bg-gaming-surface transition-colors"
                  title="İptal"
                >
                  <X className="w-3 h-3 text-gaming-muted" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gaming-muted">
            <span>{formatFileSize(file.size)}</span>
            {status === 'uploading' && (
              <span>{progress}%</span>
            )}
            {status === 'error' && error && (
              <span className="text-red-400">{error}</span>
            )}
          </div>
          
          {/* Progress Bar */}
          {status === 'uploading' && (
            <div className="mt-2 w-full bg-gaming-surface rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all duration-300 ${getStatusColor()}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
