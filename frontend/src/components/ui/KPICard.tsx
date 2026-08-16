import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  icon: LucideIcon;
  variant?: "default" | "effective" | "pending" | "error";
}

export function KPICard({
  title,
  value,
  trend,
  trendDirection = "neutral",
  icon: Icon,
  variant = "default",
  className,
  ...props
}: KPICardProps) {
  const isError = variant === "error";

  return (
    <div
      className={cn(
        "p-[16px] flex flex-col justify-between h-[120px]",
        isError ? "bg-error-container border border-error" : "card-level-1",
        variant === "effective" && "border-t-2 border-t-[#0D9488]",
        variant === "pending" && "border-t-2 border-t-[#D97706]",
        className
      )}
      {...props}
    >
      <div className="flex justify-between items-start">
        <span
          className={cn(
            "text-label-caps",
            isError ? "text-on-error-container" : "text-on-surface-variant"
          )}
        >
          {title}
        </span>
        <Icon
          size={20}
          className={cn(
            isError && "text-error",
            variant === "effective" && "text-[#0D9488]",
            variant === "pending" && "text-[#D97706]",
            variant === "default" && "text-outline"
          )}
        />
      </div>
      <div className="flex items-baseline gap-[8px]">
        <span
          className={cn(
            "text-display-lg",
            isError ? "text-on-error-container" : "text-on-surface"
          )}
        >
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "text-body-sm",
              isError
                ? "text-on-error-container opacity-80"
                : trendDirection === "up"
                ? "text-primary"
                : trendDirection === "down"
                ? "text-error"
                : "text-outline-variant"
            )}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
