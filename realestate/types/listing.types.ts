export enum PropertyType {
  LAND = 'land',
  APARTMENT = 'apartment',
  VILLA = 'villa',
  COMMERCIAL = 'commercial'
}

export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  PENDING = 'pending'
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
  areaUnit: string;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
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