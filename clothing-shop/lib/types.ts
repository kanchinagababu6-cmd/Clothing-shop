export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sizes: string[];
  colors: string[];
  stock: number;
  createdAt?: number;
};

export type CartItem = Product & { quantity: number; size: string; color: string };

export type Order = {
  id?: string;
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  items: CartItem[];
  total: number;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: number;
};
