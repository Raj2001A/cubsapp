import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: unknown;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    // Log everything for debugging
    console.error('ErrorBoundary caught:', error);
    console.error('Error info:', errorInfo);
    this.setState({
      error,
      errorInfo
    });
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error as Error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded text-red-800">
          <h2 className="text-lg font-bold mb-2">Something went wrong.</h2>
          <pre className="text-xs whitespace-pre-wrap break-all mb-2">
            {typeof this.state.error === 'object'
              ? JSON.stringify(this.state.error, Object.getOwnPropertyNames(this.state.error), 2)
              : String(this.state.error)}
          </pre>
          {this.state.errorInfo && (
            <details className="text-xs">
              <summary>Stack Trace</summary>
              <pre>{this.state.errorInfo.componentStack}</pre>
            </details>
          )}
          <button
            className="mt-4 px-4 py-2 bg-red-200 rounded hover:bg-red-300"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
