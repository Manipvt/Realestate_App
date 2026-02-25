import { apiClient } from './client';

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  listingId: string;
}

export interface ContactDetails {
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  listingId: string;
}

export const paymentApi = {
  // Create payment intent for contact reveal
  createPaymentIntent: async (listingId: string) => {
    const { data } = await apiClient.post<PaymentIntent>('/payments/create-intent', {
      listingId,
    });
    return data;
  },

  // Confirm payment and get seller contact
  confirmPayment: async (paymentIntentId: string) => {
    const { data } = await apiClient.post<ContactDetails>('/payments/confirm', {
      paymentIntentId,
    });
    return data;
  },

  // Get purchased contacts history
  getPurchasedContacts: async () => {
    const { data } = await apiClient.get<ContactDetails[]>('/payments/my-contacts');
    return data;
  },
};