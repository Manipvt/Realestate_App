import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useListingStore } from '@/store/listingStore';
import { useAuthStore } from '@/store/authStore';
import { ListingStatus } from '@/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';

const QUICK_ACTIONS = [
  { icon: '➕', label: 'Add Listing', route: '/seller/add-listing', bg: Colors.primary },
  { icon: '🏠', label: 'My Listings', route: '/seller/my-listing', bg: Colors.accent },
  { icon: '👥', label: 'Leads', route: '/seller/leads', bg: '#2D7A4F' },
];

export default function SellerDashboardScreen() {
  const { myListings, fetchMyListings } = useListingStore();
  const { user } = useAuthStore();

  useEffect(() => { fetchMyListings(); }, []);

  const active = myListings.filter((l) => l.status === ListingStatus.ACTIVE).length;
  const sold = myListings.filter((l) => l.status === ListingStatus.SOLD).length;
  const totalViews = myListings.reduce((a, l) => a + l.contactViews, 0);
  const recentListings = myListings.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Seller Dashboard</Text>
            <Text style={styles.name}>{user?.sellerProfile?.businessName ?? user?.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={styles.profileBtnText}>{user?.name?.[0] ?? 'S'}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{myListings.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{sold}</Text>
            <Text style={styles.statLabel}>Sold</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{totalViews}</Text>
            <Text style={styles.statLabel}>Leads</Text>
          </View>
        </View>

        {/* Rating */}
        {user?.sellerProfile && (
          <View style={styles.ratingCard}>
            <View style={styles.ratingLeft}>
              <Text style={styles.ratingNum}>⭐ {user.sellerProfile.rating}</Text>
              <Text style={styles.ratingLabel}>Seller Rating</Text>
            </View>
            <View style={styles.ratingRight}>
              <View style={[styles.verifiedPill, user.verified && styles.verifiedPillActive]}>
                <Text style={styles.verifiedText}>{user.verified ? '✓ Verified' : '⚠ Unverified'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[styles.quickCard, { backgroundColor: a.bg }]}
              onPress={() => router.push(a.route as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.quickIcon}>{a.icon}</Text>
              <Text style={styles.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent listings */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent Listings</Text>
          <TouchableOpacity onPress={() => router.push('/seller/my-listing')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        {recentListings.length === 0 ? (
          <View style={styles.emptyRecent}>
            <Text style={styles.emptyText}>No listings yet.</Text>
            <TouchableOpacity onPress={() => router.push('/seller/add-listing')}>
              <Text style={styles.emptyLink}>Add your first listing →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentListings.map((l) => (
            <TouchableOpacity
              key={l.id}
              style={styles.listingRow}
              onPress={() => router.push(`/seller/edit-listing/${l.id}` as any)}
              activeOpacity={0.85}
            >
              <View style={styles.listingIcon}>
                <Text style={{ fontSize: 22 }}>{l.propertyType === 'land' ? '🌳' : l.propertyType === 'villa' ? '🏡' : '🏢'}</Text>
              </View>
              <View style={styles.listingInfo}>
                <Text style={styles.listingTitle} numberOfLines={1}>{l.title}</Text>
                <Text style={styles.listingMeta}>{l.location.city} • {l.contactViews} leads</Text>
              </View>
              <View style={[styles.statusPill, l.status === ListingStatus.ACTIVE ? styles.statusActive : styles.statusInactive]}>
                <Text style={styles.statusText}>{l.status}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: { ...Typography.bodySmall, color: Colors.textSecondary },
  name: { ...Typography.h2, color: Colors.text },
  profileBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.sm,
  },
  profileBtnText: { ...Typography.h3, color: Colors.white },
  statsCard: {
    flexDirection: 'row', backgroundColor: Colors.primary,
    borderRadius: Radius.xl, padding: Spacing.lg,
    marginBottom: Spacing.md, ...Shadow.lg,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { ...Typography.h2, color: Colors.white, marginBottom: 4 },
  statLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.6)' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  ratingCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  ratingLeft: {},
  ratingNum: { ...Typography.h3, color: Colors.text },
  ratingLabel: { ...Typography.caption, color: Colors.textMuted },
  ratingRight: {},
  verifiedPill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full,
    backgroundColor: Colors.errorLight,
  },
  verifiedPillActive: { backgroundColor: Colors.successLight },
  verifiedText: { ...Typography.bodySmall, color: Colors.success, fontWeight: '700' },
  sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
  },
  seeAll: { ...Typography.bodySmall, color: Colors.accent, fontWeight: '600' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: Spacing.xl },
  quickCard: {
    width: '47%', borderRadius: Radius.xl, padding: Spacing.lg,
    alignItems: 'center', gap: Spacing.sm, ...Shadow.md,
  },
  quickIcon: { fontSize: 32 },
  quickLabel: { ...Typography.h4, color: Colors.white },
  listingRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  listingIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center',
  },
  listingInfo: { flex: 1 },
  listingTitle: { ...Typography.h4, color: Colors.text, marginBottom: 2 },
  listingMeta: { ...Typography.bodySmall, color: Colors.textSecondary },
  statusPill: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full,
  },
  statusActive: { backgroundColor: Colors.successLight },
  statusInactive: { backgroundColor: Colors.warningLight },
  statusText: { ...Typography.caption, color: Colors.text, fontWeight: '700', textTransform: 'uppercase' },
  emptyRecent: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  emptyText: { ...Typography.body, color: Colors.textSecondary },
  emptyLink: { ...Typography.body, color: Colors.accent, fontWeight: '700' },
});