import React, { useState, useCallback, memo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';

const ROLES = [
  { id: UserRole.BUYER, label: 'Buyer', emoji: '🔍', desc: 'Browse & discover properties' },
  { id: UserRole.SELLER, label: 'Seller', emoji: '🏠', desc: 'List & sell your properties' },
];

const Field = memo(({ label, field, placeholder, keyboard = 'default', secure = false, value, onChangeText, error }: any) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputWrap, error ? styles.inputError : null]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboard}
        secureTextEntry={secure}
        autoCapitalize={field === 'email' ? 'none' : 'words'}
        autoCorrect={false}
      />
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
));

export default function RegisterScreen() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: UserRole.BUYER });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, isLoading } = useAuthStore();

  const handleInputChange = useCallback((field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else {
      const phoneDigits = form.phone.replace(/\D/g, '');
      if (!/^([6-9]\d{9}|91[6-9]\d{9})$/.test(phoneDigits)) {
        e.phone = 'Enter a valid Indian phone number';
      }
    }
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await register(form);
      router.replace('/(tabs)');
    } catch (error: any) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message || 'Registration failed. Try again.'
        : 'Registration failed. Try again.';
      setErrors({ email: message });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join thousands of property seekers & sellers</Text>

          {/* Role selection */}
          <View style={styles.roleSection}>
            <Text style={styles.label}>I AM A</Text>
            <View style={styles.roleRow}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roleCard, form.role === r.id && styles.roleCardActive]}
                  onPress={() => setForm((f) => ({ ...f, role: r.id }))}
                  activeOpacity={0.8}
                >
                  <Text style={styles.roleEmoji}>{r.emoji}</Text>
                  <Text style={[styles.roleLabel, form.role === r.id && styles.roleLabelActive]}>
                    {r.label}
                  </Text>
                  <Text style={[styles.roleDesc, form.role === r.id && styles.roleDescActive]}>
                    {r.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Field 
              label="FULL NAME" 
              field="name" 
              placeholder="Your full name" 
              value={form.name}
              onChangeText={(t: string) => handleInputChange('name', t)}
              error={errors.name}
            />
            <Field 
              label="EMAIL ADDRESS" 
              field="email" 
              placeholder="you@example.com" 
              keyboard="email-address" 
              value={form.email}
              onChangeText={(t: string) => handleInputChange('email', t)}
              error={errors.email}
            />
            <Field 
              label="PHONE NUMBER" 
              field="phone" 
              placeholder="+91 98765 43210" 
              keyboard="phone-pad" 
              value={form.phone}
              onChangeText={(t: string) => handleInputChange('phone', t)}
              error={errors.phone}
            />
            <Field 
              label="PASSWORD" 
              field="password" 
              placeholder="Min. 6 characters" 
              secure 
              value={form.password}
              onChangeText={(t: string) => handleInputChange('password', t)}
              error={errors.password}
            />

            <TouchableOpacity
              style={[styles.btn, isLoading && styles.btnDisabled]}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <Text style={styles.btnText}>{isLoading ? 'Creating account…' : 'Create Account'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  back: { marginTop: Spacing.md, marginBottom: Spacing.lg },
  backText: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
  title: { ...Typography.h1, color: Colors.text, marginBottom: 6 },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.xl },
  roleSection: { marginBottom: Spacing.xl },
  label: { ...Typography.label, color: Colors.textMuted, marginBottom: 10 },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleCard: {
    flex: 1, borderRadius: Radius.md, padding: 12,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface, alignItems: 'center',
  },
  roleCardActive: { borderColor: Colors.primary, backgroundColor: '#EDF0F7' },
  roleEmoji: { fontSize: 20, marginBottom: 4 },
  roleLabel: { ...Typography.h4, color: Colors.textSecondary, marginBottom: 2 },
  roleLabelActive: { color: Colors.primary },
  roleDesc: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center' },
  roleDescActive: { color: Colors.primaryLight },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadow.md,
    marginBottom: Spacing.lg,
  },
  fieldGroup: { marginBottom: Spacing.md },
  inputWrap: {
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background, height: 52,
    flexDirection: 'row', alignItems: 'center',
  },
  inputError: { borderColor: Colors.error },
  input: { flex: 1, ...Typography.body, color: Colors.text },
  errorText: { ...Typography.bodySmall, color: Colors.error, marginTop: 4 },
  btn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    height: 54, alignItems: 'center', justifyContent: 'center',
    marginTop: Spacing.md, ...Shadow.sm,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { ...Typography.button, color: Colors.white, letterSpacing: 0.5 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { ...Typography.body, color: Colors.textSecondary },
  loginLink: { ...Typography.body, color: Colors.accent, fontWeight: '700' },
});