import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { MenuItem } from '../types';

const HomePage: React.FC = () => {
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/menu/items`);
        if (!response.ok) {
          throw new Error('Failed to fetch menu items');
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.items)) {
          const allItems: MenuItem[] = data.items;
          const filtered = allItems
            .filter(item => item.popular || allItems.indexOf(item) < 3)
            .slice(0, 3);
          setFeaturedItems(filtered);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (err) {
        const e = err as Error;
        setError(e.message || 'Could not load featured items.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  return (
    <>
      <Helmet>
        <title>Lentil Life | Organic & Sustainable Plant-Based Food</title>
        <meta 
          name="description" 
          content="Discover Lentil Life: Delicious, nutritious plant-based meals made with sustainable practices."
        />
      </Helmet>
      <div className="bg-white">
        <Hero />
        
        {/* Featured Products Grid - Mast Market style */}
        <section className="py-12 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-light text-center text-gray-800 mb-10 md:mb-16">
              Freshly Made, Just For You
            </h2>
            
            {isLoading && (
              <div className="text-center text-gray-500">
                <p>Loading featured items...</p>
              </div>
            )}

            {error && (
              <div className="text-center text-red-500 bg-red-50 p-4 rounded-md">
                <p>Could not load featured items: {error}</p>
              </div>
            )}

            {!isLoading && !error && featuredItems.length === 0 && (
              <div className="text-center text-gray-500">
                <p>No featured items to display at the moment. Check out our <Link to="/shop" className="text-green-600 hover:underline">full menu</Link>!</p>
              </div>
            )}

            {!isLoading && !error && featuredItems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {featuredItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden group">
                    <Link to={`/product/${item.id}`} className="block">
                      <div className="aspect-square overflow-hidden mb-4">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <h3 className="font-light text-lg mb-1">{item.name}</h3>
                      <p className="text-gray-700 font-light mb-2">${item.price.toFixed(2)}</p>
                    </Link>
                    <Link 
                      to={`/product/${item.id}`} 
                      className="text-sm uppercase tracking-wide font-light border-b border-gray-400 pb-0.5 hover:border-black"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Our Story Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 md:px-8 max-w-4xl">
            <div className="text-center">
              <h2 className="text-2xl font-light mb-8">Our Philosophy</h2>
              <p className="text-gray-700 leading-relaxed mb-8 font-light">
                At Lentil Life, we believe in the power of plant-based eating. Our dishes are crafted with
                organic ingredients sourced from local farms with sustainable practices. We're committed to 
                providing food that nourishes both people and the planet.
              </p>
              <Link 
                to="/about" 
                className="inline-block uppercase tracking-wide text-sm border-b border-gray-400 pb-1 font-light"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
        
        {/* Newsletter Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 md:px-8 max-w-lg text-center">
            <h2 className="text-2xl font-light mb-4">Join Our Newsletter</h2>
            <p className="text-gray-700 mb-6 font-light">
              Stay updated with new menu items, special offers, and sustainability initiatives.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="flex-grow px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
              />
              <button className="bg-black text-white px-6 py-3 uppercase tracking-wide text-sm font-light">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;