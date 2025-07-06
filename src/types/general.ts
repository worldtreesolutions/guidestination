
export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Preferences {
  categories: number[];
  priceRange: [number, number];
  duration: [number, number];
}
