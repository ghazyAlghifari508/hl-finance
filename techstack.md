# HL Finance — Tech Stack Recommendation

> **Versi:** 2.0  
> **Tanggal:** 2026-06-20  
> **Status:** Recommended Stack — Updated untuk HL Sales & Receivables Management  
> **Prinsip:** Type-safe, secure, scalable, developer-friendly

---

## 1. Summary Stack

| Layer | Teknologi | Status | Alasan Utama |
|-------|-----------|--------|--------------|
| Framework | **Next.js 15+ App Router** | Recommended | Full-stack React, SSR/Server Components, Vercel-native |
| Language | **TypeScript** | Required | Type safety untuk data finansial |
| Styling | **Tailwind CSS v4** | Required | Design system cepat & konsisten |
| UI Components | **shadcn/ui** | Required | Accessible, composable, modern |
| Database | **PostgreSQL via Supabase** | Required | ACID-compliant, reliable untuk finance |
| ORM | **Prisma** | Recommended | Type-safe database queries & migrations |
| Auth | **Supabase Auth (Email + Password)** | Required | Single-user, minimal setup |
| Validation | **Zod** | Required | Runtime validation + schema inference |
| Forms | **React Hook Form** | Required | Efficient, scalable form state |
| Charts | **Recharts** | Recommended | Dashboard visualization (omzet, laba) |
| PDF Generation | **React-PDF (@react-pdf/renderer)** | Required | Export laporan, recap, piutang ke PDF |
| State | **Zustand** | Optional | Lightweight UI/global state |
| Dates | **date-fns** | Required | Date formatting, period filtering |
| Icons | **Lucide React** | Required | Consistent SVG icon family |
| Testing | **Vitest + Testing Library** | Recommended | Unit/component testing |
| E2E | **Playwright** | Recommended | End-to-end user flow testing |
| Deployment | **Vercel** | Recommended | Best integration for Next.js |

---

## 2. Frontend

### 2.1 Next.js App Router

**Why:**
- Server Components untuk data-heavy dashboard dan recap pages
- Server Actions untuk mutation yang type-safe (create Bon, settle piutang)
- Routing file-based, mudah dipahami
- Built-in optimization untuk font, image, metadata

**Recommended structure:**

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/              # Hanya login, TIDAK ada register
│   ├── (dashboard)/
│   │   ├── dashboard/          # Ringkasan: piutang, omzet lunas, bonus pending
│   │   ├── customers/          # CRUD customers
│   │   │   └── [id]/           # Customer detail: transaksi per bulan, pelunasan
│   │   ├── products/           # CRUD products (LM/BR)
│   │   ├── bons/               # Daftar semua Bon (invoice)
│   │   │   ├── new/            # Form buat Bon baru
│   │   │   └── [id]/           # Bon detail, edit, delete
│   │   ├── recap/              # Recap per customer, per tipe, overall
│   │   └── settings/           # Profile (single user)
│   ├── layout.tsx
│   └── page.tsx                # Landing/login redirect
├── components/
│   ├── ui/                     # shadcn/ui generated components
│   ├── layout/                 # Sidebar, mobile nav, shell
│   ├── dashboard/              # Stat cards, piutang summary
│   ├── customers/              # Customer table, discount editor
│   ├── products/               # Product table/form
│   ├── bons/                   # Bon form, line items, detail view
│   ├── recap/                  # Recap tables, charts, export
│   └── shared/                 # Modals, formatters
├── lib/
│   ├── supabase/
│   ├── prisma.ts
│   ├── validations/            # Zod schemas per domain
│   ├── calculations/           # Cascading discount, omzet, laba, bonus
│   ├── formatters.ts           # Currency IDR, date formatting
│   └── utils.ts
├── server/
│   ├── actions/                # Server Actions per domain
│   └── queries/                # Read-only DB queries
└── types/
    └── index.ts                # Shared types
```

### 2.2 TypeScript Rules

- Strict mode **wajib aktif**
- Jangan gunakan `any` kecuali ada alasan kuat dan diberi komentar
- Gunakan `unknown` untuk data eksternal lalu validate dengan Zod
- Buat type eksplisit untuk domain values:

```ts
type ProductType = "LM" | "BR";
type BonStatus = "piutang" | "lunas";
type CurrencyCode = "IDR";
```

---

## 3. Backend & Database

### 3.1 Supabase PostgreSQL

**Why Supabase:**
- Free tier cukup untuk single-user MVP
- PostgreSQL managed, ACID-compliant
- Auth built-in
- Dashboard database mudah dipantau
- Row Level Security dapat digunakan jika memakai Supabase client langsung

### 3.2 Prisma ORM

**Why Prisma:**
- Type-safe query result
- Migration management jelas
- Prisma Studio untuk inspeksi data lokal
- Relasi model lebih mudah dipahami

**Important decision:**
- Gunakan Prisma untuk query aplikasi utama
- Gunakan Supabase Auth untuk user/session
- Single user: tidak perlu `user_id` di setiap tabel, tapi boleh disimpan untuk future-proofing

### 3.3 Decimal Handling

Untuk uang:
- Jangan gunakan `float`
- Gunakan `Decimal` di Prisma / `numeric(15,2)` di PostgreSQL
- Formatting currency hanya di UI layer

```prisma
amount Decimal @db.Decimal(15, 2)
```

### 3.4 Data Model (Prisma Schema Reference)

```prisma
model Customer {
  id              String   @id @default(uuid())
  name            String
  bonusThreshold  Decimal  @map("bonus_threshold") @db.Decimal(15, 2)
  isDeleted       Boolean  @default(false) @map("is_deleted")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  discounts       CustomerDiscount[]
  bons            Bon[]
  bonusLedger     BonusLedger[]

  @@map("customers")
}

model CustomerDiscount {
  id              String      @id @default(uuid())
  customerId      String      @map("customer_id")
  productType     ProductType @map("product_type")
  stepOrder       Int         @map("step_order")
  discountPercent Decimal     @map("discount_percent") @db.Decimal(5, 2)
  customer        Customer    @relation(fields: [customerId], references: [id])

  @@unique([customerId, productType, stepOrder])
  @@map("customer_discounts")
}

model Product {
  id         String      @id @default(uuid())
  name       String
  hargaModal Decimal     @map("harga_modal") @db.Decimal(15, 2)
  hargaBase  Decimal     @map("harga_base") @db.Decimal(15, 2)
  tipe       ProductType
  isDeleted  Boolean     @default(false) @map("is_deleted")
  createdAt  DateTime    @default(now()) @map("created_at")
  updatedAt  DateTime    @updatedAt @map("updated_at")

  lineItems  BonLineItem[]

  @@map("products")
}

model Bon {
  id              String    @id @default(uuid())
  nomorBon        String    @unique @map("nomor_bon")
  tanggal         DateTime
  customerId      String    @map("customer_id")
  deskripsi       String?
  ongkir          Decimal   @default(0) @db.Decimal(15, 2)
  isBonus         Boolean   @default(false) @map("is_bonus")
  status          BonStatus @default(piutang)
  paymentDate     DateTime? @map("payment_date")
  computedOmzet   Decimal   @default(0) @map("computed_omzet") @db.Decimal(15, 2)
  computedLaba    Decimal   @default(0) @map("computed_laba") @db.Decimal(15, 2)
  totalOwed       Decimal   @default(0) @map("total_owed") @db.Decimal(15, 2)
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  customer        Customer      @relation(fields: [customerId], references: [id])
  lineItems       BonLineItem[]
  bonusLedger     BonusLedger?

  @@map("bons")
}

model BonLineItem {
  id                  String      @id @default(uuid())
  bonId               String      @map("bon_id")
  productId           String      @map("product_id")
  quantity            Int
  productType         ProductType @map("product_type")
  hargaBaseSnapshot   Decimal     @map("harga_base_snapshot") @db.Decimal(15, 2)
  discountedUnitPrice Decimal     @map("discounted_unit_price") @db.Decimal(15, 2)
  lineOmzet           Decimal     @map("line_omzet") @db.Decimal(15, 2)
  lineLaba            Decimal     @map("line_laba") @db.Decimal(15, 2)
  createdAt           DateTime    @default(now()) @map("created_at")

  bon     Bon     @relation(fields: [bonId], references: [id])
  product Product @relation(fields: [productId], references: [id])

  @@map("bon_line_items")
}

model BonusLedger {
  id            String   @id @default(uuid())
  customerId    String   @map("customer_id")
  bonId         String   @unique @map("bon_id")
  bonusCount    Int      @map("bonus_count")
  omzetConsumed Decimal  @map("omzet_consumed") @db.Decimal(15, 2)
  createdAt     DateTime @default(now()) @map("created_at")

  customer Customer @relation(fields: [customerId], references: [id])
  bon      Bon      @relation(fields: [bonId], references: [id])

  @@map("bonus_ledger")
}

enum ProductType {
  LM
  BR
}

enum BonStatus {
  piutang
  lunas
}
```

---

## 4. Authentication

### 4.1 Provider

**Supabase Auth — Email + Password (Single User)**

**Required behavior:**
- Hanya SATU akun yang ada, dibuat manual (tidak ada registrasi publik)
- Login dengan email/password
- Session persist sampai logout/expiry
- Protected routes redirect ke `/login`
- Halaman `/register` **TIDAK ADA**

### 4.2 Auth Flow

```
Unauthenticated User
    ↓
/login (satu-satunya entry point)
    ↓ success
Supabase session cookie
    ↓
/dashboard
```

### 4.3 Security Requirements

- Middleware protect semua route `(dashboard)`
- Jangan expose secret Supabase service role ke client
- Rate limiting di endpoint login
- Gunakan environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=
```

---

## 5. Forms & Validation

### 5.1 Libraries

- **React Hook Form** untuk form state
- **Zod** untuk validation schema
- **@hookform/resolvers** untuk integrasi

### 5.2 Bon Validation Example

```ts
const bonSchema = z.object({
  nomorBon: z.string().min(1, "Nomor Bon wajib diisi"),
  tanggal: z.coerce.date().max(new Date(), "Tanggal tidak boleh di masa depan"),
  customerId: z.string().uuid("Customer wajib dipilih"),
  ongkir: z.coerce.number().min(0, "Ongkir tidak boleh negatif").default(0),
  deskripsi: z.string().max(500).optional(),
  isBonus: z.boolean().default(false),
  lineItems: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.coerce.number().int().min(1, "Qty minimal 1"),
  })).min(1, "Minimal 1 product line"),
});
```

---

## 6. Calculation Engine

### 6.1 Cascading Discount

```ts
function calcDiscountedPrice(basePrice: number, discountSteps: number[]): number {
  return discountSteps.reduce(
    (price, step) => price * (1 - step / 100),
    basePrice
  );
}
```

### 6.2 Omzet & Laba per Bon

```ts
// Line omzet = discounted_unit_price × qty
// Line laba = (discounted_unit_price − harga_modal) × qty
// Transaction omzet = Σ line omzet (ongkir excluded)
// Total owed = omzet + ongkir
// Transaction laba = Σ line laba (ongkir excluded, pass-through)
```

### 6.3 Bonus Accumulator

```ts
// Accumulated omzet = Σ omzet where status = Lunas, per customer
// Bonuses available = floor(accumulator / threshold) − already granted
// Bonus lines: 0 omzet, 0 profit
```

---

## 7. Charts & Reports

### 7.1 Recharts

Use cases:
- Bar chart: omzet per customer per bulan
- Bar chart: omzet LM vs BR
- Progress bar: bonus accumulation per customer

### 7.2 Chart UX Rules

- Tooltip wajib ada
- Legend wajib ada jika >1 series
- Jangan rely pada warna saja; gunakan label/ikon
- Responsive container wajib digunakan

---

## 8. PDF Export

### 8.1 Library

**@react-pdf/renderer** (React-PDF)

**Why:**
- Declarative PDF generation menggunakan React components
- Consistent styling dengan design system
- Support table layout, pagination
- Active community, well-maintained

### 8.2 Use Cases

- Export recap per customer (AC-6.4)
- Export recap per tipe produk (AC-7.8)
- Export overall recap (AC-7.8)
- Export daftar piutang dan daftar transaksi per bulan

---

## 9. UI Component System

### 9.1 shadcn/ui Components

Recommended components:
- Button (pill shape, primary/ghost/destructive variants)
- Card (24px radius, white/parchment variants)
- Input (12.8px radius)
- Label
- Form (React Hook Form integration)
- Select (untuk customer, product dropdown)
- Dialog (untuk modal pelunasan, konfirmasi)
- Dropdown Menu
- Table (untuk daftar Bon, customers, products)
- Badge (status piutang/lunas, bonus flag)
- Progress (bonus accumulation bar)
- Tabs (LM/BR discount tabs)
- Skeleton
- Toast/Sonner
- Separator

### 9.2 Icon Library

Gunakan **Lucide React**.

| Page | Icon |
|------|------|
| Dashboard | `LayoutDashboard` |
| Customers | `Users` |
| Products | `Package` |
| Bons | `ReceiptText` |
| Recap | `BarChart3` |
| Settings | `Settings` |

Rules:
- Jangan gunakan emoji sebagai icon navigasi/action
- Gunakan ukuran konsisten: `h-4 w-4`, `h-5 w-5`, `h-6 w-6`
- Gunakan `aria-hidden="true"` untuk icon dekoratif

---

## 10. State Management

### 10.1 Server State

Default gunakan:
- Server Components untuk initial load
- Server Actions untuk create/update/delete
- `revalidatePath()` setelah mutation

### 10.2 Client/UI State

Gunakan Zustand hanya untuk:
- Sidebar collapsed state
- Active filters yang global
- Theme preference

Jangan gunakan Zustand untuk data yang sebenarnya berasal dari database.

---

## 11. Testing Stack

### 11.1 Unit & Component

- **Vitest**
- **React Testing Library**
- Test validators, formatters, calculation helpers

Minimum tests:
- Cascading discount calculation
- Currency formatting (IDR)
- Omzet/Laba calculation per Bon
- Bonus accumulator logic
- Date range filters

### 11.2 E2E

- **Playwright**

Minimum flows:
1. Login → dashboard
2. Create customer with discount steps
3. Create product (LM or BR)
4. Create Bon with line items → verify calculations
5. Settle single Bon (pelunasan)
6. Settle whole month (bulk pelunasan)
7. Check bonus eligibility notification
8. Create bonus Bon
9. View recap, export PDF
10. Logout → protected routes redirect

---

## 12. Deployment

### 12.1 Vercel

**Why:**
- Native Next.js support
- Environment variables UI
- Preview deployments
- Edge middleware support

### 12.2 Supabase

Use for:
- PostgreSQL database
- Auth
- Optional storage jika future receipts upload needed

---

## 13. Package Install Plan

```bash
# Core (sudah ada sebagian)
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

npm install @supabase/supabase-js @supabase/ssr
npm install prisma @prisma/client
npm install zod react-hook-form @hookform/resolvers
npm install recharts date-fns lucide-react
npm install zustand
npm install next-themes sonner

# NEW — PDF Export
npm install @react-pdf/renderer

# shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input label form select dialog dropdown-menu table badge progress tabs skeleton separator sheet sonner popover

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom playwright @playwright/test
```

---

## 14. Anti-Patterns yang Harus Dihindari

- ❌ Menyimpan amount sebagai float
- ❌ Query data tanpa filter `userId` (jika multi-tenancy ditambah nanti)
- ❌ Hardcode warna langsung di banyak komponen
- ❌ Menggunakan emoji sebagai icon UI utama
- ❌ Membuat custom auth dari nol jika Supabase Auth sudah cukup
- ❌ Menaruh business logic di component UI
- ❌ Menggunakan `any` untuk data transaksi
- ❌ Client-side only dashboard untuk data utama
- ❌ Tidak menampilkan loading/error/empty state
- ❌ Membuat halaman /register (single user app!)
- ❌ Menggunakan income/expense categories (ini bukan personal finance)
- ❌ Menghitung diskon sebagai penjumlahan (harus cascading/sequential)
- ❌ Mengakui omzet/laba sebelum Lunas (cash basis accounting)
- ❌ Menampilkan harga modal ke customer-facing

---

## 15. Skills & MCP yang Direkomendasikan Saat Development

| Kebutuhan | Gunakan |
|----------|---------|
| Next.js implementation | Skill `nextjs-developer` |
| Supabase/Postgres schema & RLS | Skill `supabase-postgres-best-practices` |
| UI/UX design, layout, accessibility | Skill `ui-ux-pro-max` |
| React/Vercel best practices | Skill `vercel-react-best-practices` |
| Manual verification app | Skill `run` atau `verify` |
| Review bug/security | Skill `code-review` dan `security-review` |
| UI component generation | MCP `21st_magic_component_builder` jika membuat komponen baru |
| Logo/brand assets | MCP `logo_search` jika butuh logo eksternal |
| Screenshot to UI/spec | MCP `ui_to_artifact` jika ada desain screenshot |
| Error screenshot diagnosis | MCP `diagnose_error_screenshot` jika ada error screenshot |

---

## 16. Decision Log

| Tanggal | Keputusan | Alasan |
|---------|-----------|--------|
| 2026-06-20 | Supabase untuk PostgreSQL/Auth | Gratis, cepat setup, cocok MVP |
| 2026-06-20 | Email + Password, single user | Sesuai AC — tidak ada registrasi publik |
| 2026-06-20 | Next.js + TypeScript | Full-stack type-safe, produktif |
| 2026-06-20 | shadcn/ui + Tailwind v4 | Accessible component system |
| 2026-06-20 | Soft UI Evolution (Parker style) | Finance app butuh clean, trustworthy, mudah dibaca |
| 2026-06-20 | Prisma sebagai ORM | Type-safe queries, migration management |
| 2026-06-20 | @react-pdf/renderer untuk export PDF | Declarative, React-native, well-maintained |
| 2026-06-20 | Cash basis accounting | Omzet/laba diakui saat Lunas (D3) |
| 2026-06-20 | Cascading discount (bukan penjumlahan) | Sesuai AC-2.9 |
| 2026-06-20 | Soft-delete untuk customer & product | History preserved, hide from new selections (D6) |
