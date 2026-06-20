# HL — Sales & Receivables Management

Aplikasi internal single-user untuk mengelola **Customers, Products, Transaksi (Bon),
piutang, bonus, dan laporan (recap)** untuk bisnis HL.

> Mata uang: IDR (Rp), tanpa pajak/PPN. Akuntansi: **cash basis** — omzet, laba, dan
> kelayakan bonus diakui hanya saat transaksi **Lunas**.

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **Supabase** (PostgreSQL + Auth)
- **Prisma** ORM
- **Zod** validation
- **@react-pdf/renderer** untuk export PDF
- Deploy: **Vercel**

## Getting Started

```bash
npm install
```

Salin variabel environment dan isi kredensial:

```bash
# .env  (Prisma + database)
DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true"   # pooled
DIRECT_URL="postgresql://...:5432/postgres"                    # direct (migrasi)

# .env.local  (Supabase client)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Generate Prisma client lalu jalankan dev server:

```bash
npx prisma generate
npm run dev
```

## Dokumentasi (Source of Truth)

| File | Isi |
| --- | --- |
| `acceptance-criteria-HL-app.md` | Business rules — sumber kebenaran utama |
| `PRD.md` | Product requirements |
| `techstack.md` | Keputusan teknologi & skema data |
| `DESIGN.md` | Design system & UI guidelines |

## Status

Dalam transformasi bertahap dari prototype menjadi aplikasi penuh. Lihat
`MASTER-TRANSFORMATION-PROMPT.md` untuk roadmap 12 fase.
