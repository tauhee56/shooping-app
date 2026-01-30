import React, { useContext, useState } from 'react';
import { Alert, View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
  success: '#4CAF50',
  error: '#F44336',
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login, loginWithFirebase, loading } = useContext(AuthContext);

  const handleGoogle = async () => {
    setError('');
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
    }
  };

  const handleApple = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not supported', 'Apple Sign-In is only available on iOS');
      return;
    }

    setError('');
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
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setError((result as any).error || 'Login failed');
    }
  };

  const SocialButton = ({ iconName, label, onPress, iconColor, iconBgColor }: { iconName: any; label: string; onPress: () => void; iconColor: string; iconBgColor: string }) => (
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🛍️</Text>
          <Text style={styles.logoText}>k-al</Text>
          <Text style={styles.tagline}>Handmade with Love</Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error" size={20} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.gray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.gray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color={COLORS.gray}
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login */}
        <View style={styles.socialSection}>
          <SocialButton iconName="google" label="Continue with Google" onPress={handleGoogle} iconColor="#FFFFFF" iconBgColor="#4285F4" />
          <SocialButton iconName="apple" label="Continue with Apple" onPress={handleApple} iconColor="#FFFFFF" iconBgColor="#111111" />
          <SocialButton iconName="tiktok" label="Continue with TikTok" onPress={() => {}} iconColor="#FFFFFF" iconBgColor="#000000" />
          <SocialButton iconName="snapchat-ghost" label="Continue with Snapchat" onPress={() => {}} iconColor="#111111" iconBgColor="#FFFC00" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  tagline: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: COLORS.error,
    marginLeft: 8,
    fontSize: 12,
  },
  formContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 15,
    backgroundColor: COLORS.light,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.secondary,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signupText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  signupLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  dividerLine: { height: 1, backgroundColor: '#E0E0E0', flex: 1, marginHorizontal: 8 },
  dividerText: { color: COLORS.gray },
  socialSection: { marginTop: 0 },
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
});

export default LoginScreen;
