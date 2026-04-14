import { Component, type ErrorInfo, type ReactNode } from "react";
import { ShieldAlert, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props  { children: ReactNode }
interface State  { error: Error | null }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Swap this for your real logger (Sentry, LogRocket, etc.)
    console.error("[AppErrorBoundary]", error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
            <ShieldAlert className="h-7 w-7 text-destructive" />
          </div>

          <div className="space-y-1">
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            <p className="max-w-sm text-sm text-muted-foreground">
              An unexpected error occurred. The issue has been logged.
            </p>
          </div>

          <details className="w-full max-w-md text-left">
            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
              Show error details
            </summary>
            <pre className="mt-2 overflow-auto rounded-md bg-muted p-3 text-[11px] font-mono text-destructive">
              {this.state.error.message}
            </pre>
          </details>

          <Button variant="outline" size="sm" onClick={this.reset}>
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
