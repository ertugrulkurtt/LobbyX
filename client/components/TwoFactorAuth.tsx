import React, { useState, useEffect } from 'react';
import { QrCode, Smartphone, Copy, CheckCircle, AlertCircle, Shield, ArrowLeft, RefreshCw } from 'lucide-react';

interface TwoFactorAuthProps {
  mode: 'setup' | 'verify';
  onSuccess: () => void;
  onBack?: () => void;
}

export default function TwoFactorAuth({ mode, onSuccess, onBack }: TwoFactorAuthProps) {
  const [currentStep, setCurrentStep] = useState<'qr-code' | 'verify-code' | 'backup-codes'>('qr-code');
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [errors, setErrors] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const MAX_ATTEMPTS = 3;

  // Mock function to generate 2FA setup data
  const generate2FASetup = async () => {
    // Simulate API call to generate QR code and secret
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockSecret = 'JBSWY3DPEHPK3PXP';
    const mockQrUrl = `otpauth://totp/LobbyX:user@example.com?secret=${mockSecret}&issuer=LobbyX`;
    
    setSecretKey(mockSecret);
    setQrCodeUrl(mockQrUrl);
    
    // Generate backup codes
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
  };

  // Mock function to verify 2FA code
  const verify2FACode = async (code: string): Promise<boolean> => {
    // Simulate API verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    // For demo purposes, accept "123456" as valid code
    return code === '123456';
  };

  useEffect(() => {
    if (mode === 'setup' && currentStep === 'qr-code') {
      generate2FASetup();
    }
  }, [mode, currentStep]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
    if (errors) setErrors('');
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setErrors('Doğrulama kodu gerekli');
      return;
    }

    if (verificationCode.length !== 6) {
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
      const isValid = await verify2FACode(verificationCode);
      
      if (isValid) {
        if (mode === 'setup') {
          setNotification({ type: 'success', message: '2FA başarıyla kuruldu!' });
          setTimeout(() => {
            setCurrentStep('backup-codes');
          }, 1500);
        } else {
          setNotification({ type: 'success', message: '2FA doğrulaması başarılı!' });
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          setErrors('Çok fazla yanlış deneme yaptınız. Lütfen tekrar deneyin.');
          if (onBack) {
            setTimeout(() => {
              onBack();
            }, 3000);
          }
        } else {
          setErrors(`Geçersiz kod. Kalan hakkınız: ${MAX_ATTEMPTS - newAttempts}`);
        }
        setVerificationCode('');
      }
    } catch (error) {
      setErrors('Doğrulama sırasında hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleFinishSetup = () => {
    setNotification({ type: 'success', message: '2FA kurulumu tamamlandı!' });
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  if (mode === 'setup') {
    return (
      <div className="space-y-6">
        {/* QR Code Step */}
        {currentStep === 'qr-code' && (
          <>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-neon-green to-neon-cyan rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse-glow">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gaming-text mb-2">İki Faktörlü Doğrulama Kurulumu</h2>
              <p className="text-gaming-muted text-sm">
                Hesabınızın güvenliğini artırmak için 2FA'yı etkinleştirin
              </p>
            </div>

            <div className="space-y-6">
              {/* Step 1: Download Authenticator App */}
              <div className="p-4 rounded-xl border border-gaming-border bg-gaming-surface/30">
                <h3 className="font-semibold text-gaming-text mb-2 flex items-center space-x-2">
                  <span className="w-6 h-6 bg-neon-cyan text-black rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <span>Authenticator Uygulaması İndirin</span>
                </h3>
                <p className="text-gaming-muted text-sm mb-3">
                  Google Authenticator, Authy veya benzeri bir uygulama indirin
                </p>
                <div className="flex space-x-2">
                  <span className="px-3 py-1 bg-neon-green/20 text-neon-green rounded-full text-xs">Google Authenticator</span>
                  <span className="px-3 py-1 bg-neon-cyan/20 text-neon-cyan rounded-full text-xs">Authy</span>
                  <span className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full text-xs">Microsoft Authenticator</span>
                </div>
              </div>

              {/* Step 2: Scan QR Code */}
              <div className="p-4 rounded-xl border border-gaming-border bg-gaming-surface/30">
                <h3 className="font-semibold text-gaming-text mb-3 flex items-center space-x-2">
                  <span className="w-6 h-6 bg-neon-cyan text-black rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span>QR Kodunu Tarayın</span>
                </h3>
                
                <div className="bg-white p-4 rounded-xl mx-auto w-fit mb-4">
                  <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-gray-400" />
                    <span className="text-gray-600 text-sm ml-2">QR Code</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-gaming-muted text-sm text-center">
                    QR kodu tarayamıyorsanız, aşağıdaki kodu manuel olarak girin:
                  </p>
                  <div className="flex items-center space-x-2 p-3 bg-gaming-surface/50 rounded-lg">
                    <code className="flex-1 text-sm font-mono text-gaming-text break-all">
                      {secretKey}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(secretKey)}
                      className="p-2 hover:bg-gaming-surface rounded-lg transition-colors"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-neon-green" />
                      ) : (
                        <Copy className="w-4 h-4 text-gaming-muted hover:text-neon-cyan" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3: Verify */}
              <div className="p-4 rounded-xl border border-gaming-border bg-gaming-surface/30">
                <h3 className="font-semibold text-gaming-text mb-3 flex items-center space-x-2">
                  <span className="w-6 h-6 bg-neon-cyan text-black rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <span>Kodu Doğrulayın</span>
                </h3>
                <p className="text-gaming-muted text-sm mb-4">
                  Authenticator uygulamanızdan 6 haneli kodu girin
                </p>
                
                <button
                  type="button"
                  onClick={() => setCurrentStep('verify-code')}
                  className="w-full btn-neon"
                >
                  Kodu Doğrula
                </button>
              </div>
            </div>
          </>
        )}

        {/* Verify Code Step */}
        {currentStep === 'verify-code' && (
          <>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse-glow">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gaming-text mb-2">Doğrulama Kodu</h2>
              <p className="text-gaming-muted text-sm">
                Authenticator uygulamanızdan 6 haneli kodu girin
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

            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gaming-text">2FA Kodu</label>
                <input
                  type="text"
                  value={verificationCode}
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

              <button
                type="submit"
                disabled={isLoading || !verificationCode || verificationCode.length !== 6 || attempts >= MAX_ATTEMPTS}
                className={`w-full btn-neon relative ${
                  isLoading || !verificationCode || verificationCode.length !== 6 || attempts >= MAX_ATTEMPTS
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
                  'Kodu Doğrula'
                )}
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep('qr-code')}
                className="w-full px-6 py-3 rounded-xl bg-gaming-surface/50 backdrop-blur-sm border border-gaming-border hover:border-neon-cyan transition-all duration-300 font-semibold text-gaming-text hover:text-neon-cyan"
                disabled={isLoading}
              >
                <div className="flex items-center justify-center space-x-2">
                  <ArrowLeft className="w-5 h-5" />
                  <span>Geri Dön</span>
                </div>
              </button>
            </form>
          </>
        )}

        {/* Backup Codes Step */}
        {currentStep === 'backup-codes' && (
          <>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-neon-green to-neon-cyan rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse-glow">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gaming-text mb-2">Yedek Kodlar</h2>
              <p className="text-gaming-muted text-sm">
                Bu kodları güvenli bir yerde saklayın. Telefonunuza erişemediğinizde kullanabilirsiniz.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-neon-orange/30 bg-neon-orange/10">
                <div className="flex items-center space-x-2 text-neon-orange mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold text-sm">Önemli Uyarı</span>
                </div>
                <p className="text-neon-orange text-sm">
                  Her kod yalnızca bir kez kullanılabilir. Bu kodları güvenli bir yerde saklayın ve kimseyle paylaşmayın.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-4 bg-gaming-surface/30 rounded-xl">
                {backupCodes.map((code, index) => (
                  <div key={index} className="p-2 bg-gaming-surface/50 rounded-lg text-center font-mono text-sm text-gaming-text">
                    {code}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                className="w-full px-6 py-3 rounded-xl bg-gaming-surface/50 backdrop-blur-sm border border-gaming-border hover:border-neon-cyan transition-all duration-300 font-semibold text-gaming-text hover:text-neon-cyan"
              >
                <div className="flex items-center justify-center space-x-2">
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-neon-green" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                  <span>{copied ? 'Kopyalandı!' : 'Kodları Kopyala'}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleFinishSetup}
                className="w-full btn-neon"
              >
                Kurulumu Tamamla
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Verify mode (for login)
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse-glow">
          <Smartphone className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gaming-text mb-2">İki Faktörlü Doğrulama</h2>
        <p className="text-gaming-muted text-sm">
          Authenticator uygulamanızdan 6 haneli kodu girin
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

      <form onSubmit={handleVerifyCode} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gaming-text">2FA Kodu</label>
          <input
            type="text"
            value={verificationCode}
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

        <button
          type="submit"
          disabled={isLoading || !verificationCode || verificationCode.length !== 6 || attempts >= MAX_ATTEMPTS}
          className={`w-full btn-neon relative ${
            isLoading || !verificationCode || verificationCode.length !== 6 || attempts >= MAX_ATTEMPTS
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

        {onBack && (
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
        )}
      </form>
    </div>
  );
}
