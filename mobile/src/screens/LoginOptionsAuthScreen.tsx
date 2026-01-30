import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const LoginOptionsAuthScreen = ({ navigation }) => {
  const OptionButton = ({ title, onPress, variant = 'primary' }) => (
    <TouchableOpacity
      style={[styles.optionButton, variant === 'primary' ? styles.primaryBtn : styles.secondaryBtn]}
      onPress={onPress}
    >
      <Text style={[styles.optionText, variant === 'secondary' && { color: COLORS.secondary }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.brandingContainer}>
          <Text style={styles.brandIcon}>🛍️</Text>
          <Text style={styles.brandName}>k-al</Text>
          <Text style={styles.brandTagline}>Handmade with Love</Text>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.subtitle}>How would you like to login?</Text>
        </View>

        <View style={styles.methodContainer}>
          <OptionButton title="Phone" onPress={() => navigation.navigate('Login')} />
          <OptionButton title="Email" onPress={() => navigation.navigate('Login')} />
          <OptionButton title="Username" variant="secondary" onPress={() => navigation.navigate('Login')} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text style={styles.footerLink} onPress={() => navigation.navigate('Register')}>Sign up</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.light, alignItems: 'center', justifyContent: 'center' },
  brandingContainer: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  brandIcon: { fontSize: 60, marginBottom: 10 },
  brandName: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
  brandTagline: { fontSize: 12, color: COLORS.gray, marginTop: 5 },
  titleSection: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  subtitle: { fontSize: 14, color: COLORS.gray },
  methodContainer: { marginTop: 10, gap: 12 },
  optionButton: { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  primaryBtn: { backgroundColor: COLORS.primary },
  secondaryBtn: { backgroundColor: COLORS.light },
  optionText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  footer: { marginTop: 20, alignItems: 'center' },
  footerText: { color: COLORS.gray },
  footerLink: { color: COLORS.primary, fontWeight: '600' },
});

export default LoginOptionsAuthScreen;
