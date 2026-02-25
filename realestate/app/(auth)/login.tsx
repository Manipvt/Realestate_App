import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login, isLoading } = useAuthStore();

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch {
      setErrors({ email: 'Invalid credentials. Please try again.' });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand header */}
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>RE</Text>
          </View>
          <Text style={styles.brand}>PropEstate</Text>
          <Text style={styles.tagline}>Discover your perfect space</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <View style={[styles.inputWrap, errors.email ? styles.inputError : null]}>
              <Text style={styles.inputIcon}>✉</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={[styles.inputWrap, errors.password ? styles.inputError : null]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                <Text style={styles.togglePwd}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, isLoading && styles.btnDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            <Text style={styles.btnText}>{isLoading ? 'Signing in…' : 'Sign In'}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.85}
          >
            <Text style={styles.outlineBtnText}>Create an account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>
          By signing in, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {' & '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  header: { alignItems: 'center', paddingTop: Spacing.xxl, paddingBottom: Spacing.xl },
  logoMark: {
    width: 60, height: 60, borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  logoText: { ...Typography.h2, color: Colors.white, fontWeight: '800' },
  brand: { ...Typography.h1, color: Colors.primary, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { ...Typography.body, color: Colors.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadow.lg,
  },
  title: { ...Typography.h2, color: Colors.text, marginBottom: 4 },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.xl },
  fieldGroup: { marginBottom: Spacing.md },
  label: { ...Typography.label, color: Colors.textMuted, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background, height: 52,
  },
  inputError: { borderColor: Colors.error },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, ...Typography.body, color: Colors.text, height: '100%' },
  togglePwd: { ...Typography.bodySmall, color: Colors.accent, fontWeight: '600' },
  errorText: { ...Typography.bodySmall, color: Colors.error, marginTop: 4 },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: Spacing.lg, marginTop: -4 },
  forgotText: { ...Typography.bodySmall, color: Colors.accent, fontWeight: '600' },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { ...Typography.button, color: Colors.white, letterSpacing: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { ...Typography.bodySmall, color: Colors.textMuted, marginHorizontal: 12 },
  outlineBtn: {
    borderWidth: 1.5, borderColor: Colors.primary,
    borderRadius: Radius.md, height: 54,
    alignItems: 'center', justifyContent: 'center',
  },
  outlineBtnText: { ...Typography.button, color: Colors.primary },
  terms: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.lg },
  termsLink: { color: Colors.accent, fontWeight: '600' },
});