import { LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-board-bg)]">
      {/* Left brand panel (lg+)───────────────────────────────────── */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-[45%] xl:w-1/2 flex-col items-center justify-center bg-[var(--tag-design)] p-12">
        {/* Decorative circles */}
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute right-8 bottom-24 h-40 w-40 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col items-center text-center text-white">
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <LayoutDashboard size={32} />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">TaskFlow</h1>
          <p className="max-w-xs text-lg leading-relaxed text-white/75">
            Manage projects and tasks with clarity, structure, and confidence.
          </p>

          {/* Feature list */}
          <ul className="mt-10 space-y-3 text-sm text-white/70">
            {[
              "Kanban boards with drag & drop",
              "Real-time project progress",
              "Team collaboration built-in",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form panel─────────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
