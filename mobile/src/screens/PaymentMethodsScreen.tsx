import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const PaymentMethodsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.emptyState}>
        <MaterialIcons name="payment" size={64} color={COLORS.gray} />
        <Text style={styles.emptyTitle}>Stripe setup pending</Text>
        <Text style={styles.emptyText}>Payment methods will be available once Stripe is configured.</Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddPaymentMethod')}
      >
        <MaterialIcons name="add-card" size={24} color={COLORS.white} />
        <Text style={styles.addButtonText}>Add New Card</Text>
      </TouchableOpacity>
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
  paymentList: {
    padding: 15,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 18,
  },
  paymentCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  cardChip: {
    width: 45,
    height: 35,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  defaultBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 2,
    marginBottom: 25,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  cardHolder: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  cardExpiry: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.white,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    margin: 15,
    paddingVertical: 15,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default PaymentMethodsScreen;
