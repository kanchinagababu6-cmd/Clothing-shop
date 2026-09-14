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

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  imageUrl?: string;
  size?: string;
  color?: string;
  quantity: number;
}
