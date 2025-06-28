import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import RideMap from '@/components/RideMap';

export default function MapScreen() {
  const router = useRouter();
  const { pickup, destination } = useLocalSearchParams<{
    pickup: string;
    destination: string;
  }>();

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <RideMap 
        pickup={pickup || ''} 
        destination={destination || ''} 
        onBack={handleBack}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
