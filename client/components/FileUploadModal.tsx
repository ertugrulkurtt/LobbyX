import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { validateFile, formatFileSize, getFileIcon, MAX_FILE_SIZE } from '../lib/fileService';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function FileUploadModal({ 
  isOpen, 
  onClose, 
  onFileSelect, 
  disabled = false 
}: FileUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setValidationError('');
    
    const validation = validateFile(file);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Geçersiz dosya');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSend = () => {
    if (selectedFile && !validationError) {
      onFileSelect(selectedFile);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setValidationError('');
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gaming-surface rounded-2xl shadow-2xl border border-gaming-border max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gaming-border">
          <h3 className="text-lg font-semibold text-gaming-text">Dosya Gönder</h3>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gaming-surface transition-colors"
          >
            <X className="w-5 h-5 text-gaming-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* File Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive
                ? 'border-neon-purple bg-neon-purple/5'
                : 'border-gaming-border hover:border-gaming-muted'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={!disabled ? handleBrowseFiles : undefined}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileInputChange}
              disabled={disabled}
            />

            {selectedFile ? (
              // Selected File Preview
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-3">
                  <div className="text-3xl">{getFileIcon(selectedFile.type)}</div>
                  <div className="text-left">
                    <p className="font-medium text-gaming-text truncate max-w-[200px]" title={selectedFile.name}>
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gaming-muted">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                
                {validationError ? (
                  <div className="flex items-center justify-center space-x-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{validationError}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 text-neon-green">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Dosya hazır</span>
                  </div>
                )}
              </div>
            ) : (
              // Default Upload Area
              <div className="space-y-3">
                <Upload className="w-12 h-12 text-gaming-muted mx-auto" />
                <div>
                  <p className="text-gaming-text font-medium">
                    Dosya sürükleyip bırakın veya tıklayın
                  </p>
                  <p className="text-sm text-gaming-muted mt-1">
                    Maksimum {Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="mt-4 text-xs text-gaming-muted">
            <p className="mb-2">Desteklenen dosya türleri:</p>
            <div className="grid grid-cols-2 gap-1">
              <span>• Resimler (JPG, PNG, GIF)</span>
              <span>• Belgeler (PDF, Word, Excel)</span>
              <span>• Arşivler (ZIP, RAR, 7Z)</span>
              <span>• Medya (MP4, MP3, WAV)</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-gaming-border text-gaming-text hover:bg-gaming-surface transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSend}
              disabled={!selectedFile || !!validationError || disabled}
              className="px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Gönder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
