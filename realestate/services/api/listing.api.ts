import { apiClient } from './client';
import { Listing } from '@/types/listing.types';

const normalizeFacing = (facing?: string) => {
  if (!facing) return undefined;
  return facing.trim().toLowerCase().replace(/[\s_]+/g, '-');
};

const normalizeAreaUnit = (unit?: string) => {
  if (!unit) return 'sqft';
  const normalized = unit.trim().toLowerCase();
  if (normalized === 'acre') return 'acres';
  return normalized;
};

const mapPropertyToListing = (property: any): Listing => ({
  id: property.id || property._id,
  sellerId: property.sellerId || property.seller || '',
  sellerName: property.sellerName || '',
  title: property.title,
  description: property.description,
  propertyType: property.propertyType,
  price: property.price,
  area: property.area?.value ?? property.area ?? 0,
  areaUnit: property.area?.unit ?? property.areaUnit ?? 'sqft',
  location: {
    address: property.location?.address || '',
    city: property.location?.city || '',
    state: property.location?.state || '',
    pincode: property.location?.pincode || '',
    coordinates: {
      lat: property.location?.coordinates?.latitude ?? property.location?.coordinates?.lat ?? 0,
      lng: property.location?.coordinates?.longitude ?? property.location?.coordinates?.lng ?? 0,
    },
  },
  amenities: [
    ...(property.amenities?.electricity ? ['Electricity'] : []),
    ...(property.amenities?.water ? ['Water Connection'] : []),
    ...(property.amenities?.drainage ? ['Drainage'] : []),
    ...(property.amenities?.boundaryWall ? ['Boundary Wall'] : []),
  ],
  images: (property.images || []).map((img: any) => (typeof img === 'string' ? img : img?.url)).filter(Boolean),
  status: property.status,
  contactViews: property.contactViews || 0,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  facing: property.facing,
  age: property.age,
  createdAt: property.createdAt,
  updatedAt: property.updatedAt,
});

const isLocalImageUri = (uri: string) => /^(file|content|ph):/i.test(uri);

export const listingApi = {
  // Get all listings with filters
  getListings: async (filters?: {
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    city?: string;
  }) => {
    const response = await apiClient.get('/properties', { params: filters });
    const properties = response.data.properties || response.data || [];
    return properties.map(mapPropertyToListing);
  },

  // Get single listing
  getListing: async (id: string) => {
    const response = await apiClient.get(`/properties/${id}`);
    const property = response.data.property || response.data;
    return mapPropertyToListing(property);
  },

  // Create listing (seller)
  createListing: async (listing: Partial<Listing>) => {
    const payload = {
      title: listing.title,
      description: listing.description,
      propertyType: listing.propertyType,
      price: listing.price,
      facing: normalizeFacing(listing.facing),
      area: {
        value: listing.area,
        unit: normalizeAreaUnit(listing.areaUnit),
      },
      location: {
        address: listing.location?.address || '',
        city: listing.location?.city || '',
        state: listing.location?.state || '',
        pincode: listing.location?.pincode || '',
        coordinates: {
          latitude: listing.location?.coordinates?.lat || 0,
          longitude: listing.location?.coordinates?.lng || 0,
        },
      },
      amenities: listing.amenities && listing.amenities.length > 0 ? {
        electricity: listing.amenities.some(a => a.toLowerCase().includes('power') || a.toLowerCase().includes('electricity')),
        water: listing.amenities.some(a => a.toLowerCase().includes('water')),
        drainage: listing.amenities.some(a => a.toLowerCase().includes('drainage')),
        boundaryWall: listing.amenities.some(a => a.toLowerCase().includes('boundary') || a.toLowerCase().includes('wall')),
      } : undefined,
    };

    const localUris = (listing.images || []).filter(isLocalImageUri);
    const response = localUris.length > 0
      ? await (() => {
          const formData = new FormData();
          formData.append('title', payload.title || '');
          formData.append('description', payload.description || '');
          formData.append('propertyType', String(payload.propertyType || 'land'));
          formData.append('price', String(payload.price || 0));
          if (payload.facing) {
            formData.append('facing', payload.facing);
          }
          formData.append('area', JSON.stringify(payload.area));
          formData.append('location', JSON.stringify(payload.location));
          if (payload.amenities) {
            formData.append('amenities', JSON.stringify(payload.amenities));
          }

          localUris.forEach((uri, index) => {
            formData.append('images', {
              uri,
              name: `property-${Date.now()}-${index}.jpg`,
              type: 'image/jpeg',
            } as any);
          });

          return apiClient.post('/properties', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        })()
      : await apiClient.post('/properties', {
          ...payload,
          images: listing.images || [],
        });

    const result = response.data.property || response.data;
    return mapPropertyToListing(result);
  },

  // Update listing (seller)
  updateListing: async (id: string, updates: Partial<Listing>) => {
    const response = await apiClient.put(`/properties/${id}`, updates);
    const property = response.data.property || response.data;
    return mapPropertyToListing(property);
  },

  // Delete listing (seller)
  deleteListing: async (id: string) => {
    await apiClient.delete(`/properties/${id}`);
  },

  // Get seller's listings
  getMyListings: async () => {
    const response = await apiClient.get('/properties/seller/my-listings');
    const properties = response.data.properties || response.data || [];
    return properties.map(mapPropertyToListing);
  },

  // Get saved listings
  getSavedListings: async () => {
    const response = await apiClient.get('/users/saved-listings');
    return response.data.savedListings || [];
  },

  // Save a listing
  saveListing: async (id: string) => {
    const response = await apiClient.post(`/users/save-listing/${id}`);
    return response.data;
  },

  // Unsave a listing
  unsaveListing: async (id: string) => {
    const response = await apiClient.delete(`/users/save-listing/${id}`);
    return response.data;
  },
};