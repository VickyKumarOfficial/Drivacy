import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MapPin, Navigation, Clock } from 'lucide-react-native';

interface LocationInputProps {
  onLocationSelect: (pickup: string, destination: string) => void;
}

export default function LocationInput({ onLocationSelect }: LocationInputProps) {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [focusedInput, setFocusedInput] = useState<'pickup' | 'destination' | null>(null);

  const handleSwapLocations = () => {
    const temp = pickup;
    setPickup(destination);
    setDestination(temp);
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
          <View style={[styles.inputWrapper, focusedInput === 'pickup' && styles.inputFocused]}>
            <MapPin color="#6b7280" size={16} />
            <TextInput
              style={styles.input}
              placeholder="Pickup location"
              placeholderTextColor="#9ca3af"
              value={pickup}
              onChangeText={setPickup}
              onFocus={() => setFocusedInput('pickup')}
              onBlur={() => setFocusedInput(null)}
            />
            <TouchableOpacity>
              <Navigation color="#2563eb" size={16} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.inputWrapper, focusedInput === 'destination' && styles.inputFocused]}>
            <MapPin color="#ef4444" size={16} />
            <TextInput
              style={styles.input}
              placeholder="Where to?"
              placeholderTextColor="#9ca3af"
              value={destination}
              onChangeText={setDestination}
              onFocus={() => setFocusedInput('destination')}
              onBlur={() => setFocusedInput(null)}
            />
            <TouchableOpacity>
              <Clock color="#6b7280" size={16} />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity style={styles.swapButton} onPress={handleSwapLocations}>
          <Text style={styles.swapText}>⇅</Text>
        </TouchableOpacity>
      </View>
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputFocused: {
    borderColor: '#2563eb',
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  swapButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
    backgroundColor: '#f3f4f6',
    borderRadius: 18,
    marginLeft: 8,
  },
  swapText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: 'bold',
  },
});