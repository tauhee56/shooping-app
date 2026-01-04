import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const SellScreen = ({ navigation }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const addPlaceholderPhoto = () => {
    const placeholder = 'https://images.unsplash.com/photo-1524592094714-0f0654e20314';
    setSelectedImages((prev) => [...prev, placeholder]);
  };

  const removePhotoAt = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const showOptionInfo = (label) => {
    Alert.alert('Coming soon', `${label} configuration coming soon.`);
  };

  const handlePostProduct = () => {
    if (!title.trim()) {
      Alert.alert('Missing info', 'Please enter a product title.');
      return;
    }
    if (!price.trim()) {
      Alert.alert('Missing info', 'Please enter a price.');
      return;
    }
    if (!category.trim()) {
      Alert.alert('Missing info', 'Please select a category.');
      return;
    }
    Alert.alert('Saved', 'Product saved as draft (demo mode).');
    navigation.goBack();
  };

  const categories = ['Soaps', 'Candles', 'Skincare', 'Jewelry', 'Ceramics', 'Textiles', 'Home Decor', 'Other'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
        <TouchableOpacity>
          <Text style={styles.draftText}>Draft</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Photos Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
            <TouchableOpacity style={styles.addPhotoBox} onPress={addPlaceholderPhoto}>
              <MaterialIcons name="add-a-photo" size={32} color={COLORS.gray} />
              <Text style={styles.addPhotoText}>Add Photos</Text>
            </TouchableOpacity>
            {selectedImages.map((img, index) => (
              <View key={index} style={styles.photoBox}>
                <Image source={{ uri: img }} style={styles.photoImage} />
                <TouchableOpacity style={styles.removePhoto} onPress={() => removePhotoAt(index)}>
                  <MaterialIcons name="close" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Handmade Lavender Soap"
            placeholderTextColor={COLORS.gray}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.label}>Price</Text>
          <View style={styles.priceInput}>
            <Text style={styles.currencySymbol}>£</Text>
            <TextInput
              style={styles.priceTextInput}
              placeholder="0.00"
              placeholderTextColor={COLORS.gray}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your product..."
            placeholderTextColor={COLORS.gray}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Additional Options */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.optionItem} onPress={() => showOptionInfo('Stock quantity')}>
            <View style={styles.optionLeft}>
              <MaterialIcons name="inventory" size={24} color={COLORS.secondary} />
              <Text style={styles.optionText}>Stock Quantity</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.gray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem} onPress={() => showOptionInfo('Shipping options')}>
            <View style={styles.optionLeft}>
              <MaterialIcons name="local-shipping" size={24} color={COLORS.secondary} />
              <Text style={styles.optionText}>Shipping Options</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Post Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.postButton} onPress={handlePostProduct}>
          <Text style={styles.postButtonText}>Post Product</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  draftText: {
    fontSize: 15,
    color: COLORS.gray,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 10,
  },
  photosScroll: {
    marginTop: 10,
  },
  addPhotoBox: {
    width: 120,
    height: 120,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.light,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addPhotoText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 8,
  },
  photoBox: {
    width: 120,
    height: 120,
    borderRadius: 15,
    marginRight: 10,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  removePhoto: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.secondary,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  categoriesScroll: {
    marginTop: 5,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.light,
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondary,
    marginRight: 5,
  },
  priceTextInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.secondary,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 15,
    color: COLORS.secondary,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  postButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default SellScreen;
