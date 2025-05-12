import React, { useState } from 'react';
import { Check, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

// Custom basket icon component that matches the minimalist Mast Market design
const BasketIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface AddToCartButtonProps {
  id: number;
  name: string;
  price: number;
  image: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ id, name, price, image }) => {
  const { addItem, items, updateQuantity } = useCart();
  const [added, setAdded] = useState(false);

  // Find if this item is already in the cart and get its quantity
  const itemInCart = items.find(item => item.id === id);
  const quantity = itemInCart ? itemInCart.quantity : 0;

  const handleAddToCart = () => {
    addItem({ id, name, price, image });
    setAdded(true);
    
    // Reset the added state after 1 second
    setTimeout(() => {
      setAdded(false);
    }, 1000);
  };

  const handleIncreaseQuantity = () => {
    if (itemInCart) {
      updateQuantity(id, quantity + 1);
    } else {
      addItem({ id, name, price, image });
    }
  };

  const handleDecreaseQuantity = () => {
    if (itemInCart) {
      updateQuantity(id, quantity - 1);
    }
  };

  return (
    <div className="flex items-center justify-between w-full">
      {quantity === 0 ? (
        <button
          onClick={handleAddToCart}
          className={`w-full px-4 py-2 text-sm uppercase tracking-wide font-light transition-colors ${
            added 
              ? 'bg-black text-white' 
              : 'border border-black hover:bg-black hover:text-white'
          }`}
          disabled={added}
        >
          {added ? (
            <>
              <Check className="w-4 h-4 mr-2 inline-block" />
              Added
            </>
          ) : (
            <>
              <BasketIcon className="w-4 h-4 mr-2 inline-block" />
              Add to Cart
            </>
          )}
        </button>
      ) : (
        <div className="flex items-center justify-between w-full">
          <button
            onClick={handleDecreaseQuantity}
            className="px-3 py-1 border border-gray-300 text-gray-700 hover:border-black"
          >
            <Minus className="w-3 h-3" />
          </button>

          <div className="px-3 py-1 text-sm font-light">
            {quantity} in cart
          </div>

          <button
            onClick={handleIncreaseQuantity}
            className="px-3 py-1 border border-black bg-black text-white"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AddToCartButton; 