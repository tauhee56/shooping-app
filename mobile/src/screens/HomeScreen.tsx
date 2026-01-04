import React, { useContext, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, FlatList, TextInput, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { productAPI } from '../utils/api';
import { useFavorites } from '../context/FavoritesContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 45) / 2;

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const storeStories = [
  { id: '1', name: 'Post', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', isAdd: true },
  { id: '2', name: 'beyou', image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af' },
  { id: '3', name: 'glassesforall', image: 'https://images.unsplash.com/photo-1574169208507-84376144848b' },
  { id: '4', name: 'motorbike...', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc' },
  { id: '5', name: 'vintageclo', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050' },
];

const categories = [
  { id: '1', name: 'Trending' },
  { id: '2', name: 'Near me' },
  { id: '3', name: 'Fashion' },
  { id: '4', name: 'Food' },
  { id: '5', name: 'Tech' },
];

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState('Products');
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [viewMode, setViewMode] = useState('grid'); // 'list' or 'grid'
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    fetchFeaturedProducts();
    fetchStores();
  }, []);

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    try {
      const response = await productAPI.getFeaturedProducts();
      setProducts(response.data);
    } catch (error) {
      console.log('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    // Mock stores data matching screenshots
    setStores([
      {
        id: '1',
        name: 'Soap queen',
        location: '23 Parsons green lane, London',
        description: 'We sell perfumed soap made by hand in our London lab.',
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108',
        rating: 9.8,
        products: 32,
        delivery: true,
        backgroundColor: '#6B7FCC',
        images: [
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108',
          'https://images.unsplash.com/photo-1571875257727-256c39da42af',
          'https://images.unsplash.com/photo-1598662957477-79de6e4b085e',
          'https://images.unsplash.com/photo-1600857544200-b9624e6ccfcb',
        ]
      },
      {
        id: '2',
        name: 'Boyou',
        location: 'London',
        description: 'We sell perfumed soap made by hand in our London lab.',
        image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af',
        rating: 9.0,
        products: 54,
        delivery: true,
        backgroundColor: '#FF1493',
        images: [
          'https://images.unsplash.com/photo-1571875257727-256c39da42af',
        ]
      },
      {
        id: '3',
        name: 'Gelupo',
        location: '7 Archer St, London W1D 7AU, United Kingdom',
        description: 'Dog Friendly',
        image: 'https://images.unsplash.com/photo-1559620192-032c4bc4674e',
        rating: 8.0,
        products: 32,
        delivery: false,
        backgroundColor: '#F5E6D3',
        textColor: '#000',
        distance: '2km away',
        images: []
      }
    ]);
  };

  const renderStoreCard = ({ item }) => {
    const isLightBg = item.textColor === '#000';
    
    return (
      <TouchableOpacity
        style={[styles.storeCardFull, { backgroundColor: item.backgroundColor }]}
        onPress={() => navigation.navigate('StoreDetail', { storeId: item.id })}
      >
        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingEmoji}>⭐</Text>
          <Text style={styles.ratingText}>{item.rating}/10</Text>
        </View>
        
        {/* Like Button */}
        <TouchableOpacity 
          style={styles.likeButton}
          onPress={() => toggleFavorite({ id: item.id, name: item.name, store: item.name, price: 0, rating: item.rating, image: item.image })}
        >
          <MaterialIcons name={isFavorite(item.id) ? "favorite" : "favorite-border"} size={24} color={isLightBg ? COLORS.secondary : COLORS.white} />
        </TouchableOpacity>

        {/* Store Images Row */}
        {item.images && item.images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storeImagesRow}>
            {item.images.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.storeThumb} />
            ))}
          </ScrollView>
        )}

        {/* Store Info */}
        <View style={styles.storeCardContent}>
          <View style={styles.storeHeader}>
            <Text style={[styles.storeCardName, isLightBg && { color: COLORS.secondary }]}>
              {item.name}
            </Text>
            {item.rating && (
              <View style={styles.storeRatingInline}>
                <MaterialIcons name="star" size={16} color={isLightBg ? COLORS.secondary : COLORS.white} />
                <Text style={[styles.storeRatingText, isLightBg && { color: COLORS.secondary }]}>
                  {item.rating}/10
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.storeLocationRow}>
            <MaterialIcons name="place" size={14} color={isLightBg ? COLORS.secondary : COLORS.white} />
            <Text style={[styles.storeCardLocation, isLightBg && { color: COLORS.secondary }]} numberOfLines={1}>
              {item.distance || item.location}
            </Text>
          </View>

          <Text style={[styles.storeCardDescription, isLightBg && { color: COLORS.secondary }]} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.storeCardFooter}>
            <Text style={[styles.storeProducts, isLightBg && { color: COLORS.secondary }]}>
              {item.products} Products
            </Text>
            {item.delivery && (
              <Text style={[styles.storeFreeDelivery, isLightBg && { color: COLORS.secondary }]}>
                🚚 Free delivery
              </Text>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.shopButton, isLightBg && { backgroundColor: COLORS.secondary }]}
            onPress={() => navigation.navigate('StoreProducts', { storeId: item.id, storeName: item.name })}
          >
            <Text style={[styles.shopButtonText, isLightBg && { color: COLORS.white }]}>Shop</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderProductCard = ({ item }) => {
    const isListView = viewMode === 'list';
    
    if (isListView) {
      return (
        <TouchableOpacity
          style={styles.productCardList}
          onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
        >
          <View style={{position: 'relative', marginBottom: 12}}>
            <Image
              source={{ uri: item.images?.[0] || 'https://images.unsplash.com/photo-1505022610485-0249ba5b3675' }}
              style={styles.productImageListFull}
            />
            {/* Image Carousel Dots */}
            <View style={styles.carouselDots}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
            {/* Rating Badge */}
            <View style={styles.productRatingBadge}>
              <Text style={styles.productRatingEmoji}>⭐</Text>
              <Text style={styles.productRatingText}>{item.rating || '9'}/10</Text>
            </View>
            {/* Wishlist Button */}
            <TouchableOpacity 
              style={styles.productLikeButton}
              onPress={() => toggleFavorite({ id: item._id, name: item.name, store: item.store, price: item.price, rating: item.rating, image: item.image })}
            >
              <MaterialIcons name={isFavorite(item._id) ? "favorite" : "favorite-border"} size={22} color="#FF1493" />
            </TouchableOpacity>
          </View>
          {/* Product Info */}
          <View style={styles.productInfo}>
            <View style={styles.productBrand}>
              <View style={styles.brandIcon} />
              <Text style={styles.brandName}>{item.store || 'Boyou'}</Text>
            </View>
            <Text style={styles.productName} numberOfLines={2}>{item.name || 'Olive oil special body'}</Text>
            <View style={styles.productListFooterInfo}>
              <Text style={styles.price}>£{item.price || '32'}</Text>
              <Text style={styles.ratingInfo}>{item.rating || '9'}/10 ({item.reviews || '32'})</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
    
    // Grid view
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
      >
        {/* Product Image */}
        <Image 
          source={{ uri: item.images?.[0] || 'https://images.unsplash.com/photo-1505022610485-0249ba5b3675' }} 
          style={styles.productImage} 
        />
        
        {/* Rating Badge */}
        <View style={styles.productRatingBadge}>
          <Text style={styles.productRatingEmoji}>⭐</Text>
          <Text style={styles.productRatingText}>{item.rating || '9'}/10</Text>
        </View>
        
        {/* Like Button */}
        <TouchableOpacity 
          style={styles.productLikeButton}
          onPress={() => toggleFavorite({ id: item._id, name: item.name, store: item.store, price: item.price, rating: item.rating, image: item.images?.[0] })}
        >
          <MaterialIcons name={isFavorite(item._id) ? "favorite" : "favorite-border"} size={20} color="#FF1493" />
        </TouchableOpacity>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.productBrand}>
            <View style={styles.brandIcon} />
            <Text style={styles.brandName}>{item.store || 'Boyou'}</Text>
          </View>
          <Text style={styles.productName} numberOfLines={1}>{item.name || 'Olive oil special body'}</Text>
          <Text style={styles.price}>£{item.price || '325'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>Logo</Text>
        <View style={styles.tabsContainer}>
          <TouchableOpacity onPress={() => setSelectedTab('Stores')}>
            <Text style={[styles.tab, selectedTab === 'Stores' && styles.tabActive]}>Stores</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedTab('Products')}>
            <Text style={[styles.tab, selectedTab === 'Products' && styles.tabActive]}>Products</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.topBarIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Cart')}>
            <MaterialIcons name="shopping-cart" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="notifications-none" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Store Stories */}
        <View style={styles.storiesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {storeStories.map((story) => (
              <TouchableOpacity key={story.id} style={styles.storyItem}>
                <View style={[styles.storyCircle, story.isAdd && styles.storyAddCircle]}>
                  {story.isAdd ? (
                    <MaterialIcons name="add" size={24} color={COLORS.white} />
                  ) : (
                    <Image source={{ uri: story.image }} style={styles.storyImage} />
                  )}
                </View>
                <Text style={styles.storyName} numberOfLines={1}>{story.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={22} color={COLORS.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={COLORS.gray}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Category Squares */}
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categorySquare,
                selectedCategory === category.id && styles.categorySquareActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <View style={styles.categorySquareInner} />
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.categoryLabels}>
          {categories.map((category) => (
            <Text 
              key={`label-${category.id}`} 
              style={[
                styles.categoryLabel,
                selectedCategory === category.id && styles.categoryLabelActive
              ]}
            >
              {category.name}
            </Text>
          ))}
        </View>

        {/* View Mode Toggle - Only show for Products tab */}
        {selectedTab === 'Products' && (
          <View style={styles.viewModeToggle}>
            <View style={styles.viewModeIconsContainer}>
              <TouchableOpacity
                style={styles.viewModeIcon}
                onPress={() => setViewMode('list')}
              >
                <MaterialIcons name="list" size={24} color={viewMode === 'list' ? COLORS.primary : '#CCC'} />
                {viewMode === 'list' && <View style={styles.viewModeIndicator} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.viewModeIcon}
                onPress={() => setViewMode('grid')}
              >
                <MaterialIcons name="grid-on" size={24} color={viewMode === 'grid' ? COLORS.primary : '#CCC'} />
                {viewMode === 'grid' && <View style={styles.viewModeIndicator} />}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Products and Stores Grid */}
        {selectedTab === 'Products' ? (
          <View style={styles.productsContainer}>
            <FlatList
              key={`products-${viewMode}`}
              data={products.length > 0 ? products : Array(12).fill({})}
              renderItem={renderProductCard}
              keyExtractor={(item, index) => item._id || `item-${index}`}
              numColumns={viewMode === 'grid' ? 2 : 1}
              columnWrapperStyle={viewMode === 'grid' ? styles.columnWrapper : null}
              scrollEnabled={false}
              nestedScrollEnabled={false}
            />
          </View>
        ) : (
          <View style={styles.productsContainer}>
            <FlatList
              key="stores-list"
              data={stores}
              renderItem={renderStoreCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              nestedScrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  tab: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },
  tabActive: {
    color: '#FFA500',
    fontWeight: '600',
  },
  topBarIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    padding: 4,
  },
  storiesContainer: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 15,
    width: 70,
  },
  storyCircle: {
    width: 60,
    height: 60,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FF1493',
    padding: 2,
    marginBottom: 5,
  },
  storyAddCircle: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  storyName: {
    fontSize: 11,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.secondary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 15,
    gap: 12,
  },
  categorySquare: {
    width: (SCREEN_WIDTH - 88) / 5,
    height: (SCREEN_WIDTH - 88) / 5,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    overflow: 'hidden',
  },
  categorySquareActive: {
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  categorySquareInner: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.secondary,
  },
  categoryLabels: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 15,
    gap: 12,
  },
  categoryLabel: {
    width: (SCREEN_WIDTH - 88) / 5,
    fontSize: 11,
    color: COLORS.gray,
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  viewModeToggle: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    marginBottom: 10,
  },
  viewModeIconsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    justifyContent: 'space-between',
  },
  viewModeIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
    flex: 1,
    paddingHorizontal: 0,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  viewModeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: '#000',
    borderRadius: 0,
  },
  viewModeButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: '#D0D0D0',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  viewModeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFE5E5',
    borderWidth: 2.5,
  },
  productsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  productCard: {
    width: (SCREEN_WIDTH - 45) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productCardList: {
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
  productCardListImageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  productImageListFull: {
    width: '100%',
    height: 240,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  productImageList: {
    width: 120,
    height: 120,
    backgroundColor: '#F0F0F0',
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
  productListRatingBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 2,
  },
  productListInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    paddingRight: 40,
  },
  productImage: {
    width: '100%',
    height: (SCREEN_WIDTH - 45) / 2,
    backgroundColor: '#F0F0F0',
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
  productListLikeButton: {
    position: 'absolute',
    top: '50%',
    right: 12,
    transform: [{ translateY: -18 }],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  productInfo: {
    padding: 14,
  },
  productListFooterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingInfo: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
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
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  storeCardFull: {
    width: '100%',
    marginHorizontal: 0,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  ratingBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 4,
    zIndex: 10,
  },
  ratingEmoji: {
    fontSize: 14,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  likeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  storeImagesRow: {
    paddingHorizontal: 15,
    paddingTop: 60,
    paddingBottom: 15,
  },
  storeThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  storeCardContent: {
    padding: 20,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeCardName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
  },
  storeRatingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  storeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 4,
  },
  storeCardLocation: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.9,
    flex: 1,
  },
  storeCardDescription: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.95,
    marginBottom: 12,
    lineHeight: 20,
  },
  storeCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 15,
  },
  storeProducts: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  storeFreeDelivery: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  shopButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  shopButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default HomeScreen;
