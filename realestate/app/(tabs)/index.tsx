import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, FlatList, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useListingStore } from '@/store/listingStore';
import { useAuthStore } from '@/store/authStore';
import { Listing } from '@/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-color';

const FILTERS = ['All', 'Apartment', 'Land', 'Villa', 'Commercial'];

function PropertyCard({ item, isSaved, onToggleSave, colors }: { item: Listing; isSaved: boolean; onToggleSave: () => void, colors: any }) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      activeOpacity={0.92}
      onPress={() => router.push(`/buyer/listing-details/${item.id}`)}
    >
      <View style={styles.imgWrap}>
        <Image source={{ uri: item.images[0] }} style={styles.img} />
        <View style={styles.badgeRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{item.propertyType.toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.surface }]} onPress={onToggleSave} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.saveBtnText}>{isSaved ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardPrice, { color: colors.accent }]}>Contact for Price</Text>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.cardLocation, { color: colors.textSecondary }]} numberOfLines={1}>📍 {item.location.city}, {item.location.state}</Text>
        <View style={styles.cardMeta}>
          {item.bedrooms && (
            <View style={[styles.metaChip, { backgroundColor: colors.surfaceAlt }]}><Text style={[styles.metaText, { color: colors.textSecondary }]}>🛏 {item.bedrooms} Bed</Text></View>
          )}
          <View style={[styles.metaChip, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>📐 {item.area} {item.areaUnit}</Text>
          </View>
          {item.bathrooms && (
            <View style={[styles.metaChip, { backgroundColor: colors.surfaceAlt }]}><Text style={[styles.metaText, { color: colors.textSecondary }]}>🚿 {item.bathrooms} Bath</Text></View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const {
    listings,
    isLoading,
    isFetchingMore,
    fetchListings,
    loadMoreListings,
    savedListings,
    toggleSave,
    fetchSavedListings,
  } = useListingStore();
  const { user } = useAuthStore();
  const colors = useTheme();
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchListings({ reset: true });
    // Fetch saved listings if user is logged in
    if (user) {
      fetchSavedListings();
    }
  }, [user, fetchListings, fetchSavedListings]);

  const filtered = useMemo(() => (
    activeFilter === 'All'
      ? listings
      : listings.filter((l) => l.propertyType.toLowerCase() === activeFilter.toLowerCase())
  ), [activeFilter, listings]);

  // Calculate unique cities from actual listings
  const uniqueCities = new Set(listings.map(l => l.location.city)).size;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Good morning 👋</Text>
          <Text style={[styles.name, { color: colors.text }]}>{user?.name?.split(' ')[0] ?? 'User'}</Text>
        </View>
        <TouchableOpacity style={[styles.avatar, { backgroundColor: colors.primary }]} onPress={() => router.push('/profile')}>
          {user?.avatar
            ? <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
            : <Text style={[styles.avatarFallback, { color: colors.onPrimary }]}>{user?.name?.[0] ?? 'U'}</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={[styles.searchPlaceholder, { color: colors.textMuted }]}>Search city, locality, property…</Text>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.chip,
              { backgroundColor: colors.surface, borderColor: colors.border },
              activeFilter === f && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[
              styles.chipText,
              { color: colors.text },
              activeFilter === f && { color: colors.onPrimary }
            ]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats banner */}
      <View style={[styles.banner, { backgroundColor: colors.primary }]}>
        <View style={styles.bannerItem}>
          <Text style={styles.bannerNum}>{listings.length}</Text>
          <Text style={styles.bannerLabel}>Listings</Text>
        </View>
        <View style={styles.bannerDivider} />
        <View style={styles.bannerItem}>
          <Text style={styles.bannerNum}>{savedListings.length}</Text>
          <Text style={styles.bannerLabel}>Saved</Text>
        </View>
        <View style={styles.bannerDivider} />
        <View style={styles.bannerItem}>
          <Text style={styles.bannerNum}>{uniqueCities}</Text>
          <Text style={styles.bannerLabel}>Cities</Text>
        </View>
      </View>

      {/* Listings */}
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loaderText, { color: colors.textSecondary }]}>Finding properties…</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          onEndReached={loadMoreListings}
          onEndReachedThreshold={0.5}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          renderItem={({ item }) => (
            <PropertyCard
              item={item}
              isSaved={savedListings.includes(item.id)}
              onToggleSave={() => toggleSave(item.id)}
              colors={colors}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isFetchingMore ? (
              <View style={styles.paginationLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🏚</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No properties found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  greeting: { ...Typography.bodySmall },
  name: { ...Typography.h2 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center', ...Shadow.sm,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarFallback: { ...Typography.h3 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.lg, marginVertical: Spacing.sm,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, height: 50,
    borderWidth: 1.5, ...Shadow.sm,
  },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchPlaceholder: { ...Typography.body },
  filterRow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: 10, marginBottom: Spacing.lg },
  chip: {
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: Radius.full, borderWidth: 1.5,
    minWidth: 80,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  banner: {
    flexDirection: 'row', marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md, marginBottom: Spacing.sm,
    ...Shadow.md,
  },
  bannerItem: { flex: 1, alignItems: 'center' },
  bannerNum: { ...Typography.h2, color: Colors.onPrimary },
  bannerLabel: { ...Typography.caption, color: Colors.onPrimaryMuted, marginTop: 2 },
  bannerDivider: { width: 1, backgroundColor: Colors.onPrimaryDivider, marginVertical: 4 },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  card: {
    borderRadius: Radius.xl,
    marginBottom: Spacing.md, overflow: 'hidden', ...Shadow.md,
  },
  imgWrap: { position: 'relative' },
  img: { width: '100%', height: 200 },
  badgeRow: { position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between' },
  typeBadge: {
    backgroundColor: 'rgba(27,43,75,0.85)', borderRadius: Radius.sm,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  typeBadgeText: { ...Typography.caption, color: Colors.white },
  saveBtn: {
    borderRadius: Radius.full,
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
    ...Shadow.sm,
  },
  saveBtnText: { fontSize: 18 },
  cardBody: { padding: Spacing.md },
  cardPrice: { ...Typography.h2, marginBottom: 2 },
  cardTitle: { ...Typography.h4, marginBottom: 4 },
  cardLocation: { ...Typography.bodySmall, marginBottom: Spacing.sm },
  cardMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaChip: {
    borderRadius: Radius.sm,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  metaText: { ...Typography.bodySmall },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText: { ...Typography.body },
  paginationLoader: { paddingVertical: Spacing.md },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { ...Typography.h3 },
});