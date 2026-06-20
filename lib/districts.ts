/**
 * District Coordinates Lookup
 *
 * Static mapping of supported districts to their coordinates.
 * Used by the cohort provisioning API when lat/lon aren't provided.
 *
 * For the hackathon: covers Indian districts with knowledge base coverage.
 * Production would use a geocoding service or more comprehensive dataset.
 */

export interface DistrictCoords {
  lat: number;
  lon: number;
}

/**
 * Supported districts with coordinates.
 * These match the districts in the existing agrinexus-ai knowledge base.
 */
export const DISTRICT_COORDS: Record<string, DistrictCoords> = {
  // Maharashtra - Cotton/Soybean belt (existing coverage)
  'Latur': { lat: 18.4088, lon: 76.5604 },
  'Jalna': { lat: 19.8347, lon: 75.8816 },
  'Nagpur': { lat: 21.1458, lon: 79.0882 },
  'Pune': { lat: 18.5204, lon: 73.8567 },
  'Aurangabad': { lat: 19.8762, lon: 75.3433 },
  'Amravati': { lat: 20.9374, lon: 77.7796 },
  'Akola': { lat: 20.7002, lon: 77.0082 },
  'Yavatmal': { lat: 20.3899, lon: 78.1307 },
  'Wardha': { lat: 20.7453, lon: 78.6022 },
  'Washim': { lat: 20.1000, lon: 77.1333 },

  // Telangana - Cotton belt
  'Adilabad': { lat: 19.6641, lon: 78.5320 },
  'Warangal': { lat: 17.9784, lon: 79.5941 },
  'Khammam': { lat: 17.2473, lon: 80.1514 },

  // Gujarat - Cotton/Groundnut
  'Rajkot': { lat: 22.3039, lon: 70.8022 },
  'Ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'Surat': { lat: 21.1702, lon: 72.8311 },

  // Madhya Pradesh - Soybean belt
  'Indore': { lat: 22.7196, lon: 75.8577 },
  'Ujjain': { lat: 23.1765, lon: 75.7885 },
  'Dewas': { lat: 22.9676, lon: 76.0534 },
};

/**
 * Get coordinates for a district.
 * Returns null if district is not in the lookup table.
 */
export function getDistrictCoords(district: string): DistrictCoords | null {
  // Case-insensitive lookup
  const normalized = Object.keys(DISTRICT_COORDS).find(
    (key) => key.toLowerCase() === district.toLowerCase()
  );

  return normalized ? DISTRICT_COORDS[normalized] : null;
}

/**
 * Get list of supported district names.
 */
export function getSupportedDistricts(): string[] {
  return Object.keys(DISTRICT_COORDS);
}

/**
 * Check if a district is supported.
 */
export function isDistrictSupported(district: string): boolean {
  return getDistrictCoords(district) !== null;
}
