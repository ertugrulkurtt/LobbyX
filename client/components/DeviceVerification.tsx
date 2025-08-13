import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Mail, Phone, ArrowLeft, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface DeviceVerificationProps {
  email: string;
  phoneNumber: string;
  onVerified: () => void;
  onBack: () => void;
}

type VerificationMethod = 'email' | 'sms';

export default function DeviceVerification({ email, phoneNumber, onVerified, onBack }: DeviceVerificationProps) {
  const [selectedMethod, setSelectedMethod] = useState<VerificationMethod>('email');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const MAX_ATTEMPTS = 3;

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Reset when method changes
  useEffect(() => {
    setCode('');
    setErrors('');
    setAttempts(0);
    setCodeSent(false);
    setNotification(null);
  }, [selectedMethod]);

  // Mock function to send verification code
  const sendVerificationCode = async () => {
    setIsResending(true);
    try {
      // Simulate API call to send verification code
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const message = selectedMethod === 'email' 
        ? 'Doğrulama kodu e-postanıza gönderildi!' 
        : 'Doğrulama kodu SMS ile gönderildi!';
        
      setNotification({ type: 'success', message });
      setCodeSent(true);
      setResendCooldown(60); // 60 seconds cooldown
    } catch (error) {
      setNotification({ type: 'error', message: 'Kod gönderilirken hata oluştu' });
    } finally {
      setIsResending(false);
    }
  };

  // Mock function to verify code
  const verifyCode = async (inputCode: string): Promise<boolean> => {
    // Simulate API verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    // For demo purposes, accept different codes for different methods
    const validCode = selectedMethod === 'email' ? '123456' : '654321';
    return inputCode === validCode;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setErrors('Doğrulama kodu gerekli');
      return;
    }

    if (code.length !== 6) {
      setErrors('Doğrulama kodu 6 haneli olmalıdır');
      return;
    }

    if (attempts >= MAX_ATTEMPTS) {
      setErrors('Çok fazla yanlış deneme yaptınız');
      return;
    }

    setIsLoading(true);
    setErrors('');
    setNotification(null);

    try {
      const isValid = await verifyCode(code);
      
      if (isValid) {
        setNotification({ type: 'success', message: 'Cihaz doğrulandı! Giriş yapılıyor...' });
        setTimeout(() => {
          onVerified();
        }, 1500);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          setNotification({ 
            type: 'error', 
            message: 'Üzgünüz, çok fazla deneme yaptınız. Giriş sayfasına yönlendiriliyorsunuz...' 
          });
          setTimeout(() => {
            onBack();
          }, 3000);
        } else {
          setErrors(`Geçersiz kod. Kalan hakkınız: ${MAX_ATTEMPTS - newAttempts}`);
        }
        setCode('');
      }
    } catch (error) {
      setErrors('Doğrulama sırasında hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    if (errors) setErrors('');
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('+90')) {
      return phone.replace(/(\+90)(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    return phone;
  };

  // Mask email for display
  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    const maskedUsername = username.length > 2 
      ? username.slice(0, 2) + '*'.repeat(Math.max(0, username.length - 4)) + username.slice(-2)
      : username;
    return `${maskedUsername}@${domain}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-neon-orange to-neon-pink rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse-glow">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gaming-text mb-2">Cihaz Doğrulama</h2>
        <p className="text-gaming-muted text-sm">
          Bu cihazdan daha önce giriş yapmadığınız için kimliğinizi doğrulamamız gerekiyor
        </p>
      </div>

      {/* Verification Method Selection */}
      {!codeSent && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gaming-text text-center">Doğrulama Yöntemini Seçin</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Option */}
            <button
              type="button"
              onClick={() => setSelectedMethod('email')}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                selectedMethod === 'email'
                  ? 'border-neon-cyan bg-neon-cyan/10 shadow-glow-cyan'
                  : 'border-gaming-border bg-gaming-surface/50 hover:border-neon-cyan/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  selectedMethod === 'email' ? 'bg-neon-cyan/20' : 'bg-gaming-surface'
                }`}>
                  <Mail className={`w-5 h-5 ${
                    selectedMethod === 'email' ? 'text-neon-cyan' : 'text-gaming-muted'
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium ${
                    selectedMethod === 'email' ? 'text-neon-cyan' : 'text-gaming-text'
                  }`}>
                    E-posta
                  </p>
                  <p className="text-sm text-gaming-muted">
                    {maskEmail(email)}
                  </p>
                </div>
              </div>
            </button>

            {/* SMS Option */}
            <button
              type="button"
              onClick={() => setSelectedMethod('sms')}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                selectedMethod === 'sms'
                  ? 'border-neon-green bg-neon-green/10 shadow-glow-green'
                  : 'border-gaming-border bg-gaming-surface/50 hover:border-neon-green/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  selectedMethod === 'sms' ? 'bg-neon-green/20' : 'bg-gaming-surface'
                }`}>
                  <Phone className={`w-5 h-5 ${
                    selectedMethod === 'sms' ? 'text-neon-green' : 'text-gaming-muted'
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium ${
                    selectedMethod === 'sms' ? 'text-neon-green' : 'text-gaming-text'
                  }`}>
                    SMS
                  </p>
                  <p className="text-sm text-gaming-muted">
                    {formatPhoneNumber(phoneNumber)}
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Send Code Button */}
          <button
            type="button"
            onClick={sendVerificationCode}
            disabled={isResending}
            className={`w-full btn-neon relative ${isResending ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isResending ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Kod Gönderiliyor...</span>
              </div>
            ) : (
              'Doğrulama Kodu Gönder'
            )}
          </button>
        </div>
      )}

      {/* Code Input Form */}
      {codeSent && (
        <>
          {/* Notification */}
          {notification && (
            <div className={`p-4 rounded-xl border ${
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
            {/* Verification Code Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gaming-text">
                {selectedMethod === 'email' ? 'E-posta' : 'SMS'} Doğrulama Kodu
              </label>
              <p className="text-xs text-gaming-muted">
                Kodu {selectedMethod === 'email' ? maskEmail(email) : formatPhoneNumber(phoneNumber)} adresine gönderdik
              </p>
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                className={`w-full px-4 py-4 text-center text-2xl font-mono tracking-widest bg-gaming-surface/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                  errors 
                    ? 'border-red-500 focus:ring-red-500/50' 
                    : 'border-gaming-border focus:ring-neon-purple/50 focus:border-neon-purple'
                }`}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading || attempts >= MAX_ATTEMPTS}
              />
              {errors && (
                <p className="text-red-400 text-sm animate-fade-in-up flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors}</span>
                </p>
              )}
            </div>

            {/* Attempts Counter */}
            {attempts > 0 && attempts < MAX_ATTEMPTS && (
              <div className="text-center">
                <p className="text-neon-orange text-sm">
                  Kalan deneme hakkınız: {MAX_ATTEMPTS - attempts}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !code || code.length !== 6 || attempts >= MAX_ATTEMPTS}
              className={`w-full btn-neon relative ${
                isLoading || !code || code.length !== 6 || attempts >= MAX_ATTEMPTS
                  ? 'opacity-70 cursor-not-allowed'
                  : ''
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Doğrulanıyor...</span>
                </div>
              ) : (
                'Cihazı Doğrula'
              )}
            </button>

            {/* Resend Code */}
            <div className="text-center">
              <button
                type="button"
                onClick={sendVerificationCode}
                disabled={isResending || resendCooldown > 0 || attempts >= MAX_ATTEMPTS}
                className={`text-neon-cyan hover:text-neon-purple transition-colors text-sm font-medium inline-flex items-center space-x-2 ${
                  isResending || resendCooldown > 0 || attempts >= MAX_ATTEMPTS
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0 
                    ? `Kodu tekrar gönder (${resendCooldown}s)`
                    : isResending
                    ? 'Gönderiliyor...'
                    : 'Kodu tekrar gönder'
                  }
                </span>
              </button>
            </div>

            {/* Change Method */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setCodeSent(false);
                  setSelectedMethod(selectedMethod === 'email' ? 'sms' : 'email');
                }}
                className="text-gaming-muted hover:text-neon-cyan transition-colors text-sm"
                disabled={isLoading}
              >
                {selectedMethod === 'email' ? 'SMS ile doğrula' : 'E-posta ile doğrula'}
              </button>
            </div>
          </form>
        </>
      )}

      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="w-full px-6 py-3 rounded-xl bg-gaming-surface/50 backdrop-blur-sm border border-gaming-border hover:border-neon-cyan transition-all duration-300 font-semibold text-gaming-text hover:text-neon-cyan"
        disabled={isLoading}
      >
        <div className="flex items-center justify-center space-x-2">
          <ArrowLeft className="w-5 h-5" />
          <span>Giriş Sayfasına Dön</span>
        </div>
      </button>
    </div>
  );
}
