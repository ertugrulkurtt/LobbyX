import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Report to error tracking service if available
    if ((window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.retry} />;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gaming-bg flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gaming-surface rounded-2xl shadow-2xl border border-gaming-border p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            
            <h1 className="text-xl font-bold text-gaming-text mb-2">
              Bir Hata Oluştu
            </h1>
            
            <p className="text-gaming-muted mb-6">
              {this.state.error?.name === 'NetworkError' 
                ? 'Ağ bağlantısı sorunu yaşanıyor. İnternet bağlantınızı kontrol edin.'
                : 'Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.'
              }
            </p>

            {/* Error details for development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-sm text-gaming-muted cursor-pointer mb-2">
                  Hata Detayları (Geliştirici)
                </summary>
                <div className="bg-gaming-bg rounded-lg p-3 text-xs text-red-400 font-mono">
                  <pre className="whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.retry}
                className="flex-1 px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tekrar Dene</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-4 py-2 bg-gaming-surface text-gaming-text border border-gaming-border rounded-lg hover:bg-gaming-surface/80 transition-colors flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Ana Sayfa</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
