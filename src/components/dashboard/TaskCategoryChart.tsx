"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import { Task } from "@/types";
import { Card } from "@/components/ui/Card";
import { CardHeading } from "@/components/typography/CardHeading";
import { CardDesc } from "@/components/typography/CardDesc";

const CATEGORY_CONFIG = [
  { key: "design",      label: "Design",      color: "#5051F9" },
  { key: "planning",    label: "Planning",    color: "#E97342" },
  { key: "research",    label: "Research",    color: "#1EA7FF" },
  { key: "development", label: "Development", color: "#F59E0B" },
] as const;

interface Props {
  tasks: Task[];
}

export function TaskCategoryChart({ tasks }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const textColor  = isDark ? "#9CA3AF" : "#768396";
  const headColor  = isDark ? "#F6F6F6" : "#232360";
  const tooltipBg  = isDark ? "#1E1F25" : "#FFFFFF";
  const borderClr  = isDark ? "rgba(255,255,255,0.07)" : "#E2E2E2";

  const data = useMemo(
    () =>
      CATEGORY_CONFIG.map((c) => ({
        name:  c.label,
        value: tasks.filter((t) => t.category === c.key).length,
        color: c.color,
      })),
    [tasks]
  );

  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  // Center label renderer — viewBox typed as any to satisfy recharts' LabelContentType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCenter = (props: any) => {
    const vb = props?.viewBox as { cx: number; cy: number } | undefined;
    if (!vb) return null;
    const { cx, cy } = vb;
    return (
      <g>
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={24}
          fontWeight={700}
          fill={headColor}
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fill={textColor}
        >
          tasks
        </text>
      </g>
    );
  };

  return (
    <Card className="p-5">
      <CardHeading className="mb-1">Tasks by Category</CardHeading>
      <CardDesc className="mb-5">Breakdown across all work types</CardDesc>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="52%"
            outerRadius="72%"
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
            <Label content={renderCenter} position="center" />
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${borderClr}`,
              borderRadius: "8px",
              color: textColor,
              fontSize: "12px",
              padding: "8px 12px",
            }}
            formatter={(value, name) => [
              `${value ?? 0} task${value !== 1 ? "s" : ""}`,
              String(name),
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom legend grid */}
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
        {CATEGORY_CONFIG.map((c) => {
          const count = data.find((d) => d.name === c.label)?.value ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={c.key} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: c.color }}
              />
              <span className="min-w-0 flex-1 truncate text-[11px]" style={{ color: textColor }}>
                {c.label}
              </span>
              <span className="shrink-0 text-[11px] font-semibold" style={{ color: headColor }}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
