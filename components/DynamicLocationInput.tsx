import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { MapPin, Navigation, Clock, Search } from 'lucide-react-native';
import { resolveLocation, LocationCoordinate, POPULAR_LOCATIONS } from '@/utils/locationService';

// Fallback popular locations in case import fails
const FALLBACK_LOCATIONS: LocationCoordinate[] = [
  { latitude: 28.6139, longitude: 77.2090, name: 'Connaught Place', address: 'Connaught Place, New Delhi, Delhi, India' },
  { latitude: 28.6304, longitude: 77.2177, name: 'India Gate', address: 'India Gate, New Delhi, Delhi, India' },
  { latitude: 28.5562, longitude: 77.1000, name: 'Gurgaon Cyber City', address: 'Cyber City, Gurgaon, Haryana, India' },
  { latitude: 28.5665, longitude: 77.1031, name: 'IGI Airport', address: 'Indira Gandhi International Airport, New Delhi, India' },
];

interface LocationInputProps {
  onLocationSelect: (pickup: string, destination: string) => void;
  onShowMap?: (pickup: LocationCoordinate, destination: LocationCoordinate) => void;
  isMapLoading?: boolean;
}

export default function DynamicLocationInput({ onLocationSelect, onShowMap, isMapLoading }: LocationInputProps) {
  const [pickupLocation, setPickupLocation] = useState<LocationCoordinate | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<LocationCoordinate | null>(null);
  const [searchingLocation, setSearchingLocation] = useState<'pickup' | 'destination' | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [isComponentReady, setIsComponentReady] = useState(false);

  const pickupRef = useRef<any>(null);
  const destinationRef = useRef<any>(null);

  // Use fallback if POPULAR_LOCATIONS is not available
  const popularLocations = POPULAR_LOCATIONS || FALLBACK_LOCATIONS;

  // Delay initialization to avoid filter error
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComponentReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSwapLocations = () => {
    const tempPickup = pickupLocation;
    const tempDestination = destinationLocation;
    
    setPickupLocation(tempDestination);
    setDestinationLocation(tempPickup);
    
    // Update the input texts
    if (pickupRef.current && destinationRef.current) {
      pickupRef.current.setAddressText(tempDestination?.name || '');
      destinationRef.current.setAddressText(tempPickup?.name || '');
    }
  };

  const handleLocationResult = async (data: any, details: any, type: 'pickup' | 'destination') => {
    setIsResolving(true);
    
    try {
      let location: LocationCoordinate;
      
      if (details && details.geometry && details.geometry.location) {
        // From Places API
        location = {
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
          name: details.name || data.description,
          address: details.formatted_address,
          placeId: details.place_id
        };
      } else if (data && data.description) {
        // Fallback: resolve using our service
        const resolved = await resolveLocation(data.description);
        if (!resolved) {
          Alert.alert('Location Not Found', 'Could not find the specified location. Please try again.');
          return;
        }
        location = resolved;
      } else {
        // Last fallback: show error
        Alert.alert('Invalid Location', 'Please select a valid location from the suggestions.');
        return;
      }
      
      if (type === 'pickup') {
        setPickupLocation(location);
      } else {
        setDestinationLocation(location);
      }
      
      console.log(`${type} location set:`, location);
    } catch (error) {
      console.error('Error resolving location:', error);
      Alert.alert('Error', 'Failed to resolve location. Please try again.');
    } finally {
      setIsResolving(false);
    }
  };

  const handleShowRoute = () => {
    if (pickupLocation && destinationLocation && onShowMap) {
      onShowMap(pickupLocation, destinationLocation);
    }
  };

  const handleQuickSelect = (location: LocationCoordinate, type: 'pickup' | 'destination') => {
    if (type === 'pickup') {
      setPickupLocation(location);
      pickupRef.current?.setAddressText(location.name || '');
    } else {
      setDestinationLocation(location);
      destinationRef.current?.setAddressText(location.name || '');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.locationContainer}>
        <View style={styles.locationLine}>
          <View style={styles.locationDot} />
          <View style={styles.line} />
          <View style={[styles.locationDot, styles.destinationDot]} />
        </View>
        
        <View style={styles.inputsContainer}>
          {/* Pickup Input */}
          {isComponentReady ? (
            <GooglePlacesAutocomplete
              ref={pickupRef}
              placeholder="Pickup location"
              onPress={(data, details = null) => handleLocationResult(data, details, 'pickup')}
              query={{
                key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
                language: 'en',
                components: 'country:in', // Restrict to India
              }}
              fetchDetails={true}
              enablePoweredByContainer={false}
              suppressDefaultStyles={false}
              listViewDisplayed="auto"
              keyboardShouldPersistTaps="handled"
              onFail={(error) => console.log('GooglePlacesAutocomplete Error:', error)}
              onNotFound={() => console.log('No results found')}
              onTimeout={() => console.log('GooglePlacesAutocomplete timeout')}
              numberOfLines={3}
              styles={{
                container: styles.autocompleteContainer,
                textInputContainer: [styles.inputWrapper, pickupLocation && styles.inputFilled],
                textInput: styles.textInput,
                row: styles.suggestionRow,
                description: styles.suggestionText,
                listView: [styles.suggestionsList, { maxHeight: 150 }],
              }}
              renderLeftButton={() => (
                <View style={styles.iconContainer}>
                  <MapPin color="#10b981" size={16} />
                </View>
              )}
              renderRightButton={() => (
                <TouchableOpacity style={styles.iconButton}>
                  <Navigation color="#2563eb" size={16} />
                </TouchableOpacity>
              )}
              debounce={300}
              minLength={2}
            />
          ) : (
            <View style={[styles.inputWrapper, styles.loadingInput]}>
              <View style={styles.iconContainer}>
                <MapPin color="#10b981" size={16} />
              </View>
              <Text style={styles.loadingText}>Loading pickup input...</Text>
            </View>
          )}
          
          {/* Destination Input */}
          {isComponentReady ? (
            <GooglePlacesAutocomplete
              ref={destinationRef}
              placeholder="Where to?"
              onPress={(data, details = null) => handleLocationResult(data, details, 'destination')}
              query={{
                key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
                language: 'en',
                components: 'country:in', // Restrict to India
              }}
              fetchDetails={true}
              enablePoweredByContainer={false}
              suppressDefaultStyles={false}
              listViewDisplayed="auto"
              keyboardShouldPersistTaps="handled"
              onFail={(error) => console.log('GooglePlacesAutocomplete Error:', error)}
              onNotFound={() => console.log('No results found')}
              onTimeout={() => console.log('GooglePlacesAutocomplete timeout')}
              numberOfLines={3}
              styles={{
                container: styles.autocompleteContainer,
                textInputContainer: [styles.inputWrapper, destinationLocation && styles.inputFilled],
                textInput: styles.textInput,
                row: styles.suggestionRow,
                description: styles.suggestionText,
                listView: [styles.suggestionsList, { maxHeight: 150 }],
              }}
              renderLeftButton={() => (
                <View style={styles.iconContainer}>
                  <MapPin color="#ef4444" size={16} />
                </View>
              )}
              renderRightButton={() => (
                <TouchableOpacity style={styles.iconButton}>
                  <Clock color="#6b7280" size={16} />
                </TouchableOpacity>
              )}
              debounce={300}
              minLength={2}
            />
          ) : (
            <View style={[styles.inputWrapper, styles.loadingInput]}>
              <View style={styles.iconContainer}>
                <MapPin color="#ef4444" size={16} />
              </View>
              <Text style={styles.loadingText}>Loading destination input...</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity style={styles.swapButton} onPress={handleSwapLocations}>
          <Text style={styles.swapText}>⇅</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Select Popular Locations */}
      <View style={styles.quickSelectContainer}>
        <Text style={styles.quickSelectTitle}>Popular Locations</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickSelectScroll}>
          {popularLocations?.slice(0, 4).map((location, index) => (
            <View key={index} style={styles.quickSelectItem}>
              <TouchableOpacity 
                style={styles.quickSelectButton}
                onPress={() => handleQuickSelect(location, 'pickup')}
              >
                <Text style={styles.quickSelectText}>📍 {location.name}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.quickSelectButton, styles.quickSelectDestination]}
                onPress={() => handleQuickSelect(location, 'destination')}
              >
                <Text style={styles.quickSelectText}>🎯 To here</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
      
      {/* Loading indicator */}
      {isResolving && (
        <View style={styles.resolvingContainer}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.resolvingText}>Finding location...</Text>
        </View>
      )}
      
      {/* Show Route Button */}
      {pickupLocation && destinationLocation && (
        <TouchableOpacity 
          style={[styles.showRouteButton, isMapLoading && styles.showRouteButtonDisabled]} 
          onPress={handleShowRoute}
          activeOpacity={0.8}
          disabled={isMapLoading}
        >
          {isMapLoading ? (
            <ActivityIndicator color="#ffffff" size={16} />
          ) : (
            <MapPin color="#ffffff" size={16} />
          )}
          <Text style={styles.showRouteText}>
            {isMapLoading ? 'Loading...' : 'Show Route'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  locationLine: {
    alignItems: 'center',
    marginRight: 12,
    paddingVertical: 8,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    marginBottom: 8,
  },
  destinationDot: {
    backgroundColor: '#ef4444',
    marginTop: 8,
    marginBottom: 0,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#d1d5db',
    minHeight: 40,
  },
  inputsContainer: {
    flex: 1,
  },
  autocompleteContainer: {
    flex: 0,
    marginVertical: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 0,
  },
  inputFilled: {
    borderColor: '#2563eb',
    backgroundColor: '#ffffff',
  },
  iconContainer: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 14,
    paddingHorizontal: 0,
  },
  iconButton: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  suggestionsList: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
    backgroundColor: '#ffffff',
  },
  suggestionRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
  },
  swapButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
    backgroundColor: '#f3f4f6',
    borderRadius: 18,
    marginLeft: 8,
    marginTop: 20,
  },
  swapText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  quickSelectContainer: {
    marginTop: 16,
  },
  quickSelectTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  quickSelectScroll: {
    marginBottom: 8,
  },
  quickSelectItem: {
    marginRight: 12,
  },
  quickSelectButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 4,
  },
  quickSelectDestination: {
    backgroundColor: '#dbeafe',
  },
  quickSelectText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
  resolvingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  resolvingText: {
    marginLeft: 8,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#2563eb',
  },
  showRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  showRouteButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  showRouteText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 8,
  },
  loadingInput: {
    backgroundColor: '#f9fafb',
    opacity: 0.7,
  },
  loadingText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#9ca3af',
    paddingVertical: 14,
  },
});
