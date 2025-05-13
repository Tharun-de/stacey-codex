import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative h-[90vh] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
          alt="A vibrant display of fresh, organic ingredients used in Lentil Life dishes"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="absolute inset-0 flex flex-col justify-center items-start pl-10 md:pl-20 lg:pl-28">
        <div className="max-w-md">
            <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-6"
            >
            Organic Plant-Based Food
            </motion.h1>
            <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-base text-white/90 mb-8 max-w-sm font-light"
            >
            Pure, clean flavor of sustainable ingredients ethically sourced from local farms.
            </motion.p>
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            >
              <Link
              to="/shop"
              className="inline-block bg-white text-gray-900 px-6 py-3 
                        text-sm uppercase tracking-wider font-light hover:bg-gray-100"
              >
              Shop Menu
              </Link>
            </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;