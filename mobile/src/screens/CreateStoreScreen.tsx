import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { storeAPI } from '../utils/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
  success: '#4CAF50',
};

const CreateStoreScreen = ({ navigation }) => {
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoImage, setLogoImage] = useState(null);

  const handlePickLogo = () => {
    // Placeholder for image picker
    setLogoImage('https://images.unsplash.com/photo-1571875257727-256c39da42af');
  };

  const handleCreateStore = async () => {
    if (!storeName || !description || !location) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await storeAPI.createStore({
        name: storeName,
        description,
        location,
      });
      
      navigation.navigate('MyStore', { storeId: response.data._id });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Create a store</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Logo Section */}
        <TouchableOpacity style={styles.logoSection} onPress={handlePickLogo}>
          <View style={styles.logoPlaceholder}>
            <MaterialIcons name="image" size={40} color={COLORS.gray} />
          </View>
          <Text style={styles.logoText}>{logoImage ? 'Change Logo' : 'Upload Logo'}</Text>
        </TouchableOpacity>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error" size={20} color={COLORS.primary} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Store Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter store name"
              placeholderTextColor={COLORS.gray}
              value={storeName}
              onChangeText={setStoreName}
              editable={!loading}
            />
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about your store"
              placeholderTextColor={COLORS.gray}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              editable={!loading}
            />
            <Text style={styles.helperText}>Write a detailed description</Text>
          </View>

          {/* Location */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="City, Country"
              placeholderTextColor={COLORS.gray}
              value={location}
              onChangeText={setLocation}
              editable={!loading}
            />
          </View>

          {/* Store Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Store type</Text>
            <View style={styles.selectContainer}>
              <Text style={styles.selectText}>Handmade Products</Text>
              <MaterialIcons name="arrow-drop-down" size={20} color={COLORS.gray} />
            </View>
          </View>

          {/* Store Tags */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Store tags</Text>
            <View style={styles.selectContainer}>
              <Text style={styles.selectText}>Select tags</Text>
              <MaterialIcons name="arrow-drop-down" size={20} color={COLORS.gray} />
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.settingsSection}>
            <View style={styles.settingItem}>
              <MaterialIcons name="notifications" size={20} color={COLORS.secondary} />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <View style={styles.settingItem}>
              <MaterialIcons name="security" size={20} color={COLORS.secondary} />
              <Text style={styles.settingText}>Settings</Text>
            </View>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.disabledButton]}
          onPress={handleCreateStore}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.createButtonText}>Create Store</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: SCREEN_WIDTH * 0.25,
    height: SCREEN_WIDTH * 0.25,
    backgroundColor: COLORS.light,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  logoText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE0E6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: COLORS.primary,
    marginLeft: 8,
    fontSize: 12,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.light,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    color: COLORS.secondary,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 4,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.light,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  settingsSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    paddingTop: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingText: {
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.secondary,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateStoreScreen;
