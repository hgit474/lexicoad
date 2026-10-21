import React from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

export default function Privacy() {
  const { settings } = useSite();

  const sections = [
    {
      id: 'commitment',
      icon: 'fa-shield-halved',
      title: '1. Commitment to Data Privacy',
      content: (
        <p>
          At <strong>{settings.site_name || 'Laxico Advertising'}</strong>, we value the trust you place in us when sharing your contact details and campaign objectives. We respect your privacy and adhere strictly to India's <strong>Digital Personal Data Protection Act, 2023 (DPDPA)</strong> and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
        </p>
      )
    },
    {
      id: 'collection',
      icon: 'fa-database',
      title: '2. Information We Collect',
      content: (
        <div className="space-y-3">
          <p>We collect only the information necessary to provide outdoor media solutions, rate cards, and campaign deployment services:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>Contact & Agency Information:</strong> Your name, business email address, WhatsApp/mobile number, and agency or company name when you request a proposal or get in touch.</li>
            <li><strong>Campaign Specifications:</strong> Targeted cities, preferred media formats (billboards, DOOH, bus shelters, transit media), flight schedules, and estimated marketing budgets.</li>
            <li><strong>Tax & Invoicing Data:</strong> Registered business address and GST identification number (GSTIN) for executing tax-compliant B2B invoices.</li>
            <li><strong>Technical Diagnostics:</strong> Minimal session diagnostics (IP address, browser type) to detect malicious activity and ensure optimal platform loading speed.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'usage',
      icon: 'fa-bullseye',
      title: '3. Purpose & Use of Collected Data',
      content: (
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li><strong>Proposals & Media Plans:</strong> Generating custom site inventory decks, availability calendars, and estimated footfall analytics for requested locations.</li>
          <li><strong>Proof-of-Performance (PoP) Delivery:</strong> Sharing weekly high-resolution, geo-tagged daylight and night illumination photos directly via WhatsApp and email.</li>
          <li><strong>Statutory Invoicing:</strong> Preparing legally valid GST invoices and Release Orders under statutory accounting requirements.</li>
          <li><strong>Service Updates:</strong> Sharing seasonal rate card revisions or newly acquired prime hoarding locations (you may opt out anytime).</li>
        </ul>
      )
    },
    {
      id: 'sharing',
      icon: 'fa-handshake-slash',
      title: '4. Information Sharing & Third-Party Protection',
      content: (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 font-medium text-sm">
            <i className="fa-solid fa-circle-check text-emerald-600 mr-2"></i>
            <strong>Zero Data Monetization:</strong> We do not sell, rent, monetize, or trade your personal or business data to data aggregators or third-party marketing companies.
          </div>
          <p className="text-slate-600">Information is disclosed strictly under these operational conditions:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>Verified Installation Contractors:</strong> Field mounting and printing teams receive strictly campaign artwork and site codes, without exposing confidential commercial information.</li>
            <li><strong>Statutory Authorities:</strong> When required by lawful government orders or municipal advertising bodies for permit and site compliance verification.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'security',
      icon: 'fa-lock',
      title: '5. Data Security & Storage Integrity',
      content: (
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li><strong>Encrypted Transport:</strong> All data transmitted through our online discovery portal is protected with end-to-end Transport Layer Security (TLS 1.3 / HTTPS).</li>
          <li><strong>Isolated Database Storage:</strong> Inquiries and campaign data are preserved in secured, access-restricted database systems with Row Level Security (RLS) policies.</li>
          <li><strong>Administrative Guardrails:</strong> The Control Tower CMS uses cryptographically verified session lifespans and strict role-based authorization to protect client records.</li>
        </ul>
      )
    },
    {
      id: 'cookies',
      icon: 'fa-cookie-bite',
      title: '6. Cookies and Browser Storage',
      content: (
        <p className="text-slate-600">
          We use minimal, privacy-friendly browser storage (<code className="bg-slate-100 px-2 py-0.5 rounded text-laxBlue-950">localStorage</code>) strictly for essential functionality, such as storing your view preferences and session management. We do not use intrusive cross-site ad trackers or third-party surveillance cookies.
        </p>
      )
    },
    {
      id: 'rights',
      icon: 'fa-user-check',
      title: '7. Your Rights Under DPDPA',
      content: (
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li><strong>Right to Access:</strong> You may request a summary of the contact details and campaign records we maintain for your business.</li>
          <li><strong>Right to Correction:</strong> You may update or correct inaccurate billing addresses or contact details at any point.</li>
          <li><strong>Right to Erasure:</strong> You may request the deletion of marketing records upon conclusion of contractual obligations and statutory tax retention periods.</li>
        </ul>
      )
    },
    {
      id: 'grievance',
      icon: 'fa-address-card',
      title: '8. Grievance Officer & Contact Information',
      content: (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-sm space-y-2 text-slate-700">
          <div className="font-bold text-laxBlue-950 text-base">Grievance & Privacy Redressal</div>
          <div><strong>Officer:</strong> Dinesh (Compliance Officer)</div>
          <div><strong>Company:</strong> Laxico Advertising Pvt. Ltd.</div>
          <div><strong>Address:</strong> No 1 Nandini Complex, Chandra Layout, Bangalore — 560040, Karnataka, India</div>
          <div><strong>Email:</strong> <a href="mailto:lexicoadvertising@gmail.com" className="text-laxRed-600 hover:underline">lexicoadvertising@gmail.com</a></div>
          <div><strong>Direct Line / WhatsApp:</strong> +91 9742313705</div>
          <div><strong>Response Window:</strong> We acknowledge all privacy inquiries within 48 business hours.</div>
        </div>
      )
    }
  ];

  return (
    <div className="pb-20">
      {/* Top Header Banner */}
      <div className="grad-bg relative overflow-hidden text-white">
        <div className="absolute inset-0 hero-grid opacity-60"></div>
        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-bold tracking-wider uppercase text-blue-200 mb-4">
            <i className="fa-solid fa-user-shield text-laxRed-400"></i> Privacy & Transparency
          </div>
          <h1 className="font-grotesk font-bold text-4xl sm:text-5xl tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-4 text-blue-100 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            How {settings.site_name || 'Laxico Advertising'} collects, safeguards, and handles your contact details, media inquiries, and campaign proof-of-performance assets.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-300">
            <span><i className="fa-solid fa-lock text-laxRed-400 mr-1.5"></i>DPDPA 2023 Compliant</span>
            <span>•</span>
            <span><i className="fa-solid fa-handshake-simple text-laxRed-400 mr-1.5"></i>No Third-Party Data Sales</span>
            <span>•</span>
            <span><i className="fa-solid fa-clock-rotate-left text-laxRed-400 mr-1.5"></i>Updated: September 2026</span>
          </div>
        </div>
      </div>

      {/* Main Privacy Sections */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10 space-y-6">
        {sections.map((section) => (
          <div
            key={section.id}
            id={section.id}
            className="bg-white rounded-3xl border border-blue-100/80 p-6 sm:p-8 shadow-card hover:border-blue-200 transition-all"
          >
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-laxBlue-700 flex items-center justify-center text-lg font-bold shadow-sm">
                <i className={`fa-solid ${section.icon}`}></i>
              </div>
              <h2 className="font-grotesk font-bold text-xl text-laxBlue-950">
                {section.title}
              </h2>
            </div>
            <div className="text-sm leading-relaxed text-slate-600">
              {section.content}
            </div>
          </div>
        ))}

        {/* Contact Support Card */}
        <div className="bg-gradient-to-br from-laxBlue-950 to-slate-900 rounded-3xl p-8 text-white text-center shadow-xl border border-white/10">
          <h3 className="font-grotesk font-bold text-2xl">Need assistance with your data?</h3>
          <p className="text-slate-300 text-sm mt-2 max-w-xl mx-auto">
            Contact our dedicated privacy and grievance team for data access, corrections, or inquiries regarding your campaign records.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="grad-btn px-6 py-3 rounded-xl text-white font-bold text-sm inline-flex items-center gap-2"
            >
              <i className="fa-solid fa-envelope"></i> Contact Grievance Officer
            </Link>
            <a
              href="https://wa.me/919742313705"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all inline-flex items-center gap-2 shadow-lg"
            >
              <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
