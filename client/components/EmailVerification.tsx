import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export default function EmailVerification({ email, onVerified, onBack }: EmailVerificationProps) {
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const MAX_ATTEMPTS = 3;

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Mock function to send verification code
  const sendVerificationCode = async () => {
    setIsResending(true);
    try {
      // Simulate API call to send verification code
      await new Promise(resolve => setTimeout(resolve, 1500));
      setNotification({ type: 'success', message: 'Doğrulama kodu e-postanıza gönderildi!' });
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
    // For demo purposes, accept "123456" as valid code
    return inputCode === '123456';
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
        setNotification({ type: 'success', message: 'E-posta doğrulandı!' });
        setTimeout(() => {
          onVerified();
        }, 1500);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          setErrors('Çok fazla yanlış deneme yaptınız. Lütfen tekrar kayıt olmayı deneyin.');
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

  // Send initial verification code on mount
  useEffect(() => {
    sendVerificationCode();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse-glow">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gaming-text mb-2">E-posta Doğrulama</h2>
        <p className="text-gaming-muted text-sm">
          <span className="text-neon-cyan font-medium">{email}</span> adresine gönderilen 6 haneli kodu girin
        </p>
      </div>

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
          <label className="text-sm font-medium text-gaming-text">Doğrulama Kodu</label>
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
            'Doğrula'
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

        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="w-full px-6 py-3 rounded-xl bg-gaming-surface/50 backdrop-blur-sm border border-gaming-border hover:border-neon-cyan transition-all duration-300 font-semibold text-gaming-text hover:text-neon-cyan"
          disabled={isLoading}
        >
          <div className="flex items-center justify-center space-x-2">
            <ArrowLeft className="w-5 h-5" />
            <span>Geri Dön</span>
          </div>
        </button>
      </form>
    </div>
  );
}
