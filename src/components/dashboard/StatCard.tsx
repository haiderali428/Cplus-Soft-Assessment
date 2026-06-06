import { ElementType } from "react";
import { Card } from "@/components/ui/Card";
import { CardDesc } from "@/components/typography/CardDesc";

interface StatCardProps {
  icon: ElementType;
  label: string;
  value: number;
  accentColor?: string;
  description?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  accentColor = "var(--tag-design)",
  description,
}: StatCardProps) {
  return (
    <Card className="p-5">
      {/* Icon badge */}
      <div
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
        style={{
          background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
        }}
      >
        <Icon size={22} style={{ color: accentColor }} aria-hidden />
      </div>

      {/* Value */}
      <p
        className="text-3xl font-bold leading-none tabular-nums"
        style={{ color: "var(--color-heading)" }}
      >
        {value}
      </p>

      {/* Label */}
      <CardDesc className="mt-1.5">{label}</CardDesc>

      {/* Optional sub-text */}
      {description && (
        <p className="mt-2 text-xs" style={{ color: "var(--color-desc)" }}>
          {description}
        </p>
      )}
    </Card>
  );
}
