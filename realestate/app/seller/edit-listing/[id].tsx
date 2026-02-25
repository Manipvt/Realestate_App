import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function EditListingScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	return (
		<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
			<View style={styles.content}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
					<Text style={styles.backText}>← Back</Text>
				</TouchableOpacity>
				<Text style={styles.title}>Edit Listing</Text>
				<Text style={styles.subtitle}>Listing ID: {id}</Text>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	content: {
		flex: 1,
		padding: Spacing.lg,
	},
	backButton: {
		marginBottom: Spacing.lg,
	},
	backText: {
		...Typography.body,
		color: Colors.primary,
		fontWeight: '600',
	},
	title: {
		...Typography.h2,
		color: Colors.text,
		marginBottom: Spacing.sm,
	},
	subtitle: {
		...Typography.body,
		color: Colors.textSecondary,
	},
});
