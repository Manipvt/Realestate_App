import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Platform, NativeModules,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import RazorpayCheckout from 'react-native-razorpay';
import Constants from 'expo-constants';
import { AxiosError } from 'axios';
import { paymentApi } from '@/services/api/payment.api';
import { useAuthStore } from '@/store/authStore';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', emoji: '📱', desc: 'Pay via any UPI app' },
  { id: 'card', label: 'Credit / Debit Card', emoji: '💳', desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', emoji: '🏦', desc: 'All major banks' },
];

const isRazorpayAvailable =
  !!RazorpayCheckout && typeof (RazorpayCheckout as { open?: unknown }).open === 'function';

const hasNativeRazorpayModule = Boolean(
  (NativeModules as Record<string, unknown>).RazorpayCheckout ||
  (NativeModules as Record<string, unknown>).RNRazorpayCheckout ||
  (NativeModules as Record<string, unknown>).RazorpayModule
);

export default function PaymentScreen() {
  const { listingId, listingTitle } = useLocalSearchParams<{
    listingId: string; listingTitle: string;
  }>();
  const { user } = useAuthStore();
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isPaying, setIsPaying] = useState(false);

  const UNLOCK_PRICE = 99;
  const gst = Math.round(UNLOCK_PRICE * 0.18);
  const total = UNLOCK_PRICE + gst;

  const handlePay = async () => {
    const resolvedListingId = Array.isArray(listingId) ? listingId[0] : listingId;
    const resolvedListingTitle = Array.isArray(listingTitle) ? listingTitle[0] : listingTitle;

    if (!resolvedListingId) {
      Alert.alert('Missing Listing', 'Property details are missing. Please try again from listing page.');
      return;
    }

    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'Razorpay native checkout works on Android/iOS app builds.');
      return;
    }

    const isExpoGo = Constants.appOwnership === 'expo';
    if (isExpoGo) {
      Alert.alert(
        'Payment Unavailable',
        'Razorpay is not supported in Expo Go. Please run a development build or production build to make payments.'
      );
      return;
    }

    if (!isRazorpayAvailable || !hasNativeRazorpayModule) {
      Alert.alert(
        'Payment Unavailable',
        'Razorpay SDK is not available in this build. Use a Development/Production build (not Expo Go) to complete payments.'
      );
      return;
    }

    setIsPaying(true);

    try {
      const order = await paymentApi.createOrder(resolvedListingId);

      if (order.alreadyUnlocked) {
        Alert.alert('Already Unlocked', order.message || 'Seller contact is already unlocked.', [
          {
            text: 'View Contact',
            onPress: () =>
              router.replace({
                pathname: '/buyer/seller-contact',
                params: { listingId: resolvedListingId, listingTitle: resolvedListingTitle },
              }),
          },
        ]);
        return;
      }

      if (!order.orderId || !order.amount || !order.keyId) {
        throw new Error('Unable to start payment. Please try again.');
      }

      const checkoutOpen = (RazorpayCheckout as { open?: (options: any) => Promise<any> }).open;
      if (typeof checkoutOpen !== 'function') {
        throw new Error('Razorpay checkout is unavailable in this app build.');
      }

      const paymentResult = await checkoutOpen({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'RealEstate App',
        description: 'Unlock seller contact details',
        order_id: order.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: Colors.primary },
      });

      await paymentApi.verifyPayment({
        razorpay_order_id: paymentResult.razorpay_order_id,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_signature: paymentResult.razorpay_signature,
        propertyId: resolvedListingId,
      });

      Alert.alert(
        '✅ Payment Successful!',
        'You can now view the seller\'s contact details.',
        [
          {
            text: 'View Contact',
            onPress: () =>
              router.replace({
                pathname: '/buyer/seller-contact',
                params: { listingId: resolvedListingId, listingTitle: resolvedListingTitle },
              }),
          },
        ]
      );
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error) {
        const razorpayError = error as { code?: number; description?: string };
        if (razorpayError.code === 0 || razorpayError.description?.toLowerCase().includes('cancel')) {
          Alert.alert('Payment Cancelled', 'You cancelled the payment.');
          return;
        }

        Alert.alert('Payment Failed', razorpayError.description || 'Unable to complete payment.');
        return;
      }

      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ||
        (error instanceof Error ? error.message : 'Something went wrong while processing payment.');

      const normalizedMessage =
        message.toLowerCase().includes("cannot read property 'open' of null") ||
        message.toLowerCase().includes('open of null')
          ? 'Razorpay is not available in this app build. Please use a development build or production build.'
          : message;

      Alert.alert('Payment Error', normalizedMessage);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Unlock Contact</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Property preview */}
        <View style={styles.propertyCard}>
          <View style={styles.propertyIconWrap}>
            <Text style={styles.propertyIcon}>🏠</Text>
          </View>
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyLabel}>UNLOCKING CONTACT FOR</Text>
            <Text style={styles.propertyTitle} numberOfLines={2}>{listingTitle}</Text>
          </View>
        </View>

        {/* What you get */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What you get</Text>
          <View style={styles.benefitsList}>
            {[
              { icon: '📞', text: 'Seller\'s phone number' },
              { icon: '✉️', text: 'Seller\'s email address' },
              { icon: '🔄', text: 'Valid for unlimited calls' },
              { icon: '🔒', text: 'Saved in My Contacts forever' },
            ].map((b) => (
              <View key={b.text} style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <Text style={{ fontSize: 18 }}>{b.icon}</Text>
                </View>
                <Text style={styles.benefitText}>{b.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.methodsList}>
            {PAYMENT_METHODS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.methodCard, selectedMethod === m.id && styles.methodCardActive]}
                onPress={() => setSelectedMethod(m.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.methodEmoji}>{m.emoji}</Text>
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodLabel, selectedMethod === m.id && styles.methodLabelActive]}>
                    {m.label}
                  </Text>
                  <Text style={styles.methodDesc}>{m.desc}</Text>
                </View>
                <View style={[styles.radio, selectedMethod === m.id && styles.radioActive]}>
                  {selectedMethod === m.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Order summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Contact Unlock Fee</Text>
              <Text style={styles.summaryVal}>₹{UNLOCK_PRICE}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST (18%)</Text>
              <Text style={styles.summaryVal}>₹{gst}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalVal}>₹{total}</Text>
            </View>
          </View>
        </View>

        {/* Security note */}
        <View style={styles.securityNote}>
          <Text style={styles.securityIcon}>🔐</Text>
          <Text style={styles.securityText}>
            100% secure payment. Your card/UPI details are never stored on our servers.
          </Text>
        </View>
      </ScrollView>

      {/* Pay button */}
      <SafeAreaView style={styles.payContainer} edges={['bottom']}>
        <TouchableOpacity
          style={[styles.payBtn, isPaying && styles.payBtnDisabled]}
          onPress={handlePay}
          disabled={isPaying}
          activeOpacity={0.85}
        >
          {isPaying ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.payBtnText}>Pay ₹{total} & Unlock Contact</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.payNote}>By proceeding, you agree to our Terms of Service</Text>
      </SafeAreaView>
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
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  propertyCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.primary, borderRadius: Radius.lg,
    padding: Spacing.lg, marginBottom: Spacing.xl, ...Shadow.md,
  },
  propertyIconWrap: {
    width: 52, height: 52, borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  propertyIcon: { fontSize: 28 },
  propertyInfo: { flex: 1 },
  propertyLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  propertyTitle: { ...Typography.h4, color: Colors.white },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  benefitsList: { gap: 12 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  benefitIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.accentSoft, alignItems: 'center', justifyContent: 'center',
  },
  benefitText: { ...Typography.body, color: Colors.text, fontWeight: '500' },
  methodsList: { gap: Spacing.sm },
  methodCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border, ...Shadow.sm,
  },
  methodCardActive: { borderColor: Colors.primary, backgroundColor: '#EDF0F7' },
  methodEmoji: { fontSize: 28 },
  methodInfo: { flex: 1 },
  methodLabel: { ...Typography.h4, color: Colors.textSecondary },
  methodLabelActive: { color: Colors.primary },
  methodDesc: { ...Typography.bodySmall, color: Colors.textMuted },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  summaryCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  summaryLabel: { ...Typography.body, color: Colors.textSecondary },
  summaryVal: { ...Typography.body, color: Colors.text, fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  totalLabel: { ...Typography.h3, color: Colors.text },
  totalVal: { ...Typography.h3, color: Colors.accent },
  securityNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.successLight, borderRadius: Radius.md, padding: Spacing.md,
  },
  securityIcon: { fontSize: 18 },
  securityText: { ...Typography.bodySmall, color: Colors.success, flex: 1, lineHeight: 18 },
  payContainer: { backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  payBtn: {
    backgroundColor: Colors.accent, margin: Spacing.lg, marginBottom: Spacing.sm,
    borderRadius: Radius.md, height: 56, alignItems: 'center', justifyContent: 'center',
    ...Shadow.md,
  },
  payBtnDisabled: { opacity: 0.7 },
  payBtnText: { ...Typography.button, color: Colors.white, fontSize: 16 },
  payNote: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center', paddingBottom: Spacing.md },
});