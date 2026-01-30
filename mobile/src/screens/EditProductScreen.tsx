import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { storeAPI } from '../utils/api';
import { getErrorMessage, getErrorTitle } from '../utils/errorMapper';

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const EditProductScreen = ({ navigation, route }) => {
  const { storeId, productId, product } = route.params;
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(String(product?.price ?? ''));
  const [category, setCategory] = useState(product?.category || '');
  const [codEnabled, setCodEnabled] = useState(
    typeof product?.paymentOptionsOverride?.codEnabled === 'boolean' ? product.paymentOptionsOverride.codEnabled : false
  );
  const [stripeEnabled, setStripeEnabled] = useState(
    typeof product?.paymentOptionsOverride?.stripeEnabled === 'boolean'
      ? product.paymentOptionsOverride.stripeEnabled
      : true
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !description || !price || !category) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await storeAPI.updateProduct(storeId, productId, {
        name,
        description,
        price: parseFloat(price),
        category,
        paymentOptionsOverride: {
          codEnabled,
          stripeEnabled,
        },
      });
      Alert.alert('Success', 'Product updated');
      navigation.goBack();
    } catch (e) {
      Alert.alert(
        getErrorTitle(e, 'Failed to update product'),
        getErrorMessage(e, 'Failed to update product')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Product</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Product name" placeholderTextColor={COLORS.gray} style={styles.input} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput value={description} onChangeText={setDescription} placeholder="Describe your product" placeholderTextColor={COLORS.gray} style={[styles.input, styles.textArea]} multiline />
        </View>
        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Price</Text>
            <TextInput value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={COLORS.gray} style={styles.input} />
          </View>
          <View style={{ width: 12 }} />
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Category</Text>
            <TextInput value={category} onChangeText={setCategory} placeholder="Category" placeholderTextColor={COLORS.gray} style={styles.input} />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.checkboxItem}
            onPress={() => setCodEnabled((v) => !v)}
            disabled={loading}
          >
            <MaterialIcons
              name={codEnabled ? 'check-circle' : 'check-circle-outline'}
              size={20}
              color={codEnabled ? COLORS.primary : COLORS.gray}
            />
            <Text style={styles.checkboxText}>Enable Cash on Delivery (COD)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.checkboxItem}
            onPress={() => setStripeEnabled((v) => !v)}
            disabled={loading}
          >
            <MaterialIcons
              name={stripeEnabled ? 'check-circle' : 'check-circle-outline'}
              size={20}
              color={stripeEnabled ? COLORS.primary : COLORS.gray}
            />
            <Text style={styles.checkboxText}>Enable Card Payment (Stripe)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={[styles.saveButton, loading && { opacity: 0.6 }]} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveText}>Save Changes</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.secondary },
  content: { padding: 16 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.secondary, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E7E7E7', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: COLORS.secondary },
  textArea: { height: 120, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  section: { borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
  checkboxItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checkboxText: { marginLeft: 12, fontSize: 14, color: COLORS.secondary },
  saveButton: { backgroundColor: COLORS.primary, margin: 16, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});

export default EditProductScreen;
