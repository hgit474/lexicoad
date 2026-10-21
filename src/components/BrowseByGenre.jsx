import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

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

export const DEFAULT_GENRE_BADGES = {
  Airport: { active: true, text: 'HOT', color: 'red' },
  Cinema: { active: true, text: 'HOT', color: 'red' },
  Digital: { active: true, text: 'HOT', color: 'red' },
  Outdoor: { active: true, text: 'HOT', color: 'red' },
  Transit: { active: true, text: 'HOT', color: 'red' },
  Retail: { active: false, text: 'POPULAR', color: 'purple' },
  'Street Furniture': { active: false, text: 'TRENDING', color: 'amber' },
  BTL: { active: false, text: 'NEW', color: 'emerald' },
  Print: { active: false, text: 'CLASSIC', color: 'blue' },
  Radio: { active: false, text: 'TRENDING', color: 'amber' },
  Sports: { active: false, text: 'HOT', color: 'red' },
  Television: { active: false, text: 'PRIME', color: 'purple' }
};

export default function BrowseByGenre({ activeGenre = 'All', onSelectGenre, services = [] }) {
  const navigate = useNavigate();
  const { settings } = useSite();

  // Parse genre badges from CMS settings
  let badges = DEFAULT_GENRE_BADGES;
  if (settings?.genre_badges) {
    try {
      const parsed = typeof settings.genre_badges === 'string' ? JSON.parse(settings.genre_badges) : settings.genre_badges;
      badges = { ...DEFAULT_GENRE_BADGES, ...parsed };
    } catch {
      badges = DEFAULT_GENRE_BADGES;
    }
  }

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

  const getBadgeClasses = (color = 'red', isActive) => {
    if (isActive) return 'bg-white text-laxBlue-950 shadow-md font-extrabold';
    switch (color) {
      case 'amber':
      case 'orange':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'emerald':
      case 'green':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'red':
      default:
        return 'bg-red-50 text-laxRed-600 border border-red-200';
    }
  };

  return (
    <section className="py-2 sm:py-3">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-3">
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
          const badgeConfig = badges[genre.id] || (genre.popular ? { active: true, text: 'HOT', color: 'red' } : null);

          return (
            <button
              key={genre.id}
              type="button"
              onClick={() => handleGenreClick(genre.id)}
              className={`group relative flex flex-col items-center text-center p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 h-full min-h-[148px] justify-between ${
                isActive
                  ? 'bg-laxBlue-950 text-white border-laxBlue-950 shadow-lg -translate-y-1'
                  : 'bg-white text-laxBlue-950 border-blue-100/80 hover:border-laxBlue-400 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              {badgeConfig?.active && (
                <span className={`absolute top-2 right-2 text-[9px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded-full z-10 ${getBadgeClasses(badgeConfig.color, isActive)}`}>
                  {badgeConfig.text || 'HOT'}
                </span>
              )}

              <div className="flex flex-col items-center w-full">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl transition-all duration-200 mb-2.5 ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'bg-slate-50 text-laxBlue-800 group-hover:bg-red-50 group-hover:text-laxRed-600'
                }`}>
                  <i className={genre.icon}></i>
                </div>

                <div className="font-grotesk font-bold text-xs sm:text-[13px] tracking-wide leading-snug min-h-[34px] flex items-center justify-center text-center">
                  {genre.name}
                </div>
              </div>

              <div className={`text-[10px] font-semibold mt-1 line-clamp-1 transition text-center w-full ${
                isActive ? 'text-blue-200' : 'text-slate-600'
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
