import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Plus, Minus, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { MenuItem } from '../types';

// Define API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showIngredients, setShowIngredients] = useState(false);
  const [showSustainability, setShowSustainability] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const { addItem } = useCart();

  // Get all product images (main image + additional images)
  const getAllProductImages = (product: MenuItem) => {
    const images = [product.image];
    
    // Add additional images if they exist
    if (product.additionalImages && product.additionalImages.length > 0) {
      images.push(...product.additionalImages);
    }
    
    return images;
  };

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const response = await fetch(`${API_URL}/menu/items/${id}`);
          const data = await response.json();
          
          if (data.success) {
            setProduct(data.item);
          } else {
            setError('Failed to load product');
          }
          setLoading(false);
        } catch (error) {
          console.error(`Error fetching product with ID ${id}:`, error);
          setError('Error loading product. Please try again later.');
          setLoading(false);
        }
      };
      
      fetchProduct();
    }
  }, [id]);

  // Handle quantity change
  const handleIncreaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (product) {
      // Add item with quantity
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          specialInstructions: specialInstructions
        });
      }
      // Reset quantity
      setQuantity(1);
      setSpecialInstructions('');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center py-16">
          <h2 className="text-2xl font-light mb-4">Error</h2>
          <p className="text-red-500 mb-8 font-light">{error}</p>
          <Link 
            to="/shop"
            className="inline-block px-6 py-3 border border-black text-sm uppercase tracking-wide font-light hover:bg-black hover:text-white transition-colors"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center py-16">
          <h2 className="text-2xl font-light mb-4">Product not found</h2>
          <p className="text-gray-500 mb-8 font-light">The product you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/shop"
            className="inline-block px-6 py-3 border border-black text-sm uppercase tracking-wide font-light hover:bg-black hover:text-white transition-colors"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  // Get all product images (main + additional)
  const productImages = product ? getAllProductImages(product) : [];
  const showThumbnails = productImages.length > 1;

  return (
    <>
      <Helmet>
        <title>{product.name} | Lentil Life</title>
        <meta 
          name="description" 
          content={product.description}
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <Link
            to="/shop"
            className="flex items-center text-sm uppercase tracking-wide font-light hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to shop
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image and Thumbnails (if available) */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden">
              <img 
                src={productImages[activeImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Show thumbnails only if there are multiple images */}
            {showThumbnails && (
              <div className="grid grid-cols-3 gap-2">
                {productImages.map((image, index) => (
                  <button 
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`aspect-square border ${activeImage === index ? 'border-black' : 'border-gray-200'}`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} - view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div>
            {/* Category and Name */}
            <div className="mb-6">
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-2 font-light">NEW</div>
              <h1 className="text-2xl font-light mb-6">{product.name}</h1>
              <div className="mb-6">
                {/* Stars would be dynamic based on reviews, using placeholders */}
                <div className="flex items-center mb-1">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-gray-300 fill-gray-300" />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">0 reviews</span>
                </div>
              </div>
              <p className="text-lg font-light">${product.price.toFixed(2)}</p>
            </div>
            
            {/* Quantity Selector */}
            <div className="flex items-center justify-between border-b border-t border-gray-200 py-4 mb-4">
              <div className="flex items-center">
                <button
                  onClick={handleDecreaseQuantity}
                  className="w-8 h-8 flex items-center justify-center"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-3 h-3 text-gray-500" />
                </button>
                <span className="w-8 text-center text-sm">{quantity}</span>
                <button
                  onClick={handleIncreaseQuantity}
                  className="w-8 h-8 flex items-center justify-center"
                >
                  <Plus className="w-3 h-3 text-gray-500" />
                </button>
              </div>
              
              <button
                onClick={handleAddToCart}
                className="bg-gray-800 text-white text-xs uppercase tracking-wide py-3 px-16 font-light"
              >
                Add to Cart
              </button>
            </div>
            
            {/* Product Description */}
            <div className="font-light text-sm mb-8">
              <p className="mb-4">{product.description}</p>
              
              {/* Size info */}
              <p className="text-sm text-gray-500 mb-8">{product.category === 'breakfast' ? '8oz' : product.category === 'lunch' ? '12oz' : '13oz'}</p>
            </div>
            
            {/* Collapsible Sections */}
            <div className="space-y-4">
              {/* Ingredients Section */}
              <div className="border border-gray-800">
                <button 
                  onClick={() => setShowIngredients(!showIngredients)} 
                  className="w-full flex items-center justify-between p-4 text-sm uppercase tracking-wide font-light"
                >
                  <span>Ingredients</span>
                  {showIngredients ? 
                    <ChevronUp className="w-4 h-4" /> : 
                    <ChevronDown className="w-4 h-4" />
                  }
                </button>
                
                {showIngredients && (
                  <div className="p-4 text-sm font-light border-t border-gray-200">
                    <ul className="list-disc pl-5 space-y-1">
                      {product.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                    <div className="mt-4">
                      <h3 className="font-medium text-sm mb-2">Nutritional Information</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
                        <div>
                          <p>{product.nutritionalInfo.calories}</p>
                          <p className="text-gray-500">Calories</p>
                        </div>
                        <div>
                          <p>{product.nutritionalInfo.protein}g</p>
                          <p className="text-gray-500">Protein</p>
                        </div>
                        <div>
                          <p>{product.nutritionalInfo.carbs}g</p>
                          <p className="text-gray-500">Carbs</p>
                        </div>
                        <div>
                          <p>{product.nutritionalInfo.fat}g</p>
                          <p className="text-gray-500">Fat</p>
                        </div>
                        <div>
                          <p>{product.nutritionalInfo.fiber}g</p>
                          <p className="text-gray-500">Fiber</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sustainability Section */}
              <div className="border border-gray-800">
                <button 
                  onClick={() => setShowSustainability(!showSustainability)} 
                  className="w-full flex items-center justify-between p-4 text-sm uppercase tracking-wide font-light"
                >
                  <span>Sustainability</span>
                  {showSustainability ? 
                    <ChevronUp className="w-4 h-4" /> : 
                    <ChevronDown className="w-4 h-4" />
                  }
                </button>
                
                {showSustainability && (
                  <div className="p-4 text-sm font-light border-t border-gray-200">
                    <p>
                      At Lentil Life, we believe in sustainable food production. Our ingredients are sourced from 
                      local, organic farms that practice regenerative agriculture. Our packaging is 
                      biodegradable, and we're committed to reducing our carbon footprint throughout our supply chain.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Special Instructions */}
            <div className="mt-8">
              <label htmlFor="specialInstructions" className="block text-xs uppercase tracking-wide font-light mb-2">
                Special Instructions (optional)
              </label>
              <textarea
                id="specialInstructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 font-light text-sm"
                placeholder="Any specific instructions for this item?"
              />
            </div>
          </div>
        </div>
        
        {/* Customer Reviews */}
        <div className="mt-20 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-light mb-8">Customer reviews</h2>
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="text-4xl font-light mr-4">0</div>
              <div>
                <div className="flex">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gray-300 fill-gray-300" />
                  ))}
                </div>
                <div className="text-sm text-gray-500 mt-1">0 reviews</div>
              </div>
            </div>
            
            <button className="border border-gray-800 px-4 py-2 text-xs uppercase tracking-wide font-light">
              Write a review
            </button>
          </div>
          
          {/* Rating breakdown */}
          <div className="mb-8">
            {[5, 4, 3, 2, 1].map(stars => (
              <div key={stars} className="flex items-center mb-1">
                <div className="w-8 text-right mr-2 text-xs">{stars} ★</div>
                <div className="flex-grow bg-gray-100 h-2 rounded-sm mr-2">
                  <div className="bg-gray-500 h-2 rounded-sm w-0"></div>
                </div>
                <div className="text-xs">0%</div>
              </div>
            ))}
          </div>
          
          {/* Review filters */}
          <div className="flex space-x-2 mb-10">
            <button className="border border-gray-300 rounded-full px-3 py-1 text-xs">
              All reviews
            </button>
            <button className="border border-gray-300 rounded-full px-3 py-1 text-xs">
              Most recent
            </button>
            <button className="border border-gray-300 rounded-full px-3 py-1 text-xs">
              5 stars
            </button>
          </div>
          
          {/* No reviews message */}
          <div className="text-center py-10 text-gray-500 font-light">
            No reviews yet
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage; 