"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const items = navItems.slice(0, 6);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-6 border-t bg-card lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn("flex flex-col items-center gap-1 px-1 py-2 text-[10px] text-muted-foreground", active && "text-primary")}
          >
            <Icon className="h-4 w-4" />
            <span className="truncate">{item.label.split(" ")[0]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
