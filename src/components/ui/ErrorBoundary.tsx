"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
          <h2 className="text-xl font-semibold" style={{ color: "var(--color-heading)" }}>
            Something went wrong
          </h2>
          <p className="text-sm" style={{ color: "var(--color-desc)" }}>
            {this.state.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            className="rounded-md bg-[var(--tag-design)] px-4 py-2 text-sm font-medium text-white"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
