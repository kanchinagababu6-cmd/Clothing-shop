export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  imageUrl?: string;
  gender?: string;
  category?: string;
  sizes?: string[];
  colors?: string[];
  stock: number;
  createdAt?: any;
}

