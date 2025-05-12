import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

// Custom basket icon component that matches the minimalist Mast Market design
const BasketIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrderDetails(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the order to your backend
    // For now, we'll just move to the confirmation step
    setCheckoutStep('confirmation');
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
                    
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="pickupDate" className="block text-sm uppercase tracking-wide font-light mb-2">
              Pickup Date*
            </label>
            <input
              type="date"
              id="pickupDate"
              name="pickupDate"
              value={orderDetails.pickupDate}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 font-light"
            />
                      </div>
          
          <div>
            <label htmlFor="pickupTime" className="block text-sm uppercase tracking-wide font-light mb-2">
              Pickup Time*
            </label>
            <input
              type="time"
              id="pickupTime"
              name="pickupTime"
              value={orderDetails.pickupTime}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 font-light"
            />
          </div>
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
                    
        <div className="border-t border-gray-200 pt-6 mt-8">
          <div className="space-y-2">
            <div className="flex justify-between font-light">
              <span>Items ({totalItems})</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg">
                        <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
        <div className="pt-4">
                      <button
            type="submit"
            disabled={!isDetailsComplete}
            className="w-full py-3 bg-black text-white text-sm uppercase tracking-wide font-light hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
            Place Order
                      </button>
                    </div>
      </form>
    </>
  );

  const renderConfirmationStep = () => (
    <div className="text-center py-16">
      <div className="mb-8">
        <Check className="w-10 h-10 mx-auto text-black" />
                  </div>
      <h1 className="text-3xl font-light mb-6">Order Confirmed</h1>
      <p className="text-lg mb-10 font-light">
        Thank you, {orderDetails.name}! Your order has been received.
      </p>
      <div className="border border-gray-200 p-8 mb-10 text-left">
        <h2 className="text-xl font-light mb-6">Order Details</h2>
        <p className="mb-3 font-light"><span className="inline-block w-32">Order Number:</span> #LL{Math.floor(Math.random() * 10000)}</p>
        <p className="mb-3 font-light"><span className="inline-block w-32">Pickup Date:</span> {orderDetails.pickupDate}</p>
        <p className="mb-3 font-light"><span className="inline-block w-32">Pickup Time:</span> {orderDetails.pickupTime}</p>
        <p className="mb-3 font-light"><span className="inline-block w-32">Total Amount:</span> ${totalPrice.toFixed(2)}</p>
        <p className="mb-3 font-light"><span className="inline-block w-32">Status:</span> <span className="text-black">Confirmed</span></p>
                </div>
      <p className="text-gray-600 mb-10 font-light">
        A confirmation email has been sent to {orderDetails.email}.<br />
        We'll contact you at {orderDetails.phone} if there are any updates.
      </p>
              <Link
        to="/"
        className="inline-block px-6 py-3 border border-black text-sm uppercase tracking-wide font-light hover:bg-black hover:text-white transition-colors"
        onClick={() => clearCart()}
              >
        Return to Home
              </Link>
            </div>
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