import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wallet,
  ArrowRight,
  ShieldCheck,
  ChartColumn,
  ReceiptText,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper-white text-ink-black">
      {/* Announcement */}
      <div className="h-11 bg-electric-blue text-paper-white flex items-center justify-center px-6 text-[14px] font-medium">
        Frontend prototype is live — explore dashboard, budgets, reports, and transactions.
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-paper-white/90 backdrop-blur-md border-b border-sand">
        <div className="mx-auto max-w-[1200px] h-20 px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-electric-blue text-paper-white p-2 rounded-[12.8px]">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="font-heading font-semibold text-[20px] tracking-[-0.46px]">HL Finance</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[16px] font-medium text-steel">
            <Link href="/dashboard" className="hover:text-ink-black">Dashboard</Link>
            <Link href="/customers" className="hover:text-ink-black">Customers</Link>
            <Link href="/bons" className="hover:text-ink-black">Bons</Link>
            <Link href="/recap" className="hover:text-ink-black">Recap</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="primary" size="sm">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-6 py-20 md:py-24 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-[12.8px] bg-ink-black px-3 py-2 text-[14px] font-medium text-paper-white mb-8">
            <Sparkles className="h-4 w-4" />
            Join modern finance control
          </div>

          <h1 className="text-[48px] md:text-[64px] leading-[1.05] tracking-[-0.08em] font-semibold max-w-3xl">
            Finance clarity that <span className="font-serif italic tracking-[-0.04em]">powers</span> your growth.
          </h1>

          <p className="mt-6 text-[18px] leading-[1.43] tracking-[-0.36px] text-steel max-w-2xl">
            HL Finance membantu Anda membaca arus kas, memahami budget, dan mencatat transaksi tanpa dashboard yang berisik.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl">
            <div className="flex-1">
              <input
                type="email"
                placeholder="Enter your email"
                className="h-14 w-full rounded-[12.8px] border border-fog bg-paper-white px-4 text-[16px] outline-none focus:border-electric-blue"
              />
            </div>
            <Link href="/dashboard">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Open Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Product Visual */}
        <div className="rounded-[32px] bg-electric-blue/15 p-6 md:p-10">
          <div className="aspect-[1.586/1] rounded-[24px] bg-ink-black p-6 text-paper-white relative overflow-hidden shadow-md">
            <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_20%_20%,#5196fe_0%,transparent_35%),radial-gradient(circle_at_85%_30%,#f9754e_0%,transparent_30%),radial-gradient(circle_at_60%_90%,#ff7ab6_0%,transparent_34%)]" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-paper-white/80">HL Finance Card</span>
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[14px] text-paper-white/70 mb-2">Monthly Balance</p>
                <p className="text-[40px] leading-none font-bold tracking-[-0.06em]">Rp14.450.000</p>
              </div>
              <div className="flex justify-between text-[14px] text-paper-white/80">
                <span>Income Rp18.5M</span>
                <span>Expense Rp4.05M</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-[1200px] px-6 pb-20">
        <div className="grid gap-0 md:grid-cols-4 rounded-[24px] bg-parchment border border-sand overflow-hidden">
          {[
            ["Rp18.5M", "Pemasukan bulan ini"],
            ["Rp4.05M", "Pengeluaran tercatat"],
            ["5", "Budget aktif"],
            ["8", "Kategori keuangan"],
          ].map(([value, label], index) => (
            <div key={label} className={`p-8 text-center ${index !== 0 ? "md:border-l border-sand" : ""}`}>
              <p className="text-[40px] md:text-[48px] font-bold tracking-[-0.06em] text-ink-black">{value}</p>
              <p className="mt-2 text-[14px] text-steel">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature section */}
      <section className="bg-electric-blue py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="max-w-2xl mb-12">
            <h2 className="text-[40px] md:text-[48px] leading-[1.13] tracking-[-0.06em] font-semibold text-paper-white">
              A financial command center that stays readable.
            </h2>
            <p className="mt-4 text-paper-white/80 text-[18px] leading-[1.43]">
              Struktur visual dibangun untuk membantu Anda mengambil keputusan, bukan sekadar menampilkan angka.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { Icon: ShieldCheck, title: "Terpercaya", text: "Warna dan hierarchy dipakai secara fungsional agar data finance terasa stabil dan jelas." },
              { Icon: ReceiptText, title: "Pencatatan Cepat", text: "Transaksi dapat dicatat lewat alur sederhana dengan kategori, nominal, tanggal, dan catatan." },
              { Icon: ChartColumn, title: "Insight Mudah", text: "Budget, laporan, dan arus kas ditampilkan dengan komposisi yang mudah dipindai." },
            ].map(({ Icon, title, text }) => (
              <Card key={title} className="border-none bg-paper-white">
                <CardContent className="space-y-4">
                  <div className="h-12 w-12 rounded-[12.8px] bg-electric-blue flex items-center justify-center text-paper-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-[20px] font-semibold tracking-[-0.46px]">{title}</h3>
                  <p className="text-[16px] leading-[1.5] text-steel">{text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
