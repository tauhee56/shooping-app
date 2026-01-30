import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { storeAPI } from '../utils/api';
import { useFocusEffect } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (SCREEN_WIDTH - 45) / 2;

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const MyStoreScreen = ({ navigation, route }) => {
  const { storeId } = route.params || {};
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  const isValidImageUri = (uri: any) => typeof uri === 'string' && uri.trim().length > 0;

  const fetchStore = useCallback(async () => {
    try {
      const sid = typeof storeId === 'string' ? storeId : '';
      const response = sid ? await storeAPI.getStoreById(sid) : await storeAPI.getMyStore();
      setStore(response.data);
      setLoading(false);
    } catch (error) {
      console.log('Error fetching store:', error);
      setLoading(false);
    }
  }, [storeId]);

  useFocusEffect(
    useCallback(() => {
      fetchStore();
    }, [fetchStore, storeId])
  );

  const handleEditProduct = (product) => {
    navigation.navigate('EditProduct', { 
      storeId: store._id, 
      productId: product._id,
      product 
    });
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await storeAPI.deleteProduct(store._id, productId);
      fetchStore(); // Refresh store data
    } catch (error) {
      console.log('Error deleting product:', error);
    }
  };

  const handleEditStore = () => {
    navigation.navigate('EditStore', { storeId: store._id, store });
  };

  const renderProductCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
    >
      {isValidImageUri(item?.images?.[0]) ? (
        <Image
          source={{ uri: item.images[0] }}
          style={styles.productImage}
        />
      ) : (
        <View style={styles.productImage} />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>£{item.price}</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.smallButton}
            onPress={() => handleEditProduct(item)}
          >
            <MaterialIcons name="edit" size={16} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.smallButton, { backgroundColor: '#FF6B6B' }]}
            onPress={() => handleDeleteProduct(item._id)}
          >
            <MaterialIcons name="delete" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!store) {
    return (
      <View style={styles.container}>
        <Text>Store not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Store</Text>
          <TouchableOpacity>
            <MaterialIcons name="more-vert" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        {/* Store Banner */}
        {isValidImageUri((store as any)?.banner) ? (
          <Image
            source={{ uri: (store as any).banner }}
            style={styles.banner}
          />
        ) : (
          <View style={styles.banner} />
        )}

        {/* Store Info Card */}
        <View style={styles.storeInfoCard}>
          {isValidImageUri((store as any)?.logo) ? (
            <Image
              source={{ uri: (store as any).logo }}
              style={styles.storeIcon}
            />
          ) : (
            <View style={styles.storeIcon} />
          )}
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{store.name}</Text>
            <Text style={styles.storeLocation}>{store.location}</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{store.followers?.length || 0}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{store.products?.length || 0}</Text>
                <Text style={styles.statLabel}>Products</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{store.totalSales || 0}</Text>
                <Text style={styles.statLabel}>Sales</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        {typeof store.description === 'string' && store.description.trim().length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{store.description}</Text>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleEditStore}
          >
            <MaterialIcons name="edit" size={18} color={COLORS.white} />
            <Text style={styles.buttonText}>Edit Store</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('AddProduct', { storeId: store._id })}
          >
            <MaterialIcons name="add" size={18} color={COLORS.primary} />
            <Text style={[styles.buttonText, { color: COLORS.primary }]}>Add Product</Text>
          </TouchableOpacity>
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Products</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {store.products && store.products.length > 0 ? (
            <FlatList
              data={store.products}
              renderItem={renderProductCard}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="shopping-bag" size={40} color={COLORS.gray} />
              <Text style={styles.emptyText}>No products yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 45,
    paddingBottom: 15,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  banner: {
    width: '100%',
    height: SCREEN_WIDTH * 0.5,
    backgroundColor: COLORS.light,
  },
  storeInfoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 15,
    marginTop: -40,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.light,
    marginRight: 15,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 3,
  },
  storeLocation: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
  },
  stat: {
    marginRight: 15,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.gray,
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.light,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  productsSection: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    marginBottom: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: PRODUCT_CARD_WIDTH * 0.75,
    backgroundColor: COLORS.light,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  smallButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 10,
    color: COLORS.gray,
    fontSize: 14,
  },
});

export default MyStoreScreen;
