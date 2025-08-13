import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FirebaseRulesNotificationProps {
  onClose: () => void;
}

export default function FirebaseRulesNotification({ onClose }: FirebaseRulesNotificationProps) {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-200">
          Firebase Rules Update Needed
        </AlertTitle>
        <AlertDescription className="text-yellow-700 dark:text-yellow-300 mt-2">
          <p className="mb-3">
            Some features (notifications, stats tracking) are currently disabled due to missing Firestore security rules.
          </p>
          <p className="text-sm mb-3">
            To enable these features, deploy the updated Firestore rules:
          </p>
          <div className="bg-black/10 dark:bg-white/10 p-2 rounded text-xs font-mono mb-3">
            firebase deploy --only firestore:rules
          </div>
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
            >
              Dismiss
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://firebase.google.com/docs/firestore/security/get-started', '_blank')}
              className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Learn More
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
