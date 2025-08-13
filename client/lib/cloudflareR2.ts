/**
 * Cloudflare R2 Storage Service
 * Replaces Firebase Storage for file uploads
 */

// Cloudflare R2 Configuration
const CLOUDFLARE_R2_CONFIG = {
  accountId: import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID || '',
  accessKeyId: import.meta.env.VITE_CLOUDFLARE_R2_ACCESS_KEY_ID || '',
  secretAccessKey: import.meta.env.VITE_CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  bucketName: import.meta.env.VITE_CLOUDFLARE_R2_BUCKET_NAME || 'lobbyxserver',
  region: 'auto', // Cloudflare R2 uses 'auto' region
  endpoint: `https://${import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID || 'lobbyxserver'}.r2.cloudflarestorage.com`,
  publicDomain: import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_DOMAIN || `https://cdn.lobbyx.com` // CDN domain
};

// File size limit: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed file types
const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  // Documents
  'application/pdf', 'text/plain', 'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Archives
  'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
  // Audio
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/flac',
  // Video
  'video/mp4', 'video/avi', 'video/mkv', 'video/mov', 'video/webm', 'video/quicktime'
];

export interface FileMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  storageUrl: string;
  publicUrl: string;
  uploadedAt: string;
  uploadedBy: string;
  folder: string;
}

/**
 * Generate unique file path
 */
const generateFilePath = (
  folder: string, 
  fileName: string, 
  userId: string
): string => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return `${folder}/${userId}/${timestamp}_${randomId}_${cleanFileName}`;
};

/**
 * Get file folder based on type
 */
const getFileFolder = (fileType: string, context?: string): string => {
  if (context === 'profile') return 'profile-pictures';
  if (context === 'chat') return 'chat-files';
  if (context === 'server') return 'server-assets';
  if (context === 'group') return 'group-files';
  
  if (fileType.startsWith('image/')) return 'images';
  if (fileType.startsWith('video/')) return 'videos';
  if (fileType.startsWith('audio/')) return 'audio';
  if (fileType.includes('pdf')) return 'documents';
  
  return 'misc';
};

/**
 * Validate file before upload
 */
const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`
    };
  }

  return { valid: true };
};

/**
 * Upload file to Cloudflare R2
 */
const uploadFileToR2 = async (
  file: File,
  userId: string,
  context?: string,
  onProgress?: (progress: number) => void
): Promise<FileMetadata> => {
  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const folder = getFileFolder(file.type, context);
  const filePath = generateFilePath(folder, file.name, userId);

  try {
    // Create form data for direct upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', filePath);
    formData.append('userId', userId);
    formData.append('folder', folder);

    // Upload via our backend endpoint (we'll create this)
    const response = await fetch('/api/upload-to-r2', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${userId}` // Simple auth for now
      }
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Create file metadata
    const fileMetadata: FileMetadata = {
      id: result.fileId || `${Date.now()}_${Math.random().toString(36).substring(2)}`,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      storageUrl: result.storageUrl,
      publicUrl: result.publicUrl,
      uploadedAt: new Date().toISOString(),
      uploadedBy: userId,
      folder: folder
    };

    return fileMetadata;

  } catch (error) {
    console.error('Error uploading file to R2:', error);
    throw error;
  }
};

/**
 * Delete file from Cloudflare R2
 */
const deleteFileFromR2 = async (filePath: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/delete-from-r2', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filePath })
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting file from R2:', error);
    return false;
  }
};

/**
 * Get direct upload URL for large files
 */
const getR2UploadUrl = async (
  fileName: string,
  fileType: string,
  userId: string,
  context?: string
): Promise<{ uploadUrl: string; fileUrl: string; filePath: string }> => {
  const folder = getFileFolder(fileType, context);
  const filePath = generateFilePath(folder, fileName, userId);

  const response = await fetch('/api/get-r2-upload-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filePath,
      fileType,
      userId
    })
  });

  if (!response.ok) {
    throw new Error('Failed to get upload URL');
  }

  return response.json();
};

/**
 * Convert old Firebase Storage URLs to new Cloudflare URLs
 */
const migrateFirebaseUrlToR2 = (firebaseUrl: string): string => {
  // This would be used during migration phase
  if (firebaseUrl.includes('firebasestorage.googleapis.com')) {
    // Extract file path and convert to R2 URL
    // For now, return the original URL until migration is complete
    return firebaseUrl;
  }
  return firebaseUrl;
};

export {
  uploadFileToR2,
  deleteFileFromR2,
  getR2UploadUrl,
  validateFile,
  generateFilePath,
  getFileFolder,
  migrateFirebaseUrlToR2,
  CLOUDFLARE_R2_CONFIG,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES
};

export default {
  uploadFileToR2,
  deleteFileFromR2,
  getR2UploadUrl,
  validateFile,
  generateFilePath,
  getFileFolder,
  migrateFirebaseUrlToR2,
  CLOUDFLARE_R2_CONFIG,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES
};
