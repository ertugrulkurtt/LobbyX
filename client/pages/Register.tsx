import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, Calendar, Lock, Gamepad2, Zap, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { useAuth, RegisterData } from '../contexts/AuthContext';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    phoneNumber: '',
    email: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, label: '', color: '' });
  const [privacyAgreement, setPrivacyAgreement] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Real-time password strength calculation
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength({ score: 0, label: '', color: '' });
      return;
    }

    let score = 0;
    const password = formData.password;

    // Length check
    if (password.length >= 8) score += 1;
    // Has uppercase
    if (/[A-Z]/.test(password)) score += 1;
    // Has lowercase
    if (/[a-z]/.test(password)) score += 1;
    // Has numbers
    if (/\d/.test(password)) score += 1;
    // Has special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    let label = '';
    let color = '';

    if (score <= 2) {
      label = 'Zayıf';
      color = 'text-red-400';
    } else if (score <= 3) {
      label = 'Orta';
      color = 'text-neon-orange';
    } else if (score <= 4) {
      label = 'Güçlü';
      color = 'text-neon-cyan';
    } else {
      label = 'Çok G��çlü';
      color = 'text-neon-green';
    }

    setPasswordStrength({ score, label, color });
  }, [formData.password]);

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'username':
        if (!value.trim()) {
          newErrors.username = 'Kullanıcı adı gerekli';
        } else if (value.length < 3) {
          newErrors.username = 'Kullanıcı adı en az 3 karakter olmalı';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors.username = 'Sadece harf, rakam ve _ kullanabilirsiniz';
        } else {
          delete newErrors.username;
        }
        break;

      case 'firstName':
        if (!value.trim()) {
          newErrors.firstName = 'Ad gerekli';
        } else if (value.length < 2) {
          newErrors.firstName = 'Ad en az 2 karakter olmalı';
        } else {
          delete newErrors.firstName;
        }
        break;

      case 'lastName':
        if (!value.trim()) {
          newErrors.lastName = 'Soyad gerekli';
        } else if (value.length < 2) {
          newErrors.lastName = 'Soyad en az 2 karakter olmalı';
        } else {
          delete newErrors.lastName;
        }
        break;

      case 'birthDate':
        if (!value) {
          newErrors.birthDate = 'Doğum tarihi gerekli';
        } else {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 13) {
            newErrors.birthDate = 'En az 13 yaşında olmalısınız';
          } else {
            delete newErrors.birthDate;
          }
        }
        break;

      case 'phoneNumber':
        if (!value.trim()) {
          newErrors.phoneNumber = 'Telefon numarası gerekli';
        } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(value)) {
          newErrors.phoneNumber = 'Geçerli bir telefon numarası girin';
        } else {
          delete newErrors.phoneNumber;
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = 'E-posta gerekli';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Geçerli bir e-posta adresi girin';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'Şifre gerekli';
        } else if (value.length < 6) {
          newErrors.password = 'Şifre en az 6 karakter olmalı';
        } else {
          delete newErrors.password;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Şifre tekrarı gerekli';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Şifreler eşleşmiyor';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (field: keyof RegisterData | 'confirmPassword', value: string) => {
    if (field === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Real-time validation
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key as keyof RegisterData]);
    });
    validateField('confirmPassword', confirmPassword);

    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    setNotification(null);

    try {
      await register(formData);
      setNotification({ type: 'success', message: 'Kayıt başarılı! Hoş geldin!' });
      
      // Redirect after successful registration
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Kayıt başarısız' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gaming-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-32 h-32 bg-neon-cyan/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-neon-purple/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-neon-pink/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
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
          <h1 className="text-3xl font-bold text-neon mb-2">LobbyX</h1>
          <p className="text-gaming-muted mt-2">Oyuncu topluluğuna katıl</p>
        </div>

        {/* Register Form */}
        <div className="card-glass animate-scale-in backdrop-blur-xl bg-gaming-surface/20 border border-gaming-border/50">
          <h2 className="text-2xl font-bold text-gaming-text mb-6 text-center">Kayıt Ol</h2>
          
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
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gaming-text">Kullanıcı Adı</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gaming-muted" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-gaming-surface/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.username 
                      ? 'border-red-500 focus:ring-red-500/50' 
                      : 'border-gaming-border focus:ring-neon-purple/50 focus:border-neon-purple'
                  }`}
                  placeholder="oyuncuadi123"
                  disabled={isLoading}
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-sm animate-fade-in-up flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.username}</span>
                </p>
              )}
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gaming-text">Ad</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-4 py-3 bg-gaming-surface/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.firstName 
                      ? 'border-red-500 focus:ring-red-500/50' 
                      : 'border-gaming-border focus:ring-neon-purple/50 focus:border-neon-purple'
                  }`}
                  placeholder="Adınız"
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <p className="text-red-400 text-sm animate-fade-in-up flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.firstName}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gaming-text">Soyad</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-4 py-3 bg-gaming-surface/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.lastName 
                      ? 'border-red-500 focus:ring-red-500/50' 
                      : 'border-gaming-border focus:ring-neon-purple/50 focus:border-neon-purple'
                  }`}
                  placeholder="Soyadınız"
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <p className="text-red-400 text-sm animate-fade-in-up flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.lastName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gaming-text">Doğum Tarihi</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gaming-muted" />
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-gaming-surface/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.birthDate 
                      ? 'border-red-500 focus:ring-red-500/50' 
                      : 'border-gaming-border focus:ring-neon-purple/50 focus:border-neon-purple'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.birthDate && (
                <p className="text-red-400 text-sm animate-fade-in-up flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.birthDate}</span>
                </p>
              )}
            </div>

            {/* Contact fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gaming-text">Telefon Numarası</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gaming-muted" />
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-gaming-surface/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.phoneNumber 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : 'border-gaming-border focus:ring-neon-purple/50 focus:border-neon-purple'
                    }`}
                    placeholder="+90 555 123 45 67"
                    disabled={isLoading}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-400 text-sm animate-fade-in-up flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.phoneNumber}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gaming-text">E-posta</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gaming-muted" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-gaming-surface/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : 'border-gaming-border focus:ring-neon-purple/50 focus:border-neon-purple'
                    }`}
                    placeholder="ornek@email.com"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm animate-fade-in-up flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Password fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gaming-muted">Şifre Gücü:</span>
                      <span className={`text-xs font-medium ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gaming-surface rounded-full h-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          passwordStrength.score <= 2 
                            ? 'bg-red-500' 
                            : passwordStrength.score <= 3 
                            ? 'bg-neon-orange' 
                            : passwordStrength.score <= 4 
                            ? 'bg-neon-cyan' 
                            : 'bg-neon-green'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-red-400 text-sm animate-fade-in-up flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gaming-text">Şifre Tekrar</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gaming-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-gaming-surface/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.confirmPassword 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : 'border-gaming-border focus:ring-neon-purple/50 focus:border-neon-purple'
                    }`}
                    placeholder="Şifrenizi tekrar girin"
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm animate-fade-in-up flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || Object.keys(errors).length > 0}
              className={`w-full btn-neon relative ${
                isLoading || Object.keys(errors).length > 0 
                  ? 'opacity-70 cursor-not-allowed' 
                  : ''
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Kayıt yapılıyor...</span>
                </div>
              ) : (
                'Kayıt Ol'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <div className="text-gaming-muted text-sm">
              Zaten hesabın var mı?{' '}
              <Link
                to="/login"
                className="text-neon-cyan hover:text-neon-purple transition-colors font-medium"
              >
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
