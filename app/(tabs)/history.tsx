import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Clock, CreditCard, Star, Calendar } from 'lucide-react-native';
import Header from '@/components/Header';

interface RideHistory {
  id: string;
  date: string;
  time: string;
  pickup: string;
  destination: string;
  fare: number;
  paymentMethod: string;
  rating: number;
  driverName: string;
  vehicleType: string;
  status: 'completed' | 'cancelled';
}

const mockRides: RideHistory[] = [
  {
    id: '1',
    date: '2024-01-15',
    time: '2:30 PM',
    pickup: 'Home',
    destination: 'Office Complex',
    fare: 285,
    paymentMethod: 'UPI',
    rating: 5,
    driverName: 'Rajesh Kumar',
    vehicleType: 'Sedan',
    status: 'completed',
  },
  {
    id: '2',
    date: '2024-01-14',
    time: '9:15 AM',
    pickup: 'Metro Station',
    destination: 'Shopping Mall',
    fare: 180,
    paymentMethod: 'RideCoins',
    rating: 4,
    driverName: 'Priya Sharma',
    vehicleType: 'Hatchback',
    status: 'completed',
  },
  {
    id: '3',
    date: '2024-01-13',
    time: '7:45 PM',
    pickup: 'Restaurant',
    destination: 'Home',
    fare: 220,
    paymentMethod: 'Card',
    rating: 5,
    driverName: 'Mohammed Ali',
    vehicleType: 'SUV',
    status: 'completed',
  },
];

export default function HistoryScreen() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  const filteredRides = mockRides.filter(ride => 
    selectedFilter === 'all' || ride.status === selectedFilter
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={12}
        color={index < rating ? '#fbbf24' : '#d1d5db'}
        fill={index < rating ? '#fbbf24' : 'transparent'}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Ride History" showNotifications={false} />
      
      <View style={styles.filterContainer}>
        {['all', 'completed', 'cancelled'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter as any)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredRides.map((ride) => (
          <TouchableOpacity key={ride.id} style={styles.rideCard} activeOpacity={0.7}>
            <View style={styles.rideHeader}>
              <View style={styles.dateTimeContainer}>
                <Calendar size={16} color="#6b7280" />
                <Text style={styles.dateText}>{ride.date}</Text>
                <Clock size={16} color="#6b7280" />
                <Text style={styles.timeText}>{ride.time}</Text>
              </View>
              <View style={styles.fareContainer}>
                <Text style={styles.fareText}>₹{ride.fare}</Text>
                <Text style={styles.paymentMethod}>{ride.paymentMethod}</Text>
              </View>
            </View>

            <View style={styles.routeContainer}>
              <View style={styles.routeLine}>
                <View style={styles.pickupDot} />
                <View style={styles.routePath} />
                <View style={styles.destinationDot} />
              </View>
              <View style={styles.locationDetails}>
                <View style={styles.locationRow}>
                  <MapPin size={16} color="#10b981" />
                  <Text style={styles.locationText}>{ride.pickup}</Text>
                </View>
                <View style={styles.locationRow}>
                  <MapPin size={16} color="#ef4444" />
                  <Text style={styles.locationText}>{ride.destination}</Text>
                </View>
              </View>
            </View>

            <View style={styles.rideFooter}>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{ride.driverName}</Text>
                <Text style={styles.vehicleType}>{ride.vehicleType}</Text>
              </View>
              <View style={styles.ratingContainer}>
                <View style={styles.stars}>
                  {renderStars(ride.rating)}
                </View>
                <Text style={styles.ratingText}>{ride.rating}.0</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  rideCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  fareContainer: {
    alignItems: 'flex-end',
  },
  fareText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#059669',
  },
  paymentMethod: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  routeLine: {
    alignItems: 'center',
    marginRight: 12,
    paddingVertical: 4,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    marginBottom: 8,
  },
  routePath: {
    width: 2,
    height: 30,
    backgroundColor: '#d1d5db',
  },
  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    marginTop: 8,
  },
  locationDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  locationText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    marginLeft: 8,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
  vehicleType: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
});