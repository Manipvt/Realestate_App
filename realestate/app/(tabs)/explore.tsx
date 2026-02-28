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
import { useTheme } from '@/hooks/use-theme-color';

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
  const colors = useTheme();
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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Explore</Text>
        <Text style={[styles.count, { color: colors.textSecondary }]}>{filtered.length} properties</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search city, title…"
            placeholderTextColor={colors.textMuted}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={[styles.clearText, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.filterBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
            activeFiltersCount > 0 && { backgroundColor: colors.primary, borderColor: colors.primary }
          ]}
          onPress={() => setShowFilters((p) => !p)}
        >
          <Text style={styles.filterBtnIcon}>⚙️</Text>
          {activeFiltersCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: colors.accent }]}>
              <Text style={[styles.filterBadgeText, { color: colors.white }]}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
            selectedSort !== 'newest' && { backgroundColor: colors.accent, borderColor: colors.accent }
          ]}
          onPress={() => setShowFilters((p) => !p)}
        >
          <Text style={styles.sortBtnIcon}>📊</Text>
        </TouchableOpacity>
      </View>

      {/* Expanded Filters */}
      {showFilters && (
        <View style={[styles.filtersPanel, { backgroundColor: colors.surface }]}>
          <View style={styles.filterHeader}>
            <Text style={[styles.filterTitle, { color: colors.text }]}>Filters</Text>
            {activeFiltersCount > 0 && (
              <TouchableOpacity onPress={clearFilters}>
                <Text style={[styles.clearAll, { color: colors.accent }]}>Clear all</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={[styles.filterLabel, { color: colors.textMuted }]}>PROPERTY TYPE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} scrollEventThrottle={16} decelerationRate="fast">
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  selectedType === t.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setSelectedType(selectedType === t.id ? null : t.id)}
              >
                <Text>{t.emoji}</Text>
                <Text style={[
                  styles.filterChipText,
                  { color: colors.text },
                  selectedType === t.id && { color: colors.white }
                ]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.filterLabel, { color: colors.textMuted }]}>CITY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} scrollEventThrottle={16} decelerationRate="fast">
            {CITIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  selectedCity === c && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setSelectedCity(selectedCity === c ? null : c)}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: colors.text },
                  selectedCity === c && { color: colors.white }
                ]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.filterLabel, { color: colors.textMuted }]}>SORT BY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} scrollEventThrottle={16} decelerationRate="fast">
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  selectedSort === option.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setSelectedSort(selectedSort === option.id ? 'newest' : option.id)}
              >
                <Text>{option.emoji}</Text>
                <Text style={[
                  styles.filterChipText,
                  { color: colors.text },
                  selectedSort === option.id && { color: colors.white }
                ]}>
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
            style={[styles.resultCard, { backgroundColor: colors.surface }]}
            activeOpacity={0.9}
            onPress={() => router.push(`/buyer/listing-details/${item.id}`)}
          >
            <Image source={{ uri: item.images[0] }} style={styles.resultImg} />
            <View style={styles.resultBody}>
              <View style={styles.resultTop}>
                <View style={[styles.resultTypeBadge, { backgroundColor: colors.accentSoft }]}>
                  <Text style={[styles.resultTypeTxt, { color: colors.accent }]}>{item.propertyType}</Text>
                </View>
                <Text style={[styles.resultCity, { color: colors.textMuted }]}>{item.location.city}</Text>
              </View>
              <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
              <Text style={[styles.resultPrice, { color: colors.accent }]}>Contact for Price</Text>
              <Text style={[styles.resultArea, { color: colors.textMuted }]}>{item.area} {item.areaUnit}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔎</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No results found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Try adjusting your search or filters</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  title: { ...Typography.h1 },
  count: { ...Typography.body },
  searchRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.lg,
    gap: 10, marginBottom: Spacing.sm,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, height: 50,
    borderWidth: 1.5, ...Shadow.sm,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, ...Typography.body },
  clearText: { fontSize: 14, padding: 4 },
  filterBtn: {
    width: 50, height: 50, borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', ...Shadow.sm,
  },
  filterBtnIcon: { fontSize: 20 },
  sortBtn: {
    width: 50, height: 50, borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', ...Shadow.sm,
  },
  sortBtnIcon: { fontSize: 20 },
  filterBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  filterBadgeText: { ...Typography.caption, fontSize: 10 },
  filtersPanel: {
    marginHorizontal: Spacing.lg, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  filterTitle: { ...Typography.h4 },
  clearAll: { ...Typography.bodySmall, fontWeight: '600' },
  filterLabel: { ...Typography.label, marginBottom: 8, marginTop: 8 },
  filterRow: { marginBottom: 4 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full,
    borderWidth: 1.5, marginRight: 8,
  },
  filterChipText: { fontSize: 14, fontWeight: '700' },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  resultCard: {
    flexDirection: 'row',
    borderRadius: Radius.lg, marginBottom: Spacing.sm,
    overflow: 'hidden', ...Shadow.sm,
  },
  resultImg: { width: 110, height: 110 },
  resultBody: { flex: 1, padding: Spacing.md },
  resultTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  resultTypeBadge: {
    borderRadius: Radius.sm,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  resultTypeTxt: { ...Typography.caption, fontWeight: '700' },
  resultCity: { ...Typography.caption },
  resultTitle: { ...Typography.bodySmall, fontWeight: '600', marginBottom: 6 },
  resultPrice: { ...Typography.h4 },
  resultArea: { ...Typography.caption, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { ...Typography.h3 },
  emptySubtitle: { ...Typography.body },
});