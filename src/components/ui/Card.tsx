import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function Card({ children, className, as: Tag = "div" }: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-xl bg-[var(--color-card-bg)] p-4 shadow-sm",
        className
      )}
    >
      {children}
    </Tag>
  );
}
