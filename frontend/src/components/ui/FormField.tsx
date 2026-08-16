import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ className, label, error, type, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-[8px] w-full">
        <label className="text-label-caps text-on-surface-variant">
          {label}
        </label>
        <input
          type={type}
          className={cn(
            "h-[36px] px-[12px] bg-surface-container-lowest border border-outline-variant rounded-[4px] text-body-sm text-on-surface placeholder:text-outline transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-error focus:border-error focus:ring-error",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <span className="text-body-sm text-error">{error}</span>}
      </div>
    );
  }
);
FormField.displayName = "FormField";

export { FormField };
