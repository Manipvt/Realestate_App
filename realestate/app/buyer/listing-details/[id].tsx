import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Share, Alert
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useListingStore } from '@/store/listingStore';
import { useAuthStore } from '@/store/authStore';
import { Listing } from '@/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-color';

function formatPrice(price: number) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function ListingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const { listings, savedListings, toggleSave }: { listings: Listing[], savedListings: string[], toggleSave: (id: string) => void } = useListingStore();
  const { user }: { user: any } = useAuthStore();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const found = listings.find((l: Listing) => l.id === id);
    setListing(found || null);
    setLoading(false);
  }, [id, listings]);

  const handleShare = async () => {
    if (!listing) return;
    try {
      await Share.share({
        message: `Check out this property: ${listing.title} in ${listing.location.city}. Contact for pricing details.`,
        url: `https://yourapp.com/listing/${listing.id}`
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share the listing');
    }
  };

  const handleContactSeller = () => {
    if (!listing) return;
    router.push({
      pathname: '/buyer/seller-contact',
      params: {
        listingId: listing.id,
        listingTitle: listing.title
      }
    } as any);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.error}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>Property not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isSaved = savedListings.includes(listing.id);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => toggleSave(listing.id)}>
              <Text style={styles.actionBtnText}>{isSaved ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Text style={styles.actionBtnText}>📤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Image gallery */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
          {listing.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.galleryImage} />
          ))}
        </ScrollView>

        {/* Property info */}
        <View style={styles.content}>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.accent }]}>Contact for Price</Text>
            <View style={[styles.typeBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.typeBadgeText, { color: colors.white }]}>{listing.propertyType.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{listing.title}</Text>
          <Text style={[styles.location, { color: colors.textSecondary }]}>📍 {listing.location.address}, {listing.location.city}</Text>

          {/* Property specs */}
          <View style={styles.specs}>
            {listing.bedrooms && (
              <View style={styles.spec}>
                <Text style={styles.specIcon}>🛏</Text>
                <Text style={[styles.specText, { color: colors.text }]}>{listing.bedrooms} Beds</Text>
              </View>
            )}
            {listing.bathrooms && (
              <View style={styles.spec}>
                <Text style={styles.specIcon}>🚿</Text>
                <Text style={[styles.specText, { color: colors.text }]}>{listing.bathrooms} Baths</Text>
              </View>
            )}
            <View style={styles.spec}>
              <Text style={styles.specIcon}>📐</Text>
              <Text style={[styles.specText, { color: colors.text }]}>{listing.area} {listing.areaUnit}</Text>
            </View>
            {listing.facing && (
              <View style={styles.spec}>
                <Text style={styles.specIcon}>🧭</Text>
                <Text style={[styles.specText, { color: colors.text }]}>{listing.facing}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{listing.description}</Text>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Amenities</Text>
            <View style={styles.amenities}>
              {listing.amenities.map((amenity, index) => (
                <View key={index} style={[styles.amenity, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.amenityText, { color: colors.text }]}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Seller info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Listed by</Text>
            <View style={styles.seller}>
              <View style={styles.sellerInfo}>
                <Text style={[styles.sellerName, { color: colors.text }]}>{listing.sellerName}</Text>
                <Text style={[styles.sellerMeta, { color: colors.textMuted }]}>Contact views: {listing.contactViews}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom action buttons */}
      <View style={[styles.bottomActions, { paddingBottom: Math.max(insets.bottom, Spacing.lg), backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.contactBtn, { backgroundColor: colors.primary }]} onPress={handleContactSeller}>
          <Text style={[styles.contactBtnText, { color: colors.white }]}>Contact Seller</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { ...Typography.h3 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent'
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm
  },
  backBtnText: { fontSize: 20, fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm
  },
  actionBtnText: { fontSize: 16 },
  gallery: { height: 300 },
  galleryImage: { width: 350, height: 300, marginRight: 8, borderRadius: Radius.md },
  content: { padding: Spacing.lg },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  price: { ...Typography.h1 },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm
  },
  typeBadgeText: { ...Typography.caption },
  title: { ...Typography.h2, marginBottom: 4 },
  location: { ...Typography.body, marginBottom: Spacing.md },
  specs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  specIcon: { fontSize: 16 },
  specText: { ...Typography.bodySmall },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.h3, marginBottom: Spacing.md },
  description: { ...Typography.body, lineHeight: 22 },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  amenity: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.sm
  },
  amenityText: { ...Typography.bodySmall },
  seller: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md
  },
  sellerInfo: { flex: 1 },
  sellerName: { ...Typography.h4 },
  sellerMeta: { ...Typography.bodySmall, marginTop: 2 },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: Spacing.lg,
  },
  contactBtn: {
    borderRadius: Radius.md,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md
  },
  contactBtnText: { ...Typography.button }
});