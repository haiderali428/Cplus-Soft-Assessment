"use client";

import { ThemeProvider } from "next-themes";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store";
import { AuthBootstrap } from "./AuthBootstrap";
import { Toaster } from "@/components/ui/Toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthBootstrap />
        <Toaster />
        {children}
      </ThemeProvider>
    </ReduxProvider>
  );
}
