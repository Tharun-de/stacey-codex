import React, { useState, useEffect } from 'react';
import MenuItem from '../components/MenuItem';
import MenuFilter from '../components/MenuFilter';
import OrderForm from '../components/OrderForm';
import { menuItems } from '../data/menuData';
import { MenuItem as MenuItemType } from '../types';
import { ShoppingCart } from 'lucide-react';

const MenuPage = () => {
  const [filters, setFilters] = useState({
    vegan: false,
    vegetarian: false,
    glutenFree: false,
    dairyFree: false
  });
  
  const [filteredItems, setFilteredItems] = useState(menuItems);
  const [selectedItems, setSelectedItems] = useState<MenuItemType[]>([]);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  useEffect(() => {
    const newFilteredItems = menuItems.filter(item => {
      if (filters.vegan && !item.dietaryInfo.vegan) return false;
      if (filters.vegetarian && !item.dietaryInfo.vegetarian) return false;
      if (filters.glutenFree && !item.dietaryInfo.glutenFree) return false;
      if (filters.dairyFree && !item.dietaryInfo.dairyFree) return false;
      return true;
    });
    
    setFilteredItems(newFilteredItems);
  }, [filters]);
  
  const handleFilterChange = (filterKey: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };
  
  const handleAddToOrder = (item: MenuItemType) => {
    setSelectedItems(prev => [...prev, item]);
  };
  
  const handleOrderComplete = (orderNum: string) => {
    setOrderComplete(true);
    setOrderNumber(orderNum);
  };
  
  const handleClearItems = () => {
    setSelectedItems([]);
  };
  
  return (
    <div className="pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col mb-8">
          <h1 className="text-3xl font-bold mb-2">Our Menu</h1>
          <p className="text-gray-600">
            Explore our range of nutritious, delicious wraps and bowls made with locally-sourced ingredients.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            <MenuFilter 
              activeFilters={filters}
              onFilterChange={handleFilterChange}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <MenuItem 
                    key={item.id} 
                    item={item} 
                    onAddToOrder={handleAddToOrder} 
                  />
                ))
              ) : (
                <div className="col-span-full p-8 bg-white rounded-lg shadow-sm text-center">
                  <p className="text-gray-500">
                    No items match your selected filters. Try adjusting your dietary preferences.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <div className="sticky top-24">
              {selectedItems.length > 0 && (
                <div className="mb-4 p-4 bg-[#F5F1E8] rounded-lg flex items-center">
                  <ShoppingCart size={20} className="text-[#7D9D74] mr-2" />
                  <span className="font-medium">
                    {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} in your order
                  </span>
                </div>
              )}
              
              <OrderForm 
                selectedItems={selectedItems}
                onOrderComplete={handleOrderComplete}
                onClearItems={handleClearItems}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;