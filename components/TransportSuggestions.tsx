import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Plane, Brain as Train, Bus, Car, Zap } from 'lucide-react-native';

interface TransportSuggestionsProps {
  onTransportSelect: (type: string) => void;
}

const transportOptions = [
  { id: 'metro', name: 'Metro', icon: Zap, color: '#8b5cf6', bgColor: '#f3e8ff' },
  { id: 'bus', name: 'Bus', icon: Bus, color: '#059669', bgColor: '#d1fae5' },
  { id: 'flight', name: 'Flight', icon: Plane, color: '#2563eb', bgColor: '#dbeafe' },
  { id: 'train', name: 'Train', icon: Train, color: '#dc2626', bgColor: '#fee2e2' },
  { id: 'rental', name: 'Rental', icon: Car, color: '#ea580c', bgColor: '#fed7aa' },
];

export default function TransportSuggestions({ onTransportSelect }: TransportSuggestionsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book More Rides</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {transportOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, { backgroundColor: option.bgColor }]}
              onPress={() => onTransportSelect(option.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                <IconComponent color="#ffffff" size={24} />
              </View>
              <Text style={[styles.optionText, { color: option.color }]}>
                {option.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
    marginBottom: 16,
  },
  scrollContainer: {
    paddingRight: 20,
  },
  optionCard: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 100,
    borderRadius: 16,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
});