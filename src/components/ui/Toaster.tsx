"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      richColors
      closeButton
      duration={3500}
      theme={resolvedTheme as "light" | "dark"}
      toastOptions={{
        classNames: {
          toast: "font-sans text-sm",
        },
      }}
    />
  );
}
