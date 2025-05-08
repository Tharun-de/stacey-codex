import React from 'react';
import { Filter } from 'lucide-react';

interface MenuFilterProps {
  activeFilters: {
    vegan: boolean;
    vegetarian: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
  };
  onFilterChange: (filterKey: keyof typeof activeFilters) => void;
}

const MenuFilter: React.FC<MenuFilterProps> = ({ activeFilters, onFilterChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
      <div className="flex items-center mb-4">
        <Filter size={20} className="text-[#7D9D74] mr-2" />
        <h3 className="text-lg font-medium">Dietary Preferences</h3>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <FilterButton 
          label="Vegan" 
          isActive={activeFilters.vegan} 
          onClick={() => onFilterChange('vegan')} 
        />
        <FilterButton 
          label="Vegetarian" 
          isActive={activeFilters.vegetarian} 
          onClick={() => onFilterChange('vegetarian')} 
        />
        <FilterButton 
          label="Gluten-Free" 
          isActive={activeFilters.glutenFree}
          onClick={() => onFilterChange('glutenFree')} 
        />
        <FilterButton 
          label="Dairy-Free" 
          isActive={activeFilters.dairyFree}
          onClick={() => onFilterChange('dairyFree')} 
        />
      </div>
    </div>
  );
};

interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
        ${isActive 
          ? 'bg-[#7D9D74] text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default MenuFilter;