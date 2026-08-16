import { cn } from "@/lib/utils";

export type StatusVariant =
  | "effective"
  | "approved"
  | "pending"
  | "draft"
  | "error"
  | "superseded"
  | "obsolete";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: StatusVariant;
  children: React.ReactNode;
}

export function StatusBadge({
  variant,
  children,
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn("status-badge", `status-${variant}`, className)}
      {...props}
    >
      {children}
    </span>
  );
}
