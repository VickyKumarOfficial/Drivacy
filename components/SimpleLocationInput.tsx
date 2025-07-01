import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Platform, Keyboard } from 'react-native';
import { MapPin, Navigation, Clock } from 'lucide-react-native';
import { LocationCoordinate, searchPlaces } from '@/utils/locationService';

interface LocationInputProps {
  onLocationSelect: (pickup: string, destination: string) => void;
  onShowMap?: (pickup: LocationCoordinate, destination: LocationCoordinate) => void;
  isMapLoading?: boolean;
}

export default function SimpleLocationInput({ onLocationSelect, onShowMap, isMapLoading }: LocationInputProps) {
  // Location state
  const [pickupLocation, setPickupLocation] = useState<LocationCoordinate | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<LocationCoordinate | null>(null);
  
  // Text input state
  const [pickupText, setPickupText] = useState('');
  const [destinationText, setDestinationText] = useState('');
  
  // Suggestions state
  const [pickupSuggestions, setPickupSuggestions] = useState<LocationCoordinate[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<LocationCoordinate[]>([]);
  
  // UI state
  const [isSearching, setIsSearching] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'pickup' | 'destination' | null>(null);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  
  // References
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pickupInputRef = useRef<TextInput>(null);
  const destinationInputRef = useRef<TextInput>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle text input changes
  const handleTextChange = (text: string, type: 'pickup' | 'destination') => {
    // Update input text
    if (type === 'pickup') {
      setPickupText(text);
      setPickupLocation(null);
      
      // Only search if we have 2+ characters
      if (text.length >= 2) {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        setIsSearching(true);
        
        searchTimeoutRef.current = setTimeout(() => {
          performSearch(text, type);
        }, 300);
      } else {
        setPickupSuggestions([]);
        setShowPickupSuggestions(false);
      }
    } else {
      setDestinationText(text);
      setDestinationLocation(null);
      
      // Only search if we have 2+ characters
      if (text.length >= 2) {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        setIsSearching(true);
        
        searchTimeoutRef.current = setTimeout(() => {
          performSearch(text, type);
        }, 300);
      } else {
        setDestinationSuggestions([]);
        setShowDestinationSuggestions(false);
      }
    }
  };
  
  // Perform the actual search
  const performSearch = async (text: string, type: 'pickup' | 'destination') => {
    try {
      const results = await searchPlaces(text);
      console.log("Search results:", results.length);
      
      if (type === 'pickup') {
        setPickupSuggestions(results);
        setShowPickupSuggestions(results.length > 0);
      } else {
        setDestinationSuggestions(results);
        setShowDestinationSuggestions(results.length > 0);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (location: LocationCoordinate, type: 'pickup' | 'destination') => {
    if (type === 'pickup') {
      setPickupLocation(location);
      setPickupText(location.name || location.address || '');
      setPickupSuggestions([]);
      setShowPickupSuggestions(false);
      Keyboard.dismiss();
      
      // Focus the destination input if it's empty
      if (!destinationText) {
        setTimeout(() => destinationInputRef.current?.focus(), 300);
      }
    } else {
      setDestinationLocation(location);
      setDestinationText(location.name || location.address || '');
      setDestinationSuggestions([]);
      setShowDestinationSuggestions(false);
      Keyboard.dismiss();
    }
  };
  
  // Handle input focus
  const handleInputFocus = (type: 'pickup' | 'destination') => {
    setFocusedInput(type);
    if (type === 'pickup') {
      setShowPickupSuggestions(pickupSuggestions.length > 0);
    } else {
      setShowDestinationSuggestions(destinationSuggestions.length > 0);
    }
  };
  
  // Swap locations
  const handleSwapLocations = () => {
    setPickupText(destinationText);
    setDestinationText(pickupText);
    setPickupLocation(destinationLocation);
    setDestinationLocation(pickupLocation);
  };

  // Show route on map
  const handleShowRoute = () => {
    if (pickupLocation && destinationLocation && onShowMap) {
      onShowMap(pickupLocation, destinationLocation);
    }
  };

  return (
    <View style={styles.container}>
      {/* Pickup and destination inputs */}
      <View style={styles.inputsContainer}>
        <View style={styles.locationLine}>
          <View style={styles.locationDot} />
          <View style={styles.line} />
          <View style={[styles.locationDot, styles.destinationDot]} />
        </View>
        
        <View style={styles.fieldsContainer}>
          {/* Pickup Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              ref={pickupInputRef}
              style={styles.textInput}
              placeholder="Pickup location"
              placeholderTextColor="#9ca3af"
              value={pickupText}
              onChangeText={(text) => handleTextChange(text, 'pickup')}
              onFocus={() => handleInputFocus('pickup')}
            />
          </View>
          
          {/* Destination Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              ref={destinationInputRef}
              style={styles.textInput}
              placeholder="Where to?"
              placeholderTextColor="#9ca3af"
              value={destinationText}
              onChangeText={(text) => handleTextChange(text, 'destination')}
              onFocus={() => handleInputFocus('destination')}
            />
          </View>
          
          {/* Swap button */}
          <TouchableOpacity 
            style={styles.swapButton}
            onPress={handleSwapLocations}
          >
            <Text style={styles.swapText}>⇅</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Loading indicator */}
      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.loadingText}>Searching locations...</Text>
        </View>
      )}
      
      {/* Pickup Suggestions */}
      {showPickupSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={pickupSuggestions}
            keyExtractor={(item, index) => `pickup-${item.placeId || index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(item, 'pickup')}
              >
                <MapPin color="#6b7280" size={16} />
                <View style={styles.suggestionTextContainer}>
                  <Text style={styles.suggestionTitle} numberOfLines={1}>
                    {item.name || 'Location'}
                  </Text>
                  {item.address && (
                    <Text style={styles.suggestionSubtitle} numberOfLines={1}>
                      {item.address}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
            style={{ maxHeight: 200 }}
          />
        </View>
      )}
      
      {/* Destination Suggestions */}
      {showDestinationSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={destinationSuggestions}
            keyExtractor={(item, index) => `destination-${item.placeId || index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(item, 'destination')}
              >
                <MapPin color="#6b7280" size={16} />
                <View style={styles.suggestionTextContainer}>
                  <Text style={styles.suggestionTitle} numberOfLines={1}>
                    {item.name || 'Location'}
                  </Text>
                  {item.address && (
                    <Text style={styles.suggestionSubtitle} numberOfLines={1}>
                      {item.address}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
            style={{ maxHeight: 200 }}
          />
        </View>
      )}
      
      {/* Show Route Button */}
      {pickupLocation && destinationLocation && (
        <TouchableOpacity 
          style={[styles.showRouteButton, isMapLoading && styles.showRouteButtonDisabled]}
          onPress={handleShowRoute}
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
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    margin: 16,
  },
  inputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationLine: {
    alignItems: 'center',
    marginRight: 12,
    height: 80,
    justifyContent: 'space-between',
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
  },
  destinationDot: {
    backgroundColor: '#ef4444',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#d1d5db',
  },
  fieldsContainer: {
    flex: 1,
    position: 'relative',
  },
  inputWrapper: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginVertical: 6,
    paddingLeft: 12,
  },
  textInput: {
    fontSize: 16,
    paddingVertical: 12,
    color: '#1f2937',
  },
  swapButton: {
    position: 'absolute',
    right: -30,
    top: '50%',
    marginTop: -15,
    width: 30,
    height: 30,
    backgroundColor: '#f3f4f6',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  swapText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: '#4b5563',
    fontSize: 14,
  },
  suggestionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  suggestionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  showRouteButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  showRouteButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  showRouteText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
