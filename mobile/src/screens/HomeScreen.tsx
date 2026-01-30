import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, FlatList, TextInput, Dimensions, ActivityIndicator, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { productAPI, storeAPI } from '../utils/api';
import { useFavorites } from '../context/FavoritesContext';
import { getErrorMessage } from '../utils/errorMapper';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 45) / 2;

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const getStoreName = (store: any): string => {
  if (!store) return '';
  if (typeof store === 'string') return store;
  if (typeof store === 'object') return store?.name || '';
  return '';
};

const appendCacheBuster = (uri: any, token: any): string => {
  const clean = typeof uri === 'string' ? uri.trim() : '';
  if (!clean) return '';
  if (!token) return clean;
  const t = String(token);
  if (!t) return clean;
  const sep = clean.includes('?') ? '&' : '?';
  return `${clean}${sep}v=${encodeURIComponent(t)}`;
};

const HAS_RN_SVG =
  typeof (UIManager as any)?.getViewManagerConfig === 'function' &&
  !!((UIManager as any).getViewManagerConfig('RNSVGPath') || (UIManager as any).getViewManagerConfig('RCTRNSVGPath'));

const CategoryVectorIcon = ({
  type,
  size,
  color,
}: {
  type: 'trending' | 'near' | 'fashion' | 'food' | 'tech';
  size: number;
  color: string;
}) => {
  const strokeWidth = 2;

  if (!HAS_RN_SVG) {
    const fallbackName =
      type === 'trending'
        ? 'trending-up'
        : type === 'near'
          ? 'near-me'
          : type === 'fashion'
            ? 'checkroom'
            : type === 'food'
              ? 'restaurant'
              : 'devices';

    return <MaterialIcons name={fallbackName as any} size={size} color={color} />;
  }

  if (type === 'trending') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M16 7h6v6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="m22 7-8.5 8.5-5-5L2 17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  if (type === 'near') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  if (type === 'fashion') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (type === 'food') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M7 2v20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M20.054 15.987H3.946" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

const categories = [
  { id: '1', name: 'Trending', vector: 'trending' },
  { id: '2', name: 'Near me', vector: 'near' },
  { id: '3', name: 'Fashion', vector: 'fashion' },
  { id: '4', name: 'Food', vector: 'food' },
  { id: '5', name: 'Tech', vector: 'tech' },
];

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storesError, setStoresError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState('Products');
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [viewMode, setViewMode] = useState('grid'); // 'list' or 'grid'
  const { toggleFavorite, isFavorite } = useFavorites();

  const isValidImageUri = (uri: any) => typeof uri === 'string' && uri.trim().length > 0;

  const storeStories = useMemo(() => {
    const list = Array.isArray(stores) ? stores : [];
    const storyList = list.map((s: any, idx: number) => {
      const uri = s?.image || (Array.isArray(s?.images) ? s.images[0] : '') || '';
      return {
        id: String(s?.id || s?._id || idx),
        name: String(s?.name || '').slice(0, 12),
        image: uri,
        isAdd: false,
      };
    });
    return [{ id: 'post', name: 'Post', image: '', isAdd: true }, ...storyList];
  }, [stores]);

  useEffect(() => {
    fetchLatestProducts();
    fetchStores();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLatestProducts();
      fetchStores();
    }, [])
  );

  const fetchLatestProducts = async () => {
    setLoading(true);
    setProductsError(null);
    try {
      const response = await productAPI.getAllProducts({ page: 1, limit: 20 });
      const payload = response?.data;
      const list = Array.isArray(payload?.products) ? payload.products : [];
      setProducts(list);
    } catch (error) {
      console.log('Error fetching products:', error);
      setProducts([]);
      setProductsError(getErrorMessage(error, 'Failed to load products'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    setStoresLoading(true);
    setStoresError(null);
    try {
      const response = await storeAPI.listStores();
      const apiStores = Array.isArray(response.data) ? response.data : [];

      const cardColors = ['#6B7FCC', '#FF1493', '#F5E6D3'];

      const mapped = apiStores.map((s: any, index: number) => {
        const backgroundColor = cardColors[index % cardColors.length];
        const images = [s?.banner, s?.logo].filter(Boolean);

        return {
          id: s?._id,
          name: s?.name,
          location: s?.location || '',
          description: s?.description || '',
          image: s?.logo || s?.banner || '',
          rating: typeof s?.rating === 'number' ? s.rating : 0,
          products: Array.isArray(s?.products) ? s.products.length : 0,
          delivery: false,
          backgroundColor,
          textColor: backgroundColor === '#F5E6D3' ? '#000' : undefined,
          images,
        };
      });

      setStores(mapped.filter((s: any) => !!s?.id));
    } catch (error) {
      console.log('Error fetching stores:', error);
      setStores([]);
      setStoresError(getErrorMessage(error, 'Failed to load stores'));
    } finally {
      setStoresLoading(false);
    }
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
            {Number(item?.rating || 0) > 0 ? (
              <View style={styles.storeRatingInline}>
                <MaterialIcons name="star" size={16} color={isLightBg ? COLORS.secondary : COLORS.white} />
                <Text style={[styles.storeRatingText, isLightBg && { color: COLORS.secondary }]}>
                  {item.rating}/10
                </Text>
              </View>
            ) : null}
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
    const storeName = getStoreName(item?.store) || 'Store';
    const rawProductImageUri =
      (Array.isArray(item?.images) && item.images.length > 0 ? item.images[0] : null) || item?.image || '';
    const productImageUri = appendCacheBuster(rawProductImageUri, item?.updatedAt || item?.createdAt);
    
    if (isListView) {
      return (
        <TouchableOpacity
          style={styles.productCardList}
          onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
        >
          <View style={{position: 'relative', marginBottom: 12}}>
            {isValidImageUri(productImageUri) ? (
              <Image
                source={{ uri: productImageUri }}
                style={styles.productImageListFull}
              />
            ) : (
              <View style={styles.productImageListFull} />
            )}
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
              <Text style={styles.productRatingText}>{typeof item.rating === 'number' ? item.rating : Number(item.rating || 0)}/10</Text>
            </View>
            {/* Wishlist Button */}
            <TouchableOpacity 
              style={styles.productLikeButton}
              onPress={() =>
                toggleFavorite({
                  id: item._id,
                  name: item.name,
                  store: storeName,
                  price: item.price,
                  rating: item.rating,
                  image: productImageUri,
                })
              }
            >
              <MaterialIcons name={isFavorite(item._id) ? "favorite" : "favorite-border"} size={22} color="#FF1493" />
            </TouchableOpacity>
          </View>
          {/* Product Info */}
          <View style={styles.productInfo}>
            <View style={styles.productBrand}>
              <View style={styles.brandIcon} />
              <Text style={styles.brandName}>{storeName}</Text>
            </View>
            <Text style={styles.productName} numberOfLines={2}>{item.name || ''}</Text>
            <View style={styles.productListFooterInfo}>
              <Text style={styles.price}>£{typeof item.price === 'number' ? item.price : Number(item.price || 0)}</Text>
              <Text style={styles.ratingInfo}>{typeof item.rating === 'number' ? item.rating : Number(item.rating || 0)}/10 ({Array.isArray(item.reviews) ? item.reviews.length : item.reviews || 0})</Text>
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
        {isValidImageUri(productImageUri) ? (
          <Image 
            source={{ uri: productImageUri }} 
            style={styles.productImage} 
          />
        ) : (
          <View style={styles.productImage} />
        )}
        
        {/* Rating Badge */}
        <View style={styles.productRatingBadge}>
          <Text style={styles.productRatingEmoji}>⭐</Text>
          <Text style={styles.productRatingText}>{typeof item.rating === 'number' ? item.rating : Number(item.rating || 0)}/10</Text>
        </View>
        
        {/* Like Button */}
        <TouchableOpacity 
          style={styles.productLikeButton}
          onPress={() =>
            toggleFavorite({
              id: item._id,
              name: item.name,
              store: storeName,
              price: item.price,
              rating: item.rating,
              image: productImageUri,
            })
          }
        >
          <MaterialIcons name={isFavorite(item._id) ? "favorite" : "favorite-border"} size={20} color="#FF1493" />
        </TouchableOpacity>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.productBrand}>
            <View style={styles.brandIcon} />
            <Text style={styles.brandName}>{storeName}</Text>
          </View>
          <Text style={styles.productName} numberOfLines={1}>{item.name || ''}</Text>
          <Text style={styles.price}>£{typeof item.price === 'number' ? item.price : Number(item.price || 0)}</Text>
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
                    isValidImageUri(story.image) ? (
                      <Image source={{ uri: story.image }} style={styles.storyImage} />
                    ) : (
                      <View style={styles.storyImage} />
                    )
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
          {categories.map((category) => {
            const isActive = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.categorySquare, isActive ? styles.categorySquareActive : styles.categorySquareInactive]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <View style={styles.categorySquareInner}>
                  <CategoryVectorIcon
                    type={category.vector as any}
                    size={26}
                    color={isActive ? '#FFA500' : 'rgba(255,255,255,0.85)'}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
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
            {loading && products.length === 0 ? (
              <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={COLORS.secondary} />
              </View>
            ) : productsError && products.length === 0 ? (
              <View style={{ paddingVertical: 30, alignItems: 'center', paddingHorizontal: 20 }}>
                <Text style={{ color: COLORS.secondary, fontWeight: '600', fontSize: 16, marginBottom: 10, textAlign: 'center' }}>
                  {productsError}
                </Text>
                <TouchableOpacity
                  onPress={fetchLatestProducts}
                  style={{ paddingVertical: 10, paddingHorizontal: 16, backgroundColor: COLORS.secondary, borderRadius: 10 }}
                >
                  <Text style={{ color: COLORS.white, fontWeight: '600' }}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : products.length === 0 ? (
              <View style={{ paddingVertical: 30, alignItems: 'center', paddingHorizontal: 20 }}>
                <Text style={{ color: COLORS.secondary, marginBottom: 10 }}>No products found</Text>
                <TouchableOpacity
                  onPress={fetchLatestProducts}
                  style={{ paddingVertical: 10, paddingHorizontal: 16, backgroundColor: COLORS.secondary, borderRadius: 10 }}
                >
                  <Text style={{ color: COLORS.white, fontWeight: '600' }}>Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                key={`products-${viewMode}`}
                data={products}
                renderItem={renderProductCard}
                keyExtractor={(item, index) => item._id || `item-${index}`}
                numColumns={viewMode === 'grid' ? 2 : 1}
                columnWrapperStyle={viewMode === 'grid' ? styles.columnWrapper : null}
                scrollEnabled={false}
                nestedScrollEnabled={false}
              />
            )}
          </View>
        ) : (
          <View style={styles.productsContainer}>
            {storesLoading ? (
              <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={COLORS.secondary} />
              </View>
            ) : storesError ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text style={{ color: COLORS.secondary, marginBottom: 10 }}>{storesError}</Text>
                <TouchableOpacity onPress={fetchStores} style={{ paddingVertical: 10, paddingHorizontal: 16, backgroundColor: COLORS.secondary, borderRadius: 10 }}>
                  <Text style={{ color: COLORS.white, fontWeight: '600' }}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : stores.length === 0 ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text style={{ color: COLORS.secondary, marginBottom: 10 }}>No stores found</Text>
                <TouchableOpacity onPress={fetchStores} style={{ paddingVertical: 10, paddingHorizontal: 16, backgroundColor: COLORS.secondary, borderRadius: 10 }}>
                  <Text style={{ color: COLORS.white, fontWeight: '600' }}>Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                key="stores-list"
                data={stores}
                renderItem={renderStoreCard}
                keyExtractor={(item: any) => String(item.id)}
                scrollEnabled={false}
                nestedScrollEnabled={false}
              />
            )}
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
  categorySquareInactive: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  categorySquareActive: {
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  categorySquareInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
