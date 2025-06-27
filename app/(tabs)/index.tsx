import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import LocationInput from '@/components/LocationInput';
import TransportSuggestions from '@/components/TransportSuggestions';
import OfferCarousel from '@/components/OfferCarousel';

export default function HomeScreen() {
  const handleLocationSelect = (pickup: string, destination: string) => {
    console.log('Ride requested:', { pickup, destination });
    // This would typically trigger the ride booking flow
  };

  const handleTransportSelect = (type: string) => {
    console.log('Transport selected:', type);
    // This would navigate to the specific transport booking flow
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Drivacy" showNotifications={true} />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LocationInput onLocationSelect={handleLocationSelect} />
        <TransportSuggestions onTransportSelect={handleTransportSelect} />
        <OfferCarousel />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});