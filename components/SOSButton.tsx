import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  FlatList,
  Linking,
  Vibration,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { AlertCircle, Phone, X, MessageSquare, AlertTriangle } from 'lucide-react-native';

export interface EmergencyContact {
  name: string;
  phone: string;
}

interface SOSButtonProps {
  contacts: EmergencyContact[];
  currentLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  rideInfo?: {
    driverName?: string;
    vehicleInfo?: string;
    rideId?: string;
  };
  variant?: 'normal' | 'floating' | 'mini';
}

export default function SOSButton({ 
  contacts, 
  currentLocation,
  rideInfo,
  variant = 'normal'
}: SOSButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [calling, setCalling] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];
  
  // Set up pulsing animation for the SOS button
  useEffect(() => {
    const pulsing = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true
        })
      ])
    );
    
    if (variant === 'floating') {
      pulsing.start();
    }
    
    return () => {
      pulsing.stop();
    };
  }, [variant, pulseAnim]);
  
  // Open SOS modal
  const handleOpenSOS = () => {
    // Vibrate phone to indicate emergency action
    Vibration.vibrate(Platform.OS === 'ios' 
      ? [0, 100, 100, 100, 100, 300]  // iOS pattern
      : [0, 100, 100, 100, 100, 300]); // Android pattern
    
    if (contacts.length === 0) {
      Alert.alert(
        'No Emergency Contacts',
        'Please add emergency contacts in your settings.',
        [
          { text: 'OK' }
        ]
      );
      return;
    }
    setModalVisible(true);
  };
  
  // Close the modal
  const handleCloseModal = () => {
    setModalVisible(false);
  };
  
  // Call emergency contact
  const callContact = async (contact: EmergencyContact) => {
    try {
      setCalling(true);
      const phoneNumber = contact.phone.replace(/\s+/g, '');
      await Linking.openURL(`tel:${phoneNumber}`);
    } catch (error) {
      Alert.alert('Error', 'Could not initiate call');
    } finally {
      setCalling(false);
    }
  };
  
  // Send emergency SMS with location
  const sendEmergencySMS = async (contact: EmergencyContact) => {
    try {
      setCalling(true);
      const phoneNumber = contact.phone.replace(/\s+/g, '');
      
      let message = "EMERGENCY: I need help! ";
      
      if (rideInfo) {
        message += `I'm in a Drivacy ride `;
        if (rideInfo.driverName) message += `with driver ${rideInfo.driverName} `;
        if (rideInfo.vehicleInfo) message += `in ${rideInfo.vehicleInfo} `;
      }
      
      if (currentLocation) {
        message += `My current location: ${currentLocation.address || 
          `https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`}`;
      }
      
      await Linking.openURL(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`);
    } catch (error) {
      Alert.alert('Error', 'Could not send emergency message');
    } finally {
      setCalling(false);
    }
  };
  
  // Call emergency services (911/112)
  const callEmergencyServices = async () => {
    try {
      setCalling(true);
      await Linking.openURL('tel:911'); // Use appropriate emergency number based on location
    } catch (error) {
      Alert.alert('Error', 'Could not call emergency services');
    } finally {
      setCalling(false);
    }
  };

  return (
    <>
      {/* SOS Button with pulsing animation */}
      <Animated.View style={{ 
        transform: [{ scale: variant === 'floating' ? pulseAnim : 1 }],
        shadowOpacity: variant === 'floating' ? 0.8 : 0.5,
        shadowRadius: variant === 'floating' ? 8 : 4,
      }}>
        <TouchableOpacity 
          style={[
            styles.sosButton,
            variant === 'floating' && styles.sosButtonFloating,
            variant === 'mini' && styles.sosButtonMini
          ]}
          onPress={handleOpenSOS}
          activeOpacity={0.7}
        >
          <AlertTriangle color="#FFFFFF" size={variant === 'mini' ? 16 : 20} />
          {variant !== 'mini' && <Text style={styles.sosButtonText}>SOS</Text>}
        </TouchableOpacity>
      </Animated.View>
      
      {/* SOS Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Emergency Assistance</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <X color="#6b7280" size={24} />
              </TouchableOpacity>
            </View>
            
            {/* Emergency Services Button */}
            <TouchableOpacity 
              style={styles.emergencyServicesButton}
              onPress={callEmergencyServices}
              disabled={calling}
            >
              {calling ? (
                <ActivityIndicator color="#FFFFFF" size={20} />
              ) : (
                <>
                  <Phone color="#FFFFFF" size={20} />
                  <Text style={styles.emergencyServicesText}>Call Emergency Services (911)</Text>
                </>
              )}
            </TouchableOpacity>
            
            <Text style={styles.contactsTitle}>Your Emergency Contacts</Text>
            
            <FlatList
              data={contacts}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              style={styles.contactsList}
              renderItem={({ item }) => (
                <View style={styles.contactItem}>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    <Text style={styles.contactPhone}>{item.phone}</Text>
                  </View>
                  <View style={styles.contactActions}>
                    <TouchableOpacity 
                      style={styles.contactActionButton}
                      onPress={() => callContact(item)}
                    >
                      <Phone color="#2563eb" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.contactActionButton}
                      onPress={() => sendEmergencySMS(item)}
                    >
                      <MessageSquare color="#10b981" size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.noContacts}>No emergency contacts found.</Text>
              }
            />
            
            <Text style={styles.disclaimer}>
              Emergency messages will include your current location and ride details.
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626', // Brighter red
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  sosButtonFloating: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999, // Ensure it's above other elements
  },
  sosButtonMini: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 50,
    backgroundColor: '#b91c1c', // Darker red for mini variant
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  emergencyServicesButton: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  emergencyServicesText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  contactsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 10,
  },
  contactsList: {
    maxHeight: 300,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  contactPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
  },
  contactActionButton: {
    padding: 8,
    marginLeft: 8,
  },
  noContacts: {
    textAlign: 'center',
    color: '#9ca3af',
    paddingVertical: 20,
  },
  disclaimer: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
});
