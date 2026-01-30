import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const AddPaymentMethodScreen = ({ navigation, route }) => {
  const isEditing = route?.params?.paymentId ? true : false;

  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleSavePayment = () => {
    Alert.alert('Coming soon', 'Stripe setup pending. Payment methods will be enabled once configured.', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
    return;

    if (!cardholderName.trim()) {
      Alert.alert('Error', 'Please enter cardholder name');
      return;
    }
    if (!cardNumber.trim() || cardNumber.length < 13) {
      Alert.alert('Error', 'Please enter valid card number');
      return;
    }
    if (!expiryDate.trim()) {
      Alert.alert('Error', 'Please enter expiry date (MM/YY)');
      return;
    }
    if (!cvv.trim() || cvv.length < 3) {
      Alert.alert('Error', 'Please enter valid CVV');
      return;
    }

    Alert.alert('Success', isEditing ? 'Payment method updated' : 'Payment method added', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const handleCardNumberChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryDateChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      const formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
      setExpiryDate(formatted);
    } else {
      setExpiryDate(cleaned);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Payment Method' : 'Add Payment Method'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cardPreview}>
          <View style={styles.card}>
            <Text style={styles.cardBrand}>VISA</Text>
            <Text style={styles.cardNumber}>
              {cardNumber ? cardNumber : '•••• •••• •••• ••••'}
            </Text>
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.cardLabel}>CARD HOLDER</Text>
                <Text style={styles.cardValue}>
                  {cardholderName || 'YOUR NAME'}
                </Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>EXPIRES</Text>
                <Text style={styles.cardValue}>
                  {expiryDate || 'MM/YY'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Cardholder Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter cardholder name"
            placeholderTextColor={COLORS.gray}
            value={cardholderName}
            onChangeText={setCardholderName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Card Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter card number"
            placeholderTextColor={COLORS.gray}
            keyboardType="number-pad"
            maxLength={19}
            value={cardNumber}
            onChangeText={handleCardNumberChange}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Expiry Date</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              placeholderTextColor={COLORS.gray}
              keyboardType="number-pad"
              maxLength={5}
              value={expiryDate}
              onChangeText={handleExpiryDateChange}
            />
          </View>

          <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={styles.input}
              placeholder="CVV"
              placeholderTextColor={COLORS.gray}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry={true}
              value={cvv}
              onChangeText={setCvv}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsDefault(!isDefault)}
        >
          <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
            {isDefault && (
              <MaterialIcons name="check" size={16} color={COLORS.white} />
            )}
          </View>
          <Text style={styles.checkboxLabel}>Set as default payment method</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSavePayment}
        >
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Update Payment' : 'Add Payment'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cardPreview: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
  },
  cardBrand: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 20,
  },
  cardNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 2,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.secondary,
    backgroundColor: COLORS.white,
  },
  row: {
    flexDirection: 'row',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    backgroundColor: COLORS.white,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default AddPaymentMethodScreen;
