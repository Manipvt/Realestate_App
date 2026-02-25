export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  BOTH = 'both'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  verified: boolean;
  avatar?: string;
  sellerProfile?: {
    businessName: string;
    description: string;
    rating: number;
    totalListings?: number;
  };
  buyerProfile?: {
    savedListings: string[];
    viewedContacts: string[];
    purchasedContacts?: string[];
  };
  createdAt?: string;
}