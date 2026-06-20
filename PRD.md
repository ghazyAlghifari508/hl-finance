# HL Finance — Product Requirements Document (PRD)

> **Versi:** 3.0
> **Tanggal:** 2026-06-20
> **Status:** Final — berdasarkan acceptance-criteria-HL-app.md
> **Author:** Development Team

---

## ⚠️ PERINGATAN WAJIB UNTUK AI AGENT

**Sebelum melakukan APA SAJA, baca `acceptance-criteria-HL-app.md` secara LENGKAP.**

Dokumen ini bukan sumber keputusan utama untuk acceptance criteria. **acceptance-criteria-HL-app.md** adalah source of truth tunggal untuk semua ketentuan fungsional.

Jika ada pertentangan antara dokumen ini dan acceptance criteria, **MINTA KLARIFIKASI KE USER** — jangan asumsi.

---

## 1. Ringkasan Produk

**HL Finance** adalah aplikasi web **single-user internal** untuk mengelola penjualan, piutang, bonus, dan laporan untuk bisnis "HL".

**Bukan** personal finance tracker. **Bukan** expense/budget manager. **Bukan** budgeting app. Aplikasi ini TIDAK memiliki konsep income/expense/budget/categories.

### 1.1 Visi

Membantu pemilik bisnis HL mencatat penjualan (Bon), mengelola piutang (Piutang), melacak bonus customer, dan menghasilkan laporan omzet/laba.

### 1.2 Target Pengguna

- **Single user**: Pemilik bisnis "HL"
- **Akses**: Satu akun saja, tidak ada registrasi publik. Akun dibuat manual di Supabase.

### 1.3 Glossary (WAJIB)

| Term | Meaning |
|------|---------|
| Bon | Satu transaksi / invoice, diidentifikasi oleh Nomor Bon |
| LM / BR | Tipe produk. Setiap customer punya diskon terpisah per tipe |
| Harga Modal | Harga beli produk (yang HL bayar). Hanya untuk laba |
| Harga Base / Harga Jual | Harga jual sebelum diskon |
| Diskon bertingkat | Rangkaian % diskon diterapkan berurutan, TIDAK dijumlahkan |
| Ongkir | Biaya kirim. Pass-through ke customer, tanpa dampak laba |
| Omzet | Pendapatan = harga diskon × qty (ongkir dikecualikan). Diakui saat Lunas |
| Laba HL | Profit = (harga diskon − modal) × qty. Diakui saat Lunas |
| Piutang | Piutang / jumlah belum bayar. Default status transaksi baru |
| Lunas | Sudah dibayar / dilunasi |

---

## 2. Tujuan & Sasaran Bisnis

| ID | Tujuan | KPI |
|----|--------|-----|
| G1 | Pencatatan penjualan (Bon) cepat dan akurat | ≤ 1 menit per transaksi |
| G2 | Visibilitas piutang real-time | Dashboard load < 2 detik |
| G3 | Tracking bonus customer otomatis | Bonus akurat 100% sesuai threshold |
| G4 | Laporan omzet/laba per customer dan keseluruhan | Export PDF tersedia |

---

## 3. User Stories & Acceptance Criteria

Lihat `acceptance-criteria-HL-app.md` untuk acceptance criteria lengkap. Berikut ringkasan user stories:

### 3.1 Autentikasi

- **US-01**: Sebagai user, saya ingin login dengan kredensial saya
- **US-02**: Sebagai user, saya ingin logout dengan aman
- **Catatan**: Tidak ada registrasi publik. Hanya satu akun yang ada (AC-1.2)

### 3.2 Customer Management

- **US-03**: Sebagai user, saya ingin membuat customer baru dengan nama dan diskon per tipe
- **US-04**: Sebagai user, saya ingin edit data customer
- **US-05**: Sebagai user, saya ingin hapus customer (soft-delete)
- **US-06**: Sebagai user, saya ingin mengelola diskon bertingkat per tipe (LM/BR)

### 3.3 Product Management

- **US-07**: Sebagai user, saya ingin membuat produk dengan harga modal dan harga jual
- **US-08**: Sebagai user, saya ingin edit produk
- **US-09**: Sebagai user, saya ingin hapus produk (soft-delete)

### 3.4 Transaksi (Bon)

- **US-10**: Sebagai user, saya ingin membuat Bon dengan customer, produk line items, dan ongkir
- **US-11**: Sebagai user, saya ingin edit Bon
- **US-12**: Sebagai user, saya ingin hapus Bon
- **US-13**: Sebagai user, saya ingin melihat perhitungan omzet dan laba otomatis

### 3.5 Piutang & Pelunasan

- **US-14**: Sebagai user, saya ingin menandai Bon sebagai Lunas
- **US-15**: Sebagai user, saya ingin melunasi semua Bon dalam satu bulan sekaligus
- **US-16**: Sebagai user, saya ingin melihat total piutang per customer per bulan

### 3.6 Bonus Logic

- **US-17**: Sebagai user, saya ingin sistem menghitung bonus otomatis berdasarkan akumulasi omzet
- **US-18**: Sebagai user, saya ingin membuat Bon bonus untuk customer

### 3.7 Customer Detail Page

- **US-19**: Sebagai user, saya ingin melihat riwayat transaksi customer per bulan
- **US-20**: Sebagai user, saya ingin melihat rekap omzet/laba per customer

### 3.8 Recap / Reporting

- **US-21**: Sebagai user, saya ingin melihat rekap per customer
- **US-22**: Sebagai user, saya ingin melihat rekap per tipe produk
- **US-23**: Sebagai user, saya ingin melihat rekap keseluruhan
- **US-24**: Sebagai user, saya ingin export laporan ke PDF

---

## 4. Functional Requirements

### 4.1 Autentikasi

| ID | Requirement | Prioritas |
|----|-------------|-----------|
| FR-01 | Login dengan email + password | P0 |
| FR-02 | Session persist sampai logout/expiry | P0 |
| FR-03 | Logout dan session invalidasi | P0 |
| FR-04 | Error message jelas saat login gagal | P0 |
| FR-05 | Tidak ada registrasi publik (single user) — halaman /register TIDAK ADA | P0 |

### 4.2 Customer Management

| ID | Requirement | Prioritas |
|----|-------------|-----------|
| FR-06 | Create customer dengan nama (required) | P0 |
| FR-07 | Edit semua field customer | P0 |
| FR-08 | Soft-delete customer (hide dari new selections, history preserved) | P0 |
| FR-09 | Dua set diskon independen per customer (LM & BR) | P0 |
| FR-10 | Diskon = ordered list of percentages | P0 |
| FR-11 | Add, edit, delete individual discount steps | P0 |
| FR-12 | Diskon validasi: numeric 0-100 | P0 |
| FR-13 | Bonus threshold per customer (Rupiah amount) | P0 |

### 4.3 Product Management

| ID | Requirement | Prioritas |
|----|-------------|-----------|
| FR-14 | Create, edit, delete products | P0 |
| FR-15 | Tipe terbatas: LM atau BR | P0 |
| FR-16 | Harga Modal dan Harga Base ≥ 0 | P0 |
| FR-17 | Harga Modal tidak tampil ke customer-facing | P0 |
| FR-18 | Soft-delete produk (hide dari new selections) | P0 |

### 4.4 Transaction (Bon) Management

| ID | Requirement | Prioritas |
|----|-------------|-----------|
| FR-19 | Tanggal default hari ini, editable | P0 |
| FR-20 | Nomor Bon required dan unique | P0 |
| FR-21 | Customer dipilih dari existing list | P0 |
| FR-22 | Produk dipilih dari existing catalog | P0 |
| FR-23 | Multi product lines, qty ≥ 1 | P0 |
| FR-24 | Diskon otomatis berdasarkan customer × tipe produk | P0 |
| FR-25 | Ongkir ≥ 0, per transaksi (bukan per line) | P0 |
| FR-26 | Status default Piutang, bisa diubah ke Lunas | P0 |
| FR-27 | View, edit, delete transaksi | P0 |
| FR-28 | Hitung: per-line omzet, transaksi omzet, ongkir, total owed | P0 |
| FR-29 | Hitung: per-line Laba HL | P0 |
| FR-30 | Omzet/Laba hanya diakui saat Lunas (cash basis) | P0 |

### 4.5 Bonus Logic

| ID | Requirement | Prioritas |
|----|-------------|-----------|
| FR-31 | Accumulated omzet per customer (Lunas only) | P0 |
| FR-32 | Bonuses stack: floor(accumulator / threshold) − already granted | P0 |
| FR-33 | Bonus eligibility flag/notification | P0 |
| FR-34 | Bonus = transaksi dengan Bonus = on | P0 |
| FR-35 | Bonus product lines free: 0 omzet, 0 profit | P0 |
| FR-36 | Bonus transactions distinguishable from normal sales | P0 |

### 4.6 Customer Detail & Pelunasan

| ID | Requirement | Prioritas |
|----|-------------|-----------|
| FR-37 | Customer page: transactions grouped by month | P0 |
| FR-38 | Monthly totals: Piutang, sudah dibayar, Omzet, Laba | P0 |
| FR-39 | Omzet BR & LM separate columns | P0 |
| FR-40 | Settle whole month (bulk pelunasan) | P0 |
| FR-41 | Settle single Bon | P0 |
| FR-42 | Payment date modal saat pelunasan | P0 |
| FR-43 | Update totals immediately after pelunasan | P0 |

### 4.7 Recap / Reporting

| ID | Requirement | Prioritas |
|----|-------------|-----------|
| FR-44 | Recap per customer | P0 |
| FR-45 | Recap per tipe produk (LM/BR) | P0 |
| FR-46 | Recap overall (all customers) | P0 |
| FR-47 | Filter by month dan year | P0 |
| FR-48 | Report: Total Omzet, Laba, Piutang, sudah dibayar | P0 |
| FR-49 | Bonus transactions excluded dari omzet/profit totals | P0 |
| FR-50 | Export PDF | P1 |

---

## 5. Non-Functional Requirements

| ID | Kategori | Requirement |
|----|----------|-------------|
| NFR-01 | Security | Aplikasi hanya untuk satu user, tidak ada registrasi |
| NFR-02 | Security | HTTPS only, secure cookies |
| NFR-03 | Security | Rate limiting di endpoint login |
| NFR-04 | Performance | Dashboard load < 2 detik |
| NFR-05 | Usability | Responsive (375px → 1440px) |
| NFR-06 | Usability | Keyboard navigation full support |
| NFR-07 | Usability | Touch target minimal 44×44px |
| NFR-08 | Accessibility | WCAG 2.1 AA compliant |
| NFR-09 | Currency | IDR (Rp) only, no tax/PPN |

---

## 6. Data Model (Ringkas)

Lihat `techstack.md` section 3.4 untuk Prisma schema lengkap.

```
Customer
├── id (uuid, PK)
├── name (varchar)
├── bonus_threshold (numeric) — Rp threshold untuk bonus eligibility
├── is_deleted (boolean, default false) — soft-delete
├── created_at
└── updated_at

CustomerDiscount
├── id (uuid, PK)
├── customer_id (FK → Customer)
├── product_type (enum: 'LM' | 'BR')
├── step_order (integer) — urutan diskon
├── discount_percent (numeric 0-100)
└── unique(customer_id, product_type, step_order)

Product
├── id (uuid, PK)
├── name (varchar)
├── harga_modal (numeric) — cost, hanya untuk profit
├── harga_base (numeric) — list price sebelum diskon
├── tipe (enum: 'LM' | 'BR')
├── is_deleted (boolean, default false) — soft-delete
├── created_at
└── updated_at

Bon (Transaction)
├── id (uuid, PK)
├── nomor_bon (varchar, UNIQUE) — nomor Bon unik
├── tanggal (date) — default hari ini
├── customer_id (FK → Customer)
├── deskripsi (text, nullable)
├── ongkir (numeric ≥ 0)
├── is_bonus (boolean, default false) — toggle bonus
├── status (enum: 'piutang' | 'lunas') — default piutang
├── payment_date (date, nullable) — tanggal pelunasan
├── computed_omzet (numeric) — Σ line omzet (ongkir excluded)
├── computed_laba (numeric) — Σ line Laba HL (ongkir excluded)
├── total_owed (numeric) — computed_omzet + ongkir
├── created_at
└── updated_at

BonLineItem
├── id (uuid, PK)
├── bon_id (FK → Bon)
├── product_id (FK → Product)
├── quantity (integer ≥ 1)
├── product_type (enum: 'LM' | 'BR') — snapshot tipe saat transaksi
├── harga_base_snapshot (numeric) — snapshot harga base
├── discounted_unit_price (numeric) — computed dari cascading discount
├── line_omzet (numeric) — discounted_unit_price × quantity
├── line_laba (numeric) — (discounted_unit_price − harga_modal) × quantity
├── created_at
└── updated_at

BonusLedger
├── id (uuid, PK)
├── customer_id (FK → Customer)
├── bon_id (FK → Bon) — transaksi bonus yang memberikan bonus
├── bonus_count (integer) — jumlah bonus diberikan
├── omzet_consumed (numeric) — bonus_count × threshold
├── created_at
└── updated_at
```

---

## 7. Alur Pengguna (User Flow)

### 7.1 Login

1. Akses `/login`
2. Masukkan email + password
3. Redirect ke `/dashboard`
4. Tidak ada link "Register" / "Sign Up"

### 7.2 Setup Awal (First Time)

1. Buat customer (isi nama, diskon LM, diskon BR, bonus threshold)
2. Buat product (isi nama, tipe LM/BR, harga modal, harga base)
3. Mulai buat Bon

### 7.3 Buat Bon Baru

1. Klik "Buat Bon" di dashboard atau navigation
2. Pilih customer dari dropdown
3. Tambah product line items:
   - Pilih produk dari catalog
   - Isi quantity
   - Sistem otomatis tampilkan: tipe (LM/BR), harga diskon untuk customer ini
4. Isi ongkir (opsional)
5. Isi deskripsi (opsional)
6. Toggle bonus (opsional) — hanya jika customer punya bonus available
7. Simpan → status default Piutang
8. Sistem hitung: per-line omzet, transaksi omzet, per-line laba, total owed

### 7.4 Pelunasan (Lunas)

#### Satu Bon:
1. Buka detail Bon atau customer page
2. Klik "Lunas"
3. Modal muncul: isi Tanggal Pelunasan
4. Konfirmasi → status berubah ke Lunas
5. Omzet/Laba terakumulasi, bonus accumulator update

#### Satu Bulan (Bulk):
1. Buka halaman customer → pilih bulan
2. Klik "Sudah Lunas"
3. Modal muncul: isi Tanggal Pelunasan
4. Konfirmasi → semua Bon bulan itu jadi Lunas
5. Omzet/Laba terakumulasi

### 7.5 Bonus

1. Sistem hitung akumulasi omzet paid customer
2. Jika ≥ threshold, flag bonus muncul
3. User buat Bon dengan Bonus = on
4. Bonus product lines gratis (tidak hitung omzet/laba)
5. Threshold dikonsumsi, remainder carry over

---

## 8. Master Calculation Reference

Lihat bagian 8 di `acceptance-criteria-HL-app.md` untuk tabel perhitungan lengkap.

| Quantity | Formula |
|----------|---------|
| Discounted unit price | Base × Π(1 − dᵢ/100) |
| Line omzet | discounted_unit_price × qty |
| Transaction omzet | Σ line omzet (ongkir excluded) |
| Amount owed | omzet + ongkir |
| Line Laba HL | (discounted_unit_price − harga_modal) × qty |
| Recognized Omzet | Σ omzet where Lunas |
| Recognized Laba | Σ laba where Lunas |
| Bonus available | floor(Σ omzet lunas / threshold) − granted |

---

## 9. Confirmed Decisions

Lihat bagian 9 di `acceptance-criteria-HL-app.md` untuk semua keputusan yang sudah di-resolve.

---

## 10. Out of Scope (v1)

- Multi-user / shared account
- Multi-currency
- Bank integration / auto-import
- Tax calculation / PPN
- Mobile native app
- Integration dengan sistem akuntansi eksternal
- Personal finance features (income/expense/budget/categories)
- Public registration

---

## 11. Navigation Structure

| Page | Route | Icon |
|------|-------|------|
| Dashboard | `/dashboard` | `LayoutDashboard` |
| Customers | `/customers` | `Users` |
| Products | `/products` | `Package` |
| Bons | `/bons` | `ReceiptText` |
| Recap | `/recap` | `BarChart3` |
| Settings | `/settings` | `Settings` |

**TIDAK ADA:**
- `/budgets` — tidak ada konsep budget
- `/categories` — tidak ada income/expense categories
- `/register` — single user, no public signup

---

## 12. Referensi

- **Source of Truth Utama**: `acceptance-criteria-HL-app.md` — Semua acceptance criteria ada di sini
- Tech stack: `techstack.md`
- Design system: `DESIGN.md`
- AI agent instructions: `AGENTS.md` / `CLAUDE.md`
