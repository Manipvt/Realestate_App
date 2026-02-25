import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';

const { height } = Dimensions.get('window');

const OPTIONS = [
  {
    role: UserRole.BUYER,
    title: 'I want to Buy',
    subtitle: 'Browse land, apartments & villas. Connect with sellers.',
    emoji: '🔍',
    bg: '#EDF0F7',
    border: Colors.primary,
    features: ['Browse all listings', 'Save favourites', 'Contact sellers securely'],
  },
  {
    role: UserRole.SELLER,
    title: 'I want to Sell',
    subtitle: 'List your properties. Get genuine inquiries from buyers.',
    emoji: '🏠',
    bg: '#FBF0E8',
    border: Colors.accent,
    features: ['List unlimited properties', 'Upload photos', 'Track buyer leads'],
  },
];

export default function RoleSelectionScreen() {
  const [selected, setSelected] = useState<UserRole | null>(null);
  const { setRole } = useAuthStore();

  const handleContinue = () => {
    if (!selected) return;
    setRole(selected);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>RE</Text>
          </View>
          <Text style={styles.title}>How will you use{'\n'}PropEstate?</Text>
          <Text style={styles.subtitle}>You can always switch later in your profile settings</Text>
        </View>

        <View style={styles.cards}>
          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.role}
              style={[
                styles.card,
                { backgroundColor: selected === opt.role ? opt.bg : Colors.surface },
                selected === opt.role && { borderColor: opt.border, borderWidth: 2 },
              ]}
              onPress={() => setSelected(opt.role)}
              activeOpacity={0.85}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardEmoji}>{opt.emoji}</Text>
                <View style={[styles.radio, selected === opt.role && styles.radioActive, { borderColor: opt.border }]}>
                  {selected === opt.role && <View style={[styles.radioDot, { backgroundColor: opt.border }]} />}
                </View>
              </View>
              <Text style={styles.cardTitle}>{opt.title}</Text>
              <Text style={styles.cardSubtitle}>{opt.subtitle}</Text>
              <View style={styles.features}>
                {opt.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Text style={[styles.featureCheck, { color: opt.border }]}>✓</Text>
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.btn, !selected && styles.btnDisabled]}
            onPress={handleContinue}
            disabled={!selected}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Continue →</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setRole(UserRole.BOTH); router.replace('/(tabs)'); }}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>I do both — skip this step</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: Spacing.lg, justifyContent: 'space-between', paddingBottom: Spacing.lg },
  topSection: { paddingTop: Spacing.xl, alignItems: 'flex-start' },
  logoMark: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  logoText: { ...Typography.h3, color: Colors.white, fontWeight: '800' },
  title: { ...Typography.h1, color: Colors.text, marginBottom: 8, lineHeight: 36 },
  subtitle: { ...Typography.body, color: Colors.textSecondary },
  cards: { gap: Spacing.md, flex: 1, justifyContent: 'center' },
  card: {
    borderRadius: Radius.xl, padding: Spacing.xl,
    borderWidth: 1.5, borderColor: Colors.border,
    ...Shadow.sm,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  cardEmoji: { fontSize: 32 },
  radio: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: {},
  radioDot: { width: 12, height: 12, borderRadius: 6 },
  cardTitle: { ...Typography.h2, color: Colors.text, marginBottom: 6 },
  cardSubtitle: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.md },
  features: { gap: 6 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureCheck: { fontSize: 14, fontWeight: '700' },
  featureText: { ...Typography.bodySmall, color: Colors.textSecondary },
  bottom: { gap: Spacing.md },
  btn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    height: 56, alignItems: 'center', justifyContent: 'center',
    ...Shadow.md,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { ...Typography.button, color: Colors.white, fontSize: 16 },
  skipBtn: { alignItems: 'center', padding: Spacing.sm },
  skipText: { ...Typography.body, color: Colors.accent, fontWeight: '600' },
});