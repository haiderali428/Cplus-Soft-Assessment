import { cn } from "@/lib/utils";
import { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";

interface Props extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
}

export function CardHeading({ children, className, style, as: Tag = "h3", ...rest }: Props) {
  return (
    <Tag
      className={cn(
        "font-medium leading-[120%] text-heading",
        "text-[13px] md:text-[14px]",
        className
      )}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
