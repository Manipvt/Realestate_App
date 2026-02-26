import { apiClient } from './client';

export interface CreateOrderResponse {
  success: boolean;
  alreadyUnlocked?: boolean;
  message?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  paymentId?: string;
  keyId?: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  propertyId: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
}

export interface PaymentHistoryItem {
  _id: string;
  amount: number;
  status: 'created' | 'paid' | 'failed';
  purpose: string;
  property: {
    _id: string;
    title: string;
    location?: {
      city?: string;
    };
    propertyType?: string;
  };
  createdAt: string;
}

export interface MyPaymentsResponse {
  success: boolean;
  count: number;
  payments: PaymentHistoryItem[];
}

export const paymentApi = {
  createOrder: async (propertyId: string) => {
    const { data } = await apiClient.post<CreateOrderResponse>('/payments/create-order', {
      propertyId,
    });
    return data;
  },

  verifyPayment: async (payload: VerifyPaymentPayload) => {
    const { data } = await apiClient.post<VerifyPaymentResponse>('/payments/verify', payload);
    return data;
  },

  getMyPayments: async () => {
    const { data } = await apiClient.get<MyPaymentsResponse>('/payments/my-payments');
    return data;
  },
};