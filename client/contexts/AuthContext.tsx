import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// User interface with Firebase data
interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  phoneNumber?: string;
  isOnline?: boolean;
  createdAt?: string;
  bio?: string;
  status?: string;
  level?: number;
  xp?: number;
  badges?: string[];
  customization?: {
    profileBackground?: string;
    themeColor?: string;
    backgroundType?: 'gradient' | 'image' | 'color';
    profileFrame?: string;
  };
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
    allowDMsFromFriends?: boolean;
    showActivity?: boolean;
    allowServerInvites?: boolean;
  };
  gameStats?: {
    favoriteGames?: string[];
    totalPlayTime?: number;
    achievements?: number;
    rank?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

interface RegisterData {
  username: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phoneNumber: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || userData.displayName,
              photoURL: firebaseUser.photoURL || userData.photoURL,
              ...userData
            });
          } else {
            // If no Firestore document exists, create basic user object
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              isOnline: true,
              preferences: {
                theme: 'dark',
                notifications: true
              }
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isOnline: true
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update online status in Firestore
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        isOnline: true,
        lastSeen: new Date().toISOString()
      });
      
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      
      // Update Firebase Auth profile
      await updateProfile(userCredential.user, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });

      // Create user document in Firestore
      const userDoc = {
        uid: userCredential.user.uid,
        email: userData.email,
        displayName: `${userData.firstName} ${userData.lastName}`,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        birthDate: userData.birthDate,
        phoneNumber: userData.phoneNumber,
        isOnline: true,
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        preferences: {
          theme: 'dark',
          notifications: true
        }
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);
      
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Update online status before signing out
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          isOnline: false,
          lastSeen: new Date().toISOString()
        });
      }
      
      await signOut(auth);
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    try {
      if (!user) throw new Error('Kullanıcı bulunamadı');

      // Update Firebase Auth profile if displayName or photoURL changed
      if (data.displayName || data.photoURL) {
        await updateProfile(auth.currentUser!, {
          displayName: data.displayName || auth.currentUser!.displayName,
          photoURL: data.photoURL || auth.currentUser!.photoURL
        });
      }

      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), data);

      // Update local user state immediately
      setUser(prevUser => prevUser ? { ...prevUser, ...data } : null);

    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile: updateUserProfile,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to convert Firebase error codes to Turkish messages
function getFirebaseErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı';
    case 'auth/wrong-password':
      return 'Yanlış şifre';
    case 'auth/email-already-in-use':
      return 'Bu e-posta adresi zaten kullanımda';
    case 'auth/weak-password':
      return 'Şifre çok zayıf (en az 6 karakter olmalı)';
    case 'auth/invalid-email':
      return 'Geçersiz e-posta adresi';
    case 'auth/user-disabled':
      return 'Bu hesap devre dışı bırakılmış';
    case 'auth/too-many-requests':
      return 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin';
    case 'auth/network-request-failed':
      return 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin';
    case 'auth/invalid-credential':
      return 'Geçersiz giriş bilgileri';
    default:
      return 'Bir hata oluştu. Lütfen tekrar deneyin';
  }
}

// Export types for use in other components
export type { User, RegisterData };
