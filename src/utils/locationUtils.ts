/**
 * Calculate the distance between two points on Earth in kilometers
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

/**
 * Convert degrees to radians
 * @param deg Degrees
 * @returns Radians
 */
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

/**
 * Generate a random point within a given radius of a center point
 * @param centerLat Center latitude
 * @param centerLng Center longitude
 * @param radiusInKm Radius in kilometers
 * @returns [latitude, longitude]
 */
export const generateRandomPoint = (
  centerLat: number,
  centerLng: number,
  radiusInKm: number
): [number, number] => {
  const radiusInDegrees = radiusInKm / 111.32;
  
  const u = Math.random();
  const v = Math.random();
  
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  
  // Adjust the x-coordinate for the shrinking of the east-west distances
  const newLng = x / Math.cos(centerLat * (Math.PI / 180)) + centerLng;
  const newLat = y + centerLat;
  
  return [newLat, newLng];
};
