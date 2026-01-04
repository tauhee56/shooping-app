import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const OrderDetailScreen = ({ navigation, route }) => {
  const order = route.params?.order || {
    orderNumber: 'ORD-2024-001',
    date: 'Dec 26, 2024',
    status: 'Delivered',
    statusColor: '#4CAF50',
    total: 87.97,
    items: [],
  };

  const timeline = [
    { status: 'Order Placed', date: 'Dec 26, 10:30 AM', completed: true },
    { status: 'Processing', date: 'Dec 26, 2:45 PM', completed: true },
    { status: 'Shipped', date: 'Dec 27, 9:00 AM', completed: true },
    { status: 'Out for Delivery', date: 'Dec 28, 8:15 AM', completed: order.status === 'Delivered' },
    { status: 'Delivered', date: order.status === 'Delivered' ? 'Dec 28, 2:30 PM' : 'Pending', completed: order.status === 'Delivered' },
  ];

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
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: order.statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: order.statusColor }]}>{order.status}</Text>
            </View>
          </View>
          <Text style={styles.orderDate}>Placed on {order.date}</Text>
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
          <Text style={styles.sectionTitle}>Order Items ({order.items.length})</Text>
          {order.items.map((item, index) => (
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
              <Text style={styles.addressName}>John Doe</Text>
              <Text style={styles.addressDetails}>123 Main Street, Apartment 4B</Text>
              <Text style={styles.addressDetails}>London, W1A 1AA, United Kingdom</Text>
              <Text style={styles.addressPhone}>+44 20 1234 5678</Text>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>£{(order.total - 5.99).toFixed(2)}</Text>
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
              <Text style={styles.totalValue}>£{order.total.toFixed(2)}</Text>
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
