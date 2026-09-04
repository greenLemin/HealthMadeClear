"use client";

import React from "react";
import { useTranslations } from "next-intl";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

function DefaultCrashFallback({ onReset }: { onReset: () => void }) {
  const t = useTranslations("errors");

  return (
    <div role="alert" className="mx-auto max-w-2xl p-6 text-center">
      <h2 className="mb-2 font-display text-headline-md text-primary">{t("title")}</h2>
      <p className="mb-4 text-body-md text-on-surface-variant">{t("crashBody")}</p>
      <button
        type="button"
        onClick={onReset}
        className="min-h-11 rounded-full bg-primary px-6 py-2.5 text-label-md text-on-primary hover:bg-primary/90"
      >
        {t("tryAgain")}
      </button>
    </div>
  );
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
    // Route through the centralized reporter so production crashes reach Sentry
    // with PII scrubbing, while dev still gets a console trace. Direct
    // console.error here bypassed sanitization and never left the browser.
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught:", error, errorInfo);
      return;
    }
    void import("@/lib/errorReporting").then(({ reportClientError }) => {
      reportClientError(error, { componentStack: Boolean(errorInfo?.componentStack) });
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <DefaultCrashFallback onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}
