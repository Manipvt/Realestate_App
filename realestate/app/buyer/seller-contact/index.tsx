import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Linking, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { apiClient } from '@/services/api/client';

interface SellerContactResponse {
  seller: {
    name: string;
    email: string;
    phone: string;
  };
  unlockedUntil?: string;
}

function ContactAction({ emoji, label, sub, color, onPress }: any) {
  return (
    <TouchableOpacity style={[styles.actionCard, { borderColor: color + '40' }]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
        <Text style={{ fontSize: 24 }}>{emoji}</Text>
      </View>
      <View style={styles.actionInfo}>
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={styles.actionSub}>{sub}</Text>
      </View>
      <View style={[styles.actionArrow, { backgroundColor: color }]}>
        <Text style={styles.actionArrowText}>→</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SellerContactScreen() {
  const { listingId, listingTitle } = useLocalSearchParams<{ listingId: string; listingTitle: string }>();
  const resolvedListingId = Array.isArray(listingId) ? listingId[0] : listingId;
  const resolvedListingTitle = Array.isArray(listingTitle) ? listingTitle[0] : listingTitle;
  const [isLoading, setIsLoading] = useState(true);
  const [sellerContact, setSellerContact] = useState<SellerContactResponse['seller'] | null>(null);

  useEffect(() => {
    const fetchSellerContact = async () => {
      if (!resolvedListingId) {
        Alert.alert('Missing Listing', 'Listing details are missing. Please open the property again.', [
          { text: 'Back', onPress: () => router.back() },
        ]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get<SellerContactResponse>(`/unlock/${resolvedListingId}`);
        const payload = response.data;
        setSellerContact(payload.seller);
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Unable to load seller contact.';
        const statusCode = error?.response?.status;

        if (statusCode === 403) {
          Alert.alert(
            'Unlock Required',
            message,
            [
              {
                text: 'Unlock Now',
                onPress: () =>
                  router.replace({
                    pathname: '/buyer/payment',
                    params: { listingId: resolvedListingId, listingTitle: resolvedListingTitle },
                  }),
              },
              { text: 'Back', onPress: () => router.back(), style: 'cancel' },
            ]
          );
        } else {
          Alert.alert('Error', message, [{ text: 'Back', onPress: () => router.back() }]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerContact();
  }, [resolvedListingId, resolvedListingTitle]);

  const phoneNumber = useMemo(() => sellerContact?.phone || '', [sellerContact?.phone]);
  const emailAddress = useMemo(() => sellerContact?.email || '', [sellerContact?.email]);
  const sellerName = useMemo(() => sellerContact?.name || 'Seller', [sellerContact?.name]);

  const handleCall = () => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = () => {
    if (!emailAddress) return;
    Linking.openURL(`mailto:${emailAddress}`);
  };

  const handleWhatsApp = () => {
    const number = phoneNumber.replace(/\D/g, '');
    if (!number) return;
    Linking.openURL(`https://wa.me/${number}?text=Hi, I'm interested in your property: ${resolvedListingTitle || ''}`);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!sellerContact) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.loader}>
          <Text style={styles.emptyStateText}>Seller contact is unavailable.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Contact</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        {/* Success banner */}
        <View style={styles.successBanner}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Contact Unlocked!</Text>
          <Text style={styles.successSub}>You can now reach the seller directly</Text>
        </View>

        {/* Seller card */}
        <View style={styles.sellerCard}>
          <View style={styles.sellerAvatar}>
            <Text style={styles.sellerAvatarText}>{sellerName[0]}</Text>
          </View>
          <View style={styles.sellerDetails}>
            <Text style={styles.sellerName}>{sellerName}</Text>
            <Text style={styles.sellerBiz}>Verified Seller</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified Seller</Text>
            </View>
          </View>
        </View>

        {/* Contact info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoSectionTitle}>Contact Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📞 Phone</Text>
            <Text style={styles.infoVal} selectable>{phoneNumber}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>✉ Email</Text>
            <Text style={styles.infoVal} selectable>{emailAddress}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🕐 Timing</Text>
            <Text style={styles.infoVal}>Mon–Sat, 10 AM – 7 PM</Text>
          </View>
        </View>

        {/* Property context */}
        <View style={styles.propertyRef}>
          <Text style={styles.propertyRefLabel}>FOR PROPERTY</Text>
          <Text style={styles.propertyRefTitle} numberOfLines={1}>{resolvedListingTitle}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Text style={styles.actionsTitle}>Connect Now</Text>
          <ContactAction
            emoji="📞" label="Call Seller" sub={phoneNumber}
            color={Colors.success} onPress={handleCall}
          />
          <ContactAction
            emoji="💬" label="WhatsApp" sub="Send a message"
            color="#25D366" onPress={handleWhatsApp}
          />
          <ContactAction
            emoji="✉️" label="Send Email" sub={emailAddress}
            color={Colors.primary} onPress={handleEmail}
          />
        </View>

        {/* Note */}
        <View style={styles.note}>
          <Text style={styles.noteText}>
            💡 This contact is saved in <Text style={styles.noteLink}>My Contacts</Text> for future reference
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyStateText: { ...Typography.body, color: Colors.textSecondary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
    ...Shadow.sm,
  },
  backText: { fontSize: 20, color: Colors.text },
  headerTitle: { ...Typography.h3, color: Colors.text },
  content: { flex: 1, padding: Spacing.lg },
  successBanner: {
    alignItems: 'center', backgroundColor: Colors.successLight,
    borderRadius: Radius.xl, paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg, ...Shadow.sm,
  },
  successEmoji: { fontSize: 40, marginBottom: Spacing.sm },
  successTitle: { ...Typography.h2, color: Colors.success, marginBottom: 4 },
  successSub: { ...Typography.body, color: Colors.success + 'CC' },
  sellerCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.lg, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  sellerAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sellerAvatarText: { ...Typography.h2, color: Colors.white },
  sellerDetails: { flex: 1 },
  sellerName: { ...Typography.h3, color: Colors.text, marginBottom: 2 },
  sellerBiz: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: 6 },
  verifiedBadge: {
    alignSelf: 'flex-start', backgroundColor: Colors.successLight,
    borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3,
  },
  verifiedText: { ...Typography.caption, color: Colors.success, fontWeight: '700' },
  infoCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.lg, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  infoSectionTitle: { ...Typography.label, color: Colors.textMuted, marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  infoLabel: { ...Typography.bodySmall, color: Colors.textSecondary, fontWeight: '500' },
  infoVal: { ...Typography.body, color: Colors.text, fontWeight: '600' },
  infoDivider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 4 },
  propertyRef: {
    backgroundColor: Colors.accentSoft, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.lg,
  },
  propertyRefLabel: { ...Typography.caption, color: Colors.accent, marginBottom: 4 },
  propertyRefTitle: { ...Typography.h4, color: Colors.primary },
  actions: { gap: Spacing.sm, marginBottom: Spacing.md },
  actionsTitle: { ...Typography.h3, color: Colors.text, marginBottom: 4 },
  actionCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1.5, ...Shadow.sm,
  },
  actionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  actionInfo: { flex: 1 },
  actionLabel: { ...Typography.h4, color: Colors.text },
  actionSub: { ...Typography.bodySmall, color: Colors.textSecondary },
  actionArrow: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionArrowText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  note: {
    backgroundColor: Colors.warningLight, borderRadius: Radius.md,
    padding: Spacing.md, alignItems: 'center',
  },
  noteText: { ...Typography.bodySmall, color: Colors.warning, textAlign: 'center' },
  noteLink: { fontWeight: '700', textDecorationLine: 'underline' },
});