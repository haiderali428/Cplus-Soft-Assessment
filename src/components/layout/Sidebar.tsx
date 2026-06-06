"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Kanban, Layers, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setSidebarOpen } from "@/store/uiSlice";
import { logout } from "@/store/authSlice";

const NAV_ITEMS = [
  { href: "/dashboard",          icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/board",    icon: Kanban,          label: "Board"     },
  { href: "/dashboard/projects", icon: Layers,          label: "Projects"  },
] as const;

export function Sidebar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);
  const user = useAppSelector((s) => s.auth.user);

  const closeDrawer = () => dispatch(setSidebarOpen(false));

  const handleLogout = () => {
    toast.success("Signed out successfully");
    dispatch(logout());
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        // Base layout
        "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r",
        // Desktop: always visible, static in flow
        "lg:static lg:z-auto lg:translate-x-0",
        // Mobile: animated drawer
        "transition-transform duration-200 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
      style={{
        background: "var(--color-card-bg)",
        borderColor: "var(--color-date-border)",
      }}
    >
      {/* Brand─────────────────────────────────────────────────────── */}
      <div
        className="flex h-16 shrink-0 items-center border-b px-5"
        style={{ borderColor: "var(--color-date-border)" }}
      >
        <span
          className="text-xl font-bold tracking-tight"
          style={{ color: "var(--tag-design)" }}
        >
          TaskFlow
        </span>
      </div>

      {/* User info──────────────────────────────────────────────────── */}
      {user && (
        <div
          className="flex items-center gap-3 border-b px-4 py-3"
          style={{ borderColor: "var(--color-date-border)" }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ background: "var(--tag-design)" }}
          >
            {user.name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p
              className="truncate text-xs font-semibold"
              style={{ color: "var(--color-heading)" }}
            >
              {user.name}
            </p>
            <p className="truncate text-[11px]" style={{ color: "var(--color-desc)" }}>
              {user.role}
            </p>
          </div>
        </div>
      )}

      {/* Navigation─────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        <p
          className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--color-desc)" }}
        >
          Menu
        </p>

        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={closeDrawer}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "text-white"
                  : "hover:bg-[var(--color-board-bg)]"
              )}
              style={
                active
                  ? { background: "var(--tag-design)" }
                  : { color: "var(--color-desc)" }
              }
            >
              <Icon size={17} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout pinned to bottom────────────────────────────────────── */}
      <div
        className="shrink-0 border-t p-3"
        style={{ borderColor: "var(--color-date-border)" }}
      >
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          style={{ color: "var(--color-desc)" }}
        >
          <LogOut size={17} aria-hidden />
          Logout
        </button>
      </div>
    </aside>
  );
}
