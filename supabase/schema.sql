-- ==============================================================================
-- POSTGRESQL PRODUCTION DATABASE (SUPABASE)
-- NOTE: THIS SCRIPT IS WRITTEN IN POSTGRESQL (14+) DIALECT FOR SUPABASE.
-- DO NOT RUN THIS IN MYSQL. (FOR MYSQL, USE mysql/schema.sql).
-- Contains 10 Relational Production Tables, RLS, Storage Buckets & Seed Data.
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
    genre_badges JSONB DEFAULT '{}'::jsonb,
    filter_config JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS filter_config JSONB DEFAULT '{}'::jsonb;
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
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS genre_badges JSONB DEFAULT '{}'::jsonb;

-- 2. MEDIA_GENRES TABLE
CREATE TABLE IF NOT EXISTS media_genres (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    icon VARCHAR(100) NOT NULL,
    tagline VARCHAR(255) DEFAULT '',
    is_popular BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SERVICES TABLE
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- Transit, Outdoor, Airport, Retail, Digital, Street Furniture, Cinema, DOOH
    genre VARCHAR(100) DEFAULT 'Transit',
    sub_type VARCHAR(150) DEFAULT '',
    chain_or_brand VARCHAR(150) DEFAULT '',
    audience_metric VARCHAR(255) DEFAULT '',
    min_spend INTEGER NOT NULL DEFAULT 10000,
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

ALTER TABLE services ADD COLUMN IF NOT EXISTS genre VARCHAR(100) DEFAULT 'Transit';
ALTER TABLE services ADD COLUMN IF NOT EXISTS sub_type VARCHAR(150) DEFAULT '';
ALTER TABLE services ADD COLUMN IF NOT EXISTS chain_or_brand VARCHAR(150) DEFAULT '';
ALTER TABLE services ADD COLUMN IF NOT EXISTS audience_metric VARCHAR(255) DEFAULT '';
ALTER TABLE services ADD COLUMN IF NOT EXISTS min_spend INTEGER DEFAULT 10000;
ALTER TABLE services ADD COLUMN IF NOT EXISTS cities TEXT DEFAULT '';
ALTER TABLE services ADD COLUMN IF NOT EXISTS lead_time VARCHAR(150) DEFAULT '48 hours + print';
ALTER TABLE services ADD COLUMN IF NOT EXISTS lighting VARCHAR(255) DEFAULT 'Front-lit / Backlit, dusk–11pm';
ALTER TABLE services ADD COLUMN IF NOT EXISTS print_spec VARCHAR(255) DEFAULT '720 DPI flex / vinyl, weatherproof';
ALTER TABLE services ADD COLUMN IF NOT EXISTS reporting VARCHAR(255) DEFAULT 'Weekly geo-tagged photos';
ALTER TABLE services ADD COLUMN IF NOT EXISTS inquiry_process TEXT DEFAULT 'Call within 4 working hours|Quote + media plan|Go live in 48 hrs';
ALTER TABLE services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 4. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    zone VARCHAR(50) DEFAULT 'Central', -- North, South, East, West, Central
    footfall INTEGER DEFAULT 100000,
    size VARCHAR(100) DEFAULT 'Standard',
    status VARCHAR(50) DEFAULT 'Available', -- Available, Occupied, Maintenance
    price_mult NUMERIC(4, 2) DEFAULT 1.00,
    lat NUMERIC(10, 8) DEFAULT 28.61390000,
    lng NUMERIC(11, 8) DEFAULT 77.20900000,
    address TEXT DEFAULT '',
    image TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE locations ADD COLUMN IF NOT EXISTS price_mult NUMERIC(4, 2) DEFAULT 1.00;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS lat NUMERIC(10, 8) DEFAULT 28.61390000;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS lng NUMERIC(11, 8) DEFAULT 77.20900000;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';
ALTER TABLE locations ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 5. SERVICE_LOCATIONS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS service_locations (
    id TEXT PRIMARY KEY,
    service_id TEXT REFERENCES services(id) ON DELETE CASCADE,
    location_id TEXT REFERENCES locations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    industry VARCHAR(100) DEFAULT 'Retail',
    logo_url TEXT,
    total_campaigns INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE clients ADD COLUMN IF NOT EXISTS industry VARCHAR(100) DEFAULT 'Retail';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_campaigns INTEGER DEFAULT 1;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 7. CAMPAIGNS TABLE (PLACEMENTS)
CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    client VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
    location_id TEXT REFERENCES locations(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget INTEGER DEFAULT 100000,
    status VARCHAR(50) DEFAULT 'Scheduled', -- Live, Scheduled, Paused, Completed
    artwork TEXT NOT NULL,
    artwork_url TEXT,
    proof_images JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS artwork_url TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS proof_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 8. INQUIRIES TABLE (LEAD PIPELINE)
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
    has_artwork BOOLEAN DEFAULT false,
    message TEXT,
    stage VARCHAR(50) DEFAULT 'New', -- New, Contacted, Quoted, Converted, Closed
    date DATE DEFAULT CURRENT_DATE,
    followup VARCHAR(50) DEFAULT '—',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS has_artwork BOOLEAN DEFAULT false;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS followup VARCHAR(50) DEFAULT '—';
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 9. MEDIA LIBRARY TABLE
CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tag VARCHAR(100) DEFAULT 'Showcase',
    category VARCHAR(100) DEFAULT 'Campaigns',
    caption TEXT,
    service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
    location_id TEXT REFERENCES locations(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE media ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Campaigns';
ALTER TABLE media ADD COLUMN IF NOT EXISTS caption TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS location_id TEXT REFERENCES locations(id) ON DELETE SET NULL;
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
ALTER TABLE media_genres ENABLE ROW LEVEL SECURITY;
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
CREATE POLICY "Public write site_settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read media_genres" ON media_genres;
DROP POLICY IF EXISTS "Public write media_genres" ON media_genres;
CREATE POLICY "Public read media_genres" ON media_genres FOR SELECT USING (true);
CREATE POLICY "Public write media_genres" ON media_genres FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read services" ON services;
DROP POLICY IF EXISTS "Public write services" ON services;
CREATE POLICY "Public read services" ON services FOR SELECT USING (true);
CREATE POLICY "Public write services" ON services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read locations" ON locations;
DROP POLICY IF EXISTS "Public write locations" ON locations;
CREATE POLICY "Public read locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Public write locations" ON locations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read service_locations" ON service_locations;
DROP POLICY IF EXISTS "Public write service_locations" ON service_locations;
CREATE POLICY "Public read service_locations" ON service_locations FOR SELECT USING (true);
CREATE POLICY "Public write service_locations" ON service_locations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read clients" ON clients;
DROP POLICY IF EXISTS "Public write clients" ON clients;
CREATE POLICY "Public read clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Public write clients" ON clients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read campaigns" ON campaigns;
DROP POLICY IF EXISTS "Public write campaigns" ON campaigns;
CREATE POLICY "Public read campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Public write campaigns" ON campaigns FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read inquiries" ON inquiries;
DROP POLICY IF EXISTS "Public write inquiries" ON inquiries;
CREATE POLICY "Public read inquiries" ON inquiries FOR SELECT USING (true);
CREATE POLICY "Public write inquiries" ON inquiries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read media" ON media;
DROP POLICY IF EXISTS "Public write media" ON media;
CREATE POLICY "Public read media" ON media FOR SELECT USING (true);
CREATE POLICY "Public write media" ON media FOR ALL USING (true) WITH CHECK (true);

-- SEED: site_settings
INSERT INTO site_settings (
  id, site_name, tagline, featured_brands, brand_subtitle, logo_text, logo_subtext, logo_badge, logo_url, favicon_url,
  phone, phone_alt, whatsapp, email, email_sales, udyam_number, gst_number,
  about_label, about_title, about_description, about_years, about_team_count, about_ad_spend, about_mission, about_vision, about_retention_title, about_retention_description, about_image_1, about_image_2,
  contact_label, contact_title, contact_description, contact_response_title, contact_approved_title, contact_faqs,
  support_hours, head_office, office_mumbai, office_bengaluru, map_link, cities, active_sites_count, campaigns_count, locations_count, retention_rate,
  social_links, genre_badges, filter_config
) VALUES (
  'default', 'Laxico Advertising', 'Billboard & Poster Placements Across India', 'NIKE, ZOMATO, SAMSUNG, HDFC BANK, COCA-COLA, AMAZON, TATA, SWIGGY, BOAT, MYNTRA', 'OUTDOOR • TRANSIT • DIGITAL', 'LAXICO', 'ADS', 'L', '/logo.png', '/logo.png',
  '9742313705', '9742313705', '9742313705', 'lexicoadvertising@gmail.com', 'lexicoadvertising@gmail.com', 'UDYAM-KR-03-0664055', '29CTIPS2521P1ZZ',
  'Since 2025', 'About Laxico & Contact', 'From 3 billboards on NH-8 to India''s most data-driven outdoor network — we blend prime media ownership with performance tracking every CMO loves.', '16+', '40+', '₹120Cr', 'Make outdoor advertising as measurable and effortless as digital — with verified footfall, transparent pricing and photo-proof of every display.', 'A Laxico screen within 10 minutes of every urban Indian — powering local businesses and national brands alike across 50 cities by 2030.', 'Why clients stay', '98% retention. Single-point ownership, in-house printing, night monitoring patrols and a client dashboard with live display photos.', 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=700&auto=format&fit=crop', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=700&auto=format&fit=crop',
  'Get a quote', 'Contact / Inquiry', 'Select your service & location. Our strategist replies with photos, footfall & pricing within 4 working hours.', '4-hr response', '100% Approved', '[{"q": "How fast can my ad go live?", "a": "48 hours from artwork approval — including printing, mounting and illumination. Airport & metro sites may need 72 hrs for security clearance."}, {"q": "Are your sites government-approved?", "a": "Yes. Every Laxico site carries MCD / DMRC / AAI / railway approvals. We share permit copies with your invoice."}, {"q": "Do you handle printing?", "a": "In-house plant in Delhi. 720 DPI flex, vinyl & backlit from ₹8,500 per site with free installation."}, {"q": "How do I get proof my ad is displayed?", "a": "Geo-tagged day + night photos every week on WhatsApp, plus a completion report with traffic data."}, {"q": "What is the minimum booking?", "a": "Street kiosks: 20 poles / 1 month. Billboards & transit: 1 site / 1 month. LEDs: 1 week."}]'::jsonb,
  'Mon–Sat • 10:00 AM – 7:00 PM IST', 'No 1 Nandini Complex, Chandra Layout, Bangalore — 560040', 'BKC Office, Bandra Kurla Complex, Mumbai — 400051', 'HSR Office, Sector 1, HSR Layout, Bengaluru — 560102', 'https://maps.google.com/?q=No+1+Nandini+Complex+Chandra+Layout+Bangalore+560040', 'Delhi • Mumbai • Bengaluru • Hyderabad', '248', 1250, 248, 98,
  '{"facebook": "https://facebook.com", "instagram": "https://instagram.com", "twitter": "https://twitter.com", "youtube": "https://youtube.com"}'::jsonb,
  '{"Airport": {"active": true, "text": "HOT", "color": "red"}, "Cinema": {"active": true, "text": "HOT", "color": "red"}, "Digital": {"active": true, "text": "HOT", "color": "red"}, "Outdoor": {"active": true, "text": "HOT", "color": "red"}, "Transit": {"active": true, "text": "HOT", "color": "red"}, "Retail": {"active": false, "text": "POPULAR", "color": "purple"}, "Street Furniture": {"active": false, "text": "TRENDING", "color": "amber"}, "BTL": {"active": false, "text": "NEW", "color": "emerald"}, "Print": {"active": false, "text": "CLASSIC", "color": "blue"}, "Radio": {"active": false, "text": "TRENDING", "color": "amber"}, "Sports": {"active": false, "text": "HOT", "color": "red"}, "Television": {"active": false, "text": "PRIME", "color": "purple"}, "Socialmedia": {"active": true, "text": "TRENDING", "color": "red"}, "Development": {"active": true, "text": "NEW", "color": "emerald"}, "Drone Marketing": {"active": true, "text": "HOT", "color": "purple"}}'::jsonb,
  '{"show_location": true, "show_category": true, "show_format": true, "show_budget": true, "show_reach": true, "show_duration": true, "location_title": "LOCATION", "category_title": "CATEGORY", "format_title": "AD OPTIONS", "budget_title": "BUDGET BRACKET", "reach_title": "AUDIENCE & REACH", "duration_title": "CAMPAIGN DURATION", "budget_brackets": [{"id": "under_25k", "label": "Under ₹25,000", "min": 0, "max": 25000}, {"id": "25k_50k", "label": "₹25K – ₹50K", "min": 25000, "max": 50000}, {"id": "50k_1l", "label": "₹50K – ₹1 Lakh", "min": 50000, "max": 100000}, {"id": "1l_2l", "label": "₹1 Lakh – ₹2 Lakhs", "min": 100000, "max": 200000}, {"id": "above_2l", "label": "Above ₹2 Lakhs", "min": 200000, "max": 999999999}]}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  site_name = EXCLUDED.site_name,
  tagline = EXCLUDED.tagline,
  featured_brands = EXCLUDED.featured_brands,
  brand_subtitle = EXCLUDED.brand_subtitle,
  phone = EXCLUDED.phone,
  phone_alt = EXCLUDED.phone_alt,
  whatsapp = EXCLUDED.whatsapp,
  email = EXCLUDED.email,
  email_sales = EXCLUDED.email_sales,
  udyam_number = EXCLUDED.udyam_number,
  gst_number = EXCLUDED.gst_number,
  about_label = EXCLUDED.about_label,
  about_title = EXCLUDED.about_title,
  about_description = EXCLUDED.about_description,
  about_years = EXCLUDED.about_years,
  about_team_count = EXCLUDED.about_team_count,
  about_ad_spend = EXCLUDED.about_ad_spend,
  about_mission = EXCLUDED.about_mission,
  about_vision = EXCLUDED.about_vision,
  about_retention_title = EXCLUDED.about_retention_title,
  about_retention_description = EXCLUDED.about_retention_description,
  about_image_1 = EXCLUDED.about_image_1,
  about_image_2 = EXCLUDED.about_image_2,
  contact_label = EXCLUDED.contact_label,
  contact_title = EXCLUDED.contact_title,
  contact_description = EXCLUDED.contact_description,
  contact_response_title = EXCLUDED.contact_response_title,
  contact_approved_title = EXCLUDED.contact_approved_title,
  contact_faqs = EXCLUDED.contact_faqs,
  support_hours = EXCLUDED.support_hours,
  head_office = EXCLUDED.head_office,
  office_mumbai = EXCLUDED.office_mumbai,
  office_bengaluru = EXCLUDED.office_bengaluru,
  map_link = EXCLUDED.map_link,
  cities = EXCLUDED.cities,
  active_sites_count = EXCLUDED.active_sites_count,
  campaigns_count = EXCLUDED.campaigns_count,
  locations_count = EXCLUDED.locations_count,
  retention_rate = EXCLUDED.retention_rate,
  social_links = EXCLUDED.social_links,
  genre_badges = EXCLUDED.genre_badges,
  filter_config = EXCLUDED.filter_config,
  updated_at = now();

-- SEED: media_genres (The Media Ant 12 Channels + Modern Channels)
INSERT INTO media_genres (id, name, short_name, icon, tagline, is_popular, sort_order) VALUES
('Airport', 'AIRLINE / AIRPORT', 'Airport', 'fa-solid fa-plane-departure', 'Arrival, departure & baggage belts', true, 1),
('Cinema', 'CINEMA', 'Cinema', 'fa-solid fa-film', 'PVR INOX, Cinepolis screens & lobby', true, 2),
('Digital', 'DIGITAL / DOOH', 'Digital', 'fa-solid fa-desktop', 'Tech parks & high-res LED walls', true, 3),
('Outdoor', 'OUTDOOR', 'Outdoor', 'fa-solid fa-rectangle-ad', 'Highways, arterial unipoles & gantries', true, 4),
('Transit', 'TRANSIT', 'Transit', 'fa-solid fa-train-subway', 'Metro networks, buses & railway hubs', true, 5),
('Retail', 'MALL / RETAIL', 'Retail', 'fa-solid fa-bag-shopping', 'Atrium drop banners & food courts', false, 6),
('Street Furniture', 'STREET / KIOSK', 'Street', 'fa-solid fa-signs-post', 'Arterial pole kiosks & street mupis', false, 7),
('BTL', 'BTL ACTIVATIONS', 'BTL', 'fa-solid fa-bullhorn', 'Society, mall & corporate activations', false, 8),
('Print', 'NEWSPAPER / PRINT', 'Print', 'fa-solid fa-newspaper', 'Leading English & regional dailies', false, 9),
('Radio', 'RADIO & AUDIO', 'Radio', 'fa-solid fa-radio', 'Prime FM channels & metro RJ mentions', false, 10),
('Sports', 'SPORTS & ARENA', 'Sports', 'fa-solid fa-baseball-bat-ball', 'Stadium perimeter LEDs & tour sponsorships', false, 11),
('Television', 'TELEVISION', 'Television', 'fa-solid fa-tv', 'National news, business & regional feeds', false, 12),
('Socialmedia', 'SOCIAL MEDIA', 'Social Media', 'fa-solid fa-hashtag', 'Meta, Instagram, YouTube & Influencer ads', true, 13),
('Development', 'DEVELOPMENT', 'Development', 'fa-solid fa-code', 'High-conversion web, landing pages & ad tech', true, 14),
('Drone Marketing', 'DRONES MARKETING', 'Drones', 'fa-solid fa-helicopter', 'Sky light shows & aerial drone brand formations', true, 15)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, short_name = EXCLUDED.short_name, icon = EXCLUDED.icon, tagline = EXCLUDED.tagline;

-- SEED: services
INSERT INTO services (id, name, type, genre, sub_type, chain_or_brand, audience_metric, min_spend, price, rating, popularity, status, dims, durations, cities, image, description) VALUES
('svc_airport_delhi', 'Delhi Airport Advertising', 'Airport', 'Airport', 'Terminal T3 & T2 Departures & Arrivals', 'Indira Gandhi International Airport', '5.8M+ Monthly Passengers • High CXO Density', 75000, 180000, 4.9, 98, 'Active', '30 × 12 ft Static Lightboxes & Digital Video Walls', '1 Month, 3 Months, 6 Months, 12 Months', 'Delhi NCR', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop', 'High-impact static lightboxes, digital video walls, and baggage-belt conveyor wraps across Terminal 3 and Terminal 2. Captive exposure targeting affluent domestic and international business flyers with average dwell time exceeding 45 minutes.'),
('svc_airport_mumbai', 'Mumbai Airport Advertising', 'Airport', 'Airport', 'Terminal T2 Aerobridge & Concourse Wraps', 'Chhatrapati Shivaji Maharaj International Airport', '4.5M+ Monthly Flyers • Premier HNI Gateway', 70000, 175000, 4.9, 97, 'Active', '25 × 10 ft Backlit Panels & Aerobridge Glass Wraps', '1 Month, 3 Months, 6 Months, 12 Months', 'Mumbai', 'https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=800&auto=format&fit=crop', 'Iconic departures corridor lightboxes, security-check digital screens, and external aerobridge wraps at Mumbai’s award-winning Terminal 2. Direct high-frequency influence on Western India’s top corporate executives and luxury consumers.'),
('svc_airport_bengaluru', 'Bengaluru Airport Advertising', 'Airport', 'Airport', 'Terminal 1 & Terminal 2 Tech Hub Displays', 'Kempegowda International Airport', '3.4M+ Monthly Passengers • High Tech Professional Share', 60000, 150000, 4.9, 96, 'Active', '28 × 12 ft High-Lumen Lightboxes & Digital Totems', '1 Month, 3 Months, 6 Months, 12 Months', 'Bengaluru', 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?q=80&w=800&auto=format&fit=crop', 'High-definition digital totems and grand arrival hall displays across Kempegowda Terminal 1 and the iconic Terminal 2 garden terminal. Prime connection point to India’s leading tech founders, venture capitalists, and global business travelers.'),
('svc_airport_hyderabad', 'Hyderabad Airport Advertising', 'Airport', 'Airport', 'Main Passenger Terminal Static & Digital Hub', 'Rajiv Gandhi International Airport', '2.2M+ Monthly Passengers • Pharma & IT Hub', 50000, 120000, 4.8, 93, 'Active', '20 × 10 ft Backlit Displays & Departure Gates', '1 Month, 3 Months, 6 Months, 12 Months', 'Hyderabad', 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=800&auto=format&fit=crop', 'Strategic boarding gate signage, duty-free retail corridor pillars, and arrival reclaim carousels at RGIA Shamshabad. Premium visual real estate reaching leaders across the pharmaceutical, biotechnology, and enterprise software sectors.'),
('svc_airport_chennai', 'Chennai Airport Advertising', 'Airport', 'Airport', 'Domestic & International Terminal Lightboxes', 'Chennai International Airport', '1.8M+ Monthly Passengers • Industrial & Trade Gateway', 45000, 110000, 4.7, 90, 'Active', '24 × 10 ft Backlit Displays & Security Hall Banners', '1 Month, 3 Months, 6 Months, 12 Months', 'Chennai', 'https://images.unsplash.com/photo-1578637387939-43c525550085?q=80&w=800&auto=format&fit=crop', 'Prominent security check entrance displays, baggage reclaim pillars, and arrivals concourse lightboxes across modern terminals at Chennai Airport. Comprehensive coverage targeting South India’s automotive and heavy manufacturing corporate leaders.'),
('svc_airport_kolkata', 'Kolkata Airport Advertising', 'Airport', 'Airport', 'Integrated Terminal Static & Digital Media', 'Netaji Subhash Chandra Bose International Airport', '1.6M+ Monthly Passengers • Eastern India Commercial Hub', 40000, 98000, 4.7, 89, 'Active', '20 × 8 ft Backlit Panels & Arrival Hall Gantries', '1 Month, 3 Months, 6 Months, 12 Months', 'Kolkata', 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=800&auto=format&fit=crop', 'High-impact boarding gate overhead displays, aerobridge wraps, and grand arrivals hall static banners at Kolkata’s integrated terminal. The primary aviation hub linking East and North-East India to major metropolitan commercial centers.'),
('svc_airport_pune', 'Pune Airport Advertising', 'Airport', 'Airport', 'New Integrated Terminal Media Network', 'Pune International Airport', '950,000+ Monthly Passengers • Manufacturing & Tech Leaders', 35000, 85000, 4.8, 91, 'Active', '18 × 8 ft Backlit Lightboxes & Departures Pillar Wraps', '1 Month, 3 Months, 6 Months, 12 Months', 'Pune', 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?q=80&w=800&auto=format&fit=crop', 'Modern departures concourse lightboxes and arrivals baggage reclaim panels across Pune’s state-of-the-art new integrated terminal. Captures affluent automotive engineers, IT professionals, and frequent flyers travelling between key industrial hubs.'),
('svc_airport_ahmedabad', 'Ahmedabad Airport Advertising', 'Airport', 'Airport', 'Terminal 1 & Terminal 2 Business Concourse Displays', 'Sardar Vallabhbhai Patel International Airport', '1.1M+ Monthly Passengers • Business & Entrepreneur Hub', 38000, 92000, 4.8, 92, 'Active', '20 × 10 ft Static Lightboxes & Digital Totem Displays', '1 Month, 3 Months, 6 Months, 12 Months', 'Ahmedabad', 'https://images.unsplash.com/photo-1520437358207-323b43b50729?q=80&w=800&auto=format&fit=crop', 'High-visibility security check panels, departure lounge static banners, and baggage claim displays at SVPIA Ahmedabad. Delivers unparalleled reach across Western India’s wealthiest trading communities, textile magnates, and industrial entrepreneurs.'),
('svc_airport_goa', 'Goa Airport Advertising', 'Airport', 'Airport', 'Dabolim & Mopa (Manohar) Leisure Gateway Displays', 'Goa International Airports (GOI & GOX)', '880,000+ Monthly High-Spender Tourists & Lifestyle Flyers', 42000, 105000, 4.9, 94, 'Active', '24 × 10 ft Static Lightboxes & Arrival Reclaim Wraps', '1 Month, 3 Months, 6 Months, 12 Months', 'Goa', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop', 'Prime arrivals hall lightboxes, baggage belt wraps, and departure gate signage across both Dabolim and Manohar International (Mopa) airports. Reach relaxed, high-disposable-income leisure tourists, wedding parties, and young urban professionals on holiday.'),
('svc_cinema_pvr', 'PVR INOX Multiplex Cinema Ads', 'Cinema', 'Cinema', 'On-Screen Video & Slide Ads', 'PVR INOX', '280 Seats/Screen • 4.2L+ Monthly Footfall', 11400, 32000, 4.9, 97, 'Active', '2K / 4K DCP • 10–30s Spots', '1 Week, 2 Weeks, 1 Month, 3 Months', 'Mumbai, Bengaluru, Delhi NCR, Hyderabad, Pune', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop', 'Captive, high-impact cinema advertising across premium PVR and INOX audi screens. On-screen slides, Dolby Atmos cinema video commercials, and lobby standees during blockbuster releases.'),
('svc_cinema_cinepolis', 'Cinepolis Fun Republic On-Screen Ads', 'Cinema', 'Cinema', 'Digital Screen & Slide Ad', 'Cinépolis', '252 Seats/Screen • High Affluent Youth Dwell', 6080, 18500, 4.8, 91, 'Active', 'Full Cinema Screen • High Lumen DCP', '1 Week, 2 Weeks, 1 Month', 'Mumbai, Bengaluru, Pune, Delhi NCR', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop', 'High-visibility digital slides and video commercials before movie trailers and interval. Reach young, tech-savvy cinema-goers across premier Cinepolis locations.'),
('svc_cinema_multiplex_chain', 'Multiplex Chain Cinema Advertising', 'Cinema', 'Cinema', 'On-Screen Slides & Video Commercials', 'National Multiplex Cinema Network', '220 Seats/Screen • 3.1L+ Monthly Footfall', 8500, 24000, 4.7, 89, 'Active', '2K / 4K Digital Cinema DCP • 10–30s Spots', '1 Week, 2 Weeks, 1 Month, 3 Months', 'Mumbai, Bengaluru, Delhi NCR, Pune, Hyderabad, Kolkata', 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=80&w=800&auto=format&fit=crop', 'High-impact on-screen slide and video advertising across regional and national multiplex screens. Captive audiences, Dolby surround sound, and interval lobby branding in high-traffic commercial entertainment hubs.'),
('svc_outdoor_mumbai', 'Mumbai Outdoor Advertising', 'Outdoor', 'Outdoor', 'Large Format Unipole & Hoarding', 'Mumbai Arterial Network', '42 Prime Sites • 1.8M+ Weekly Vehicular Reach', 45000, 120000, 4.9, 97, 'Active', '40 × 20 ft & 60 × 20 ft Front-lit Unipoles', '1 Month, 3 Months, 6 Months, 12 Months', 'Mumbai', 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop', 'High-impact large-format unipoles and cantilever hoardings across Western Express Highway, Eastern Freeway, and Bandra-Worli Sea Link approaches. Premium front-lit illumination ensuring continuous 24/7 visibility for marquee brands.'),
('svc_outdoor_delhi', 'Delhi NCR Outdoor Advertising', 'Outdoor', 'Outdoor', 'Highway Unipole & Expressway Gantry', 'Delhi NCR Arterial Network', '56 Prime Sites • 2.2M+ Weekly Commuters', 40000, 110000, 4.9, 96, 'Active', '48 × 20 ft Front-lit Unipoles & Gantries', '1 Month, 3 Months, 6 Months, 12 Months', 'Delhi NCR', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop', 'Strategic highway unipoles and expressway gantries along NH-48, Cyber City junction, DND Flyway, and Ring Road arterial corridors. Engineered for high dwell time and maximum brand prestige in the capital region.'),
('svc_outdoor_bengaluru', 'Bengaluru Outdoor Advertising', 'Outdoor', 'Outdoor', 'Arterial Corridor Billboard & Unipole', 'Bengaluru Highway Network', '38 Prime Sites • 1.4M+ Weekly Tech Commuters', 35000, 90000, 4.8, 94, 'Active', '35 × 15 ft & 40 × 20 ft Front-lit Billboards', '1 Month, 3 Months, 6 Months, 12 Months', 'Bengaluru', 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop', 'High-density tech corridor hoardings along Outer Ring Road (ORR), Electronic City flyover, and Hebbal Airport Expressway. Positioned at key bottleneck junctions for sustained eye-level recall among affluent IT professionals.'),
('svc_outdoor_hyderabad', 'Hyderabad Outdoor Advertising', 'Outdoor', 'Outdoor', 'Expressway Gantry & Unipole', 'Hyderabad Arterial Network', '30 Prime Sites • 1.1M+ Weekly Vehicular Impressions', 30000, 75000, 4.8, 92, 'Active', '40 × 15 ft Unipoles & Gantry Hoardings', '1 Month, 3 Months, 6 Months, 12 Months', 'Hyderabad', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop', 'Prominent arterial unipoles covering Hitec City, Gachibowli Financial District, and PVNR Elevated Expressway. Exceptional line-of-sight exposure targeting enterprise decision-makers and urban consumers.'),
('svc_outdoor_pune', 'Pune Outdoor Advertising', 'Outdoor', 'Outdoor', 'Expressway Hoarding & Arterial Billboard', 'Pune Arterial Network', '24 Prime Sites • 850,000+ Weekly Vehicular Reach', 25000, 65000, 4.7, 90, 'Active', '30 × 15 ft & 40 × 20 ft Billboards', '1 Month, 3 Months, 6 Months, 12 Months', 'Pune', 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=800&auto=format&fit=crop', 'Prime outdoor billboard positions across Mumbai-Pune Expressway exit, Baner Road, Senapati Bapat Road, and Koregaon Park arterial connectors. High frequency coverage across Pune’s fastest growing commercial corridors.'),
('svc_transit_delhi_metro', 'Delhi Metro Advertising', 'Transit', 'Transit', 'Concourse, PSD & Train Wrap', 'Delhi Metro Rail Network', '3.2M+ Daily Commuters across Yellow & Blue Lines', 20000, 55000, 4.9, 98, 'Active', '20 × 10 ft Static Panels & Digital Displays', '1 Week, 2 Weeks, 1 Month, 3 Months, 6 Months, 12 Months', 'Delhi NCR', 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800&auto=format&fit=crop', 'Full-station concourse branding, ticket counter panels, platform screen doors, and exterior train wraps across DMRC interchanges. Unrivaled frequency and captive audience reach in North India’s busiest mass transit system.'),
('svc_transit_mumbai_metro', 'Mumbai Metro Advertising', 'Transit', 'Transit', 'Station Branding & Metro Train Wraps', 'Mumbai Metro Transit System', '1.8M+ Daily Commuters across Lines 1, 2A & 7', 18000, 50000, 4.8, 95, 'Active', '15 × 8 ft Backlit Panels & In-Train Branding', '1 Week, 2 Weeks, 1 Month, 3 Months, 6 Months, 12 Months', 'Mumbai', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop', 'Modern transit advertising inside metro trains and elevated station concourses along Andheri-Ghatkopar and Western Express corridors. High visibility among upwardly mobile daily corporate commuters.'),
('svc_transit_mumbai_local_train', 'Mumbai Local Train Advertising', 'Transit', 'Transit', 'Local Train Wraps & FOB Hoardings', 'Mumbai Suburban Railway', '7.5M+ Mass Daily Passengers across Central & Western Lines', 25000, 65000, 4.9, 99, 'Active', 'Train Compartment Posters & 30 × 10 ft Station Hoardings', '1 Month, 3 Months, 6 Months, 12 Months', 'Mumbai', 'https://images.unsplash.com/photo-1565019011521-b0575cbb57c8?q=80&w=800&auto=format&fit=crop', 'The undisputed lifeline of Mumbai. Station platform walls, foot-over-bridge banners, and full exterior/interior suburban train branding reaching millions of daily travelers with unbeatable mass penetration.'),
('svc_transit_bengaluru_metro', 'Bengaluru Namma Metro Advertising', 'Transit', 'Transit', 'Station Pillars & Concourse Panels', 'Namma Metro Network', '850,000+ Daily Tech & White-Collar Commuters', 16000, 48000, 4.8, 93, 'Active', '12 × 6 ft Backlit Lightboxes & Pillar Wraps', '1 Week, 2 Weeks, 1 Month, 3 Months, 6 Months', 'Bengaluru', 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=800&auto=format&fit=crop', 'Prime station presence along the Purple and Green Metro corridors connecting Indiranagar, MG Road, and Whitefield. Captures tech-forward professionals and students during peak business commute hours.'),
('svc_transit_delhi_bus_shelters', 'Delhi NCR Bus Shelter Network', 'Transit', 'Transit', 'Bus Queue Shelter Mupis', 'Delhi NCR Transit Shelters', '65,000+ Daily Eye-Level Vehicular Views / Shelter', 12000, 22000, 4.7, 88, 'Active', '6 × 4 ft Double-Sided Backlit Mupi', '2 Weeks, 1 Month, 3 Months, 6 Months', 'Delhi NCR', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop', 'Eye-level illuminated bus queue shelter displays spanning major arterial roads in Central Delhi, South Delhi, Noida, and Gurugram. High dwell time and street-level repetition targeting urban shoppers and motorists.'),
('svc_transit_mumbai_bus_shelters', 'Mumbai Transit Shelter Network', 'Transit', 'Transit', 'Bus Queue Shelter Mupis', 'Mumbai Municipal Bus Shelters', '80,000+ Daily Eye-Level Views / Location', 14000, 26000, 4.7, 89, 'Active', '6 × 4 ft Backlit Street Mupis', '2 Weeks, 1 Month, 3 Months, 6 Months', 'Mumbai', 'https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?q=80&w=800&auto=format&fit=crop', 'Illuminated bus shelter network deployed across South Mumbai, Bandra, Juhu, and suburban commercial high-streets. Continuous pedestrian and vehicular impressions with superior night illumination.'),
('svc_transit_bengaluru_bus_shelters', 'Bengaluru Bus Shelter Network', 'Transit', 'Transit', 'Bus Queue Shelter Mupis', 'Bengaluru BMTC Shelter Network', '55,000+ Daily Eye-Level Views / Shelter', 10000, 20000, 4.7, 87, 'Active', '6 × 4 ft Illuminated Backlit Displays', '2 Weeks, 1 Month, 3 Months, 6 Months', 'Bengaluru', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop', 'Curated clusters of backlit bus shelters across Koramangala, Indiranagar, CBD, and Outer Ring Road junctions. Delivers continuous roadside frequency and localized brand resonance.'),
('svc_retail_bengaluru_malls', 'Bengaluru Premium Mall Network', 'Retail', 'Retail', 'Atrium Drops, Pillar Wraps & Standees', 'Bengaluru Premium Shopping Centers', '4.2L+ High-Spender Weekend Footfall', 20000, 58000, 4.8, 88, 'Active', 'Multi-tier Atrium Drop Banners & LED Kiosks', '1 Week, 2 Weeks, 1 Month, 3 Months', 'Bengaluru', 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800&auto=format&fit=crop', 'Atrium hanging banners, entrance archways, elevator door wraps, and experiential zones in Bengaluru’s leading luxury and lifestyle shopping centers. Unmatched point-of-sale influence for premium consumer, fashion, and electronics brands.'),
('svc_retail_mumbai_malls', 'Mumbai Premium Mall Network', 'Retail', 'Retail', 'Atrium Banners & Digital Totems', 'Mumbai Prime Retail Malls', '5.5L+ Weekend Shopper Footfall', 25000, 68000, 4.9, 92, 'Active', 'Atrium Drops, Escalator Glass Branding & Standees', '1 Week, 2 Weeks, 1 Month, 3 Months', 'Mumbai', 'https://images.unsplash.com/photo-1567449303078-57ad995bd302?q=80&w=800&auto=format&fit=crop', 'High-impact retail branding across prime South Mumbai, BKC, and Suburban luxury destination malls. Direct access to affluent urban families and leisure shoppers during their active purchasing mindset.'),
('svc_retail_delhi_malls', 'Delhi NCR Mall Network', 'Retail', 'Retail', 'Atrium Drops & Food Court Branding', 'Delhi NCR Grade-A Shopping Centers', '6.0L+ Weekly Lifestyle Footfall', 22000, 62000, 4.8, 90, 'Active', 'Grand Atrium Drops & Digital Facade Displays', '1 Week, 2 Weeks, 1 Month, 3 Months', 'Delhi NCR', 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800&auto=format&fit=crop', 'Dominant visual displays, grand atrium drops, and food-court table wraps across top-tier malls in Saket, Vasant Kunj, Noida, and Gurugram. Proven driver of walk-ins, festive sales, and retail brand launch hype.'),
('svc_kiosk_bengaluru', 'Bengaluru Street Kiosks', 'Street Furniture', 'Street Furniture', 'Double-Sided Backlit Pole Kiosks', 'Bengaluru Arterial Road Kiosks', '90,000+ Vehicles Daily / 10-Pole Corridor', 12000, 15000, 4.6, 80, 'Active', '8 × 4 ft • Double-Sided Backlit', '1 Month, 3 Months, 6 Months', 'Bengaluru', 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=800&auto=format&fit=crop', 'Consecutive double-sided backlit kiosks along CBD, MG Road, 100ft Indiranagar, and HSR Layout commercial corridors. Repetitive frequency guarantees subconscious brand recall among daily motorists and shoppers.'),
('svc_kiosk_delhi', 'Delhi NCR Street Kiosks', 'Street Furniture', 'Street Furniture', 'Double-Sided Backlit Street Poles', 'Delhi NCR Municipal Pole Network', '1.1L+ Vehicles Daily / Arterial Stretch', 14000, 16500, 4.6, 82, 'Active', '8 × 4 ft • High-Illumination Backlit Kiosks', '1 Month, 3 Months, 6 Months', 'Delhi NCR', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800&auto=format&fit=crop', 'Sequential street pole branding along key avenues in Central Delhi, Ring Road, and prime Gurugram connectors. Ideal for hyperlocal real estate launches, healthcare chains, and retail store openings.'),
('svc_kiosk_mumbai', 'Mumbai Street Kiosks', 'Street Furniture', 'Street Furniture', 'Arterial Backlit Street Kiosks', 'Mumbai Arterial Pole Network', '1.25L+ Daily Commuter Density / Sector', 15000, 18000, 4.7, 84, 'Active', '8 × 4 ft • Double-Sided Marine-Grade Backlit', '1 Month, 3 Months, 6 Months', 'Mumbai', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop', 'Illuminated pole kiosk runs across Marine Drive, Linking Road Bandra, and Andheri Link Road. High-density street furniture ensuring inescapable frequency for youth and lifestyle brands.'),
('svc_btl_stadium', 'Stadium & Sports Arena BTL Activations', 'BTL', 'BTL', 'Experiential Fan Zones & Concourse Booths', 'Arena Fan Engagement Network', '45,000+ High-Energy Fans / Match Day', 50000, 140000, 4.9, 95, 'Active', '20 × 20 ft Interactive Fan Booth + Brand Ambassadors', '1 Weekend, 1 Match Day, Multi-Match Series', 'Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Ahmedabad', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop', 'Immersive brand pavilions, interactive gaming zones, and direct merchandise sampling during major cricket and sports matches. Connect with impassioned, high-energy audiences in a memorable experiential setting.'),
('svc_btl_college_fest', 'College Fest & Campus BTL Activations', 'BTL', 'BTL', 'Campus Canopies & Youth Engagement Stalls', 'Campus Activation Network', '15,000+ Gen Z & Young Adult Footfall / Fest', 18000, 42000, 4.8, 90, 'Active', '12 × 12 ft Canopy Setup + Audio & Promoters', '2-3 Days Fest, 1 Week Tour', 'Delhi NCR, Mumbai, Bengaluru, Pune, Hyderabad, Chennai', 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=800&auto=format&fit=crop', 'On-ground interactive stalls, product sampling kiosks, and contest booths at premier university fests and management institutes. Direct peer-to-peer engagement and app download drives with India’s Gen Z trendsetters.'),
('svc_btl_rwa_society', 'RWA & Residential Society Activations', 'BTL', 'BTL', 'Township Canopies & Door-to-Door Engagement', 'Premium Gated Societies Network', '3,500+ Qualified High-Net-Worth Households / Complex', 15000, 35000, 4.8, 88, 'Active', '10 × 10 ft Clubhouse Canopy + Promoters & Lead App', '1 Weekend, 2 Weekends, 1 Month Package', 'Bengaluru, Mumbai, Delhi NCR, Hyderabad, Pune', 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop', 'Exclusive weekend pop-ups, vehicle test-drive experiences, and product trial counters inside top gated communities and townships. High-trust environment generating verified, affluent family leads for D2C and premium services.'),
('svc_print_english_daily', 'English Daily Newspaper Advertising', 'Print', 'Print', 'Full Page Jacket & Display Ads', 'National English Daily Press', '1.2M+ Verified Daily Circulation • High SEC-A Readers', 35000, 95000, 4.8, 91, 'Active', 'Full Page (33 × 52 cm) / Half Page / Front Page Jacket', '1 Insertion, 3 Insertions, 6 Insertions', 'Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop', 'Front page jackets, display advertisements, and innovative bookmark wraps in premier national English dailies. Maximum corporate credibility and instant nationwide recall for flagship product and public announcement campaigns.'),
('svc_print_regional_press', 'Regional Language Press Advertising', 'Print', 'Print', 'Regional Edition Display & Classifieds', 'Leading Regional Press Network', '2.4M+ Combined Regional Readership', 20000, 55000, 4.7, 86, 'Active', 'Full Page / Half Page / Quarter Page Display', '1 Insertion, 3 Insertions, 6 Insertions', 'Mumbai, Pune, Bengaluru, Hyderabad, Ahmedabad, Kolkata', 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop', 'Deep-penetration print advertisements in top Hindi, Marathi, Kannada, Telugu, Gujarati, and Bengali dailies. Hyperlocal community trust and wide grassroots reach across tier-1 and tier-2 urban clusters.'),
('svc_print_financial_daily', 'Financial & Business Daily Advertising', 'Print', 'Print', 'Financial Page Display & Notice Ads', 'Financial & Economic Press Network', '650,000+ Business Leaders, Investors & CXOs', 28000, 78000, 4.8, 88, 'Active', 'Half Page / Strip Ad / Full Page Financial Ad', '1 Insertion, 3 Insertions, 6 Insertions', 'Delhi NCR, Mumbai, Bengaluru, Hyderabad', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop', 'Targeted business display ads, investor notices, and quarter-page corporate updates in leading pink-paper economic dailies. Direct visual access to CFOs, founders, retail investors, and policy stakeholders.'),
('svc_led', 'Tech Park & Mall Digital DOOH Screens', 'Digital', 'Digital', 'Digital DOOH LED Wall', 'Corporate Parks & Malls', '1.8L+ Daily Tech Professionals & Shoppers', 20000, 88000, 4.9, 92, 'Active', 'P6 LED • 15-sec loop, 120 plays/day', '1 Week, 2 Weeks, 1 Month, 3 Months', 'Bengaluru, Mumbai, Delhi NCR, Hyderabad', 'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=800&auto=format&fit=crop', 'Programmatic-grade LED walls at Cyber City, BKC, Manyata Tech Park & Whitefield. Day-parting, live data feeds and instant creative swaps. 120 spots/day guaranteed.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  genre = EXCLUDED.genre,
  sub_type = EXCLUDED.sub_type,
  chain_or_brand = EXCLUDED.chain_or_brand,
  audience_metric = EXCLUDED.audience_metric,
  min_spend = EXCLUDED.min_spend,
  price = EXCLUDED.price,
  rating = EXCLUDED.rating,
  popularity = EXCLUDED.popularity,
  status = EXCLUDED.status,
  dims = EXCLUDED.dims,
  durations = EXCLUDED.durations,
  cities = EXCLUDED.cities,
  image = EXCLUDED.image,
  description = EXCLUDED.description;

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
('sl1', 'svc_transit_delhi_metro', 'loc_1'),
('sl2', 'svc_transit_delhi_metro', 'loc_9'),
('sl3', 'svc_transit_delhi_metro', 'loc_12'),
('sl4', 'svc_transit_bengaluru_bus_shelters', 'loc_4'),
('sl5', 'svc_transit_mumbai_bus_shelters', 'loc_8'),
('sl6', 'svc_airport_delhi', 'loc_2'),
('sl7', 'svc_outdoor_delhi', 'loc_3'),
('sl8', 'svc_outdoor_delhi', 'loc_11'),
('sl9', 'svc_retail_mumbai_malls', 'loc_5'),
('sl10', 'svc_transit_mumbai_local_train', 'loc_6'),
('sl11', 'svc_led', 'loc_7'),
('sl12', 'svc_led', 'loc_10'),
('sl13', 'svc_kiosk_mumbai', 'loc_8'),
('sl14', 'svc_kiosk_bengaluru', 'loc_4')
ON CONFLICT (id) DO NOTHING;

INSERT INTO clients (id, name, contact, phone, email) VALUES
('cl1', 'Nike India', 'Rohan Mehta', '+91 98200 11223', 'rohan@nike.in'),
('cl2', 'Zomato', 'Ananya Rao', '+91 99301 44556', 'ananya@zomato.com'),
('cl3', 'Samsung India', 'Vikram Iyer', '+91 98111 77889', 'vikram@samsung.in'),
('cl4', 'HDFC Bank', 'Kavya Nair', '+91 98450 22334', 'kavya@hdfc.in'),
('cl5', 'Coca-Cola', 'Arjun Kapoor', '+91 98100 99001', 'arjun@coke.in')
ON CONFLICT (id) DO NOTHING;

INSERT INTO campaigns (id, title, client, service_id, location_id, start_date, end_date, budget, status, artwork, notes) VALUES
('cp1', 'Nike — Just Do It Takeover', 'Nike India', 'svc_outdoor_delhi', 'loc_3', '2026-08-01', '2026-11-01', 680000, 'Live', 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?q=80&w=800&auto=format&fit=crop', 'Front-lit unipole + night patrol'),
('cp2', 'Zomato Feast Fest — Metro Domination', 'Zomato', 'svc_transit_delhi_metro', 'loc_1', '2026-08-15', '2026-10-15', 420000, 'Live', 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800&auto=format&fit=crop', 'Concourse + gate wraps'),
('cp3', 'Galaxy Z Fold — Airport Arrival', 'Samsung India', 'svc_airport_delhi', 'loc_2', '2026-09-01', '2026-12-01', 890000, 'Live', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop', 'T3 arrival + baggage belt'),
('cp4', 'HDFC Millennia — Railway Concourse', 'HDFC Bank', 'svc_transit_mumbai_local_train', 'loc_6', '2026-07-10', '2026-09-10', 310000, 'Completed', 'https://images.unsplash.com/photo-1565019011521-b0575cbb57c8?q=80&w=800&auto=format&fit=crop', 'FOB panels + concourse'),
('cp5', 'Coke Summer — Cyber Hub LED', 'Coca-Cola', 'svc_led', 'loc_7', '2026-09-10', '2026-10-10', 260000, 'Live', 'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=800&auto=format&fit=crop', '120 plays/day, day-parted'),
('cp6', 'Phoenix Fest — Atrium Launch', 'Zomato', 'svc_retail_mumbai_malls', 'loc_5', '2026-10-05', '2026-10-20', 180000, 'Scheduled', 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800&auto=format&fit=crop', 'Atrium + sampling kiosk'),
('cp7', 'Bus Shelter — Fintech Pilot', 'HDFC Bank', 'svc_transit_bengaluru_bus_shelters', 'loc_4', '2026-09-20', '2026-11-20', 145000, 'Scheduled', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop', '12 mupis cluster')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inquiries (id, name, phone, email, company, service_id, location_id, duration, budget, message, stage, date, followup) VALUES
('iq1', 'Priya Sharma', '+91 98111 22334', 'priya@d2cbrand.in', 'GlowKart D2C', 'svc_retail_mumbai_malls', 'loc_5', '1 Month', '₹2L – ₹5L', 'Festive launch in Mumbai malls, need atrium + facade for 3 weeks in Oct.', 'New', '2026-09-10', '2026-09-14'),
('iq2', 'Rahul Verma', '+91 99300 11223', 'rahul@realty.in', 'Verma Estates', 'svc_outdoor_delhi', 'loc_3', '3 Months', '₹5L – ₹15L', 'New township on NH-48, need unipole + gantry combo.', 'Quoted', '2026-09-08', '2026-09-13'),
('iq3', 'Sneha Kulkarni', '+91 98450 66778', 'sneha@edtech.in', 'LearnLeap', 'svc_transit_delhi_metro', 'loc_9', '6 Months', '₹15L+', 'Admissions season — Rajiv Chowk + Central Hub domination.', 'Contacted', '2026-09-11', '2026-09-15'),
('iq4', 'Amit Patel', '+91 98102 33445', 'amit@finserve.in', 'PaySwift', 'svc_led', 'loc_7', '2 Weeks', '₹50K – ₹2L', 'App launch, need Cyber Hub LED with QR creative.', 'New', '2026-09-12', '2026-09-14'),
('iq5', 'Divya Menon', '+91 97400 55667', 'divya@jewels.in', 'Malabar Jewels', 'svc_airport_delhi', 'loc_2', '3 Months', '₹5L – ₹15L', 'Diwali campaign at T3 arrivals.', 'Converted', '2026-09-05', '—')
ON CONFLICT (id) DO NOTHING;

INSERT INTO media (id, title, tag, service_id, url) VALUES
('m1', 'Highway Unipole — Night Glow', 'Highway Billboards', 'svc_outdoor_delhi', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop'),
('m2', 'Metro Concourse Wrap', 'Metro Station Ads', 'svc_transit_delhi_metro', 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800&auto=format&fit=crop'),
('m3', 'T3 Arrival Banner', 'Airport Banners', 'svc_airport_delhi', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop'),
('m4', 'Bus Shelter Mupi — Day', 'Bus Shelter Posters', 'svc_transit_bengaluru_bus_shelters', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop'),
('m5', 'Mall Atrium Launch', 'Mall Atrium Displays', 'svc_retail_mumbai_malls', 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800&auto=format&fit=crop'),
('m6', 'Railway Concourse Wall', 'Railway Station Hoardings', 'svc_transit_mumbai_local_train', 'https://images.unsplash.com/photo-1565019011521-b0575cbb57c8?q=80&w=800&auto=format&fit=crop'),
('m7', 'Cyber Hub LED — Evening', 'Digital LED', 'svc_led', 'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=800&auto=format&fit=crop'),
('m8', 'City Night Centre', 'Street Pole Kiosks', 'svc_kiosk_mumbai', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800&auto=format&fit=crop'),
('m9', 'Times-Style LED Burst', 'Digital LED', 'svc_led', 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?q=80&w=800&auto=format&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 10. LISTINGS TABLE (Admin-Managed Service Listings with Excel Import)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    price NUMERIC NOT NULL,
    media_type TEXT NOT NULL,
    reach NUMERIC,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_listings_category ON listings (category);
CREATE INDEX IF NOT EXISTS idx_listings_subcategory ON listings (category, subcategory);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings (price);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read listings" ON listings;
DROP POLICY IF EXISTS "Public write listings" ON listings;
CREATE POLICY "Public read listings" ON listings FOR SELECT USING (true);
CREATE POLICY "Public write listings" ON listings FOR ALL USING (true) WITH CHECK (true);

-- SEED: listings
INSERT INTO listings (id, category, subcategory, title, location, price, media_type, reach, description, image_url) VALUES
('b3c8f8b8-2e06-4e58-9a3b-287df53b1001', 'Transit', 'Transport', 'City Express Low-Floor AC Bus Branding', 'Delhi NCR', 45000, 'Bus', 650000, 'High-frequency city commuter bus fleet exterior wrapping covering prime arterial routes.', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop'),
('b3c8f8b8-2e06-4e58-9a3b-287df53b1002', 'Transit', 'Transport', 'Delhi Metro Blue Line Full Train Wrap', 'Delhi / NCR', 185000, 'Metro', 1200000, 'Full exterior wrap across 6-coach train traversing Dwarka to Noida/Vaishali.', 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800&auto=format&fit=crop'),
('b3c8f8b8-2e06-4e58-9a3b-287df53b1003', 'Transit', 'Transport', 'Suburban Express Electric Train Panel', 'Mumbai', 95000, 'Train', 900000, 'Internal commuter panel advertising across western railway network.', 'https://images.unsplash.com/photo-1565019011521-b0575cbb57c8?q=80&w=800&auto=format&fit=crop'),
('b3c8f8b8-2e06-4e58-9a3b-287df53b1004', 'Transit', 'Transport', 'Airport Feeder Bus Back-Panel Wrap', 'Bengaluru', 38000, 'Bus', 420000, 'High-visibility back-panel on Kempegowda International Airport Vayu Vajra volvo buses.', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop'),
('b3c8f8b8-2e06-4e58-9a3b-287df53b1005', 'Transit', 'Metro Networks', 'Metro Station Platform Screen Doors (PSD)', 'Bengaluru (Namma Metro)', 75000, 'Metro', 550000, 'Illuminated platform screen door branding at high-traffic interchange stations.', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800&auto=format&fit=crop'),
('b3c8f8b8-2e06-4e58-9a3b-287df53b1006', 'Transit', 'Metro Networks', 'Metro Pillar Wraps on MG Road', 'Bengaluru', 60000, 'Metro', 800000, 'Consecutive metro pillar vinyl wraps along prime commercial stretch.', 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=800&auto=format&fit=crop'),
('b3c8f8b8-2e06-4e58-9a3b-287df53b1007', 'Transit', 'Railway Terminals', 'New Delhi Railway Concourse Mega Billboard', 'New Delhi', 140000, 'Train', 1500000, 'Massive illuminated display at platform entry concourse with 24/7 footfall.', 'https://images.unsplash.com/photo-1565019011521-b0575cbb57c8?q=80&w=800&auto=format&fit=crop'),
('b3c8f8b8-2e06-4e58-9a3b-287df53b1008', 'Outdoor', 'Billboards & Unipoles', 'Cyber City Arterial Unipole (Backlit)', 'Gurugram', 125000, 'Billboard', 980000, 'Front-facing highway unipole catching top corporate commuters.', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop'),
('b3c8f8b8-2e06-4e58-9a3b-287df53b1009', 'Outdoor', 'Digital Hoardings', 'Bandra Flyover Curved DOOH Screen', 'Mumbai', 210000, 'Digital Screen', 1400000, 'P6 LED high-definition screen at Western Express Highway intersection.', 'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=800&auto=format&fit=crop'),
('b3c8f8b8-2e06-4e58-9a3b-287df53b1010', 'Airport', 'Terminal Displays', 'T3 Departure Lounge Digital Totem', 'Delhi Airport', 275000, 'Digital Totem', 850000, 'Premium UHD digital totems targeting high-net-worth business travelers.', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop')
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  title = EXCLUDED.title,
  location = EXCLUDED.location,
  price = EXCLUDED.price,
  media_type = EXCLUDED.media_type,
  reach = EXCLUDED.reach,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;


