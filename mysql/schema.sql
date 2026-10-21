-- ==============================================================================
-- Laxico Advertising - Media & Billboard Placements Database Schema (MySQL 8.0+)
-- Full CMS Support: site_settings, media_genres, services, locations, campaigns, inquiries, media, clients
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `lexicoad_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `lexicoad_db`;

-- ------------------------------------------------------------------------------
-- 1. Table: site_settings
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `site_settings`;
CREATE TABLE `site_settings` (
  `id` VARCHAR(64) NOT NULL DEFAULT 'default',
  `site_name` VARCHAR(255) NOT NULL DEFAULT 'Laxico Advertising',
  `tagline` TEXT,
  `featured_brands` TEXT,
  `brand_subtitle` VARCHAR(255) DEFAULT 'OUTDOOR • TRANSIT • DIGITAL',
  `logo_text` VARCHAR(50) DEFAULT 'LAXICO',
  `logo_subtext` VARCHAR(50) DEFAULT 'ADS',
  `logo_badge` VARCHAR(10) DEFAULT 'L',
  `logo_url` TEXT,
  `favicon_url` TEXT,
  `meta_title` TEXT,
  `meta_description` TEXT,
  `phone` VARCHAR(50) DEFAULT '9742313705',
  `phone_alt` VARCHAR(50) DEFAULT '9742313705',
  `whatsapp` VARCHAR(50) DEFAULT '9742313705',
  `email` VARCHAR(255) DEFAULT 'lexicoadvertising@gmail.com',
  `email_sales` VARCHAR(255) DEFAULT 'lexicoadvertising@gmail.com',
  `udyam_number` VARCHAR(100) DEFAULT 'UDYAM-KR-03-0664055',
  `gst_number` VARCHAR(100) DEFAULT '29CTIPS2521P1ZZ',
  `about_label` TEXT,
  `about_title` TEXT,
  `about_description` LONGTEXT,
  `about_years` VARCHAR(50) DEFAULT '16+',
  `about_team_count` VARCHAR(50) DEFAULT '40+',
  `about_ad_spend` VARCHAR(50) DEFAULT '₹120Cr',
  `about_mission` TEXT,
  `about_vision` TEXT,
  `about_retention_title` TEXT,
  `about_retention_description` TEXT,
  `about_image_1` TEXT,
  `about_image_2` TEXT,
  `about_timeline` JSON,
  `about_team` JSON,
  `contact_label` TEXT,
  `contact_title` TEXT,
  `contact_description` TEXT,
  `contact_response_title` VARCHAR(255) DEFAULT '4-hr response',
  `contact_approved_title` VARCHAR(255) DEFAULT '100% Approved',
  `contact_faqs` JSON,
  `support_hours` VARCHAR(100) DEFAULT 'Mon–Sat • 10:00 AM – 7:00 PM IST',
  `head_office` TEXT,
  `office_mumbai` TEXT,
  `office_bengaluru` TEXT,
  `map_link` TEXT,
  `cities` VARCHAR(255) DEFAULT 'Delhi • Mumbai • Bengaluru • Hyderabad',
  `active_sites_count` VARCHAR(20) DEFAULT '248',
  `campaigns_count` INT UNSIGNED DEFAULT 1250,
  `locations_count` INT UNSIGNED DEFAULT 248,
  `retention_rate` INT UNSIGNED DEFAULT 98,
  `social_links` JSON,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table: media_genres
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `media_genres`;
CREATE TABLE `media_genres` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `short_name` VARCHAR(50) NOT NULL,
  `icon` VARCHAR(100) NOT NULL,
  `tagline` VARCHAR(255) DEFAULT '',
  `is_popular` TINYINT(1) DEFAULT 0,
  `sort_order` INT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table: services
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` VARCHAR(100) NOT NULL,
  `genre` VARCHAR(100) NOT NULL,
  `sub_type` VARCHAR(150) DEFAULT '',
  `chain_or_brand` VARCHAR(150) DEFAULT '',
  `audience_metric` VARCHAR(255) DEFAULT '',
  `min_spend` INT UNSIGNED NOT NULL DEFAULT 10000,
  `price` INT UNSIGNED NOT NULL DEFAULT 45000,
  `rating` DECIMAL(3,1) DEFAULT 4.7,
  `popularity` INT UNSIGNED DEFAULT 80,
  `status` VARCHAR(50) DEFAULT 'Active',
  `dims` VARCHAR(150) DEFAULT '20 × 10 ft • Backlit',
  `durations` VARCHAR(255) DEFAULT '1 Week, 2 Weeks, 1 Month, 3 Months, 6 Months, 12 Months',
  `cities` TEXT,
  `image` TEXT,
  `description` LONGTEXT,
  `lead_time` VARCHAR(100) DEFAULT '48 hours + print',
  `lighting` VARCHAR(100) DEFAULT 'Front-lit / Backlit, dusk–11pm',
  `print_spec` VARCHAR(150) DEFAULT '720 DPI flex / vinyl, weatherproof',
  `reporting` VARCHAR(150) DEFAULT 'Weekly geo-tagged photos',
  `inquiry_process` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_services_type` (`type`),
  KEY `idx_services_genre` (`genre`),
  KEY `idx_services_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Table: locations
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `locations`;
CREATE TABLE `locations` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `zone` VARCHAR(100) DEFAULT 'Central',
  `footfall` INT UNSIGNED DEFAULT 50000,
  `status` VARCHAR(50) DEFAULT 'Active',
  `price_mult` DECIMAL(4,2) DEFAULT 1.00,
  `lat` DECIMAL(10,8) NOT NULL,
  `lng` DECIMAL(11,8) NOT NULL,
  `address` TEXT,
  `images` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_locations_city` (`city`),
  KEY `idx_locations_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Table: service_locations (Many-to-Many Pivot)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `service_locations`;
CREATE TABLE `service_locations` (
  `id` VARCHAR(64) NOT NULL,
  `service_id` VARCHAR(64) NOT NULL,
  `location_id` VARCHAR(64) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_svc_loc_unique` (`service_id`, `location_id`),
  KEY `idx_sl_service` (`service_id`),
  KEY `idx_sl_location` (`location_id`),
  CONSTRAINT `fk_sl_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sl_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. Table: campaigns
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `campaigns`;
CREATE TABLE `campaigns` (
  `id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `client_name` VARCHAR(255) NOT NULL,
  `service_id` VARCHAR(64) DEFAULT NULL,
  `location_id` VARCHAR(64) DEFAULT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `status` VARCHAR(50) DEFAULT 'Live',
  `budget` INT UNSIGNED DEFAULT 100000,
  `artwork_url` TEXT,
  `proof_images` JSON,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_campaigns_status` (`status`),
  KEY `idx_campaigns_service` (`service_id`),
  KEY `idx_campaigns_location` (`location_id`),
  CONSTRAINT `fk_camp_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_camp_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. Table: inquiries
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `inquiries`;
CREATE TABLE `inquiries` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255) DEFAULT '',
  `service_id` VARCHAR(64) DEFAULT NULL,
  `location_id` VARCHAR(64) DEFAULT NULL,
  `duration` VARCHAR(100) DEFAULT '1 Month',
  `budget` VARCHAR(100) DEFAULT '₹50K – ₹2L',
  `has_artwork` TINYINT(1) DEFAULT 0,
  `message` TEXT,
  `stage` VARCHAR(50) DEFAULT 'New',
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_inquiries_stage` (`stage`),
  KEY `idx_inquiries_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. Table: media
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `media`;
CREATE TABLE `media` (
  `id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) DEFAULT 'Campaigns',
  `url` TEXT NOT NULL,
  `caption` TEXT,
  `service_id` VARCHAR(64) DEFAULT NULL,
  `location_id` VARCHAR(64) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_media_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. Table: clients
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `clients`;
CREATE TABLE `clients` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `industry` VARCHAR(100) DEFAULT 'Retail',
  `logo_url` TEXT,
  `total_campaigns` INT UNSIGNED DEFAULT 1,
  `active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- SEED DATA
-- ==============================================================================

-- 1. Site Settings Seed
INSERT INTO `site_settings` (
  `id`, `site_name`, `tagline`, `featured_brands`, `brand_subtitle`,
  `logo_text`, `logo_subtext`, `logo_badge`, `logo_url`, `favicon_url`,
  `phone`, `phone_alt`, `whatsapp`, `email`, `email_sales`,
  `udyam_number`, `gst_number`, `head_office`, `cities`, `active_sites_count`
) VALUES (
  'default',
  'Laxico Advertising',
  'Billboard & Poster Placements Across India',
  'NIKE, ZOMATO, SAMSUNG, HDFC BANK, COCA-COLA, AMAZON, TATA, SWIGGY, BOAT, MYNTRA',
  'OUTDOOR • TRANSIT • DIGITAL',
  'LAXICO',
  'ADS',
  'L',
  '/logo.png',
  '/logo.png',
  '9742313705',
  '9742313705',
  '9742313705',
  'lexicoadvertising@gmail.com',
  'lexicoadvertising@gmail.com',
  'UDYAM-KR-03-0664055',
  '29CTIPS2521P1ZZ',
  'No 1 Nandini Complex, Chandra Layout, Bangalore — 560040',
  'Delhi • Mumbai • Bengaluru • Hyderabad',
  '248'
) ON DUPLICATE KEY UPDATE `updated_at` = NOW();

-- 2. Media Genres Seed
INSERT INTO `media_genres` (`id`, `name`, `short_name`, `icon`, `tagline`, `is_popular`, `sort_order`) VALUES
('Airport', 'AIRLINE / AIRPORT', 'Airport', 'fa-solid fa-plane-departure', 'Arrival, departure & baggage belts', 1, 1),
('Cinema', 'CINEMA', 'Cinema', 'fa-solid fa-film', 'PVR INOX, Cinepolis screens & lobby', 1, 2),
('Digital', 'DIGITAL / DOOH', 'Digital', 'fa-solid fa-desktop', 'Tech parks & high-res LED walls', 1, 3),
('Outdoor', 'OUTDOOR', 'Outdoor', 'fa-solid fa-rectangle-ad', 'Highways, arterial unipoles & gantries', 1, 4),
('Transit', 'TRANSIT', 'Transit', 'fa-solid fa-train-subway', 'Metro networks, buses & railway hubs', 1, 5),
('Retail', 'MALL / RETAIL', 'Retail', 'fa-solid fa-bag-shopping', 'Atrium drop banners & food courts', 0, 6),
('Street Furniture', 'STREET / KIOSK', 'Street', 'fa-solid fa-signs-post', 'Arterial pole kiosks & street mupis', 0, 7),
('BTL', 'BTL ACTIVATIONS', 'BTL', 'fa-solid fa-bullhorn', 'Society, mall & corporate activations', 0, 8),
('Print', 'NEWSPAPER / PRINT', 'Print', 'fa-solid fa-newspaper', 'Leading English & regional dailies', 0, 9),
('Radio', 'RADIO & AUDIO', 'Radio', 'fa-solid fa-radio', 'Prime FM channels & metro RJ mentions', 0, 10),
('Sports', 'SPORTS & ARENA', 'Sports', 'fa-solid fa-person-running', 'Stadium perimeter LEDs & tour sponsorships', 0, 11),
('Television', 'TELEVISION', 'Television', 'fa-solid fa-tv', 'National news, business & regional feeds', 0, 12)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 3. Services Seed
INSERT INTO `services` (
  `id`, `name`, `type`, `genre`, `sub_type`, `chain_or_brand`,
  `audience_metric`, `min_spend`, `price`, `rating`, `popularity`,
  `dims`, `durations`, `cities`, `image`, `description`
) VALUES
(
  'svc_cinema_pvr',
  'PVR INOX Multiplex Cinema Ads',
  'Cinema',
  'Cinema',
  'On-Screen Video & Slide Ads',
  'PVR INOX',
  '280 Seats/Screen • 4.2L+ Monthly Footfall',
  11400,
  32000,
  4.9,
  97,
  '2K / 4K DCP • 10–30s Spots',
  '1 Week, 2 Weeks, 1 Month, 3 Months',
  'Mumbai, Bengaluru, Delhi NCR, Hyderabad, Pune',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
  'Captive, high-impact cinema advertising across premium PVR and INOX audi screens. On-screen slides, Dolby Atmos cinema video commercials, and lobby standees during blockbuster releases.'
),
(
  'svc_cinema_cinepolis',
  'Cinepolis Fun Republic On-Screen Ads',
  'Cinema',
  'Cinema',
  'Digital Screen & Slide Ad',
  'Cinépolis',
  '252 Seats/Screen • High Affluent Youth Dwell',
  6080,
  18500,
  4.8,
  91,
  'Full Cinema Screen • High Lumen DCP',
  '1 Week, 2 Weeks, 1 Month',
  'Mumbai, Bengaluru, Pune, Delhi NCR',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop',
  'High-visibility digital slides and video commercials before movie trailers and interval. Reach young, tech-savvy cinema-goers across premier Cinepolis locations.'
),
(
  'svc_metro',
  'Metro Station Ads & Train Wraps',
  'Transit',
  'Transit',
  'Concourse & Train Branding',
  'Metro Rail Network',
  '2.5L+ Daily Commuters per Hub',
  15000,
  45000,
  4.9,
  98,
  '20 × 10 ft • Backlit + Digital',
  '1 Week, 2 Weeks, 1 Month, 3 Months, 6 Months, 12 Months',
  'Delhi NCR, Bengaluru, Mumbai, Hyderabad',
  'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800&auto=format&fit=crop',
  'Dominate concourses, platforms, entry gates and ticket counters across DMRC & metro networks. Backlit boxes, platform screen doors, staircase wraps and train-wrap options.'
),
(
  'svc_bus',
  'Bus Shelter Posters & Mupis',
  'Transit',
  'Transit',
  'Bus Queue Shelter Mupi',
  'City Transit Network',
  '45,000+ Daily Eye-Level Vehicular Views',
  9000,
  18000,
  4.7,
  86,
  '6 × 4 ft • Backlit Mupi',
  '2 Weeks, 1 Month, 3 Months, 6 Months',
  'Bengaluru, Delhi NCR, Mumbai, Hyderabad',
  'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop',
  'Street-level frequency across high-traffic bus queue shelters. Backlit mupis with eye-level dwell time of 4–8 minutes. Sold in targeted clusters for prime coverage.'
),
(
  'svc_airport',
  'Airport Banners & Aerobridge Wraps',
  'Airport',
  'Airport',
  'Arrival & Aerobridge Branding',
  'International Airport Hubs',
  '95,000+ Daily Affluent Flyers',
  45000,
  95000,
  4.9,
  94,
  '30 × 12 ft • Arrival + Departure',
  '1 Month, 3 Months, 6 Months, 12 Months',
  'Delhi NCR, Mumbai, Bengaluru, Hyderabad',
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop',
  'Premium arrival, departure and baggage-belt banners at T3, T2 and leading airports. Reach affluent business flyers and CXOs with average dwell of 25+ minutes.'
),
(
  'svc_highway',
  'Highway Unipoles & City Hoardings',
  'Outdoor',
  'Outdoor',
  'Large Format Unipole',
  'National Highway & Expressway',
  '1.2M+ Vehicular Impressions Weekly',
  35000,
  75000,
  4.8,
  95,
  '48 × 20 ft • Front-lit Unipole',
  '1 Month, 3 Months, 6 Months, 12 Months',
  'Delhi NCR, Mumbai, Bengaluru, Hyderabad',
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop',
  'Iconic large-format unipoles on NH-48, Eastern Expressway, Airport Road and city arterial gateways. Front-lit illumination for 24/7 brand recall.'
),
(
  'svc_led',
  'Tech Park & Mall Digital DOOH Screens',
  'Digital',
  'Digital',
  'Digital DOOH LED Wall',
  'Corporate Parks & Malls',
  '1.8L+ Daily Tech Professionals & Shoppers',
  20000,
  88000,
  4.9,
  92,
  'P6 LED • 15-sec loop, 120 plays/day',
  '1 Week, 2 Weeks, 1 Month, 3 Months',
  'Bengaluru, Mumbai, Delhi NCR, Hyderabad',
  'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=800&auto=format&fit=crop',
  'Programmatic-grade LED walls at Cyber City, BKC, Manyata Tech Park & Whitefield. Day-parting, live data feeds and instant creative swaps. 120 spots/day guaranteed.'
),
(
  'svc_mall',
  'Mall Atrium Drops & Facade Displays',
  'Retail',
  'Retail',
  'Atrium Drop & Pillar Wrap',
  'Grade-A Malls',
  '3.5L+ Weekend Shopper Footfall',
  18000,
  55000,
  4.6,
  83,
  'Custom • Multi-Tier Atrium',
  '1 Week, 2 Weeks, 1 Month, 3 Months',
  'Mumbai, Bengaluru, Delhi NCR, Pune',
  'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800&auto=format&fit=crop',
  'Atrium hangings, facade glow-signs, food-court table wraps and entrance totems in top tier-1 malls. Exceptional engagement for D2C product launches and festive sales.'
),
(
  'svc_railway',
  'Railway Station Hoardings & FOBs',
  'Transit',
  'Transit',
  'Platform & Foot-Over-Bridge',
  'Indian Railways Network',
  '4.5L+ Mass Daily Footfall',
  25000,
  62000,
  4.7,
  85,
  '40 × 20 ft • Concourse + FOB',
  '1 Month, 3 Months, 6 Months, 12 Months',
  'Mumbai, Delhi NCR, Bengaluru, Hyderabad',
  'https://images.unsplash.com/photo-1565019011521-b0575cbb57c8?q=80&w=800&auto=format&fit=crop',
  'Concourse hoardings, foot-over-bridge panels and platform boards at CST, New Delhi, Howrah & major junctions. Unmatched reach for mass FMCG and consumer banking.'
),
(
  'svc_pole',
  'Arterial Street Pole Kiosks',
  'Street Furniture',
  'Street Furniture',
  'Double-Sided Backlit Pole',
  'Municipal Arterial Roads',
  '80,000+ Vehicles Daily / Corridor',
  12000,
  14000,
  4.5,
  76,
  '8 × 4 ft • Double-sided, Backlit',
  '1 Month, 3 Months, 6 Months',
  'Bengaluru, Delhi NCR, Mumbai',
  'https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=800&auto=format&fit=crop',
  'Double-sided backlit kiosks on arterial lamp posts. Hyperlocal repetitive domination along prime consumer stretches — ideal for real-estate, hospitals and retail openings.'
),
(
  'svc_btl_activation',
  'Gated Society & Corporate BTL Activations',
  'BTL',
  'BTL',
  'Canopy Setup & Product Sampling',
  'Premium Societies & Tech Parks',
  '2,500+ Qualified High-Net-Worth Households',
  15000,
  38000,
  4.8,
  88,
  '10 × 10 ft Promotional Canopy + Promoters',
  '1 Weekend, 2 Weekends, 1 Month',
  'Bengaluru, Mumbai, Delhi NCR, Hyderabad',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop',
  'Direct interactive kiosk activations, product sampling, and test-drive booths in premier residential townships and tech park cafeterias with verified lead capture.'
),
(
  'svc_print_newspaper',
  'Leading Newspaper Jackets & Display Ads',
  'Print',
  'Print',
  'Front Page Jacket & Display Ad',
  'National & Regional Dailies',
  '8.5L+ Verified Daily Circulation',
  30000,
  85000,
  4.7,
  82,
  'Full Page / Half Page / Jacket',
  '1 Insertion, 3 Insertions, 6 Insertions',
  'Delhi NCR, Mumbai, Bengaluru, Hyderabad',
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop',
  'Full page jackets, display ads, and custom inserts in leading English & regional newspapers. Maximum credibility and immediate city-wide buzz for brand launches.'
)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `price` = VALUES(`price`);

SET FOREIGN_KEY_CHECKS = 1;
