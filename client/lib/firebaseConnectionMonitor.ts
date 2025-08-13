/**
 * Simple Firebase Connection Monitor
 */

export interface ConnectionStatus {
  isConnected: boolean;
  lastError?: string;
  retryCount: number;
}

let connectionStatus: ConnectionStatus = {
  isConnected: true,
  retryCount: 0,
};

const connectionListeners: ((status: ConnectionStatus) => void)[] = [];

export const addConnectionListener = (
  listener: (status: ConnectionStatus) => void,
) => {
  connectionListeners.push(listener);
  listener(connectionStatus);
};

export const removeConnectionListener = (
  listener: (status: ConnectionStatus) => void,
) => {
  const index = connectionListeners.indexOf(listener);
  if (index > -1) {
    connectionListeners.splice(index, 1);
  }
};

export const getConnectionStatus = (): ConnectionStatus => {
  return connectionStatus;
};

export const initializeConnectionMonitoring = () => {
  console.log("Simple connection monitoring initialized");
};

export default {
  addConnectionListener,
  removeConnectionListener,
  getConnectionStatus,
  initializeConnectionMonitoring,
};
