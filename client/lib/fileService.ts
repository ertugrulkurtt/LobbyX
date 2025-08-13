import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL, 
  deleteObject,
  getMetadata,
  updateMetadata 
} from 'firebase/storage';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { storage, db } from './firebase';

// File size limit: 50MB
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

// Allowed file types
export const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
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
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4',
  // Video
  'video/mp4', 'video/avi', 'video/mkv', 'video/mov', 'video/webm'
];

export interface FileMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  storageUrl: string;
  downloadUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  conversationId: string;
  messageId?: string;
  isExpired: boolean;
  expiresAt: string; // 1 month from upload
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number; // 0-100
}

/**
 * Validate file before upload
 */
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `Dosya boyutu çok büyük. Maksimum ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB olabilir.` 
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Bu dosya türü desteklenmiyor.' 
    };
  }

  return { isValid: true };
};

/**
 * Generate unique file path
 */
const generateFilePath = (conversationId: string, fileName: string): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `conversations/${conversationId}/${timestamp}_${sanitizedFileName}`;
};

/**
 * Upload file to Firebase Storage
 */
export const uploadFile = async (
  file: File,
  conversationId: string,
  uploadedBy: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<FileMetadata> => {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Generate file path
    const filePath = generateFilePath(conversationId, file.name);
    const storageRef = ref(storage, filePath);

    // Calculate expiration date (1 month from now)
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 1);

    // Upload file with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress tracking
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress({
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              progress: Math.round(progress)
            });
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject(new Error('Dosya yüklenirken hata oluştu.'));
        },
        async () => {
          try {
            // Get download URL
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

            // Save metadata to Firestore
            const fileMetadata: Omit<FileMetadata, 'id'> = {
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              storageUrl: filePath,
              downloadUrl,
              uploadedBy,
              uploadedAt: new Date().toISOString(),
              conversationId,
              isExpired: false,
              expiresAt: expirationDate.toISOString()
            };

            const docRef = await addDoc(collection(db, 'fileUploads'), fileMetadata);

            resolve({
              id: docRef.id,
              ...fileMetadata
            });
          } catch (error) {
            console.error('Error saving file metadata:', error);
            reject(new Error('Dosya bilgileri kaydedilemedi.'));
          }
        }
      );
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    throw error;
  }
};

/**
 * Delete file from storage and database
 */
export const deleteFile = async (fileMetadata: FileMetadata): Promise<void> => {
  try {
    // Delete from Storage
    const storageRef = ref(storage, fileMetadata.storageUrl);
    await deleteObject(storageRef);

    // Delete metadata from Firestore
    await deleteDoc(doc(db, 'fileUploads', fileMetadata.id));

    console.log('File deleted successfully:', fileMetadata.fileName);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Get file metadata by ID
 */
export const getFileMetadata = async (fileId: string): Promise<FileMetadata | null> => {
  try {
    const fileDoc = await doc(db, 'fileUploads', fileId);
    const docSnapshot = await getDoc(fileDoc);
    
    if (docSnapshot.exists()) {
      return {
        id: docSnapshot.id,
        ...docSnapshot.data()
      } as FileMetadata;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching file metadata:', error);
    return null;
  }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file icon based on file type
 */
export const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎥';
  if (fileType.startsWith('audio/')) return '🎵';
  if (fileType === 'application/pdf') return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📈';
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return '📦';
  return '📁';
};

/**
 * Check if file is an image
 */
export const isImage = (fileType: string): boolean => {
  return fileType.startsWith('image/');
};

/**
 * Check if file is a video
 */
export const isVideo = (fileType: string): boolean => {
  return fileType.startsWith('video/');
};

/**
 * Check if file is audio
 */
export const isAudio = (fileType: string): boolean => {
  return fileType.startsWith('audio/');
};

/**
 * Cleanup expired files - should be called periodically
 */
export const cleanupExpiredFiles = async (): Promise<void> => {
  try {
    const now = new Date().toISOString();
    const filesRef = collection(db, 'fileUploads');
    const expiredQuery = query(
      filesRef,
      where('expiresAt', '<=', now),
      where('isExpired', '==', false)
    );
    
    const snapshot = await getDocs(expiredQuery);
    
    const deletePromises = snapshot.docs.map(async (docSnapshot) => {
      const fileData = docSnapshot.data() as FileMetadata;
      try {
        // Delete from storage
        const storageRef = ref(storage, fileData.storageUrl);
        await deleteObject(storageRef);
        
        // Mark as expired in database (don't delete the record for audit purposes)
        await updateDoc(docSnapshot.ref, {
          isExpired: true,
          deletedAt: new Date().toISOString()
        });
        
        console.log('Expired file cleaned up:', fileData.fileName);
      } catch (error) {
        console.error('Error cleaning up file:', fileData.fileName, error);
      }
    });
    
    await Promise.all(deletePromises);
    console.log(`Cleaned up ${snapshot.docs.length} expired files`);
  } catch (error) {
    console.error('Error during file cleanup:', error);
  }
};

export default {
  validateFile,
  uploadFile,
  deleteFile,
  getFileMetadata,
  formatFileSize,
  getFileIcon,
  isImage,
  isVideo,
  isAudio,
  cleanupExpiredFiles
};
