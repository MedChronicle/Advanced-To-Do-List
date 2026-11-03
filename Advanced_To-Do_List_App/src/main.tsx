// src/app/components/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div role="alert" className="min-h-screen grid place-items-center bg-background text-foreground p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-muted-foreground text-sm">{this.state.error.message}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => location.reload()}
              className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm"
            >
              Reload
            </button>
            <button
              onClick={() => {
                if (confirm("This clears all saved tasks in this browser. Continue?")) {
                  localStorage.clear();
                  location.reload();
                }
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm"
            >
              Reset data
            </button>
          </div>
        </div>
      </div>
    );
  }
}
