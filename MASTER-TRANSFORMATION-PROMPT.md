# HL Finance — Master Transformation Prompt

> **Versi:** 1.0
> **Tanggal:** 2026-06-20
> **Tujuan:** Transformasi total dari personal finance tracker menjadi HL Sales & Receivables Management App

---

## ⚠️ PENTING: Baca Dokumen Ini Dulu

Sebelum eksekusi apapun, WAJIB baca file-file ini secara berurutan:

1. `acceptance-criteria-HL-app.md` — Source of Truth untuk SEMUA business rules
2. `PRD.md` — Ringkasan produk dan functional requirements
3. `techstack.md` — Keputusan teknologi dan package install plan
4. `DESIGN.md` — Design system dan UI guidelines
5. Dokumen ini — Step-by-step plan transformasi

---

## KONTENKS: Apa yang Salah

Aplikasi saat ini adalah **personal finance tracker** dengan konsep:
- Income / Expense transactions
- Budget per category
- Categories (income/expense)
- Dashboard: total saldo, pemasukan, pengeluaran

**Seharusnya** aplikasi ini adalah **business sales & receivables management** dengan konsep:
- Customers (dengan diskon bertingkat LM/BR)
- Products (LM dan BR, harga modal + harga base)
- Bon (invoice dengan line items, ongkir, status piutang/lunas)
- Bonus (akumulasi omzet, threshold, bonus products gratis)
- Recap/Reporting (per customer, per tipe, overall)
- PDF Export

---

## PHASE 1: CLEANUP — Hapus Semua yang Tidak Relevan

### 1.1 Hapus File/Rute yang Tidak Dibutuhkan

Hapus file-file berikut karena tidak sesuai dengan acceptance criteria:

```
# Route pages yang SALAH
src/app/(dashboard)/budgets/           # TIDAK ADA konsep budget
src/app/(dashboard)/categories/        # TIDAK ADA income/expense categories
src/app/(auth)/register/               # TIDAK ADA registrasi publik (single user)

# Server Actions yang SALAH
src/app/actions/budgets.ts             # TIDAK ADA budget logic
src/app/actions/categories.ts          # TIDAK ADA category CRUD

# Dummy data
src/lib/dummy.ts                       # HAPUS semua dummy data income/expense/budget
```

### 1.2 Hapus Tabel/Query yang Tidak Relevan

Tabel Supabase berikut harus di-DROP atau diganti:
- `hl_categories` — ganti dengan `customers`, `customer_discounts`, `products`
- `hl_budgets` — hapus
- `hl_transactions` — ganti dengan `bons` + `bon_line_items` + `bonus_ledger`

---

## PHASE 2: DATABASE SCHEMA

### 2.1 Setup Prisma

Jika belum ada:
```bash
npx prisma init
```

### 2.2 Buat Prisma Schema

Lihat `techstack.md` section 3.4 untuk schema lengkap. Tabel yang harus dibuat:

1. **Customer** — nama, bonus_threshold, is_deleted
2. **CustomerDiscount** — customer_id, product_type (LM/BR), step_order, discount_percent
3. **Product** — nama, harga_modal, harga_base, tipe (LM/BR), is_deleted
4. **Bon** — nomor_bon, tanggal, customer_id, ongkir, is_bonus, status (piutang/lunas), payment_date, computed fields
5. **BonLineItem** — bon_id, product_id, quantity, product_type, snapshots, line_omzet, line_laba
6. **BonusLedger** — customer_id, bon_id, bonus_count, omzet_consumed

### 2.3 Run Migration

```bash
npx prisma migrate dev --name init_hl_schema
npx prisma generate
```

---

## PHASE 3: CALCULATION ENGINE

### 3.1 Buat `src/lib/calculations/`

File ini berisi SEMUA business logic. Pisahkan dari komponen UI dan server actions.

**File: `src/lib/calculations/discount.ts`**
```ts
// Cascading discount: B × (1 - d1/100) × (1 - d2/100) × ... × (1 - dn/100)
export function calcDiscountedPrice(basePrice: number, discountSteps: number[]): number { ... }
export function calcEffectiveDiscountPercent(discountSteps: number[]): number { ... }
```

**File: `src/lib/calculations/bon.ts`**
```ts
export function calcLineOmzet(discountedUnitPrice: number, quantity: number): number { ... }
export function calcLineLaba(discountedUnitPrice: number, hargaModal: number, quantity: number): number { ... }
export function calcBonTotals(lines: BonLineCalc[], ongkir: number) { ... }
// Returns: { omzet, laba, totalOwed }
```

**File: `src/lib/calculations/bonus.ts`**
```ts
export function calcBonusAvailable(accumulatedOmzet: number, threshold: number, alreadyGranted: number): number { ... }
// floor(accumulatedOmzet / threshold) - alreadyGranted
```

### 3.2 Unit Test Calculation Engine

WAJIB test sebelum lanjut ke UI:
- Cascading discount: `[20, 20, 10]` pada base 100 → 57.6 (bukan 50)
- Line omzet dan laba calculation
- Bonus accumulator: 25jt / 10jt threshold → 2 bonus available

---

## PHASE 4: AUTH FIX

### 4.1 Hapus Register Page

Hapus `src/app/(auth)/register/page.tsx` dan semua logic `signUp` di `src/app/actions/auth.ts`.

### 4.2 Hapus Register Link

Di landing page (`src/app/page.tsx`), hapus tombol "Get Started" yang mengarah ke `/register`. Ganti dengan tombol "Login" saja.

### 4.3 Simplify Auth Actions

`src/app/actions/auth.ts` hanya perlu:
- `signIn` — login email + password
- `signOut` — logout

---

## PHASE 5: NAVIGATION RESTRUCTURE

### 5.1 Update Sidebar (`src/components/layout/Sidebar.tsx`)

Nav items baru:
```ts
const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Products", href: "/products", icon: Package },
  { name: "Bons", href: "/bons", icon: ReceiptText },
  { name: "Recap", href: "/recap", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];
```

### 5.2 Update BottomNav (`src/components/layout/BottomNav.tsx`)

Bottom nav (max 5 items):
```ts
const navItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Bon", href: "/bons", icon: ReceiptText },
  { name: "Customer", href: "/customers", icon: Users },
  { name: "Recap", href: "/recap", icon: BarChart3 },
  { name: "Lainnya", href: "/settings", icon: Settings },
];
```

---

## PHASE 6: BUAT PAGE BARU (CRUD)

### 6.1 Customers Page (`/customers`)

**Route:** `src/app/(dashboard)/customers/page.tsx`
**Components:** `src/components/customers/`

Fitur:
- Tabel daftar customer (nama, diskon LM, diskon BR, bonus threshold)
- Create/Edit customer dialog:
  - Nama (required)
  - Tab LM dan BR, masing-masing punya ordered list discount steps
  - Add/edit/delete discount step per tab
  - Bonus threshold (Rupiah amount)
- Soft-delete (hide dari dropdown, history preserved)
- Validation: discount percent 0-100

### 6.2 Products Page (`/products`)

**Route:** `src/app/(dashboard)/products/page.tsx`
**Components:** `src/components/products/`

Fitur:
- Tabel daftar product (nama, tipe LM/BR, harga base, harga modal*)
  - *harga_modal hanya terlihat di detail/edit, TIDAK di customer-facing
- Create/Edit product:
  - Nama
  - Tipe (LM atau BR, dropdown)
  - Harga Modal (≥ 0)
  - Harga Base / Jual (≥ 0)
- Soft-delete

### 6.3 Bons Page (`/bons`)

**Route:** `src/app/(dashboard)/bons/page.tsx`
**Sub-routes:** `/bons/new`, `/bons/[id]`

Fitur list:
- Tabel semua Bon: nomor_bon, tanggal, customer, status (badge piutang/lunas), total owed, bonus flag
- Filter: status, customer, tanggal
- Bonus badge untuk bonus transactions

Fitur create (`/bons/new`):
- Tanggal (default today, editable)
- Nomor Bon (required, unique)
- Pilih customer dari dropdown
- Product line items:
  - Pilih produk dari catalog
  - Qty ≥ 1
  - Auto-show: tipe, harga diskon (computed dari customer × tipe)
  - Bisa add multiple lines
- Ongkir (≥ 0)
- Deskripsi (optional)
- Toggle Bonus (jika customer punya bonus available)
- Preview calculation: per-line omzet, total omzet, ongkir, total owed, per-line laba
- Submit → status default Piutang

Fitur detail (`/bons/[id]`):
- Semua field + line items detail
- Status badge
- Payment date (jika Lunas)
- Tombol "Lunas" → modal payment date
- Edit/Delete buttons

### 6.4 Customer Detail Page (`/customers/[id]`)

**Route:** `src/app/(dashboard)/customers/[id]/page.tsx`

Fitur:
- Header: nama customer, bonus status
- Month/Year selector
- Daftar transaksi bulan terpilih:
  - Bon list: nomor, tanggal, status, amount
  - Total Piutang (sum of piutang)
  - Total sudah dibayar (sum of lunas)
  - Total Omzet (Lunas only): kolom BR, kolom LM, kolom Total
  - Total Laba HL (Lunas only)
- Tombol "Sudah Lunas" (bulk settle month) → modal payment date
- Tombol "Lunas" per Bon → modal payment date
- Download PDF: daftar piutang, daftar transaksi

### 6.5 Recap Page (`/recap`)

**Route:** `src/app/(dashboard)/recap/page.tsx`

Tiga sub-view (tabs):
1. **Per Customer** — pilih customer, filter bulan/tahun
2. **Per Tipe Produk** — LM vs BR breakdown
3. **Overall** — semua customer combined

Setiap recap menampilkan:
- Total Omzet (Lunas)
- Total Laba HL (Lunas)
- Total Piutang (outstanding)
- Total sudah dibayar
- Breakdown LM vs BR (where relevant)
- Bonus transactions EXCLUDED dari omzet/profit (reported separately)
- Export PDF button

---

## PHASE 7: DASHBOARD REDESIGN

### 7.1 Dashboard Baru (`/dashboard`)

Stat cards:
- **Total Piutang** — outstanding receivables
- **Total Omzet (Lunas)** — recognized revenue this month
- **Total Laba HL (Lunas)** — recognized profit this month
- **Bonus Pending** — customers with available bonuses

Recent activity:
- 5 Bon terbaru (bukan "transaksi" income/expense)
- Bonus eligibility notifications

Quick actions:
- "Buat Bon Baru" button

---

## PHASE 8: PDF EXPORT

### 8.1 Install Library

```bash
npm install @react-pdf/renderer
```

### 8.2 Buat PDF Templates

`src/lib/pdf/`:
- `CustomerRecapPDF.tsx` — recap per customer
- `OverallRecapPDF.tsx` — recap overall
- `ProductTypeRecapPDF.tsx` — recap per LM/BR
- `BonListPDF.tsx` — daftar Bon per bulan (untuk download dari customer detail)
- `PiutangListPDF.tsx` — daftar piutang

### 8.3 Integration

- Download button di recap page → generate PDF
- Download button di customer detail → generate piutang/transaction list PDF

---

## PHASE 9: UPDATE EXISTING FILES

### 9.1 `src/app/layout.tsx`
- Update metadata description: "Aplikasi pengelolaan penjualan, piutang, dan bonus untuk bisnis HL"

### 9.2 `src/app/page.tsx` (Landing)
- Ganti seluruh konten: hapus "Finance clarity that powers your growth"
- Ganti hero copy: fokus ke "sales management", "piutang tracking", "bonus automation"
- Hapus register button
- Hapus stats section yang menunjukkan income/expense/budget/categories
- Ganti "Open Dashboard" → langsung ke `/login`

### 9.3 `src/app/(dashboard)/layout.tsx`
- Hapus referensi `DUMMY_USER` dari `@/lib/dummy`
- Gunakan Supabase Auth user data

### 9.4 `src/app/(auth)/layout.tsx`
- Update subtitle: "Kelola penjualan, piutang, dan bonus bisnis HL dengan mudah."

### 9.5 `src/app/actions/transactions.ts`
- **HAPUS SELURUHNYA** — logic ini untuk income/expense, tidak relevan
- Ganti dengan server actions per domain (lihat Phase 6)

### 9.6 `src/app/actions/settings.ts`
- Simplify: hanya profile single user, tidak perlu categories/budgets

---

## PHASE 10: SERVER ACTIONS (BARU)

Buat file-file server actions baru:

```
src/app/actions/customers.ts     # CRUD customers + discount management
src/app/actions/products.ts      # CRUD products
src/app/actions/bons.ts          # CRUD bons + line items + calculations
src/app/actions/settlement.ts    # Pelunasan: single bon + bulk month
src/app/actions/bonus.ts         # Bonus logic: check eligibility + create bonus bon
src/app/actions/recap.ts         # Recap queries: per customer, per type, overall
src/app/actions/auth.ts          # Only signIn + signOut (hapus signUp)
```

---

## PHASE 11: DESIGN.MD UPDATE

Update DESIGN.md:
- Section 7 Page-Level UX: ganti dari (Dashboard/Transactions/Budgets/Reports/Categories/Settings) → (Dashboard/Customers/Products/Bons/Customer Detail/Recap/Settings)
- Section 11 Iconography: update table sesuai nav baru
- Hapus semua referensi "income", "expense", "budget", "category"

---

## PHASE 12: VALIDATION & TESTING

### 12.1 Checklist Sebelum Submit

- [ ] Semua AC di `acceptance-criteria-HL-app.md` terimplementasi
- [ ] Cascading discount benar: 100 × [20,20,10] = 57.6
- [ ] Omzet/Laba hanya diakui saat Lunas (cash basis)
- [ ] Bonus accumulator logic benar
- [ ] Nomor Bon unique constraint enforced
- [ ] Soft-delete: customer/product hidden dari dropdown, history preserved
- [ ] Tidak ada halaman /register
- [ ] Tidak ada konsep income/expense/budget/category
- [ ] PDF export berfungsi untuk recap dan customer detail
- [ ] TypeScript: tidak ada `any`, semua validated dengan Zod
- [ ] Responsive: 375px → 1440px
- [ ] Accessibility: WCAG 2.1 AA

### 12.2 E2E Test Flows (Playwright)

1. Login → dashboard
2. Create customer with LM=[20,20,10], BR=[15], threshold=10jt
3. Create product LM (harga_modal=50rb, harga_base=100rb)
4. Create product BR (harga_modal=30rb, harga_base=80rb)
5. Buat Bon: pilih customer, add 2 LM + 1 BR, ongkir=50rb → verify calculations
6. Settle single Bon → verify omzet/laba recognized
7. Buat beberapa Bon → settle all in month (bulk)
8. Check bonus eligibility after accumulated omzet ≥ threshold
9. Create bonus Bon → verify 0 omzet, 0 profit
10. View recap per customer, per type, overall
11. Export PDF
12. Logout

---

## RINGKASAN FILE PERUBAHAN

### File yang DIHAPUS:
- `src/app/(dashboard)/budgets/` (seluruh folder)
- `src/app/(dashboard)/categories/` (seluruh folder)
- `src/app/(auth)/register/` (seluruh folder)
- `src/app/actions/budgets.ts`
- `src/app/actions/categories.ts`
- `src/app/actions/transactions.ts`
- `src/lib/dummy.ts`

### File yang DIUBAH:
- `src/app/layout.tsx` — metadata
- `src/app/page.tsx` — landing page content
- `src/app/(auth)/layout.tsx` — subtitle
- `src/app/(dashboard)/layout.tsx` — remove dummy user
- `src/app/(dashboard)/dashboard/page.tsx` — total redesign
- `src/app/(dashboard)/settings/page.tsx` — simplify
- `src/app/(dashboard)/reports/page.tsx` → ganti ke recap
- `src/app/actions/auth.ts` — remove signUp
- `src/app/actions/settings.ts` — simplify
- `src/components/layout/Sidebar.tsx` — new nav items
- `src/components/layout/BottomNav.tsx` — new nav items
- `src/middleware.ts` — keep as-is
- `DESIGN.md` — update page references
- `PRD.md` — already updated (v3.0)
- `techstack.md` — already updated (v2.0)

### File yang DIBUAT:
- `src/app/(dashboard)/customers/page.tsx`
- `src/app/(dashboard)/customers/[id]/page.tsx`
- `src/app/(dashboard)/products/page.tsx`
- `src/app/(dashboard)/bons/page.tsx`
- `src/app/(dashboard)/bons/new/page.tsx`
- `src/app/(dashboard)/bons/[id]/page.tsx`
- `src/app/(dashboard)/recap/page.tsx` (ganti reports)
- `src/app/actions/customers.ts`
- `src/app/actions/products.ts`
- `src/app/actions/bons.ts`
- `src/app/actions/settlement.ts`
- `src/app/actions/bonus.ts`
- `src/app/actions/recap.ts`
- `src/lib/calculations/discount.ts`
- `src/lib/calculations/bon.ts`
- `src/lib/calculations/bonus.ts`
- `src/lib/formatters.ts` — currency IDR, date
- `src/lib/pdf/CustomerRecapPDF.tsx`
- `src/lib/pdf/OverallRecapPDF.tsx`
- `src/lib/pdf/BonListPDF.tsx`
- `src/components/customers/*`
- `src/components/products/*`
- `src/components/bons/*`
- `src/components/recap/*`
- `prisma/schema.prisma`

---

## EKSEKUSI

Saat menerima prompt ini, ikuti langkah-langkah berikut:

1. **Baca semua SOT documents** (AC, PRD, techstack, DESIGN)
2. **Mulai dari Phase 1** (cleanup) — hapus file yang tidak relevan
3. **Phase 2** (database) — setup Prisma schema dan migration
4. **Phase 3** (calculation engine) — business logic + unit test
5. **Phase 4-11** — eksekusi bertahap, setiap phase selesai baru lanjut
6. **Phase 12** — validasi dan testing
7. **Laporkan progress** setelah setiap phase selesai

**ATURAN:**
- Jangan skip phase. Urutan penting.
- Jika ragu, cek `acceptance-criteria-HL-app.md` dulu.
- Jika ada konflik antara dokumen, TANYA user.
- Jangan buat fitur yang tidak ada di AC.
- Patuhi DESIGN.md untuk semua styling.
- Gunakan `Plan Mode` untuk setiap phase besar.
