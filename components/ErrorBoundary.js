"use client";

import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mb-4 text-6xl">😵</div>
            <h1 className="mb-4 text-xl font-semibold text-slate-900">Oops! Something went wrong</h1>
            <p className="mb-6 text-slate-600">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full rounded-full bg-brand-900 px-6 py-3 text-white transition hover:bg-brand-700"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full rounded-full border border-slate-200 bg-white px-6 py-3 text-slate-900 transition hover:border-brand-700"
              >
                Go Back
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-slate-500">Error Details (Dev Mode)</summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs text-red-600">
                  {this.state.error?.toString()}
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