export enum PropertyType {
  LAND = 'land',
  APARTMENT = 'apartment',
  VILLA = 'villa',
  COMMERCIAL = 'commercial',
}

export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  PENDING = 'pending',
}

export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  BOTH = 'both',
}

export interface Location {
  address: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: { lat: number; lng: number };
}

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  price: number;
  area: number;
  areaUnit: 'sqft' | 'sqmt' | 'acre';
  location: Location;
  amenities: string[];
  images: string[];
  status: ListingStatus;
  contactViews: number;
  bedrooms?: number;
  bathrooms?: number;
  facing?: string;
  age?: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  verified: boolean;
  sellerProfile?: {
    businessName: string;
    description: string;
    rating: number;
    totalListings: number;
  };
  buyerProfile?: {
    savedListings: string[];
    purchasedContacts: string[];
  };
  createdAt: string;
}

export interface Payment {
  id: string;
  buyerId: string;
  listingId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  transactionId: string;
  createdAt: string;
  sellerContact?: SellerContact;
}

export interface SellerContact {
  name: string;
  phone: string;
  email: string;
  businessName?: string;
  listingTitle: string;
  listingId: string;
  purchasedAt: string;
}