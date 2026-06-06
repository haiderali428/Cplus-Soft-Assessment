"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setSearchQuery } from "@/store/uiSlice";
import { InputField } from "@/components/ui/InputField";

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  const dispatch = useAppDispatch();
  const value = useAppSelector((s) => s.ui.searchQuery);

  return (
    <div className={cn("relative", className)}>
      <Search
        size={14}
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
        style={{ color: "var(--color-desc)" }}
      />
      <InputField
        name="global-search"
        type="search"
        placeholder="Search tasks…"
        value={value}
        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
        className="w-44 pl-8 text-xs lg:w-56"
        aria-label="Search tasks"
      />
    </div>
  );
}
