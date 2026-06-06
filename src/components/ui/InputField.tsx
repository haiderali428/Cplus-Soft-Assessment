import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium"
            style={{ color: "var(--color-heading)" }}
          >
            {label}
            {props.required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors",
            "bg-[var(--color-card-bg)] text-[var(--color-heading)] placeholder:text-[var(--color-desc)]",
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-500/30"
              : "border-[var(--color-date-border)] focus:border-[var(--tag-design)] focus:ring-2 focus:ring-[var(--tag-design)]/20",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-red-500"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";
