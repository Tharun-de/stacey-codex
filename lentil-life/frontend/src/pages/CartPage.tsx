import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { API_URL } from '../App';
import PickupTimeSelector from '../components/PickupTimeSelector';

// Custom basket icon component that matches the minimalist Mast Market design
const BasketIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface PaymentSettings {
  venmoUsername?: string;
  venmoQRCodeUrl?: string;
}

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, totalItems, totalPrice, clearCart } = useCart();
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'confirmation'>('cart');
  const [orderDetails, setOrderDetails] = useState({
    name: '',
    email: '',
    phone: '',
    pickupDate: '',
    pickupTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderConfirmation, setOrderConfirmation] = useState<{ orderId: string, total: number } | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [paymentSettingsLoading, setPaymentSettingsLoading] = useState(true);
  const [paymentSettingsError, setPaymentSettingsError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      setPaymentSettingsLoading(true);
      try {
        const response = await fetch(`${API_URL}/payment-settings`);
        if (!response.ok) {
          throw new Error('Failed to fetch payment settings');
        }
        const data = await response.json();
        if (data.success && data.settings) {
          setPaymentSettings(data.settings);
          setPaymentSettingsError(null);
        } else {
          setPaymentSettingsError(data.message || 'Payment settings not found or invalid response.');
          setPaymentSettings(null);
        }
      } catch (err) {
        const error = err as Error;
        setPaymentSettingsError(error.message || 'Could not load Venmo details.');
        setPaymentSettings(null); // Clear any previous settings
      } finally {
        setPaymentSettingsLoading(false);
      }
    };

    fetchPaymentSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrderDetails({ ...orderDetails, [name]: value });
  };
  
  const handlePickupDateChange = (date: string) => {
    setOrderDetails({ ...orderDetails, pickupDate: date });
  };
  
  const handlePickupTimeChange = (time: string) => {
    setOrderDetails({ ...orderDetails, pickupTime: time });
  };
  
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      setOrderError('Your cart is empty');
      return;
    }
    
    setIsSubmitting(true);
    setOrderError('');
    
    try {
      // Prepare order data
      const orderData = {
        customer: {
          name: orderDetails.name,
          email: orderDetails.email,
          phone: orderDetails.phone
        },
        pickup: {
          date: orderDetails.pickupDate,
          time: orderDetails.pickupTime
        },
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions
        })),
        specialInstructions: specialInstructions,
        total: totalPrice,
        orderStatus: 'Pending Venmo Payment'
      };
      
      // Send order to API
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store order confirmation
        setOrderConfirmation({
          orderId: data.order.id,
          total: data.order.total
        });
        
        // Clear cart
        clearCart();
        
        // Move to confirmation step
        setCheckoutStep('confirmation');
      } else {
        setOrderError(data.message || 'Failed to create order. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setOrderError('An error occurred while processing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Only enable checkout if there's at least one item and all required fields are filled
  const isCheckoutEnabled = items.length > 0;
  const isDetailsComplete = orderDetails.name && orderDetails.email && 
    orderDetails.phone && orderDetails.pickupDate && orderDetails.pickupTime;
  
  const renderEmptyCart = () => (
    <div className="text-center py-16">
      <BasketIcon className="w-12 h-12 mx-auto mb-6 text-gray-300" />
      <h2 className="text-2xl font-light mb-4">Your cart is empty</h2>
      <p className="text-gray-500 mb-8 font-light">Add some delicious plant-based items to get started.</p>
      <Link 
        to="/shop"
        className="inline-block px-6 py-3 border border-black text-sm uppercase tracking-wide font-light hover:bg-black hover:text-white transition-colors"
      >
        Browse Menu
          </Link>
          </div>
  );

  const renderCartItems = () => (
    <div className="space-y-8">
      {items.map(item => (
        <div 
                        key={item.id}
          className="flex items-center justify-between border-b border-gray-200 pb-6"
                      >
          <div className="flex items-center">
                          <img 
                            src={item.image} 
                            alt={item.name}
              className="w-20 h-20 object-cover mr-6" 
            />
            <div>
              <h3 className="font-light text-lg">{item.name}</h3>
              <p className="text-gray-700 font-light">${item.price.toFixed(2)}</p>
              {item.specialInstructions && (
                <p className="text-sm text-gray-500 mt-1 font-light">
                  Note: {item.specialInstructions}
                </p>
              )}
                        </div>
                        </div>
                        
          <div className="flex items-center space-x-6">
            <div className="flex items-center border border-gray-200">
                          <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="px-3 py-1 text-gray-700 hover:bg-gray-100"
                          >
                <Minus className="w-3 h-3" />
                          </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="px-3 py-1 text-gray-700 hover:bg-gray-100"
                          >
                <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                          <button
              onClick={() => removeItem(item.id)}
              className="text-gray-400 hover:text-gray-700"
              title="Remove item"
                          >
              <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
        </div>
                    ))}
                  </div>
  );

  const renderCartStep = () => (
    <>
      <div className="mb-12">
        <h1 className="text-3xl font-light mb-8 text-center">Your Cart</h1>
        {items.length === 0 ? renderEmptyCart() : renderCartItems()}
      </div>
      
      {items.length > 0 && (
        <>
          <div className="mb-8">
            <label htmlFor="specialInstructions" className="block text-sm uppercase tracking-wide font-light mb-2">
              Special Instructions (optional)
            </label>
            <textarea
              id="specialInstructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 font-light"
              placeholder="Any specific instructions for your order?"
            />
          </div>
          
          <div className="border-t border-gray-200 pt-6 space-y-2">
            <div className="flex justify-between">
              <span className="font-light">Subtotal</span>
              <span className="font-light">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => clearCart()}
              className="text-sm uppercase tracking-wide font-light border-b border-gray-400 pb-0.5 hover:border-black"
            >
              Clear Cart
            </button>
            <button
              onClick={() => setCheckoutStep('details')}
              disabled={!isCheckoutEnabled}
              className="px-6 py-3 bg-black text-white text-sm uppercase tracking-wide font-light hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </>
  );

  const renderDetailsStep = () => (
    <>
      <div className="mb-8">
        <button
          onClick={() => setCheckoutStep('cart')}
          className="flex items-center text-sm uppercase tracking-wide font-light hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to cart
        </button>
      </div>
      
      <h1 className="text-3xl font-light mb-8 text-center">Order Details</h1>
      
      {orderError && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded mb-6">
          {orderError}
        </div>
      )}
      
      <form onSubmit={handleSubmitOrder} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm uppercase tracking-wide font-light mb-2">
            Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={orderDetails.name}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 font-light"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm uppercase tracking-wide font-light mb-2">
            Email*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={orderDetails.email}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 font-light"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm uppercase tracking-wide font-light mb-2">
            Phone*
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={orderDetails.phone}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 font-light"
          />
                    </div>
                    
        <div className="mb-6">
          <h3 className="text-lg font-light mb-4">Pickup Information</h3>
          
          <PickupTimeSelector
            selectedDate={orderDetails.pickupDate}
            selectedTime={orderDetails.pickupTime}
            onSelectDate={handlePickupDateChange}
            onSelectTime={handlePickupTimeChange}
          />
                      </div>
                    
        <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
          <h3 className="text-xl font-medium text-gray-800 mb-4">Payment Instructions: Venmo</h3>
          {paymentSettingsLoading && <p className="text-gray-600">Loading Venmo details...</p>}
          {paymentSettingsError && (
            <p className="text-red-600 bg-red-50 p-3 rounded-md">
              Error loading Venmo details: {paymentSettingsError}. Please try refreshing. If the issue persists, contact support.
            </p>
          )}
          {paymentSettings && (
            <div className="space-y-4">
              <div>
                <p className="text-gray-700">
                  Please send <strong className="font-semibold text-green-700">${totalPrice.toFixed(2)}</strong> to Venmo user:
                </p>
                <p className="text-2xl font-bold text-green-600 my-1">
                  {paymentSettings.venmoUsername || '[Admin Venmo Username]'}
                </p>
                {!paymentSettings.venmoUsername && (
                  <p className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded-md">
                    The Venmo username is not configured yet. Please check back or contact support.
                  </p>
                )}
              </div>
              
              {paymentSettings.venmoQRCodeUrl && (
                <div>
                  <p className="text-gray-700 mb-2">Or scan the QR code:</p>
                  <img 
                    src={paymentSettings.venmoQRCodeUrl} 
                    alt="Venmo QR Code" 
                    className="w-40 h-40 border-2 border-gray-300 rounded-md shadow-sm bg-white p-1"
                  />
                </div>
              )}
              {!paymentSettings.venmoQRCodeUrl && paymentSettings.venmoUsername && (
                  <p className="text-sm text-gray-500">(QR code is not available yet. Please use the username above.)</p>
              )}

              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-md text-sm">
                <strong className="font-semibold">Important:</strong> Your order will be processed once we manually confirm your Venmo payment. You will receive an email update after confirmation.
              </div>
            </div>
          )}
                    </div>
                    
        <div>
          <label htmlFor="specialInstructions" className="block text-sm uppercase tracking-wide font-light mb-2">
            Special Instructions
          </label>
          <textarea
            id="specialInstructions"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 font-light"
          />
                    </div>
                    
        <div className="border-t border-gray-200 pt-6 mt-8 flex justify-between items-center">
          <div>
            <p className="text-lg font-light">Total: ${totalPrice.toFixed(2)}</p>
            <p className="text-sm text-gray-500 font-light">{totalItems} item(s)</p>
                  </div>
                  
                      <button
            type="submit"
            disabled={!isDetailsComplete || isSubmitting}
            className="w-full py-3 bg-black text-white text-sm uppercase tracking-wide font-light hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
            {isSubmitting ? 'Processing...' : 'Place Order'}
                      </button>
                    </div>
      </form>
    </>
  );

  const renderConfirmationStep = () => (
    <>
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
                  </div>
                  
        <h2 className="text-2xl font-light mb-4">Order Placed! Awaiting Payment Confirmation</h2>
        
        {orderConfirmation && (
          <>
            <p className="text-gray-700 mb-2 font-light">
              Your order <strong className="font-semibold">#{orderConfirmation.orderId}</strong> has been successfully submitted.
            </p>
            <p className="text-gray-700 mb-1 font-light">
              Total: <strong className="font-semibold">${orderConfirmation.total.toFixed(2)}</strong>
            </p>
          </>
        )}

        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-6 rounded-lg my-6 max-w-md mx-auto text-left space-y-3">
          <h3 className="text-lg font-semibold text-blue-900">Action Required: Complete Your Venmo Payment</h3>
          {paymentSettings && paymentSettings.venmoUsername && (
            <p className="font-light">
              Please send <strong className="font-semibold">${orderConfirmation?.total.toFixed(2) || totalPrice.toFixed(2)}</strong> to Venmo user: 
              <strong className="text-green-600 font-bold text-xl block my-1">{paymentSettings.venmoUsername}</strong>
            </p>
          )}
          {paymentSettings && paymentSettings.venmoQRCodeUrl && (
            <div className="my-3 text-center">
              <p className="font-light mb-2">Or scan the QR code:</p>
              <img src={paymentSettings.venmoQRCodeUrl} alt="Venmo QR Code" className="w-36 h-36 border-2 border-gray-300 rounded-md shadow-sm bg-white p-1 mx-auto" />
            </div>
          )}
          {!paymentSettingsLoading && (!paymentSettings || !paymentSettings.venmoUsername) && (
            <p className="font-light text-yellow-700 bg-yellow-100 p-2 rounded-md">
              Venmo details are currently unavailable. Please contact us to complete your payment.
            </p>
          )}
          <p className="font-light text-sm">
            <strong className="font-semibold">Important:</strong> We will process your order once we manually confirm your payment. 
            You'll receive an email update once confirmed and another when your order is ready for pickup.
          </p>
              </div>
        
        <p className="text-gray-500 max-w-md mx-auto mb-8 font-light">
          We've sent an initial confirmation to your email: <strong className="font-semibold">{orderDetails.email}</strong>. 
        </p>
        
              <Link
                to="/shop"
          className="inline-block px-6 py-3 border border-black text-sm uppercase tracking-wide font-light hover:bg-black hover:text-white transition-colors"
              >
          Continue Shopping
              </Link>
            </div>
    </>
  );

  return (
    <>
      <Helmet>
        <title>Cart | Lentil Life</title>
      </Helmet>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {checkoutStep === 'cart' && renderCartStep()}
        {checkoutStep === 'details' && renderDetailsStep()}
        {checkoutStep === 'confirmation' && renderConfirmationStep()}
      </div>
    </>
  );
};

export default CartPage; 