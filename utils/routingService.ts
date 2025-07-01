// utils/routingService.ts
// This file shows how to implement real Google Directions API routing

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface DirectionsResponse {
  routes: Array<{
    overview_polyline: {
      points: string;
    };
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
    }>;
  }>;
}

// You need to get this from Google Cloud Console
const MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!;
/**
 * Decode polyline string to array of coordinates
 * This function decodes Google's encoded polyline format
 */
export function decodePolyline(encoded: string): Coordinate[] {
  const poly = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    poly.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return poly;
}

/**
 * Get real driving directions from Google Directions API
 */
export async function getDirections(
  origin: Coordinate,
  destination: Coordinate
): Promise<{
  coordinates: Coordinate[];
  distance: string;
  duration: string;
  distanceValue: number;
  durationValue: number;
}> {
  try {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destinationStr = `${destination.latitude},${destination.longitude}`;
    
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data: DirectionsResponse = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const leg = route.legs[0];
      
      // Decode the polyline to get all coordinate points
      const coordinates = decodePolyline(route.overview_polyline.points);
      
      return {
        coordinates,
        distance: leg.distance.text,
        duration: leg.duration.text,
        distanceValue: leg.distance.value,
        durationValue: leg.duration.value,
      };
    } else {
      throw new Error('No routes found');
    }
  } catch (error) {
    console.error('Error fetching directions:', error);
    throw error;
  }
}

/**
 * Alternative: Using React Native Maps Directions
 * Install: npm install react-native-maps-directions
 * 
 * Then in your map component:
 * 
 * import MapViewDirections from 'react-native-maps-directions';
 * 
 * <MapViewDirections
 *   origin={origin}
 *   destination={destination}
 *   apikey={GOOGLE_MAPS_API_KEY}
 *   strokeWidth={4}
 *   strokeColor="#2563eb"
 *   optimizeWaypoints={true}
 *   onStart={(params) => {
 *     console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
 *   }}
 *   onReady={result => {
 *     console.log(`Distance: ${result.distance} km`)
 *     console.log(`Duration: ${result.duration} min.`)
 *   }}
 *   onError={(errorMessage) => {
 *     console.log('GOT AN ERROR');
 *   }}
 * />
 */

// Example usage in RideMap component:
/*

import { getDirections } from '@/utils/routingService';

const [realRoute, setRealRoute] = useState(null);
const [routeLoading, setRouteLoading] = useState(false);

useEffect(() => {
  const fetchRealRoute = async () => {
    try {
      setRouteLoading(true);
      const route = await getDirections(pickupCoords, destinationCoords);
      setRealRoute(route);
    } catch (error) {
      console.error('Failed to get directions:', error);
      // Fallback to dummy route
    } finally {
      setRouteLoading(false);
    }
  };

  fetchRealRoute();
}, [pickupCoords, destinationCoords]);

// In your JSX:
<Polyline
  coordinates={realRoute?.coordinates || dummyRouteCoordinates}
  strokeColor="#2563eb"
  strokeWidth={4}
  lineDashPattern={[0]}
  lineJoin="round"
  lineCap="round"
/>

*/
