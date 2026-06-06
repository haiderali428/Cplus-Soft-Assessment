import { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md", className)}
      style={{
        background: "color-mix(in srgb, var(--color-desc) 13%, transparent)",
        ...style,
      }}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl p-5 bg-card-bg">
      <Skeleton className="mb-4 h-11 w-11 rounded-xl" />
      <Skeleton className="h-8 w-14" />
      <Skeleton className="mt-2 h-3 w-28" />
    </div>
  );
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="rounded-xl p-5 bg-card-bg">
      <Skeleton className="mb-5 h-4 w-36" />
      <Skeleton className="w-full" style={{ height }} />
    </div>
  );
}
