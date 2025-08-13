import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NetworkErrorNotificationProps {
  onClose: () => void;
  onRetry?: () => void;
}

export default function NetworkErrorNotification({ onClose, onRetry }: NetworkErrorNotificationProps) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-900/20">
        <WifiOff className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800 dark:text-orange-200">
          Connection Issues Detected
        </AlertTitle>
        <AlertDescription className="text-orange-700 dark:text-orange-300 mt-2">
          <p className="mb-3">
            Firebase is experiencing connectivity issues. This might be caused by browser extensions or network problems.
          </p>
          <div className="space-y-2 text-sm mb-3">
            <p>Try these solutions:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Disable browser extensions temporarily</li>
              <li>Check your internet connection</li>
              <li>Refresh the page</li>
            </ul>
          </div>
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className="text-orange-800 border-orange-300 hover:bg-orange-100"
            >
              Dismiss
            </Button>
            <div className="space-x-2">
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="text-orange-800 border-orange-300 hover:bg-orange-100"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="text-orange-800 border-orange-300 hover:bg-orange-100"
              >
                <Wifi className="h-3 w-3 mr-1" />
                Refresh Page
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
