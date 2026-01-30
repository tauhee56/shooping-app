import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { orderAPI } from '../utils/api';
import { getErrorMessage } from '../utils/errorMapper';

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const OrderDetailScreen = ({ navigation, route }: any) => {
  const orderId = route?.params?.orderId || route?.params?.order?._id || route?.params?.order?.id;
  const initialOrder = route?.params?.order;

  const [order, setOrder] = useState<any | null>(initialOrder || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidImageUri = (uri: any) => typeof uri === 'string' && uri.trim().length > 0;

  const getStoreName = (store: any): string => {
    if (!store) return '';
    if (typeof store === 'string') return store;
    if (typeof store === 'object') return store?.name || '';
    return '';
  };

  const formatDate = (input?: any) => {
    const d = input ? new Date(input) : null;
    if (!d || Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const toOrderNumber = (o: any) => {
    const id = String(o?._id || o?.id || '');
    const suffix = id ? id.slice(-4).toUpperCase() : '0000';
    const d = o?.createdAt ? new Date(o.createdAt) : null;
    const year = d && !Number.isNaN(d.getTime()) ? d.getFullYear() : new Date().getFullYear();
    return `ORD-${year}-${suffix}`;
  };

  const mapStatus = (statusRaw?: string) => {
    const status = (statusRaw || '').toLowerCase();
    switch (status) {
      case 'delivered':
        return { label: 'Delivered', color: '#4CAF50' };
      case 'shipped':
        return { label: 'In Transit', color: '#FF9800' };
      case 'confirmed':
      case 'pending':
        return { label: 'Processing', color: '#2196F3' };
      case 'cancelled':
        return { label: 'Cancelled', color: '#F44336' };
      default:
        return { label: 'Processing', color: '#2196F3' };
    }
  };

  const mappedOrder = useMemo(() => {
    if (!order) return null;

    const statusInfo = mapStatus(order?.status || order?.rawStatus);
    const items = Array.isArray(order?.items) ? order.items : [];
    const createdAt = order?.createdAt;

    return {
      id: String(order?._id || order?.id || ''),
      orderNumber: order?.orderNumber || toOrderNumber(order),
      date: order?.date || formatDate(createdAt),
      status: order?.statusColor ? order?.status : statusInfo.label,
      statusColor: order?.statusColor || statusInfo.color,
      total: typeof order?.totalAmount === 'number' ? order.totalAmount : typeof order?.total === 'number' ? order.total : Number(order?.totalAmount || order?.total || 0),
      deliveryAddress: order?.deliveryAddress,
      items: items.map((it: any) => {
        const p = it?.product;
        const src = p || it;
        const storeName = getStoreName(src?.store);
        return {
          name: src?.name || it?.name || 'Product',
          store: it?.store || storeName,
          image:
            it?.image ||
            (Array.isArray(src?.images) && src.images[0]) ||
            src?.image ||
            '',
          quantity: typeof it?.quantity === 'number' ? it.quantity : Number(it?.quantity || 1),
        };
      }),
    };
  }, [order]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!orderId) return;
      setLoading(true);
      setError(null);

      try {
        const res = await orderAPI.getOrderById(orderId);
        if (cancelled) return;
        setOrder(res.data);
      } catch (e: any) {
        if (cancelled) return;
        setError(getErrorMessage(e, 'Failed to load order'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const formatDateTime = (input?: any) => {
    const d = input ? new Date(input) : null;
    if (!d || Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const timeline = useMemo(() => {
    const history = Array.isArray((order as any)?.statusHistory) ? (order as any).statusHistory : [];
    const historyMap = new Map<string, string>();

    for (const h of history) {
      const key = String(h?.status || '').toLowerCase();
      const val = formatDateTime(h?.at);
      if (key && val) historyMap.set(key, val);
    }

    const hasHistory = historyMap.size > 0;
    const statusRaw = (order?.status || order?.rawStatus || '').toLowerCase();
    const delivered = statusRaw === 'delivered';
    const shipped = statusRaw === 'shipped' || delivered;
    const processing = statusRaw === 'confirmed' || statusRaw === 'pending' || shipped;

    const placedDate = hasHistory ? (historyMap.get('pending') || mappedOrder?.date || '') : (mappedOrder?.date || '');
    const processingDate = hasHistory ? (historyMap.get('confirmed') || historyMap.get('pending') || mappedOrder?.date || '') : (mappedOrder?.date || '');
    const shippedDate = hasHistory ? (historyMap.get('shipped') || mappedOrder?.date || '') : (mappedOrder?.date || '');
    const deliveredDate = hasHistory ? (historyMap.get('delivered') || mappedOrder?.date || '') : (mappedOrder?.date || '');

    return [
      { status: 'Order Placed', date: placedDate, completed: true },
      { status: 'Processing', date: processing ? processingDate : 'Pending', completed: processing },
      { status: 'Shipped', date: shipped ? shippedDate : 'Pending', completed: shipped },
      { status: 'Out for Delivery', date: delivered ? deliveredDate : 'Pending', completed: delivered },
      { status: 'Delivered', date: delivered ? deliveredDate : 'Pending', completed: delivered },
    ];
  }, [mappedOrder?.date, order]);

  const address = mappedOrder?.deliveryAddress;
  const addressName = typeof address === 'object' && address?.fullName ? address.fullName : '';
  const addressPhone = typeof address === 'object' && address?.phone ? address.phone : '';
  const addressLine1 = typeof address === 'object'
    ? [address?.street, address?.city].filter(Boolean).join(', ')
    : '';
  const addressLine2 = typeof address === 'object'
    ? [address?.state, address?.zip, address?.country].filter(Boolean).join(', ')
    : '';

  if (loading && !mappedOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !mappedOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: COLORS.secondary, fontWeight: '600', fontSize: 16, marginBottom: 10 }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={async () => {
              if (!orderId) return;
              setLoading(true);
              setError(null);
              try {
                const res = await orderAPI.getOrderById(orderId);
                setOrder(res.data);
              } catch (e: any) {
                setError(getErrorMessage(e, 'Failed to load order'));
              } finally {
                setLoading(false);
              }
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

  if (!mappedOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: COLORS.secondary, fontWeight: '600', fontSize: 16 }}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Info */}
        <View style={styles.section}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>{mappedOrder.orderNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: mappedOrder.statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: mappedOrder.statusColor }]}>{mappedOrder.status}</Text>
            </View>
          </View>
          <Text style={styles.orderDate}>Placed on {mappedOrder.date}</Text>
        </View>

        {/* Tracking Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Tracking</Text>
          <View style={styles.timeline}>
            {timeline.map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, item.completed && styles.timelineDotActive]}>
                    {item.completed && <MaterialIcons name="check" size={16} color={COLORS.white} />}
                  </View>
                  {index < timeline.length - 1 && (
                    <View style={[styles.timelineLine, item.completed && styles.timelineLineActive]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineStatus, item.completed && styles.timelineStatusActive]}>
                    {item.status}
                  </Text>
                  <Text style={styles.timelineDate}>{item.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items ({mappedOrder.items.length})</Text>
          {mappedOrder.items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemStore}>{item.store}</Text>
                <Text style={styles.itemQty}>Quantity: {item.quantity}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressCard}>
            <MaterialIcons name="location-on" size={24} color={COLORS.primary} />
            <View style={styles.addressText}>
              <Text style={styles.addressName}>{addressName || ' '}</Text>
              <Text style={styles.addressDetails}>{addressLine1 || ' '}</Text>
              <Text style={styles.addressDetails}>{addressLine2 || ' '}</Text>
              <Text style={styles.addressPhone}>{addressPhone || ' '}</Text>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>£{(mappedOrder.total - 5.99).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>£5.99</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>£0.00</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>£{mappedOrder.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="help-outline" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Need Help?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryActionButton]}>
            <MaterialIcons name="receipt" size={20} color={COLORS.secondary} />
            <Text style={[styles.actionButtonText, styles.secondaryActionButtonText]}>Download Invoice</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: 20,
    marginTop: 10,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    color: COLORS.gray,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 15,
  },
  timeline: {
    paddingLeft: 5,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 15,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.light,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
  },
  timelineLineActive: {
    backgroundColor: COLORS.primary,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineStatus: {
    fontSize: 15,
    color: COLORS.gray,
    marginBottom: 4,
  },
  timelineStatusActive: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  timelineDate: {
    fontSize: 13,
    color: COLORS.gray,
  },
  itemCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: COLORS.light,
  },
  itemInfo: {
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
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 13,
    color: COLORS.gray,
  },
  addressCard: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: COLORS.light,
    borderRadius: 12,
  },
  addressText: {
    flex: 1,
    marginLeft: 12,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 6,
  },
  addressDetails: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 3,
  },
  addressPhone: {
    fontSize: 14,
    color: COLORS.secondary,
    marginTop: 6,
  },
  summaryCard: {
    backgroundColor: COLORS.light,
    padding: 15,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  actions: {
    padding: 20,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  secondaryActionButton: {
    backgroundColor: COLORS.light,
  },
  secondaryActionButtonText: {
    color: COLORS.secondary,
  },
});

export default OrderDetailScreen;
