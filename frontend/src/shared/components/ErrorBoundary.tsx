import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white border border-red-100 rounded-xl shadow-sm my-8 max-w-xl mx-auto">
          <div className="p-3 bg-red-50 text-red-500 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-800 mb-2">Something went wrong</h2>
          <p className="text-sm text-neutral-500 mb-6 max-w-md">
            An unexpected error occurred while rendering this page:
            <span className="block mt-2 font-mono text-xs bg-neutral-50 p-2 rounded text-red-600 max-h-24 overflow-y-auto">
              {this.state.error?.message || 'Unknown error'}
            </span>
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Workspace
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
