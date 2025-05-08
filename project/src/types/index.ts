export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  dietaryInfo: {
    vegan: boolean;
    vegetarian: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
  };
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  ingredients: string[];
}

export interface Testimonial {
  id: number;
  name: string;
  image: string;
  quote: string;
  rating: number;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'ordering' | 'payment' | 'food' | 'sustainability';
}

export interface OrderFormData {
  name: string;
  email: string;
  phone: string;
  items: OrderItem[];
  pickupDate: string;
  pickupTime: string;
  specialInstructions: string;
}

export interface OrderItem {
  menuItemId: number;
  quantity: number;
  specialRequests?: string;
}

export interface Order extends OrderFormData {
  id: string;
  orderNumber: string;
  total: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface EnvironmentalMetric {
  id: number;
  title: string;
  value: string;
  description: string;
  icon: string;
}