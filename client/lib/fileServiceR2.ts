/**
 * Unified File Service - Using Cloudflare R2 Storage
 * Replaces Firebase Storage functionality
 */

import cloudflareR2, {
  FileMetadata as R2FileMetadata
} from './cloudflareR2';

const { uploadFileToR2, deleteFileFromR2, validateFile, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } = cloudflareR2;
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
import { db } from './firebase';

// Re-export for compatibility

export interface FileMetadata extends R2FileMetadata {
  // Additional Firebase metadata
  createdAt?: string;
  updatedAt?: string;
  conversationId?: string;
  serverId?: string;
  groupId?: string;
  isProfilePicture?: boolean;
}

/**
 * Upload file with metadata storage in Firebase
 */
export const uploadFile = async (
  file: File,
  userId: string,
  context?: 'profile' | 'chat' | 'server' | 'group',
  metadata?: {
    conversationId?: string;
    serverId?: string;
    groupId?: string;
    description?: string;
  },
  onProgress?: (progress: number) => void
): Promise<FileMetadata> => {
  try {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Upload to Cloudflare R2
    const r2Metadata = await uploadFileToR2(file, userId, context, onProgress);

    // Create enhanced metadata
    const fileMetadata: FileMetadata = {
      ...r2Metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      conversationId: metadata?.conversationId,
      serverId: metadata?.serverId,
      groupId: metadata?.groupId,
      isProfilePicture: context === 'profile'
    };

    // Save metadata to Firebase
    const filesRef = collection(db, 'files');
    const docRef = await addDoc(filesRef, {
      ...fileMetadata,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Update with Firebase document ID
    fileMetadata.id = docRef.id;
    await updateDoc(docRef, { id: docRef.id });

    console.log('File uploaded successfully:', fileMetadata.fileName);
    return fileMetadata;

  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete file from both R2 and Firebase metadata
 */
export const deleteFile = async (fileId: string): Promise<boolean> => {
  try {
    // Get file metadata from Firebase
    const fileDoc = await getDoc(doc(db, 'files', fileId));
    
    if (!fileDoc.exists()) {
      console.warn('File metadata not found in Firebase');
      return false;
    }

    const fileData = fileDoc.data() as FileMetadata;
    
    // Extract file path from storage URL
    let filePath = '';
    if (fileData.storageUrl.startsWith('r2://')) {
      filePath = fileData.storageUrl.replace(/^r2:\/\/[^\/]+\//, '');
    }

    // Delete from R2
    if (filePath) {
      await deleteFileFromR2(filePath);
    }

    // Delete metadata from Firebase
    await deleteDoc(doc(db, 'files', fileId));

    console.log('File deleted successfully:', fileData.fileName);
    return true;

  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Get file metadata by ID
 */
export const getFileMetadata = async (fileId: string): Promise<FileMetadata | null> => {
  try {
    const fileDoc = await getDoc(doc(db, 'files', fileId));
    
    if (!fileDoc.exists()) {
      return null;
    }

    return { id: fileDoc.id, ...fileDoc.data() } as FileMetadata;

  } catch (error) {
    console.error('Error fetching file metadata:', error);
    return null;
  }
};

/**
 * Get files for a conversation
 */
export const getConversationFiles = async (conversationId: string): Promise<FileMetadata[]> => {
  try {
    const filesRef = collection(db, 'files');
    const q = query(filesRef, where('conversationId', '==', conversationId));
    
    const snapshot = await getDocs(q);
    const files = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FileMetadata[];

    // Sort by upload date (newest first)
    return files.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

  } catch (error) {
    console.error('Error fetching conversation files:', error);
    return [];
  }
};

/**
 * Get files uploaded by a user
 */
export const getUserFiles = async (userId: string, limit?: number): Promise<FileMetadata[]> => {
  try {
    const filesRef = collection(db, 'files');
    const q = query(filesRef, where('uploadedBy', '==', userId));
    
    const snapshot = await getDocs(q);
    let files = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FileMetadata[];

    // Sort by upload date (newest first)
    files = files.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    // Apply limit if specified
    if (limit) {
      files = files.slice(0, limit);
    }

    return files;

  } catch (error) {
    console.error('Error fetching user files:', error);
    return [];
  }
};

/**
 * Get files by type
 */
export const getFilesByType = async (
  fileType: 'image' | 'video' | 'audio' | 'document',
  userId?: string
): Promise<FileMetadata[]> => {
  try {
    const filesRef = collection(db, 'files');
    let q = query(filesRef);

    // Filter by user if specified
    if (userId) {
      q = query(filesRef, where('uploadedBy', '==', userId));
    }

    const snapshot = await getDocs(q);
    let files = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FileMetadata[];

    // Filter by file type
    files = files.filter(file => {
      switch (fileType) {
        case 'image':
          return file.fileType.startsWith('image/');
        case 'video':
          return file.fileType.startsWith('video/');
        case 'audio':
          return file.fileType.startsWith('audio/');
        case 'document':
          return file.fileType.includes('pdf') || 
                 file.fileType.includes('document') ||
                 file.fileType.includes('text/');
        default:
          return false;
      }
    });

    // Sort by upload date (newest first)
    return files.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

  } catch (error) {
    console.error('Error fetching files by type:', error);
    return [];
  }
};

/**
 * Update file metadata
 */
export const updateFileMetadata = async (
  fileId: string, 
  updates: Partial<FileMetadata>
): Promise<boolean> => {
  try {
    const fileRef = doc(db, 'files', fileId);
    await updateDoc(fileRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error updating file metadata:', error);
    return false;
  }
};

/**
 * Get storage usage for a user
 */
export const getUserStorageUsage = async (userId: string): Promise<{
  totalFiles: number;
  totalSize: number;
  filesByType: Record<string, number>;
}> => {
  try {
    const files = await getUserFiles(userId);
    
    const usage = {
      totalFiles: files.length,
      totalSize: files.reduce((total, file) => total + file.fileSize, 0),
      filesByType: {} as Record<string, number>
    };

    files.forEach(file => {
      const type = file.fileType.split('/')[0];
      usage.filesByType[type] = (usage.filesByType[type] || 0) + 1;
    });

    return usage;

  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return { totalFiles: 0, totalSize: 0, filesByType: {} };
  }
};

// Export for external use
export { validateFile, ALLOWED_FILE_TYPES, MAX_FILE_SIZE };

export default {
  uploadFile,
  deleteFile,
  getFileMetadata,
  getConversationFiles,
  getUserFiles,
  getFilesByType,
  updateFileMetadata,
  getUserStorageUsage,
  validateFile,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE
};
