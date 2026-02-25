import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Listing } from '@/types/listing.types';
import { router } from 'expo-router';

interface PropertyCardProps {
  listing: Listing;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ listing }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/buyer/listing-details/${listing.id}`)}
    >
      <Image source={{ uri: listing.images[0] }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.location}>
          {listing.location.city}, {listing.location.state}
        </Text>
        <View style={styles.details}>
          <Text style={styles.price}>Contact for Price</Text>
          <Text style={styles.area}>{listing.area} sq ft</Text>
        </View>
        <Text style={styles.type}>{listing.propertyType}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  area: {
    fontSize: 14,
    color: '#666',
  },
  type: {
    fontSize: 12,
    color: '#888',
    textTransform: 'capitalize',
  },
});