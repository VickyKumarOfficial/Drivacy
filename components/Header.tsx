import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Bell } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  showNotifications?: boolean;
}

export default function Header({ title = 'Drivacy', showNotifications = true }: HeaderProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <View style={styles.logoContainer}>
            <Shield color="#2563eb" size={28} />
            <Text style={styles.logoText}>{title}</Text>
          </View>
        </View>
        
        {showNotifications && (
          <TouchableOpacity style={styles.notificationButton}>
            <Bell color="#374151" size={24} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  leftSection: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
});