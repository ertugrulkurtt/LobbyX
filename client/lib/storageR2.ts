/**
 * Storage service using Cloudflare R2 for profile and user assets
 */

import { uploadFile, deleteFile } from './fileServiceR2';

export interface UploadResult {
  success: boolean;
  url?: string;
  fileId?: string;
  error?: string;
}

/**
 * Upload profile photo to R2
 */
export const uploadProfilePhoto = async (file: File, userId: string): Promise<UploadResult> => {
  try {
    // Validate file
    if (!file) {
      return { success: false, error: 'Dosya bulunamadı' };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'Dosya boyutu 5MB\'dan küçük olmalıdır' };
    }

    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Sadece resim dosyaları yüklenebilir' };
    }

    // Upload to R2 using the unified file service
    const fileMetadata = await uploadFile(file, userId, 'profile');

    return {
      success: true,
      url: fileMetadata.publicUrl,
      fileId: fileMetadata.id
    };

  } catch (error: any) {
    console.error('Profile photo upload error:', error);
    return {
      success: false,
      error: error.message || 'Profil resmi yükleme hatası'
    };
  }
};

/**
 * Delete old profile photo from R2
 */
export const deleteOldProfilePhoto = async (photoURL: string): Promise<boolean> => {
  try {
    // Check if it's an R2 URL
    if (!photoURL || !photoURL.includes('cdn.lobbyx.com')) {
      return true; // Not an R2 URL, nothing to delete
    }

    // Extract file ID from URL or use a different approach
    // For now, we'll skip deletion of old files during migration period
    console.log('Old profile photo deletion skipped during R2 migration:', photoURL);
    return true;

  } catch (error) {
    console.error('Error deleting old profile photo:', error);
    return false;
  }
};

/**
 * Upload server/group assets
 */
export const uploadServerAsset = async (
  file: File, 
  userId: string, 
  serverId: string
): Promise<UploadResult> => {
  try {
    if (!file) {
      return { success: false, error: 'Dosya bulunamadı' };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'Dosya boyutu 10MB\'dan küçük olmalıdır' };
    }

    const fileMetadata = await uploadFile(file, userId, 'server', { serverId });

    return {
      success: true,
      url: fileMetadata.publicUrl,
      fileId: fileMetadata.id
    };

  } catch (error: any) {
    console.error('Server asset upload error:', error);
    return {
      success: false,
      error: error.message || 'Sunucu dosyası yükleme hatası'
    };
  }
};

/**
 * Upload group assets
 */
export const uploadGroupAsset = async (
  file: File, 
  userId: string, 
  groupId: string
): Promise<UploadResult> => {
  try {
    if (!file) {
      return { success: false, error: 'Dosya bulunamadı' };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'Dosya boyutu 10MB\'dan küçük olmalıdır' };
    }

    const fileMetadata = await uploadFile(file, userId, 'group', { groupId });

    return {
      success: true,
      url: fileMetadata.publicUrl,
      fileId: fileMetadata.id
    };

  } catch (error: any) {
    console.error('Group asset upload error:', error);
    return {
      success: false,
      error: error.message || 'Grup dosyası yükleme hatası'
    };
  }
};

export default {
  uploadProfilePhoto,
  deleteOldProfilePhoto,
  uploadServerAsset,
  uploadGroupAsset
};
