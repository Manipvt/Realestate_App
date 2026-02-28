import React, { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useListingStore } from '@/store/listingStore';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-color';

function formatPrice(p: number) {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)}Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)}L`;
  return `₹${p.toLocaleString('en-IN')}`;
}

export default function SavedListingsScreen() {
  const { listings, savedListings, fetchListings, toggleSave } = useListingStore();
  const colors = useTheme();

  useEffect(() => { fetchListings(); }, []);

  const saved = listings.filter((l) => savedListings.includes(l.id));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.background }]} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Saved Properties</Text>
        <View style={{ width: 36 }} />
      </View>

      {saved.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🤍</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No saved properties</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>Tap the heart on any listing to save it here</Text>
          <TouchableOpacity style={[styles.browseBtn, { backgroundColor: colors.primary }]} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.browseBtnText}>Browse Properties</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <TouchableOpacity
                style={styles.cardMain}
                activeOpacity={0.9}
                onPress={() => router.push(`/buyer/listing-details/${item.id}`)}
              >
                <Image source={{ uri: item.images[0] }} style={styles.cardImg} />
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <View style={[styles.typeBadge, { backgroundColor: colors.accentSoft }]}>
                      <Text style={[styles.typeBadgeText, { color: colors.accent }]}>{item.propertyType}</Text>
                    </View>
                    <Text style={[styles.cardCity, { color: colors.textMuted }]}>{item.location.city}</Text>
                  </View>
                  <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[styles.cardPrice, { color: colors.accent }]}>Contact for Price</Text>
                  <Text style={[styles.cardArea, { color: colors.textMuted }]}>{item.area} {item.areaUnit}</Text>
                </View>
              </TouchableOpacity>
              <View style={[styles.cardActions, { borderTopColor: colors.borderLight }]}>
                <TouchableOpacity
                  style={[styles.removeBtn, { borderColor: colors.border }]}
                  onPress={() => toggleSave(item.id)}
                >
                  <Text style={[styles.removeBtnText, { color: colors.textSecondary }]}>❤️ Remove</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.contactBtn, { backgroundColor: colors.accent }]}
                  onPress={() => router.push({ pathname: '/buyer/payment', params: { listingId: item.id, listingTitle: item.title } })}
                >
                  <Text style={[styles.contactBtnText, { color: '#FFFFFF' }]}>Unlock Contact 🔓</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', ...Shadow.sm,
  },
  backText: { fontSize: 20 },
  title: { ...Typography.h3 },
  list: { padding: Spacing.lg, paddingBottom: 100 },
  card: {
    borderRadius: Radius.xl,
    marginBottom: Spacing.md, overflow: 'hidden', ...Shadow.md,
  },
  cardMain: { flexDirection: 'row' },
  cardImg: { width: 110, height: 110 },
  cardBody: { flex: 1, padding: Spacing.md },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  typeBadge: { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 2 },
  typeBadgeText: { ...Typography.caption, fontWeight: '700' },
  cardCity: { ...Typography.caption },
  cardTitle: { ...Typography.bodySmall, fontWeight: '600', marginBottom: 4 },
  cardPrice: { ...Typography.h4 },
  cardArea: { ...Typography.caption, marginTop: 2 },
  cardActions: {
    flexDirection: 'row', borderTopWidth: 1,
    padding: Spacing.sm, gap: Spacing.sm,
  },
  removeBtn: {
    flex: 1, height: 38, borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  removeBtnText: { ...Typography.bodySmall, fontWeight: '600' },
  contactBtn: {
    flex: 2, height: 38, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  contactBtnText: { ...Typography.bodySmall, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { ...Typography.h2 },
  emptySub: { ...Typography.body, textAlign: 'center' },
  browseBtn: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl, paddingVertical: 14, marginTop: Spacing.md, ...Shadow.sm,
  },
  browseBtnText: { ...Typography.button, color: '#FFFFFF' },
});