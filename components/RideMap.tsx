import React, { useRef, useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { ArrowLeft } from 'lucide-react-native';

interface RideMapProps {
  pickup: string;
  destination: string;
  onBack?: () => void;
}

// Dummy coordinates for demo purposes
const DUMMY_LOCATIONS = {
  'home': { latitude: 28.6139, longitude: 77.2090, name: 'Home' },
  'office': { latitude: 28.6304, longitude: 77.2177, name: 'Office Complex' },
  'mall': { latitude: 28.5562, longitude: 77.1000, name: 'Shopping Mall' },
  'airport': { latitude: 28.5665, longitude: 77.1031, name: 'Airport' },
  'metro station': { latitude: 28.6127, longitude: 77.2295, name: 'Metro Station' },
  'hospital': { latitude: 28.6692, longitude: 77.2265, name: 'Hospital' },
  'school': { latitude: 28.5921, longitude: 77.2507, name: 'School' },
  'default': { latitude: 28.6139, longitude: 77.2090, name: 'Location' }
};

const RideMap = React.memo(({ pickup, destination, onBack }: RideMapProps) => {
  const mapRef = useRef<MapView>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Memoize coordinate calculations
  const mapData = useMemo(() => {
    const getCoordinates = (location: string) => {
      const locationKey = location.toLowerCase();
      for (const [key, coords] of Object.entries(DUMMY_LOCATIONS)) {
        if (locationKey.includes(key)) {
          return coords;
        }
      }
      const offset = Math.random() * 0.01;
      return {
        latitude: DUMMY_LOCATIONS.default.latitude + offset,
        longitude: DUMMY_LOCATIONS.default.longitude + offset,
        name: location || 'Location'
      };
    };

    const generateRealisticRoute = (start: any, end: any) => {
      const route = [start];
      
      // Calculate the total distance and direction
      const latDiff = end.latitude - start.latitude;
      const lngDiff = end.longitude - start.longitude;
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
      
      // Number of waypoints based on distance (more waypoints for longer routes)
      const waypointCount = Math.max(3, Math.floor(distance * 500));
      
      for (let i = 1; i < waypointCount; i++) {
        const progress = i / waypointCount;
        
        // Base interpolation
        const baseLat = start.latitude + (latDiff * progress);
        const baseLng = start.longitude + (lngDiff * progress);
        
        // Add realistic road-like curves and turns
        const curveIntensity = 0.003; // Adjust this to make curves more/less pronounced
        const roadVariation = Math.sin(progress * Math.PI * 4) * curveIntensity;
        const majorTurn = Math.sin(progress * Math.PI * 2) * curveIntensity * 0.5;
        
        // Simulate following major roads (slight preference for grid-like movement)
        const gridBias = 0.001;
        const gridAdjustmentLat = Math.sign(latDiff) * gridBias * Math.random();
        const gridAdjustmentLng = Math.sign(lngDiff) * gridBias * Math.random();
        
        route.push({
          latitude: baseLat + roadVariation + majorTurn + gridAdjustmentLat,
          longitude: baseLng + roadVariation * 0.7 + gridAdjustmentLng,
        });
      }
      
      route.push(end);
      return route;
    };

    const pickupCoords = getCoordinates(pickup);
    const destinationCoords = getCoordinates(destination);
    
    // Generate realistic route instead of straight line
    const routeCoordinates = generateRealisticRoute(pickupCoords, destinationCoords);

    const region = {
      latitude: (pickupCoords.latitude + destinationCoords.latitude) / 2,
      longitude: (pickupCoords.longitude + destinationCoords.longitude) / 2,
      latitudeDelta: Math.abs(pickupCoords.latitude - destinationCoords.latitude) + 0.02,
      longitudeDelta: Math.abs(pickupCoords.longitude - destinationCoords.longitude) + 0.02,
    };

    return { pickupCoords, destinationCoords, routeCoordinates, region };
  }, [pickup, destination]);

  const handleMapReady = useCallback(() => {
    setMapLoaded(true);
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.fitToCoordinates(mapData.routeCoordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }, 300);
  }, [mapData.routeCoordinates]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft color="#1f2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Route</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Loading overlay */}
      {!mapLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      )}

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapData.region}
        onMapReady={handleMapReady}
        showsUserLocation={false}
        showsMyLocationButton={false}
        zoomEnabled={true}
        scrollEnabled={true}
        loadingEnabled={true}
        mapType="standard"
        pitchEnabled={false}
        rotateEnabled={false}
      >
        {/* Pickup Marker */}
        <Marker
          coordinate={mapData.pickupCoords}
          title="Pickup Location"
          description={pickup}
          pinColor="#10b981"
        />

        {/* Destination Marker */}
        <Marker
          coordinate={mapData.destinationCoords}
          title="Destination"
          description={destination}
          pinColor="#ef4444"
        />

        {/* Route Line */}
        <Polyline
          coordinates={mapData.routeCoordinates}
          strokeColor="#2563eb"
          strokeWidth={4}
          lineDashPattern={[0]}
          lineJoin="round"
          lineCap="round"
        />
      </MapView>

      {/* Bottom Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.routeInfo}>
          <View style={styles.locationItem}>
            <View style={[styles.locationDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.locationText} numberOfLines={1}>{pickup}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.locationItem}>
            <View style={[styles.locationDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.locationText} numberOfLines={1}>{destination}</Text>
          </View>
        </View>
        
        <View style={styles.rideDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>~12 mins</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Distance</Text>
            <Text style={styles.detailValue}>5.2 km</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Fare</Text>
            <Text style={styles.detailValue}>₹150-180</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.bookButton} activeOpacity={0.8}>
          <Text style={styles.bookButtonText}>Book Ride</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    zIndex: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  map: {
    flex: 1,
    width: width,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    maxHeight: height * 0.35,
  },
  routeInfo: {
    marginBottom: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    flex: 1,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: '#d1d5db',
    marginLeft: 4,
    marginVertical: 2,
  },
  rideDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
  },
  bookButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default RideMap;
