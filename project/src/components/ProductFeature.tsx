import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface ProductFeatureProps {
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  reverse?: boolean;
}

const ProductFeature: React.FC<ProductFeatureProps> = ({ 
  image, 
  imageAlt,
  title, 
  description, 
  reverse = false 
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  return (
    <div 
      ref={ref}
      className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 lg:gap-16`}
    >
      <motion.div 
        initial={{ opacity: 0, x: reverse ? 50 : -50 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2"
      >
        <img
          src={image}
          alt={imageAlt}
          className="w-full h-[500px] object-cover rounded-lg"
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, x: reverse ? -50 : 50 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full lg:w-1/2 text-center lg:text-left"
      >
        <h2 className="text-4xl font-heading font-bold mb-6">{title}</h2>
        <p className="text-lg text-gray-600 leading-relaxed">{description}</p>
      </motion.div>
    </div>
  );
};

export default ProductFeature;