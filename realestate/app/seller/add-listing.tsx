import React, { useState, useCallback, memo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useListingStore } from '@/store/listingStore';
import { useAuthStore } from '@/store/authStore';
import { PropertyType, ListingStatus } from '@/types';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';

const PROPERTY_TYPES = [
  { id: PropertyType.APARTMENT, label: 'Apartment', emoji: '🏢' },
  { id: PropertyType.LAND, label: 'Land', emoji: '🌳' },
  { id: PropertyType.VILLA, label: 'Villa', emoji: '🏡' },
  { id: PropertyType.COMMERCIAL, label: 'Commercial', emoji: '🏬' },
];

const AMENITY_OPTIONS = [
  'Swimming Pool', 'Gym', 'Parking', '24/7 Security', 'Power Backup',
  'Clubhouse', 'Garden', 'Lift', 'CCTV', 'Water Connection', 'Road Facing',
];

const STEPS = ['Basic Info', 'Location', 'Amenities', 'Preview'];

const Field = memo(({ label, field, placeholder, keyboard = 'default', multiline = false, value, onChangeText, error }: {
  label: string; 
  field: string; 
  placeholder?: string; 
  keyboard?: 'default' | 'email-address' | 'number-pad';
  multiline?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputWrap, multiline && styles.inputWrapMulti, error && styles.inputError]}>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboard}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        autoCapitalize="sentences"
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
));

export default function AddListingScreen() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '', description: '', propertyType: PropertyType.APARTMENT,
    price: '', area: '', areaUnit: 'sqft', bedrooms: '', bathrooms: '',
    facing: '', address: '', city: '', state: '', pincode: '',
    amenities: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addListing, isLoading } = useListingStore();
  const { user } = useAuthStore();

  const handleInputChange = useCallback((field: keyof typeof form, value: string) => {
    console.log(`Field changed: ${field} = ${value}`);
    setForm(prev => {
      const newForm = { ...prev, [field]: value };
      console.log('New form state:', newForm);
      return newForm;
    });
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const toggleAmenity = (a: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const validateStep = () => {
    console.log('Validating step:', step);
    console.log('Current form data:', form);
    
    const e: Record<string, string> = {};
    if (step === 0) {
      console.log('Step 0 validation - checking title:', form.title);
      console.log('Step 0 validation - title.trim():', form.title.trim());
      if (!form.title.trim()) {
        e.title = 'Title is required';
        console.log('Title validation failed');
      }
      
      console.log('Step 0 validation - checking description:', form.description);
      console.log('Step 0 validation - description.trim():', form.description.trim());
      if (!form.description.trim()) {
        e.description = 'Description is required';
        console.log('Description validation failed');
      }
      
      console.log('Step 0 validation - checking price:', form.price);
      if (!form.price) {
        e.price = 'Price is required';
        console.log('Price validation failed');
      }
      
      console.log('Step 0 validation - checking area:', form.area);
      if (!form.area.trim()) {
        e.area = 'Area is required';
        console.log('Area validation failed');
      }
    }
    if (step === 1) {
      console.log('Step 1 validation - checking address:', form.address);
      if (!form.address.trim()) {
        e.address = 'Address is required';
        console.log('Address validation failed');
      }
      
      console.log('Step 1 validation - checking state:', form.state);
      if (!form.state.trim()) {
        e.state = 'State is required';
        console.log('State validation failed');
      }
      
      console.log('Step 1 validation - checking pincode:', form.pincode);
      if (!form.pincode.trim()) {
        e.pincode = 'Pincode is required';
        console.log('Pincode validation failed');
      }
    }
    
    console.log('Final validation errors:', e);
    setErrors(e);
    const isValid = Object.keys(e).length === 0;
    console.log('Is valid:', isValid);
    return isValid;
  };

  const handleNext = () => {
    console.log('Next button pressed, current step:', step);
    const isValid = validateStep();
    console.log('Validation result:', isValid);
    if (!isValid) {
      console.log('Validation failed, not proceeding');
      return;
    }
    if (step < STEPS.length - 1) {
      console.log('Moving to step:', step + 1);
      setStep((s) => s + 1);
    } else {
      console.log('Already at last step');
    }
  };

  const handleSubmit = async () => {
    console.log('Submit button pressed');
    console.log('Form data:', form);
    console.log('User:', user);
    
    try {
      console.log('Calling addListing...');
      const listingData = {
        title: form.title, 
        description: form.description,
        propertyType: form.propertyType,
        price: Number(form.price), 
        area: Number(form.area),
        areaUnit: form.areaUnit as 'sqft',
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        facing: form.facing || undefined,
        location: { 
          address: form.address, 
          city: form.city, 
          state: form.state, 
          pincode: form.pincode, 
          coordinates: { lat: 0, lng: 0 } 
        },
        amenities: form.amenities,
        sellerId: user?.id ?? '',
        sellerName: user?.name ?? '',
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
        status: ListingStatus.ACTIVE,
      };
      console.log('Listing data to send:', listingData);
      
      await addListing(listingData);
      console.log('Listing added successfully');
      Alert.alert('🎉 Listed!', 'Your property is now live.', [
        { text: 'View Listings', onPress: () => router.replace('/seller/my-listing') },
      ]);
    } catch (error: any) {
      console.error('Error adding listing:', error);
      console.error('Error response:', error?.response?.data);
      Alert.alert('Error', `Failed to add listing: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => step > 0 ? setStep((s) => s - 1) : router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Listing</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, i <= step && styles.stepDotActive, i < step && styles.stepDotDone]}>
                <Text style={[styles.stepDotText, i <= step && styles.stepDotTextActive]}>
                  {i < step ? '✓' : i + 1}
                </Text>
              </View>
              <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{s}</Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, i < step && styles.stepLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {step === 0 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Basic Information</Text>

              {/* Property type */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>PROPERTY TYPE</Text>
                <View style={styles.typeRow}>
                  {PROPERTY_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.typeCard, form.propertyType === t.id && styles.typeCardActive]}
                      onPress={() => setForm((f) => ({ ...f, propertyType: t.id }))}
                    >
                      <Text style={styles.typeEmoji}>{t.emoji}</Text>
                      <Text style={[styles.typeLabel, form.propertyType === t.id && styles.typeLabelActive]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Field 
                label="LISTING TITLE" 
                field="title" 
                placeholder="e.g. Luxury 3BHK in Bandra West" 
                value={form.title}
                onChangeText={(t: string) => handleInputChange('title', t)}
                error={errors.title}
              />
              <Field 
                label="DESCRIPTION" 
                field="description" 
                placeholder="Describe the property in detail…" 
                multiline
                value={form.description}
                onChangeText={(t: string) => handleInputChange('description', t)}
                error={errors.description}
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Field 
                    label="PRICE (₹)" 
                    field="price" 
                    placeholder="e.g. 5000000" 
                    keyboard="number-pad"
                    value={form.price}
                    onChangeText={(t: string) => handleInputChange('price', t)}
                    error={errors.price}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Field 
                    label="AREA" 
                    field="area" 
                    placeholder="Area size" 
                    keyboard="number-pad"
                    value={form.area}
                    onChangeText={(t: string) => handleInputChange('area', t)}
                    error={errors.area}
                  />
                </View>
                <View style={styles.unitPicker}>
                  <Text style={styles.label}>UNIT</Text>
                  {['sqft', 'sqmt', 'acre'].map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.unitBtn, form.areaUnit === u && styles.unitBtnActive]}
                      onPress={() => setForm((f) => ({ ...f, areaUnit: u }))}
                    >
                      <Text style={[styles.unitBtnText, form.areaUnit === u && styles.unitBtnTextActive]}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {(form.propertyType === PropertyType.APARTMENT || form.propertyType === PropertyType.VILLA) && (
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Field 
                      label="BEDROOMS" 
                      field="bedrooms" 
                      placeholder="No. of beds" 
                      keyboard="number-pad"
                      value={form.bedrooms}
                      onChangeText={(t: string) => handleInputChange('bedrooms', t)}
                      error={errors.bedrooms}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field 
                      label="BATHROOMS" 
                      field="bathrooms" 
                      placeholder="No. of baths" 
                      keyboard="number-pad"
                      value={form.bathrooms}
                      onChangeText={(t: string) => handleInputChange('bathrooms', t)}
                      error={errors.bathrooms}
                    />
                  </View>
                </View>
              )}
              <Field label="FACING (optional)" field="facing" placeholder="e.g. North, East-West" value={form.facing} onChangeText={(t: string) => handleInputChange('facing', t)} error={errors.facing} />
            </View>
          )}

          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Location Details</Text>
              <Field 
                label="STREET ADDRESS" 
                field="address" 
                placeholder="Street name, building no." 
                value={form.address}
                onChangeText={(t: string) => handleInputChange('address', t)}
                error={errors.address}
              />
              <Field 
                label="CITY" 
                field="city" 
                value={form.city}
                onChangeText={(t: string) => handleInputChange('city', t)}
                error={errors.city}
              />
              <Field 
                label="STATE" 
                field="state" 
                value={form.state}
                onChangeText={(t: string) => handleInputChange('state', t)}
                error={errors.state}
              />
              <Field 
                label="PINCODE" 
                field="pincode" 
                value={form.pincode}
                onChangeText={(t: string) => handleInputChange('pincode', t)}
                error={errors.pincode}
              />
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepSubtitle}>Select all that apply</Text>
              <View style={styles.amenityGrid}>
                {AMENITY_OPTIONS.map((a) => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.amenityChip, form.amenities.includes(a) && styles.amenityChipActive]}
                    onPress={() => toggleAmenity(a)}
                  >
                    <Text style={styles.amenityCheck}>{form.amenities.includes(a) ? '✓ ' : ''}</Text>
                    <Text style={[styles.amenityText, form.amenities.includes(a) && styles.amenityTextActive]}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Review & Publish</Text>
              <View style={styles.previewCard}>
                <View style={styles.previewRow}><Text style={styles.previewKey}>Title</Text><Text style={styles.previewVal}>{form.title}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewKey}>Type</Text><Text style={styles.previewVal}>{form.propertyType}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewKey}>Price</Text><Text style={styles.previewVal}>₹{Number(form.price).toLocaleString('en-IN')}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewKey}>Area</Text><Text style={styles.previewVal}>{form.area} {form.areaUnit}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewKey}>Location</Text><Text style={styles.previewVal}>{form.city}, {form.state}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewKey}>Amenities</Text><Text style={styles.previewVal}>{form.amenities.length} selected</Text></View>
              </View>
              <View style={styles.publishNote}>
                <Text style={styles.publishNoteText}>
                  🔍 Your listing will be visible to thousands of buyers immediately after publishing.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom actions */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        {step < STEPS.length - 1 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>Continue →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, styles.publishBtn, isLoading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.nextBtnText}>🚀 Publish Listing</Text>
            }
          </TouchableOpacity>
        )}
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
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center', ...Shadow.sm,
  },
  backText: { fontSize: 20, color: Colors.text },
  headerTitle: { ...Typography.h3, color: Colors.text },
  stepRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: Colors.primary },
  stepDotDone: { backgroundColor: Colors.success },
  stepDotText: { ...Typography.caption, color: Colors.textMuted, fontWeight: '700' },
  stepDotTextActive: { color: Colors.white },
  stepLine: { flex: 1, height: 2, backgroundColor: Colors.border, marginTop: -16 },
  stepLineActive: { backgroundColor: Colors.success },
  stepLabel: { ...Typography.caption, color: Colors.textMuted },
  stepLabelActive: { color: Colors.primary, fontWeight: '700' },
  scroll: { padding: Spacing.lg, paddingBottom: 120 },
  stepContent: {},
  stepTitle: { ...Typography.h2, color: Colors.text, marginBottom: 4 },
  stepSubtitle: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.lg },
  fieldGroup: { marginBottom: Spacing.md },
  label: { ...Typography.label, color: Colors.textMuted, marginBottom: 8 },
  inputWrap: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, backgroundColor: Colors.surface, height: 52,
    justifyContent: 'center',
  },
  inputWrapMulti: { height: 100, paddingTop: Spacing.sm, paddingBottom: Spacing.sm },
  inputError: { borderColor: Colors.error },
  input: { ...Typography.body, color: Colors.text },
  inputMulti: { height: 90 },
  errorText: { ...Typography.bodySmall, color: Colors.error, marginTop: 4 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 0 },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeCard: {
    flex: 1, borderRadius: Radius.md, padding: 12, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface, gap: 4,
  },
  typeCardActive: { borderColor: Colors.primary, backgroundColor: '#EDF0F7' },
  typeEmoji: { fontSize: 22 },
  typeLabel: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '600' },
  typeLabelActive: { color: Colors.primary },
  unitPicker: { width: 80, gap: 6 },
  unitBtn: {
    paddingVertical: 6, borderRadius: Radius.sm, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  unitBtnActive: { borderColor: Colors.primary, backgroundColor: '#EDF0F7' },
  unitBtnText: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '600' },
  unitBtnTextActive: { color: Colors.primary },
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityChip: {
    flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface, alignItems: 'center',
  },
  amenityChipActive: { backgroundColor: Colors.successLight, borderColor: Colors.success },
  amenityCheck: { color: Colors.success, fontWeight: '700', fontSize: 12 },
  amenityText: { ...Typography.bodySmall, color: Colors.textSecondary, fontWeight: '500' },
  amenityTextActive: { color: Colors.success },
  previewCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
    gap: Spacing.sm, marginBottom: Spacing.lg, ...Shadow.sm,
  },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  previewKey: { ...Typography.bodySmall, color: Colors.textMuted, fontWeight: '600', width: 80 },
  previewVal: { ...Typography.body, color: Colors.text, flex: 1, textAlign: 'right' },
  publishNote: {
    backgroundColor: Colors.accentSoft, borderRadius: Radius.md, padding: Spacing.md,
  },
  publishNoteText: { ...Typography.body, color: Colors.accent, lineHeight: 22 },
  bottomBar: {
    backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  nextBtn: {
    backgroundColor: Colors.primary, margin: Spacing.lg, marginBottom: Spacing.sm,
    borderRadius: Radius.md, height: 56, alignItems: 'center', justifyContent: 'center',
    ...Shadow.md,
  },
  publishBtn: { backgroundColor: Colors.success },
  btnDisabled: { opacity: 0.7 },
  nextBtnText: { ...Typography.button, color: Colors.white, fontSize: 16 },
});