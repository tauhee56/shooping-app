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
};

const AddProductScreen = ({ navigation, route }) => {
  const { storeId } = route.params;
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productImages, setProductImages] = useState([]);
  const [productVideos, setProductVideos] = useState([]);

  const handlePickImage = () => {
    // Placeholder for image picker
    const newImage = 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108';
    setProductImages([...productImages, newImage]);
  };

  const handlePickVideo = () => {
    // Placeholder for video picker
    const newVideo = 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4';
    setProductVideos([...productVideos, newVideo]);
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
      await storeAPI.addProductToStore(storeId, {
        name: productName,
        description,
        price: parseFloat(price),
        category,
        images: ['https://via.placeholder.com/300'],
      });

      navigation.goBack();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add product');
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
                  <MaterialIcons name="image" size={30} color={COLORS.primary} />
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
            <View style={styles.selectContainer}>
              <Text style={styles.selectText}>{category || 'Select a category'}</Text>
              <MaterialIcons name="arrow-drop-down" size={20} color={COLORS.gray} />
            </View>
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
            <View style={styles.checkboxItem}>
              <MaterialIcons name="check-circle" size={20} color={COLORS.primary} />
              <Text style={styles.checkboxText}>Free delivery</Text>
            </View>
            <View style={styles.checkboxItem}>
              <MaterialIcons name="check-circle-outline" size={20} color={COLORS.gray} />
              <Text style={styles.checkboxText}>In stock</Text>
            </View>
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
