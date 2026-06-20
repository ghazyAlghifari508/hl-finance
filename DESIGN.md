# HL Finance — Design System & UX Guidelines

> **Versi:** 2.1
> **Tanggal:** 2026-06-20
> **Status:** Approved Design Direction
> **Design Goal:** User-friendly, simple, easy to use, easy to navigate, trustworthy
> **Style Reference:** Join Parker — Banker's ledger meets indie magazine

---

## 1. Design Principles

1. **Clarity over decoration** — Every element has a clear function. No ornaments that don't help the user understand data.
2. **Finance must feel trustworthy** — Stable, clean, professional. Never playful or experimental.
3. **Fast scanning** — Users must understand piutang, omzet, and bonus status within seconds.
4. **Low cognitive load** — Forms, filters, and dashboards must never feel dense. Show what matters first, details second.
5. **Accessibility by default** — Contrast, keyboard navigation, focus states, and empty/error/loading states from day one.

---

## 2. Visual Direction

**Style:** Parker — Banker's ledger meets indie magazine.
**Theme:** Light (primary). No dark mode in v1.
**Core vibe:** White paper canvas, single electric-blue primary, warm parchment for softness, pill-shaped buttons, 24px card radius.

---

## 3. Color System

### 3.1 Core Palette

| Token | Hex | Role |
|------|-----|------|
| `--color-electric-blue` | `#5196fe` | Primary brand — CTAs, active nav, links, focus ring, omzet/positive semantic |
| `--color-ember-orange` | `#f9754e` | Accent CTA — used at most once per page for critical conversion. Piutang/warning semantic |
| `--color-ink-black` | `#1b1d20` | Primary text, dark card surfaces, heavy borders. NOT pure black |
| `--color-midnight` | `#101828` | Secondary text, dark borders in tight contexts |
| `--color-paper-white` | `#ffffff` | Primary canvas, card surfaces, button text, input fills |
| `--color-parchment` | `#f2f1ec` | Warm card surface alternative — stat panels, soft blocks |
| `--color-sand` | `#e1dfd8` | Warm hairline borders, parchment-adjacent dividers |
| `--color-graphite` | `#27272a` | Border color for dark elements |
| `--color-steel` | `#6e6e6e` | Muted helper text, quiet borders, icon strokes |
| `--color-ash` | `#797876` | Muted text on warm surfaces |
| `--color-fog` | `#a3a3a3` | Input default border — resting state before focus |

### 3.2 Semantic Mapping for HL Finance

| Concept | Color | Rationale |
|---------|-------|-----------|
| Omzet / Lunas (positive) | Electric Blue `#5196fe` | Brand color carries positivity |
| Piutang / Outstanding | Ember Orange `#f9754e` | Warm accent for unpaid |
| Bonus Available | Electric Blue `#5196fe` | Highlight opportunity |
| Overdue Warning | Ember Orange `#f9754e` | Warning state |
| Danger / Destructive | Ember Orange `#f9754e` | Destructive actions |
| Neutral Text | Ink Black `#1b1d20` | Reading, labels |
| Muted Text | Steel `#6e6e6e` | Secondary info |
| Page Background | Paper White `#ffffff` | Clean canvas |
| Soft Surface | Parchment `#f2f1ec` | Stat panels, warm cards |

### 3.3 Anti-Patterns — Colors

- **No pure black `#000000`** — Ink Black carries warmth
- **No additional accent hues** — No green, purple, red. Use blue/orange opacity shifts or inline icons for status
- **No full-width gradient backgrounds** — Gradients only on product card visuals
- **Orange used at most once per page** — Scarcity is what makes it convert

---

## 4. Typography System

### 4.1 Font Families

**Primary (95% of UI):** `Inter`
- Weights: 400 (body), 500 (sub-labels, nav), 600 (headings), 700 (stat numbers)
- Substitute: DM Sans, IBM Plex Sans

**Display (at most once per page):** `Gambetta` italic
- Used for a single word of emphasis in hero headlines
- Weight: 500 italic
- Substitute: Source Serif 4 Italic, Newsreader Italic

### 4.2 Type Scale

| Role | Size | Line Height | Letter Spacing | Tailwind Class |
|------|------|-------------|----------------|----------------|
| Caption | 14px | 1.5 | -0.14px | `text-[14px] leading-[1.5] tracking-[-0.14px]` |
| Body Small | 16px | 1.5 | -0.32px | `text-base leading-relaxed` |
| Body | 18px | 1.43 | -0.36px | `text-[18px] leading-[1.43]` |
| Subheading | 20px | 1.42 | -0.46px | `text-[20px] leading-[1.42] tracking-[-0.46px]` |
| Heading SM | 32px | 1.16 | -0.96px | `text-[32px] leading-[1.16] tracking-tight` |
| Heading | 48px | 1.13 | -2.88px | `text-[48px] leading-[1.13] tracking-tight` |
| Display | 64px | 1.05 | -6.4px | `text-[64px] leading-[1.05] tracking-tighter` |

### 4.3 Headline Tracking Rules

- 32px → -0.03em
- 48px → -0.06em
- 64px → -0.10em
- Inter at large sizes needs aggressive negative tracking to feel confident

### 4.4 Number Formatting

- Tabular figures for alignment in tables/charts/stat blocks
- Consistent thousand separators (IDR: `Rp10.000.000`)
- Clear currency symbol placement
- Stat numbers: Inter 700, tight tracking

---

## 5. Spacing, Radius, Shadow

### 5.1 Spacing Scale (4px base unit, comfortable density)

| Token | Value |
|-------|-------|
| `--spacing-4` | 4px |
| `--spacing-8` | 8px |
| `--spacing-12` | 12px |
| `--spacing-16` | 16px |
| `--spacing-20` | 20px |
| `--spacing-24` | 24px |
| `--spacing-28` | 28px |
| `--spacing-32` | 32px |
| `--spacing-40` | 40px |
| `--spacing-48` | 48px |
| `--spacing-64` | 64px |
| `--spacing-80` | 80px |

### 5.2 Border Radius (Non-negotiable identity markers)

| Element | Value | Token |
|---------|-------|-------|
| Cards | 24px | `--radius-cards` |
| Badges | 12.8px | `--radius-badges` |
| Inputs | 12.8px | `--radius-inputs` |
| Buttons | 9999px (pill) | `--radius-buttons` |

### 5.3 Shadows

Parker avoids shadows as default. Elevation via color contrast.
Single token: `rgba(0, 0, 0, 0.1) 0px 2px 10px 0px` — reserved for occasional elevated cards.

---

## 6. Layout System

### 6.1 Breakpoints

| Breakpoint | Target |
|-----------|--------|
| 375px | Small mobile |
| 768px | Tablet |
| 1024px | Laptop |
| 1440px | Desktop large |

### 6.2 Layout Constants

- **Page max-width:** 1200px
- **Section gap:** 64-80px
- **Card padding:** 24px
- **Element gap:** 8-16px
- **Grid:** 12-column, 24px gutters

### 6.3 Navigation

#### Desktop
- Sidebar kiri tetap (Electric Blue active state)
- Header tipis di atas content area
- Ghost pill button untuk secondary actions

#### Mobile
- Bottom navigation max 5 items
- Pill-shaped active indicators
- Primary actions mudah dijangkau jempol

### 6.4 Page Rhythm

Sections alternate between white canvas and parchment soft surfaces to create vertical rhythm without visual dividers.

---

## 7. Page-Level UX Guidance

### 7.1 Dashboard
- Summary stat blocks: Total Piutang, Omzet (Lunas) bulan ini, Laba HL (Lunas) bulan ini
- Bonus pending notification (customer dengan bonus available)
- Recent Bon list (5 terakhir)
- Quick action: "Buat Bon Baru"
- Empty state with CTA jika belum ada data

### 7.2 Customers
- Tabel: nama, diskon LM, diskon BR, bonus threshold, status
- Create/Edit dialog dengan tab LM/BR untuk discount steps
- Soft-delete confirmation

### 7.3 Products
- Tabel: nama, tipe (LM/BR badge), harga base
- Harga modal hanya terlihat di detail/edit form (tidak customer-facing)
- Soft-delete confirmation

### 7.4 Bons (Invoice List)
- Tabel: nomor bon, tanggal, customer, status badge (piutang=orange, lunas=blue), total owed, bonus flag
- Filter pills: status, customer, tanggal range
- Quick search by nomor bon

### 7.5 Bon Detail / Create
- Clean form layout:
  - Top: tanggal, nomor bon, customer dropdown
  - Middle: line items table (product, qty, type, discounted price)
  - Bottom: ongkir, deskripsi, bonus toggle
  - Right panel: calculation summary (omzet, ongkir, total owed, laba)
- Edit/Delete/Lunas action buttons

### 7.6 Customer Detail
- Header: customer name, bonus status badge
- Month/Year selector
- Transaction list grouped by month
- Monthly totals panel: Piutang, sudah dibayar, Omzet (LM/BR/Total), Laba
- "Sudah Lunas" bulk settle button
- Download PDF buttons

### 7.7 Recap / Reporting
- Three tabs: Per Customer, Per Tipe, Overall
- Month/Year filter
- Summary stats + LM vs BR breakdown
- Export PDF button

### 7.8 Settings
- Profile section (single user)
- Logout section (destructive)

---

## 8. Component Specifications

### 8.1 Primary Pill Button
- Electric Blue `#5196fe` fill
- White text
- 9999px border-radius
- 16px 24px padding
- Inter 500 at 16px
- Used for dominant action per page

### 8.2 Ember CTA Button
- Ember Orange `#f9754e` fill
- White text
- 9999px border-radius
- Used at most once per page for critical conversion (e.g., "Sudah Lunas" bulk settle)

### 8.3 Ghost Pill Button
- Transparent fill
- Ink Black `#1b1d20` 1px border
- Ink Black text
- 9999px border-radius
- Used for secondary nav actions

### 8.4 Input
- White fill
- Fog `#a3a3a3` 1px border (resting)
- Electric Blue `#5196fe` border on focus
- 12.8px border-radius
- 16px vertical padding
- Inter 400 at 16px

### 8.5 Card
- White fill OR Parchment `#f2f1ec` for soft variant
- 24px border-radius
- 24px padding
- No shadow by default — lift by color contrast

### 8.6 Badge / Tag
- Ink Black `#1b1d20` fill with white text (default)
- Electric Blue fill for "Lunas" status
- Ember Orange fill for "Piutang" status
- 12.8px border-radius
- 8px 12px padding
- Inter 500 at 14px

### 8.7 Stat Block
- Inter 700 at 32-48px, Ink Black, tight -0.06em tracking
- Caption below in Inter 400 at 14px, Steel
- Arranged in rows, separated by thin vertical dividers (Sand)

### 8.8 Progress Bar
- Pill shape (9999px radius)
- Electric Blue fill for bonus accumulation
- Ember Orange fill for warnings
- Parchment background track

### 8.9 Table
- Clean borders, no heavy gridlines
- Header: Steel text, uppercase tracking
- Rows: alternating white/parchment for readability
- Numeric columns: right-aligned, tabular figures
- Action column: right side, icon buttons

---

## 9. Accessibility Rules

### Wajib:
- Kontras teks minimal 4.5:1
- Keyboard navigation penuh
- Focus ring: Electric Blue 2px outline
- Screen reader label untuk icon-only button
- Heading hierarchy benar (h1→h6 sequential)
- Form error pakai `role="alert"` atau `aria-live`
- Touch target min 44×44px

### Jangan:
- Menghilangkan outline focus
- Menggunakan warna sebagai satu-satunya indikator (misal: status piutang/lunas harus punya teks + warna)
- Menandarkan interaksi penting hanya pada hover

---

## 10. Motion & Interaction

- Microinteraction 150–300ms
- Transform/opacity only, no width/height animation
- Hover dan focus state harus terlihat jelas
- Press state jangan menggeser layout
- Hormati `prefers-reduced-motion`

---

## 11. Iconography

**Lucide React** — consistent stroke style, systematic sizing.

| Page | Icon |
|------|------|
| Dashboard | `LayoutDashboard` |
| Customers | `Users` |
| Products | `Package` |
| Bons | `ReceiptText` |
| Recap | `BarChart3` |
| Settings | `Settings` |

---

## 12. Design Tokens (Tailwind v4 @theme)

```css
@theme {
  /* Colors */
  --color-electric-blue: #5196fe;
  --color-ember-orange: #f9754e;
  --color-ink-black: #1b1d20;
  --color-midnight: #101828;
  --color-paper-white: #ffffff;
  --color-parchment: #f2f1ec;
  --color-sand: #e1dfd8;
  --color-graphite: #27272a;
  --color-steel: #6e6e6e;
  --color-ash: #797876;
  --color-fog: #a3a3a3;

  /* Typography */
  --font-inter: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-gambetta: 'Gambetta', ui-serif, Georgia, serif;

  /* Radius */
  --radius-cards: 24px;
  --radius-badges: 12.8px;
  --radius-inputs: 12.8px;
  --radius-buttons: 9999px;

  /* Shadows */
  --shadow-md: rgba(0, 0, 0, 0.1) 0px 2px 10px 0px;
}
```

---

## 13. Similar Brands (Reference)

- **Brex** — Blue-dominant fintech, pill buttons, colored feature sections
- **Ramp** — Tight sans-serif tracking, generous card radii, single accent
- **Mercury** — Warm-neutral surfaces, minimal iconography, product-card-as-hero
- **Pipe** — Gradient on product card, electric blue brand, dual-typeface display

---

## 14. Tools & Skills for Design Work

| Need | Tool/Skill |
|------|------------|
| UI design direction | Skill `ui-ux-pro-max` |
| New UI component | MCP `21st_magic_component_builder` |
| Improve/refine component | MCP `21st_magic_component_refiner` |
| Inspiration/reference | MCP `21st_magic_component_inspiration` |
| Logo asset | MCP `logo_search` |
| Screenshot → artifact | MCP `ui_to_artifact` |
| UI comparison/QA | MCP `ui_diff_check` |
| Up-to-date tech docs | Skill `context7-mcp` |
