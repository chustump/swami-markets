"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Phone,
  ListTree,
  Compass,
  ShieldAlert,
  BookOpen,
  ClipboardList,
  Settings2,
  SpellCheck,
} from "lucide-react";
import { cn } from "./ui";
import { useSales } from "@/lib/sales/store";

const NAV = [
  { to: "/", label: "Board", short: "Board", icon: LayoutGrid },
  { to: "/call", label: "Live", short: "Live", icon: Phone },
  { to: "/tree", label: "Tree", short: "Tree", icon: ListTree },
  { to: "/discovery", label: "Discovery", short: "Disc", icon: Compass },
  { to: "/objections", label: "Objections", short: "Objs", icon: ShieldAlert },
  { to: "/plays", label: "Plays", short: "Plays", icon: BookOpen },
  { to: "/tracker", label: "Tracker", short: "Log", icon: ClipboardList },
  { to: "/language", label: "Language", short: "Lang", icon: SpellCheck },
  { to: "/deal", label: "Deal", short: "Deal", icon: Settings2 },
];

function isActive(pathname, to) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AppShell({ children }) {
  const pathname = usePathname() || "/";
  const { calls, hydrated } = useSales();
  const live = hydrated && calls.some((c) => c.status === "live");

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="block h-2 w-2 rounded-full bg-line" />
            <span className="font-display text-lg tracking-tight">Synadia Sales OS</span>
          </Link>
          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV.map((item) => {
              const active = isActive(pathname, item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={cn(
                    "relative flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm transition-colors duration-150",
                    active ? "bg-raised text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {item.label}
                  {item.to === "/call" && live ? <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-line" /> : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 md:pb-12 md:pt-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 backdrop-blur-sm md:hidden">
        <div className="flex items-stretch overflow-x-auto px-1 pb-[env(safe-area-inset-bottom)]">
          {NAV.map((item) => {
            const active = isActive(pathname, item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  "flex min-h-14 min-w-14 flex-1 flex-col items-center justify-center gap-1 px-2 text-[10px] tracking-wide",
                  active ? "text-fg" : "text-muted",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {item.short}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
