import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative h-screen-90 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
          alt="A vibrant display of fresh, organic ingredients like lettuce, tomatoes, and herbs used in Stacey's Wraps"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
      
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-heading font-bold text-white mb-6"
            >
              Nourish Your Body, Respect Nature
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-white/90 mb-8 max-w-xl"
            >
              Handcrafted wraps made with organic ingredients, sustainable practices, 
              and love for both you and the planet.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link
                to="/menu"
                className="inline-block bg-white text-brand-forest px-8 py-4 rounded-full 
                          text-lg font-medium transition-transform hover:scale-105"
              >
                Explore Our Menu
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;