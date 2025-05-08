import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import ProductFeature from '../components/ProductFeature';
import MenuSection from '../components/MenuSection';
import Cart from '../components/Cart';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MenuItem } from '../types';
import { ShoppingBag } from 'lucide-react';

const HomePage = () => {
  const [cartItems, setCartItems] = useState<MenuItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (item: MenuItem) => {
    setCartItems(prev => [...prev, item]);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (itemId: number) => {
    setCartItems(prev => {
      const index = prev.findIndex(item => item.id === itemId);
      if (index === -1) return prev;
      return [...prev.slice(0, index), ...prev.slice(index + 1)];
    });
  };

  return (
    <>
      <Helmet>
        <title>Stacey's Wraps | Organic & Sustainable Wraps, Bowls</title>
        <meta 
          name="description" 
          content="Discover Stacey's Wraps: Delicious, handcrafted wraps and bowls made with fresh, organic ingredients and sustainable practices. Perfect for a healthy and flavorful meal."
        />
      </Helmet>
      <div className="bg-brand-cream">
        {/* Cart Toggle Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed right-6 top-24 z-30 bg-brand-forest text-white p-3 rounded-full shadow-lg 
                     transition-transform hover:scale-110"
        >
          <div className="relative">
            <ShoppingBag size={24} />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 
                             rounded-full flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </div>
        </button>

        <Cart
          items={cartItems}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onRemoveItem={handleRemoveFromCart}
        />
        
        <Hero />
        
        {/* Menu Section */}
        <MenuSection onAddToCart={handleAddToCart} />
        
        {/* Values Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl font-heading font-bold mb-6"
              >
                Our Values
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-gray-600"
              >
                Every wrap we create is a testament to our commitment to health, 
                sustainability, and delicious food that makes you feel good.
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Organic Ingredients",
                  description: "Sourced from local farms within 50 miles"
                },
                {
                  title: "Sustainable Packaging",
                  description: "100% compostable materials"
                },
                {
                  title: "Handcrafted Daily",
                  description: "Fresh preparation, never processed"
                }
              ].map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="text-center p-8 bg-white rounded-lg shadow-sm 
                             hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-in-out"
                >
                  <h3 className="text-2xl font-heading font-bold mb-4">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Product Features */}
        <section className="py-24">
          <div className="container mx-auto px-4 space-y-32">
            <ProductFeature
              image="https://images.pexels.com/photos/2955819/pexels-photo-2955819.jpeg"
              imageAlt="A close-up of a delicious Mediterranean wrap, sliced in half, showcasing fresh ingredients."
              title="Mediterranean Delight"
              description="A fresh blend of hummus, falafel, mixed greens, and tahini sauce, 
                        wrapped in our signature organic flatbread. Every bite is a perfect 
                        balance of protein, fiber, and flavor."
            />
            
            <ProductFeature
              image="https://images.pexels.com/photos/1095550/pexels-photo-1095550.jpeg"
              imageAlt="An assortment of fresh seasonal vegetables like tomatoes, peppers, and avocados on a rustic wooden table."
              title="Seasonal Ingredients"
              description="We work directly with local farmers to source the freshest seasonal 
                        produce, ensuring peak flavor and minimal environmental impact."
              reverse
            />
            
            <ProductFeature
              image="https://images.pexels.com/photos/5966431/pexels-photo-5966431.jpeg"
              imageAlt="Eco-friendly compostable food packaging, highlighting sustainable choices."
              title="Sustainable Practices"
              description="From our compostable packaging to our zero-waste initiatives, 
                        every aspect of our operation is designed with the planet in mind."
            />
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-24 bg-brand-forest text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-heading font-bold mb-6"
            >
              Ready to Try Stacey's Wraps?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl mb-8 opacity-90"
            >
              Order now and experience the perfect blend of health and flavor.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link
                to="/menu"
                className="inline-block bg-white text-brand-forest px-8 py-4 rounded-full 
                          text-lg font-medium transition-transform hover:scale-105"
              >
                View Full Menu
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;