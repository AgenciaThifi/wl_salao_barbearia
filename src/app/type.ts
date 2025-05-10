// src/types.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  stock: number;
  description: string;
  categoryName: string;
  storeIds: string[];
  ingredients: string;
  brand: string;
  brandImageUrl?: string;
  url: string;
  rating: number;
}
