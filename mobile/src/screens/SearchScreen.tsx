import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#FF6B9D',
  secondary: '#4A4E69',
  light: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
};

const SearchScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState(['Handmade soap', 'Candles', 'Natural oil', 'Ceramic bowls']);
  
  const handleClearAll = () => {
    setRecentSearches([]);
  };
  
  const handleSearch = (query) => {
    setSearchText(query);
    // Add to recent if not empty and not already there
    if (query && !recentSearches.includes(query)) {
      setRecentSearches([query, ...recentSearches.slice(0, 4)]);
    }
  };

  const handleCategoryPress = (category) => {
    handleSearch(category.name);
  };
  
  const trendingSearches = [
    { id: '1', text: 'Christmas gifts', count: '2.3k' },
    { id: '2', text: 'Skincare products', count: '1.8k' },
    { id: '3', text: 'Home decor', count: '1.5k' },
    { id: '4', text: 'Handmade jewelry', count: '1.2k' },
  ];

  const popularCategories = [
    { id: '1', name: 'Soaps', icon: '🧼', color: '#FFE5EC' },
    { id: '2', name: 'Candles', icon: '🕯️', color: '#FFF4E5' },
    { id: '3', name: 'Skincare', icon: '🧴', color: '#E5F4FF' },
    { id: '4', name: 'Jewelry', icon: '💍', color: '#F0E5FF' },
    { id: '5', name: 'Ceramics', icon: '🏺', color: '#E5FFF0' },
    { id: '6', name: 'Textiles', icon: '🧵', color: '#FFE5F5' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={22} color={COLORS.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products, stores..."
          placeholderTextColor={COLORS.gray}
          value={searchText}
          onChangeText={setSearchText}
          autoFocus
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <MaterialIcons name="close" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Recent Searches */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={styles.clearText}>Clear all</Text>
            </TouchableOpacity>
          </View>
          {recentSearches.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.recentItem}
              onPress={() => handleSearch(item)}
            >
              <MaterialIcons name="history" size={20} color={COLORS.gray} />
              <Text style={styles.recentText}>{item}</Text>
              <MaterialIcons name="north-west" size={18} color={COLORS.gray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Trending */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending</Text>
          {trendingSearches.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.trendingItem}
              onPress={() => handleSearch(item.text)}
            >
              <View style={styles.trendingLeft}>
                <MaterialIcons name="trending-up" size={20} color={COLORS.primary} />
                <Text style={styles.trendingText}>{item.text}</Text>
              </View>
              <Text style={styles.trendingCount}>{item.count} searches</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Categories</Text>
          <View style={styles.categoriesGrid}>
            {popularCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: category.color }]}
                onPress={() => handleCategoryPress(category)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: COLORS.light,
    borderRadius: 25,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.secondary,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 15,
  },
  clearText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  recentText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.secondary,
  },
  trendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  trendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trendingText: {
    fontSize: 15,
    color: COLORS.secondary,
  },
  trendingCount: {
    fontSize: 13,
    color: COLORS.gray,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 64) / 3,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
  },
});

export default SearchScreen;
