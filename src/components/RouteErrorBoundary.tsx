import  { Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logger } from '../utils/secureLogger';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ✅ P1 FIX: Route-level Error Boundary
 * Catches errors within specific routes without crashing the entire app
 * Provides route-specific error recovery options
 */
class RouteErrorBoundaryClass extends Component<Props & { navigate: ReturnType<typeof useNavigate>; location: ReturnType<typeof useLocation> }, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { location } = this.props;
    logger.error('RouteErrorBoundary caught error', {
      error,
      errorInfo,
      route: location.pathname,
    });
    
    this.setState({
      error,
      errorInfo
    });
  }

  private handleGoBack = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.navigate(-1);
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.navigate('/dashboard');
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-lg p-8 max-w-2xl w-full border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Page Error</h1>
                <p className="text-sm text-muted-foreground">Something went wrong on this page</p>
              </div>
            </div>

            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-destructive mb-2">Error Details:</h2>
              <p className="text-destructive/90 font-mono text-sm break-words">
                {this.state.error?.message || this.state.error?.toString()}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={this.handleRetry}
                variant="default"
                className="flex-1"
              >
                Try Again
              </Button>
              <Button
                onClick={this.handleGoBack}
                variant="outline"
                className="flex-1"
              >
                Go Back
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="flex-1"
              >
                Go to Dashboard
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-6 bg-muted border border-border rounded-lg p-4">
                <summary className="font-semibold text-foreground cursor-pointer">
                  Stack Trace (Development Only)
                </summary>
                <pre className="mt-2 text-xs text-muted-foreground overflow-auto max-h-96">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper component to inject React Router hooks into class component
 */
export function RouteErrorBoundary({ children, fallback }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <RouteErrorBoundaryClass navigate={navigate} location={location} fallback={fallback}>
      {children}
    </RouteErrorBoundaryClass>
  );
}