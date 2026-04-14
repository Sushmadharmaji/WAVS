import { NavLink as RouterNavLink, type NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Extends react-router NavLinkProps so className can be either a plain string
// OR the render-prop function (isActive, isPending) => string that the router
// supports natively.  activeClassName / pendingClassName are convenience props
// so callers don't have to write the render-prop themselves.
// ---------------------------------------------------------------------------
interface NavLinkCompatProps
  extends Omit<NavLinkProps, "className"> {
  /** Applied in all states */
  className?: string;
  /** Merged in when the route is active */
  activeClassName?: string;
  /** Merged in while the route is loading (React Router v6.4+ loaders) */
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  (
    {
      className,
      activeClassName,
      pendingClassName,
      children,
      to,
      end,
      ...props
    },
    ref,
  ) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        end={end}
        className={({ isActive, isPending }) =>
          cn(
            className,
            isActive && activeClassName,
            isPending && pendingClassName,
          )
        }
        {...props}
      >
        {children}
      </RouterNavLink>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
export type { NavLinkCompatProps };
