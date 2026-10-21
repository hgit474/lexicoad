// Default configuration for The Media Ant style marketplace filters
export const DEFAULT_FILTER_CONFIG = {
  show_location: true,
  show_category: true,
  show_format: true,
  show_budget: true,
  show_reach: true,
  show_duration: true,
  location_title: 'LOCATION',
  category_title: 'CATEGORY',
  format_title: 'AD OPTIONS',
  budget_title: 'BUDGET',
  reach_title: 'AUDIENCE & REACH',
  duration_title: 'CAMPAIGN DURATION',
  max_visible_items: 5,
  allow_multi_location: true,
  allow_multi_category: true,
  budget_brackets: [
    { id: 'all', label: 'All Budgets', min: 0, max: 999999999 },
    { id: 'under_25k', label: 'Under ₹25K', min: 0, max: 25000 },
    { id: '25k_50k', label: '₹25K - ₹50K', min: 25000, max: 50000 },
    { id: '50k_100k', label: '₹50K - ₹1L', min: 50000, max: 100000 },
    { id: '100k_300k', label: '₹1L - ₹3L', min: 100000, max: 300000 },
    { id: 'above_300k', label: '₹3L+', min: 300000, max: 999999999 }
  ]
};

export const getParsedFilterConfig = (settings) => {
  if (!settings || !settings.filter_config) {
    return DEFAULT_FILTER_CONFIG;
  }
  try {
    const parsed = typeof settings.filter_config === 'string'
      ? JSON.parse(settings.filter_config)
      : settings.filter_config;
    return {
      ...DEFAULT_FILTER_CONFIG,
      ...parsed,
      budget_brackets: Array.isArray(parsed.budget_brackets) && parsed.budget_brackets.length > 0
        ? parsed.budget_brackets
        : DEFAULT_FILTER_CONFIG.budget_brackets
    };
  } catch (e) {
    console.warn('Failed to parse filter_config, using defaults:', e);
    return DEFAULT_FILTER_CONFIG;
  }
};
