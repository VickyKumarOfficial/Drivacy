import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmergencyContact } from '@/components/SOSButton';

interface EmergencyContactsContextProps {
  contacts: EmergencyContact[];
  addContact: (name: string, phone: string) => Promise<void>;
  removeContact: (index: number) => Promise<void>;
  updateContact: (index: number, name: string, phone: string) => Promise<void>;
  isLoading: boolean;
}

const STORAGE_KEY = 'drivacy_emergency_contacts';
const DEFAULT_CONTACTS: EmergencyContact[] = [
  { name: 'Emergency Services', phone: '911' },
];

const EmergencyContactsContext = createContext<EmergencyContactsContextProps | undefined>(undefined);

export const useEmergencyContacts = () => {
  const context = useContext(EmergencyContactsContext);
  if (!context) {
    throw new Error('useEmergencyContacts must be used within an EmergencyContactsProvider');
  }
  return context;
};

interface EmergencyContactsProviderProps {
  children: ReactNode;
}

export const EmergencyContactsProvider = ({ children }: EmergencyContactsProviderProps) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>(DEFAULT_CONTACTS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Load contacts from storage on mount
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const storedContacts = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedContacts) {
          const parsedContacts = JSON.parse(storedContacts);
          // Ensure default emergency services is always available
          if (!parsedContacts.some((c: EmergencyContact) => c.phone === '911')) {
            parsedContacts.unshift(DEFAULT_CONTACTS[0]);
          }
          setContacts(parsedContacts);
        }
      } catch (error) {
        console.error('Failed to load emergency contacts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContacts();
  }, []);

  // Save contacts to AsyncStorage
  const saveContacts = async (newContacts: EmergencyContact[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newContacts));
    } catch (error) {
      console.error('Failed to save emergency contacts:', error);
      Alert.alert('Error', 'Failed to save your contacts. Please try again.');
    }
  };

  const addContact = async (name: string, phone: string) => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please enter both name and phone number');
      return;
    }
    
    const newContacts = [
      ...contacts, 
      { name: name.trim(), phone: phone.trim() }
    ];
    
    setContacts(newContacts);
    await saveContacts(newContacts);
  };

  const removeContact = async (index: number) => {
    if (index === 0 && contacts[0].phone === '911') {
      Alert.alert('Cannot Remove', 'Emergency services contact cannot be removed');
      return;
    }
    
    const updatedContacts = [...contacts];
    updatedContacts.splice(index, 1);
    setContacts(updatedContacts);
    await saveContacts(updatedContacts);
  };

  const updateContact = async (index: number, name: string, phone: string) => {
    if (index === 0 && contacts[0].phone === '911') {
      Alert.alert('Cannot Edit', 'Emergency services contact cannot be modified');
      return;
    }
    
    const updatedContacts = [...contacts];
    updatedContacts[index] = { name, phone };
    setContacts(updatedContacts);
    await saveContacts(updatedContacts);
  };

  const value = {
    contacts,
    addContact,
    removeContact,
    updateContact,
    isLoading
  };

  return (
    <EmergencyContactsContext.Provider value={value}>
      {children}
    </EmergencyContactsContext.Provider>
  );
};
