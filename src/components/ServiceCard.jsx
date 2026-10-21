import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Maximize2, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Send 
} from 'lucide-react';

export default function ServiceCard({ service, locations = [], onQuickInquire }) {
  // Find location names mapped to this service
  const matchedLocations = locations.filter(loc => 
    service.location_ids && service.location_ids.includes(loc.id)
  );

  const formatPrice = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Metro Station Ads':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Bus Shelter Posters':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Airport Banners':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Highway Hoardings':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Mall Digital Kiosks':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      default:
        return 'bg-brand-500/10 text-brand-400 border-brand-500/20';
    }
  };

  return (
    <div className="group relative rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 transition-all duration-300 flex flex-col overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1">
      
      {/* Card Image Banner */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-950">
        <img
          src={service.image_url}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

        {/* Type Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md ${getTypeColor(service.type)}`}>
            {service.type}
          </span>
        </div>

        {/* Featured Tag */}
        {service.featured && (
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/90 text-slate-950 shadow-md">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>High Impact</span>
          </div>
        )}

        {/* Dimensions Tag */}
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs font-semibold text-slate-200 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60">
          <Maximize2 className="w-3.5 h-3.5 text-brand-400" />
          <span>{service.dimensions}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1">
            {service.name}
          </h3>
          <p className="text-slate-400 text-sm mt-2 line-clamp-2 leading-relaxed">
            {service.description}
          </p>

          {/* Locations Included Preview */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium mb-2">
              <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Locations Included: <strong className="text-white">{matchedLocations.length} prime hubs</strong></span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {matchedLocations.length > 0 ? (
                matchedLocations.slice(0, 3).map(loc => (
                  <span 
                    key={loc.id} 
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 truncate max-w-[150px]"
                    title={`${loc.name} (${loc.city})`}
                  >
                    {loc.name.split(' - ')[0]}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-500 italic">Customizable nationwide</span>
              )}
              {matchedLocations.length > 3 && (
                <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-brand-500/10 text-brand-400 font-medium">
                  +{matchedLocations.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Duration Options */}
          {service.duration_options && service.duration_options.length > 0 && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-[11px]">Terms:</span>
              <div className="flex flex-wrap gap-1">
                {service.duration_options.map(opt => (
                  <span key={opt} className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800">
                    {opt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Footer Actions */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <span className="text-xs text-slate-400 block">Starting from</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-white">
                  {formatPrice(service.price_monthly)}
                </span>
                <span className="text-xs text-slate-400">/mo</span>
              </div>
            </div>
            {service.price_quarterly && (
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 font-medium">
                Save up to 15% on 3m+
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/services/${service.slug || service.id}`}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View Specs</span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
            </Link>

            <button
              type="button"
              onClick={() => onQuickInquire && onQuickInquire(service)}
              className="px-3 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Inquire Now</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
