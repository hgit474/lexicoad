# Laxico Advertising

> Production-grade full-stack outdoor advertising (OOH/DOOH) media platform with integrated Admin Control Tower CMS.

Live domains:
- **Global / Primary**: [lexicoadvertising.com](https://lexicoadvertising.com)
- **India Regional**: [lexicoadvertising.in](https://lexicoadvertising.in)
- **Corporate & Trust**: [lexicoadvertising.org](https://lexicoadvertising.org)

---

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, FontAwesome 6, Leaflet
- **Database & Storage**: Dual architecture — Supabase (PostgreSQL with RLS) & MySQL 8.0, with offline LocalStorage fallback
- **Admin Portal**: Accessible via `/admin` (or disguised route `/lexico`)
- **SEO & AI**: Multi-domain XML sitemaps, bidirectional `hreflang`, Schema.org JSON-LD `@graph`, and standard `/llms.txt`

---

## Deploying on Vercel

### Step 1: Import Project
1. Push this repository to GitHub/GitLab.
2. Log in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import this repository.
4. Framework Preset: **Vite**
5. Root Directory: `./` (or `lexicoad` if deployed from a mono-repo)
6. Build Command: `npm run build`
7. Output Directory: `dist`

### Step 2: Configure Environment Variables in Vercel
Under **Project Settings → Environment Variables**, add the following keys for `Production`, `Preview`, and `Development`:

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_ADMIN_USER` | **Yes** | Admin dashboard username | `admin` |
| `VITE_ADMIN_PASS` | **Yes** | Admin dashboard secure password | `YourSecurePassword123` |
| `VITE_ADMIN_CREDS` | Optional | Multi-admin `user:pass` pairs | `dinesh:pass1,manager:pass2` |
| `VITE_SUPABASE_URL` | Optional | Supabase PostgreSQL project URL | `https://xyzcompany.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Optional | Supabase anon public API key | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |
| `VITE_SITE_URL` | Optional | Canonical primary domain (defaults to .com) | `https://lexicoadvertising.com` |
| `VITE_IN_SITE_URL` | Optional | Regional India domain | `https://lexicoadvertising.in` |
| `VITE_ORG_SITE_URL` | Optional | Corporate / Org domain | `https://lexicoadvertising.org` |

> [!NOTE]
> All credentials and backend settings can also be updated or overridden dynamically inside the application via **Admin Control Tower → CMS & Settings**.

---

## Local Development Setup

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/xngdinesh/lexicoad.git
   cd lexicoad
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your desired admin credentials and optional Supabase keys.

3. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Production Build**:
   ```bash
   npm run build
   ```
   Generates optimized bundle in `dist/` with auto-generated multi-domain XML sitemaps.

---

## Database Architecture

Laxico functions out of the box with resilient client-side storage, and provides turnkey production database schemas:

### Supabase / PostgreSQL (Cloud)
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run [`supabase/schema.sql`](./supabase/schema.sql).
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel or your local `.env`.

### MySQL 8.0+ (Self-Hosted / RDS / VPS)
1. Run [`mysql/schema.sql`](./mysql/schema.sql) in MySQL Workbench, phpMyAdmin, or terminal:
   ```bash
   mysql -u root -p database_name < mysql/schema.sql
   ```
2. Export live database dumps directly from **Admin Topbar → Export DB**.

---

## Admin Portal & Credentials
- **Access Route**: Navigate to `/admin` or `/lexico` (or click "Admin Login" in footer).
- **Features**:
  - Service Inventory CRUD & Media Uploads
  - Locations Manager & Interactive Leaflet Geo-Map
  - Live Campaign Tracking with Photo Verification
  - Inquiries CRM & Follow-Up Stage Pipeline
  - Excel Bulk Listing Import/Export (`.xlsx`)
  - CMS Branding, Favicon, Hero Carousel, and SEO Meta Management

---

## LLM & AI Search Optimization
- AI agents and search bots can retrieve structured, verified media specs, pricing, and campaign workflows via [`/llms.txt`](https://lexicoadvertising.com/llms.txt).
