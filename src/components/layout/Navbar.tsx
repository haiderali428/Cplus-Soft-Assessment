"use client";

import { Menu, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { toggleSidebar, openModal } from "@/store/uiSlice";
import { SearchBar } from "./SearchBar";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Navbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  return (
    <header
      className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 lg:px-6"
      style={{
        background: "var(--color-card-bg)",
        borderColor: "var(--color-date-border)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          aria-label="Toggle sidebar"
          onClick={() => dispatch(toggleSidebar())}
          className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/10 lg:hidden"
        >
          <Menu size={20} style={{ color: "var(--color-heading)" }} />
        </button>

        {/* Logo */}
        <span
          className="text-xl font-bold tracking-tight"
          style={{ color: "var(--tag-design)" }}
        >
          TaskFlow
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">
        <SearchBar className="hidden sm:block" />

        <Button
          variant="primary"
          size="sm"
          onClick={() => dispatch(openModal("addTask"))}
          className="flex items-center gap-1.5"
        >
          <Plus size={15} aria-hidden />
          <span className="hidden sm:inline">Add Task</span>
        </Button>

        <ThemeToggle />

        {/* User avatar (compact) */}
        {user && (
          <div
            title={user.name}
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white sm:flex"
            style={{ background: "var(--tag-design)" }}
          >
            {user.name[0].toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}
