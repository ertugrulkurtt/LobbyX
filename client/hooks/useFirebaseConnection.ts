import { useState, useEffect } from 'react';
import { addConnectionListener, removeConnectionListener, getConnectionStatus, ConnectionStatus } from '../lib/firebaseConnectionMonitor';

export const useFirebaseConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(getConnectionStatus());

  useEffect(() => {
    const handleConnectionChange = (status: ConnectionStatus) => {
      setConnectionStatus(status);
    };

    addConnectionListener(handleConnectionChange);

    return () => {
      removeConnectionListener(handleConnectionChange);
    };
  }, []);

  return connectionStatus;
};

export default useFirebaseConnection;
