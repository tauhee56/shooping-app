import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const WelcomeAuthScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => navigation.navigate('LoginOptionsAuth');
  const handleSignup = () => navigation.navigate('Register');

  const SocialButton = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.socialButton} onPress={onPress}>
      <MaterialIcons name={icon} size={22} color={COLORS.secondary} />
      <Text style={styles.socialLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Logo/Header */}
          <View style={styles.header}>
            <Image
              source={{ uri: 'https://res.cloudinary.com/demo/image/upload/v1699999999/logo.png' }}
              style={styles.logo}
            />
            <Text style={styles.subtitle}>Please login to your account</Text>
          </View>

          {/* Main Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.mainButton, styles.primaryBtn]} onPress={handleLogin}>
              {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.mainButtonText}>Login</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.mainButton, styles.secondaryBtn]} onPress={handleSignup}>
              <Text style={[styles.mainButtonText, { color: COLORS.secondary }]}>Sign up</Text>
            </TouchableOpacity>
          </View>

          {/* Social Login Section */}
          <View style={styles.socialSection}>
            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.line} />
            </View>

            <SocialButton icon="google" label="Continue with Google" onPress={() => {}} />
            <SocialButton icon="apple" label="Continue with Apple" onPress={() => {}} />
            <SocialButton icon="videocam" label="Continue with TikTok" onPress={() => {}} />
            <SocialButton icon="camera" label="Continue with Snapchat" onPress={() => {}} />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              You have an account?{' '}
              <Text style={styles.footerLink} onPress={handleLogin}>Log in</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 60 },
  logo: { width: 170, height: 170, marginBottom: 32, resizeMode: 'contain' },
  subtitle: { fontSize: 14, color: '#666' },
  buttonContainer: { gap: 12 },
  mainButton: { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  primaryBtn: { backgroundColor: COLORS.primary },
  secondaryBtn: { backgroundColor: COLORS.light },
  mainButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  socialSection: { marginTop: 30 },
  divider: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  line: { height: 1, backgroundColor: '#E0E0E0', flex: 1, marginHorizontal: 8 },
  dividerText: { color: COLORS.gray },
  socialButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E7E7E7', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 12, marginBottom: 10 },
  socialLabel: { marginLeft: 10, fontSize: 14, color: COLORS.secondary },
  footer: { marginTop: 20, alignItems: 'center' },
  footerText: { color: COLORS.gray },
  footerLink: { color: COLORS.primary, fontWeight: '600' },
});

export default WelcomeAuthScreen;
