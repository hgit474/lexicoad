import React from 'react';
import { useSite } from '../context/SiteContext';

export default function Terms() {
  const { settings } = useSite();

  const sections = [
    {
      id: 'acceptance',
      icon: 'fa-file-contract',
      title: '1. Acceptance of Terms & Personal Project Scope',
      content: (
        <>
          <p>
            By accessing this platform, requesting outdoor media proposals, submitting campaign inquiries, or booking advertising inventory with <strong>{settings.site_name || 'Laxico Advertising'}</strong>, you agree to be bound by these Terms and Conditions.
          </p>
          <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-sm">
            <span className="font-bold flex items-center gap-2">
              <i className="fa-solid fa-shield-halved text-amber-600"></i>
              Personal Project & Proprietary Code Notice:
            </span>
            <p className="mt-1 text-slate-700">
              The software, source code, design systems, and database schema backing this platform are the sole personal, proprietary intellectual property of <strong>Dinesh (xngdinesh)</strong>. The codebase is strictly licensed as personal and proprietary (All Rights Reserved) and is not open for public cloning, distribution, or reproduction.
            </p>
          </div>
        </>
      )
    },
    {
      id: 'inquiries',
      icon: 'fa-calculator',
      title: '2. Media Inquiries, Pricing Quotes & Inventory Hold',
      content: (
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li><strong>Non-Binding Estimates:</strong> All quotes, rate cards, and proposal decks issued through this portal or via our media planners are provisional and valid for 14 calendar days from the date of quotation.</li>
          <li><strong>Inventory Blocking:</strong> Submitting an inquiry does not guarantee slot reservation. Inventory allocation for hoardings, unipoles, bus shelters, metro pillars, or DOOH screens is finalized only upon receipt of an advance booking deposit and a countersigned Release Order (RO).</li>
          <li><strong>Dynamic Pricing:</strong> Prime high-footfall corridors and festive season slots may be subject to dynamic availability and revised spot rates.</li>
        </ul>
      )
    },
    {
      id: 'booking',
      icon: 'fa-calendar-check',
      title: '3. Booking Durations & Execution Lead Times',
      content: (
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li><strong>Standard Billboards & Hoardings:</strong> Minimum display duration is 30 calendar days (1 month) per billboard face.</li>
          <li><strong>Transit Media & Street Furniture:</strong> Minimum package of 5 to 20 units for a 30-day billing cycle.</li>
          <li><strong>Digital Out-of-Home (DOOH / LED Screens):</strong> Flexible bookings from 7 days upward with standardized loop frequencies (e.g., 10-second spot every 120 seconds).</li>
          <li><strong>Standard Turnaround:</strong> Standard flex mounting is completed within 48 hours of confirmed artwork approval. Airport, railway, and specialized metro clearances require 72 to 96 hours for statutory security clearance.</li>
        </ul>
      )
    },
    {
      id: 'artwork',
      icon: 'fa-palette',
      title: '4. Artwork Guidelines, Printing & Mounting',
      content: (
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li><strong>Regulatory Standards:</strong> All creative banners must strictly adhere to the guidelines set by the Advertising Standards Council of India (ASCI) and local municipal bylaws. Content promoting banned narcotics, tobacco products, political defamation, hate speech, or obscenity is strictly barred.</li>
          <li><strong>Print Specifications:</strong> In-house printing uses premium high-density flex / vinyl at 720 to 1440 DPI solvent or UV print with reinforced hems and anti-tear eyelets.</li>
          <li><strong>Field Installation:</strong> Fabrication, tensioning, mounting, and illumination are executed exclusively by certified Laxico field teams.</li>
        </ul>
      )
    },
    {
      id: 'pop',
      icon: 'fa-camera-retro',
      title: '5. Proof of Performance (PoP) & Monitoring',
      content: (
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li><strong>Geo-Tagged Verification:</strong> High-resolution day and night illumination photographs with embedded GPS coordinates and verified timestamps are shared within 24 hours of campaign launch.</li>
          <li><strong>Routine Surveillance:</strong> Weekly audit inspections ensure lighting efficiency, structural integrity, and vinyl tension. Regular updates are shared directly with clients via WhatsApp.</li>
          <li><strong>Discrepancy Remediation:</strong> Any physical tear, storm damage, or illumination failure reported by the advertiser will be inspected and remediated within 48 working hours.</li>
        </ul>
      )
    },
    {
      id: 'permits',
      icon: 'fa-landmark',
      title: '6. Municipal Permits, Clearances & Force Majeure',
      content: (
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li><strong>Statutory Approvals:</strong> Every commercial media site managed by Laxico possesses necessary civic permissions (BBMP, MCD, DMRC, AAI, Railways).</li>
          <li><strong>Force Majeure:</strong> Laxico shall not be held liable for disruptions arising from sudden civic directives (such as municipal road-widening or metro infrastructure projects), extreme cyclones/earthquakes exceeding structural tolerances, election model codes of conduct, or government directives.</li>
          <li><strong>Alternative Corridors:</strong> If an active display site is suspended by municipal orders, Laxico will provide an equivalent replacement site in the same corridor or offer pro-rata credit toward subsequent campaigns.</li>
        </ul>
      )
    },
    {
      id: 'commercials',
      icon: 'fa-receipt',
      title: '7. Payment Terms, GST & Invoicing',
      content: (
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li><strong>Taxes:</strong> All commercial contracts are subject to applicable GST (18% SAC Code 998361) under registered GSTIN: <code className="bg-slate-100 px-2 py-0.5 rounded text-laxBlue-950 font-bold">{settings.gst_number || '29CTIPS2521P1ZZ'}</code>.</li>
          <li><strong>Payment Schedule:</strong> 50% advance upon Release Order signing; remaining 50% within 7 calendar days of PoP deployment report dispatch.</li>
          <li><strong>Overdue Interest:</strong> Unsettled invoices beyond 15 days incur interest of 1.5% per month.</li>
        </ul>
      )
    },
    {
      id: 'jurisdiction',
      icon: 'fa-scale-balanced',
      title: '8. Governing Law & Dispute Resolution',
      content: (
        <p className="text-slate-600">
          These Terms and Conditions and all commercial transactions shall be governed by and interpreted under the laws of the Republic of India. Any legal dispute, arbitration, or action arising under these terms shall fall under the exclusive jurisdiction of the competent courts in <strong>Bengaluru, Karnataka, India</strong>.
        </p>
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
            <i className="fa-solid fa-scroll text-laxRed-400"></i> Legal & Operations Policy
          </div>
          <h1 className="font-grotesk font-bold text-4xl sm:text-5xl tracking-tight">
            Terms & Conditions
          </h1>
          <p className="mt-4 text-blue-100 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Operational guidelines, billboard booking protocols, print standards, and client rights governing campaigns managed by {settings.site_name || 'Laxico Advertising'}.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-300">
            <span><i className="fa-solid fa-building-circle-check text-laxRed-400 mr-1.5"></i>GST: {settings.gst_number || '29CTIPS2521P1ZZ'}</span>
            <span>•</span>
            <span><i className="fa-solid fa-id-card text-laxRed-400 mr-1.5"></i>UDYAM: {settings.udyam_number || 'UDYAM-KR-03-0664055'}</span>
            <span>•</span>
            <span><i className="fa-solid fa-clock-rotate-left text-laxRed-400 mr-1.5"></i>Updated: September 2026</span>
          </div>
        </div>
      </div>

      {/* Main Legal Content */}
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
      </div>
    </div>
  );
}
