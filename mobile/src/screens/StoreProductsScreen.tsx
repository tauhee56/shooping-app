import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const StoreProductsScreen = ({ route, navigation }) => {
  const { storeId, storeName } = route.params;
  const [searchText, setSearchText] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  const handleCategoryPress = (category) => {
    // Navigate to category products or filter products
    console.log('Category pressed:', category.name);
  };

  // Store info
  const store = {
    id: storeId,
    name: storeName,
    coverImage: 'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4',
    image: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250',
    description: 'We sell perfumed soap made by hand in our London lab.',
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
      count: 34,
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
      count: 17,
      color: '#F0E5FF',
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883',
    },
    {
      id: '4',
      name: 'Perfumes',
      count: 9,
      color: '#E5FFE5',
      image: 'https://images.unsplash.com/photo-1506755855726-4a1c51e8a722',
    },
  ];

  // Mock store products data
  const storeProducts = [
    {
      id: '1',
      _id: '1',
      name: 'Premium Olive Oil Body',
      price: 32,
      rating: 9,
      reviews: 32,
      store: storeName,
      images: ['https://images.unsplash.com/photo-1604654894610-df63bc536371'],
    },
    {
      id: '2',
      _id: '2',
      name: 'Luxury Soap Bar',
      price: 25,
      rating: 8,
      reviews: 18,
      store: storeName,
      images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108'],
    },
    {
      id: '3',
      _id: '3',
      name: 'Skin Care Cream',
      price: 45,
      rating: 9,
      reviews: 42,
      store: storeName,
      images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883'],
    },
    {
      id: '4',
      _id: '4',
      name: 'Body Wash',
      price: 28,
      rating: 8,
      reviews: 25,
      store: storeName,
      images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883'],
    },
    {
      id: '5',
      _id: '5',
      name: 'Face Mask',
      price: 35,
      rating: 9,
      reviews: 50,
      store: storeName,
      images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883'],
    },
    {
      id: '6',
      _id: '6',
      name: 'Perfume',
      price: 55,
      rating: 10,
      reviews: 38,
      store: storeName,
      images: ['https://images.unsplash.com/photo-1506755855726-4a1c51e8a722'],
    },
  ];

  const filteredProducts = storeProducts.filter(p =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderProductCard = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
    >
      <View style={{position: 'relative', marginBottom: 12}}>
        <Image
          source={{ uri: item.images?.[0] || 'https://images.unsplash.com/photo-1505022610485-0249ba5b3675' }}
          style={styles.productImage}
        />
        {/* Carousel Dots */}
        <View style={styles.carouselDots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        {/* Rating Badge */}
        <View style={styles.productRatingBadge}>
          <Text style={styles.productRatingEmoji}>⭐</Text>
          <Text style={styles.productRatingText}>{item.rating}/10</Text>
        </View>
        {/* Wishlist Button */}
        <TouchableOpacity 
          style={styles.productLikeButton}
          onPress={() => toggleFavorite(item)}
        >
          <MaterialIcons name={isFavorite(item._id) ? "favorite" : "favorite-border"} size={22} color="#FF1493" />
        </TouchableOpacity>
      </View>
      {/* Product Info */}
      <View style={styles.productInfo}>
        <View style={styles.productBrand}>
          <View style={styles.brandIcon} />
          <Text style={styles.brandName}>{item.store}</Text>
        </View>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.productFooter}>
          <Text style={styles.price}>£{item.price}</Text>
          <Text style={styles.ratingInfo}>{item.rating}/10 ({item.reviews})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
            <MaterialIcons name="place" size={16} color={COLORS.gray} />
            <Text style={styles.location}>{store.location}</Text>
          </View>

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
              <MaterialIcons name="local-shipping" size={18} color={COLORS.primary} />
              <Text style={styles.statLabel}>Delivery</Text>
            </View>
          </View>

          {/* Follow Button */}
          <TouchableOpacity 
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={handleFollowToggle}
          >
            <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
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
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              <Image source={{ uri: category.image }} style={styles.categoryImage} />
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{category.count} Products</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Products Section Header */}
        <View style={styles.productsHeader}>
          <Text style={styles.productsTitle}>All Products</Text>
        </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productsListContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
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
    marginBottom: 12,
  },
  location: {
    fontSize: 13,
    color: COLORS.gray,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    marginBottom: 12,
    paddingVertical: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
  },
  followButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
  },
  followingButton: {
    backgroundColor: COLORS.light,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  followingButtonText: {
    color: COLORS.secondary,
  },
  categoriesSection: {
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    height: 100,
    borderWidth: 2,
    borderColor: 'rgba(74, 78, 105, 0.1)',
    borderStyle: 'dashed',
  },
  categoryImage: {
    width: 100,
    height: 100,
  },
  categoryInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 3,
  },
  categoryCount: {
    fontSize: 11,
    color: COLORS.gray,
  },
  productsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  productsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.light,
    marginHorizontal: 15,
    marginVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.secondary,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  productsListContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  carouselDots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  dotActive: {
    backgroundColor: 'rgba(255,255,255,1)',
    width: 8,
  },
  productRatingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
  },
  productRatingEmoji: {
    fontSize: 12,
  },
  productRatingText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  productLikeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 14,
  },
  productBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    marginRight: 6,
  },
  brandName: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: '500',
  },
  productName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  ratingInfo: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
});

export default StoreProductsScreen;
