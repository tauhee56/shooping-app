import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [expandedSections, setExpandedSections] = useState({});
  const { toggleFavorite, isFavorite } = useFavorites();

  const handleAddToCart = () => {
    // In real app, add to cart context/API
    Alert.alert('Added to cart', `Added ${quantity} item(s) to cart`);
  };

  // Get product - in real app, fetch from API
  const product = {
    id: productId,
    name: 'Lavender Handmade Soap - 120g',
    store: 'Soap queen',
    price: 32,
    rating: 9,
    reviews: 32,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371',
    description: 'A natural lavender soap made with plant-based oils to soothe and moisturize the skin. You just lathered some well...see more',
    stock: 23,
    weight: '120g',
    ingredients: 'Lavender oil, Coconut oil, Palm oil, Shea butter, Water, Sodium hydroxide',
    benefits: 'Moisturizing, Soothing, Anti-inflammatory, Gentle on skin',
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const ExpandableSection = ({ title, icon, content }) => (
    <TouchableOpacity 
      style={styles.section}
      onPress={() => toggleSection(title)}
    >
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitle}>
          <MaterialIcons name={icon} size={20} color={COLORS.secondary} />
          <Text style={styles.sectionText}>{title}</Text>
        </View>
        <MaterialIcons 
          name={expandedSections[title] ? 'expand-less' : 'expand-more'} 
          size={24} 
          color={COLORS.gray} 
        />
      </View>
      {expandedSections[title] && (
        <View style={styles.sectionContent}>
          <Text style={styles.sectionContentText}>{content}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View style={styles.backButtonContainer}>
              <MaterialIcons name="arrow-back" size={20} color={COLORS.secondary} />
              <Text style={styles.backText}>Go back</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialIcons name="notifications-none" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          {/* Title and Price */}
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.storeName}>{product.store}</Text>
          <Text style={styles.price}>£{product.price}</Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={18} color="#FFD700" />
            <Text style={styles.rating}>{product.rating}</Text>
            <Text style={styles.reviews}>({product.reviews})</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>{product.description}</Text>

          {/* Stock Info */}
          <Text style={styles.stockInfo}>{product.stock} Left</Text>

          {/* Expandable Sections */}
          <View style={styles.sectionsContainer}>
            <ExpandableSection 
              title="Weight: size" 
              icon="scale" 
              content={product.weight}
            />
            <ExpandableSection 
              title="Ingredients List" 
              icon="list" 
              content={product.ingredients}
            />
            <ExpandableSection 
              title="Benefits & Features" 
              icon="favorite" 
              content={product.benefits}
            />
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <MaterialIcons name="shopping-cart" size={20} color={COLORS.white} />
            <Text style={styles.addToCartText}>Add to cart</Text>
          </TouchableOpacity>

          {/* Option Buttons */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={[styles.optionButton, styles.optionButtonPink]}
              onPress={() => toggleFavorite(product)}
            >
              <MaterialIcons name={isFavorite(productId) ? "favorite" : "favorite-border"} size={20} color={COLORS.white} />
              <Text style={styles.optionPrice}>£ 23</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionButton, styles.optionButtonWhite]}>
              <Text style={[styles.optionPrice, { color: COLORS.secondary }]}>£ 234</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionButton, styles.optionButtonWhite]}>
              <Text style={[styles.optionPrice, { color: COLORS.secondary }]}>£ 23</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionButton, styles.optionButtonYellow]}>
              <MaterialIcons name="star" size={20} color="#FFD700" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 12,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  storeName: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  reviews: {
    fontSize: 13,
    color: COLORS.gray,
  },
  description: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 20,
    marginBottom: 12,
  },
  stockInfo: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 20,
  },
  sectionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  section: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.light,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sectionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.secondary,
  },
  sectionContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  sectionContentText: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 20,
  },
  quantityContainer: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  quantityValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  addToCartButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  optionButtonPink: {
    backgroundColor: COLORS.primary,
  },
  optionButtonWhite: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionButtonYellow: {
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FFE5B4',
  },
  optionPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ProductDetailScreen;

