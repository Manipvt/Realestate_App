import { apiClient } from './client';
import { Listing } from '@/types/listing.types';

export const listingApi = {
  // Get all listings with filters
  getListings: async (filters?: {
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    city?: string;
  }) => {
    const response = await apiClient.get('/properties', { params: filters });
    // Backend returns { success: true, properties: [...] }
    return response.data.properties || response.data || [];
  },

  // Get single listing
  getListing: async (id: string) => {
    const response = await apiClient.get(`/properties/${id}`);
    // Backend returns { success: true, property: {...} }
    return response.data.property || response.data;
  },

  // Create listing (seller)
  createListing: async (listing: Partial<Listing>) => {
    console.log('API createListing called with:', listing);
    try {
      const response = await apiClient.post('/properties', {
        title: listing.title,
        description: listing.description,
        propertyType: listing.propertyType,
        price: listing.price,
        facing: listing.facing,
        area: {
          value: listing.area,
          unit: listing.areaUnit || 'sqft'
        },
        location: {
          address: listing.location?.address || '',
          city: listing.location?.city || '',
          state: listing.location?.state || '',
          pincode: listing.location?.pincode || '',
          coordinates: {
            latitude: listing.location?.coordinates?.lat || 0,
            longitude: listing.location?.coordinates?.lng || 0
          }
        },
        // Convert amenities array to backend format
        amenities: listing.amenities && listing.amenities.length > 0 ? {
          electricity: listing.amenities.some(a => a.toLowerCase().includes('power') || a.toLowerCase().includes('electricity')),
          water: listing.amenities.some(a => a.toLowerCase().includes('water')),
          drainage: listing.amenities.some(a => a.toLowerCase().includes('drainage')),
          boundaryWall: listing.amenities.some(a => a.toLowerCase().includes('boundary') || a.toLowerCase().includes('wall'))
        } : undefined,
        images: listing.images || ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800']
      });
      
      console.log('API response status:', response.status);
      console.log('API response data:', response.data);
      
      // Backend returns { success: true, property: {...} }
      const result = response.data.property || response.data;
      console.log('Returning result:', result);
      return result;
    } catch (error: any) {
      console.error('API createListing error:', error);
      console.error('Error response:', error?.response?.data);
      throw error;
    }
  },

  // Update listing (seller)
  updateListing: async (id: string, updates: Partial<Listing>) => {
    const response = await apiClient.put(`/properties/${id}`, updates);
    // Backend returns { success: true, property: {...} }
    return response.data.property || response.data;
  },

  // Delete listing (seller)
  deleteListing: async (id: string) => {
    await apiClient.delete(`/properties/${id}`);
  },

  // Get seller's listings
  getMyListings: async () => {
    const response = await apiClient.get('/properties/my-listings');
    // Backend returns { success: true, properties: [...] } or similar
    return response.data.properties || response.data || [];
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