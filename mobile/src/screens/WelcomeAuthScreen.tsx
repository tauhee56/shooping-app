import React, { useContext, useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';
import { AuthContext } from '../context/AuthContext';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const WelcomeAuthScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const { loginWithFirebase } = useContext(AuthContext);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      console.log('[google] start');
      const extra = (Constants.expoConfig as any)?.extra || {};
      const webClientId =
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || extra?.google?.webClientId;
      const iosClientId =
        process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || extra?.google?.iosClientId;
      if (!webClientId) {
        throw new Error('Missing Google webClientId');
      }

      console.log('[google] configure');
      GoogleSignin.configure({
        webClientId,
        iosClientId,
      });

      console.log('[google] hasPlayServices');
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('[google] signIn');
      await GoogleSignin.signIn();
      console.log('[google] getTokens');
      const { idToken: googleIdToken } = await GoogleSignin.getTokens();
      if (!googleIdToken) throw new Error('Google sign-in did not return an idToken');

      console.log('[google] firebase credential');
      const credential = auth.GoogleAuthProvider.credential(googleIdToken);
      console.log('[google] firebase signInWithCredential');
      const userCredential = await auth().signInWithCredential(credential);
      console.log('[google] firebase getIdToken');
      const firebaseIdToken = await userCredential.user.getIdToken();

      console.log('[google] backend bridge /auth/firebase');
      const bridge = await loginWithFirebase(firebaseIdToken);
      if (!bridge.success) {
        throw new Error((bridge as any).error || 'Social login failed');
      }
      console.log('[google] success');
    } catch (e: any) {
      if (e?.code === statusCodes.SIGN_IN_CANCELLED) return;
      console.error('[google] failed', e);
      Alert.alert('Login failed', e?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not supported', 'Apple Sign-In is only available on iOS');
      return;
    }

    setLoading(true);
    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Not available', 'Apple Sign-In is not available on this device');
        return;
      }

      const rawNonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );

      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!appleCredential.identityToken) {
        throw new Error('Apple Sign-In did not return an identity token');
      }

      const credential = auth.AppleAuthProvider.credential(
        appleCredential.identityToken,
        rawNonce
      );
      const userCredential = await auth().signInWithCredential(credential);
      const firebaseIdToken = await userCredential.user.getIdToken();

      const bridge = await loginWithFirebase(firebaseIdToken);
      if (!bridge.success) {
        throw new Error((bridge as any).error || 'Social login failed');
      }
    } catch (e: any) {
      if (e?.code === 'ERR_REQUEST_CANCELED') return;
      Alert.alert('Login failed', e?.message || 'Apple login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => navigation.navigate('LoginOptionsAuth');
  const handleSignup = () => navigation.navigate('Register');

  const SocialButton = ({ iconName, label, onPress, iconColor, iconBgColor }) => (
    <TouchableOpacity style={styles.socialButton} onPress={onPress} activeOpacity={0.85} disabled={loading}>
      <View style={[styles.socialIconContainer, { backgroundColor: iconBgColor }]}>
        <FontAwesome5 name={iconName} size={18} color={iconColor} brand />
      </View>
      <Text style={styles.socialLabel}>{label}</Text>
      <View style={{ flex: 1 }} />
      <MaterialIcons name="chevron-right" size={22} color={COLORS.gray} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Logo/Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.brandIcon}>🛍️</Text>
              <Text style={styles.brandName}>k-al</Text>
              <Text style={styles.brandTagline}>Handmade with Love</Text>
            </View>
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

            <SocialButton
              iconName="google"
              label="Continue with Google"
              onPress={handleGoogle}
              iconColor="#FFFFFF"
              iconBgColor="#4285F4"
            />
            <SocialButton
              iconName="apple"
              label="Continue with Apple"
              onPress={handleApple}
              iconColor="#FFFFFF"
              iconBgColor="#111111"
            />
            <SocialButton
              iconName="tiktok"
              label="Continue with TikTok"
              onPress={() => {}}
              iconColor="#FFFFFF"
              iconBgColor="#000000"
            />
            <SocialButton
              iconName="snapchat-ghost"
              label="Continue with Snapchat"
              onPress={() => {}}
              iconColor="#111111"
              iconBgColor="#FFFC00"
            />
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
  header: { alignItems: 'center', marginTop: 30, marginBottom: 40 },
  logoContainer: { alignItems: 'center' },
  brandIcon: { fontSize: 60, marginBottom: 10 },
  brandName: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
  brandTagline: { fontSize: 12, color: COLORS.gray, marginTop: 5 },
  buttonContainer: { gap: 12 },
  mainButton: { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  primaryBtn: { backgroundColor: COLORS.primary },
  secondaryBtn: { backgroundColor: COLORS.light },
  mainButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  socialSection: { marginTop: 30 },
  divider: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  line: { height: 1, backgroundColor: '#E0E0E0', flex: 1, marginHorizontal: 8 },
  dividerText: { color: COLORS.gray },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7E7E7',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    backgroundColor: COLORS.white,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  socialIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  socialLabel: { fontSize: 15, fontWeight: '600', color: COLORS.secondary },
  footer: { marginTop: 20, alignItems: 'center' },
  footerText: { color: COLORS.gray },
  footerLink: { color: COLORS.primary, fontWeight: '600' },
});

export default WelcomeAuthScreen;
