import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const NotificationsScreen = ({ navigation }) => {
  const [notifications] = useState([
    {
      id: '1',
      type: 'order',
      icon: 'local-shipping',
      title: 'Order Delivered',
      message: 'Your order #ORD-2024-1234 has been delivered successfully',
      time: '2 hours ago',
      read: false,
      color: '#4CAF50',
    },
    {
      id: '2',
      type: 'promo',
      icon: 'local-offer',
      title: 'New Discount Available',
      message: 'Get 30% off on all handmade products this weekend!',
      time: '5 hours ago',
      read: false,
      color: COLORS.primary,
    },
    {
      id: '3',
      type: 'message',
      icon: 'message',
      title: 'New Message from Soap Queen',
      message: 'Hi! Thanks for your interest in our products...',
      time: '1 day ago',
      read: true,
      color: '#2196F3',
    },
    {
      id: '4',
      type: 'order',
      icon: 'inventory',
      title: 'Order Processing',
      message: 'Your order #ORD-2024-1233 is being prepared',
      time: '1 day ago',
      read: true,
      color: '#FF9800',
    },
    {
      id: '5',
      type: 'favorite',
      icon: 'favorite',
      title: 'Price Drop Alert',
      message: 'Natural Body Oil is now £19.99 (was £24.99)',
      time: '2 days ago',
      read: true,
      color: '#E91E63',
    },
    {
      id: '6',
      type: 'review',
      icon: 'star',
      title: 'Leave a Review',
      message: 'How was your experience with Lavender Soap?',
      time: '3 days ago',
      read: true,
      color: '#FFD700',
    },
  ]);

  const [unreadCount] = useState(
    notifications.filter((n) => !n.read).length
  );

  const renderNotification = ({ item }) => (
    <TouchableOpacity style={[styles.notificationCard, !item.read && styles.unreadCard]}>
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <MaterialIcons name={item.icon} size={24} color={item.color} />
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>
            You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
        showsVerticalScrollIndicator={false}
      />
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
    flex: 1,
    textAlign: 'center',
  },
  markAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  unreadBanner: {
    backgroundColor: COLORS.primary + '15',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary + '30',
  },
  unreadBannerText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  notificationsList: {
    padding: 15,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.gray,
  },
});

export default NotificationsScreen;
