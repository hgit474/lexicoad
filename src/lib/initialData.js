// Laxico Advertising Initial Default Database (LocalStorage Fallback & Seed Data)

export const initialSettings = {
  id: 'default',
  site_name: 'Laxico Advertising',
  tagline: 'Billboard & Poster Placements Across India',
  featured_brands: 'NIKE, ZOMATO, SAMSUNG, HDFC BANK, COCA-COLA, AMAZON, TATA, SWIGGY, BOAT, MYNTRA',
  brand_subtitle: 'OUTDOOR • TRANSIT • DIGITAL',
  logo_text: 'LAXICO',
  logo_subtext: 'ADS',
  logo_badge: 'L',
  logo_url: '/logo.png', // Admin upload can replace this local default
  favicon_url: '/logo.png', // Admin upload can replace this local default
  meta_title: 'Laxico Advertising — Billboard & Poster Placements Across India',
  meta_description: 'Laxico Advertising manages 250+ premium billboard & poster placements across metros, airports, highways and malls in India.',
  phone: '9742313705',
  phone_alt: '9742313705',
  whatsapp: '9742313705',
  email: 'lexicoadvertising@gmail.com',
  email_sales: 'lexicoadvertising@gmail.com',
  udyam_number: 'UDYAM-KR-03-0664055',
  gst_number: '29CTIPS2521P1ZZ',
  about_label: 'Since 2025',
  about_title: 'About Laxico & Contact',
  about_description: "From 3 billboards on NH-8 to India's most data-driven outdoor network — we blend prime media ownership with performance tracking every CMO loves.",
  about_years: '16+',
  about_team_count: '40+',
  about_ad_spend: '₹120Cr',
  about_mission: 'Make outdoor advertising as measurable and effortless as digital — with verified footfall, transparent pricing and photo-proof of every display.',
  about_vision: 'A Laxico screen within 10 minutes of every urban Indian — powering local businesses and national brands alike across 50 cities by 2030.',
  about_retention_title: 'Why clients stay',
  about_retention_description: '98% retention. Single-point ownership, in-house printing, night monitoring patrols and a client dashboard with live display photos.',
  about_image_1: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=700&auto=format&fit=crop',
  about_image_2: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=700&auto=format&fit=crop',
  about_timeline: '[]',
  about_team: '[]',
  contact_label: 'Get a quote',
  contact_title: 'Contact / Inquiry',
  contact_description: 'Select your service & location. Our strategist replies with photos, footfall & pricing within 4 working hours.',
  contact_response_title: '4-hr response',
  contact_approved_title: '100% Approved',
  contact_faqs: JSON.stringify([
    { q: 'How fast can my ad go live?', a: '48 hours from artwork approval — including printing, mounting and illumination. Airport & metro sites may need 72 hrs for security clearance.' },
    { q: 'Are your sites government-approved?', a: 'Yes. Every Laxico site carries MCD / DMRC / AAI / railway approvals. We share permit copies with your invoice.' },
    { q: 'Do you handle printing?', a: 'In-house plant in Delhi. 720 DPI flex, vinyl & backlit from ₹8,500 per site with free installation.' },
    { q: 'How do I get proof my ad is displayed?', a: 'Geo-tagged day + night photos every week on WhatsApp, plus a completion report with traffic data.' },
    { q: 'What is the minimum booking?', a: 'Street kiosks: 20 poles / 1 month. Billboards & transit: 1 site / 1 month. LEDs: 1 week.' }
  ]),
  support_hours: 'Mon–Sat • 10:00 AM – 7:00 PM IST',
  head_office: 'No 1 Nandini Complex, Chandra Layout, Bangalore — 560040',
  office_mumbai: 'BKC Office, Bandra Kurla Complex, Mumbai — 400051',
  office_bengaluru: 'HSR Office, Sector 1, HSR Layout, Bengaluru — 560102',
  map_link: 'https://maps.google.com/?q=No+1+Nandini+Complex+Chandra+Layout+Bangalore+560040',
  cities: 'Delhi • Mumbai • Bengaluru • Hyderabad',
  active_sites_count: '248',
  campaigns_count: 1250,
  locations_count: 248,
  retention_rate: 98,
  social_links: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com',
    youtube: 'https://youtube.com'
  }
};

export const initialServices = [
  {
    id: 'svc_metro',
    name: 'Metro Station Ads',
    type: 'Transit',
    price: 45000,
    rating: 4.9,
    popularity: 98,
    status: 'Active',
    dims: '20 × 10 ft • Backlit + Digital',
    durations: '1 Week, 2 Weeks, 1 Month, 3 Months, 6 Months, 12 Months',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800&auto=format&fit=crop',
    description: 'Dominate concourses, platforms, entry gates and ticket counters across DMRC & metro networks. Backlit boxes, platform screen doors, staircase wraps and train-wrap options with 2.5L+ daily footfall per hub.'
  },
  {
    id: 'svc_bus',
    name: 'Bus Shelter Posters',
    type: 'Transit',
    price: 18000,
    rating: 4.7,
    popularity: 86,
    status: 'Active',
    dims: '6 × 4 ft • Backlit Mupi',
    durations: '2 Weeks, 1 Month, 3 Months, 6 Months',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop',
    description: 'Street-level frequency across high-traffic bus queue shelters. Backlit mupis with eye-level dwell time of 4–8 minutes. Sold in clusters of 6/12/25 shelters for city-wide coverage.'
  },
  {
    id: 'svc_airport',
    name: 'Airport Banners',
    type: 'Airport',
    price: 95000,
    rating: 4.9,
    popularity: 92,
    status: 'Active',
    dims: '30 × 12 ft • Arrival + Departure',
    durations: '1 Month, 3 Months, 6 Months, 12 Months',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop',
    description: 'Premium arrival, departure and baggage-belt banners at T3, T2 and leading airports. Reach affluent flyers with 90k+ daily passengers and 12-min average dwell.'
  },
  {
    id: 'svc_highway',
    name: 'Highway Billboards',
    type: 'Outdoor',
    price: 75000,
    rating: 4.8,
    popularity: 95,
    status: 'Active',
    dims: '48 × 20 ft • Front-lit Unipole',
    durations: '1 Month, 3 Months, 6 Months, 12 Months',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop',
    description: 'Iconic large-format unipoles on NH-48, Eastern Expressway, Yamuna Expressway and city gateways. Night front-lit, 1M+ vehicular impressions weekly per site.'
  },
  {
    id: 'svc_mall',
    name: 'Mall Atrium Displays',
    type: 'Retail',
    price: 55000,
    rating: 4.6,
    popularity: 80,
    status: 'Active',
    dims: 'Custom • Atrium + Facade',
    durations: '1 Week, 2 Weeks, 1 Month, 3 Months',
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800&auto=format&fit=crop',
    description: 'Atrium hangings, facade glow-signs, food-court table wraps and entrance totems in top malls. Perfect for launches, festive sales and D2C sampling.'
  },
  {
    id: 'svc_railway',
    name: 'Railway Station Hoardings',
    type: 'Transit',
    price: 62000,
    rating: 4.7,
    popularity: 84,
    status: 'Active',
    dims: '40 × 20 ft • Concourse + FOB',
    durations: '1 Month, 3 Months, 6 Months, 12 Months',
    image: 'https://images.unsplash.com/photo-1565019011521-b0575cbb57c8?q=80&w=800&auto=format&fit=crop',
    description: 'Concourse hoardings, foot-over-bridge panels and platform boards at CST, New Delhi, Howrah & 20+ A1 stations. 4L+ daily footfall, unmatched for mass FMCG.'
  },
  {
    id: 'svc_pole',
    name: 'Street Pole Kiosks',
    type: 'Street Furniture',
    price: 12000,
    rating: 4.5,
    popularity: 74,
    status: 'Active',
    dims: '8 × 4 ft • Double-sided, Backlit',
    durations: '1 Month, 3 Months, 6 Months',
    image: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=800&auto=format&fit=crop',
    description: 'Double-sided backlit kiosks on arterial lamp posts. Hyperlocal domination — ideal for real-estate, retail openings, coaching and clinics. Min. 20 poles.'
  },
  {
    id: 'svc_led',
    name: 'Corporate Park Digital Screens',
    type: 'Digital',
    price: 88000,
    rating: 4.9,
    popularity: 90,
    status: 'Active',
    dims: 'P6 LED • 15-sec loop, 120 plays/day',
    durations: '1 Week, 2 Weeks, 1 Month, 3 Months',
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=800&auto=format&fit=crop',
    description: 'Programmatic-grade LED walls at Cyber City, BKC, Hitech City & Whitefield. Day-parting, live data feeds and instant creative swaps. 120 spots/day guaranteed.'
  }
];

export const initialLocations = [
  {
    id: 'loc_1',
    name: 'Central Metro Hub — Concourse',
    city: 'New Delhi',
    zone: 'Central',
    footfall: 250000,
    size: '20 × 10 ft Backlit ×6',
    status: 'Occupied',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'loc_2',
    name: 'Airport T3 Arrival Corridor',
    city: 'New Delhi',
    zone: 'South',
    footfall: 92000,
    size: '30 × 12 ft Banner ×4',
    status: 'Occupied',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'loc_3',
    name: 'NH-48 Unipole — Cyber City Cut',
    city: 'Gurugram',
    zone: 'South',
    footfall: 180000,
    size: '48 × 20 ft Unipole',
    status: 'Occupied',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'loc_4',
    name: 'MG Road Bus Shelters (12 Units)',
    city: 'Bengaluru',
    zone: 'Central',
    footfall: 85000,
    size: '6 × 4 ft Mupi ×12',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'loc_5',
    name: 'Phoenix Mall — Grand Atrium',
    city: 'Mumbai',
    zone: 'West',
    footfall: 65000,
    size: 'Atrium + Facade',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'loc_6',
    name: 'CST Concourse Hoarding Wall',
    city: 'Mumbai',
    zone: 'South',
    footfall: 410000,
    size: '40 × 20 ft ×3',
    status: 'Occupied',
    image: 'https://images.unsplash.com/photo-1565019011521-b0575cbb57c8?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'loc_7',
    name: 'Cyber Hub LED Wall',
    city: 'Gurugram',
    zone: 'South',
    footfall: 48000,
    size: 'P6 LED 24×12 ft',
    status: 'Occupied',
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'loc_8',
    name: 'Marine Drive Pole Cluster (24)',
    city: 'Mumbai',
    zone: 'South',
    footfall: 120000,
    size: '8×4 ft ×24 poles',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'loc_9',
    name: 'Rajiv Chowk Metro Gates',
    city: 'New Delhi',
    zone: 'Central',
    footfall: 320000,
    size: 'Gate wraps + PSD',
    status: 'Occupied',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'loc_10',
    name: 'Hitech City LED — Madhapur',
    city: 'Hyderabad',
    zone: 'West',
    footfall: 55000,
    size: 'P6 LED 20×10 ft',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'loc_11',
    name: 'Yamuna Expressway Gantry',
    city: 'Noida',
    zone: 'East',
    footfall: 95000,
    size: '60 × 15 ft Gantry',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'loc_12',
    name: 'Airport Express Metro — Pillars',
    city: 'New Delhi',
    zone: 'South',
    footfall: 110000,
    size: 'Pillar wraps ×18',
    status: 'Maintenance',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800&auto=format&fit=crop'
  }
];

export const initialServiceLocations = [
  { id: 'sl1', service_id: 'svc_metro', location_id: 'loc_1' },
  { id: 'sl2', service_id: 'svc_metro', location_id: 'loc_9' },
  { id: 'sl3', service_id: 'svc_metro', location_id: 'loc_12' },
  { id: 'sl4', service_id: 'svc_bus', location_id: 'loc_4' },
  { id: 'sl5', service_id: 'svc_bus', location_id: 'loc_8' },
  { id: 'sl6', service_id: 'svc_airport', location_id: 'loc_2' },
  { id: 'sl7', service_id: 'svc_highway', location_id: 'loc_3' },
  { id: 'sl8', service_id: 'svc_highway', location_id: 'loc_11' },
  { id: 'sl9', service_id: 'svc_mall', location_id: 'loc_5' },
  { id: 'sl10', service_id: 'svc_railway', location_id: 'loc_6' },
  { id: 'sl11', service_id: 'svc_led', location_id: 'loc_7' },
  { id: 'sl12', service_id: 'svc_led', location_id: 'loc_10' },
  { id: 'sl13', service_id: 'svc_pole', location_id: 'loc_8' },
  { id: 'sl14', service_id: 'svc_pole', location_id: 'loc_4' }
];

export const initialCampaigns = [
  {
    id: 'cp1',
    title: 'Nike — Just Do It Takeover',
    client: 'Nike India',
    service_id: 'svc_highway',
    location_id: 'loc_3',
    start_date: '2026-08-01',
    end_date: '2026-11-01',
    budget: 680000,
    status: 'Live',
    artwork: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?q=80&w=800&auto=format&fit=crop',
    notes: 'Front-lit unipole + night patrol'
  },
  {
    id: 'cp2',
    title: 'Zomato Feast Fest — Metro Domination',
    client: 'Zomato',
    service_id: 'svc_metro',
    location_id: 'loc_1',
    start_date: '2026-08-15',
    end_date: '2026-10-15',
    budget: 420000,
    status: 'Live',
    artwork: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800&auto=format&fit=crop',
    notes: 'Concourse + gate wraps'
  },
  {
    id: 'cp3',
    title: 'Galaxy Z Fold — Airport Arrival',
    client: 'Samsung India',
    service_id: 'svc_airport',
    location_id: 'loc_2',
    start_date: '2026-09-01',
    end_date: '2026-12-01',
    budget: 890000,
    status: 'Live',
    artwork: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop',
    notes: 'T3 arrival + baggage belt'
  },
  {
    id: 'cp4',
    title: 'HDFC Millennia — Railway Concourse',
    client: 'HDFC Bank',
    service_id: 'svc_railway',
    location_id: 'loc_6',
    start_date: '2026-07-10',
    end_date: '2026-09-10',
    budget: 310000,
    status: 'Completed',
    artwork: 'https://images.unsplash.com/photo-1565019011521-b0575cbb57c8?q=80&w=800&auto=format&fit=crop',
    notes: 'FOB panels + concourse'
  },
  {
    id: 'cp5',
    title: 'Coke Summer — Cyber Hub LED',
    client: 'Coca-Cola',
    service_id: 'svc_led',
    location_id: 'loc_7',
    start_date: '2026-09-10',
    end_date: '2026-10-10',
    budget: 260000,
    status: 'Live',
    artwork: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=800&auto=format&fit=crop',
    notes: '120 plays/day, day-parted'
  },
  {
    id: 'cp6',
    title: 'Phoenix Fest — Atrium Launch',
    client: 'Zomato',
    service_id: 'svc_mall',
    location_id: 'loc_5',
    start_date: '2026-10-05',
    end_date: '2026-10-20',
    budget: 180000,
    status: 'Scheduled',
    artwork: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800&auto=format&fit=crop',
    notes: 'Atrium + sampling kiosk'
  },
  {
    id: 'cp7',
    title: 'Bus Shelter — Fintech Pilot',
    client: 'HDFC Bank',
    service_id: 'svc_bus',
    location_id: 'loc_4',
    start_date: '2026-09-20',
    end_date: '2026-11-20',
    budget: 145000,
    status: 'Scheduled',
    artwork: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop',
    notes: '12 mupis cluster'
  }
];

export const initialInquiries = [
  {
    id: 'iq1',
    name: 'Priya Sharma',
    phone: '+91 98111 22334',
    email: 'priya@d2cbrand.in',
    company: 'GlowKart D2C',
    service_id: 'svc_mall',
    location_id: 'loc_5',
    duration: '1 Month',
    budget: '₹2L – ₹5L',
    message: 'Festive launch in Mumbai malls, need atrium + facade for 3 weeks in Oct.',
    stage: 'New',
    date: '2026-09-10',
    followup: '2026-09-14'
  },
  {
    id: 'iq2',
    name: 'Rahul Verma',
    phone: '+91 99300 11223',
    email: 'rahul@realty.in',
    company: 'Verma Estates',
    service_id: 'svc_highway',
    location_id: 'loc_3',
    duration: '3 Months',
    budget: '₹5L – ₹15L',
    message: 'New township on NH-48, need unipole + gantry combo.',
    stage: 'Quoted',
    date: '2026-09-08',
    followup: '2026-09-13'
  },
  {
    id: 'iq3',
    name: 'Sneha Kulkarni',
    phone: '+91 98450 66778',
    email: 'sneha@edtech.in',
    company: 'LearnLeap',
    service_id: 'svc_metro',
    location_id: 'loc_9',
    duration: '6 Months',
    budget: '₹15L+',
    message: 'Admissions season — Rajiv Chowk + Central Hub domination.',
    stage: 'Contacted',
    date: '2026-09-11',
    followup: '2026-09-15'
  },
  {
    id: 'iq4',
    name: 'Amit Patel',
    phone: '+91 98102 33445',
    email: 'amit@finserve.in',
    company: 'PaySwift',
    service_id: 'svc_led',
    location_id: 'loc_7',
    duration: '2 Weeks',
    budget: '₹50K – ₹2L',
    message: 'App launch, need Cyber Hub LED with QR creative.',
    stage: 'New',
    date: '2026-09-12',
    followup: '2026-09-14'
  },
  {
    id: 'iq5',
    name: 'Divya Menon',
    phone: '+91 97400 55667',
    email: 'divya@jewels.in',
    company: 'Malabar Jewels',
    service_id: 'svc_airport',
    location_id: 'loc_2',
    duration: '3 Months',
    budget: '₹5L – ₹15L',
    message: 'Diwali campaign at T3 arrivals.',
    stage: 'Converted',
    date: '2026-09-05',
    followup: '—'
  }
];

export const initialMedia = [
  {
    id: 'm1',
    title: 'Highway Unipole — Night Glow',
    tag: 'Highway Billboards',
    service_id: 'svc_highway',
    url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'm2',
    title: 'Metro Concourse Wrap',
    tag: 'Metro Station Ads',
    service_id: 'svc_metro',
    url: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'm3',
    title: 'T3 Arrival Banner',
    tag: 'Airport Banners',
    service_id: 'svc_airport',
    url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'm4',
    title: 'Bus Shelter Mupi — Day',
    tag: 'Bus Shelter Posters',
    service_id: 'svc_bus',
    url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'm5',
    title: 'Mall Atrium Launch',
    tag: 'Mall Atrium Displays',
    service_id: 'svc_mall',
    url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'm6',
    title: 'Railway Concourse Wall',
    tag: 'Railway Station Hoardings',
    service_id: 'svc_railway',
    url: 'https://images.unsplash.com/photo-1565019011521-b0575cbb57c8?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'm7',
    title: 'Cyber Hub LED — Evening',
    tag: 'Digital LED',
    service_id: 'svc_led',
    url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'm8',
    title: 'City Night Centre',
    tag: 'Street Pole Kiosks',
    service_id: 'svc_pole',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'm9',
    title: 'Times-Style LED Burst',
    tag: 'Digital LED',
    service_id: 'svc_led',
    url: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?q=80&w=800&auto=format&fit=crop'
  }
];

export const initialClients = [
  { id: 'cl1', name: 'Nike India', contact: 'Rohan Mehta', phone: '+91 98200 11223', email: 'rohan@nike.in' },
  { id: 'cl2', name: 'Zomato', contact: 'Ananya Rao', phone: '+91 99301 44556', email: 'ananya@zomato.com' },
  { id: 'cl3', name: 'Samsung India', contact: 'Vikram Iyer', phone: '+91 98111 77889', email: 'vikram@samsung.in' },
  { id: 'cl4', name: 'HDFC Bank', contact: 'Kavya Nair', phone: '+91 98450 22334', email: 'kavya@hdfc.in' },
  { id: 'cl5', name: 'Coca-Cola', contact: 'Arjun Kapoor', phone: '+91 98100 99001', email: 'arjun@coke.in' }
];
