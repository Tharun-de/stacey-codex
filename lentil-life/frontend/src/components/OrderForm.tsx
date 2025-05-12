import React, { useState, useEffect } from 'react';
import { OrderFormData, OrderItem, MenuItem } from '../types';
import { createOrder, saveOrder } from '../utils/orderUtils';
import { menuItems } from '../data/menuData';
import { ShoppingCart, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import Button from './Button';

interface OrderFormProps {
  selectedItems: MenuItem[];
  onOrderComplete: (orderNumber: string) => void;
  onClearItems: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ 
  selectedItems, 
  onOrderComplete,
  onClearItems
}) => {
  const [formData, setFormData] = useState<Omit<OrderFormData, 'items'>>({
    name: '',
    email: '',
    phone: '',
    pickupDate: '',
    pickupTime: '',
    specialInstructions: ''
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Convert selected menu items to order items
    const items = selectedItems.map(item => ({
      menuItemId: item.id,
      quantity: 1,
      specialRequests: ''
    }));
    
    // Combine quantities for duplicate items
    const combinedItems = items.reduce<OrderItem[]>((acc, item) => {
      const existingItem = acc.find(i => i.menuItemId === item.menuItemId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, []);
    
    setOrderItems(combinedItems);
  }, [selectedItems]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const updateQuantity = (menuItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setOrderItems(prev => 
      prev.map(item => 
        item.menuItemId === menuItemId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  const removeItem = (menuItemId: number) => {
    setOrderItems(prev => prev.filter(item => item.menuItemId !== menuItemId));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.pickupDate) errors.pickupDate = 'Pickup date is required';
    if (!formData.pickupTime) errors.pickupTime = 'Pickup time is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (orderItems.length === 0) {
      setFormErrors({ items: 'Please select at least one item' });
      return;
    }
    
    const completeFormData: OrderFormData = {
      ...formData,
      items: orderItems
    };
    
    const order = createOrder(completeFormData);
    saveOrder(order);
    
    setOrderNumber(order.orderNumber);
    setFormSubmitted(true);
    setShowSuccessMessage(true);
    onOrderComplete(order.orderNumber);
  };

  const calculateTotal = (): number => {
    return orderItems.reduce((total, item) => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      return total + (menuItem?.price || 0) * item.quantity;
    }, 0);
  };

  const getItemName = (menuItemId: number): string => {
    const item = menuItems.find(item => item.id === menuItemId);
    return item ? item.name : 'Unknown Item';
  };

  if (showSuccessMessage) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Order Received!</h2>
        <p className="text-gray-600 mb-6">
          Your order number is <span className="font-bold text-[#7D9D74]">{orderNumber}</span>
        </p>
        <div className="mb-8 p-6 bg-[#F5F1E8] rounded-lg">
          <h3 className="font-semibold mb-4">Next Steps:</h3>
          <ol className="text-left list-decimal pl-5 space-y-2">
            <li>Send payment of <span className="font-bold">${calculateTotal().toFixed(2)}</span> via Venmo to <span className="font-bold">@YourVenmoHere</span></li>
            <li>Include your order number <span className="font-bold">{orderNumber}</span> in the payment note</li>
            <li>We'll confirm your order once payment is verified</li>
            <li>Pick up your order at the selected time</li>
          </ol>
        </div>
        <Button 
          variant="primary" 
          onClick={() => {
            setShowSuccessMessage(false);
            setFormSubmitted(false);
            onClearItems();
            setOrderItems([]);
            setFormData({
              name: '',
              email: '',
              phone: '',
              pickupDate: '',
              pickupTime: '',
              specialInstructions: ''
            });
          }}
        >
          Place Another Order
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <ShoppingCart size={24} className="text-[#7D9D74] mr-2" />
        <h2 className="text-2xl font-semibold">Your Order</h2>
      </div>
      
      {orderItems.length > 0 ? (
        <div className="mb-6">
          {orderItems.map((item) => (
            <div key={item.menuItemId} className="flex justify-between items-center py-3 border-b">
              <div className="flex-1">
                <p className="font-medium">{getItemName(item.menuItemId)}</p>
                <p className="text-sm text-gray-500">
                  ${(menuItems.find(mi => mi.id === item.menuItemId)?.price || 0).toFixed(2)} each
                </p>
              </div>
              <div className="flex items-center">
                <button 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                  onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                >
                  -
                </button>
                <span className="mx-3 w-8 text-center">{item.quantity}</span>
                <button 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                  onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                >
                  +
                </button>
                <button 
                  className="ml-4 text-red-500 hover:text-red-700"
                  onClick={() => removeItem(item.menuItemId)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          <div className="mt-4 text-right">
            <p className="text-lg font-bold">
              Total: ${calculateTotal().toFixed(2)}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 mb-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Your order is empty. Please select items from the menu.</p>
          {formErrors.items && (
            <p className="text-red-500 mt-2 text-sm flex items-center justify-center">
              <AlertCircle size={16} className="mr-1" />
              {formErrors.items}
            </p>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-2">Contact Information</h3>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D9D74] focus:border-transparent ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.name && (
              <p className="text-red-500 mt-1 text-sm">{formErrors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D9D74] focus:border-transparent ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.email && (
              <p className="text-red-500 mt-1 text-sm">{formErrors.email}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D9D74] focus:border-transparent ${
                formErrors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.phone && (
              <p className="text-red-500 mt-1 text-sm">{formErrors.phone}</p>
            )}
          </div>
          
          <h3 className="text-lg font-medium mb-2 mt-6">Pickup Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Date
              </label>
              <input
                type="date"
                id="pickupDate"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D9D74] focus:border-transparent ${
                  formErrors.pickupDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.pickupDate && (
                <p className="text-red-500 mt-1 text-sm">{formErrors.pickupDate}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Time
              </label>
              <input
                type="time"
                id="pickupTime"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D9D74] focus:border-transparent ${
                  formErrors.pickupTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.pickupTime && (
                <p className="text-red-500 mt-1 text-sm">{formErrors.pickupTime}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-1">
              Special Instructions (Optional)
            </label>
            <textarea
              id="specialInstructions"
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D9D74] focus:border-transparent"
            ></textarea>
          </div>
          
          <div className="mt-6">
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth
              disabled={formSubmitted || orderItems.length === 0}
            >
              Place Order
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            By placing your order, you agree to our Terms of Service and Privacy Policy.
            Payment will be made via Venmo after your order is submitted.
          </p>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;