import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { orderAPI } from '../utils/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const CheckoutScreen = ({ route, navigation }) => {
  const { cartItems, subtotal, shipping, total } = route.params;
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock saved addresses
  const savedAddresses = [
    {
      id: '1',
      address: '2715 Ash Dr. San Jose, South...',
      default: true,
    },
  ];

  // Mock saved payment methods
  const savedPayments = [
    {
      id: '1',
      last4: '4187',
      brand: 'Visa',
      default: true,
    },
  ];

  const handleAddAddress = () => {
    navigation.navigate('Addresses');
  };

  const handleAddPayment = () => {
    navigation.navigate('PaymentMethods');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Select Address', 'Please select a shipping address');
      return;
    }
    if (!selectedPayment) {
      Alert.alert('Select Payment', 'Please select a payment method');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        items: cartItems.map(item => ({
          product: item.id,
          quantity: item.quantity || 1,
          price: item.price,
        })),
        shippingAddress: selectedAddress,
        paymentMethod: selectedPayment,
        totalAmount: total,
        shippingCost: shipping,
      };

      const response = await orderAPI.createOrder(orderData);
      navigation.navigate('OrderSuccess', { orderId: response.data._id });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Shipping Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Shipping Address</Text>
          
          {savedAddresses.length > 0 ? (
            <>
              {savedAddresses.map((address) => (
                <TouchableOpacity
                  key={address.id}
                  style={[
                    styles.optionCard,
                    selectedAddress === address.id && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedAddress(address.id)}
                >
                  <View style={styles.optionHeader}>
                    <View
                      style={[
                        styles.radioButton,
                        selectedAddress === address.id && styles.radioButtonSelected,
                      ]}
                    >
                      {selectedAddress === address.id && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text style={styles.optionText}>{address.address}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
                <MaterialIcons name="add" size={20} color={COLORS.primary} />
                <Text style={styles.addButtonText}>Add New Address</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.emptyCard} onPress={handleAddAddress}>
              <MaterialIcons name="location-on" size={40} color={COLORS.light} />
              <Text style={styles.emptyCardText}>Add Shipping Address</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Payment Method</Text>
          
          {savedPayments.length > 0 ? (
            <>
              {savedPayments.map((payment) => (
                <TouchableOpacity
                  key={payment.id}
                  style={[
                    styles.optionCard,
                    selectedPayment === payment.id && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedPayment(payment.id)}
                >
                  <View style={styles.optionHeader}>
                    <View
                      style={[
                        styles.radioButton,
                        selectedPayment === payment.id && styles.radioButtonSelected,
                      ]}
                    >
                      {selectedPayment === payment.id && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentText}>
                        **** {payment.last4}
                      </Text>
                      <View style={styles.cardBrand}>
                        <View style={styles.cardIndicator} />
                        <Text style={styles.brandText}>{payment.brand}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={handleAddPayment}>
                <MaterialIcons name="add" size={20} color={COLORS.primary} />
                <Text style={styles.addButtonText}>Add Payment Method</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.emptyCard} onPress={handleAddPayment}>
              <MaterialIcons name="payment" size={40} color={COLORS.light} />
              <Text style={styles.emptyCardText}>Add Payment Method</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Summary and Checkout */}
      <View style={styles.footer}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>£{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping Cost</Text>
            <Text style={styles.summaryValue}>£{shipping.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>£0.00</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>£{total.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.checkoutButtonText}>£{total.toFixed(2)} Place Order</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.light,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    flex: 1,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  cardBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  brandText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.light,
    borderStyle: 'dashed',
  },
  emptyCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    padding: 15,
  },
  summaryContainer: {
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.gray,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.light,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  checkoutButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CheckoutScreen;
