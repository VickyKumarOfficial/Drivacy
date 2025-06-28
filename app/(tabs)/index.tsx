import React, { useState } from 'react';
import { View, StyleSheet, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import SimpleLocationInput from '@/components/SimpleLocationInput';
import TransportSuggestions from '@/components/TransportSuggestions';
import OfferCarousel from '@/components/OfferCarousel';
import RideMap from '@/components/RideMapWithDirections';
import SOSButton from '@/components/SOSButton';
import { useEmergencyContacts } from '@/contexts/EmergencyContactsContext';
import { LocationCoordinate } from '@/utils/locationService';

export default function HomeScreen() {
  const [showMap, setShowMap] = useState(false);
  const [mapData, setMapData] = useState<{
    pickup: LocationCoordinate | null;
    destination: LocationCoordinate | null;
  }>({ pickup: null, destination: null });
  const [isMapLoading, setIsMapLoading] = useState(false);
  
  // Get emergency contacts from context
  const { contacts } = useEmergencyContacts();

  const handleLocationSelect = (pickup: string, destination: string) => {
    console.log('Ride requested:', { pickup, destination });
    // This would typically trigger the ride booking flow
  };

  const handleShowMap = async (pickup: LocationCoordinate, destination: LocationCoordinate) => {
    console.log('Showing map with coordinates:', { pickup, destination });
    setIsMapLoading(true);
    setMapData({ pickup, destination });
    
    // Small delay to show loading state and prepare map
    setTimeout(() => {
      setIsMapLoading(false);
      setShowMap(true);
    }, 500);
  };

  const handleCloseMap = () => {
    setShowMap(false);
    setMapData({ pickup: null, destination: null });
  };

  const handleTransportSelect = (type: string) => {
    console.log('Transport selected:', type);
    // This would navigate to the specific transport booking flow
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Drivacy" showNotifications={true} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.scrollView}>
          <SimpleLocationInput 
            onLocationSelect={handleLocationSelect}
            onShowMap={handleShowMap}
            isMapLoading={isMapLoading}
          />
          <TransportSuggestions onTransportSelect={handleTransportSelect} />
          <OfferCarousel />
          
          {/* SOS Button */}
          <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, alignItems: 'center' }}>
            <SOSButton 
              contacts={contacts}
              variant="normal"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
      {/* Map Modal */}
      {showMap && mapData.pickup && mapData.destination && (
        <Modal
          visible={showMap}
          animationType="slide"
          presentationStyle="overFullScreen"
        >
          <RideMap 
            pickup={mapData.pickup}
            destination={mapData.destination}
            onBack={handleCloseMap}
          />
        </Modal>
      )}
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
  }
});