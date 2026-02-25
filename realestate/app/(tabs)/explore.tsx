import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Image, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useListingStore } from '@/store/listingStore';
import { Listing, PropertyType } from '@/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Nashik'];
const TYPES = [
  { id: PropertyType.APARTMENT, label: 'Apartment', emoji: '🏢' },
  { id: PropertyType.LAND, label: 'Land', emoji: '🌳' },
  { id: PropertyType.VILLA, label: 'Villa', emoji: '🏡' },
  { id: PropertyType.COMMERCIAL, label: 'Commercial', emoji: '🏬' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First', emoji: '🕐' },
  { id: 'area-high', label: 'Area (High to Low)', emoji: '📏' },
  { id: 'area-low', label: 'Area (Low to High)', emoji: '📐' },
  { id: 'city-az', label: 'City (A-Z)', emoji: '🔤' },
  { id: 'type', label: 'Property Type', emoji: '🏠' },
];

function formatPrice(price: number) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function ExploreScreen() {
  const { listings, fetchListings } = useListingStore();
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null);
  const [selectedSort, setSelectedSort] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchListings(); }, []);

  const filtered = (listings || []).filter((l) => {
    const matchQuery = !query || l.title.toLowerCase().includes(query.toLowerCase())
      || l.location.city.toLowerCase().includes(query.toLowerCase());
    const matchCity = !selectedCity || l.location.city === selectedCity;
    const matchType = !selectedType || l.propertyType === selectedType;
    return matchQuery && matchCity && matchType;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (selectedSort) {
      case 'area-high':
        return b.area - a.area;
      case 'area-low':
        return a.area - b.area;
      case 'city-az':
        return a.location.city.localeCompare(b.location.city);
      case 'type':
        return a.propertyType.localeCompare(b.propertyType);
      case 'newest':
      default:
        return 0; // Keep original order (newest first)
    }
  });

  const activeFiltersCount = [selectedCity, selectedType].filter(Boolean).length;

  const clearFilters = () => { setSelectedCity(null); setSelectedType(null); };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.count}>{filtered.length} properties</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search city, title…"
            placeholderTextColor={Colors.textMuted}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, activeFiltersCount > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilters((p) => !p)}
        >
          <Text style={styles.filterBtnIcon}>⚙️</Text>
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortBtn, selectedSort !== 'newest' && styles.sortBtnActive]}
          onPress={() => setShowFilters((p) => !p)}
        >
          <Text style={styles.sortBtnIcon}>📊</Text>
        </TouchableOpacity>
      </View>

      {/* Expanded Filters */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filters</Text>
            {activeFiltersCount > 0 && (
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearAll}>Clear all</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.filterLabel}>PROPERTY TYPE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} scrollEventThrottle={16} decelerationRate="fast">
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.filterChip, selectedType === t.id && styles.filterChipActive]}
                onPress={() => setSelectedType(selectedType === t.id ? null : t.id)}
              >
                <Text>{t.emoji}</Text>
                <Text style={[styles.filterChipText, selectedType === t.id && styles.filterChipTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filterLabel}>CITY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} scrollEventThrottle={16} decelerationRate="fast">
            {CITIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.filterChip, selectedCity === c && styles.filterChipActive]}
                onPress={() => setSelectedCity(selectedCity === c ? null : c)}
              >
                <Text style={[styles.filterChipText, selectedCity === c && styles.filterChipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filterLabel}>SORT BY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} scrollEventThrottle={16} decelerationRate="fast">
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.filterChip, selectedSort === option.id && styles.filterChipActive]}
                onPress={() => setSelectedSort(selectedSort === option.id ? 'newest' : option.id)}
              >
                <Text>{option.emoji}</Text>
                <Text style={[styles.filterChipText, selectedSort === option.id && styles.filterChipTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results */}
      <FlatList
        data={sorted}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="normal"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultCard}
            activeOpacity={0.9}
            onPress={() => router.push(`/buyer/listing-details/${item.id}`)}
          >
            <Image source={{ uri: item.images[0] }} style={styles.resultImg} />
            <View style={styles.resultBody}>
              <View style={styles.resultTop}>
                <View style={styles.resultTypeBadge}>
                  <Text style={styles.resultTypeTxt}>{item.propertyType}</Text>
                </View>
                <Text style={styles.resultCity}>{item.location.city}</Text>
              </View>
              <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.resultPrice}>Contact for Price</Text>
              <Text style={styles.resultArea}>{item.area} {item.areaUnit}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔎</Text>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  title: { ...Typography.h1, color: Colors.text },
  count: { ...Typography.body, color: Colors.textSecondary },
  searchRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.lg,
    gap: 10, marginBottom: Spacing.sm,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, height: 50,
    borderWidth: 1.5, borderColor: Colors.border, ...Shadow.sm,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, ...Typography.body, color: Colors.text },
  clearText: { fontSize: 14, color: Colors.textMuted, padding: 4 },
  filterBtn: {
    width: 50, height: 50, borderRadius: Radius.md,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', ...Shadow.sm,
  },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterBtnIcon: { fontSize: 20 },
  sortBtn: {
    width: 50, height: 50, borderRadius: Radius.md,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', ...Shadow.sm,
  },
  sortBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  sortBtnIcon: { fontSize: 20 },
  filterBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  filterBadgeText: { ...Typography.caption, color: Colors.white, fontSize: 10 },
  filtersPanel: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  filterTitle: { ...Typography.h4, color: Colors.text },
  clearAll: { ...Typography.bodySmall, color: Colors.accent, fontWeight: '600' },
  filterLabel: { ...Typography.label, color: Colors.textMuted, marginBottom: 8, marginTop: 8 },
  filterRow: { marginBottom: 4 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.background, marginRight: 8,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 14, color: Colors.black, fontWeight: '700' },
  filterChipTextActive: { fontSize: 14, color: '#FFFFFF', fontWeight: '700' },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  resultCard: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderRadius: Radius.lg, marginBottom: Spacing.sm,
    overflow: 'hidden', ...Shadow.sm,
  },
  resultImg: { width: 110, height: 110 },
  resultBody: { flex: 1, padding: Spacing.md },
  resultTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  resultTypeBadge: {
    backgroundColor: Colors.accentSoft, borderRadius: Radius.sm,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  resultTypeTxt: { ...Typography.caption, color: Colors.accent, fontWeight: '700' },
  resultCity: { ...Typography.caption, color: Colors.textMuted },
  resultTitle: { ...Typography.bodySmall, color: Colors.text, fontWeight: '600', marginBottom: 6 },
  resultPrice: { ...Typography.h4, color: Colors.accent },
  resultArea: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { ...Typography.h3, color: Colors.text },
  emptySubtitle: { ...Typography.body, color: Colors.textSecondary },
});