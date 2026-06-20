"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  ReceiptText,
  BarChart3,
  Settings,
  LogOut,
  Wallet
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Products", href: "/products", icon: Package },
    { name: "Bons", href: "/bons", icon: ReceiptText },
    { name: "Recap", href: "/recap", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 border-r border-sand bg-paper-white z-10">
      <div className="h-20 flex items-center px-6 border-b border-sand">
        <Link href="/" className="flex items-center gap-3 text-ink-black group">
          <div className="bg-electric-blue text-paper-white p-2 rounded-[12.8px] group-hover:bg-electric-blue/90 transition-colors">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="font-heading font-semibold text-[20px] tracking-[-0.46px]">HL Finance</span>
        </Link>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-[9999px] text-[16px] font-medium transition-colors",
                isActive
                  ? "bg-electric-blue text-paper-white"
                  : "text-steel hover:text-ink-black hover:bg-parchment"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-6 border-t border-sand">
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-[9999px] border border-sand bg-transparent text-ink-black hover:bg-parchment transition-all active:scale-[0.98] font-medium text-[16px]"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}
