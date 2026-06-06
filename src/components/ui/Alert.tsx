import { XCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertType = "error" | "success" | "warning" | "info";

const styles: Record<AlertType, { wrapper: string; icon: React.ElementType }> = {
  error: {
    wrapper:
      "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400",
    icon: XCircle,
  },
  success: {
    wrapper:
      "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400",
    icon: CheckCircle,
  },
  warning: {
    wrapper:
      "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400",
    icon: AlertTriangle,
  },
  info: {
    wrapper:
      "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400",
    icon: Info,
  },
};

interface AlertProps {
  type?: AlertType;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({ type = "error", message, onDismiss, className }: AlertProps) {
  const { wrapper, icon: Icon } = styles[type];
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-md border px-4 py-3 text-sm font-medium",
        wrapper,
        className
      )}
    >
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 opacity-70 hover:opacity-100"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
