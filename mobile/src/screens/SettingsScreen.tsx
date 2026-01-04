import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const SettingsScreen = ({ navigation }) => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    // Add logout logic here (clear auth tokens, etc.)
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: 'person', label: 'Edit Profile', screen: 'Profile' },
        { icon: 'location-on', label: 'Addresses', screen: 'Addresses' },
        { icon: 'payment', label: 'Payment Methods', screen: 'PaymentMethods' },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { icon: 'notifications', label: 'Push Notifications', toggle: true, value: pushNotifications, onToggle: setPushNotifications },
        { icon: 'email', label: 'Email Notifications', toggle: true, value: emailNotifications, onToggle: setEmailNotifications },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: 'language', label: 'Language', value: 'English', screen: 'Language' },
        { icon: 'dark-mode', label: 'Dark Mode', toggle: true, value: darkMode, onToggle: setDarkMode },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help', label: 'Help Center', screen: 'Help' },
        { icon: 'description', label: 'Terms & Conditions', screen: 'Terms' },
        { icon: 'privacy-tip', label: 'Privacy Policy', screen: 'Privacy' },
        { icon: 'info', label: 'About', screen: 'About' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.settingItem}
                onPress={() => item.screen && navigation.navigate(item.screen)}
                disabled={item.toggle}
              >
                <View style={styles.settingLeft}>
                  <MaterialIcons name={item.icon} size={24} color={COLORS.secondary} />
                  <Text style={styles.settingLabel}>{item.label}</Text>
                </View>
                
                {item.toggle ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: '#E0E0E0', true: COLORS.primary }}
                    thumbColor={COLORS.white}
                  />
                ) : (
                  <View style={styles.settingRight}>
                    {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
                    <MaterialIcons name="chevron-right" size={24} color={COLORS.gray} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.version}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
    textTransform: 'uppercase',
    marginTop: 15,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    color: COLORS.secondary,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: COLORS.gray,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 10,
    marginVertical: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  version: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 13,
    color: COLORS.gray,
  },
});

export default SettingsScreen;
