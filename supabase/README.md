# Laxico Advertising — Supabase Database

This directory contains the production-ready PostgreSQL schema and seed dataset for Supabase.

## Files
- `schema.sql`: Complete PostgreSQL DDL creating all 8 tables, Row Level Security (RLS) policies, storage buckets for media uploads, and seed records.

## Database Tables
1. `site_settings`: CMS metadata, brand details, contact numbers, and office locations.
2. `media_genres`: The 12 media channels (Cinema, Airport, Transit, DOOH, Outdoor, Retail, etc.).
3. `services`: Media formats with audience metrics, footfall benchmarks, min spend thresholds, and rates.
4. `locations`: Prime hoarding and digital screen sites across metros with verified impressions.
5. `service_locations`: Pivot table managing Many-to-Many associations between services and locations.
6. `clients`: Brand advertiser accounts and agency points of contact.
7. `campaigns`: Active, scheduled, and completed placements with proof photo URLs and budgets.
8. `inquiries`: Inbound lead generation pipeline with status stages and follow-up tracking.
9. `media`: Creative assets, showcase photos, and campaign verification proofs.

## How to Import
1. Open your Supabase dashboard at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor**.
3. Paste the contents of `supabase/schema.sql` and click **Run**.
4. Copy your Project URL and anon public key into `.env` or configure them dynamically in **Admin Control Tower → CMS & Settings**.
