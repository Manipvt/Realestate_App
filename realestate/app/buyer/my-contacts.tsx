import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';

const MOCK_CONTACTS = [
  {
    id: '1', name: 'Priya Mehta', businessName: 'Mehta Realty Group',
    phone: '+91 98765 43210', email: 'priya.mehta@gmail.com',
    listingTitle: 'Luxury 3BHK in Bandra West', listingId: '1',
    purchasedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2', name: 'Arjun Reddy', businessName: 'Reddy Properties',
    phone: '+91 87654 32109', email: 'arjun.r@gmail.com',
    listingTitle: 'Prime Commercial Land in Whitefield', listingId: '2',
    purchasedAt: '2024-01-10T14:00:00Z',
  },
];

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000 / 60 / 60 / 24);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff} days ago`;
}

export default function MyContactsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Purchased Contacts</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          You've unlocked <Text style={styles.summaryBold}>{MOCK_CONTACTS.length} seller contact{MOCK_CONTACTS.length !== 1 ? 's' : ''}</Text>
        </Text>
      </View>

      {MOCK_CONTACTS.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📞</Text>
          <Text style={styles.emptyTitle}>No contacts yet</Text>
          <Text style={styles.emptySub}>When you unlock seller contacts, they'll appear here</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.browseBtnText}>Browse Properties</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={MOCK_CONTACTS}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Card header */}
              <View style={styles.cardHeader}>
                <View style={styles.avatarWrap}>
                  <Text style={styles.avatarText}>{item.name[0]}</Text>
                </View>
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>{item.name}</Text>
                  <Text style={styles.bizName}>{item.businessName}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              </View>

              {/* Property */}
              <View style={styles.propertyRef}>
                <Text style={styles.propertyRefLabel}>FOR PROPERTY</Text>
                <Text style={styles.propertyRefTitle} numberOfLines={1}>{item.listingTitle}</Text>
              </View>

              {/* Contact details */}
              <View style={styles.contactDetails}>
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>📞</Text>
                  <Text style={styles.contactVal} selectable>{item.phone}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>✉️</Text>
                  <Text style={styles.contactVal} selectable>{item.email}</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${item.phone}`)}
                >
                  <Text style={styles.callBtnText}>📞 Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.waBtn}
                  onPress={() => {
                    const num = item.phone.replace(/\D/g, '');
                    Linking.openURL(`https://wa.me/${num}`);
                  }}
                >
                  <Text style={styles.waBtnText}>💬 WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.emailBtn}
                  onPress={() => Linking.openURL(`mailto:${item.email}`)}
                >
                  <Text style={styles.emailBtnText}>✉️ Email</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.purchasedAt}>Unlocked {timeAgo(item.purchasedAt)}</Text>
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
  summary: {
    backgroundColor: Colors.primary, margin: Spacing.lg,
    borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center',
  },
  summaryText: { ...Typography.body, color: 'rgba(255,255,255,0.8)' },
  summaryBold: { fontWeight: '700', color: Colors.white },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    marginBottom: Spacing.md, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  avatarWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { ...Typography.h3, color: Colors.white },
  sellerInfo: { flex: 1 },
  sellerName: { ...Typography.h4, color: Colors.text },
  bizName: { ...Typography.bodySmall, color: Colors.textSecondary },
  verifiedBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.successLight, alignItems: 'center', justifyContent: 'center',
  },
  verifiedText: { color: Colors.success, fontWeight: '700', fontSize: 14 },
  propertyRef: {
    backgroundColor: Colors.accentSoft, borderRadius: Radius.md,
    padding: Spacing.sm, marginBottom: Spacing.md,
  },
  propertyRefLabel: { ...Typography.caption, color: Colors.accent, marginBottom: 2 },
  propertyRefTitle: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '600' },
  contactDetails: { gap: Spacing.sm, marginBottom: Spacing.md },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  contactLabel: { fontSize: 16, width: 28 },
  contactVal: { ...Typography.body, color: Colors.text, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  callBtn: {
    flex: 1, height: 38, borderRadius: Radius.md,
    backgroundColor: Colors.successLight, alignItems: 'center', justifyContent: 'center',
  },
  callBtnText: { ...Typography.bodySmall, color: Colors.success, fontWeight: '700' },
  waBtn: {
    flex: 1, height: 38, borderRadius: Radius.md,
    backgroundColor: '#E8F9EE', alignItems: 'center', justifyContent: 'center',
  },
  waBtnText: { ...Typography.bodySmall, color: '#25D366', fontWeight: '700' },
  emailBtn: {
    flex: 1, height: 38, borderRadius: Radius.md,
    backgroundColor: Colors.accentSoft, alignItems: 'center', justifyContent: 'center',
  },
  emailBtnText: { ...Typography.bodySmall, color: Colors.accent, fontWeight: '700' },
  purchasedAt: { ...Typography.caption, color: Colors.textMuted, textAlign: 'right' },
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