import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { orderAPI } from '../utils/api';
import { getErrorMessage } from '../utils/errorMapper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const OrdersScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('All');

  const [orders, setOrders] = useState<any[]>([]);
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

  const toOrderNumber = (order: any) => {
    const id = String(order?._id || order?.id || '');
    const suffix = id ? id.slice(-4).toUpperCase() : '0000';
    const d = order?.createdAt ? new Date(order.createdAt) : null;
    const year = d && !Number.isNaN(d.getTime()) ? d.getFullYear() : new Date().getFullYear();
    return `ORD-${year}-${suffix}`;
  };

  const mapStatus = (statusRaw?: string) => {
    const status = (statusRaw || '').toLowerCase();
    switch (status) {
      case 'delivered':
        return { label: 'Delivered', color: '#4CAF50', tab: 'Delivered' };
      case 'shipped':
        return { label: 'In Transit', color: '#FF9800', tab: 'Processing' };
      case 'confirmed':
        return { label: 'Processing', color: '#2196F3', tab: 'Processing' };
      case 'pending':
        return { label: 'Processing', color: '#2196F3', tab: 'Processing' };
      case 'cancelled':
        return { label: 'Cancelled', color: '#F44336', tab: 'All' };
      default:
        return { label: 'Processing', color: '#2196F3', tab: 'Processing' };
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderAPI.getMyOrders();
      const apiOrders = Array.isArray(res.data) ? res.data : [];

      const mapped = apiOrders.map((o: any) => {
        const statusInfo = mapStatus(o?.status);
        const items = Array.isArray(o?.items) ? o.items : [];

        return {
          id: String(o?._id || ''),
          orderId: String(o?._id || ''),
          orderNumber: toOrderNumber(o),
          date: formatDate(o?.createdAt),
          status: statusInfo.label,
          statusColor: statusInfo.color,
          total: typeof o?.totalAmount === 'number' ? o.totalAmount : Number(o?.totalAmount || 0),
          rawStatus: o?.status,
          tab: statusInfo.tab,
          deliveryAddress: o?.deliveryAddress,
          items: items.map((it: any) => {
            const p = it?.product;
            const storeName = getStoreName(p?.store);

            const image =
              (p && Array.isArray(p?.images) && p.images[0]) ||
              (p && p?.image) ||
              '';

            return {
              name: p?.name || 'Product',
              store: storeName,
              image,
              quantity: typeof it?.quantity === 'number' ? it.quantity : Number(it?.quantity || 1),
            };
          }),
        };
      });

      setOrders(mapped.filter((o: any) => !!o?.id));
    } catch (e: any) {
      setOrders([]);
      setError(getErrorMessage(e, 'Failed to load orders'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      await loadOrders();
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    if (selectedTab === 'All') return orders;
    if (selectedTab === 'Delivered') return orders.filter((o) => o?.tab === 'Delivered');
    if (selectedTab === 'Processing') return orders.filter((o) => o?.tab === 'Processing');
    return orders;
  }, [orders, selectedTab]);

  const renderOrder = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item.orderId, order: item })}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {item.items.map((product, index) => (
          <View key={index} style={styles.orderItem}>
            {isValidImageUri(product.image) ? (
              <Image source={{ uri: product.image }} style={styles.orderItemImage} />
            ) : (
              <View style={styles.orderItemImage} />
            )}
            <View style={styles.orderItemInfo}>
              <Text style={styles.orderItemName} numberOfLines={1}>{product.name}</Text>
              <Text style={styles.orderItemStore}>{product.store}</Text>
              <Text style={styles.orderItemQty}>Qty: {product.quantity}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalAmount}>£{item.total.toFixed(2)}</Text>
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Track Order</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabs}>
        {['All', 'Processing', 'Delivered'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error && orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: COLORS.secondary, fontWeight: '600', fontSize: 16, marginBottom: 10 }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={loadOrders}
            style={{ paddingVertical: 10, paddingHorizontal: 16, backgroundColor: COLORS.secondary, borderRadius: 10 }}
          >
            <Text style={{ color: COLORS.white, fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
    backgroundColor: COLORS.white,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.light,
  },
  tabActive: {
    backgroundColor: COLORS.secondary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.white,
  },
  ordersList: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: COLORS.gray,
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
  orderItems: {
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  orderItemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: COLORS.light,
  },
  orderItemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 3,
  },
  orderItemStore: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 3,
  },
  orderItemQty: {
    fontSize: 12,
    color: COLORS.gray,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.light,
  },
  secondaryButtonText: {
    color: COLORS.secondary,
  },
});

export default OrdersScreen;
