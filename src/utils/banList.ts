// TMDB ID ban list - content that should not appear on the site
export const BANNED_TMDB_IDS = new Set([
  46853,
  1415064,
  871943,
  871945,
  1014602,
  40467,
  268006,
  954,
  244194,
  36644,
  36645,
  709,
  2662,
  11285,
  10711,
  17789,
  11935,
  103655,
  103656,
  442778,
  65482,
  348906,
  116336,
  37023,
  333418,
  1014611,
  1498403,
  871936,
  871942,
  717820,
  871938,
  905035,
  871941,
  1263743,
  905034,
  717819,
  871947,
  717809,
  871939,
  1516880,
  12237,
  15900,
  15901,
  15902,
  15903,
  15904,
  390540,
  97251,
  203970,
  634293,
  663218,
  183597,
  1338979,
  138223,
  825016
]);

/**
 * Check if a TMDB ID is banned
 */
export const isBanned = (tmdbId: number): boolean => {
  return BANNED_TMDB_IDS.has(tmdbId);
};

/**
 * Filter out banned items from an array of media items
 */
export const filterBannedContent = <T extends { id: number }>(items: T[]): T[] => {
  return items.filter(item => !isBanned(item.id));
};

/**
 * Filter out banned items from search results
 */
export const filterBannedSearchResults = <T extends { id: number }>(results: { results: T[] }): { results: T[] } => {
  return {
    ...results,
    results: filterBannedContent(results.results || [])
  };
};