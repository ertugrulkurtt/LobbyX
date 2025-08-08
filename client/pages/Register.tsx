import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, Calendar, Lock, Gamepad2, Zap } from 'lucide-react';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validation
    if (!formData.username) newErrors.username = 'Kullanıcı adı gerekli';
    if (!formData.firstName) newErrors.firstName = 'Ad gerekli';
    if (!formData.lastName) newErrors.lastName = 'Soyad gerekli';
    if (!formData.birthDate) newErrors.birthDate = 'Doğum tarihi gerekli';
    if (!formData.phone) newErrors.phone = 'Telefon numarası gerekli';
    if (!formData.email) newErrors.email = 'E-posta gerekli';
    if (!formData.password) newErrors.password = 'Şifre gerekli';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    // Password strength
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Firebase authentication would go here
      console.log('Register attempt:', formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gaming-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="relative">
              <Gamepad2 className="w-12 h-12 text-neon-purple animate-pulse-glow" />
              <Zap className="absolute -top-1 -right-1 w-6 h-6 text-neon-cyan" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-neon">GameChat</h1>
          <p className="text-gaming-muted mt-2">Oyuncu topluluğuna katıl</p>
        </div>

        {/* Register Form */}
        <div className="card-glass animate-scale-in">
          <h2 className="text-2xl font-bold text-gaming-text mb-6 text-center">Kayıt Ol</h2>
          
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
                  className={`w-full pl-10 pr-4 py-3 bg-gaming-surface border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.username 
                      ? 'border-red-500 focus:ring-red-500/50' 
                      : 'border-gaming-border focus:ring-neon-purple/50 focus:border-neon-purple'
                  }`}
                  placeholder="oyuncuadi123"
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm animate-fade-in-up">{errors.username}</p>
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
                  className={`w-full px-4 py-3 bg-gaming-surface border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.firstName 
                      ? 'border-red-500 focus:ring-red-500/50' 
                      : 'border-gaming-border focus:ring-neon-purple/50 focus:border-neon-purple'
                  }`}
                  placeholder="Adınız"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm animate-fade-in-up">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gaming-text">Soyad</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-4 py-3 bg-gaming-surface border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.lastName 
                      ? 'border-red-500 focus:ring-red-500/50' 
                      : 'border-gaming-border focus:ring-neon-purple/50 focus:border-neon-purple'
                  }`}
                  placeholder="Soyadınız"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm animate-fade-in-up">{errors.lastName}</p>
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
                  className={`w-full pl-10 pr-4 py-3 bg-gaming-surface border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.birthDate 
                      ? 'border-red-500 focus:ring-red-500/50' 
                      : 'border-gaming-border focus:ring-neon-purple/50 focus:border-neon-purple'
                  }`}
                />
              </div>
              {errors.birthDate && (
                <p className="text-red-500 text-sm animate-fade-in-up">{errors.birthDate}</p>
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
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-gaming-surface border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.phone 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : 'border-gaming-border focus:ring-neon-purple/50 focus:border-neon-purple'
                    }`}
                    placeholder="+90 555 123 45 67"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm animate-fade-in-up">{errors.phone}</p>
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
                    className={`w-full pl-10 pr-4 py-3 bg-gaming-surface border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : 'border-gaming-border focus:ring-neon-purple/50 focus:border-neon-purple'
                    }`}
                    placeholder="ornek@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm animate-fade-in-up">{errors.email}</p>
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
                    className={`w-full pl-10 pr-12 py-3 bg-gaming-surface border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.password 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : 'border-gaming-border focus:ring-neon-purple/50 focus:border-neon-purple'
                    }`}
                    placeholder="Şifrenizi girin"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gaming-muted hover:text-neon-cyan transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm animate-fade-in-up">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gaming-text">Şifre Tekrar</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-3 bg-gaming-surface border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:ring-red-500/50' 
                      : 'border-gaming-border focus:ring-neon-purple/50 focus:border-neon-purple'
                  }`}
                  placeholder="Şifrenizi tekrar girin"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm animate-fade-in-up">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full btn-neon"
            >
              Kayıt Ol
            </button>
          </form>

          {/* Links */}
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
