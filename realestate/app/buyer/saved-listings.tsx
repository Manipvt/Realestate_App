import React, { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useListingStore } from '@/store/listingStore';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';

function formatPrice(p: number) {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)}Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)}L`;
  return `₹${p.toLocaleString('en-IN')}`;
}

export default function SavedListingsScreen() {
  const { listings, savedListings, fetchListings, toggleSave } = useListingStore();

  useEffect(() => { fetchListings(); }, []);

  const saved = listings.filter((l) => savedListings.includes(l.id));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Saved Properties</Text>
        <View style={{ width: 36 }} />
      </View>

      {saved.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🤍</Text>
          <Text style={styles.emptyTitle}>No saved properties</Text>
          <Text style={styles.emptySub}>Tap the heart on any listing to save it here</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.replace('/(tabs)')}>
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
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.cardMain}
                activeOpacity={0.9}
                onPress={() => router.push(`/buyer/listing-details/${item.id}`)}
              >
                <Image source={{ uri: item.images[0] }} style={styles.cardImg} />
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{item.propertyType}</Text>
                    </View>
                    <Text style={styles.cardCity}>{item.location.city}</Text>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.cardPrice}>Contact for Price</Text>
                  <Text style={styles.cardArea}>{item.area} {item.areaUnit}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => toggleSave(item.id)}
                >
                  <Text style={styles.removeBtnText}>❤️ Remove</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.contactBtn}
                  onPress={() => router.push({ pathname: '/buyer/payment', params: { listingId: item.id, listingTitle: item.title } })}
                >
                  <Text style={styles.contactBtnText}>Unlock Contact 🔓</Text>
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
  list: { padding: Spacing.lg, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    marginBottom: Spacing.md, overflow: 'hidden', ...Shadow.md,
  },
  cardMain: { flexDirection: 'row' },
  cardImg: { width: 110, height: 110 },
  cardBody: { flex: 1, padding: Spacing.md },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  typeBadge: { backgroundColor: Colors.accentSoft, borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 2 },
  typeBadgeText: { ...Typography.caption, color: Colors.accent, fontWeight: '700' },
  cardCity: { ...Typography.caption, color: Colors.textMuted },
  cardTitle: { ...Typography.bodySmall, color: Colors.text, fontWeight: '600', marginBottom: 4 },
  cardPrice: { ...Typography.h4, color: Colors.accent },
  cardArea: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  cardActions: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.borderLight,
    padding: Spacing.sm, gap: Spacing.sm,
  },
  removeBtn: {
    flex: 1, height: 38, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  removeBtnText: { ...Typography.bodySmall, color: Colors.textSecondary, fontWeight: '600' },
  contactBtn: {
    flex: 2, height: 38, borderRadius: Radius.md,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  contactBtnText: { ...Typography.bodySmall, color: Colors.white, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { ...Typography.h2, color: Colors.text },
  emptySub: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center' },
  browseBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl, paddingVertical: 14, marginTop: Spacing.md, ...Shadow.sm,
  },
  browseBtnText: { ...Typography.button, color: Colors.white },
});