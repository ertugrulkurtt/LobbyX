import React, { useState, useEffect } from "react";
import { AlertTriangle, X, RefreshCw } from "lucide-react";

interface FirebaseErrorNotificationProps {
  onClose?: () => void;
}

export function FirebaseErrorNotification({
  onClose,
}: FirebaseErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-red-400 mb-1">
              Firebase Bağlantı Sorunu
            </h3>
            <p className="text-xs text-gaming-muted mb-3">
              Veritabanı izinleri güncellenmelidir. Lütfen sistem yöneticisiyle
              iletişime geçin.
            </p>

            <div className="flex space-x-2">
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Yenile</span>
              </button>

              <button
                onClick={handleClose}
                className="px-3 py-1 bg-gaming-surface/50 hover:bg-gaming-surface text-gaming-muted rounded text-xs transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-gaming-muted hover:text-gaming-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FirebaseErrorNotification;
