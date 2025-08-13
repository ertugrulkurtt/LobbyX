import React, { useState } from 'react';
import { Download, Play, Pause, Eye, FileText, AlertCircle } from 'lucide-react';
import { formatFileSize, getFileIcon, isImage, isVideo, isAudio } from '../lib/fileService';

interface FileMessageProps {
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string;
  isExpired?: boolean;
  className?: string;
}

export default function FileMessage({ 
  fileName, 
  fileSize, 
  fileType, 
  downloadUrl, 
  isExpired = false,
  className = '' 
}: FileMessageProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  const handleDownload = async () => {
    if (isExpired) {
      alert('Bu dosyanın süresi dolmuş ve artık indirilemez.');
      return;
    }

    try {
      setDownloadError(false);
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      setDownloadError(true);
    }
  };

  const handlePreview = () => {
    if (isExpired) {
      alert('Bu dosyanın süresi dolmuş ve artık görüntülenemez.');
      return;
    }

    if (isImage(fileType) || fileType === 'application/pdf') {
      window.open(downloadUrl, '_blank');
    } else {
      setIsPreviewOpen(true);
    }
  };

  const renderPreview = () => {
    if (isExpired) {
      return (
        <div className="flex items-center justify-center h-32 bg-gaming-surface/50 rounded-lg border border-gaming-border">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-400">Dosya süresi dolmuş</p>
          </div>
        </div>
      );
    }

    if (isImage(fileType)) {
      return (
        <div className="relative group cursor-pointer" onClick={handlePreview}>
          <img
            src={downloadUrl}
            alt={fileName}
            className="max-w-xs max-h-48 rounded-lg object-cover"
            onError={() => setDownloadError(true)}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
        </div>
      );
    }

    if (isVideo(fileType)) {
      return (
        <div className="relative">
          <video
            className="max-w-xs max-h-48 rounded-lg"
            controls
            preload="metadata"
            onError={() => setDownloadError(true)}
          >
            <source src={downloadUrl} type={fileType} />
            <p className="text-gaming-muted text-sm">Video oynatılamıyor.</p>
          </video>
        </div>
      );
    }

    if (isAudio(fileType)) {
      return (
        <div className="w-full max-w-xs">
          <audio
            className="w-full"
            controls
            preload="metadata"
            onError={() => setDownloadError(true)}
          >
            <source src={downloadUrl} type={fileType} />
            <p className="text-gaming-muted text-sm">Ses dosyası oynatılamıyor.</p>
          </audio>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`file-message ${className}`}>
      {/* Preview for media files */}
      {(isImage(fileType) || isVideo(fileType) || isAudio(fileType)) && (
        <div className="mb-2">
          {renderPreview()}
        </div>
      )}

      {/* File info and download */}
      <div className={`bg-gaming-surface/50 border border-gaming-border rounded-lg p-3 ${
        isExpired ? 'opacity-60' : ''
      }`}>
        <div className="flex items-center space-x-3">
          {/* File Icon */}
          <div className="text-2xl flex-shrink-0">
            {getFileIcon(fileType)}
          </div>
          
          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gaming-text truncate" title={fileName}>
              {fileName}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gaming-muted">
              <span>{formatFileSize(fileSize)}</span>
              {isExpired && (
                <span className="text-red-400">• Süresi dolmuş</span>
              )}
              {downloadError && (
                <span className="text-red-400">• İndirme hatası</span>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-1">
            {/* Preview button for images and PDFs */}
            {(isImage(fileType) || fileType === 'application/pdf') && !isExpired && (
              <button
                onClick={handlePreview}
                className="p-2 rounded-lg hover:bg-gaming-surface transition-colors"
                title="Önizle"
              >
                <Eye className="w-4 h-4 text-gaming-muted" />
              </button>
            )}
            
            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={isExpired}
              className={`p-2 rounded-lg transition-colors ${
                isExpired 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gaming-surface text-neon-cyan hover:text-neon-purple'
              }`}
              title={isExpired ? 'Dosya süresi dolmuş' : 'İndir'}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
