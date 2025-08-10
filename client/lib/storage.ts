import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

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

    // Create unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile_${userId}_${timestamp}.${fileExtension}`;
    
    // Try uploading to user-specific directory first
    let storageRef = ref(storage, `users/${userId}/profile-photo/${fileName}`);
    
    try {
      console.log('Uploading to user directory:', `users/${userId}/profile-photo/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return { success: true, url: downloadURL };
    } catch (error: any) {
      console.log('User directory failed, trying public directory...', error.message);
      
      // If user directory fails, try public directory
      storageRef = ref(storage, `public/profile-photos/${fileName}`);
      
      try {
        console.log('Uploading to public directory:', `public/profile-photos/${fileName}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return { success: true, url: downloadURL };
      } catch (publicError: any) {
        console.error('Public directory also failed:', publicError);
        
        // If both fail, try the root directory as last resort
        storageRef = ref(storage, fileName);
        
        try {
          console.log('Uploading to root directory:', fileName);
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          
          return { success: true, url: downloadURL };
        } catch (rootError: any) {
          console.error('All upload attempts failed:', rootError);
          return { 
            success: false, 
            error: `Yükleme başarısız: ${rootError.message || 'Bilinmeyen hata'}` 
          };
        }
      }
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return { 
      success: false, 
      error: `Yükleme hatası: ${error.message || 'Bilinmeyen hata'}` 
    };
  }
};

export const deleteProfilePhoto = async (photoURL: string): Promise<boolean> => {
  try {
    if (!photoURL || !photoURL.includes('firebasestorage.googleapis.com')) {
      return true; // Not a Firebase Storage URL, nothing to delete
    }

    const photoRef = ref(storage, photoURL);
    await deleteObject(photoRef);
    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
};

// Firebase Storage Rules that should be set in Firebase Console:
/*
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload/read their own profile photos
    match /users/{userId}/profile-photo/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to upload/read public profile photos
    match /public/profile-photos/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.resource.size < 5 * 1024 * 1024 
        && request.resource.contentType.matches('image/.*');
    }
    
    // Fallback: allow authenticated users to upload to root (temporary)
    match /{filename} {
      allow read, write: if request.auth != null 
        && request.resource.size < 5 * 1024 * 1024 
        && request.resource.contentType.matches('image/.*');
    }
  }
}
*/
