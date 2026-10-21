import React from 'react';
import { useNavigate } from 'react-router-dom';

export const MEDIA_GENRES = [
  {
    id: 'Airport',
    name: 'AIRLINE / AIRPORT',
    shortName: 'Airport',
    icon: 'fa-solid fa-plane-departure',
    tagline: 'Arrival, departure & baggage belts',
    popular: true
  },
  {
    id: 'Cinema',
    name: 'CINEMA',
    shortName: 'Cinema',
    icon: 'fa-solid fa-film',
    tagline: 'PVR INOX, Cinepolis screens & lobby',
    popular: true
  },
  {
    id: 'Digital',
    name: 'DIGITAL / DOOH',
    shortName: 'Digital',
    icon: 'fa-solid fa-desktop',
    tagline: 'Tech parks & high-res LED walls',
    popular: true
  },
  {
    id: 'Outdoor',
    name: 'OUTDOOR',
    shortName: 'Outdoor',
    icon: 'fa-solid fa-rectangle-ad',
    tagline: 'Highways, arterial unipoles & gantries',
    popular: true
  },
  {
    id: 'Transit',
    name: 'TRANSIT',
    shortName: 'Transit',
    icon: 'fa-solid fa-train-subway',
    tagline: 'Metro networks, buses & railway hubs',
    popular: true
  },
  {
    id: 'Retail',
    name: 'MALL / RETAIL',
    shortName: 'Retail',
    icon: 'fa-solid fa-bag-shopping',
    tagline: 'Atrium drop banners & food courts',
    popular: false
  },
  {
    id: 'Street Furniture',
    name: 'STREET / KIOSK',
    shortName: 'Street Furniture',
    icon: 'fa-solid fa-signs-post',
    tagline: 'Arterial pole kiosks & street mupis',
    popular: false
  },
  {
    id: 'BTL',
    name: 'BTL ACTIVATIONS',
    shortName: 'BTL',
    icon: 'fa-solid fa-bullhorn',
    tagline: 'Society, mall & corporate activations',
    popular: false
  },
  {
    id: 'Print',
    name: 'NEWSPAPER / PRINT',
    shortName: 'Print',
    icon: 'fa-solid fa-newspaper',
    tagline: 'Leading English & regional dailies',
    popular: false
  },
  {
    id: 'Radio',
    name: 'RADIO & AUDIO',
    shortName: 'Radio',
    icon: 'fa-solid fa-radio',
    tagline: 'Prime FM channels & metro RJ mentions',
    popular: false
  },
  {
    id: 'Sports',
    name: 'SPORTS & ARENA',
    shortName: 'Sports',
    icon: 'fa-solid fa-person-running',
    tagline: 'Stadium perimeter LEDs & tour sponsorships',
    popular: false
  },
  {
    id: 'Television',
    name: 'TELEVISION',
    shortName: 'Television',
    icon: 'fa-solid fa-tv',
    tagline: 'National news, business & regional feeds',
    popular: false
  }
];

export default function BrowseByGenre({ activeGenre = 'All', onSelectGenre, services = [] }) {
  const navigate = useNavigate();

  const handleGenreClick = (genreId) => {
    if (onSelectGenre) {
      onSelectGenre(genreId);
    } else {
      navigate(`/services?type=${encodeURIComponent(genreId)}`);
    }
  };

  const getGenreCount = (genreId) => {
    if (!services.length) return null;
    return services.filter(s => (s.type || '').toLowerCase() === genreId.toLowerCase()).length;
  };

  return (
    <section className="py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <span className="section-label text-laxRed-600">Media Categories</span>
          <h2 className="font-grotesk font-bold text-2xl sm:text-3xl text-laxBlue-950 mt-1">
            Browse Media by <span className="grad-text">Genre</span>
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Explore 12+ advertising channels across India with verified rates and instant planning.
          </p>
        </div>

        {onSelectGenre && (
          <button
            onClick={() => onSelectGenre('All')}
            className={`text-xs font-extrabold px-4 py-2 rounded-xl transition ${
              activeGenre === 'All'
                ? 'bg-laxBlue-950 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Show All Media
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {MEDIA_GENRES.map(genre => {
          const isActive = activeGenre.toLowerCase() === genre.id.toLowerCase();
          const count = getGenreCount(genre.id);

          return (
            <button
              key={genre.id}
              type="button"
              onClick={() => handleGenreClick(genre.id)}
              className={`group relative flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                isActive
                  ? 'bg-laxBlue-950 text-white border-laxBlue-950 shadow-lg -translate-y-1'
                  : 'bg-white text-laxBlue-950 border-blue-100/80 hover:border-laxBlue-400 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              {genre.popular && (
                <span className={`absolute top-2 right-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-laxRed-500 text-white' : 'bg-red-50 text-laxRed-600 border border-red-200'
                }`}>
                  HOT
                </span>
              )}

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-200 mb-3 ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'bg-slate-50 text-laxBlue-800 group-hover:bg-red-50 group-hover:text-laxRed-600'
              }`}>
                <i className={genre.icon}></i>
              </div>

              <div className="font-grotesk font-bold text-xs sm:text-[13px] tracking-wide leading-snug">
                {genre.name}
              </div>

              <div className={`text-[10px] font-semibold mt-1 line-clamp-1 transition ${
                isActive ? 'text-blue-200' : 'text-slate-400'
              }`}>
                {count !== null && count > 0 ? `${count} Media Sites` : genre.shortName}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
