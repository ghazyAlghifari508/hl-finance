import { Wallet } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-white px-6">
      <div className="w-full max-w-[440px]">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-electric-blue text-paper-white p-3 rounded-[16px] mb-6 shadow-sm">
            <Wallet className="h-8 w-8" />
          </div>
          <h1 className="text-[32px] leading-[1.16] tracking-[-0.96px] font-heading font-semibold text-ink-black text-center mb-3">
            Welcome to HL Finance
          </h1>
          <p className="text-steel text-[16px] leading-[1.5] tracking-[-0.32px] text-center">
            Kelola keuangan bisnis dan personal Anda dengan cara yang lebih rapi.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
