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
};

const AddProductScreen = ({ navigation, route }) => {
  const { storeId } = route.params;
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [codEnabled, setCodEnabled] = useState(false);
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productImages, setProductImages] = useState([]);
  const [productVideos, setProductVideos] = useState([]);

  const CATEGORIES = [
    'Soap & Bath',
    'Skincare',
    'Candles',
    'Home Decor',
    'Jewelry',
    'Accessories',
    'Art & Crafts',
    'Food & Drinks',
  ];

  const handlePickImage = async () => {
    const existing = Array.isArray(productImages) ? productImages : [];
    const remainingSlots = Math.max(0, 6 - existing.length);
    if (remainingSlots <= 0) {
      Alert.alert('Limit reached', 'You can upload up to 6 images.');
      return;
    }

    let ImagePicker: any;
    try {
      ImagePicker = require('expo-image-picker');
    } catch {
      Alert.alert('Missing dependency', 'Please install expo-image-picker to enable image upload.');
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
        Alert.alert('Permission required', 'Please allow photo library access to upload product images.');
        return;
      }

      if (!hadPermission && (existingPerm?.status === 'undetermined' || existingPerm?.status === undefined)) {
        Alert.alert('Permission granted', 'Now tap again to pick photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          (ImagePicker as any).MediaType?.Images ??
          (ImagePicker as any).MediaTypeOptions?.Images ??
          (ImagePicker as any).MediaType?.IMAGE,
        allowsEditing: false,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
      });

      if (result?.canceled) return;
      const assets = Array.isArray(result?.assets) ? result.assets : [];
      const selected = assets.filter((a: any) => typeof a?.uri === 'string' && String(a.uri).trim());
      if (selected.length === 0) return;

      const formData = new FormData();

      const chosen = selected.slice(0, remainingSlots);
      for (let idx = 0; idx < chosen.length; idx++) {
        const asset: any = chosen[idx];
        const rawUri = String(asset?.uri || '').trim();
        if (!rawUri) continue;

        let uploadUri = rawUri;
        if (FileSystem && typeof uploadUri === 'string' && !uploadUri.startsWith('file://')) {
          try {
            const extMatch = String(asset?.fileName || asset?.uri || '').match(/\.(jpg|jpeg|png|webp|gif|heic|heif)$/i);
            const ext = extMatch ? extMatch[0] : '.jpg';
            const dest =
              String(FileSystem.cacheDirectory || FileSystem.documentDirectory || '') +
              `upload-product-${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
            if (dest) {
              await FileSystem.copyAsync({ from: uploadUri, to: dest });
              uploadUri = dest;
            }
          } catch {
          }
        }

        formData.append('images', {
          uri: uploadUri,
          name: `product-${Date.now()}-${idx}.jpg`,
          type: asset?.mimeType || 'image/jpeg',
        } as any);
      }

      const uploadRes = await storeAPI.uploadProductImages(formData, storeId);
      const urls = Array.isArray(uploadRes?.data?.urls) ? uploadRes.data.urls : [];

      const cleanedUrls = urls
        .map((u: any) => String(u || '').trim())
        .filter((u: string) => u);

      if (cleanedUrls.length === 0) {
        Alert.alert('Error', 'Upload failed');
        return;
      }

      setProductImages((prev) => {
        const next = Array.isArray(prev) ? prev.slice() : [];
        cleanedUrls.forEach((u: string) => {
          if (next.length < 6) {
            next.push(u as any);
          }
        });
        return next;
      });
    } catch (e: any) {
      Alert.alert('Error', getErrorMessage(e, 'Failed to upload image'));
    }
  };

  const handlePickVideo = () => {
    Alert.alert('Coming soon', 'Video upload will be available once media upload is configured.');
  };

  const removeImage = (index) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setProductVideos(productVideos.filter((_, i) => i !== index));
  };

  const handleAddProduct = async () => {
    if (!productName || !description || !price || !category) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const imagesToSend = Array.isArray(productImages) ? productImages.filter((x) => typeof x === 'string' && x.trim()) : [];
      await storeAPI.addProductToStore(storeId, {
        name: productName,
        description,
        price: parseFloat(price),
        category,
        images: imagesToSend.length > 0 ? imagesToSend : [],
        freeDelivery,
        stock: inStock ? 1 : 0,
        paymentOptionsOverride: {
          codEnabled,
          stripeEnabled,
        },
      });

      navigation.goBack();
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to add product'));
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
          <Text style={styles.title}>Add Product</Text>
          <View style={{ width: 24 }} />
        </View>

        <Modal
          visible={categoryModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCategoryModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Select category</Text>
              <ScrollView style={{ maxHeight: 360 }}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={styles.modalItem}
                    onPress={() => {
                      setCategory(c);
                      setCategoryModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{c}</Text>
                    {category === c ? <MaterialIcons name="check" size={18} color={COLORS.primary} /> : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setCategoryModalVisible(false)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Image Upload */}
        <View style={styles.imageUploadSection}>
          <TouchableOpacity style={styles.imagePlaceholder} onPress={handlePickImage}>
            <MaterialIcons name="add-photo-alternate" size={40} color={COLORS.gray} />
            <Text style={styles.imageUploadText}>Upload Images</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imagePlaceholder} onPress={handlePickVideo}>
            <MaterialIcons name="videocam" size={40} color={COLORS.gray} />
            <Text style={styles.imageUploadText}>Upload Videos</Text>
          </TouchableOpacity>
        </View>

        {/* Preview Images */}
        {productImages.length > 0 && (
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Images ({productImages.length})</Text>
            <View style={styles.previewGrid}>
              {productImages.map((img, index) => (
                <View key={index} style={styles.previewItem}>
                  {typeof img === 'string' && img.trim() ? (
                    <Image
                      source={{ uri: img.trim() }}
                      style={{ width: '100%', height: '100%', borderRadius: 8 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <MaterialIcons name="image" size={30} color={COLORS.primary} />
                  )}
                  <TouchableOpacity onPress={() => removeImage(index)} style={styles.removeBtn}>
                    <MaterialIcons name="close" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Preview Videos */}
        {productVideos.length > 0 && (
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Videos ({productVideos.length})</Text>
            <View style={styles.previewGrid}>
              {productVideos.map((vid, index) => (
                <View key={index} style={styles.previewItem}>
                  <MaterialIcons name="videocam" size={30} color={COLORS.primary} />
                  <TouchableOpacity onPress={() => removeVideo(index)} style={styles.removeBtn}>
                    <MaterialIcons name="close" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error" size={20} color={COLORS.primary} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Product Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Lavender Handmade Soap"
              placeholderTextColor={COLORS.gray}
              value={productName}
              onChangeText={setProductName}
              editable={!loading}
            />
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your product"
              placeholderTextColor={COLORS.gray}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              editable={!loading}
            />
          </View>

          {/* Price */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Price (£)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={COLORS.gray}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              editable={!loading}
            />
          </View>

          {/* Category */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.selectContainer}
              onPress={() => setCategoryModalVisible(true)}
              disabled={loading}
            >
              <Text style={[styles.selectText, category ? { color: COLORS.secondary } : null]}>
                {category || 'Select a category'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          {/* Weight */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Weight</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 100g"
              placeholderTextColor={COLORS.gray}
              editable={!loading}
            />
          </View>

          {/* Ingredients */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Ingredients List</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Separate with commas"
              placeholderTextColor={COLORS.gray}
              multiline
              numberOfLines={3}
              editable={!loading}
            />
          </View>

          {/* Benefits */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Benefits & Features</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="List key benefits"
              placeholderTextColor={COLORS.gray}
              multiline
              numberOfLines={3}
              editable={!loading}
            />
          </View>

          {/* Delivery Info */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.checkboxItem}
              onPress={() => setFreeDelivery((v) => !v)}
              disabled={loading}
            >
              <MaterialIcons
                name={freeDelivery ? 'check-circle' : 'check-circle-outline'}
                size={20}
                color={freeDelivery ? COLORS.primary : COLORS.gray}
              />
              <Text style={styles.checkboxText}>Free delivery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.checkboxItem}
              onPress={() => setInStock((v) => !v)}
              disabled={loading}
            >
              <MaterialIcons
                name={inStock ? 'check-circle' : 'check-circle-outline'}
                size={20}
                color={inStock ? COLORS.primary : COLORS.gray}
              />
              <Text style={styles.checkboxText}>In stock</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.checkboxItem}
              onPress={() => setCodEnabled((v) => !v)}
              disabled={loading}
            >
              <MaterialIcons
                name={codEnabled ? 'check-circle' : 'check-circle-outline'}
                size={20}
                color={codEnabled ? COLORS.primary : COLORS.gray}
              />
              <Text style={styles.checkboxText}>Enable Cash on Delivery (COD)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.checkboxItem}
              onPress={() => setStripeEnabled((v) => !v)}
              disabled={loading}
            >
              <MaterialIcons
                name={stripeEnabled ? 'check-circle' : 'check-circle-outline'}
                size={20}
                color={stripeEnabled ? COLORS.primary : COLORS.gray}
              />
              <Text style={styles.checkboxText}>Enable Card Payment (Stripe)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={[styles.addButton, loading && styles.disabledButton]}
          onPress={handleAddProduct}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.addButtonText}>Add Product</Text>
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
  imageUploadSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.4,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.light,
    borderStyle: 'dashed',
  },
  imageUploadText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 8,
  },
  previewSection: {
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 10,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  previewItem: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.light,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  removeBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  section: {
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    paddingTop: 15,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxText: {
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.secondary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddProductScreen;
