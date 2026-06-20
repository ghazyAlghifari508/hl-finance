import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { createClient } from "@/lib/supabase/server";
import { Store } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined)?.trim() ||
    user?.email ||
    "HL";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-paper-white">
      <Sidebar />

      <div className="md:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-sand bg-paper-white/90 px-6 backdrop-blur-md">
          <div className="font-heading font-semibold text-[20px] tracking-[-0.46px] md:hidden text-ink-black flex items-center gap-2">
            <div className="bg-electric-blue text-paper-white p-1.5 rounded-[8px]">
              <Store className="h-4 w-4" />
            </div>
            HL Sales
          </div>

          <div className="hidden md:block" />

          <div className="flex items-center gap-3">
            <span className="text-[16px] font-medium text-ink-black hidden sm:inline-block">
              {displayName}
            </span>
            <div className="h-10 w-10 rounded-full bg-parchment border border-sand text-ink-black flex items-center justify-center font-semibold text-[16px]">
              {initial}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 pb-24 md:pb-12 max-w-[1200px] mx-auto w-full">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
