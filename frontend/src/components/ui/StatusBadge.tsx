import { cn } from "@/lib/utils";

export type StatusVariant =
  | "draft"
  | "pending"
  | "approved"
  | "effective"
  | "error"
  | "obsolete"
  | "archived"
  | "superseded";

const statusVariants: Record<StatusVariant, string> = {
  draft: "status-draft",
  pending: "status-pending",
  approved: "status-approved",
  effective: "status-effective",
  error: "status-error",
  obsolete: "status-obsolete",
  archived: "status-archived",
  superseded: "status-superseded",
};

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
