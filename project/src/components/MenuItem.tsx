import React, { useState } from 'react';
import { MenuItem as MenuItemType } from '../types';
import Button from './Button';
import { Info } from 'lucide-react';

interface MenuItemProps {
  item: MenuItemType;
  onAddToOrder: (item: MenuItemType) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, onAddToOrder }) => {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const dietaryTags = [];
  if (item.dietaryInfo.vegan) dietaryTags.push('Vegan');
  if (item.dietaryInfo.vegetarian) dietaryTags.push('Vegetarian');
  if (item.dietaryInfo.glutenFree) dietaryTags.push('Gluten-Free');
  if (item.dietaryInfo.dairyFree) dietaryTags.push('Dairy-Free');

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="h-48 overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
          <span className="font-medium text-[#E67E22]">${item.price.toFixed(2)}</span>
        </div>
        
        <p className="text-gray-600 mb-4">{item.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {dietaryTags.map((tag) => (
            <span 
              key={tag} 
              className="px-2 py-1 text-xs rounded-full bg-[#F5F1E8] text-[#8B6E4F]"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center space-x-2 mt-4">
          <Button 
            variant="primary" 
            onClick={() => onAddToOrder(item)}
          >
            Add to Order
          </Button>
          <Button 
            variant="outline" 
            onClick={toggleDetails}
            size="sm"
          >
            <Info size={16} className="mr-1" />
            Details
          </Button>
        </div>
      </div>
      
      {/* Nutrition & Ingredients Panel */}
      {showDetails && (
        <div className="p-6 pt-0 border-t border-gray-100 mt-2">
          <div className="grid grid-cols-5 gap-2 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Calories</p>
              <p className="font-semibold">{item.nutritionalInfo.calories}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Protein</p>
              <p className="font-semibold">{item.nutritionalInfo.protein}g</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Carbs</p>
              <p className="font-semibold">{item.nutritionalInfo.carbs}g</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Fat</p>
              <p className="font-semibold">{item.nutritionalInfo.fat}g</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Fiber</p>
              <p className="font-semibold">{item.nutritionalInfo.fiber}g</p>
            </div>
          </div>
          
          <h4 className="font-medium text-gray-700 mb-2">Ingredients:</h4>
          <ul className="text-sm text-gray-600 pl-5 list-disc">
            {item.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MenuItem;