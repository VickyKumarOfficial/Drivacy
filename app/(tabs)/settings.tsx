import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, TextInput, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Shield, CreditCard, MapPin, CircleHelp as HelpCircle, Star, Share2, LogOut, ChevronRight, Lock, Phone, AlertCircle } from 'lucide-react-native';
import Header from '@/components/Header';
import { useEmergencyContacts } from '@/contexts/EmergencyContactsContext';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  type: 'navigate' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(false);
  
  // Use the emergency contacts context instead of local state
  const [emergencyContactsModalVisible, setEmergencyContactsModalVisible] = useState(false);
  const { contacts: emergencyContacts, addContact, removeContact } = useEmergencyContacts();
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  // Add new emergency contact
  const handleAddContact = () => {
    addContact(newContactName, newContactPhone);
    setNewContactName('');
    setNewContactPhone('');
  };

  // Close modal with validation
  const handleCloseEmergencyContactsModal = () => {
    setEmergencyContactsModalVisible(false);
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          icon: User,
          type: 'navigate',
          onPress: () => console.log('Edit Profile'),
        },
        {
          id: 'privacy',
          title: 'Privacy Settings',
          subtitle: 'Manage your privacy preferences',
          icon: Shield,
          type: 'navigate',
          onPress: () => console.log('Privacy Settings'),
        },
      ],
    },
    {
      title: 'Ride Preferences',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Ride updates and offers',
          icon: Bell,
          type: 'toggle',
          value: notificationsEnabled,
          onPress: () => setNotificationsEnabled(!notificationsEnabled),
        },
        {
          id: 'location',
          title: 'Location Sharing',
          subtitle: 'Share location with emergency contacts',
          icon: MapPin,
          type: 'toggle',
          value: locationSharingEnabled,
          onPress: () => setLocationSharingEnabled(!locationSharingEnabled),
        },
      ],
    },
    {
      title: 'Payment & Security',
      items: [
        {
          id: 'payment',
          title: 'Payment Methods',
          subtitle: 'Manage cards and payment options',
          icon: CreditCard,
          type: 'navigate',
          onPress: () => console.log('Payment Methods'),
        },
        {
          id: 'emergency',
          title: 'Emergency Contacts',
          subtitle: 'Set up SOS contacts',
          icon: Phone,
          type: 'navigate',
          onPress: () => setEmergencyContactsModalVisible(true),
        },
        {
          id: 'security',
          title: 'Security Settings',
          subtitle: 'Biometric and PIN settings',
          icon: Lock,
          type: 'navigate',
          onPress: () => console.log('Security Settings'),
        },
      ],
    },
    {
      title: 'Support & Feedback',
      items: [
        {
          id: 'help',
          title: 'Help Center',
          subtitle: 'Get help and support',
          icon: HelpCircle,
          type: 'navigate',
          onPress: () => console.log('Help Center'),
        },
        {
          id: 'rate',
          title: 'Rate Drivacy',
          subtitle: 'Share your app experience',
          icon: Star,
          type: 'navigate',
          onPress: () => console.log('Rate App'),
        },
        {
          id: 'share',
          title: 'Share Drivacy',
          subtitle: 'Invite friends and earn rewards',
          icon: Share2,
          type: 'navigate',
          onPress: () => console.log('Share App'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    const IconComponent = item.icon;
    
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <View style={styles.iconContainer}>
            <IconComponent color="#6b7280" size={20} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.settingRight}>
          {item.type === 'toggle' ? (
            <Switch
              value={item.value}
              onValueChange={item.onPress}
              trackColor={{ false: '#f3f4f6', true: '#2563eb' }}
              thumbColor={item.value ? '#ffffff' : '#ffffff'}
            />
          ) : (
            <ChevronRight color="#9ca3af" size={20} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Settings" showNotifications={false} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.7}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john.doe@example.com</Text>
            <Text style={styles.profilePhone}>+91 98765 43210</Text>
          </View>
          <ChevronRight color="#9ca3af" size={20} />
        </TouchableOpacity>

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        {/* Emergency Contacts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <View style={styles.sectionContent}>
            {emergencyContacts.length === 0 ? (
              <View style={styles.emptyContactsContainer}>
                <Text style={styles.emptyContactsText}>No emergency contacts added yet</Text>
              </View>
            ) : (
              emergencyContacts.map((contact, index) => (
                <View key={index} style={[
                  styles.settingItem, 
                  index === emergencyContacts.length - 1 ? styles.lastSettingItem : {}
                ]}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.iconContainer, { 
                      backgroundColor: index === 0 ? '#fee2e2' : '#f3f4f6'
                    }]}>
                      <Phone color={index === 0 ? '#ef4444' : '#6b7280'} size={20} />
                    </View>
                    <View style={styles.settingContent}>
                      <Text style={styles.settingTitle}>{contact.name}</Text>
                      <Text style={styles.settingSubtitle}>{contact.phone}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.settingRight}
                    onPress={() => removeContact(index)}
                    activeOpacity={0.7}
                    disabled={index === 0 && contact.phone === '911'}
                  >
                    <Text style={{
                      fontSize: 14, 
                      color: index === 0 && contact.phone === '911' ? '#d1d5db' : '#ef4444', 
                      fontFamily: 'Poppins-Medium'
                    }}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* Add Contact Button */}
          <TouchableOpacity
            style={{
              backgroundColor: '#2563eb',
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
              marginHorizontal: 20,
              marginVertical: 12
            }}
            onPress={() => setEmergencyContactsModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={{fontSize: 14, color: '#ffffff', fontFamily: 'Poppins-Medium'}}>+ Add Emergency Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7}>
          <LogOut color="#ef4444" size={20} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Drivacy v1.0.0</Text>
          <Text style={styles.versionSubtext}>Privacy-first ride hailing</Text>
        </View>
        
        {/* Emergency Contacts Modal */}
        <Modal
          visible={emergencyContactsModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCloseEmergencyContactsModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Emergency Contacts</Text>
                <TouchableOpacity onPress={handleCloseEmergencyContactsModal}>
                  <ChevronRight color="#6b7280" size={24} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalSubtitle}>
                These contacts will be available during emergencies via the SOS button.
              </Text>
              
              <FlatList
                data={emergencyContacts}
                keyExtractor={(item, index) => `contact-${index}`}
                renderItem={({ item, index }) => (
                  <View style={styles.contactItem}>
                    <View>
                      <Text style={styles.contactName}>{item.name}</Text>
                      <Text style={styles.contactPhone}>{item.phone}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => removeContact(index)}
                      disabled={index === 0 && item.phone === '911'}
                    >
                      <Text style={[
                        styles.removeButton, 
                        index === 0 && item.phone === '911' ? styles.disabledText : {}
                      ]}>
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                style={styles.contactsList}
              />
              
              <View style={styles.addContactSection}>
                <Text style={styles.sectionTitle}>Add New Contact</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Name"
                    value={newContactName}
                    onChangeText={setNewContactName}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone"
                    value={newContactPhone}
                    onChangeText={setNewContactPhone}
                    keyboardType="phone-pad"
                  />
                </View>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={handleAddContact}
                >
                  <Text style={styles.addButtonText}>Add Contact</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleCloseEmergencyContactsModal}
              >
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  settingRight: {
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#ef4444',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  versionSubtext: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1f2937',
    flex: 1,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#1f2937',
  },
  contactPhone: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  removeButton: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#ef4444',
  },
  disabledText: {
    color: '#d1d5db',
  },
  contactsList: {
    paddingBottom: 16,
  },
  addContactSection: {
    marginTop: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#ffffff',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#6b7280',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#ffffff',
  },
  emptyContactsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyContactsText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
    textAlign: 'center',
  },
  lastSettingItem: {
    borderBottomWidth: 0, // Remove border for last item
  },
});