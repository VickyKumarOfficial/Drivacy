import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
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