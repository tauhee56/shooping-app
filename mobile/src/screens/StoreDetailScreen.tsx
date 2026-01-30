import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { productAPI, storeAPI } from '../utils/api';
import { getErrorMessage } from '../utils/errorMapper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const StoreDetailScreen = ({ navigation, route }: any) => {
  const storeId = route?.params?.storeId;

  const { user } = useContext(AuthContext);
  const userId = (user as any)?._id || (user as any)?.id;

  const [store, setStore] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const isValidImageUri = (uri: any) => typeof uri === 'string' && uri.trim().length > 0;

  const isUserFollowingStore = (s: any, uid: any) => {
    if (!uid) return false;
    const followers = Array.isArray(s?.followers) ? s.followers : [];
    return followers.map((f: any) => String(f?._id || f)).includes(String(uid));
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!storeId) {
        setError('Store not found');
        return;
      }

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
        setError(getErrorMessage(e, 'Failed to load store'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  const storeData = useMemo(() => {
    return {
      id: store?._id || storeId,
      name: store?.name || route?.params?.storeName || '',
      description: store?.description || '',
      image: store?.logo || store?.banner || '',
      coverImage: store?.banner || store?.logo || '',
      rating: typeof store?.rating === 'number' ? store.rating : 0,
      reviews: 0,
      followers: Array.isArray(store?.followers) ? store.followers.length : 0,
      products: Array.isArray(products) ? products.length : Array.isArray(store?.products) ? store.products.length : 0,
      location: store?.location || '',
      deliveryAvailable: true,
    };
  }, [products, route?.params?.storeName, store, storeId]);

  const derivedCategories = useMemo(() => {
    const categoryCounts = new Map<string, number>();
    for (const p of products) {
      const key = (p?.category || 'Other') as string;
      categoryCounts.set(key, (categoryCounts.get(key) || 0) + 1);
    }

    const colors = ['#FFE5E5', '#E5F5FF', '#F0E5FF', '#E5FFE5', '#FFF4E5'];

    return Array.from(categoryCounts.entries()).map(([name, count], index) => {
      const img = (products || []).find((p: any) => String(p?.category || 'Other') === String(name))?.images?.[0] || '';
      return {
        id: String(index + 1),
        name,
        count,
        color: colors[index % colors.length],
        image: img,
      };
    });
  }, [products]);

  const handleFollow = async () => {
    if (!storeData?.id) return;
    const prev = isFollowing;
    try {
      setIsFollowing(!prev);
      const res = await storeAPI.followStore(storeData.id);
      const apiFollowing = typeof res?.data?.isFollowing === 'boolean' ? res.data.isFollowing : null;
      if (apiFollowing !== null) {
        setIsFollowing(apiFollowing);
      }
    } catch (e: any) {
      setIsFollowing(prev);
      setError(getErrorMessage(e, 'Failed to follow store'));
    }
  };

  if (loading && !store) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !store) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: COLORS.secondary, fontWeight: '600', fontSize: 16, marginBottom: 10 }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setError(null);
              setLoading(true);
              Promise.all([
                storeAPI.getStoreById(storeId),
                productAPI.getProductsByStore(storeId),
              ])
                .then(([storeRes, productsRes]) => {
                  setStore(storeRes.data);
                  setIsFollowing(isUserFollowingStore(storeRes.data, userId));
                  setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
                })
                .catch((e) => setError(getErrorMessage(e, 'Failed to load store')))
                .finally(() => setLoading(false));
            }}
            style={{ paddingVertical: 10, paddingHorizontal: 16, backgroundColor: COLORS.secondary, borderRadius: 10, marginBottom: 10 }}
          >
            <Text style={{ color: COLORS.white, fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          {isValidImageUri(storeData.coverImage) ? (
            <Image source={{ uri: storeData.coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverImage} />
          )}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Store Info Container */}
        <View style={styles.infoContainer}>
          {/* Logo */}
          {isValidImageUri(storeData.image) ? (
            <Image source={{ uri: storeData.image }} style={styles.storeAvatar} />
          ) : (
            <View style={styles.storeAvatar} />
          )}
          
          {/* Store Name and Location */}
          <Text style={styles.storeName}>{storeData.name}</Text>
          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{storeData.rating}</Text>
            <Text style={styles.reviews}>{storeData.reviews} Reviews</Text>
          </View>
          <Text style={styles.location}>{storeData.location}</Text>

          {/* Description */}
          <Text style={styles.description}>{storeData.description}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{storeData.products}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialIcons name="local-shipping" size={20} color={COLORS.primary} />
              <Text style={styles.statLabel}>Delivery available</Text>
            </View>
          </View>

          {/* Follow Button */}
          <TouchableOpacity style={styles.followButton} onPress={handleFollow}>
            <Text style={styles.followButtonText}>{isFollowing ? 'Following' : 'Follow'}</Text>
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
                (index % 2 === 1) && styles.categoryCardRight,
              ]}
              onPress={() => navigation.navigate('StoreProducts', { storeId: storeData.id, storeName: storeData.name })}
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
        
        {/* Shop Button */}
        <TouchableOpacity 
          style={styles.shopButtonBottom}
          onPress={() => navigation.navigate('StoreProducts', { storeId: storeData.id, storeName: storeData.name })}
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
