import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Gamepad2, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'E-posta veya telefon numarası gerekli';
    } else {
      // Basic email validation
      const isEmail = formData.emailOrPhone.includes('@');
      const isPhone = /^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.emailOrPhone);
      
      if (isEmail) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailOrPhone)) {
          newErrors.emailOrPhone = 'Geçerli bir e-posta adresi girin';
        }
      } else if (!isPhone) {
        newErrors.emailOrPhone = 'Geçerli bir telefon numarası girin';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setNotification(null);

    try {
      await login(formData.emailOrPhone, formData.password, rememberMe);
      setNotification({ type: 'success', message: 'Giriş başarılı! Yönlendiriliyor...' });
      
      // Redirect after successful login
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Giriş başarısız' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleForgotPassword = () => {
    // In real app: implement password reset
    setNotification({ type: 'success', message: 'Şifre sıfırlama linki e-postanıza gönderildi!' });
  };

  return (
    <div className="min-h-screen bg-gaming-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-neon-purple/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-neon-cyan/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-neon-pink/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to Landing */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gaming-muted hover:text-neon-cyan transition-colors text-sm"
          >
            <span>←</span>
            <span>Ana sayfaya dön</span>
          </Link>
        </div>

        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F3fa3fe0360c74c0a80bb8a229c50ca2c%2F8524f1f78eaf4eddbe4c314d3298bfa8?format=webp&width=800"
                alt="LobbyX Logo"
                className="w-16 h-16 object-contain mix-blend-screen filter brightness-110 animate-pulse-glow"
                style={{ filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.7))' }}
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-neon">LobbyX</h1>
          <p className="text-gaming-muted mt-2">Oyun dünyasına geri dön</p>
        </div>

        {/* Login Form */}
        <div className="card-glass animate-scale-in backdrop-blur-xl bg-gaming-surface/20 border border-gaming-border/50">
          <h2 className="text-2xl font-bold text-gaming-text mb-6 text-center">Giriş Yap</h2>
          
          {/* Notification */}
          {notification && (
            <div className={`mb-6 p-4 rounded-xl border ${
              notification.type === 'success' 
                ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            } animate-fade-in-up`}>
              <div className="flex items-center space-x-2">
                {notification.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">{notification.message}</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email or Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gaming-text">
                E-posta veya Telefon Numarası
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gaming-muted" />
                <input
                  type="text"
                  value={formData.emailOrPhone}
                  onChange={(e) => handleInputChange('emailOrPhone', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-gaming-surface/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.emailOrPhone 
                      ? 'border-red-500 focus:ring-red-500/50' 
                      : 'border-gaming-border focus:ring-neon-purple/50 focus:border-neon-purple'
                  }`}
                  placeholder="ornek@email.com veya +90 555 123 45 67"
                  disabled={isLoading}
                />
              </div>
              {errors.emailOrPhone && (
                <p className="text-red-400 text-sm animate-fade-in-up flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.emailOrPhone}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gaming-text">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gaming-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 bg-gaming-surface/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500/50' 
                      : 'border-gaming-border focus:ring-neon-purple/50 focus:border-neon-purple'
                  }`}
                  placeholder="Şifrenizi girin"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gaming-muted hover:text-neon-cyan transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm animate-fade-in-up flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gaming-border bg-gaming-surface/50 text-neon-purple focus:ring-neon-purple/50"
                  disabled={isLoading}
                />
                <span className="text-sm text-gaming-text">Beni Hatırla</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-neon-cyan hover:text-neon-purple transition-colors text-sm"
                disabled={isLoading}
              >
                Şifremi Unuttum?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full btn-neon relative ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Giriş yapılıyor...</span>
                </div>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <div className="text-gaming-muted text-sm">
              Hesabın yok mu?{' '}
              <Link
                to="/register"
                className="text-neon-cyan hover:text-neon-purple transition-colors font-medium"
              >
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
