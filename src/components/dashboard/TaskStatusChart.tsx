"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Task } from "@/types";
import { Card } from "@/components/ui/Card";
import { CardHeading } from "@/components/typography/CardHeading";
import { CardDesc } from "@/components/typography/CardDesc";

const STATUS_CONFIG = [
  { key: "backlog",    label: "Backlog",      color: "#768396" },
  { key: "todo",       label: "To Do",        color: "#1EA7FF" },
  { key: "inprogress", label: "In Progress",  color: "#F59E0B" },
  { key: "review_qa",  label: "Review / QA",  color: "#5051F9" },
  { key: "rejection",  label: "Rejected",     color: "#EF4444" },
] as const;

interface Props {
  tasks: Task[];
}

export function TaskStatusChart({ tasks }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const textColor  = isDark ? "#9CA3AF" : "#768396";
  const gridColor  = isDark ? "rgba(255,255,255,0.07)" : "#E2E2E2";
  const tooltipBg  = isDark ? "#1E1F25" : "#FFFFFF";
  const cursorFill = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";

  const data = useMemo(
    () =>
      STATUS_CONFIG.map((s) => ({
        name: s.label,
        count: tasks.filter((t) => t.status === s.key).length,
        fill: s.color,
      })),
    [tasks]
  );

  return (
    <Card className="p-5">
      <CardHeading className="mb-1">Tasks by Status</CardHeading>
      <CardDesc className="mb-5">Distribution across all pipeline stages</CardDesc>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          barCategoryGap="38%"
          margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={gridColor}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: textColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: textColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={24}
          />
          <Tooltip
            cursor={{ fill: cursorFill }}
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${gridColor}`,
              borderRadius: "8px",
              color: textColor,
              fontSize: "12px",
              padding: "8px 12px",
            }}
            formatter={(value) => [
              `${value ?? 0} task${value !== 1 ? "s" : ""}`,
              "Count",
            ]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={52}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend dots */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
        {STATUS_CONFIG.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: s.color }}
            />
            <span className="text-[11px]" style={{ color: textColor }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
