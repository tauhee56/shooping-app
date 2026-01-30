import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const FilterModal = ({ navigation, route }) => {
  const { onApply } = route.params || {};
  
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [sortBy, setSortBy] = useState(null);

  const categories = [
    'Soap & Bath',
    'Skincare',
    'Candles',
    'Home Decor',
    'Jewelry',
    'Accessories',
    'Art & Crafts',
    'Food & Drinks',
  ];

  const sortOptions = [
    { id: 'popular', label: 'Most Popular', icon: 'trending-up' },
    { id: 'price-low', label: 'Price: Low to High', icon: 'arrow-upward' },
    { id: 'price-high', label: 'Price: High to Low', icon: 'arrow-downward' },
    { id: 'rating', label: 'Highest Rated', icon: 'star' },
    { id: 'newest', label: 'Newest First', icon: 'fiber-new' },
  ];

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleApply = () => {
    const filters = {
      priceRange,
      categories: selectedCategories,
      rating: selectedRating,
      sortBy,
    };
    if (onApply) {
      onApply(filters);
    }
    navigation.goBack();
  };

  const handleReset = () => {
    setPriceRange([0, 100]);
    setSelectedCategories([]);
    setSelectedRating(null);
    setSortBy(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filter & Sort</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          <View style={styles.priceRangeContainer}>
            <Text style={styles.priceValue}>£{priceRange[0]}</Text>
            <Text style={styles.priceValue}>£{priceRange[1]}</Text>
          </View>
          <View style={styles.priceOptions}>
            {['0-25', '25-50', '50-75', '75-100', '100+'].map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.priceChip,
                  range === '50-75' && styles.selectedChip,
                ]}
                onPress={() => {
                  const [min, max] = range.split('-').map(v => v === '100+' ? 100 : parseInt(v));
                  setPriceRange([min, max || 100]);
                }}
              >
                <Text
                  style={[
                    styles.priceChipText,
                    range === '50-75' && styles.selectedChipText,
                  ]}
                >
                  £{range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sort By */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sort By</Text>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortOption,
                sortBy === option.id && styles.selectedOption,
              ]}
              onPress={() => setSortBy(option.id)}
            >
              <View style={styles.sortLeft}>
                <MaterialIcons
                  name={option.icon as any}
                  size={20}
                  color={sortBy === option.id ? COLORS.primary : COLORS.gray}
                />
                <Text
                  style={[
                    styles.sortLabel,
                    sortBy === option.id && styles.selectedText,
                  ]}
                >
                  {option.label}
                </Text>
              </View>
              {sortBy === option.id && (
                <MaterialIcons name="check" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategories.includes(category) && styles.selectedChip,
                ]}
                onPress={() => toggleCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategories.includes(category) && styles.selectedChipText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minimum Rating</Text>
          <View style={styles.ratingContainer}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[
                  styles.ratingOption,
                  selectedRating === rating && styles.selectedRatingOption,
                ]}
                onPress={() => setSelectedRating(rating)}
              >
                {[...Array(rating)].map((_, i) => (
                  <MaterialIcons
                    key={i}
                    name="star"
                    size={18}
                    color={selectedRating === rating ? COLORS.primary : '#FFD700'}
                  />
                ))}
                <Text style={styles.ratingText}>& up</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  resetText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '500',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 15,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  priceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  priceChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: COLORS.white,
  },
  priceChipText: {
    fontSize: 13,
    color: COLORS.secondary,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedOption: {
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 12,
    marginHorizontal: -12,
    borderRadius: 8,
  },
  sortLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortLabel: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  selectedText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: COLORS.white,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 13,
    color: COLORS.secondary,
  },
  selectedChipText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  ratingContainer: {
    gap: 10,
  },
  ratingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 5,
  },
  selectedRatingOption: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 5,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default FilterModal;
