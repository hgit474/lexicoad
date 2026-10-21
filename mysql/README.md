# Laxico Advertising — MySQL 8.0 Database

This directory contains the production-ready relational database schema and seed dataset for MySQL 8.0+.

## Files
- `schema.sql`: Complete MySQL 8.0 DDL (InnoDB, `utf8mb4_unicode_ci`) creating all 8 relational tables with foreign key constraints, indexes, and seed records.

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
Run in terminal or import via MySQL Workbench / phpMyAdmin:

```bash
mysql -u <username> -p <database_name> < mysql/schema.sql
```
