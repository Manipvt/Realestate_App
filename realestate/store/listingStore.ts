import { create } from 'zustand';
import { Listing, PropertyType } from '@/types';
import { listingApi } from '@/services/api/listing.api';

const DEFAULT_LISTINGS_PAGE_SIZE = 20;

type ListingFilters = { propertyType?: PropertyType; city?: string; minPrice?: number; maxPrice?: number };
type FetchListingsOptions = { reset?: boolean; page?: number; limit?: number };

interface ListingState {
  listings: Listing[];
  myListings: Listing[];
  selectedListing: Listing | null;
  savedListings: string[];
  isLoading: boolean;
  isFetchingMore: boolean;
  page: number;
  pages: number;
  total: number;
  hasMore: boolean;
  filters: ListingFilters;
  fetchListings: (options?: FetchListingsOptions) => Promise<void>;
  loadMoreListings: () => Promise<void>;
  fetchMyListings: () => Promise<void>;
  fetchSavedListings: () => Promise<void>;
  selectListing: (id: string) => void;
  toggleSave: (id: string) => void;
  addListing: (listing: Partial<Listing>) => Promise<void>;
  updateListing: (id: string, data: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  setFilters: (filters: ListingFilters) => void;
}

export const useListingStore = create<ListingState>((set, get) => ({
  listings: [],
  myListings: [],
  selectedListing: null,
  savedListings: [],
  isLoading: false,
  isFetchingMore: false,
  page: 1,
  pages: 1,
  total: 0,
  hasMore: false,
  filters: {},

  fetchListings: async (options = {}) => {
    const { reset = true, page = 1, limit = DEFAULT_LISTINGS_PAGE_SIZE } = options;

    set(reset ? { isLoading: true } : { isFetchingMore: true });

    try {
      const result = await listingApi.getListings({
        ...get().filters,
        page,
        limit,
      });

      set((state) => ({
        listings: reset ? result.listings : [...state.listings, ...result.listings],
        page: result.page,
        pages: result.pages,
        total: result.total,
        hasMore: result.hasMore,
        isLoading: false,
        isFetchingMore: false,
      }));
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      set((state) => ({
        listings: reset ? [] : state.listings,
        hasMore: false,
        isLoading: false,
        isFetchingMore: false,
      }));
    }
  },

  loadMoreListings: async () => {
    const state = get();
    if (state.isLoading || state.isFetchingMore || !state.hasMore) {
      return;
    }

    await state.fetchListings({
      reset: false,
      page: state.page + 1,
      limit: DEFAULT_LISTINGS_PAGE_SIZE,
    });
  },

  fetchMyListings: async () => {
    set({ isLoading: true });
    try {
      const myListings = await listingApi.getMyListings();
      set({ myListings: myListings || [], isLoading: false });
    } catch (error: any) {
      console.warn('Failed to fetch my listings:', error?.message || 'Unknown error');
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
    set({ isLoading: true });
    try {
      const newListing = await listingApi.createListing(listing);
      set((state) => ({ 
        listings: [newListing, ...state.listings], 
        myListings: [newListing, ...state.myListings], 
        isLoading: false 
      }));
    } catch (error: any) {
      console.warn('Store error in addListing:', error?.response?.data?.message || error?.message || 'Unknown error');
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