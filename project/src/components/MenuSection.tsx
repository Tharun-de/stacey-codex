import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { MenuItem } from '../types';
import { menuItems } from '../data/menuData';

interface MenuSectionProps {
  onAddToCart: (item: MenuItem) => void;
}

const MenuSection: React.FC<MenuSectionProps> = ({ onAddToCart }) => {
  const filteredItems = menuItems.slice(0, 8); // Show first 8 items on homepage
  
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-heading font-bold mb-6">Our Menu</h2>
          <p className="text-lg text-gray-600">
            Discover our selection of nutritious wraps and bowls, crafted with 
            locally-sourced ingredients and sustainable practices.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-brand-cream rounded-lg overflow-hidden group"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-heading font-bold">{item.name}</h3>
                  <span className="text-brand-forest font-medium">${item.price.toFixed(2)}</span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.dietaryInfo.vegan && (
                    <span className="px-2 py-1 text-xs rounded-full bg-brand-sage/20 text-brand-sage">
                      Vegan
                    </span>
                  )}
                  {item.dietaryInfo.glutenFree && (
                    <span className="px-2 py-1 text-xs rounded-full bg-brand-sage/20 text-brand-sage">
                      Gluten-Free
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => onAddToCart(item)}
                  className="w-full flex items-center justify-center gap-2 bg-brand-forest text-white py-3 rounded-lg 
                           transition-all duration-300 ease-in-out hover:scale-105 
                           group-hover:bg-brand-secondary group-hover:-translate-y-1"
                >
                  <Plus size={18} />
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/menu">
            <motion.span
              className="inline-block text-xl font-heading font-semibold text-brand-forest border-b-2 border-brand-forest px-2 pb-1"
              whileHover={{ y: -2, borderColor: "#D37F46" }}
              transition={{ duration: 0.2 }}
            >
              View Full Menu →
            </motion.span>
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default MenuSection;