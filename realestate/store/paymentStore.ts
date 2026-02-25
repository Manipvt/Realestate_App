import { create } from 'zustand';
import { paymentApi, type ContactDetails } from '@/services/api/payment.api';

interface PaymentState {
  isLoading: boolean;
  purchasedContacts: ContactDetails[];
  currentPayment: {
    clientSecret: string;
    amount: number;
    listingId: string;
  } | null;
  createPaymentIntent: (listingId: string) => Promise<void>;
  confirmPayment: (paymentIntentId: string) => Promise<ContactDetails>;
  fetchPurchasedContacts: () => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  isLoading: false,
  purchasedContacts: [],
  currentPayment: null,

  createPaymentIntent: async (listingId: string) => {
    set({ isLoading: true });
    try {
      const payment = await paymentApi.createPaymentIntent(listingId);
      set({ currentPayment: payment, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  confirmPayment: async (paymentIntentId: string) => {
    set({ isLoading: true });
    try {
      const contactDetails = await paymentApi.confirmPayment(paymentIntentId);
      set((state) => ({
        purchasedContacts: [...state.purchasedContacts, contactDetails],
        currentPayment: null,
        isLoading: false,
      }));
      return contactDetails;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchPurchasedContacts: async () => {
    set({ isLoading: true });
    try {
      const contacts = await paymentApi.getPurchasedContacts();
      set({ purchasedContacts: contacts, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));