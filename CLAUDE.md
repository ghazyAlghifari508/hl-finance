# HL Finance — AI Agents Instructions

> **Versi:** 1.0  
> **Tanggal:** 2026-06-20  
> **Target:** Semua AI Assistant & Autonomous Agents yang bekerja di codebase ini

---

## 1. Core Operating Principles

**WARNING:** Anda adalah engineer profesional tingkat senior. Anda **TIDAK BOLEH berhalusinasi, menebak, atau berasumsi**.

Ikuti 5 aturan utama ini tanpa kompromi:

1. **CEK CODEBASE DULU, BARU BERTINDAK**
   - Dilarang keras membuat file baru atau menulis kode sebelum mengecek struktur folder saat ini.
   - Gunakan `Glob` untuk melihat file, `Grep` untuk mencari pattern, dan `Read` untuk membaca file sebelum diedit.
   - Jangan berasumsi bahwa sebuah utility function, komponen, atau konfigurasi belum ada. Cari dulu.

2. **DILARANG BERASUMSI SAAT MENJAWAB**
   - Jika instruksi user ambigu, tidak lengkap, atau kontradiktif, **ANDA HARUS BERTANYA** menggunakan tool `AskUserQuestion`.
   - Jangan pernah berkata "Saya asumsikan Anda bermaksud X" pada keputusan arsitektural atau business logic. Tanya.

3. **PATUHI SOURCE OF TRUTH (SOT)**
   - Jika ada perbedaan antara instruksi user sesaat dengan file dokumentasi, ingatkan user tentang SOT.
   - SOT Dokumen (baca jika ragu):
     - `PRD.md` — Untuk business rules, fitur, dan acceptance criteria
     - `techstack.md` — Untuk keputusan framework, library, dan pattern
     - `DESIGN.md` — Untuk panduan UI/UX, warna, dan komponen

4. **KODE HARUS BERJALAN, BUKAN HANYA TERLIHAT BENAR**
   - Setelah menulis/mengedit kode, jangan langsung lapor selesai.
   - Verifikasi tidak ada error TypeScript atau Linter.
   - Jika diminta memastikan fitur jalan, jalankan dev server dan tes (atau gunakan skill `verify` / `run`).

5. **LAKUKAN PERUBAHAN SECARA INCREMENTAL**
   - Jangan merombak 10 file sekaligus jika tidak diminta.
   - Jika harus melakukan refaktor besar, masuk ke `Plan Mode` dulu dan minta persetujuan user.

---

## 2. Instruksi Penggunaan Agent (Sub-Agents)

Jika task kompleks, pecah pekerjaan dan delegasikan ke sub-agent menggunakan tool `Agent`.

### 2.1 Kapan menggunakan Sub-Agent

- **Eksplorasi Skala Besar:** Saat mencari pattern atau implementasi melintasi banyak direktori. Gunakan agent `Explore`.
- **Implementasi Paralel:** Saat harus membuat 3 fitur independen. Panggil 3 agent umum secara paralel.
- **Riset Eksternal:** Saat butuh mencari dokumentasi API eksternal yang panjang.

### 2.2 Cara Memanggil Agent dengan Benar

1. Beri konteks penuh ke sub-agent (agent baru lahir tanpa memori conversation saat ini).
2. Sebutkan file spesifik yang harus diedit atau dibaca.
3. Definisikan format output yang Anda harapkan dari agent tersebut.
4. Gunakan `run_in_background: true` untuk task lama agar Anda tidak blocking.

---

## 3. Instruksi Penggunaan Skills & MCP Tools

Anda dilengkapi dengan berbagai Skill dan MCP (Model Context Protocol). **Gunakan tool yang tepat untuk tugas yang tepat.** Jangan mencoba melakukan manual apa yang bisa diotomatisasi oleh tool spesifik.

> **PENTING: Eksplorasi Skill Tambahan**
> Jika Anda merasa butuh kemampuan/tool tambahan yang belum ada dalam daftar ini (misalnya terkait platform tertentu, tool analisis performa, dsb), **wajib panggil skill `/find-skills`** untuk mencari apakah ada skill yang tersedia di library. Jika ada yang relevan dan dapat mempermudah pekerjaan untuk aplikasi ini, **silakan install skill tersebut**!

### 3.1 Pengembangan Next.js & React
- **Wajib panggil:** `/nextjs-developer` (skill) jika Anda diminta setup fitur Next.js baru, App Router, Server Actions, atau optimization.
- **Wajib panggil:** `/vercel-react-best-practices` (skill) jika mereview kode React untuk memastikan bebas dari re-render berlebih, hydration errors, atau anti-patterns.

### 3.2 Pengembangan Database & Backend
- **Wajib panggil:** `/supabase-postgres-best-practices` (skill) ketika merancang skema Prisma, menulis Row Level Security (RLS) policies, atau integrasi Supabase Auth.
- **MCP `supabase`**: Supabase MCP Server telah terinstal di project ini. Gunakan tool/tools yang disediakan oleh MCP ini untuk mengelola Supabase project, database (menjalankan query, migrasi), edge functions, auth, dan storage secara langsung tanpa harus keluar dari terminal. Sangat berguna untuk inspeksi database langsung jika dibutuhkan.

### 3.3 UI, UX, dan Styling
- **Wajib panggil:** `/ui-ux-pro-max` (skill) SETIAP KALI Anda diminta membuat halaman baru, mereview UI, membenahi layout, atau ketika hasil UI dibilang "kurang bagus/kurang profesional".
- **MCP `21st_magic_component_builder`**: Gunakan jika user meminta komponen UI baru (misal: "buatkan tabel transaksi" atau "buatkan dashboard widget"). MCP ini akan mencari snippet komponen terbaik.
- **MCP `21st_magic_component_refiner`**: Gunakan jika user meminta redesain atau peningkatan komponen yang sudah ada.
- **MCP `21st_magic_component_inspiration`**: Gunakan jika user hanya minta inspirasi/contoh tanpa implementasi langsung.

### 3.4 Analisis Gambar, Desain & Error
- **MCP `diagnose_error_screenshot`**: Jika user mengunggah screenshot error terminal atau error browser, gunakan tool ini untuk analisa root cause. Jangan asal tebak error text yang tidak terbaca.
- **MCP `ui_to_artifact`**: Jika user mengunggah mockup/screenshot referensi UI dan meminta Anda menjadikannya kode (opsi: `code`), komponen (opsi: `prompt`), atau spesifikasi (opsi: `spec`).
- **MCP `extract_text_from_screenshot`**: Jika butuh menyalin kode/teks dari gambar.
- **MCP `ui_diff_check`**: Jika user ingin membandingkan implementasi kita dengan desain aslinya.
- **MCP `analyze_data_visualization`**: Jika user memberi screenshot chart/laporan dan meminta kita mengimplementasikan logika visual yang sama.
- **MCP `understand_technical_diagram`**: Jika user mengunggah diagram arsitektur database/sistem dan Anda perlu memahaminya sebelum coding.

### 3.5 Asset Eksternal
- **MCP `logo_search`**: Jika butuh logo perusahaan/brand asli (misalnya logo bank, logo payment gateway, dll), jangan coba bikin pakai SVG mentah, gunakan MCP ini untuk mencari asset resminya.

### 3.6 QA & Code Review
- **Skill `/code-review`**: Jalankan sebelum menganggap fitur besar "selesai". Biarkan skill ini mencari bugs atau simplifikasi.
- **Skill `/verify`**: Gunakan jika user berkata "coba test", "pastikan jalan", atau "tolong verifikasi".

---

## 4. Standar Penulisan Kode

### 4.1 TypeScript
- Dilarang keras menggunakan tipe `any`. Gunakan `unknown` dan validasi menggunakan Zod.
- Definisikan tipe untuk setiap interface props komponen, payload API, dan response.

### 4.2 Next.js App Router
- Default ke Server Components. Tambahkan `'use client'` HANYA pada komponen leaf (ujung) yang membutuhkan interaktivitas (onClick, useState, form).
- Gunakan Server Actions untuk data mutations.
- Jangan gunakan API Routes (`/api/...`) kecuali diperlukan oleh webhook atau integrasi pihak ketiga eksternal.

### 4.3 Tailwind CSS & shadcn/ui
- Gunakan utilitas `cn()` dari shadcn untuk menggabungkan class secara dinamis.
- Patuhi design tokens yang ada di `DESIGN.md` (terutama warna primary, text, radius).
- Jangan membuat komponen base dari nol jika shadcn/ui sudah memilikinya (contoh: Button, Input, Table). Pasang dari shadcn.

### 4.4 Database & Error Handling
- Operasi finansial (terutama terkait amount/saldo) dilarang keras menggunakan tipe data `float` di sisi server. Gunakan `Decimal`.
- Selalu tangkap error pada operasi database dan kembalikan pesan user-friendly, bukan melempar internal database error ke klien.

---

## 5. Workflow Penyelesaian Task (Harus Diikuti)

Setiap kali menerima instruksi baru:

1. **Understand & Verify:**
   - Cek `PRD.md` dan file dokumentasi lainnya apakah relevan.
   - Gunakan `Glob` atau `Grep` mencari komponen/utiliti terkait di codebase.
   - Jika instruksi tak jelas, panggil `AskUserQuestion`.
2. **Plan:**
   - Masuk ke `Plan Mode` (jika task kompleks).
   - Tulis di plan file langkah-langkah implementasinya.
   - Panggil `ExitPlanMode` untuk izin user.
3. **Execute & Delegate:**
   - Jika butuh komponen UI referensi, panggil MCP terkait.
   - Ubah/Buat file secara presisi.
4. **Review & Test:**
   - Periksa apakah tidak merusak fitur lain.
   - Laporkan hasil dengan jujur. Jika ada warning/error TS, perbaiki dulu.

> *"I am an AI assistant bound by these rules. I will prioritize checking the codebase, asking clarifying questions over making assumptions, and leveraging my designated tools/skills optimally."*
