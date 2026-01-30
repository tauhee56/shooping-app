import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { addressAPI } from '../utils/api';
import { getErrorMessage } from '../utils/errorMapper';

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const AddressesScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapAddress = (a: any) => {
    return {
      id: String(a?._id || a?.id || ''),
      type: a?.type || 'Home',
      name: a?.fullName || a?.name || '',
      phone: a?.phone || '',
      address: a?.street || a?.address || '',
      city: a?.city || '',
      postcode: a?.zip || a?.postcode || '',
      country: a?.country || '',
      isDefault: !!a?.isDefault,
      raw: a,
    };
  };

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await addressAPI.getMyAddresses();
      const list = Array.isArray(res.data) ? res.data : [];
      setAddresses(list.map(mapAddress).filter((x: any) => !!x.id));
    } catch (e: any) {
      setAddresses([]);
      setError(getErrorMessage(e, 'Failed to load addresses'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
    const unsub = navigation.addListener('focus', () => {
      loadAddresses();
    });
    return unsub;
  }, [navigation]);

  const setDefaultAddress = (id) => {
    const prev = addresses;
    setAddresses((xs) => xs.map((addr) => ({ ...addr, isDefault: addr.id === id })));
    (async () => {
      try {
        await addressAPI.setDefault(String(id));
      } catch (e: any) {
        setAddresses(prev);
        setError(getErrorMessage(e, 'Failed to set default address'));
      }
    })();
  };

  const deleteAddress = (id) => {
    const prev = addresses;
    setAddresses(addresses.filter((addr) => addr.id !== id));
    (async () => {
      try {
        await addressAPI.deleteAddress(String(id));
        await loadAddresses();
      } catch (e: any) {
        setAddresses(prev);
        setError(getErrorMessage(e, 'Failed to delete address'));
      }
    })();
  };

  const renderAddress = ({ item }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.typeContainer}>
          <MaterialIcons
            name={item.type === 'Home' ? 'home' : 'work'}
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.addressType}>{item.type}</Text>
        </View>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>

      <Text style={styles.addressName}>{item.name}</Text>
      <Text style={styles.addressPhone}>{item.phone}</Text>
      <Text style={styles.addressText}>
        {item.address}, {item.city}
      </Text>
      <Text style={styles.addressText}>
        {item.postcode}, {item.country}
      </Text>

      <View style={styles.addressActions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setDefaultAddress(item.id)}
          >
            <MaterialIcons name="check-circle-outline" size={18} color={COLORS.primary} />
            <Text style={styles.actionText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddAddress', { addressId: item.id, address: item.raw || item })}
        >
          <MaterialIcons name="edit" size={18} color={COLORS.secondary} />
          <Text style={[styles.actionText, { color: COLORS.secondary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteAddress(item.id)}
        >
          <MaterialIcons name="delete-outline" size={18} color="#FF3B30" />
          <Text style={[styles.actionText, { color: '#FF3B30' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading && addresses.length === 0 ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator />
          <Text style={styles.stateText}>Loading...</Text>
        </View>
      ) : error && addresses.length === 0 ? (
        <View style={styles.stateContainer}>
          <MaterialIcons name="error-outline" size={56} color={COLORS.gray} />
          <Text style={styles.stateTitle}>Unable to load addresses</Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAddresses}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderAddress}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.addressesList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddAddress')}
      >
        <MaterialIcons name="add" size={24} color={COLORS.white} />
        <Text style={styles.addButtonText}>Add New Address</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  stateTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
    textAlign: 'center',
  },
  stateText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.gray,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '600',
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
  addressesList: {
    padding: 15,
  },
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressType: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primary,
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

export default AddressesScreen;
