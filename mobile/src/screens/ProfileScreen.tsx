import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [isSeller, setIsSeller] = useState(user?.isStore || false);

  const handleLogout = async () => {
    await logout();
  };

  // Seller's stores data
  const stores = [
    { id: '1', name: 'Store 1', image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af' },
    { id: '2', name: 'Store 2', image: 'https://images.unsplash.com/photo-1588534928657-af8c095da0dd' },
    { id: '3', name: 'Store 3', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883' },
    { id: '4', name: 'Store 4', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108' },
    { id: '5', name: 'Store 5', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371' },
    { id: '6', name: 'Store 6', image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {isSeller ? <SellerProfileView stores={stores} navigation={navigation} /> : <BuyerProfileView navigation={navigation} />}
    </SafeAreaView>
  );
};

// BUYER PROFILE VIEW (Not a seller yet)
const BuyerProfileView = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('grid');
  const { favorites } = useFavorites();
  
  // Split favorites into products and stores (simple logic for demo)
  const likedProducts = favorites.filter(item => item.price > 0);
  const likedStores = favorites.filter(item => !item.price || item.price === 0);

  const handleSellProduct = () => {
    Alert.alert(
      'Create a Store First',
      'You need to create a store before you can sell products. Would you like to create one now?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Create Store',
          onPress: () => navigation.navigate('CreateStore'),
          style: 'default',
        },
      ]
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
      {/* Header with Back and Notification */}
      <View style={styles.buyerHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.goBackText}>Go back</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <MaterialIcons name="notifications" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => navigation.navigate('Settings')}>
          <MaterialIcons name="more-vert" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {/* Profile Avatar and Stats */}
      <View style={styles.profileSection}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' }}
          style={styles.profileAvatar}
        />
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Stores</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>83</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>320</Text>
            <Text style={styles.statLabel}>Subscribers</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>120</Text>
            <Text style={styles.statLabel}>Subscription</Text>
          </View>
        </View>
      </View>

      {/* User Bio */}
      <View style={styles.bioSection}>
        <Text style={styles.bioName}>Lumina</Text>
        <Text style={styles.bioTagline}>Here are my latest travel pictures!</Text>
        <Text style={styles.bioWebsite}>www.yoursite.com</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.darkButton} onPress={handleSellProduct}>
          <MaterialIcons name="add" size={20} color={COLORS.white} />
          <Text style={styles.darkButtonText}>Sell product</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.darkButton} onPress={() => navigation.navigate('CreateStore')}>
          <MaterialIcons name="add" size={20} color={COLORS.white} />
          <Text style={styles.darkButtonText}>Create a new store</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabButtons}>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'grid' && styles.tabActive]} onPress={() => setActiveTab('grid')}>
          <MaterialIcons name="grid-3x3" size={20} color={activeTab === 'grid' ? COLORS.secondary : COLORS.gray} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'favorites' && styles.tabActive]} onPress={() => setActiveTab('favorites')}>
          <MaterialIcons name="favorite" size={20} color={activeTab === 'favorites' ? COLORS.primary : COLORS.gray} />
        </TouchableOpacity>
      </View>

      {/* Grid Tab - Create Store CTA */}
      {activeTab === 'grid' ? (
        <>
          <TouchableOpacity style={styles.createStoreButton} onPress={() => navigation.navigate('CreateStore')}>
            <MaterialIcons name="add" size={20} color={COLORS.white} />
            <Text style={styles.createStoreText}>Create your first store</Text>
          </TouchableOpacity>
          <View style={{ height: 200 }} />
        </>
      ) : (
        // Favorites Tab - Liked Products and Stores
        <>
          {/* Liked Products */}
          {likedProducts.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Liked Products</Text>
              <FlatList
                data={likedProducts}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.productsGrid}
                columnWrapperStyle={styles.productRow}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.productCard}
                    onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                  >
                    <Image source={{ uri: item.image }} style={styles.productImage} />
                    <View style={styles.productCardInfo}>
                      <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.productStore}>{item.store}</Text>
                      <Text style={styles.productPrice}>£{item.price}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </>
          )}

          {/* Liked Stores */}
          {likedStores.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Liked Stores</Text>
              <FlatList
                data={likedStores}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.storesGridFav}
                columnWrapperStyle={styles.storeRowFav}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.storeCardFav}
                    onPress={() => navigation.navigate('StoreDetail', { storeId: item.id, storeName: item.name })}
                  >
                    <Image source={{ uri: item.image }} style={styles.storeImageFav} />
                    <Text style={styles.storeNameFav}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}
          <View style={{ height: 30 }} />
        </>
      )}
    </ScrollView>
  );
};

// SELLER PROFILE VIEW (As a seller)
const SellerProfileView = ({ stores, navigation }) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
      {/* Header with Back and Notification */}
      <View style={styles.buyerHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.goBackText}>Go back</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <MaterialIcons name="notifications" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => navigation.navigate('Settings')}>
          <MaterialIcons name="more-vert" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {/* Profile Avatar and Stats */}
      <View style={styles.profileSection}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' }}
          style={styles.profileAvatar}
        />
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Stores</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>83</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>320</Text>
            <Text style={styles.statLabel}>Subscribers</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>120</Text>
            <Text style={styles.statLabel}>Subscription</Text>
          </View>
        </View>
      </View>

      {/* User Bio */}
      <View style={styles.bioSection}>
        <Text style={styles.bioName}>Lumina</Text>
        <Text style={styles.bioTagline}>Here are my latest travel pictures!</Text>
        <Text style={styles.bioWebsite}>www.yoursite.com</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.darkButton} onPress={() => navigation.navigate('AddProduct')}>
          <MaterialIcons name="add" size={20} color={COLORS.white} />
          <Text style={styles.darkButtonText}>Sell product</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.darkButton} onPress={() => navigation.navigate('CreateStore')}>
          <MaterialIcons name="add" size={20} color={COLORS.white} />
          <Text style={styles.darkButtonText}>Create a new store</Text>
        </TouchableOpacity>
      </View>

      {/* Stores Grid */}
      <Text style={styles.storesTitle}>My Stores</Text>
      <FlatList
        data={stores}
        numColumns={2}
        scrollEnabled={false}
        contentContainerStyle={styles.storesGrid}
        columnWrapperStyle={styles.storeRow}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.storeCard}>
            <Image source={{ uri: item.image }} style={styles.storeImage} />
            <TouchableOpacity style={[styles.storeButton, styles.openButton]} onPress={() => navigation.navigate('MyStore', { storeId: item.id, storeName: item.name })}>
              <Text style={styles.storeButtonText}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.storeButton, styles.manageButton]} onPress={() => navigation.navigate('MyStore', { storeId: item.id, storeName: item.name, manage: true })}>
              <Text style={styles.storeButtonText}>Manage</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  buyerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  goBackText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
    backgroundColor: COLORS.light,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 4,
  },
  bioSection: {
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  bioName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  bioTagline: {
    fontSize: 12,
    color: COLORS.secondary,
    marginBottom: 6,
  },
  bioWebsite: {
    fontSize: 11,
    color: COLORS.primary,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 12,
    marginBottom: 20,
  },
  darkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  darkButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  tabButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
    marginBottom: 20,
  },
  tabButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.secondary,
  },
  createStoreButton: {
    marginHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 30,
  },
  createStoreText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  storesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
    paddingHorizontal: 15,
    marginBottom: 15,
    marginTop: 10,
  },
  storesGrid: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  storeRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  storeCard: {
    width: (SCREEN_WIDTH - 45) / 2,
  },
  storeImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: COLORS.light,
  },
  storeButton: {
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  openButton: {
    backgroundColor: COLORS.secondary,
  },
  manageButton: {
    backgroundColor: COLORS.secondary,
  },
  storeButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
    paddingHorizontal: 15,
    marginBottom: 15,
    marginTop: 20,
  },
  productsGrid: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  productCard: {
    width: (SCREEN_WIDTH - 45) / 2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.light,
  },
  productCardInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  productStore: {
    fontSize: 10,
    color: COLORS.gray,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  storesGridFav: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  storeRowFav: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  storeCardFav: {
    width: (SCREEN_WIDTH - 45) / 2,
  },
  storeImageFav: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: COLORS.light,
  },
  storeNameFav: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
    textAlign: 'center',
  },
});

export default ProfileScreen;
