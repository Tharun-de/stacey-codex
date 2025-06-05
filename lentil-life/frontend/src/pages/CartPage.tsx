import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { API_URL } from '../config';
import PickupTimeSelector from '../components/PickupTimeSelector';
import PointsCalculator from '../components/PointsCalculator';

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

type PaymentMethod = 'venmo' | 'cash';

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, totalItems, totalPrice, clearCart } = useCart();
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'confirmation'>('cart');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('venmo');
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
    console.log('handlePickupTimeChange called with:', time);
    setOrderDetails({ ...orderDetails, pickupTime: time });
  };
  
  const handleSubmitOrder = async (e: React.FormEvent | React.MouseEvent<HTMLButtonElement>) => {
    console.log('handleSubmitOrder called. Event type:', e.type);
    e.preventDefault();
    
    if (items.length === 0) {
      setOrderError('Your cart is empty');
      return;
    }

    // Explicitly check if pickup time is selected, as a safeguard
    if (!orderDetails.pickupTime) {
      setOrderError('Please select a pickup time.');
      setIsSubmitting(false); // Ensure isSubmitting is reset if it was true
      return;
    }
    
    setIsSubmitting(true);
    setOrderError('');
    
    let orderStatusForSubmit: string = 'Pending Venmo Payment';
    if (selectedPaymentMethod === 'cash') {
      orderStatusForSubmit = 'Pending Cash Payment';
    }

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
        orderStatus: orderStatusForSubmit
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
            {/* Points Calculator */}
            <div className="pt-3 border-t border-gray-100">
              <PointsCalculator orderAmount={totalPrice} />
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
                    
      <h1 className="text-3xl font-light mb-8 text-center">Checkout Details</h1>
      
      {orderError && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded mb-6">
          {orderError}
                      </div>
                    )}
                    
      <div className="space-y-8">
        <div className="bg-white p-6 shadow rounded-md">
          <h2 className="text-xl font-light mb-6">Your Information</h2>
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
                    </div>
                    
        <div className="bg-white p-6 shadow rounded-md">
          <h2 className="text-xl font-light mb-6">Select Pickup Time</h2>
          <PickupTimeSelector 
            selectedDate={orderDetails.pickupDate}
            selectedTime={orderDetails.pickupTime}
            onSelectDate={handlePickupDateChange}
            onSelectTime={handlePickupTimeChange}
          />
                    </div>
                    
        <div className="bg-white p-6 shadow rounded-md">
          <h2 className="text-xl font-light mb-6">Payment Method</h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-3 p-4 border rounded-md hover:bg-gray-50 cursor-pointer">
                <input 
                  type="radio" 
                  name="paymentMethod"
                  value="venmo"
                  checked={selectedPaymentMethod === 'venmo'}
                  onChange={() => setSelectedPaymentMethod('venmo')}
                  className="form-radio h-5 w-5 text-[#7D9D74] focus:ring-[#7D9D74]"
                />
                <span className="font-light">Pay with Venmo (Manual)</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-3 p-4 border rounded-md hover:bg-gray-50 cursor-pointer">
                <input 
                  type="radio" 
                  name="paymentMethod"
                  value="cash"
                  checked={selectedPaymentMethod === 'cash'}
                  onChange={() => setSelectedPaymentMethod('cash')}
                  className="form-radio h-5 w-5 text-[#7D9D74] focus:ring-[#7D9D74]"
                />
                <span className="font-light">Cash</span>
              </label>
                      </div>
                    </div>
                  </div>
                  
        {selectedPaymentMethod === 'venmo' && (
          <div className="bg-white p-6 shadow rounded-md">
            <h2 className="text-xl font-light mb-6">Complete Your Order via Venmo</h2>
            {paymentSettingsLoading && <p>Loading Venmo details...</p>}
            {paymentSettingsError && <p className="text-red-500">Error: {paymentSettingsError}</p>}
            {paymentSettings && (
              <div className="space-y-4">
                <p className="font-light">
                  Please send <strong className="font-medium">${totalPrice.toFixed(2)}</strong> to our Venmo:
                </p>
                <p className="text-2xl font-semibold text-[#7D9D74]">
                  @{paymentSettings.venmoUsername}
                </p>
                {paymentSettings.venmoQRCodeUrl && (
                  <div className="my-4">
                    <p className="font-light mb-2">Or scan our QR code:</p>
                    <img 
                      src={paymentSettings.venmoQRCodeUrl} 
                      alt="Venmo QR Code" 
                      className="w-48 h-48 object-contain border p-1 rounded-md"
                    />
                  </div>
                )}
                <p className="text-sm text-gray-600 font-light">
                  After sending payment, please click "Place Order". We will verify your payment manually and update your order status.
                </p>
              </div>
            )}
          </div>
        )}

        {selectedPaymentMethod === 'cash' && (
           <div className="bg-white p-6 shadow rounded-md">
            <h2 className="text-xl font-light mb-6">Complete Your Order with Cash</h2>
            <p className="font-light">
              You have selected to pay with cash upon pickup. Please ensure you have <strong className="font-medium">${totalPrice.toFixed(2)}</strong> ready when you collect your order.
            </p>
            <p className="text-sm text-gray-600 font-light mt-2">
              Click "Place Order" to confirm.
            </p>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6 mt-8 flex justify-between items-center">
          <div>
            <p className="text-lg font-light">Total: ${totalPrice.toFixed(2)}</p>
            <p className="text-sm text-gray-500 font-light">{totalItems} item(s)</p>
          </div>
          
                      <button
            type="button"
            onClick={(e) => {
              console.log('Place Order button clicked');
              handleSubmitOrder(e);
            }}
            disabled={!isDetailsComplete || isSubmitting}
            className="w-full py-3 bg-black text-white text-sm uppercase tracking-wide font-light hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Place Order'}
                      </button>
                    </div>
                  </div>
    </>
  );

  const renderConfirmationStep = () => {
    if (!orderConfirmation) return null;

    const isVenmoOrder = selectedPaymentMethod === 'venmo';

    return (
      <div className="text-center py-16 max-w-xl mx-auto">
        <Check className="w-16 h-16 mx-auto mb-6 text-green-500 p-2 bg-green-50 rounded-full" />
        <h1 className="text-3xl font-light mb-4">Thank You For Your Order!</h1>
        <p className="text-gray-700 font-light mb-2">
          Your order <strong className="font-medium">#{orderConfirmation.orderId}</strong> has been placed successfully.
        </p>
        <p className="text-gray-700 font-light mb-6">
          Total amount: <strong className="font-medium">${orderConfirmation.total.toFixed(2)}</strong>
        </p>

        {isVenmoOrder && paymentSettings && (
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-md mb-8 text-left space-y-3">
            <h2 className="text-xl font-semibold text-blue-700 mb-3">Important: Complete Your Venmo Payment</h2>
            <p className="text-sm text-blue-600 font-light">
              Your order status is currently <strong className="font-medium">Pending Venmo Payment</strong>.
            </p>
            <p className="text-sm text-blue-600 font-light">
              To finalize your order, please ensure you have sent <strong className="font-medium">${orderConfirmation.total.toFixed(2)}</strong> to our Venmo account:
            </p>
            <p className="text-xl font-bold text-blue-700">
              @{paymentSettings.venmoUsername}
            </p>
            {paymentSettings.venmoQRCodeUrl && (
              <div className="my-3">
                <p className="text-sm text-blue-600 font-light mb-1">Or scan the QR code again:</p>
                <img src={paymentSettings.venmoQRCodeUrl} alt="Venmo QR Code" className="w-32 h-32 object-contain border p-1 rounded-md"/>
              </div>
            )}
            <p className="text-sm text-blue-600 font-light">
              We will verify your payment and update your order status soon. You will receive an email once confirmed (if email notifications are set up).
            </p>
            </div>
        )}

        {!isVenmoOrder && (
          <div className="bg-green-50 border border-green-200 p-6 rounded-md mb-8 text-left space-y-3">
            <h2 className="text-xl font-semibold text-green-700 mb-3">Payment on Pickup</h2>
            <p className="text-sm text-green-600 font-light">
              Your order status is currently <strong className="font-medium">Pending Cash Payment</strong>.
            </p>
            <p className="text-sm text-green-600 font-light">
              Please remember to bring <strong className="font-medium">${orderConfirmation.total.toFixed(2)}</strong> in cash when you come to pick up your order.
            </p>
              </div>
        )}

        <p className="mb-2">You will receive an email confirmation shortly (if provided).</p>

        <div className="mt-10">
              <Link
                to="/shop"
            className="inline-block px-6 py-3 border border-black text-sm uppercase tracking-wide font-light hover:bg-black hover:text-white transition-colors"
              >
            Continue Shopping
              </Link>
        </div>
      </div>
    );
  };

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