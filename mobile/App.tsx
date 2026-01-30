import 'react-native-gesture-handler';
import React, { useContext } from 'react';
import { ActivityIndicator, NativeModules, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './src/navigation/Navigation';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { CartProvider } from './src/context/CartContext';

export default function App() {
  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

  const enableStripe = String(process.env.EXPO_PUBLIC_ENABLE_STRIPE || '').toLowerCase() === 'true';

  const nativeStripeAvailable = (() => {
    if (!enableStripe) return false;
    const nm: any = NativeModules;
    return !!(nm?.StripeSdk || nm?.Stripe || nm?.StripeSdkModule);
  })();

  let StripeProvider: any = null;
  if (enableStripe) {
    try {
      StripeProvider = require('@stripe/stripe-react-native')?.StripeProvider;
    } catch {
      StripeProvider = null;
    }
  }

  const StripeWrapper: any = ({ children }: any) => {
    if (!StripeProvider || !nativeStripeAvailable || !publishableKey) return children;
    return <StripeProvider publishableKey={publishableKey}>{children}</StripeProvider>;
  };

  return (
    <SafeAreaProvider>
      <StripeWrapper>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <AuthStackWrapper />
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </StripeWrapper>
    </SafeAreaProvider>
  );
}

const AuthStackWrapper = () => {
  // Bypass auth: always show HomeScreen
  const { token, initializing } = useContext(AuthContext);
  const isLoggedIn = !!token;

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Navigation isLoggedIn={isLoggedIn} />;
};
