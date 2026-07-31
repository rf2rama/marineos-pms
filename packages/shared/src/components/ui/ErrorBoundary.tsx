import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-8 my-4 border border-red-500/20 bg-red-950/10 rounded-2xl text-center flex flex-col items-center">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-full mb-3">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-white">Something went wrong</h3>
          <p className="text-xs text-slate-400 max-w-md mt-1 mb-4">
            {this.state.error?.message || 'An unexpected error occurred in this view.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
