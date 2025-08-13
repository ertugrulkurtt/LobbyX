/**
 * File utility functions
 */

import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  File as FileIcon 
} from 'lucide-react';

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get appropriate icon for file type
 */
export const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return Image;
  if (fileType.startsWith('video/')) return Video;
  if (fileType.startsWith('audio/')) return Music;
  if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text/')) return FileText;
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return Archive;
  
  return FileIcon;
};

/**
 * Get file type category
 */
export const getFileCategory = (fileType: string): 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other' => {
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.startsWith('video/')) return 'video';
  if (fileType.startsWith('audio/')) return 'audio';
  if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text/')) return 'document';
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return 'archive';
  
  return 'other';
};

/**
 * Check if file is an image
 */
export const isImageFile = (fileType: string): boolean => {
  return fileType.startsWith('image/');
};

/**
 * Check if file is a video
 */
export const isVideoFile = (fileType: string): boolean => {
  return fileType.startsWith('video/');
};

/**
 * Check if file is an audio file
 */
export const isAudioFile = (fileType: string): boolean => {
  return fileType.startsWith('audio/');
};

/**
 * Generate a safe filename
 */
export const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

/**
 * Generate a thumbnail URL for supported file types
 */
export const getThumbnailUrl = (fileUrl: string, fileType: string, size: number = 200): string => {
  // For Cloudflare Images, you can use transformations
  if (isImageFile(fileType) && fileUrl.includes('cdn.lobbyx.com')) {
    return `${fileUrl}?width=${size}&height=${size}&fit=cover`;
  }
  
  return fileUrl;
};

export default {
  formatFileSize,
  getFileIcon,
  getFileCategory,
  isImageFile,
  isVideoFile,
  isAudioFile,
  sanitizeFileName,
  getFileExtension,
  getThumbnailUrl
};
