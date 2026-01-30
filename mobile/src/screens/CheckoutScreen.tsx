import React, { useEffect, useMemo, useState } from 'react';
import { NativeModules, View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { getErrorMessage, getErrorTitle } from '../utils/errorMapper';
import { useCart } from '../context/CartContext';
import { addressAPI, paymentsAPI } from '../utils/api';

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const CheckoutScreen = ({ navigation }) => {
  const { items, totals, loading: cartLoading, checkout } = useCart();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);

  const enableStripe = String(process.env.EXPO_PUBLIC_ENABLE_STRIPE || '').toLowerCase() === 'true';
  const nativeStripeAvailable = (() => {
    if (!enableStripe) return false;
    const nm: any = NativeModules;
    return !!(nm?.StripeSdk || nm?.Stripe || nm?.StripeSdkModule);
  })();

  let stripeSdk: any = null;
  if (enableStripe) {
    try {
      stripeSdk = require('@stripe/stripe-react-native');
    } catch {
      stripeSdk = null;
    }
  }

  const subtotal = useMemo(() => {
    if (totals && typeof totals.subtotal === 'number') return totals.subtotal;
    return (items || []).reduce((sum: number, i: any) => {
      const price = typeof i?.product?.price === 'number' ? i.product.price : 0;
      const qty = typeof i?.quantity === 'number' ? i.quantity : 0;
      return sum + price * qty;
    }, 0);
  }, [totals, items]);

  const shipping = 5.99;
  const total = subtotal + shipping;

  const mapAddress = (a: any) => ({
    id: String(a?._id || a?.id || ''),
    address: a?.street || a?.address || '',
    default: !!a?.isDefault,
    raw: a,
  });

  const loadAddresses = async () => {
    try {
      setAddressesLoading(true);
      const res = await addressAPI.getMyAddresses();
      const list = Array.isArray(res.data) ? res.data : [];
      const mapped = list.map(mapAddress).filter((x: any) => !!x.id);
      setAddresses(mapped);
      const def = mapped.find((x: any) => x.default);
      if (def && !selectedAddress) {
        setSelectedAddress(def.id);
      }
    } catch {
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const allowCOD = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    if (list.length === 0) return false;
    return list.every((i: any) => !!i?.product?.effectivePaymentOptions?.codEnabled);
  }, [items]);

  const allowStripe = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    if (list.length === 0) return false;
    return list.every((i: any) => {
      const opt = i?.product?.effectivePaymentOptions;
      if (!opt) return true;
      return opt.stripeEnabled !== false;
    });
  }, [items]);

  const savedPayments = useMemo(() => {
    const result: any[] = [];
    if (allowCOD) {
      result.push({
        id: 'COD',
        title: 'Cash on Delivery',
        subtitle: 'Pay when you receive your order',
      });
    }
    if (allowStripe) {
      result.push({
        id: 'card',
        title: 'Card',
        subtitle: enableStripe && nativeStripeAvailable ? 'Pay by card' : 'Requires Stripe-enabled dev build',
      });
    }
    return result;
  }, [allowCOD, allowStripe, enableStripe, nativeStripeAvailable]);

  useEffect(() => {
    if (!savedPayments.find((p) => p.id === selectedPayment)) {
      setSelectedPayment(savedPayments[0]?.id || 'COD');
    }
  }, [savedPayments, selectedPayment]);

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

    if (!items || items.length === 0) {
      Alert.alert('Cart is empty', 'Please add items to your cart before checkout');
      return;
    }

    try {
      setLoading(true);
      const addressObj = addresses.find((a) => a.id === selectedAddress);
      const deliveryAddress = addressObj?.raw || addressObj?.address || 'Address';

      if (selectedPayment === 'card') {
        if (!allowStripe) {
          Alert.alert('Payment not available', 'Card payment is not available for one or more items in your cart.');
          return;
        }
        if (!enableStripe || !nativeStripeAvailable || !stripeSdk) {
          Alert.alert('Card Payment', 'Card payment needs a Stripe-enabled dev build. For now please use Cash on Delivery.');
          return;
        }

        const createRes = await paymentsAPI.createIntent();
        const clientSecret = String(createRes?.data?.clientSecret || '').trim();
        const paymentIntentId = String(createRes?.data?.paymentIntentId || '').trim();
        if (!clientSecret || !paymentIntentId) {
          Alert.alert('Payment error', 'Failed to initialize card payment.');
          return;
        }

        const initRes = await stripeSdk.initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'Shopping App',
        });
        if (initRes?.error) {
          Alert.alert('Payment error', initRes.error.message || 'Failed to initialize payment sheet');
          return;
        }

        const presentRes = await stripeSdk.presentPaymentSheet();
        if (presentRes?.error) {
          Alert.alert('Payment cancelled', presentRes.error.message || 'Payment not completed');
          return;
        }

        const paymentMethod = { type: 'stripe', paymentIntentId };
        const order = await checkout(deliveryAddress, paymentMethod);
        navigation.navigate('OrderSuccess', { orderId: order?._id });
        return;
      }

      if (!allowCOD) {
        Alert.alert('Payment not available', 'Cash on Delivery is not available for one or more items in your cart.');
        return;
      }

      const paymentMethod = { type: 'COD' };
      const order = await checkout(deliveryAddress, paymentMethod);
      navigation.navigate('OrderSuccess', { orderId: order?._id });
    } catch (error) {
      Alert.alert(
        getErrorTitle(error, 'Failed to place order'),
        getErrorMessage(error, 'Failed to place order')
      );
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
          
          {addressesLoading ? (
            <View style={{ paddingVertical: 12 }}>
              <ActivityIndicator />
            </View>
          ) : addresses.length > 0 ? (
            <View>
              {addresses.map((address) => (
                <TouchableOpacity
                  key={address.id}
                  style={[
                    styles.optionCard,
                    selectedAddress === address.id && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedAddress(address.id)}
                >
                  <View style={styles.optionRow}>
                    <View style={styles.radioButton}>
                      {selectedAddress === address.id && <View style={styles.radioButtonSelected} />}
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle}>{address.default ? 'Default Address' : 'Address'}</Text>
                      <Text style={styles.optionText}>{address.address}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
                <MaterialIcons name="add" size={20} color={COLORS.primary} />
                <Text style={styles.addButtonText}>Add New Address</Text>
              </TouchableOpacity>
            </View>
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
            <View>
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
                      <Text style={styles.paymentText}>{payment.title}</Text>
                      <View style={styles.cardBrand}>
                        <View style={styles.cardIndicator} />
                        <Text style={styles.brandText}>{payment.subtitle}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={handleAddPayment}>
                <MaterialIcons name="add" size={20} color={COLORS.primary} />
                <Text style={styles.addButtonText}>Add Payment Method</Text>
              </TouchableOpacity>
            </View>
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
          disabled={loading || cartLoading}
        >
          {loading || cartLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.checkoutButtonText}>£{total.toFixed(2)} Place Order</Text>
          )}
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
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 4,
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
