import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme-color';

const BUYER_MENU = [
  { icon: '❤️', label: 'Saved Properties', route: '/buyer/saved-listings' },
  { icon: '📞', label: 'Purchased Contacts', route: '/buyer/my-contacts' },
];

const SELLER_MENU = [
  { icon: '🏠', label: 'My Listings', route: '/seller/my-listing' },
  { icon: '➕', label: 'Add New Listing', route: '/seller/add-listing' },
  { icon: '👥', label: 'Buyer Leads', route: '/seller/leads' },
];

const GENERAL_MENU = [
  { icon: '🔔', label: 'Notifications' },
  { icon: '🔒', label: 'Privacy & Security' },
  { icon: '❓', label: 'Help & Support' },
  { icon: '⭐', label: 'Rate the App' },
];

function MenuRow({ icon, label, route, onPress, colors }: { icon: string; label: string; route?: string; onPress?: () => void, colors: any }) {
  return (
    <TouchableOpacity
      style={styles.menuRow}
      onPress={onPress ?? (() => route && router.push(route as any))}
      activeOpacity={0.7}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.menuIconWrap, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={styles.menuIcon}>{icon}</Text>
        </View>
        <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const colors = useTheme();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  const isSeller = user?.role === UserRole.SELLER || user?.role === UserRole.BOTH;
  const isBuyer = user?.role === UserRole.BUYER || user?.role === UserRole.BOTH;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Profile</Text>
        </View>

        {/* User card */}
        <View style={[styles.userCard, { backgroundColor: colors.primary }]}>
          <View style={styles.avatarWrap}>
            {user?.avatar
              ? <Image source={{ uri: user.avatar }} style={styles.avatar} />
              : (
                <View style={[styles.avatarFallback, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.avatarLetter, { color: colors.white }]}>{user?.name?.[0]}</Text>
                </View>
              )
            }
            <View style={[styles.rolePill, isSeller && isBuyer ? [styles.roleBoth, { backgroundColor: colors.accent }] : isSeller ? styles.roleSeller : styles.roleBuyer]}>
              <Text style={[styles.roleText, { color: colors.white }]}>
                {isSeller && isBuyer ? '⚡ Buyer & Seller' : isSeller ? '🏠 Seller' : '🔍 Buyer'}
              </Text>
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.white }]}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.userPhone}>{user?.phone}</Text>
          </View>
          {isSeller && user?.sellerProfile && (
            <View style={styles.sellerStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: colors.white }]}>{user.sellerProfile.totalListings}</Text>
                <Text style={styles.statLabel}>Listings</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: colors.white }]}>⭐ {user.sellerProfile.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: colors.white }]}>{user.verified ? '✓' : '✗'}</Text>
                <Text style={styles.statLabel}>Verified</Text>
              </View>
            </View>
          )}
        </View>

        {/* Buyer menu */}
        {isBuyer && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Buyer</Text>
            <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {BUYER_MENU.map((m, i) => (
                <View key={m.label}>
                  <MenuRow {...m} colors={colors} />
                  {i < BUYER_MENU.length - 1 && <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Seller menu */}
        {isSeller && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Seller</Text>
            <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {SELLER_MENU.map((m, i) => (
                <View key={m.label}>
                  <MenuRow {...m} colors={colors} />
                  {i < SELLER_MENU.length - 1 && <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* General menu */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>General</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {GENERAL_MENU.map((m, i) => (
              <View key={m.label}>
                <MenuRow icon={m.icon} label={m.label} colors={colors} />
                {i < GENERAL_MENU.length - 1 && <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />}
              </View>
            ))}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.error, backgroundColor: colors.errorLight }]} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textMuted }]}>PropEstate v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 100 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  pageTitle: { ...Typography.h1 },
  userCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl, padding: Spacing.xl, marginBottom: Spacing.lg,
    ...Shadow.lg,
  },
  avatarWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  avatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  avatarFallback: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { ...Typography.h1 },
  rolePill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  roleBoth: {},
  roleSeller: { backgroundColor: 'rgba(255,255,255,0.2)' },
  roleBuyer: { backgroundColor: 'rgba(255,255,255,0.2)' },
  roleText: { ...Typography.bodySmall, fontWeight: '700' },
  userInfo: { marginBottom: Spacing.md },
  userName: { ...Typography.h2, marginBottom: 4 },
  userEmail: { ...Typography.body, color: 'rgba(255,255,255,0.7)' },
  userPhone: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  sellerStats: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.md, paddingVertical: Spacing.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { ...Typography.h3 },
  statLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { ...Typography.label, marginLeft: Spacing.lg, marginBottom: Spacing.sm },
  menuCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg, ...Shadow.sm,
    borderWidth: 1,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  menuIcon: { fontSize: 18 },
  menuLabel: { ...Typography.body },
  menuArrow: { fontSize: 20 },
  divider: { height: 1, marginLeft: 68 },
  logoutBtn: {
    marginHorizontal: Spacing.lg, borderRadius: Radius.md, height: 52,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  logoutText: { ...Typography.button },
  version: { ...Typography.caption, textAlign: 'center', marginBottom: Spacing.lg },
});