import { cn } from "@/lib/utils";
import { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";

interface Props extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
}

export function MainHeading({ children, className, style, as: Tag = "h1", ...rest }: Props) {
  return (
    <Tag
      className={cn(
        "font-semibold text-heading",
        "text-[32px] leading-[130%]",
        "md:text-[40px] md:leading-[130%]",
        "lg:text-[64px] lg:leading-[120%]",
        className
      )}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
