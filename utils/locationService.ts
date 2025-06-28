// utils/locationService.ts
// Dynamic location handling with Google Places API and Geocoding

export interface LocationCoordinate {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
  placeId?: string;
}

// Get from environment
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!;

/**
 * Convert address/place name to coordinates using Google Geocoding API
 */
export async function geocodeLocation(address: string): Promise<LocationCoordinate | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;
      
      return {
        latitude: location.lat,
        longitude: location.lng,
        name: result.formatted_address,
        address: result.formatted_address,
        placeId: result.place_id
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Get place details from place ID
 */
export async function getPlaceDetails(placeId: string): Promise<LocationCoordinate | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address,name&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.result) {
      const result = data.result;
      const location = result.geometry.location;
      
      return {
        latitude: location.lat,
        longitude: location.lng,
        name: result.name || result.formatted_address,
        address: result.formatted_address,
        placeId: placeId
      };
    }
    
    return null;
  } catch (error) {
    console.error('Place details error:', error);
    return null;
  }
}

/**
 * Search for places using text query
 */
export async function searchPlaces(query: string, location?: LocationCoordinate): Promise<LocationCoordinate[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&key=${GOOGLE_MAPS_API_KEY}`;
    
    // Add location bias if provided (search near current location)
    if (location) {
      url += `&location=${location.latitude},${location.longitude}&radius=50000`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results) {
      return data.results.slice(0, 5).map((result: any) => ({
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        name: result.name,
        address: result.formatted_address,
        placeId: result.place_id
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Place search error:', error);
    return [];
  }
}

/**
 * Get user's current location (requires permission)
 */
export async function getCurrentLocation(): Promise<LocationCoordinate | null> {
  try {
    // This would require expo-location package
    // For now, return a default location (Delhi, India)
    return {
      latitude: 28.6139,
      longitude: 77.2090,
      name: 'Current Location',
      address: 'Delhi, India'
    };
  } catch (error) {
    console.error('Current location error:', error);
    return null;
  }
}

/**
 * Fallback dummy locations for quick testing/demo
 */
export const POPULAR_LOCATIONS: LocationCoordinate[] = [
  { latitude: 28.6139, longitude: 77.2090, name: 'Connaught Place', address: 'Connaught Place, New Delhi, Delhi, India' },
  { latitude: 28.6304, longitude: 77.2177, name: 'India Gate', address: 'India Gate, New Delhi, Delhi, India' },
  { latitude: 28.5562, longitude: 77.1000, name: 'Gurgaon Cyber City', address: 'Cyber City, Gurgaon, Haryana, India' },
  { latitude: 28.5665, longitude: 77.1031, name: 'IGI Airport', address: 'Indira Gandhi International Airport, New Delhi, India' },
  { latitude: 28.6127, longitude: 77.2295, name: 'Kashmere Gate Metro', address: 'Kashmere Gate Metro Station, New Delhi, India' },
  { latitude: 28.6692, longitude: 77.2265, name: 'Red Fort', address: 'Red Fort, New Delhi, Delhi, India' },
  { latitude: 28.5921, longitude: 77.2507, name: 'Lotus Temple', address: 'Lotus Temple, New Delhi, Delhi, India' },
  { latitude: 28.6129, longitude: 77.2295, name: 'Chandni Chowk', address: 'Chandni Chowk, New Delhi, Delhi, India' }
];

/**
 * Smart location resolver - tries multiple methods to get coordinates
 */
export async function resolveLocation(input: string): Promise<LocationCoordinate | null> {
  // First, try to find in popular locations (for demo/quick access)
  const popularMatch = POPULAR_LOCATIONS.find(loc => 
    (loc.name && loc.name.toLowerCase().includes(input.toLowerCase())) ||
    (loc.address && loc.address.toLowerCase().includes(input.toLowerCase()))
  );
  
  if (popularMatch) {
    return popularMatch;
  }
  
  // Then try geocoding for real addresses
  const geocoded = await geocodeLocation(input);
  if (geocoded) {
    return geocoded;
  }
  
  // Finally, try place search
  const places = await searchPlaces(input);
  if (places.length > 0) {
    return places[0];
  }
  
  return null;
}
