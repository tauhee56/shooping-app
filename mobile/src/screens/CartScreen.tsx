import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

 const CartScreen = ({ navigation }) => {
  const { items, totals, loading, error, refreshCart, updateQty, removeFromCart } = useCart();

  const cartItems = useMemo(() => {
    return (items || []).map((i: any) => {
      const product = i?.product;
      const storeName = product?.store && typeof product.store === 'object' ? (product.store?.name as any) : '';
      return {
        id: String(product?._id || product?.id || i?.product || i?._id || ''),
        name: product?.name || 'Product',
        store: storeName || '',
        price: typeof product?.price === 'number' ? product.price : 0,
        quantity: typeof i?.quantity === 'number' ? i.quantity : 1,
        image: Array.isArray(product?.images) && product.images.length > 0 ? product.images[0] : undefined,
      };
    });
  }, [items]);

  const updateQuantity = async (id, change) => {
    try {
      const current = cartItems.find((x) => x.id === String(id));
      const nextQty = Math.max(1, (current?.quantity || 1) + change);
      await updateQty(String(id), nextQty);
    } catch {
      // error is handled and exposed via CartContext.error
    }
  };

  const removeItem = async (id) => {
    try {
      await removeFromCart(String(id));
    } catch {
      // error is handled and exposed via CartContext.error
    }
  };

  const calculateSubtotal = () => {
    if (totals && typeof totals.subtotal === 'number') return totals.subtotal;
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const shipping = 5.99;
  const total = calculateSubtotal() + shipping;

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.itemImage} />
      ) : (
        <View style={styles.itemImagePlaceholder}>
          <MaterialIcons name="image-not-supported" size={24} color={COLORS.gray} />
        </View>
      )}
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemStore}>{item.store}</Text>
        <Text style={styles.itemPrice}>£{item.price.toFixed(2)}</Text>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeButton}>
          <MaterialIcons name="close" size={20} color={COLORS.gray} />
        </TouchableOpacity>
        
        <View style={styles.quantityControl}>
          <TouchableOpacity 
            onPress={() => updateQuantity(item.id, -1)}
            style={styles.quantityButton}
          >
            <MaterialIcons name="remove" size={18} color={COLORS.secondary} />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity 
            onPress={() => updateQuantity(item.id, 1)}
            style={styles.quantityButton}
          >
            <MaterialIcons name="add" size={18} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <TouchableOpacity>
          <MaterialIcons name="delete-outline" size={24} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.emptyCart}>
          <ActivityIndicator />
          <Text style={[styles.emptySubtext, { marginTop: 12 }]}>Loading your cart...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyCart}>
          <MaterialIcons name="error-outline" size={80} color={COLORS.gray} />
          <Text style={styles.emptyText}>Unable to load cart</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
          <TouchableOpacity style={styles.shopButton} onPress={refreshCart}>
            <Text style={styles.shopButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : cartItems.length > 0 ? (
        <View>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.cartList}
            showsVerticalScrollIndicator={false}
          />

          {/* Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>£{calculateSubtotal().toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>£{shipping.toFixed(2)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>£{total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={() => navigation.navigate('Checkout')}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCart}>
          <MaterialIcons name="shopping-cart" size={80} color={COLORS.gray} />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add items to get started</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      )}
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
  cartList: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: COLORS.light,
  },
  itemImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: COLORS.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  itemStore: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  removeButton: {
    padding: 4,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    borderRadius: 20,
    padding: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginHorizontal: 12,
  },
  summary: {
    backgroundColor: COLORS.light,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 30,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: COLORS.gray,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    gap: 8,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
  },
  shopButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default CartScreen;
