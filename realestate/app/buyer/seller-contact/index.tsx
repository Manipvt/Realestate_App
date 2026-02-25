import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';

// Mock seller contact data revealed after payment
const MOCK_CONTACT = {
  name: 'Priya Mehta',
  phone: '+91 98765 43210',
  email: 'priya.mehta@gmail.com',
  businessName: 'Mehta Realty Group',
  whatsapp: '+91 98765 43210',
  timing: 'Mon–Sat, 10 AM – 7 PM',
};

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

  const handleCall = () => Linking.openURL(`tel:${MOCK_CONTACT.phone}`);
  const handleEmail = () => Linking.openURL(`mailto:${MOCK_CONTACT.email}`);
  const handleWhatsApp = () => {
    const number = MOCK_CONTACT.whatsapp.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${number}?text=Hi, I'm interested in your property: ${listingTitle}`);
  };

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
            <Text style={styles.sellerAvatarText}>{MOCK_CONTACT.name[0]}</Text>
          </View>
          <View style={styles.sellerDetails}>
            <Text style={styles.sellerName}>{MOCK_CONTACT.name}</Text>
            <Text style={styles.sellerBiz}>{MOCK_CONTACT.businessName}</Text>
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
            <Text style={styles.infoVal} selectable>{MOCK_CONTACT.phone}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>✉ Email</Text>
            <Text style={styles.infoVal} selectable>{MOCK_CONTACT.email}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🕐 Timing</Text>
            <Text style={styles.infoVal}>{MOCK_CONTACT.timing}</Text>
          </View>
        </View>

        {/* Property context */}
        <View style={styles.propertyRef}>
          <Text style={styles.propertyRefLabel}>FOR PROPERTY</Text>
          <Text style={styles.propertyRefTitle} numberOfLines={1}>{listingTitle}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Text style={styles.actionsTitle}>Connect Now</Text>
          <ContactAction
            emoji="📞" label="Call Seller" sub={MOCK_CONTACT.phone}
            color={Colors.success} onPress={handleCall}
          />
          <ContactAction
            emoji="💬" label="WhatsApp" sub="Send a message"
            color="#25D366" onPress={handleWhatsApp}
          />
          <ContactAction
            emoji="✉️" label="Send Email" sub={MOCK_CONTACT.email}
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