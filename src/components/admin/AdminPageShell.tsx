import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AdminPageShellProps {
  title?: ReactNode;
  description?: ReactNode;
  headerExtra?: ReactNode;
  tabs?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** When true (default), body scrolls inside viewport-bound shell */
  scrollBody?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  bodyClassName?: string;
}

const maxWidthClass = {
  sm: "max-w-3xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
  full: "max-w-none",
};

export function AdminPageShell({
  title,
  description,
  headerExtra,
  tabs,
  children,
  footer,
  scrollBody = true,
  maxWidth = "full",
  className,
  bodyClassName,
}: AdminPageShellProps) {
  return (
    <div
      className={cn(
        "flex flex-col min-h-0 min-w-0 w-full h-full",
        scrollBody && "overflow-hidden",
        className
      )}
    >
      <div className={cn("flex flex-col min-h-0 flex-1 mx-auto w-full", maxWidthClass[maxWidth])}>
        {(title || description || headerExtra) && (
          <div className="shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b border-border/60 bg-background">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 min-w-0">
              <div className="min-w-0 flex-1">
                {title && (
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
                )}
                {description && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{description}</p>
                )}
              </div>
              {headerExtra && (
                <div className="shrink-0 flex flex-wrap items-center gap-2">{headerExtra}</div>
              )}
            </div>
          </div>
        )}
        {tabs && (
          <div className="shrink-0 border-b border-border/60 bg-muted/20 px-4 sm:px-6 z-10">
            {tabs}
          </div>
        )}
        <div
          className={cn(
            "min-w-0",
            scrollBody
              ? "flex-1 overflow-y-auto overscroll-y-contain px-4 sm:px-6 py-4 sm:py-6 pb-10"
              : "px-4 sm:px-6 py-4 sm:py-6 pb-10",
            bodyClassName
          )}
        >
          {children}
        </div>
        {footer && (
          <div className="shrink-0 border-t border-border/60 bg-background px-4 sm:px-6 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
