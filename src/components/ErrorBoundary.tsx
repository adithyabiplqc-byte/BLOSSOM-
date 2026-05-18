import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends (Component as any) {
  state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let displayMessage = this.state.error?.message || 'Unknown error occurred';
      let isFirestoreError = false;
      try {
        const parsed = JSON.parse(displayMessage);
        if (parsed.error && parsed.operationType) {
          displayMessage = `Firestore ${parsed.operationType} error: ${parsed.error} at ${parsed.path || 'unknown path'}`;
          isFirestoreError = true;
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="p-10 text-center bg-rose-50 rounded-2xl border border-rose-100 m-4 shadow-xl">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 className="text-2xl font-black text-rose-800 mb-2 uppercase tracking-tight">System Error</h2>
          <p className="text-rose-600 text-sm mb-8 font-medium max-w-md mx-auto leading-relaxed">{displayMessage}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="bg-rose-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 uppercase text-xs tracking-widest"
            >
              Reload System
            </button>
            {isFirestoreError && (
              <button 
                onClick={() => this.setState({ hasError: false, error: null })}
                className="bg-white text-rose-600 border border-rose-200 px-8 py-3 rounded-xl font-bold hover:bg-rose-50 transition-all uppercase text-xs tracking-widest"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
