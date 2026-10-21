import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Eye, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

// Custom SVG Billboard Pin for Leaflet
const createCustomIcon = (type) => {
  const color = type === 'Airport' ? '#f59e0b' :
                type === 'Highway' ? '#0e8ce9' :
                type === 'Transit' ? '#10b981' : '#8b5cf6';

  const svgHtml = `
    <div style="position: relative; width: 34px; height: 42px; display: flex; align-items: center; justify-content: center;">
      <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 0C7.61116 0 0 7.61116 0 17C0 26.5 14.5 40.5 16.2 41.6C16.7 41.9 17.3 41.9 17.8 41.6C19.5 40.5 34 26.5 34 17C34 7.61116 26.3888 0 17 0Z" fill="${color}"/>
        <circle cx="17" cy="16" r="7" fill="#ffffff"/>
      </svg>
      <div style="position: absolute; top: 12px; width: 8px; height: 8px; border-radius: 50%; background: ${color};"></div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -38]
  });
};

// Component to dynamically re-center map when city selection changes
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ 
  locations = [], 
  services = [],
  selectedCity = 'All', 
  height = '480px',
  onSelectLocation = null 
}) {
  const [activeCity, setActiveCity] = useState(selectedCity);

  const cityCoordinates = {
    'All': [20.5937, 78.9629], // All India center
    'Delhi NCR': [28.6139, 77.2090],
    'Mumbai': [19.0760, 72.8777],
    'Bengaluru': [12.9716, 77.5946],
    'Hyderabad': [17.3850, 78.4867]
  };

  const getZoomLevel = (city) => {
    return city === 'All' ? 5 : 12;
  };

  const filteredLocations = activeCity === 'All' 
    ? locations 
    : locations.filter(loc => loc.city.toLowerCase() === activeCity.toLowerCase());

  const currentCenter = cityCoordinates[activeCity] || cityCoordinates['All'];
  const currentZoom = getZoomLevel(activeCity);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/90 shadow-2xl">
      {/* City Filter Pills */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap gap-1.5 bg-slate-950/90 p-1.5 rounded-xl border border-slate-800 backdrop-blur-md shadow-lg">
        {['All', 'Delhi NCR', 'Mumbai', 'Bengaluru', 'Hyderabad'].map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => setActiveCity(city)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeCity === city
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Legend Badge */}
      <div className="absolute bottom-4 right-4 z-[400] hidden sm:flex items-center gap-3 bg-slate-950/90 px-3.5 py-2 rounded-xl border border-slate-800 backdrop-blur-md text-[11px] text-slate-300">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Highway
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Transit / Metro
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Airport
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Commercial
        </span>
      </div>

      {/* Map Container */}
      <div style={{ height }}>
        <MapContainer
          center={currentCenter}
          zoom={currentZoom}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          {/* Tile Layer: CartoDB Dark Matter for sleek modern dark look */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
          />

          <MapRecenter center={currentCenter} zoom={currentZoom} />

          {filteredLocations.map((loc) => {
            const lat = Number(loc.latitude);
            const lng = Number(loc.longitude);
            if (isNaN(lat) || isNaN(lng)) return null;

            // Find services available at this location
            const availableServices = services.filter(s => 
              s.location_ids && s.location_ids.includes(loc.id)
            );

            return (
              <Marker
                key={loc.id}
                position={[lat, lng]}
                icon={createCustomIcon(loc.type)}
                eventHandlers={{
                  click: () => {
                    if (onSelectLocation) onSelectLocation(loc);
                  }
                }}
              >
                <Popup>
                  <div className="p-1 max-w-[260px] text-slate-100">
                    {loc.photos && loc.photos[0] && (
                      <img
                        src={loc.photos[0]}
                        alt={loc.name}
                        className="w-full h-28 object-cover rounded-lg mb-2"
                      />
                    )}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                        {loc.type}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {loc.city}
                      </span>
                    </div>
                    <h5 className="font-bold text-sm text-white mb-1 line-clamp-1">
                      {loc.name}
                    </h5>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                      {loc.address}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-slate-300 font-medium pb-2 border-b border-slate-800">
                      <Eye className="w-3.5 h-3.5 text-brand-400" />
                      <span>{loc.daily_impressions?.toLocaleString()} daily impressions</span>
                    </div>

                    {availableServices.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                          Available Placements:
                        </span>
                        <div className="space-y-1">
                          {availableServices.slice(0, 2).map(srv => (
                            <Link
                              key={srv.id}
                              to={`/services/${srv.slug || srv.id}`}
                              className="text-xs text-brand-400 hover:text-brand-300 flex items-center justify-between group"
                            >
                              <span className="truncate">{srv.name}</span>
                              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
