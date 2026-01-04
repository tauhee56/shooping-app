import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
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

const StoreDetailScreen = ({ navigation, route }) => {
  const store = {
    id: '1',
    name: 'Soap Queen',
    description: 'We sell perfumed soap made by hand in our london lab.',
    image: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250',
    coverImage: 'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4',
    rating: 5,
    reviews: 23,
    followers: 3450,
    products: 32,
    location: 'Green town, London',
    deliveryAvailable: true,
  };

  const categories = [
    {
      id: '1',
      name: 'Skin care & creams',
      count: 32,
      color: '#FFE5E5',
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883',
    },
    {
      id: '2',
      name: 'Soaps',
      count: 11,
      color: '#E5F5FF',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108',
    },
    {
      id: '3',
      name: 'Baby creams and specialty soaps',
      count: 11,
      color: '#F0E5FF',
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883',
    },
    {
      id: '4',
      name: 'Perfums',
      count: 5,
      color: '#E5FFE5',
      image: 'https://images.unsplash.com/photo-1506755855726-4a1c51e8a722',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: store.coverImage }} style={styles.coverImage} />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Store Info Container */}
        <View style={styles.infoContainer}>
          {/* Logo */}
          <Image source={{ uri: store.image }} style={styles.storeAvatar} />
          
          {/* Store Name and Location */}
          <Text style={styles.storeName}>{store.name}</Text>
          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{store.rating}</Text>
            <Text style={styles.reviews}>{store.reviews} Reviews</Text>
          </View>
          <Text style={styles.location}>{store.location}</Text>

          {/* Description */}
          <Text style={styles.description}>{store.description}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{store.products}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialIcons name="local-shipping" size={20} color={COLORS.primary} />
              <Text style={styles.statLabel}>Delivery available</Text>
            </View>
          </View>

          {/* Follow Button */}
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesSection}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                { backgroundColor: category.color },
                (index % 2 === 1) && styles.categoryCardRight,
              ]}
              onPress={() => navigation.navigate('StoreProducts', { storeId: store.id, storeName: store.name })}
            >
              <Image source={{ uri: category.image }} style={styles.categoryImage} />
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{category.count} Products</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Shop Button */}
        <TouchableOpacity 
          style={styles.shopButtonBottom}
          onPress={() => navigation.navigate('StoreProducts', { storeId: store.id, storeName: store.name })}
        >
          <Text style={styles.shopButtonText}>View All Products</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  coverContainer: {
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: 'center',
  },
  storeAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: -50,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  storeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginTop: 15,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  reviews: {
    fontSize: 14,
    color: COLORS.gray,
  },
  location: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 15,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.gray,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E0E0E0',
  },
  followButton: {
    width: '100%',
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  categoriesSection: {
    padding: 15,
    gap: 15,
  },
  categoryCard: {
    flexDirection: 'row',
    borderRadius: 15,
    overflow: 'hidden',
    height: 130,
    marginBottom: 5,
    borderWidth: 2,
    borderColor: 'rgba(74, 78, 105, 0.1)',
  },
  categoryCardRight: {
    marginLeft: 15,
  },
  categoryImage: {
    width: 130,
    height: 130,
  },
  categoryInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: COLORS.gray,
  },  shopButtonBottom: {
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },});

export default StoreDetailScreen;
