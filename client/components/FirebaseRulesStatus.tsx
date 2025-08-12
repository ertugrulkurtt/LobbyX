import React, { useState, useEffect } from "react";
import { Shield, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { testFirebaseConnection } from "../lib/firebase";

interface FirebaseRulesStatusProps {
  onClose?: () => void;
}

export default function FirebaseRulesStatus({
  onClose,
}: FirebaseRulesStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const connected = await testFirebaseConnection();
      setIsConnected(connected);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = () => {
    if (isLoading)
      return <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />;
    if (isConnected === true)
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (isConnected === false)
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    return <Shield className="w-5 h-5 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isLoading) return "Bağlantı test ediliyor...";
    if (isConnected === true) return "Firebase kuralları aktif";
    if (isConnected === false) return "Firebase kuralları eksik";
    return "Bilinmeyen durum";
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gaming-surface border border-gaming-border rounded-lg p-4 max-w-sm shadow-lg z-50">
      <div className="flex items-start space-x-3">
        {getStatusIcon()}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gaming-text mb-1">
            Firebase Durumu
          </h3>
          <p className="text-xs text-gaming-muted mb-3">{getStatusText()}</p>

          {isConnected === false && (
            <div className="space-y-2">
              <div className="bg-red-500/10 border border-red-500/20 rounded p-2 text-xs text-red-400">
                <div className="font-medium mb-1">
                  Kuralları deploy etmek için:
                </div>
                <div className="font-mono text-xs bg-black/20 p-1 rounded">
                  npm run deploy-rules
                </div>
              </div>

              <div className="text-xs text-gaming-muted">
                <div>
                  1. Firebase CLI: <code>npm i -g firebase-tools</code>
                </div>
                <div>
                  2. Giriş: <code>firebase login</code>
                </div>
                <div>
                  3. Deploy: <code>firebase deploy --only firestore:rules</code>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-2 mt-3">
            <button
              onClick={testConnection}
              disabled={isLoading}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>Test Et</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1 bg-gaming-surface/50 hover:bg-gaming-surface text-gaming-muted rounded text-xs transition-colors"
              >
                Kapat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
