import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Share, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useListingStore } from '@/store/listingStore';
import { useAuthStore } from '@/store/authStore';
import { Listing } from '@/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';

function formatPrice(price: number) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function ListingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
      <SafeAreaView style={styles.safe}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.error}>
          <Text style={styles.errorText}>Property not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isSaved = savedListings.includes(listing.id);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
            <Text style={styles.price}>Contact for Price</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{listing.propertyType.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.location}>📍 {listing.location.address}, {listing.location.city}</Text>

          {/* Property specs */}
          <View style={styles.specs}>
            {listing.bedrooms && (
              <View style={styles.spec}>
                <Text style={styles.specIcon}>🛏</Text>
                <Text style={styles.specText}>{listing.bedrooms} Beds</Text>
              </View>
            )}
            {listing.bathrooms && (
              <View style={styles.spec}>
                <Text style={styles.specIcon}>🚿</Text>
                <Text style={styles.specText}>{listing.bathrooms} Baths</Text>
              </View>
            )}
            <View style={styles.spec}>
              <Text style={styles.specIcon}>📐</Text>
              <Text style={styles.specText}>{listing.area} {listing.areaUnit}</Text>
            </View>
            {listing.facing && (
              <View style={styles.spec}>
                <Text style={styles.specIcon}>🧭</Text>
                <Text style={styles.specText}>{listing.facing}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenities}>
              {listing.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenity}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Seller info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listed by</Text>
            <View style={styles.seller}>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{listing.sellerName}</Text>
                <Text style={styles.sellerMeta}>Contact views: {listing.contactViews}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom action buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.contactBtn} onPress={handleContactSeller}>
          <Text style={styles.contactBtnText}>Contact Seller</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { ...Typography.h3, color: Colors.textSecondary },
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
  price: { ...Typography.h1, color: Colors.accent },
  typeBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm
  },
  typeBadgeText: { ...Typography.caption, color: Colors.white },
  title: { ...Typography.h2, color: Colors.text, marginBottom: 4 },
  location: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.md },
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
  specText: { ...Typography.bodySmall, color: Colors.text },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  description: { ...Typography.body, color: Colors.textSecondary, lineHeight: 22 },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  amenity: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.sm
  },
  amenityText: { ...Typography.bodySmall, color: Colors.text },
  seller: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md
  },
  sellerInfo: { flex: 1 },
  sellerName: { ...Typography.h4, color: Colors.text },
  sellerMeta: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 2 },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.lg,
    paddingBottom: Spacing.lg + 20
  },
  contactBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md
  },
  contactBtnText: { ...Typography.button, color: Colors.white }
});