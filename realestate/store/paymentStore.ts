import { create } from 'zustand';
import {
  paymentApi,
  type CreateOrderResponse,
  type VerifyPaymentPayload,
  type PaymentHistoryItem,
} from '@/services/api/payment.api';

interface PaymentState {
  isLoading: boolean;
  payments: PaymentHistoryItem[];
  currentOrder: CreateOrderResponse | null;
  createOrder: (propertyId: string) => Promise<CreateOrderResponse>;
  verifyPayment: (payload: VerifyPaymentPayload) => Promise<void>;
  fetchMyPayments: () => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  isLoading: false,
  payments: [],
  currentOrder: null,

  createOrder: async (propertyId: string) => {
    set({ isLoading: true });
    try {
      const order = await paymentApi.createOrder(propertyId);
      set({ currentOrder: order, isLoading: false });
      return order;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  verifyPayment: async (payload: VerifyPaymentPayload) => {
    set({ isLoading: true });
    try {
      await paymentApi.verifyPayment(payload);
      set({ currentOrder: null, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchMyPayments: async () => {
    set({ isLoading: true });
    try {
      const response = await paymentApi.getMyPayments();
      set({ payments: response.payments, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));