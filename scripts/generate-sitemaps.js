// Generator script for Multi-Domain XML Sitemaps (lexicoadvertising.com, lexicoadvertising.in, lexicoadvertising.org)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const primaryOrigin = (process.env.VITE_SITE_URL || 'https://lexicoadvertising.com').replace(/\/$/, '');
const inOrigin = (process.env.VITE_IN_SITE_URL || 'https://lexicoadvertising.in').replace(/\/$/, '');
const orgOrigin = (process.env.VITE_ORG_SITE_URL || 'https://lexicoadvertising.org').replace(/\/$/, '');

const DOMAINS = [
  { domain: new URL(primaryOrigin).hostname, origin: primaryOrigin, name: 'com', label: 'Global / Primary' },
  { domain: new URL(inOrigin).hostname, origin: inOrigin, name: 'in', label: 'India Regional' },
  { domain: new URL(orgOrigin).hostname, origin: orgOrigin, name: 'org', label: 'Corporate & Org' }
];

const TODAY = '2026-10-05';

const ROUTES = [
  // Core pages
  { path: '', changefreq: 'daily', priority: '1.0' },
  { path: '/services', changefreq: 'daily', priority: '0.9' },
  { path: '/portfolio', changefreq: 'weekly', priority: '0.8' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact', changefreq: 'weekly', priority: '0.85' },
  { path: '/terms', changefreq: 'monthly', priority: '0.4' },
  { path: '/privacy', changefreq: 'monthly', priority: '0.4' },

  // Categories
  { path: '/category/Transit', changefreq: 'weekly', priority: '0.85' },
  { path: '/category/Outdoor', changefreq: 'weekly', priority: '0.85' },
  { path: '/category/Airport', changefreq: 'weekly', priority: '0.85' },
  { path: '/category/Cinema', changefreq: 'weekly', priority: '0.85' },
  { path: '/category/Digital', changefreq: 'weekly', priority: '0.85' },
  { path: '/category/Retail', changefreq: 'weekly', priority: '0.8' },
  { path: '/category/Street%20Furniture', changefreq: 'weekly', priority: '0.8' },
  { path: '/category/BTL', changefreq: 'weekly', priority: '0.75' },
  { path: '/category/Print', changefreq: 'weekly', priority: '0.75' },
  { path: '/category/Socialmedia', changefreq: 'weekly', priority: '0.8' },
  { path: '/category/Development', changefreq: 'weekly', priority: '0.7' },
  { path: '/category/Drone%20Marketing', changefreq: 'weekly', priority: '0.8' },

  // Services
  { path: '/services/svc_cinema_pvr', changefreq: 'weekly', priority: '0.85' },
  { path: '/services/svc_cinema_cinepolis', changefreq: 'weekly', priority: '0.85' },
  { path: '/services/svc_metro', changefreq: 'weekly', priority: '0.9' },
  { path: '/services/svc_bus', changefreq: 'weekly', priority: '0.85' },
  { path: '/services/svc_airport', changefreq: 'weekly', priority: '0.9' },
  { path: '/services/svc_highway', changefreq: 'weekly', priority: '0.9' },
  { path: '/services/svc_led', changefreq: 'weekly', priority: '0.9' },
  { path: '/services/svc_mall', changefreq: 'weekly', priority: '0.85' },
  { path: '/services/svc_railway', changefreq: 'weekly', priority: '0.85' },
  { path: '/services/svc_pole', changefreq: 'weekly', priority: '0.8' },
  { path: '/services/svc_btl_activation', changefreq: 'weekly', priority: '0.75' },
  { path: '/services/svc_print_newspaper', changefreq: 'weekly', priority: '0.75' },
  { path: '/services/svc_social_media', changefreq: 'weekly', priority: '0.8' },
  { path: '/services/svc_web_dev', changefreq: 'weekly', priority: '0.75' },
  { path: '/services/svc_drone_shows', changefreq: 'weekly', priority: '0.85' }
];

function generateAlternates(routePath) {
  const cleanPath = routePath === '' ? '/' : routePath;
  return `    <xhtml:link rel="alternate" hreflang="x-default" href="https://lexicoadvertising.com${cleanPath}" />
    <xhtml:link rel="alternate" hreflang="en-IN" href="https://lexicoadvertising.in${cleanPath}" />
    <xhtml:link rel="alternate" hreflang="en-US" href="https://lexicoadvertising.com${cleanPath}" />
    <xhtml:link rel="alternate" hreflang="en" href="https://lexicoadvertising.com${cleanPath}" />
    <xhtml:link rel="alternate" hreflang="en-GB" href="https://lexicoadvertising.org${cleanPath}" />`;
}

function buildDomainSitemap(domainObj) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  ROUTES.forEach(r => {
    const loc = r.path === '' ? `${domainObj.origin}/` : `${domainObj.origin}${r.path}`;
    xml += `  <url>
    <loc>${loc}</loc>
${generateAlternates(r.path)}
    <lastmod>${TODAY}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>
`;
  });

  xml += `</urlset>\n`;
  return xml;
}

function buildUnifiedMasterSitemap() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  DOMAINS.forEach(dom => {
    ROUTES.forEach(r => {
      const loc = r.path === '' ? `${dom.origin}/` : `${dom.origin}${r.path}`;
      xml += `  <url>
    <loc>${loc}</loc>
${generateAlternates(r.path)}
    <lastmod>${TODAY}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>
`;
    });
  });

  xml += `</urlset>\n`;
  return xml;
}

function buildSitemapIndex() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://lexicoadvertising.com/sitemap-com.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://lexicoadvertising.in/sitemap-in.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://lexicoadvertising.org/sitemap-org.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
</sitemapindex>
`;
}

const publicDir = path.resolve(__dirname, '../public');

// 1. Write unified master sitemap.xml
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), buildUnifiedMasterSitemap(), 'utf-8');

// 2. Write domain-specific sitemaps
DOMAINS.forEach(dom => {
  fs.writeFileSync(path.join(publicDir, `sitemap-${dom.name}.xml`), buildDomainSitemap(dom), 'utf-8');
});

// 3. Write sitemap-index.xml
fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), buildSitemapIndex(), 'utf-8');

console.log('Successfully generated multi-domain XML sitemaps:');
console.log(' - public/sitemap.xml (Unified Master for all 3 domains)');
console.log(' - public/sitemap-com.xml');
console.log(' - public/sitemap-in.xml');
console.log(' - public/sitemap-org.xml');
console.log(' - public/sitemap-index.xml');
