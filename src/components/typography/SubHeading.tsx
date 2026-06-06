import { cn } from "@/lib/utils";
import { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";

interface Props extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
}

export function SubHeading({ children, className, style, as: Tag = "h2", ...rest }: Props) {
  return (
    <Tag
      className={cn(
        "font-semibold leading-[130%] text-heading",
        "text-[32px]",
        "lg:text-[48px]",
        className
      )}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
