import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { storeAPI } from '../utils/api';

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const EditStoreScreen = ({ navigation, route }) => {
  const { store } = route.params;
  const [name, setName] = useState(store?.name || '');
  const [description, setDescription] = useState(store?.description || '');
  const [location, setLocation] = useState(store?.location || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !description || !location) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await storeAPI.updateStore(store._id, { name, description, location });
      Alert.alert('Success', 'Store updated');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update store');
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
        <Text style={styles.headerTitle}>Edit Store</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Store name" placeholderTextColor={COLORS.gray} style={styles.input} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput value={description} onChangeText={setDescription} placeholder="Describe your store" placeholderTextColor={COLORS.gray} style={[styles.input, styles.textArea]} multiline />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput value={location} onChangeText={setLocation} placeholder="City, Country" placeholderTextColor={COLORS.gray} style={styles.input} />
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
  saveButton: { backgroundColor: COLORS.primary, margin: 16, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});

export default EditStoreScreen;
