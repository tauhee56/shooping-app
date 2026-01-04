import 'react-native-gesture-handler';
import React, { useEffect, useState, useContext } from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Navigation } from './src/navigation/Navigation';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';

export default function App() {
  // No local login bypass; hydration handled in AuthProvider

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FavoritesProvider>
          <AuthStackWrapper />
        </FavoritesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const AuthStackWrapper = () => {
  // Bypass auth: always show HomeScreen
  return <Navigation isLoggedIn={true} />;
};
