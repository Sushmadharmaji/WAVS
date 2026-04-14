import { ShieldCheck } from "lucide-react";

/**
 * Shown by the top-level <Suspense> while a lazy page chunk is being fetched.
 * Kept intentionally minimal so it renders immediately without any data deps.
 */
export function PageLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <div className="relative flex h-12 w-12 items-center justify-center">
        {/* Spinning ring */}
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <ShieldCheck className="h-5 w-5 text-primary" />
      </div>
      <p className="text-xs font-mono text-muted-foreground animate-pulse">
        Loading…
      </p>
    </div>
  );
}
