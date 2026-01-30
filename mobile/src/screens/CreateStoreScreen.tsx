import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Dimensions, Alert, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { storeAPI } from '../utils/api';
import { getErrorMessage } from '../utils/errorMapper';

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
  const [storeType, setStoreType] = useState('Handmade Products');
  const [storeTags, setStoreTags] = useState<string[]>([]);
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [tagsModalVisible, setTagsModalVisible] = useState(false);

  const STORE_TYPES = ['Handmade Products', 'Beauty', 'Clothing', 'Accessories', 'Home & Living', 'Food'];
  const STORE_TAGS = [
    'Handmade',
    'Organic',
    'Vegan',
    'Skincare',
    'Soap',
    'Candles',
    'Jewelry',
    'Gifts',
    'New',
    'Sale',
  ];

  const handlePickLogo = async () => {
    let ImagePicker: any;
    try {
      ImagePicker = require('expo-image-picker');
    } catch {
      Alert.alert('Missing dependency', 'Please install expo-image-picker to enable logo upload.');
      return;
    }

    let FileSystem: any;
    try {
      FileSystem = require('expo-file-system');
    } catch {
      FileSystem = null;
    }

    try {
      const existingPerm =
        typeof ImagePicker.getMediaLibraryPermissionsAsync === 'function'
          ? await ImagePicker.getMediaLibraryPermissionsAsync()
          : null;
      const hadPermission = Boolean(existingPerm?.granted);

      const perm = hadPermission ? existingPerm : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm?.granted) {
        Alert.alert('Permission required', 'Please allow photo library access to upload your store logo.');
        return;
      }

      if (!hadPermission && (existingPerm?.status === 'undetermined' || existingPerm?.status === undefined)) {
        Alert.alert('Permission granted', 'Now tap again to pick a photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          (ImagePicker as any).MediaType?.Images ??
          (ImagePicker as any).MediaTypeOptions?.Images ??
          (ImagePicker as any).MediaType?.IMAGE,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result?.canceled) return;
      const asset = Array.isArray(result?.assets) ? result.assets[0] : null;
      const uri = asset?.uri;
      if (!uri) return;

      let uploadUri = uri;
      if (FileSystem && typeof uploadUri === 'string' && !uploadUri.startsWith('file://')) {
        try {
          const extMatch = String(asset?.fileName || asset?.uri || '').match(/\.(jpg|jpeg|png|webp|gif|heic|heif)$/i);
          const ext = extMatch ? extMatch[0] : '.jpg';
          const dest =
            String(FileSystem.cacheDirectory || FileSystem.documentDirectory || '') +
            `upload-logo-${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
          if (dest) {
            await FileSystem.copyAsync({ from: uploadUri, to: dest });
            uploadUri = dest;
          }
        } catch {
        }
      }

      const formData = new FormData();
      formData.append('image', {
        uri: uploadUri,
        name: 'logo.jpg',
        type: asset?.mimeType || 'image/jpeg',
      } as any);

      const uploadRes = await storeAPI.uploadStoreLogo(formData);
      const url = String(uploadRes?.data?.url || '').trim();
      if (!url) {
        Alert.alert('Error', 'Upload failed');
        return;
      }

      setLogoImage(url as any);
    } catch (e: any) {
      Alert.alert('Error', getErrorMessage(e, 'Failed to upload logo'));
    }
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
        logo: typeof logoImage === 'string' && logoImage.trim() ? logoImage.trim() : undefined,
        storeType: typeof storeType === 'string' && storeType.trim() ? storeType.trim() : undefined,
        tags: Array.isArray(storeTags) ? storeTags : [],
      });
      
      navigation.navigate('MyStore', { storeId: response.data._id });
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to create store'));
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

        <Modal
          visible={typeModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setTypeModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Select store type</Text>
              <ScrollView style={{ maxHeight: 320 }}>
                {STORE_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={styles.modalItem}
                    onPress={() => {
                      setStoreType(t);
                      setTypeModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{t}</Text>
                    {storeType === t ? <MaterialIcons name="check" size={18} color={COLORS.primary} /> : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setTypeModalVisible(false)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={tagsModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setTagsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Select tags</Text>
              <ScrollView style={{ maxHeight: 320 }}>
                {STORE_TAGS.map((tag) => {
                  const selected = storeTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={styles.modalItem}
                      onPress={() => {
                        setStoreTags((prev) => {
                          const next = Array.isArray(prev) ? prev.slice() : [];
                          const idx = next.indexOf(tag);
                          if (idx >= 0) {
                            next.splice(idx, 1);
                          } else {
                            next.push(tag);
                          }
                          return next;
                        });
                      }}
                    >
                      <Text style={styles.modalItemText}>{tag}</Text>
                      {selected ? <MaterialIcons name="check" size={18} color={COLORS.primary} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setTagsModalVisible(false)}>
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Logo Section */}
        <TouchableOpacity style={styles.logoSection} onPress={handlePickLogo}>
          <View style={styles.logoPlaceholder}>
            {typeof logoImage === 'string' && logoImage.trim() ? (
              <Image
                source={{ uri: logoImage.trim() }}
                style={{ width: '100%', height: '100%', borderRadius: 10 }}
                resizeMode="cover"
              />
            ) : (
              <MaterialIcons name="image" size={40} color={COLORS.gray} />
            )}
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
            <TouchableOpacity style={styles.selectContainer} onPress={() => setTypeModalVisible(true)} disabled={loading}>
              <Text style={styles.selectText}>{storeType || 'Select type'}</Text>
              <MaterialIcons name="arrow-drop-down" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          {/* Store Tags */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Store tags</Text>
            <TouchableOpacity style={styles.selectContainer} onPress={() => setTagsModalVisible(true)} disabled={loading}>
              <Text style={styles.selectText} numberOfLines={1}>
                {storeTags.length > 0 ? storeTags.join(', ') : 'Select tags'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={20} color={COLORS.gray} />
            </TouchableOpacity>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 12,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  modalItemText: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  modalCloseBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalCloseText: {
    color: COLORS.primary,
    fontWeight: '700',
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
