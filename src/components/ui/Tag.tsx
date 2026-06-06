import { Category } from "@/types";
import { cn } from "@/lib/utils";

const tagColors: Record<Category, string> = {
  design: "var(--tag-design)",
  planning: "var(--tag-planning)",
  research: "var(--tag-research)",
  development: "var(--tag-development)",
};

interface TagProps {
  category: Category;
  className?: string;
}

export function Tag({ category, className }: TagProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded text-xs font-medium text-white", className)}
      style={{
        backgroundColor: tagColors[category],
        padding: "4px 8px",
        borderRadius: "4px",
      }}
    >
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
}
