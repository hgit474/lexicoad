# lexicoad — Laxico Advertising

Production-grade outdoor and billboard advertising platform with integrated Admin Control Tower CMS.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Leaflet
- **Backend & CMS**: Supabase (PostgreSQL) with automatic LocalStorage dual-mode fallback
- **Admin Portal**: Restricted route at `/lexico`

## Running Locally
```bash
npm install
npm run dev
```

## Admin Control Tower
- **URL**: `/lexico`
- **Username**: `lexicoadmin`
- **Password**: `laxico@4321`

## Build for Production
```bash
npm run build
```
Deploy the generated `dist/` directory to Vercel, Netlify, or your preferred hosting provider.
