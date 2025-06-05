import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
// Remove import from static file
// import { menuItems } from '../data/menuData';
import { MenuItem as MenuItemType } from '../types';
import AddToCartButton from '../components/AddToCartButton';
import { API_URL } from '../config';

// Define API URL
// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Interface for API response
interface APIMenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  dietary_info?: {
    vegan?: boolean;
    vegetarian?: boolean;
    glutenFree?: boolean;
    dairyFree?: boolean;
  };
  nutritional_info?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
  ingredients?: string | string[];
}

const ShopPage = () => {
  const [filters, setFilters] = useState({
    vegan: false,
    vegetarian: false,
    glutenFree: false,
    dairyFree: false
  });
  
  const [filteredItems, setFilteredItems] = useState<MenuItemType[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Fetch menu items from the API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/menu/items`);
        const data = await response.json();
        
        if (data.success) {
          // Transform API data to match frontend types
          const transformedItems = data.items.map((item: APIMenuItem) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image_url, // Transform image_url to image
            category: item.category,
            dietaryInfo: {
              vegan: item.dietary_info?.vegan || false,
              vegetarian: item.dietary_info?.vegetarian || false,
              glutenFree: item.dietary_info?.glutenFree || false,
              dairyFree: item.dietary_info?.dairyFree || false
            },
            nutritionalInfo: {
              calories: item.nutritional_info?.calories || 0,
              protein: item.nutritional_info?.protein || 0,
              carbs: item.nutritional_info?.carbs || 0,
              fat: item.nutritional_info?.fat || 0,
              fiber: item.nutritional_info?.fiber || 0
            },
            ingredients: Array.isArray(item.ingredients) ? item.ingredients : [item.ingredients || '']
          }));
          
          setMenuItems(transformedItems);
          setLoading(false);
        } else {
          setError('Failed to load menu items');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setError('Error loading menu. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchMenuItems();
  }, []);
  
  // Group items by category
  const breakfast = filteredItems.filter(item => item.category === 'breakfast');
  const lunch = filteredItems.filter(item => item.category === 'lunch');
  const dinner = filteredItems.filter(item => item.category === 'dinner');
  const dessert = filteredItems.filter(item => item.category === 'dessert');
  
  // Filter the items when filters or category changes
  useEffect(() => {
    if (!menuItems || menuItems.length === 0) return;
    
    const newFilteredItems = menuItems.filter(item => {
      if (filters.vegan && !item.dietaryInfo.vegan) return false;
      if (filters.vegetarian && !item.dietaryInfo.vegetarian) return false;
      if (filters.glutenFree && !item.dietaryInfo.glutenFree) return false;
      if (filters.dairyFree && !item.dietaryInfo.dairyFree) return false;
      
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      
      return true;
    });
    
    setFilteredItems(newFilteredItems);
  }, [filters, activeCategory, menuItems]);
  
  const handleFilterChange = (filterKey: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };
  
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'dessert', label: 'Dessert' }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading menu items...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64 flex-col">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  const renderItemGrid = (items: MenuItemType[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {items.length > 0 ? (
        items.map(item => (
          <div
            key={item.id}
            className="group"
          >
            <Link to={`/product/${item.id}`} className="block">
              <div className="aspect-square overflow-hidden mb-4">
              <img 
                src={item.image} 
                alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              <div>
                <h3 className="font-light text-lg mb-1">{item.name}</h3>
                <p className="text-gray-700 font-light mb-3">${item.price.toFixed(2)}</p>
              </div>
            </Link>
              
            <div className="flex flex-wrap gap-2 mb-4">
                {item.dietaryInfo.vegan && (
                <span className="px-2 py-0.5 text-xs uppercase tracking-wide border border-gray-200">
                    Vegan
                  </span>
                )}
                {item.dietaryInfo.vegetarian && (
                <span className="px-2 py-0.5 text-xs uppercase tracking-wide border border-gray-200">
                    Vegetarian
                  </span>
                )}
                {item.dietaryInfo.glutenFree && (
                <span className="px-2 py-0.5 text-xs uppercase tracking-wide border border-gray-200">
                    Gluten-Free
                  </span>
                )}
              </div>
              
            <AddToCartButton
              id={item.id}
              name={item.name}
              price={item.price}
              image={item.image}
            />
            </div>
        ))
      ) : (
        <div className="col-span-full p-8 text-center">
          <p className="text-gray-500 font-light">
            No items match your selected filters. Try adjusting your preferences.
          </p>
        </div>
      )}
    </div>
  );
  
  return (
    <>
      <Helmet>
        <title>Shop | Lentil Life</title>
        <meta 
          name="description" 
          content="Shop Lentil Life's delicious, nutritious menu of plant-based foods. Order breakfast, lunch, dinner, and desserts crafted with organic ingredients."
        />
      </Helmet>
      
      <div className="pt-28 pb-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-3xl font-light text-center mb-6">Our Menu</h1>
          <p className="text-gray-700 max-w-xl mx-auto text-center mb-12 font-light">
            All dishes made with sustainable ingredients ethically sourced from local farms.
          </p>
          
          {/* Filter By Diet */}
          <div className="border-t border-b border-gray-200 py-6 mb-12">
            <div className="max-w-xl mx-auto">
              <h3 className="text-xs uppercase tracking-wide mb-4 font-light text-center">Dietary Preferences</h3>
              <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => handleFilterChange('vegan')}
                  className={`px-3 py-1.5 text-xs uppercase tracking-wide border ${
                  filters.vegan
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                Vegan
              </button>
              <button
                onClick={() => handleFilterChange('vegetarian')}
                  className={`px-3 py-1.5 text-xs uppercase tracking-wide border ${
                  filters.vegetarian
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                Vegetarian
              </button>
              <button
                onClick={() => handleFilterChange('glutenFree')}
                  className={`px-3 py-1.5 text-xs uppercase tracking-wide border ${
                  filters.glutenFree
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                Gluten-Free
              </button>
              <button
                onClick={() => handleFilterChange('dairyFree')}
                  className={`px-3 py-1.5 text-xs uppercase tracking-wide border ${
                  filters.dairyFree
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                Dairy-Free
              </button>
              </div>
            </div>
          </div>
          
          {/* Category Selector */}
          <div className="flex justify-center mb-12">
            <div className="flex space-x-6">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`text-sm uppercase tracking-wide font-light ${
                    activeCategory === category.id 
                      ? 'border-b border-black pb-1' 
                      : 'text-gray-700 hover:text-black pb-1'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Product Sections */}
          {activeCategory === 'all' ? (
            <>
              {breakfast.length > 0 && (
                <div className="mb-20">
                  <h2 className="text-2xl font-light mb-8 text-center">Breakfast</h2>
                  {renderItemGrid(breakfast)}
                </div>
              )}
              
              {lunch.length > 0 && (
                <div className="mb-20">
                  <h2 className="text-2xl font-light mb-8 text-center">Lunch</h2>
                  {renderItemGrid(lunch)}
                </div>
              )}
              
              {dinner.length > 0 && (
                <div className="mb-20">
                  <h2 className="text-2xl font-light mb-8 text-center">Dinner</h2>
                  {renderItemGrid(dinner)}
                </div>
              )}
              
              {dessert.length > 0 && (
                <div className="mb-20">
                  <h2 className="text-2xl font-light mb-8 text-center">Dessert</h2>
                  {renderItemGrid(dessert)}
                </div>
              )}
            </>
          ) : (
            <div>
              {filteredItems.length > 0 ? (
                renderItemGrid(filteredItems)
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 font-light">
                    No items match your selected filters. Try adjusting your preferences.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShopPage;