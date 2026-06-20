"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ReceiptText,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "Bon", href: "/bons", icon: ReceiptText },
    { name: "Customer", href: "/customers", icon: Users },
    { name: "Recap", href: "/recap", icon: BarChart3 },
    { name: "Lainnya", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-paper-white border-t border-sand pb-safe z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 relative",
                isActive ? "text-electric-blue" : "text-steel hover:text-ink-black"
              )}
            >
              {isActive && (
                <div className="absolute top-0 w-12 h-1 bg-electric-blue rounded-b-[4px]" />
              )}
              <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
              <span className="text-[11px] font-medium tracking-[-0.14px]">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
