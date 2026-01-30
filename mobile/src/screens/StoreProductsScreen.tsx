import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';
import { AuthContext } from '../context/AuthContext';
import { productAPI, storeAPI } from '../utils/api';
import { getErrorMessage, getErrorTitle } from '../utils/errorMapper';

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
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useContext(AuthContext);

  const isValidImageUri = (uri: any) => typeof uri === 'string' && uri.trim().length > 0;

  const userId = (user as any)?._id || (user as any)?.id;

  const getStoreName = (store: any): string => {
    if (!store) return '';
    if (typeof store === 'string') return store;
    if (typeof store === 'object') return store?.name || '';
    return '';
  };

  const handleFollowToggle = async () => {
    const prev = isFollowing;
    try {
      setIsFollowing(!prev);
      const res = await storeAPI.followStore(storeId);
      const apiFollowing = typeof res?.data?.isFollowing === 'boolean' ? res.data.isFollowing : null;
      if (apiFollowing !== null) {
        setIsFollowing(apiFollowing);
      }
    } catch (e: any) {
      // revert optimistic
      setIsFollowing(prev);
      Alert.alert(getErrorTitle(e, 'Failed to follow store'), getErrorMessage(e, 'Failed to follow store'));
    }
  };

  const isUserFollowingStore = (s: any, uid: any) => {
    if (!uid) return false;
    const followers = Array.isArray(s?.followers) ? s.followers : [];
    return followers.map((f: any) => String(f?._id || f)).includes(String(uid));
  };

  const handleCategoryPress = (category) => {
    // Navigate to category products or filter products
    console.log('Category pressed:', category.name);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [storeRes, productsRes] = await Promise.all([
          storeAPI.getStoreById(storeId),
          productAPI.getProductsByStore(storeId),
        ]);

        if (cancelled) return;

        setStore(storeRes.data);
        setIsFollowing(isUserFollowingStore(storeRes.data, userId));
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      } catch (e: any) {
        if (cancelled) return;
        setStore(null);
        setProducts([]);
        setError(getErrorMessage(e, 'Failed to load store products'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  const derivedCategories = useMemo(() => {
    const map = new Map<string, { name: string; count: number; image?: string }>();
    for (const p of products || []) {
      const cat = (p?.category || '').trim();
      if (!cat) continue;
      const existing = map.get(cat);
      if (existing) {
        existing.count += 1;
        continue;
      }
      const img = Array.isArray(p?.images) && p.images.length > 0 ? p.images[0] : undefined;
      map.set(cat, { name: cat, count: 1, image: img });
    }

    const colors = ['#FFE5E5', '#E5F5FF', '#F0E5FF', '#E5FFE5', '#FFF4E5'];
    return Array.from(map.values()).map((c, idx) => ({
      id: String(idx + 1),
      name: c.name,
      count: c.count,
      color: colors[idx % colors.length],
      image: c.image || '',
    }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return products;
    return (products || []).filter((p: any) => String(p?.name || '').toLowerCase().includes(q));
  }, [products, searchText]);

  const renderProductCard = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
    >
      <View style={{position: 'relative', marginBottom: 12}}>
        {isValidImageUri(item?.images?.[0]) ? (
          <Image
            source={{ uri: item.images[0] }}
            style={styles.productImage}
          />
        ) : (
          <View style={styles.productImage} />
        )}
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
          onPress={() =>
            toggleFavorite({
              id: item._id,
              name: item.name,
              store: getStoreName(item.store) || storeName || 'Store',
              price: item.price,
              rating: item.rating,
              image: (Array.isArray(item?.images) && item.images.length > 0 ? item.images[0] : '') || item?.image || '',
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
          <Text style={styles.brandName}>{getStoreName(item.store) || storeName || 'Store'}</Text>
        </View>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.productFooter}>
          <Text style={styles.price}>£{item.price}</Text>
          <Text style={styles.ratingInfo}>
            {item.rating}/10 ({Array.isArray(item.reviews) ? item.reviews.length : item.reviews || 0})
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          {isValidImageUri(store?.banner) ? (
            <Image
              source={{ uri: store.banner }}
              style={styles.coverImage}
            />
          ) : (
            <View style={styles.coverImage} />
          )}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 30, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={COLORS.secondary} />
          </View>
        ) : error ? (
          <View style={{ paddingVertical: 20, alignItems: 'center', paddingHorizontal: 20 }}>
            <Text style={{ color: COLORS.secondary, marginBottom: 10, textAlign: 'center' }}>{error}</Text>
            <TouchableOpacity
              onPress={() => {
                setError(null);
                setLoading(true);
                Promise.all([storeAPI.getStoreById(storeId), productAPI.getProductsByStore(storeId)])
                  .then(([s, p]) => {
                    setStore(s.data);
                    setProducts(Array.isArray(p.data) ? p.data : []);
                  })
                  .catch((e) => setError(getErrorMessage(e, 'Failed to load store products')))
                  .finally(() => setLoading(false));
              }}
              style={{ paddingVertical: 10, paddingHorizontal: 16, backgroundColor: COLORS.secondary, borderRadius: 10 }}
            >
              <Text style={{ color: COLORS.white, fontWeight: '600' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>

          {/* Store Info Container */}
          <View style={styles.infoContainer}>
          {/* Logo */}
          {isValidImageUri(store?.logo) ? (
            <Image
              source={{ uri: store.logo }}
              style={styles.storeAvatar}
            />
          ) : (
            <View style={styles.storeAvatar} />
          )}
          
          {/* Store Name and Location */}
          <Text style={styles.storeName}>{store?.name || storeName || 'Store'}</Text>
          <View style={styles.ratingRow}>
            <MaterialIcons name="place" size={16} color={COLORS.gray} />
            <Text style={styles.location}>{store?.location || ''}</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>{store?.description || ''}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{Array.isArray(products) ? products.length : 0}</Text>
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
          {derivedCategories.map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                { backgroundColor: category.color },
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              {isValidImageUri(category.image) ? (
                <Image source={{ uri: category.image }} style={styles.categoryImage} />
              ) : (
                <View style={styles.categoryImage} />
              )}
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
            keyExtractor={(item: any) => String(item?._id || item?.id || '')}
            contentContainerStyle={styles.productsListContainer}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text style={{ color: COLORS.gray }}>No products found</Text>
              </View>
            }
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
