import { Order, OrderFormData } from '../types';

// Generate a unique order number
export const generateOrderNumber = (): string => {
  const prefix = 'NW';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// Calculate order total
export const calculateOrderTotal = (order: OrderFormData): number => {
  return order.items.reduce((total, item) => {
    // This is a placeholder. In a real app, you would look up the price from your menu data
    const itemPrice = 10; // Example price
    return total + (itemPrice * item.quantity);
  }, 0);
};

// Create a new order
export const createOrder = (formData: OrderFormData): Order => {
  const orderNumber = generateOrderNumber();
  const total = calculateOrderTotal(formData);
  
  return {
    ...formData,
    id: crypto.randomUUID(),
    orderNumber,
    total,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
};

// Store order in localStorage
export const saveOrder = (order: Order): void => {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
};

// Get all orders from localStorage
export const getOrders = (): Order[] => {
  const orders = localStorage.getItem('orders');
  return orders ? JSON.parse(orders) : [];
};

// Get a single order by order number
export const getOrderByNumber = (orderNumber: string): Order | undefined => {
  const orders = getOrders();
  return orders.find(order => order.orderNumber === orderNumber);
};