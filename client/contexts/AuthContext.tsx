import React, { createContext, useContext, useEffect, useState } from 'react';

// User interface
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
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
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

  // Simulate checking for existing authentication on app start
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Check for existing authentication
        
        // For demo: Check localStorage
        const savedUser = localStorage.getItem('gaming-chat-user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Auth state check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      // Authentication logic
      
      // Mock login for demo
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      const mockUser: User = {
        uid: 'demo-user-123',
        email: email,
        displayName: 'Demo Oyuncu',
        username: 'demo_player',
        firstName: 'Demo',
        lastName: 'Oyuncu',
        isOnline: true,
        photoURL: '',
        createdAt: new Date().toISOString(),
        preferences: {
          theme: 'dark',
          notifications: true
        }
      };

      setUser(mockUser);
      
      if (rememberMe) {
        localStorage.setItem('gaming-chat-user', JSON.stringify(mockUser));
      }
    } catch (error: any) {
      throw new Error(error.message || 'Giriş başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      // Registration logic
      
      // Mock registration for demo
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      const newUser: User = {
        uid: `user-${Date.now()}`,
        email: userData.email,
        displayName: `${userData.firstName} ${userData.lastName}`,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        birthDate: userData.birthDate,
        phoneNumber: userData.phoneNumber,
        isOnline: true,
        photoURL: '',
        createdAt: new Date().toISOString(),
        preferences: {
          theme: 'dark',
          notifications: true
        }
      };

      setUser(newUser);
      localStorage.setItem('gaming-chat-user', JSON.stringify(newUser));
    } catch (error: any) {
      throw new Error(error.message || 'Kayıt başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Logout logic
      
      setUser(null);
      localStorage.removeItem('gaming-chat-user');
    } catch (error: any) {
      throw new Error(error.message || 'Çıkış başarısız');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      // Update profile logic
      
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('gaming-chat-user', JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      throw new Error(error.message || 'Profil güncellenemedi');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Password reset logic
      
      // Mock for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Password reset email sent to:', email);
    } catch (error: any) {
      throw new Error(error.message || 'Şifre sıfırlama başarısız');
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
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


// Export types for use in other components
export type { User, RegisterData };
