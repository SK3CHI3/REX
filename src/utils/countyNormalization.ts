/**
 * Utility functions for normalizing county names to handle variations
 * and ensure consistent data aggregation across the application
 */

/**
 * Normalize county names to handle common variations
 * This ensures that "Nairobi", "Nairobi City", "Nairobi County" are all treated as "Nairobi"
 */
export const normalizeCountyName = (county: string | null | undefined): string => {
  if (!county) return 'Unknown County';
  
  const normalized = county.trim();
  
  // Handle Nairobi variations
  if (normalized.toLowerCase().includes('nairobi')) {
    return 'Nairobi';
  }
  
  // Handle Mombasa variations
  if (normalized.toLowerCase().includes('mombasa')) {
    return 'Mombasa';
  }
  
  // Handle Kisumu variations
  if (normalized.toLowerCase().includes('kisumu')) {
    return 'Kisumu';
  }
  
  // Handle other common variations and city-to-county mappings
  const countyMappings: { [key: string]: string } = {
    // Nairobi variations
    'nairobi city': 'Nairobi',
    'nairobi county': 'Nairobi',
    'nairobi metropolitan': 'Nairobi',
    
    // Mombasa variations
    'mombasa city': 'Mombasa',
    'mombasa county': 'Mombasa',
    'mombasa island': 'Mombasa',
    
    // Kisumu variations
    'kisumu city': 'Kisumu',
    'kisumu county': 'Kisumu',
    
    // Other major cities to their counties
    'nakuru town': 'Nakuru',
    'eldoret': 'Uasin Gishu',
    'thika': 'Kiambu',
    'machakos town': 'Machakos',
    'kitale': 'Trans Nzoia',
    'malindi': 'Kilifi',
    'lamu town': 'Lamu',
    'garissa town': 'Garissa',
    'isiolo town': 'Isiolo',
    'marsabit town': 'Marsabit',
    'mandera town': 'Mandera',
    'wajir town': 'Wajir',
    'moyale': 'Marsabit',
    'kakamega town': 'Kakamega',
    'bungoma town': 'Bungoma',
    'kericho town': 'Kericho',
    'bomet town': 'Bomet',
    'nyeri town': 'Nyeri',
    'embu town': 'Embu',
    'meru town': 'Meru'
  };
  
  const lowerNormalized = normalized.toLowerCase();
  return countyMappings[lowerNormalized] || normalized;
};

/**
 * Get county statistics with normalized names
 */
export const getCountyStatistics = (cases: any[]) => {
  if (!cases || cases.length === 0) return [];
  
  const countyCount: { [key: string]: number } = {};
  
  cases.forEach(case_ => {
    const normalizedCounty = normalizeCountyName(case_.county);
    countyCount[normalizedCounty] = (countyCount[normalizedCounty] || 0) + 1;
  });
  
  return Object.entries(countyCount)
    .sort(([, a], [, b]) => b - a)
    .map(([county, count], index) => ({
      county,
      count,
      rank: index + 1,
      percentage: Math.round((count / cases.length) * 100)
    }));
};

/**
 * Get top N counties by incident count
 */
export const getTopCounties = (cases: any[], limit: number = 3) => {
  return getCountyStatistics(cases).slice(0, limit);
};
