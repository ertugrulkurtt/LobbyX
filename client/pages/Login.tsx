import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Gamepad2, Zap } from 'lucide-react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.emailOrPhone) {
      newErrors.emailOrPhone = 'E-posta veya telefon numarası gerekli';
    }
    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Firebase authentication would go here
      console.log('Login attempt:', formData);
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
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="relative">
              <Gamepad2 className="w-12 h-12 text-neon-purple animate-pulse-glow" />
              <Zap className="absolute -top-1 -right-1 w-6 h-6 text-neon-cyan" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-neon">GameChat</h1>
          <p className="text-gaming-muted mt-2">Oyun dünyasına hoş geldin</p>
        </div>

        {/* Login Form */}
        <div className="card-glass animate-scale-in">
          <h2 className="text-2xl font-bold text-gaming-text mb-6 text-center">Giriş Yap</h2>
          
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
                  className={`w-full pl-10 pr-4 py-3 bg-gaming-surface border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.emailOrPhone 
                      ? 'border-red-500 focus:ring-red-500/50' 
                      : 'border-gaming-border focus:ring-neon-purple/50 focus:border-neon-purple'
                  }`}
                  placeholder="ornek@email.com veya +90 555 123 45 67"
                />
              </div>
              {errors.emailOrPhone && (
                <p className="text-red-500 text-sm animate-fade-in-up">{errors.emailOrPhone}</p>
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

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full btn-neon"
            >
              Giriş Yap
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-3">
            <Link
              to="/forgot-password"
              className="text-neon-cyan hover:text-neon-purple transition-colors text-sm"
            >
              Şifremi Unuttum
            </Link>
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
