import React, { useRef, useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { ArrowLeft } from 'lucide-react-native';
import { LocationCoordinate } from '@/utils/locationService';

interface RideMapProps {
  pickup: LocationCoordinate;
  destination: LocationCoordinate;
  onBack?: () => void;
}

// TODO: Replace with your actual Google Maps API key
const MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!;

const RideMapWithDirections = React.memo(({ pickup, destination, onBack }: RideMapProps) => {
  const mapRef = useRef<MapView>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [routeReady, setRouteReady] = useState(false);
  const [routeError, setRouteError] = useState(false);
  const [routeInfo, setRouteInfo] = useState({
    distance: '5.2 km',
    duration: '~12 mins',
    fare: '₹150-180'
  });

  // Memoize coordinate calculations
  const mapData = useMemo(() => {
    const pickupCoords = pickup;
    const destinationCoords = destination;

    const region = {
      latitude: (pickupCoords.latitude + destinationCoords.latitude) / 2,
      longitude: (pickupCoords.longitude + destinationCoords.longitude) / 2,
      latitudeDelta: Math.abs(pickupCoords.latitude - destinationCoords.latitude) + 0.02,
      longitudeDelta: Math.abs(pickupCoords.longitude - destinationCoords.longitude) + 0.02,
    };

    return { pickupCoords, destinationCoords, region };
  }, [pickup, destination]);

  const handleMapReady = useCallback(() => {
    setMapLoaded(true);
  }, []);

  const handleDirectionsReady = useCallback((result: any) => {
    setRouteReady(true);
    setRouteError(false);
    
    console.log('Route result:', result);
    
    setRouteInfo({
      distance: `${result.distance.toFixed(1)} km`,
      duration: `~${Math.round(result.duration)} mins`,
      fare: `₹${Math.round(result.distance * 30)}-${Math.round(result.distance * 35)}`
    });
    
    // Fit the map to show the entire route
    if (mapRef.current && result.coordinates) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(result.coordinates, {
          edgePadding: { top: 80, right: 50, bottom: 200, left: 50 },
          animated: true,
        });
      }, 1000);
    }
  }, []);

  const handleDirectionsError = useCallback((errorMessage: string) => {
    console.log('Directions error:', errorMessage);
    setRouteError(true);
    setRouteReady(true);
  }, []);

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

      {/* Route loading overlay */}
      {mapLoaded && !routeReady && (
        <View style={styles.routeLoadingOverlay}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.routeLoadingText}>Finding best route...</Text>
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
          description={pickup.name || pickup.address || 'Pickup location'}
          pinColor="#10b981"
        />

        {/* Destination Marker */}
        <Marker
          coordinate={mapData.destinationCoords}
          title="Destination"
          description={destination.name || destination.address || 'Destination'}
          pinColor="#ef4444"
        />

        {/* Real Google Directions */}
        {mapLoaded && (
          <MapViewDirections
            origin={mapData.pickupCoords}
            destination={mapData.destinationCoords}
            apikey={MAPS_API_KEY}
            strokeWidth={4}
            strokeColor="#2563eb"
            optimizeWaypoints={true}
            onStart={(params) => {
              console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
            }}
            onReady={handleDirectionsReady}
            onError={handleDirectionsError}
          />
        )}
      </MapView>

      {/* Bottom Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.routeInfo}>
          <View style={styles.locationItem}>
            <View style={[styles.locationDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.locationText} numberOfLines={1}>{pickup.name || pickup.address || 'Pickup location'}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.locationItem}>
            <View style={[styles.locationDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.locationText} numberOfLines={1}>{destination.name || destination.address || 'Destination'}</Text>
          </View>
        </View>
        
        <View style={styles.rideDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{routeInfo.duration}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Distance</Text>
            <Text style={styles.detailValue}>{routeInfo.distance}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Fare</Text>
            <Text style={styles.detailValue}>{routeInfo.fare}</Text>
          </View>
        </View>

        {routeError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>
              ⚠️ Unable to find route. Using approximate data.
            </Text>
          </View>
        )}

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
  routeLoadingOverlay: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 5,
  },
  routeLoadingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#2563eb',
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
  errorBanner: {
    backgroundColor: '#fef3cd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#92400e',
    textAlign: 'center',
  },
});

export default RideMapWithDirections;
