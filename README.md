# Laxico Advertising

Production-grade outdoor and billboard advertising platform with integrated Admin Control Tower CMS.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, FontAwesome, Leaflet
- **Database & Storage**: Dual support for Supabase (PostgreSQL) and MySQL 8.0 with offline LocalStorage fallback
- **Admin Portal**: Accessible via `/admin` (or `/lexico`)

## Environment Variables (.env)
Copy `.env.example` to `.env` and configure your credentials:

```env
# Admin Credentials (Required)
VITE_ADMIN_USER=your_admin_username
VITE_ADMIN_PASS=your_secure_password

# Supabase (Optional)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Running Locally
```bash
npm install
npm run dev
```

## Database Setup
- **MySQL 8.0+**: See [`mysql/`](./mysql) for complete DDL and seed data.
- **Supabase / PostgreSQL**: See [`supabase/`](./supabase) for RLS policies, storage bucket, and SQL schema.

## Build & Deploy
```bash
npm run build
```
Deploy the generated `dist/` folder to Vercel, Netlify, or any static host.


