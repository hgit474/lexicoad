import * as XLSX from 'xlsx';

/**
 * Standard Column Headers for the Listings Excel Template
 */
export const LISTINGS_EXCEL_COLUMNS = [
  'category',
  'subcategory',
  'title',
  'location',
  'price',
  'media_type',
  'reach',
  'description',
  'image_url'
];

/**
 * Sample rows demonstrating Transit -> Transport and other subcategories
 */
export const SAMPLE_TEMPLATE_ROWS = [
  [
    'Transit',
    'Transport',
    'Mumbai Western Line EMU Full Train Wrap',
    'Mumbai (Churchgate to Virar)',
    165000,
    'Train',
    1450000,
    'High-impact commuter wrap across 12-car local train network operating 18 hours daily across prime commercial corridors.',
    'https://images.unsplash.com/photo-1565019011521-b0575cbb57c8?q=80&w=800&auto=format&fit=crop'
  ],
  [
    'Transit',
    'Bus Fleet',
    'Delhi DTC Electric Low-Floor Bus Full Wrap',
    'Delhi NCR (Ring Road & Connaught Place)',
    48000,
    'Bus',
    680000,
    'Complete exterior vinyl wrap on air-conditioned electric buses covering high-dwell central Delhi routes.',
    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop'
  ],
  [
    'Outdoor',
    'Billboards & Unipoles',
    'Gurugram Cyber City Highway Mega Unipole',
    'Gurugram (NH-48 Corridor)',
    135000,
    'Billboard',
    1100000,
    'Front-lit iconic 60x30 ft arterial highway unipole facing non-stop corporate executive vehicular traffic.',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop'
  ],
  [
    'Outdoor',
    'Digital Hoardings',
    'Bandra Reclamation Iconic Curved DOOH LED',
    'Mumbai (Western Express Highway)',
    220000,
    'Digital Screen',
    1750000,
    'P6 high-brightness curved digital screen with dynamic day/night creative scheduling and motion video support.',
    'https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=800&auto=format&fit=crop'
  ],
  [
    'Airport',
    'Terminal Displays',
    'IGI Terminal 3 Departure Security Concourse Totem',
    'New Delhi Airport (T3 International)',
    285000,
    'Digital Totem',
    920000,
    'Ultra-HD 85-inch digital freestanding totem network positioned directly before international departures security gates.',
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop'
  ]
];

/**
 * Generate and trigger download of the .xlsx template
 */
export const downloadListingsTemplate = () => {
  const wsData = [
    LISTINGS_EXCEL_COLUMNS,
    ...SAMPLE_TEMPLATE_ROWS
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set friendly column widths
  ws['!cols'] = [
    { wch: 14 }, // category
    { wch: 18 }, // subcategory
    { wch: 38 }, // title
    { wch: 22 }, // location
    { wch: 14 }, // price
    { wch: 14 }, // media_type
    { wch: 14 }, // reach
    { wch: 45 }, // description
    { wch: 40 }  // image_url
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Service Listings');

  XLSX.writeFile(wb, 'lexicoad_listings_template.xlsx');
  return true;
};

/**
 * Normalizes an object's keys to standard field names
 */
const normalizeRowKeys = (rawRow) => {
  const normalized = {};
  for (const [key, val] of Object.entries(rawRow)) {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanKey === 'category' || cleanKey === 'cat') {
      normalized.category = val;
    } else if (cleanKey === 'subcategory' || cleanKey === 'subcat' || cleanKey === 'subgenre') {
      normalized.subcategory = val;
    } else if (cleanKey === 'title' || cleanKey === 'servicetitle' || cleanKey === 'listingtitle' || cleanKey === 'name') {
      normalized.title = val;
    } else if (cleanKey === 'location' || cleanKey === 'city' || cleanKey === 'address') {
      normalized.location = val;
    } else if (cleanKey === 'price' || cleanKey === 'rate' || cleanKey === 'cost' || cleanKey === 'amount') {
      normalized.price = val;
    } else if (cleanKey === 'mediatype' || cleanKey === 'type' || cleanKey === 'format') {
      normalized.media_type = val;
    } else if (cleanKey === 'reach' || cleanKey === 'impressions' || cleanKey === 'footfall') {
      normalized.reach = val;
    } else if (cleanKey === 'description' || cleanKey === 'desc' || cleanKey === 'details') {
      normalized.description = val;
    } else if (cleanKey === 'imageurl' || cleanKey === 'image' || cleanKey === 'photo' || cleanKey === 'img') {
      normalized.image_url = val;
    } else if (cleanKey === 'id') {
      normalized.id = val;
    }
  }
  return normalized;
};

/**
 * Parse an Excel file (.xlsx or .xls) array buffer and validate each row
 */
export const parseListingsExcel = async (fileBuffer) => {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('The uploaded Excel file contains no worksheets.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (!rawData || rawData.length === 0) {
    throw new Error('The uploaded sheet is empty. Please add rows or use our template.');
  }

  const processedRows = [];
  const validRows = [];
  const errorRows = [];

  rawData.forEach((row, index) => {
    const rowNumber = index + 2; // +1 for 0-index, +1 for header row in Excel
    const norm = normalizeRowKeys(row);

    const errors = [];

    // Validation: Category
    const category = typeof norm.category === 'string' ? norm.category.trim() : String(norm.category || '').trim();
    if (!category) {
      errors.push('Required: Category is missing');
    }

    // Validation: Subcategory
    const subcategory = typeof norm.subcategory === 'string' ? norm.subcategory.trim() : String(norm.subcategory || '').trim();
    if (!subcategory) {
      errors.push('Required: Subcategory is missing');
    }

    // Validation: Title
    const title = typeof norm.title === 'string' ? norm.title.trim() : String(norm.title || '').trim();
    if (!title) {
      errors.push('Required: Title is missing');
    }

    // Validation: Price (clean out currency symbols, commas, check positive number)
    let cleanPrice = norm.price;
    if (typeof cleanPrice === 'string') {
      cleanPrice = cleanPrice.replace(/[^0-9.-]/g, '');
    }
    const numPrice = Number(cleanPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      errors.push('Required: Price must be a valid positive number');
    }

    // Reach (optional number)
    let cleanReach = norm.reach;
    if (cleanReach !== undefined && cleanReach !== null && cleanReach !== '') {
      if (typeof cleanReach === 'string') cleanReach = cleanReach.replace(/[^0-9.-]/g, '');
      const numReach = Number(cleanReach);
      cleanReach = isNaN(numReach) ? null : numReach;
    } else {
      cleanReach = null;
    }

    const location = String(norm.location || 'Pan India').trim();
    const media_type = String(norm.media_type || subcategory || 'Standard').trim();
    const description = norm.description ? String(norm.description).trim() : null;
    const image_url = norm.image_url ? String(norm.image_url).trim() : null;

    const rowReport = {
      rowNumber,
      category,
      subcategory,
      title: title || `Row ${rowNumber}`,
      location,
      price: !isNaN(numPrice) && numPrice > 0 ? numPrice : 0,
      media_type,
      reach: cleanReach,
      description,
      image_url,
      isValid: errors.length === 0,
      errors
    };

    processedRows.push(rowReport);

    if (errors.length === 0) {
      validRows.push({
        id: norm.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined),
        category,
        subcategory,
        title,
        location,
        price: numPrice,
        media_type,
        reach: cleanReach,
        description,
        image_url,
        created_at: new Date().toISOString()
      });
    } else {
      errorRows.push(rowReport);
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
