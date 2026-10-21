-- ==============================================================================
-- Laxico Advertising - Billboard & Poster Placements Database Schema (Supabase)
-- Full CMS Support: site_settings, services, locations, campaigns, inquiries, media
-- ==============================================================================

-- 1. SITE_SETTINGS TABLE (Full CMS: Logo, Favicon, Name, Phone, Email, etc.)
CREATE TABLE IF NOT EXISTS site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    site_name VARCHAR(255) NOT NULL DEFAULT 'Laxico Advertising',
    tagline TEXT DEFAULT 'Billboard & Poster Placements Across India',
    featured_brands TEXT DEFAULT 'NIKE, ZOMATO, SAMSUNG, HDFC BANK, COCA-COLA, AMAZON, TATA, SWIGGY, BOAT, MYNTRA',
    brand_subtitle VARCHAR(255) DEFAULT 'OUTDOOR • TRANSIT • DIGITAL',
    logo_text VARCHAR(50) DEFAULT 'LAXICO',
    logo_subtext VARCHAR(50) DEFAULT 'ADVERTISING',
    logo_badge VARCHAR(10) DEFAULT 'L',
    logo_url TEXT DEFAULT '',
    favicon_url TEXT DEFAULT '',
    meta_title TEXT DEFAULT 'Laxico Advertising — Billboard & Poster Placements Across India',
    meta_description TEXT DEFAULT 'Laxico Advertising manages 250+ premium billboard & poster placements across metros, airports, highways and malls in India.',
    phone VARCHAR(50) DEFAULT '9742313705',
    phone_alt VARCHAR(50) DEFAULT '9742313705',
    whatsapp VARCHAR(50) DEFAULT '9742313705',
    email VARCHAR(255) DEFAULT 'lexicoadvertising@gmail.com',
    email_sales VARCHAR(255) DEFAULT 'lexicoadvertising@gmail.com',
    udyam_number VARCHAR(100) DEFAULT 'UDYAM-KR-03-0664055',
    gst_number VARCHAR(100) DEFAULT '29CTIPS2521P1ZZ',
    about_label TEXT DEFAULT 'Since 2025',
    about_title TEXT DEFAULT 'About Laxico & Contact',
    about_description TEXT DEFAULT 'From 3 billboards on NH-8 to India''s most data-driven outdoor network — we blend prime media ownership with performance tracking every CMO loves.',
    about_years TEXT DEFAULT '16+',
    about_team_count TEXT DEFAULT '40+',
    about_ad_spend TEXT DEFAULT '₹120Cr',
    about_mission TEXT DEFAULT 'Make outdoor advertising as measurable and effortless as digital — with verified footfall, transparent pricing and photo-proof of every display.',
    about_vision TEXT DEFAULT 'A Laxico screen within 10 minutes of every urban Indian — powering local businesses and national brands alike across 50 cities by 2030.',
    about_retention_title TEXT DEFAULT 'Why clients stay',
    about_retention_description TEXT DEFAULT '98% retention. Single-point ownership, in-house printing, night monitoring patrols and a client dashboard with live display photos.',
    about_image_1 TEXT DEFAULT '',
    about_image_2 TEXT DEFAULT '',
    about_timeline JSONB DEFAULT '[]'::jsonb,
    about_team JSONB DEFAULT '[]'::jsonb,
    contact_label TEXT DEFAULT 'Get a quote',
    contact_title TEXT DEFAULT 'Contact / Inquiry',
    contact_description TEXT DEFAULT 'Select your service & location. Our strategist replies with photos, footfall & pricing within 4 working hours.',
    contact_response_title TEXT DEFAULT '4-hr response',
    contact_approved_title TEXT DEFAULT '100% Approved',
    contact_faqs JSONB DEFAULT '[]'::jsonb,
    support_hours VARCHAR(100) DEFAULT 'Mon–Sat • 10:00 AM – 7:00 PM IST',
    head_office TEXT DEFAULT 'No 1 Nandini Complex, Chandra Layout, Bangalore — 560040',
    office_mumbai TEXT DEFAULT 'BKC Office, Bandra Kurla Complex, Mumbai — 400051',
    office_bengaluru TEXT DEFAULT 'HSR Office, Sector 1, HSR Layout, Bengaluru — 560102',
    map_link TEXT DEFAULT 'https://maps.google.com/?q=No+1+Nandini+Complex+Chandra+Layout+Bangalore+560040',
    cities VARCHAR(255) DEFAULT 'Delhi • Mumbai • Bengaluru • Hyderabad',
    active_sites_count VARCHAR(20) DEFAULT '248',
    campaigns_count INTEGER DEFAULT 1250,
    locations_count INTEGER DEFAULT 248,
    retention_rate INTEGER DEFAULT 98,
    social_links JSONB DEFAULT '{"facebook": "https://facebook.com", "instagram": "https://instagram.com", "twitter": "https://twitter.com", "youtube": "https://youtube.com"}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS featured_brands TEXT DEFAULT 'NIKE, ZOMATO, SAMSUNG, HDFC BANK, COCA-COLA, AMAZON, TATA, SWIGGY, BOAT, MYNTRA';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50) DEFAULT '9742313705';
ALTER TABLE site_settings ALTER COLUMN phone SET DEFAULT '9742313705';
ALTER TABLE site_settings ALTER COLUMN phone_alt SET DEFAULT '9742313705';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS udyam_number VARCHAR(100) DEFAULT 'UDYAM-KR-03-0664055';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS gst_number VARCHAR(100) DEFAULT '29CTIPS2521P1ZZ';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_label TEXT DEFAULT 'Since 2025';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_title TEXT DEFAULT 'About Laxico & Contact';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_description TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_years TEXT DEFAULT '16+';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_team_count TEXT DEFAULT '40+';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_ad_spend TEXT DEFAULT '₹120Cr';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_mission TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_vision TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_retention_title TEXT DEFAULT 'Why clients stay';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_retention_description TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_image_1 TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_image_2 TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_timeline JSONB DEFAULT '[]'::jsonb;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_team JSONB DEFAULT '[]'::jsonb;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_label TEXT DEFAULT 'Get a quote';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_title TEXT DEFAULT 'Contact / Inquiry';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_description TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_response_title TEXT DEFAULT '4-hr response';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_approved_title TEXT DEFAULT '100% Approved';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_faqs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS map_link TEXT DEFAULT 'https://maps.google.com/?q=No+1+Nandini+Complex+Chandra+Layout+Bangalore+560040';

-- 2. SERVICES TABLE
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- Transit, Outdoor, Airport, Retail, Digital, Street Furniture
    cities TEXT DEFAULT '', -- Comma-separated cities where this service is available
    price INTEGER NOT NULL DEFAULT 45000,
    rating NUMERIC(3, 1) DEFAULT 4.7,
    popularity INTEGER DEFAULT 80,
    status VARCHAR(50) DEFAULT 'Active', -- Active, Inactive
    dims VARCHAR(150) DEFAULT '20 × 10 ft • Backlit',
    durations TEXT DEFAULT '1 Week, 2 Weeks, 1 Month, 3 Months, 6 Months, 12 Months',
    lead_time VARCHAR(150) DEFAULT '48 hours + print',
    lighting VARCHAR(255) DEFAULT 'Front-lit / Backlit, dusk–11pm',
    print_spec VARCHAR(255) DEFAULT '720 DPI flex / vinyl, weatherproof',
    reporting VARCHAR(255) DEFAULT 'Weekly geo-tagged photos',
    inquiry_process TEXT DEFAULT 'Call within 4 working hours|Quote + media plan|Go live in 48 hrs',
    image TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE services ADD COLUMN IF NOT EXISTS cities TEXT DEFAULT '';
ALTER TABLE services ADD COLUMN IF NOT EXISTS lead_time VARCHAR(150) DEFAULT '48 hours + print';
ALTER TABLE services ADD COLUMN IF NOT EXISTS lighting VARCHAR(255) DEFAULT 'Front-lit / Backlit, dusk–11pm';
ALTER TABLE services ADD COLUMN IF NOT EXISTS print_spec VARCHAR(255) DEFAULT '720 DPI flex / vinyl, weatherproof';
ALTER TABLE services ADD COLUMN IF NOT EXISTS reporting VARCHAR(255) DEFAULT 'Weekly geo-tagged photos';
ALTER TABLE services ADD COLUMN IF NOT EXISTS inquiry_process TEXT DEFAULT 'Call within 4 working hours|Quote + media plan|Go live in 48 hrs';

-- 3. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    zone VARCHAR(50) DEFAULT 'Central', -- North, South, East, West, Central
    footfall INTEGER DEFAULT 100000,
    size VARCHAR(100) DEFAULT 'Standard',
    status VARCHAR(50) DEFAULT 'Available', -- Available, Occupied, Maintenance
    image TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SERVICE_LOCATIONS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS service_locations (
    id TEXT PRIMARY KEY,
    service_id TEXT REFERENCES services(id) ON DELETE CASCADE,
    location_id TEXT REFERENCES locations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CAMPAIGNS TABLE (PLACEMENTS)
CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    client VARCHAR(255) NOT NULL,
    service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
    location_id TEXT REFERENCES locations(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget INTEGER DEFAULT 100000,
    status VARCHAR(50) DEFAULT 'Scheduled', -- Live, Scheduled, Paused, Completed
    artwork TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. INQUIRIES TABLE (LEAD PIPELINE)
CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255) DEFAULT '—',
    service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
    location_id TEXT REFERENCES locations(id) ON DELETE SET NULL,
    duration VARCHAR(50) DEFAULT '1 Month',
    budget VARCHAR(100) DEFAULT '₹50K – ₹2L',
    message TEXT,
    stage VARCHAR(50) DEFAULT 'New', -- New, Contacted, Quoted, Converted, Closed
    date DATE DEFAULT CURRENT_DATE,
    followup VARCHAR(50) DEFAULT '—',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. MEDIA LIBRARY TABLE
CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tag VARCHAR(100) DEFAULT 'Showcase',
    service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 9. PUBLIC IMAGE STORAGE (used by the Admin upload controls)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-media', 'site-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read site media" ON storage.objects;
DROP POLICY IF EXISTS "Public upload site media" ON storage.objects;
DROP POLICY IF EXISTS "Public update site media" ON storage.objects;
DROP POLICY IF EXISTS "Public delete site media" ON storage.objects;
CREATE POLICY "Public read site media" ON storage.objects FOR SELECT
USING (bucket_id = 'site-media');

CREATE POLICY "Public upload site media" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'site-media');

CREATE POLICY "Public update site media" ON storage.objects FOR UPDATE
USING (bucket_id = 'site-media') WITH CHECK (bucket_id = 'site-media');

CREATE POLICY "Public delete site media" ON storage.objects FOR DELETE
USING (bucket_id = 'site-media');

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Open policies for demo and admin operations
DROP POLICY IF EXISTS "Public read site_settings" ON site_settings;
DROP POLICY IF EXISTS "Public write site_settings" ON site_settings;
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public write site_settings" ON site_settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read services" ON services;
DROP POLICY IF EXISTS "Public write services" ON services;
CREATE POLICY "Public read services" ON services FOR SELECT USING (true);
CREATE POLICY "Public write services" ON services FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read locations" ON locations;
DROP POLICY IF EXISTS "Public write locations" ON locations;
CREATE POLICY "Public read locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Public write locations" ON locations FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read service_locations" ON service_locations;
DROP POLICY IF EXISTS "Public write service_locations" ON service_locations;
CREATE POLICY "Public read service_locations" ON service_locations FOR SELECT USING (true);
CREATE POLICY "Public write service_locations" ON service_locations FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read clients" ON clients;
DROP POLICY IF EXISTS "Public write clients" ON clients;
CREATE POLICY "Public read clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Public write clients" ON clients FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read campaigns" ON campaigns;
DROP POLICY IF EXISTS "Public write campaigns" ON campaigns;
CREATE POLICY "Public read campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Public write campaigns" ON campaigns FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read inquiries" ON inquiries;
DROP POLICY IF EXISTS "Public write inquiries" ON inquiries;
CREATE POLICY "Public read inquiries" ON inquiries FOR SELECT USING (true);
CREATE POLICY "Public write inquiries" ON inquiries FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read media" ON media;
DROP POLICY IF EXISTS "Public write media" ON media;
CREATE POLICY "Public read media" ON media FOR SELECT USING (true);
CREATE POLICY "Public write media" ON media FOR ALL USING (true);


INSERT INTO site_settings (id, site_name, tagline, brand_subtitle, logo_text, logo_badge, logo_url, favicon_url, phone, phone_alt, whatsapp, email, email_sales, udyam_number, gst_number, about_label, head_office, office_mumbai, office_bengaluru, map_link, cities, active_sites_count, campaigns_count, locations_count, retention_rate)
VALUES ('default', 'Laxico Advertising', 'Billboard & Poster Placements Across India', 'OUTDOOR • TRANSIT • DIGITAL', 'LAXICO', 'L', '/logo.png', '/logo.png', '9742313705', '9742313705', '9742313705', 'lexicoadvertising@gmail.com', 'lexicoadvertising@gmail.com', 'UDYAM-KR-03-0664055', '29CTIPS2521P1ZZ', 'Since 2025', 'No 1 Nandini Complex, Chandra Layout, Bangalore 560040', 'BKC Office, Bandra Kurla Complex, Mumbai — 400051', 'HSR Office, Sector 1, HSR Layout, Bengaluru — 560102', 'https://maps.google.com/?q=No+1+Nandini+Complex+Chandra+Layout+Bangalore+560040', 'Delhi • Mumbai • Bengaluru • Hyderabad', '248', 1250, 248, 98)
ON CONFLICT (id) DO NOTHING;
INSERT INTO services (id, name, type, price, rating, popularity, status, dims, durations, image, description) VALUES
('svc_metro', 'Metro Station Ads', 'Transit', 45000, 4.9, 98, 'Active', '20 × 10 ft • Backlit + Digital', '1 Week, 2 Weeks, 1 Month, 3 Months, 6 Months, 12 Months', 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800&auto=format&fit=crop', 'Dominate concourses, platforms, entry gates and ticket counters across DMRC & metro networks. Backlit boxes, platform screen doors, staircase wraps and train-wrap options with 2.5L+ daily footfall per hub.'),
('svc_bus', 'Bus Shelter Posters', 'Transit', 18000, 4.7, 86, 'Active', '6 × 4 ft • Backlit Mupi', '2 Weeks, 1 Month, 3 Months, 6 Months', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop', 'Street-level frequency across high-traffic bus queue shelters. Backlit mupis with eye-level dwell time of 4–8 minutes. Sold in clusters of 6/12/25 shelters for city-wide coverage.'),
('svc_airport', 'Airport Banners', 'Airport', 95000, 4.9, 92, 'Active', '30 × 12 ft • Arrival + Departure', '1 Month, 3 Months, 6 Months, 12 Months', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop', 'Premium arrival, departure and baggage-belt banners at T3, T2 and leading airports. Reach affluent flyers with 90k+ daily passengers and 12-min average dwell.'),
('svc_highway', 'Highway Billboards', 'Outdoor', 75000, 4.8, 95, 'Active', '48 × 20 ft • Front-lit Unipole', '1 Month, 3 Months, 6 Months, 12 Months', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop', 'Iconic large-format unipoles on NH-48, Eastern Expressway, Yamuna Expressway and city gateways. Night front-lit, 1M+ vehicular impressions weekly per site.'),
('svc_mall', 'Mall Atrium Displays', 'Retail', 55000, 4.6, 80, 'Active', 'Custom • Atrium + Facade', '1 Week, 2 Weeks, 1 Month, 3 Months', 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800&auto=format&fit=crop', 'Atrium hangings, facade glow-signs, food-court table wraps and entrance totems in top malls. Perfect for launches, festive sales and D2C sampling.'),
('svc_railway', 'Railway Station Hoardings', 'Transit', 62000, 4.7, 84, 'Active', '40 × 20 ft • Concourse + FOB', '1 Month, 3 Months, 6 Months, 12 Months', 'https://images.unsplash.com/photo-1565019011521-b0575cbb57c8?q=80&w=800&auto=format&fit=crop', 'Concourse hoardings, foot-over-bridge panels and platform boards at CST, New Delhi, Howrah & 20+ A1 stations. 4L+ daily footfall, unmatched for mass FMCG.'),
('svc_pole', 'Street Pole Kiosks', 'Street Furniture', 12000, 4.5, 74, 'Active', '8 × 4 ft • Double-sided, Backlit', '1 Month, 3 Months, 6 Months', 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=800&auto=format&fit=crop', 'Double-sided backlit kiosks on arterial lamp posts. Hyperlocal domination — ideal for real-estate, retail openings, coaching and clinics. Min. 20 poles.'),
('svc_led', 'Corporate Park Digital Screens', 'Digital', 88000, 4.9, 90, 'Active', 'P6 LED • 15-sec loop, 120 plays/day', '1 Week, 2 Weeks, 1 Month, 3 Months', 'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=800&auto=format&fit=crop', 'Programmatic-grade LED walls at Cyber City, BKC, Hitech City & Whitefield. Day-parting, live data feeds and instant creative swaps. 120 spots/day guaranteed.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO locations (id, name, city, zone, footfall, size, status, image) VALUES
('loc_1', 'Central Metro Hub — Concourse', 'New Delhi', 'Central', 250000, '20 × 10 ft Backlit ×6', 'Occupied', 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800&auto=format&fit=crop'),
('loc_2', 'Airport T3 Arrival Corridor', 'New Delhi', 'South', 92000, '30 × 12 ft Banner ×4', 'Occupied', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop'),
('loc_3', 'NH-48 Unipole — Cyber City Cut', 'Gurugram', 'South', 180000, '48 × 20 ft Unipole', 'Occupied', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop'),
('loc_4', 'MG Road Bus Shelters (12 Units)', 'Bengaluru', 'Central', 85000, '6 × 4 ft Mupi ×12', 'Available', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop'),
('loc_5', 'Phoenix Mall — Grand Atrium', 'Mumbai', 'West', 65000, 'Atrium + Facade', 'Available', 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800&auto=format&fit=crop'),
('loc_6', 'CST Concourse Hoarding Wall', 'Mumbai', 'South', 410000, '40 × 20 ft ×3', 'Occupied', 'https://images.unsplash.com/photo-1565019011521-b0575cbb57c8?q=80&w=800&auto=format&fit=crop'),
('loc_7', 'Cyber Hub LED Wall', 'Gurugram', 'South', 48000, 'P6 LED 24×12 ft', 'Occupied', 'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=800&auto=format&fit=crop'),
('loc_8', 'Marine Drive Pole Cluster (24)', 'Mumbai', 'South', 120000, '8×4 ft ×24 poles', 'Available', 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=800&auto=format&fit=crop'),
('loc_9', 'Rajiv Chowk Metro Gates', 'New Delhi', 'Central', 320000, 'Gate wraps + PSD', 'Occupied', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800&auto=format&fit=crop'),
('loc_10', 'Hitech City LED — Madhapur', 'Hyderabad', 'West', 55000, 'P6 LED 20×10 ft', 'Available', 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?q=80&w=800&auto=format&fit=crop'),
('loc_11', 'Yamuna Expressway Gantry', 'Noida', 'East', 95000, '60 × 15 ft Gantry', 'Available', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop'),
('loc_12', 'Airport Express Metro — Pillars', 'New Delhi', 'South', 110000, 'Pillar wraps ×18', 'Maintenance', 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800&auto=format&fit=crop')
ON CONFLICT (id) DO NOTHING;

INSERT INTO service_locations (id, service_id, location_id) VALUES
('sl1', 'svc_metro', 'loc_1'),
('sl2', 'svc_metro', 'loc_9'),
('sl3', 'svc_metro', 'loc_12'),
('sl4', 'svc_bus', 'loc_4'),
('sl5', 'svc_bus', 'loc_8'),
('sl6', 'svc_airport', 'loc_2'),
('sl7', 'svc_highway', 'loc_3'),
('sl8', 'svc_highway', 'loc_11'),
('sl9', 'svc_mall', 'loc_5'),
('sl10', 'svc_railway', 'loc_6'),
('sl11', 'svc_led', 'loc_7'),
('sl12', 'svc_led', 'loc_10'),
('sl13', 'svc_pole', 'loc_8'),
('sl14', 'svc_pole', 'loc_4')
ON CONFLICT (id) DO NOTHING;

INSERT INTO clients (id, name, contact, phone, email) VALUES
('cl1', 'Nike India', 'Rohan Mehta', '+91 98200 11223', 'rohan@nike.in'),
('cl2', 'Zomato', 'Ananya Rao', '+91 99301 44556', 'ananya@zomato.com'),
('cl3', 'Samsung India', 'Vikram Iyer', '+91 98111 77889', 'vikram@samsung.in'),
('cl4', 'HDFC Bank', 'Kavya Nair', '+91 98450 22334', 'kavya@hdfc.in'),
('cl5', 'Coca-Cola', 'Arjun Kapoor', '+91 98100 99001', 'arjun@coke.in')
ON CONFLICT (id) DO NOTHING;

INSERT INTO campaigns (id, title, client, service_id, location_id, start_date, end_date, budget, status, artwork, notes) VALUES
('cp1', 'Nike — Just Do It Takeover', 'Nike India', 'svc_highway', 'loc_3', '2026-08-01', '2026-11-01', 680000, 'Live', 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?q=80&w=800&auto=format&fit=crop', 'Front-lit unipole + night patrol'),
('cp2', 'Zomato Feast Fest — Metro Domination', 'Zomato', 'svc_metro', 'loc_1', '2026-08-15', '2026-10-15', 420000, 'Live', 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800&auto=format&fit=crop', 'Concourse + gate wraps'),
('cp3', 'Galaxy Z Fold — Airport Arrival', 'Samsung India', 'svc_airport', 'loc_2', '2026-09-01', '2026-12-01', 890000, 'Live', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop', 'T3 arrival + baggage belt'),
('cp4', 'HDFC Millennia — Railway Concourse', 'HDFC Bank', 'svc_railway', 'loc_6', '2026-07-10', '2026-09-10', 310000, 'Completed', 'https://images.unsplash.com/photo-1565019011521-b0575cbb57c8?q=80&w=800&auto=format&fit=crop', 'FOB panels + concourse'),
('cp5', 'Coke Summer — Cyber Hub LED', 'Coca-Cola', 'svc_led', 'loc_7', '2026-09-10', '2026-10-10', 260000, 'Live', 'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=800&auto=format&fit=crop', '120 plays/day, day-parted'),
('cp6', 'Phoenix Fest — Atrium Launch', 'Zomato', 'svc_mall', 'loc_5', '2026-10-05', '2026-10-20', 180000, 'Scheduled', 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800&auto=format&fit=crop', 'Atrium + sampling kiosk'),
('cp7', 'Bus Shelter — Fintech Pilot', 'HDFC Bank', 'svc_bus', 'loc_4', '2026-09-20', '2026-11-20', 145000, 'Scheduled', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop', '12 mupis cluster')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inquiries (id, name, phone, email, company, service_id, location_id, duration, budget, message, stage, date, followup) VALUES
('iq1', 'Priya Sharma', '+91 98111 22334', 'priya@d2cbrand.in', 'GlowKart D2C', 'svc_mall', 'loc_5', '1 Month', '₹2L – ₹5L', 'Festive launch in Mumbai malls, need atrium + facade for 3 weeks in Oct.', 'New', '2026-09-10', '2026-09-14'),
('iq2', 'Rahul Verma', '+91 99300 11223', 'rahul@realty.in', 'Verma Estates', 'svc_highway', 'loc_3', '3 Months', '₹5L – ₹15L', 'New township on NH-48, need unipole + gantry combo.', 'Quoted', '2026-09-08', '2026-09-13'),
('iq3', 'Sneha Kulkarni', '+91 98450 66778', 'sneha@edtech.in', 'LearnLeap', 'svc_metro', 'loc_9', '6 Months', '₹15L+', 'Admissions season — Rajiv Chowk + Central Hub domination.', 'Contacted', '2026-09-11', '2026-09-15'),
('iq4', 'Amit Patel', '+91 98102 33445', 'amit@finserve.in', 'PaySwift', 'svc_led', 'loc_7', '2 Weeks', '₹50K – ₹2L', 'App launch, need Cyber Hub LED with QR creative.', 'New', '2026-09-12', '2026-09-14'),
('iq5', 'Divya Menon', '+91 97400 55667', 'divya@jewels.in', 'Malabar Jewels', 'svc_airport', 'loc_2', '3 Months', '₹5L – ₹15L', 'Diwali campaign at T3 arrivals.', 'Converted', '2026-09-05', '—')
ON CONFLICT (id) DO NOTHING;

INSERT INTO media (id, title, tag, service_id, url) VALUES
('m1', 'Highway Unipole — Night Glow', 'Highway Billboards', 'svc_highway', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop'),
('m2', 'Metro Concourse Wrap', 'Metro Station Ads', 'svc_metro', 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800&auto=format&fit=crop'),
('m3', 'T3 Arrival Banner', 'Airport Banners', 'svc_airport', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop'),
('m4', 'Bus Shelter Mupi — Day', 'Bus Shelter Posters', 'svc_bus', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop'),
('m5', 'Mall Atrium Launch', 'Mall Atrium Displays', 'svc_mall', 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800&auto=format&fit=crop'),
('m6', 'Railway Concourse Wall', 'Railway Station Hoardings', 'svc_railway', 'https://images.unsplash.com/photo-1565019011521-b0575cbb57c8?q=80&w=800&auto=format&fit=crop'),
('m7', 'Cyber Hub LED — Evening', 'Digital LED', 'svc_led', 'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=800&auto=format&fit=crop'),
('m8', 'City Night Centre', 'Street Pole Kiosks', 'svc_pole', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800&auto=format&fit=crop'),
('m9', 'Times-Style LED Burst', 'Digital LED', 'svc_led', 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?q=80&w=800&auto=format&fit=crop')
ON CONFLICT (id) DO NOTHING;

