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
    'City Express Low-Floor AC Bus Branding',
    'Delhi NCR',
    45000,
    'Bus',
    650000,
    'High-frequency commuter bus wrapping covering prime arterial routes.',
    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop'
  ],
  [
    'Transit',
    'Transport',
    'Delhi Metro Blue Line Full Train Wrap',
    'Delhi / NCR',
    185000,
    'Metro',
    1200000,
    'Full exterior wrap across 6-coach train traversing Dwarka to Noida/Vaishali.',
    'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800&auto=format&fit=crop'
  ],
  [
    'Transit',
    'Transport',
    'Suburban Express Electric Train Panel',
    'Mumbai',
    95000,
    'Train',
    900000,
    'Internal commuter panel advertising across western railway network.',
    'https://images.unsplash.com/photo-1565019011521-b0575cbb57c8?q=80&w=800&auto=format&fit=crop'
  ],
  [
    'Transit',
    'Metro Networks',
    'Metro Station Platform Screen Doors (PSD)',
    'Bengaluru (Namma Metro)',
    75000,
    'Metro',
    550000,
    'Illuminated platform screen door branding at high-traffic interchange stations.',
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800&auto=format&fit=crop'
  ],
  [
    'Outdoor',
    'Billboards & Unipoles',
    'Cyber City Arterial Unipole (Backlit)',
    'Gurugram',
    125000,
    'Billboard',
    980000,
    'Front-facing highway unipole catching top corporate commuters.',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800&auto=format&fit=crop'
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
