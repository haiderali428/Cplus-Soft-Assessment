import { cn } from "@/lib/utils";
import { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";

interface Props extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
}

export function Paragraph({ children, className, style, as: Tag = "p", ...rest }: Props) {
  return (
    <Tag
      className={cn(
        "text-[20px] font-normal leading-[36px] text-desc",
        className
      )}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
