import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import { Link } from 'react-router-dom';
import { menuItems } from '../data/menuData';

const HomePage = () => {
  // Get a selection of items for the featured grid - let's ensure we select some popular items
  const featuredItems = menuItems
    .filter(item => item.popular || menuItems.indexOf(item) < 3) // Get popular items or first 3
    .slice(0, 3); // Limit to 3 items

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
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Breakfast",
                  image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666",
                  link: "/shop?category=breakfast"
                },
                {
                  title: "Lunch",
                  image: "https://images.unsplash.com/photo-1547496502-affa22d38842",
                  link: "/shop?category=lunch"
                },
                {
                  title: "Dinner",
                  image: "https://images.unsplash.com/photo-1594834749740-74b3f6764be4",
                  link: "/shop?category=dinner"
                }
              ].map((category) => (
                <Link 
                  key={category.title}
                  to={category.link}
                  className="block group"
                >
                  <div className="aspect-[4/3] overflow-hidden mb-4">
                    <img 
                      src={category.image} 
                      alt={category.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="uppercase tracking-wide text-sm font-light">
                      Shop {category.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
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
        
        {/* Featured Products */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-light mb-12 text-center">Featured Items</h2>
              
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredItems.map(item => (
                <div key={item.id} className="group">
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