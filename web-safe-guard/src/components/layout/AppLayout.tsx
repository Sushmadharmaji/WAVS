import { Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Settings,
  HelpCircle,
  BarChart2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";

// ---------------------------------------------------------------------------
// Route definitions — single source of truth for the sidebar.
// Add/remove routes here; the nav renders automatically.
// ---------------------------------------------------------------------------
const NAV_ITEMS = [
  { to: "/",               label: "Scanner",        icon: LayoutDashboard, end: true  },
  { to: "/reports",        label: "Reports",        icon: FileText,        end: false },
  { to: "/scam-detector",  label: "AI Scam Detector", icon: ShieldAlert,   end: false },
  { to: "/analytics",      label: "Analytics",      icon: BarChart2,       end: false },
  { to: "/settings",       label: "Settings",       icon: Settings,        end: false },
  { to: "/help",           label: "Help",           icon: HelpCircle,      end: false },
] as const;

// Shared classes defined once to keep JSX readable
const NAV_BASE =
  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground";
const NAV_ACTIVE =
  "bg-primary/10 !text-primary font-medium";

// ---------------------------------------------------------------------------
// AppLayout
// ---------------------------------------------------------------------------
export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen bg-background">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="flex w-56 flex-col border-r border-border bg-card">

        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-mono text-sm font-bold tracking-widest text-primary">
            VULN<span className="text-foreground">SCANNER</span>
          </span>
        </div>

        {/* Navigation — uses your custom NavLink wrapper */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={NAV_BASE}
              activeClassName={NAV_ACTIVE}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border">
          <p className="text-[11px] font-mono text-muted-foreground">
            ⚠ Educational · Simulated
          </p>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col overflow-auto">

        {/* Sticky breadcrumb header */}
        <header className="sticky top-0 z-10 flex h-12 items-center border-b border-border bg-background/80 backdrop-blur px-6">
          <span className="text-xs font-mono text-muted-foreground">
            {pathname === "/" ? "~/" : `~${pathname}`}
          </span>
        </header>

        {/* Active route renders here */}
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
