/**
 * Laxico Advertising - Per-Category Excel Template Engine & Validator
 * Supports Dynamic SheetJS loading (no bundle bloat), per-category schemas,
 * rigorous field-level validation, reference checks, and error report generation.
 */

let xlsxCache = null;

/**
 * Dynamically loads SheetJS only when needed
 */
export const getXLSX = async () => {
  if (!xlsxCache) {
    xlsxCache = await import('xlsx');
  }
  return xlsxCache;
};

// Recognized system cities for reference checks
export const DEFAULT_KNOWN_CITIES = [
  'Delhi NCR', 'Delhi', 'New Delhi', 'Gurugram', 'Noida', 'Faridabad', 'Ghaziabad',
  'Mumbai', 'Navi Mumbai', 'Thane',
  'Bengaluru', 'Bangalore',
  'Hyderabad', 'Secunderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Goa',
  'Jaipur',
  'Pan India'
];

/**
 * Category Specifications: Column Headers, Friendly Column Widths,
 * 1 Production-grade Sample Row, and Unique Upsert Key generators.
 */
export const CATEGORY_SCHEMAS = {
  Transit: {
    key: 'Transit',
    label: 'Transit (Metro & Train)',
    columns: [
      'transit_type',
      'route_or_line',
      'station_or_depot',
      'city',
      'title',
      'media_type',
      'price',
      'reach',
      'dimensions',
      'available_from',
      'description',
      'image_url'
    ],
    colWidths: [16, 24, 22, 16, 38, 20, 14, 14, 18, 16, 45, 38],
    sampleRow: [
      'Metro',
      'Blue Line (Line 3)',
      'Rajiv Chowk Station',
      'Delhi NCR',
      'Blue Line 6-Coach Full Train Wrap',
      'Full Train Wrap',
      185000,
      1200000,
      '6 Coaches Exterior',
      '2026-11-01',
      'High-impact full exterior vinyl wrap traversing Dwarka to Noida/Vaishali commercial corridor.',
      'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800&auto=format&fit=crop'
    ],
    generateUpsertKey: (row) =>
      `transit:${cleanStr(row.transit_type)}:${cleanStr(row.route_or_line)}:${cleanStr(row.city)}:${cleanStr(row.media_type)}:${cleanStr(row.title)}`
  },

  Bus: {
    key: 'Bus',
    label: 'Bus Fleet Advertising',
    columns: [
      'bus_operator',
      'bus_type',
      'route_number',
      'city',
      'title',
      'media_type',
      'price',
      'reach',
      'fleet_size',
      'available_from',
      'description',
      'image_url'
    ],
    colWidths: [16, 22, 20, 16, 38, 18, 14, 14, 12, 16, 45, 38],
    sampleRow: [
      'BMTC',
      'AC Low-Floor Electric',
      'Vayu Vajra KIA-8',
      'Bengaluru',
      'Kempegowda Airport Feeder Bus Full Wrap',
      'Full Bus Wrap',
      48000,
      680000,
      5,
      '2026-11-01',
      'Complete exterior vinyl wrap on air-conditioned electric buses covering high-dwell airport routes.',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop'
    ],
    generateUpsertKey: (row) =>
      `bus:${cleanStr(row.bus_operator)}:${cleanStr(row.route_number)}:${cleanStr(row.city)}:${cleanStr(row.media_type)}:${cleanStr(row.title)}`
  },

  Cinema: {
    key: 'Cinema',
    label: 'Cinema Advertising',
    columns: [
      'multiplex_chain',
      'property_name',
      'screen_number',
      'city',
      'title',
      'media_type',
      'slot_timing',
      'price',
      'reach',
      'seating_capacity',
      'available_from',
      'description',
      'image_url'
    ],
    colWidths: [18, 28, 16, 16, 38, 22, 18, 14, 14, 16, 16, 45, 38],
    sampleRow: [
      'PVR INOX',
      'Ambience Mall Gurugram',
      'Audi 1 - IMAX',
      'Delhi NCR',
      'IMAX Screen 30s Commercial Pre-Roll',
      'On-Screen 30s Video',
      'All Shows',
      65000,
      45000,
      380,
      '2026-11-01',
      'Full HD on-screen audio-visual pre-roll commercial before major Hollywood/Bollywood releases.',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop'
    ],
    generateUpsertKey: (row) =>
      `cinema:${cleanStr(row.multiplex_chain)}:${cleanStr(row.property_name)}:${cleanStr(row.screen_number)}:${cleanStr(row.media_type)}:${cleanStr(row.title)}`
  },

  Outdoor: {
    key: 'Outdoor',
    label: 'Outdoor (Billboards & Unipoles)',
    columns: [
      'placement_type',
      'landmark_location',
      'city',
      'title',
      'media_type',
      'illumination',
      'dimensions',
      'price',
      'reach',
      'available_from',
      'description',
      'image_url'
    ],
    colWidths: [18, 30, 16, 40, 20, 16, 16, 14, 14, 16, 45, 38],
    sampleRow: [
      'Unipole',
      'Bandra Western Express Highway',
      'Mumbai',
      'Iconic WEH Bandra South-Bound Mega Unipole',
      'Backlit Billboard',
      'Backlit',
      '60x30 ft',
      220000,
      1800000,
      '2026-11-01',
      'High-dwell vehicular corridor facing non-stop corporate executive traffic connecting BKC & Airport.',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop'
    ],
    generateUpsertKey: (row) =>
      `outdoor:${cleanStr(row.landmark_location)}:${cleanStr(row.city)}:${cleanStr(row.dimensions)}:${cleanStr(row.title)}`
  },

  Airport: {
    key: 'Airport',
    label: 'Airport Advertising',
    columns: [
      'airport_name',
      'terminal',
      'zone',
      'city',
      'title',
      'media_type',
      'price',
      'reach',
      'dimensions',
      'available_from',
      'description',
      'image_url'
    ],
    colWidths: [20, 16, 26, 16, 40, 20, 14, 14, 18, 16, 45, 38],
    sampleRow: [
      'IGI Airport',
      'Terminal 3',
      'International Departures Security',
      'Delhi NCR',
      'T3 Security Concourse 85-inch Ultra-HD Totem',
      'Digital Totem',
      285000,
      920000,
      '85-inch 4K UHD',
      '2026-11-01',
      'Ultra-HD 85-inch digital freestanding totem network positioned directly before international security gates.',
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop'
    ],
    generateUpsertKey: (row) =>
      `airport:${cleanStr(row.airport_name)}:${cleanStr(row.terminal)}:${cleanStr(row.zone)}:${cleanStr(row.media_type)}:${cleanStr(row.title)}`
  },

  Digital: {
    key: 'Digital',
    label: 'Digital DOOH Networks',
    columns: [
      'venue_type',
      'location_name',
      'city',
      'title',
      'media_type',
      'resolution',
      'slot_duration_sec',
      'loops_per_hour',
      'price',
      'reach',
      'operating_hours',
      'available_from',
      'description',
      'image_url'
    ],
    colWidths: [22, 28, 16, 40, 20, 16, 18, 16, 14, 14, 18, 16, 45, 38],
    sampleRow: [
      'Curved Outdoor LED',
      'Bandra Reclamation Junction',
      'Mumbai',
      'Bandra Iconic Curved High-Lumen P6 DOOH',
      'DOOH LED Screen',
      '3840x1080 P6',
      15,
      120,
      240000,
      1950000,
      '06:00 - 00:00',
      '2026-11-01',
      'High-brightness daylight visible P6 curved digital screen with dynamic day/night creative scheduling.',
      'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=800&auto=format&fit=crop'
    ],
    generateUpsertKey: (row) =>
      `digital:${cleanStr(row.venue_type)}:${cleanStr(row.location_name)}:${cleanStr(row.city)}:${cleanStr(row.title)}`
  }
};

/**
 * Normalizes string for key generation
 */
function cleanStr(val) {
  if (val === undefined || val === null) return '';
  return String(val).toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Normalizes an object's keys to match target schema columns regardless of casing or spacing
 */
export const normalizeRowKeys = (rawRow) => {
  const normalized = {};
  for (const [key, val] of Object.entries(rawRow || {})) {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    normalized[cleanKey] = val;
  }
  return normalized;
};

/**
 * Validates a standard date string (YYYY-MM-DD or standard parseable dates)
 */
export const isValidDateString = (val) => {
  if (!val) return true; // Optional date is valid if empty
  if (val instanceof Date && !isNaN(val.getTime())) return true;
  const str = String(val).trim();
  // Check ISO format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = new Date(str);
    return !isNaN(d.getTime());
  }
  // Try general Date parse
  const d = new Date(str);
  return !isNaN(d.getTime());
};

/**
 * Formats a date value cleanly to YYYY-MM-DD
 */
export const formatDateString = (val) => {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().split('T')[0];
  }
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return str;
};

/**
 * Validates and cleans a price / currency number
 */
export const cleanPriceNumber = (val) => {
  if (val === undefined || val === null || val === '') return NaN;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  return Number(cleaned);
};

/**
 * Validates city against known system cities and locations
 */
export const isKnownCity = (cityVal, contextCities = []) => {
  if (!cityVal || !cityVal.trim()) return false;
  const clean = cityVal.trim().toLowerCase();
  const allCities = [...DEFAULT_KNOWN_CITIES, ...contextCities];
  return allCities.some(c => {
    const cand = c.toLowerCase();
    return clean === cand || clean.includes(cand) || cand.includes(clean);
  });
};

/* =========================================================================
 * INDIVIDUAL PER-CATEGORY ROW VALIDATORS
 * ========================================================================= */

export const validateTransitRow = (norm, rowNumber, context = {}) => {
  const errors = [];
  const transit_type = String(norm.transittype || norm.type || '').trim();
  const route_or_line = String(norm.routeorline || norm.route || norm.line || '').trim();
  const station_or_depot = String(norm.stationordepot || norm.station || norm.depot || '').trim();
  const city = String(norm.city || norm.location || '').trim();
  const title = String(norm.title || norm.name || '').trim();
  const media_type = String(norm.mediatype || norm.format || 'Full Train Wrap').trim();
  const dimensions = String(norm.dimensions || norm.size || '').trim();
  const rawPrice = norm.price || norm.rate;
  const price = cleanPriceNumber(rawPrice);
  const reach = cleanPriceNumber(norm.reach || norm.commuters || norm.impressions);
  const available_from = formatDateString(norm.availablefrom || norm.date);
  const description = norm.description ? String(norm.description).trim() : '';
  const image_url = norm.imageurl || norm.image ? String(norm.imageurl || norm.image).trim() : '';

  if (!transit_type) errors.push('Required: Transit Type is missing (e.g. Metro, Train)');
  if (!route_or_line) errors.push('Required: Route or Line is missing (e.g. Blue Line)');
  if (!city) {
    errors.push('Required: City is missing');
  } else if (!isKnownCity(city, context.knownCities)) {
    errors.push(`Reference Error: City "${city}" not recognized in active locations`);
  }
  if (!title) errors.push('Required: Title is missing');
  if (isNaN(price) || price <= 0) errors.push('Required: Price must be a valid positive number');
  if (norm.availablefrom && !isValidDateString(norm.availablefrom)) {
    errors.push(`Format Error: "available_from" must be a valid date (YYYY-MM-DD)`);
  }

  const upsertKey = CATEGORY_SCHEMAS.Transit.generateUpsertKey({
    transit_type, route_or_line, city, media_type, title
  });

  return {
    rowNumber,
    category: 'Transit',
    subcategory: transit_type || 'Metro Networks',
    title: title || `Row ${rowNumber}`,
    location: station_or_depot ? `${city} (${station_or_depot})` : city,
    city,
    price: !isNaN(price) && price > 0 ? price : 0,
    media_type,
    reach: !isNaN(reach) && reach >= 0 ? reach : null,
    description,
    image_url,
    dimensions,
    available_from,
    upsertKey,
    metadata: { transit_type, route_or_line, station_or_depot, dimensions, available_from },
    errors,
    isValid: errors.length === 0
  };
};

export const validateBusRow = (norm, rowNumber, context = {}) => {
  const errors = [];
  const bus_operator = String(norm.busoperator || norm.operator || norm.agency || '').trim();
  const bus_type = String(norm.bustype || norm.type || '').trim();
  const route_number = String(norm.routenumber || norm.route || '').trim();
  const city = String(norm.city || norm.location || '').trim();
  const title = String(norm.title || norm.name || '').trim();
  const media_type = String(norm.mediatype || norm.format || 'Full Bus Wrap').trim();
  const fleet_size = norm.fleetsize ? cleanPriceNumber(norm.fleetsize) : 1;
  const price = cleanPriceNumber(norm.price || norm.rate);
  const reach = cleanPriceNumber(norm.reach || norm.impressions);
  const available_from = formatDateString(norm.availablefrom || norm.date);
  const description = norm.description ? String(norm.description).trim() : '';
  const image_url = norm.imageurl || norm.image ? String(norm.imageurl || norm.image).trim() : '';

  if (!bus_operator) errors.push('Required: Bus Operator is missing (e.g. DTC, BEST, BMTC)');
  if (!route_number) errors.push('Required: Route Number is missing (e.g. Route 505)');
  if (!city) {
    errors.push('Required: City is missing');
  } else if (!isKnownCity(city, context.knownCities)) {
    errors.push(`Reference Error: City "${city}" not recognized in active locations`);
  }
  if (!title) errors.push('Required: Title is missing');
  if (isNaN(price) || price <= 0) errors.push('Required: Price must be a valid positive number');
  if (norm.fleetsize && (isNaN(fleet_size) || fleet_size <= 0)) {
    errors.push('Format Error: Fleet Size must be an integer >= 1');
  }
  if (norm.availablefrom && !isValidDateString(norm.availablefrom)) {
    errors.push(`Format Error: "available_from" must be a valid date (YYYY-MM-DD)`);
  }

  const upsertKey = CATEGORY_SCHEMAS.Bus.generateUpsertKey({
    bus_operator, route_number, city, media_type, title
  });

  return {
    rowNumber,
    category: 'Bus',
    subcategory: bus_operator || 'Bus Fleet',
    title: title || `Row ${rowNumber}`,
    location: `${city} (${route_number})`,
    city,
    price: !isNaN(price) && price > 0 ? price : 0,
    media_type,
    reach: !isNaN(reach) && reach >= 0 ? reach : null,
    description,
    image_url,
    available_from,
    upsertKey,
    metadata: { bus_operator, bus_type, route_number, fleet_size, available_from },
    errors,
    isValid: errors.length === 0
  };
};

export const validateCinemaRow = (norm, rowNumber, context = {}) => {
  const errors = [];
  const multiplex_chain = String(norm.multiplexchain || norm.chain || norm.brand || '').trim();
  const property_name = String(norm.propertyname || norm.mall || norm.theatre || norm.property || '').trim();
  const screen_number = String(norm.screennumber || norm.audi || norm.screen || 'Audi 1').trim();
  const city = String(norm.city || norm.location || '').trim();
  const title = String(norm.title || norm.name || '').trim();
  const media_type = String(norm.mediatype || norm.format || 'On-Screen 30s Video').trim();
  const slot_timing = String(norm.slottiming || norm.timing || norm.slot || 'All Shows').trim();
  const seating_capacity = norm.seatingcapacity ? cleanPriceNumber(norm.seatingcapacity) : null;
  const price = cleanPriceNumber(norm.price || norm.rate);
  const reach = cleanPriceNumber(norm.reach || norm.admissions || norm.footfall);
  const available_from = formatDateString(norm.availablefrom || norm.date);
  const description = norm.description ? String(norm.description).trim() : '';
  const image_url = norm.imageurl || norm.image ? String(norm.imageurl || norm.image).trim() : '';

  if (!multiplex_chain) errors.push('Required: Multiplex Chain is missing (e.g. PVR INOX, Cinepolis)');
  if (!property_name) errors.push('Required: Cinema Property Name is missing (e.g. Ambience Mall)');
  if (!city) {
    errors.push('Required: City is missing');
  } else if (!isKnownCity(city, context.knownCities)) {
    errors.push(`Reference Error: City "${city}" not recognized in active locations`);
  }
  if (!title) errors.push('Required: Title is missing');
  if (isNaN(price) || price <= 0) errors.push('Required: Price must be a valid positive number');
  if (norm.availablefrom && !isValidDateString(norm.availablefrom)) {
    errors.push(`Format Error: "available_from" must be a valid date (YYYY-MM-DD)`);
  }

  const upsertKey = CATEGORY_SCHEMAS.Cinema.generateUpsertKey({
    multiplex_chain, property_name, screen_number, media_type, title
  });

  return {
    rowNumber,
    category: 'Cinema',
    subcategory: multiplex_chain || 'Multiplex Screens',
    title: title || `Row ${rowNumber}`,
    location: `${city} (${property_name})`,
    city,
    price: !isNaN(price) && price > 0 ? price : 0,
    media_type,
    reach: !isNaN(reach) && reach >= 0 ? reach : null,
    description,
    image_url,
    available_from,
    upsertKey,
    metadata: { multiplex_chain, property_name, screen_number, slot_timing, seating_capacity, available_from },
    errors,
    isValid: errors.length === 0
  };
};

export const validateOutdoorRow = (norm, rowNumber, context = {}) => {
  const errors = [];
  const placement_type = String(norm.placementtype || norm.type || 'Unipole').trim();
  const landmark_location = String(norm.landmarklocation || norm.location || norm.address || '').trim();
  const city = String(norm.city || '').trim();
  const title = String(norm.title || norm.name || '').trim();
  const media_type = String(norm.mediatype || norm.format || 'Billboard').trim();
  const illumination = String(norm.illumination || norm.lighting || 'Backlit').trim();
  const dimensions = String(norm.dimensions || norm.size || '').trim();
  const price = cleanPriceNumber(norm.price || norm.rate);
  const reach = cleanPriceNumber(norm.reach || norm.traffic);
  const available_from = formatDateString(norm.availablefrom || norm.date);
  const description = norm.description ? String(norm.description).trim() : '';
  const image_url = norm.imageurl || norm.image ? String(norm.imageurl || norm.image).trim() : '';

  if (!landmark_location) errors.push('Required: Landmark Location is missing (e.g. Cyber City Toll)');
  if (!city) {
    errors.push('Required: City is missing');
  } else if (!isKnownCity(city, context.knownCities)) {
    errors.push(`Reference Error: City "${city}" not recognized in active locations`);
  }
  if (!title) errors.push('Required: Title is missing');
  if (isNaN(price) || price <= 0) errors.push('Required: Price must be a valid positive number');
  if (norm.availablefrom && !isValidDateString(norm.availablefrom)) {
    errors.push(`Format Error: "available_from" must be a valid date (YYYY-MM-DD)`);
  }

  const upsertKey = CATEGORY_SCHEMAS.Outdoor.generateUpsertKey({
    landmark_location, city, dimensions, title
  });

  return {
    rowNumber,
    category: 'Outdoor',
    subcategory: placement_type || 'Billboards & Unipoles',
    title: title || `Row ${rowNumber}`,
    location: landmark_location ? `${city} (${landmark_location})` : city,
    city,
    price: !isNaN(price) && price > 0 ? price : 0,
    media_type,
    reach: !isNaN(reach) && reach >= 0 ? reach : null,
    description,
    image_url,
    available_from,
    upsertKey,
    metadata: { placement_type, landmark_location, illumination, dimensions, available_from },
    errors,
    isValid: errors.length === 0
  };
};

export const validateAirportRow = (norm, rowNumber, context = {}) => {
  const errors = [];
  const airport_name = String(norm.airportname || norm.airport || '').trim();
  const terminal = String(norm.terminal || norm.term || 'Terminal 1').trim();
  const zone = String(norm.zone || norm.area || '').trim();
  const city = String(norm.city || norm.location || '').trim();
  const title = String(norm.title || norm.name || '').trim();
  const media_type = String(norm.mediatype || norm.format || 'Digital Totem').trim();
  const dimensions = String(norm.dimensions || norm.size || '').trim();
  const price = cleanPriceNumber(norm.price || norm.rate);
  const reach = cleanPriceNumber(norm.reach || norm.passengers);
  const available_from = formatDateString(norm.availablefrom || norm.date);
  const description = norm.description ? String(norm.description).trim() : '';
  const image_url = norm.imageurl || norm.image ? String(norm.imageurl || norm.image).trim() : '';

  if (!airport_name) errors.push('Required: Airport Name is missing (e.g. IGI Airport, CSMIA Mumbai)');
  if (!zone) errors.push('Required: Terminal Zone is missing (e.g. Security Concourse, Baggage Claim)');
  if (!city) {
    errors.push('Required: City is missing');
  } else if (!isKnownCity(city, context.knownCities)) {
    errors.push(`Reference Error: City "${city}" not recognized in active locations`);
  }
  if (!title) errors.push('Required: Title is missing');
  if (isNaN(price) || price <= 0) errors.push('Required: Price must be a valid positive number');
  if (norm.availablefrom && !isValidDateString(norm.availablefrom)) {
    errors.push(`Format Error: "available_from" must be a valid date (YYYY-MM-DD)`);
  }

  const upsertKey = CATEGORY_SCHEMAS.Airport.generateUpsertKey({
    airport_name, terminal, zone, media_type, title
  });

  return {
    rowNumber,
    category: 'Airport',
    subcategory: 'Terminal Displays',
    title: title || `Row ${rowNumber}`,
    location: `${city} (${airport_name} ${terminal})`,
    city,
    price: !isNaN(price) && price > 0 ? price : 0,
    media_type,
    reach: !isNaN(reach) && reach >= 0 ? reach : null,
    description,
    image_url,
    available_from,
    upsertKey,
    metadata: { airport_name, terminal, zone, dimensions, available_from },
    errors,
    isValid: errors.length === 0
  };
};

export const validateDigitalRow = (norm, rowNumber, context = {}) => {
  const errors = [];
  const venue_type = String(norm.venuetype || norm.venue || 'Curved Outdoor LED').trim();
  const location_name = String(norm.locationname || norm.location || norm.landmark || '').trim();
  const city = String(norm.city || '').trim();
  const title = String(norm.title || norm.name || '').trim();
  const media_type = String(norm.mediatype || norm.format || 'DOOH LED Screen').trim();
  const resolution = String(norm.resolution || norm.pixel || '').trim();
  const slot_duration_sec = norm.slotdurationsec ? cleanPriceNumber(norm.slotdurationsec) : 15;
  const loops_per_hour = norm.loopsperhour ? cleanPriceNumber(norm.loopsperhour) : 60;
  const operating_hours = String(norm.operatinghours || norm.hours || '').trim();
  const price = cleanPriceNumber(norm.price || norm.rate);
  const reach = cleanPriceNumber(norm.reach || norm.impressions);
  const available_from = formatDateString(norm.availablefrom || norm.date);
  const description = norm.description ? String(norm.description).trim() : '';
  const image_url = norm.imageurl || norm.image ? String(norm.imageurl || norm.image).trim() : '';

  if (!location_name) errors.push('Required: Location / Landmark Name is missing');
  if (!city) {
    errors.push('Required: City is missing');
  } else if (!isKnownCity(city, context.knownCities)) {
    errors.push(`Reference Error: City "${city}" not recognized in active locations`);
  }
  if (!title) errors.push('Required: Title is missing');
  if (isNaN(price) || price <= 0) errors.push('Required: Price must be a valid positive number');
  if (norm.availablefrom && !isValidDateString(norm.availablefrom)) {
    errors.push(`Format Error: "available_from" must be a valid date (YYYY-MM-DD)`);
  }

  const upsertKey = CATEGORY_SCHEMAS.Digital.generateUpsertKey({
    venue_type, location_name, city, title
  });

  return {
    rowNumber,
    category: 'Digital',
    subcategory: 'Digital Hoardings',
    title: title || `Row ${rowNumber}`,
    location: location_name ? `${city} (${location_name})` : city,
    city,
    price: !isNaN(price) && price > 0 ? price : 0,
    media_type,
    reach: !isNaN(reach) && reach >= 0 ? reach : null,
    description,
    image_url,
    available_from,
    upsertKey,
    metadata: { venue_type, location_name, resolution, slot_duration_sec, loops_per_hour, operating_hours, available_from },
    errors,
    isValid: errors.length === 0
  };
};

/**
 * Fallback Generic Validator for standard listings format
 */
export const validateGenericRow = (norm, rowNumber, context = {}) => {
  const errors = [];
  const category = String(norm.category || norm.cat || 'Transit').trim();
  const subcategory = String(norm.subcategory || norm.subcat || 'General').trim();
  const title = String(norm.title || norm.name || '').trim();
  const location = String(norm.location || norm.city || 'Pan India').trim();
  const price = cleanPriceNumber(norm.price || norm.rate);
  const reach = cleanPriceNumber(norm.reach);
  const media_type = String(norm.mediatype || norm.format || subcategory || 'Standard').trim();
  const description = norm.description ? String(norm.description).trim() : '';
  const image_url = norm.imageurl || norm.image ? String(norm.imageurl || norm.image).trim() : '';

  if (!title) errors.push('Required: Title is missing');
  if (isNaN(price) || price <= 0) errors.push('Required: Price must be a valid positive number');

  const upsertKey = `generic:${cleanStr(category)}:${cleanStr(location)}:${cleanStr(title)}`;

  return {
    rowNumber,
    category,
    subcategory,
    title: title || `Row ${rowNumber}`,
    location,
    price: !isNaN(price) && price > 0 ? price : 0,
    media_type,
    reach: !isNaN(reach) && reach >= 0 ? reach : null,
    description,
    image_url,
    upsertKey,
    metadata: {},
    errors,
    isValid: errors.length === 0
  };
};

/**
 * Route to appropriate validator based on Category
 */
export const validateRowByCategory = (category, norm, rowNumber, context = {}) => {
  switch (category) {
    case 'Transit':
      return validateTransitRow(norm, rowNumber, context);
    case 'Bus':
      return validateBusRow(norm, rowNumber, context);
    case 'Cinema':
      return validateCinemaRow(norm, rowNumber, context);
    case 'Outdoor':
      return validateOutdoorRow(norm, rowNumber, context);
    case 'Airport':
      return validateAirportRow(norm, rowNumber, context);
    case 'Digital':
      return validateDigitalRow(norm, rowNumber, context);
    default:
      return validateGenericRow(norm, rowNumber, context);
  }
};

/* =========================================================================
 * TEMPLATE GENERATION & PARSING
 * ========================================================================= */

/**
 * Generates and triggers download of category-specific .xlsx template
 */
export const downloadCategoryTemplate = async (category = 'Transit') => {
  const XLSX = await getXLSX();
  const schema = CATEGORY_SCHEMAS[category] || CATEGORY_SCHEMAS.Transit;

  const wsData = [
    schema.columns,
    schema.sampleRow
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set friendly column widths
  if (schema.colWidths) {
    ws['!cols'] = schema.colWidths.map(w => ({ wch: w }));
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `${schema.key} Inventory`);

  const fileName = `lexicoad_${schema.key.toLowerCase()}_template.xlsx`;
  XLSX.writeFile(wb, fileName);
  return true;
};

/**
 * Generates and downloads an Excel error report for failed rows
 */
export const downloadErrorReport = async (errorRows = [], category = 'Inventory') => {
  if (!errorRows || errorRows.length === 0) return false;
  const XLSX = await getXLSX();

  const reportData = [
    ['Row Number', 'Category', 'Title / Asset', 'Location / City', 'Status', 'Failure Reasons']
  ];

  errorRows.forEach(err => {
    reportData.push([
      err.rowNumber || '',
      err.category || category,
      err.title || 'Untitled',
      err.location || err.city || '',
      'FAILED',
      (err.errors || []).join(' | ')
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(reportData);
  ws['!cols'] = [
    { wch: 12 },
    { wch: 14 },
    { wch: 38 },
    { wch: 24 },
    { wch: 12 },
    { wch: 60 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Validation Errors');

  const fileName = `lexicoad_${category.toLowerCase()}_import_errors.xlsx`;
  XLSX.writeFile(wb, fileName);
  return true;
};

/**
 * Parses an Excel (.xlsx) or CSV file buffer for a specific category
 */
export const parseCategoryExcel = async (fileBuffer, category = 'Transit', context = {}) => {
  const XLSX = await getXLSX();
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('The uploaded spreadsheet contains no worksheets.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (!rawData || rawData.length === 0) {
    throw new Error('The uploaded sheet is empty. Please add rows or use our template.');
  }

  const processedRows = [];
  const validRows = [];
  const errorRows = [];

  const seenInFileKeys = new Set();
  const existingKeys = new Set((context.existingUpsertKeys || []).map(k => String(k).toLowerCase()));

  rawData.forEach((row, index) => {
    const rowNumber = index + 2; // +1 for 0-index, +1 for header in spreadsheet
    const norm = normalizeRowKeys(row);

    const report = validateRowByCategory(category, norm, rowNumber, context);

    // Duplicate detection within file
    const lowerKey = report.upsertKey.toLowerCase();
    if (seenInFileKeys.has(lowerKey)) {
      report.errors.push(`Duplicate: Identical asset record appears multiple times within this file`);
      report.isValid = false;
    } else {
      seenInFileKeys.add(lowerKey);
    }

    // Existing database record detection (Upsert flag)
    if (existingKeys.has(lowerKey)) {
      report.isExistingMatch = true;
    } else {
      report.isExistingMatch = false;
    }

    processedRows.push(report);

    if (report.isValid) {
      validRows.push({
        id: norm.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined),
        category: report.category,
        subcategory: report.subcategory,
        title: report.title,
        location: report.location,
        price: report.price,
        media_type: report.media_type,
        reach: report.reach,
        description: report.description,
        image_url: report.image_url,
        upsert_key: report.upsertKey,
        metadata: report.metadata,
        isExistingMatch: report.isExistingMatch,
        created_at: new Date().toISOString()
      });
    } else {
      errorRows.push(report);
    }
  });

  return {
    rows: processedRows,
    validRows,
    errorRows,
    totalCount: processedRows.length,
    successCount: validRows.length,
    errorCount: errorRows.length
  };
};

/* =========================================================================
 * BACKWARD COMPATIBILITY EXPORTS
 * ========================================================================= */
export const LISTINGS_EXCEL_COLUMNS = CATEGORY_SCHEMAS.Transit.columns;
export const SAMPLE_TEMPLATE_ROWS = [CATEGORY_SCHEMAS.Transit.sampleRow];
export const downloadListingsTemplate = () => downloadCategoryTemplate('Transit');
export const parseListingsExcel = (fileBuffer, context = {}) => parseCategoryExcel(fileBuffer, 'Transit', context);
