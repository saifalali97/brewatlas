"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { logSafariCrash } from "@/lib/debug/safari-crash-debug";

type DebugErrorBoundaryProps = {
  name: string;
  children: ReactNode;
};

type DebugErrorBoundaryState = {
  error: Error | null;
};

/**
 * TEMPORARY — catches render errors in a named subtree and logs them for Safari bisection.
 */
export class DebugErrorBoundary extends Component<
  DebugErrorBoundaryProps,
  DebugErrorBoundaryState
> {
  state: DebugErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): DebugErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logSafariCrash(this.props.name, error, info.componentStack);
  }

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <div
          data-debug-crash={this.props.name}
          className="m-4 rounded-lg border-2 border-red-600 bg-red-950 p-4 text-left text-red-100"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-red-400">
            DEBUG CRASH
          </p>
          <p className="mt-2 font-mono text-sm">{this.props.name}</p>
          <p className="mt-2 text-sm">{error.message}</p>
          <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-red-200/90">
            {error.stack ?? "(no stack)"}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
