import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, TextInput, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Shield, CreditCard, MapPin, CircleHelp as HelpCircle, Star, Share2, LogOut, ChevronRight, Lock } from 'lucide-react-native';
import Header from '@/components/Header';

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
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationSharingEnabled, setLocationSharingEnabled] = React.useState(false);

  // Emergency Contacts State
  const [sosModalVisible, setSosModalVisible] = React.useState(false);
  const [emergencyContacts, setEmergencyContacts] = React.useState([
    // Example: { name: 'Jane Doe', phone: '+91 98765 43211' }
  ]);
  const [newContactName, setNewContactName] = React.useState('');
  const [newContactPhone, setNewContactPhone] = React.useState('');

  // Add new contact
  const addContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      Alert.alert('Error', 'Please enter both name and phone number');
      return;
    }
    setEmergencyContacts([...emergencyContacts, { name: newContactName.trim(), phone: newContactPhone.trim() }]);
    setNewContactName('');
    setNewContactPhone('');
  };

  // Remove contact
  const removeContact = (index: number) => {
    const updated = [...emergencyContacts];
    updated.splice(index, 1);
    setEmergencyContacts(updated);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    if (emergencyContacts.length === 0) {
      Alert.alert('At least one contact required', 'Please add at least one emergency contact.');
      return;
    }
    setSosModalVisible(false);
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

        {/* Panic Mode (SOS) Button */}
        <TouchableOpacity style={styles.sosButton} activeOpacity={0.8} onPress={() => setSosModalVisible(true)}>
          <Text style={styles.sosButtonText}>Panic Mode (SOS)</Text>
        </TouchableOpacity>
{/* sosButton */}
        {/* Emergency Contacts Modal */}
        <Modal
          visible={sosModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Emergency Contacts</Text>
              <FlatList
                data={emergencyContacts}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.contactItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.contactName}>{item.name}</Text>
                      <Text style={styles.contactPhone}>{item.phone}</Text>
                    </View>
                    {emergencyContacts.length > 1 && (
                      <TouchableOpacity onPress={() => removeContact(index)}>
                        <Text style={styles.removeContact}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyContacts}>No contacts added yet.</Text>}
              />
              <View style={styles.addContactRow}>
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
                <TouchableOpacity style={styles.addButton} onPress={addContact}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleCloseModal}>
                <Text style={styles.saveButtonText}>Save & Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

{/* sosButton */}
        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

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

/* sosButton */
  sosButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sosButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'stretch',
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
  removeContact: {
    color: '#ef4444',
    fontFamily: 'Poppins-Medium',
    marginLeft: 12,
  },
  emptyContacts: {
    textAlign: 'center',
    color: '#9ca3af',
    fontFamily: 'Poppins-Regular',
    marginVertical: 12,
  },
  addContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  addButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  addButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
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
});