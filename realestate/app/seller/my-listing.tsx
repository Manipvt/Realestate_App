import React, { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useListingStore } from '@/store/listingStore';
import { Listing, ListingStatus } from '@/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';

function formatPrice(p: number) {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)}Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)}L`;
  return `₹${p.toLocaleString('en-IN')}`;
}

export default function MyListingsScreen() {
  const { myListings, fetchMyListings, deleteListing, updateListing, isLoading } = useListingStore();

  useEffect(() => { fetchMyListings(); }, []);

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Listing', `Remove "${title}" permanently?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteListing(id) },
    ]);
  };

  const handleToggleStatus = (listing: Listing) => {
    const newStatus = listing.status === ListingStatus.ACTIVE ? ListingStatus.PENDING : ListingStatus.ACTIVE;
    updateListing(listing.id, { status: newStatus });
  };

  const statusColor = (s: ListingStatus) => {
    if (s === ListingStatus.ACTIVE) return Colors.success;
    if (s === ListingStatus.SOLD) return Colors.accent;
    return Colors.warning;
  };

  const statusBg = (s: ListingStatus) => {
    if (s === ListingStatus.ACTIVE) return Colors.successLight;
    if (s === ListingStatus.SOLD) return Colors.accentSoft;
    return Colors.warningLight;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Listings</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/seller/add-listing')}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Summary bar */}
      <View style={styles.summaryBar}>
        {[
          { label: 'Total', val: myListings.length, color: Colors.primary },
          { label: 'Active', val: myListings.filter(l => l.status === ListingStatus.ACTIVE).length, color: Colors.success },
          { label: 'Sold', val: myListings.filter(l => l.status === ListingStatus.SOLD).length, color: Colors.accent },
        ].map((s) => (
          <View key={s.label} style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: s.color }]}>{s.val}</Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={myListings}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Image */}
              <Image source={{ uri: item.images[0] }} style={styles.cardImg} />
              <View style={styles.cardContent}>
                {/* Status & Type */}
                <View style={styles.cardTopRow}>
                  <View style={[styles.statusPill, { backgroundColor: statusBg(item.status) }]}>
                    <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.typePill}>
                    <Text style={styles.typeText}>{item.propertyType}</Text>
                  </View>
                </View>

                {/* Info */}
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
                <Text style={styles.cardLocation}>📍 {item.location.city}, {item.location.state}</Text>

                {/* Stats */}
                <View style={styles.statsRow}>
                  <View style={styles.statChip}>
                    <Text style={styles.statIcon}>👁</Text>
                    <Text style={styles.statText}>{item.contactViews} leads</Text>
                  </View>
                  <View style={styles.statChip}>
                    <Text style={styles.statIcon}>📐</Text>
                    <Text style={styles.statText}>{item.area} {item.areaUnit}</Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => router.push(`/seller/edit-listing/${item.id}` as any)}
                  >
                    <Text style={styles.editBtnText}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.toggleBtn}
                    onPress={() => handleToggleStatus(item)}
                  >
                    <Text style={styles.toggleBtnText}>
                      {item.status === ListingStatus.ACTIVE ? '⏸ Pause' : '▶ Activate'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id, item.title)}
                  >
                    <Text style={styles.deleteBtnText}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🏚</Text>
              <Text style={styles.emptyTitle}>No listings yet</Text>
              <Text style={styles.emptySub}>Add your first property to start getting leads</Text>
              <TouchableOpacity style={styles.addFirstBtn} onPress={() => router.push('/seller/add-listing')}>
                <Text style={styles.addFirstBtnText}>+ Add First Listing</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center', ...Shadow.sm,
  },
  backText: { fontSize: 20, color: Colors.text },
  title: { ...Typography.h3, color: Colors.text },
  addBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { ...Typography.bodySmall, color: Colors.white, fontWeight: '700' },
  summaryBar: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { ...Typography.h2 },
  summaryLabel: { ...Typography.caption, color: Colors.textMuted },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.lg, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    marginBottom: Spacing.md, overflow: 'hidden', ...Shadow.md,
  },
  cardImg: { width: '100%', height: 160 },
  cardContent: { padding: Spacing.md },
  cardTopRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.sm },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusText: { ...Typography.caption, fontWeight: '700' },
  typePill: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
  },
  typeText: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '600', textTransform: 'capitalize' },
  cardTitle: { ...Typography.h4, color: Colors.text, marginBottom: 2 },
  cardPrice: { ...Typography.h3, color: Colors.accent, marginBottom: 4 },
  cardLocation: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.sm },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.sm },
  statChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceAlt, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 4,
  },
  statIcon: { fontSize: 12 },
  statText: { ...Typography.caption, color: Colors.textSecondary },
  actions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    flex: 1, height: 36, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  editBtnText: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '700' },
  toggleBtn: {
    flex: 1, height: 36, borderRadius: Radius.md,
    backgroundColor: Colors.accentSoft, alignItems: 'center', justifyContent: 'center',
  },
  toggleBtnText: { ...Typography.bodySmall, color: Colors.accent, fontWeight: '700' },
  deleteBtn: {
    width: 36, height: 36, borderRadius: Radius.md,
    backgroundColor: Colors.errorLight, alignItems: 'center', justifyContent: 'center',
  },
  deleteBtnText: { fontSize: 16 },
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.sm },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { ...Typography.h2, color: Colors.text },
  emptySub: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center' },
  addFirstBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl, paddingVertical: 14, marginTop: Spacing.md, ...Shadow.sm,
  },
  addFirstBtnText: { ...Typography.button, color: Colors.white },
});