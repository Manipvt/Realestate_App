import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';

const MOCK_LEADS = [
  {
    id: '1', buyerName: 'Amit Kumar', buyerPhone: '+91 99887 76655',
    buyerEmail: 'amit.k@gmail.com', listingTitle: 'Agricultural Land in Nashik',
    listingId: '5', amount: 117, purchasedAt: '2024-01-20T09:15:00Z',
    message: 'Interested in viewing the land this weekend',
  },
  {
    id: '2', buyerName: 'Sneha Joshi', buyerPhone: '+91 88776 65544',
    buyerEmail: 'sneha.j@yahoo.com', listingTitle: 'Agricultural Land in Nashik',
    listingId: '5', amount: 117, purchasedAt: '2024-01-18T14:30:00Z',
    message: null,
  },
  {
    id: '3', buyerName: 'Rajesh Nair', buyerPhone: '+91 77665 54433',
    buyerEmail: 'r.nair@gmail.com', listingTitle: 'Agricultural Land in Nashik',
    listingId: '5', amount: 117, purchasedAt: '2024-01-15T11:00:00Z',
    message: 'Looking for agricultural land, can we schedule a call?',
  },
];

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000 / 60 / 60 / 24);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff} days ago`;
}

export default function LeadsScreen() {
  const totalRevenue = MOCK_LEADS.reduce((a, l) => a + l.amount, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Buyer Leads</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Revenue card */}
      <View style={styles.revenueCard}>
        <View style={styles.revenueItem}>
          <Text style={styles.revenueNum}>{MOCK_LEADS.length}</Text>
          <Text style={styles.revenueLabel}>Total Leads</Text>
        </View>
        <View style={styles.revenueDivider} />
        <View style={styles.revenueItem}>
          <Text style={styles.revenueNum}>₹{totalRevenue}</Text>
          <Text style={styles.revenueLabel}>Revenue Earned</Text>
        </View>
        <View style={styles.revenueDivider} />
        <View style={styles.revenueItem}>
          <Text style={styles.revenueNum}>{MOCK_LEADS.filter((l) => l.message).length}</Text>
          <Text style={styles.revenueLabel}>With Message</Text>
        </View>
      </View>

      <FlatList
        data={MOCK_LEADS}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Buyer header */}
            <View style={styles.cardHeader}>
              <View style={styles.buyerAvatar}>
                <Text style={styles.buyerAvatarText}>{item.buyerName[0]}</Text>
              </View>
              <View style={styles.buyerInfo}>
                <Text style={styles.buyerName}>{item.buyerName}</Text>
                <Text style={styles.leadTime}>{timeAgo(item.purchasedAt)}</Text>
              </View>
              <View style={styles.amountBadge}>
                <Text style={styles.amountText}>+₹{item.amount}</Text>
              </View>
            </View>

            {/* Property */}
            <View style={styles.propertyRef}>
              <Text style={styles.propertyRefLabel}>INTERESTED IN</Text>
              <Text style={styles.propertyRefTitle} numberOfLines={1}>{item.listingTitle}</Text>
            </View>

            {/* Message */}
            {item.message && (
              <View style={styles.messageBox}>
                <Text style={styles.messageLabel}>💬 Buyer's message:</Text>
                <Text style={styles.messageText}>"{item.message}"</Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => Linking.openURL(`tel:${item.buyerPhone}`)}
              >
                <Text style={styles.callBtnText}>📞 Call Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.waBtn}
                onPress={() => {
                  const num = item.buyerPhone.replace(/\D/g, '');
                  Linking.openURL(`https://wa.me/${num}`);
                }}
              >
                <Text style={styles.waBtnText}>💬 WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyTitle}>No leads yet</Text>
            <Text style={styles.emptySub}>When buyers unlock your contact, they'll appear here</Text>
          </View>
        }
      />
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
  revenueCard: {
    flexDirection: 'row', backgroundColor: Colors.primary,
    margin: Spacing.lg, borderRadius: Radius.xl, padding: Spacing.lg,
    ...Shadow.lg,
  },
  revenueItem: { flex: 1, alignItems: 'center' },
  revenueNum: { ...Typography.h2, color: Colors.white, marginBottom: 4 },
  revenueLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.6)' },
  revenueDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    marginBottom: Spacing.md, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  buyerAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  buyerAvatarText: { ...Typography.h3, color: Colors.white },
  buyerInfo: { flex: 1 },
  buyerName: { ...Typography.h4, color: Colors.text },
  leadTime: { ...Typography.caption, color: Colors.textMuted },
  amountBadge: {
    backgroundColor: Colors.successLight, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 4,
  },
  amountText: { ...Typography.bodySmall, color: Colors.success, fontWeight: '700' },
  propertyRef: {
    backgroundColor: Colors.accentSoft, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: Spacing.md,
  },
  propertyRefLabel: { ...Typography.caption, color: Colors.accent, marginBottom: 2 },
  propertyRefTitle: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '600' },
  messageBox: {
    backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md,
    padding: Spacing.sm, marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  messageLabel: { ...Typography.caption, color: Colors.textSecondary, marginBottom: 4 },
  messageText: { ...Typography.bodySmall, color: Colors.text, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  callBtn: {
    flex: 1, height: 40, borderRadius: Radius.md,
    backgroundColor: Colors.successLight, alignItems: 'center', justifyContent: 'center',
  },
  callBtnText: { ...Typography.bodySmall, color: Colors.success, fontWeight: '700' },
  waBtn: {
    flex: 1, height: 40, borderRadius: Radius.md,
    backgroundColor: '#E8F9EE', alignItems: 'center', justifyContent: 'center',
  },
  waBtnText: { ...Typography.bodySmall, color: '#25D366', fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.sm },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { ...Typography.h2, color: Colors.text },
  emptySub: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center' },
});