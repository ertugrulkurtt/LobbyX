import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { testFirebaseConnection } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export function FirebaseStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<'checking' | 'connected' | 'permissions_needed'>('checking');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkConnection = async () => {
      if (!user) {
        setStatus('checking');
        return;
      }

      try {
        const isConnected = await testFirebaseConnection();
        if (mounted) {
          setStatus(isConnected ? 'connected' : 'permissions_needed');
        }
      } catch (error) {
        if (mounted) {
          setStatus('permissions_needed');
        }
      }
    };

    checkConnection();

    // Check periodically
    const interval = setInterval(checkConnection, 30000); // every 30 seconds

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user]);

  if (!user || status === 'checking') {
    return (
      <div className="flex items-center text-gaming-muted text-sm">
        <Clock className="w-4 h-4 mr-2 animate-spin" />
        Bağlantı kontrol ediliyor...
      </div>
    );
  }

  if (status === 'connected') {
    return (
      <div className="flex items-center text-neon-green text-sm">
        <CheckCircle className="w-4 h-4 mr-2" />
        Firebase bağlı
      </div>
    );
  }

  return (
    <div className="bg-neon-orange/10 border border-neon-orange/30 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-neon-orange text-sm">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Firebase izinleri gerekli
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-neon-orange/70 hover:text-neon-orange transition-colors"
        >
          {showDetails ? 'Gizle' : 'Detaylar'}
        </button>
      </div>
      
      {showDetails && (
        <div className="mt-2 text-xs text-gaming-muted">
          <p className="mb-2">
            Firebase bağlantı sorunu tespit edildi. Bu durum şu sebeplerden olabilir:
          </p>
          <div className="bg-gaming-surface rounded p-2 text-xs space-y-1">
            <div>🔐 <strong>Firestore Rules:</strong> Kurallar deploy edilmemiş olabilir</div>
            <div>🌐 <strong>Network:</strong> İnternet bağlantısı sorunu</div>
            <div>👤 <strong>Authentication:</strong> Oturum açma sorunu</div>
          </div>
          <div className="mt-2 text-xs">
            <strong>Çözüm:</strong> FIREBASE_QUICK_FIX.md dosyasına bakın
          </div>
        </div>
      )}
    </div>
  );
}

export default FirebaseStatus;
