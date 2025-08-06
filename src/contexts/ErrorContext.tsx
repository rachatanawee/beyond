'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Wifi, WifiOff, RefreshCw, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ErrorContextType {
  showError: (error: GlobalError) => void;
  hideError: () => void;
  isOnline: boolean;
  connectionStatus: 'online' | 'offline' | 'checking';
}

interface GlobalError {
  type: 'network' | 'supabase' | 'auth' | 'general' | 'validation';
  title: string;
  message: string;
  action?: {
    label: string;
    handler: () => void;
  };
  persistent?: boolean;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<GlobalError | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('online');
  const t = useTranslations('Errors');

  // Check internet connectivity
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('checking');
        
        // Check internet connectivity
        const response = await fetch('/api/health', {
          method: 'HEAD',
          cache: 'no-cache',
        });
        
        if (response.ok) {
          setIsOnline(true);
          setConnectionStatus('online');
          
          // If we were offline and now online, hide network errors
          if (error?.type === 'network') {
            setError(null);
          }
        } else {
          throw new Error('Network response not ok');
        }
      } catch {
        setIsOnline(false);
        setConnectionStatus('offline');
        
        // Show network error if not already showing one
        if (!error || error.type !== 'network') {
          showError({
            type: 'network',
            title: t('networkError', { defaultValue: 'Connection Error' }),
            message: t('networkErrorMessage', { 
              defaultValue: 'Unable to connect to the server. Please check your internet connection.' 
            }),
            action: {
              label: t('retry', { defaultValue: 'Retry' }),
              handler: checkConnection,
            },
            persistent: true,
          });
        }
      }
    };

    // Initial check
    checkConnection();

    // Set up periodic checks
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      checkConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionStatus('offline');
      showError({
        type: 'network',
        title: t('offlineTitle', { defaultValue: 'You are offline' }),
        message: t('offlineMessage', { 
          defaultValue: 'Please check your internet connection and try again.' 
        }),
        persistent: true,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error, t]);

  // Check Supabase connectivity
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      if (!isOnline) return;

      try {
        const response = await fetch('/api/health/supabase', {
          method: 'GET',
          cache: 'no-cache',
        });

        if (!response.ok) {
          throw new Error('Supabase connection failed');
        }
      } catch {
        // Only show Supabase error if we're online but can't connect to Supabase
        if (isOnline && (!error || error.type !== 'supabase')) {
          showError({
            type: 'supabase',
            title: t('databaseError', { defaultValue: 'Database Connection Error' }),
            message: t('databaseErrorMessage', { 
              defaultValue: 'Unable to connect to the database. Please try again later.' 
            }),
            action: {
              label: t('retry', { defaultValue: 'Retry' }),
              handler: checkSupabaseConnection,
            },
          });
        }
      }
    };

    // Check Supabase connection when online
    if (isOnline) {
      checkSupabaseConnection();
    }
  }, [isOnline, error, t]);

  const showError = (newError: GlobalError) => {
    setError(newError);
  };

  const hideError = () => {
    setError(null);
  };

  return (
    <ErrorContext.Provider value={{ showError, hideError, isOnline, connectionStatus }}>
      {children}
      
      {/* Global Error Display */}
      {error && (
        <div className="fixed top-4 right-4 z-[100] max-w-md">
          <Alert variant={error.type === 'network' ? 'destructive' : 'default'} className="shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                {error.type === 'network' ? (
                  <WifiOff className="h-4 w-4 mt-0.5" />
                ) : error.type === 'supabase' ? (
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertTitle className="text-sm font-medium">
                    {error.title}
                  </AlertTitle>
                  <AlertDescription className="text-sm mt-1">
                    {error.message}
                  </AlertDescription>
                  
                  {error.action && (
                    <div className="mt-3 flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={error.action.handler}
                        className="h-8"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        {error.action.label}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {!error.persistent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={hideError}
                  className="h-6 w-6 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </Alert>
        </div>
      )}

      {/* Connection Status Indicator */}
      <div className="fixed bottom-4 left-4 z-[99]">
        {connectionStatus === 'checking' && (
          <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-3 py-2 rounded-md text-sm">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>{t('checkingConnection', { defaultValue: 'Checking connection...' })}</span>
          </div>
        )}
        
        {connectionStatus === 'offline' && (
          <div className="flex items-center space-x-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-3 py-2 rounded-md text-sm">
            <WifiOff className="h-3 w-3" />
            <span>{t('offline', { defaultValue: 'Offline' })}</span>
          </div>
        )}
        
        {connectionStatus === 'online' && !isOnline && (
          <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-3 py-2 rounded-md text-sm">
            <Wifi className="h-3 w-3" />
            <span>{t('backOnline', { defaultValue: 'Back online' })}</span>
          </div>
        )}
      </div>
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}