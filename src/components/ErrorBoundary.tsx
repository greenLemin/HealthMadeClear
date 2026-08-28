"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div role="alert" className="mx-auto max-w-2xl p-6 text-center">
          <h2 className="mb-2 font-display text-headline-md text-primary">Something went wrong</h2>
          <p className="mb-2 text-body-md text-on-surface-variant">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <p lang="es" className="mb-4 text-body-md text-on-surface-variant">
            Algo salió mal. Ocurrió un error inesperado. Prueba a actualizar la página.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-full bg-primary px-6 py-2.5 text-label-md text-on-primary hover:bg-primary/90"
          >
            Try again / Intentar de nuevo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
