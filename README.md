# lexicoad — Laxico Advertising

Production-grade outdoor and billboard advertising platform with integrated Admin Control Tower CMS.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Leaflet
- **Backend & CMS**: Supabase (PostgreSQL) with automatic LocalStorage dual-mode fallback
- **Admin Portal**: Restricted route at `/lexico`

## Environment Variables (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_CREDS=user1:pass1,user2:pass2
```

## Running Locally
```bash
npm install
npm run dev
```

## Admin Control Tower
- **URL**: `/lexico`
- **Default Login**: Configured via `VITE_ADMIN_CREDS` environment variable.

## Build & Deploy for Production
```bash
npm run build
```
Deploy the generated `dist/` directory to Vercel connected to your GitHub repo (`xngdinesh/lexicoad`).

