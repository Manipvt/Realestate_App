import { create } from 'zustand';
import { Listing, PropertyType, ListingStatus } from '@/types';
import { listingApi } from '@/services/api/listing.api';

interface ListingState {
  listings: Listing[];
  myListings: Listing[];
  selectedListing: Listing | null;
  savedListings: string[];
  isLoading: boolean;
  filters: { propertyType?: PropertyType; city?: string; minPrice?: number; maxPrice?: number };
  fetchListings: () => Promise<void>;
  fetchMyListings: () => Promise<void>;
  fetchSavedListings: () => Promise<void>;
  selectListing: (id: string) => void;
  toggleSave: (id: string) => void;
  addListing: (listing: Partial<Listing>) => Promise<void>;
  updateListing: (id: string, data: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  setFilters: (filters: ListingState['filters']) => void;
}

export const useListingStore = create<ListingState>((set, get) => ({
  listings: [],
  myListings: [],
  selectedListing: null,
  savedListings: [],
  isLoading: false,
  filters: {},

  fetchListings: async () => {
    set({ isLoading: true });
    try {
      const listings = await listingApi.getListings(get().filters);
      set({ listings: listings || [], isLoading: false });
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      set({ listings: [], isLoading: false });
    }
  },

  fetchMyListings: async () => {
    set({ isLoading: true });
    try {
      const myListings = await listingApi.getMyListings();
      set({ myListings: myListings.data || [], isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch my listings:', error);
      set({ myListings: [], isLoading: false });
    }
  },

  fetchSavedListings: async () => {
    set({ isLoading: true });
    try {
      const savedListings = await listingApi.getSavedListings();
      set({ savedListings: savedListings.map((l: Listing) => l.id), isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch saved listings:', error);
      set({ savedListings: [], isLoading: false });
    }
  },

  selectListing: async (id: string) => {
    try {
      const listing = await listingApi.getListing(id);
      set({ selectedListing: listing });
    } catch (error) {
      const listing = get().listings.find((l) => l.id === id) || null;
      set({ selectedListing: listing });
    }
  },

  toggleSave: async (id: string) => {
    const saved = get().savedListings;
    const isSaved = saved.includes(id);
    
    try {
      if (isSaved) {
        await listingApi.unsaveListing(id);
        set({ savedListings: saved.filter((s) => s !== id) });
      } else {
        await listingApi.saveListing(id);
        set({ savedListings: [...saved, id] });
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
      // Revert on error
      if (isSaved) {
        set({ savedListings: [...saved, id] });
      } else {
        set({ savedListings: saved.filter((s) => s !== id) });
      }
    }
  },

  addListing: async (listing: Partial<Listing>) => {
    console.log('Store addListing called with:', listing);
    set({ isLoading: true });
    try {
      console.log('Calling listingApi.createListing...');
      const newListing = await listingApi.createListing(listing);
      console.log('API response:', newListing);
      set((state) => ({ 
        listings: [newListing, ...state.listings], 
        myListings: [newListing, ...state.myListings], 
        isLoading: false 
      }));
      console.log('Store updated successfully');
    } catch (error: any) {
      console.error('Store error in addListing:', error);
      console.error('Error response:', error?.response?.data);
      set({ isLoading: false });
      throw error;
    }
  },

  updateListing: async (id: string, data: Partial<Listing>) => {
    set({ isLoading: true });
    try {
      const updatedListing = await listingApi.updateListing(id, data);
      set((state) => ({
        listings: state.listings.map((l) => (l.id === id ? updatedListing : l)),
        myListings: state.myListings.map((l) => (l.id === id ? updatedListing : l)),
        selectedListing: state.selectedListing?.id === id ? updatedListing : state.selectedListing,
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteListing: async (id: string) => {
    set({ isLoading: true });
    try {
      await listingApi.deleteListing(id);
      set((state) => ({
        listings: state.listings.filter((l) => l.id !== id),
        myListings: state.myListings.filter((l) => l.id !== id),
        selectedListing: state.selectedListing?.id === id ? null : state.selectedListing,
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setFilters: (filters) => set({ filters }),
}));