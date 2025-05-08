import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Salad, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsOpen(false);
  }, [location]);

  const navItems = [
    { title: 'Home', path: '/' },
    { title: 'Menu', path: '/menu' },
    { title: 'About Us', path: '/about' },
    { title: 'Education', path: '/education' },
    { title: 'Our Story', path: '/story' },
    { title: 'Contact', path: '/contact' },
  ];

  const mobileMenuVariants = {
    open: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.2 }
    },
    closed: {
      opacity: 0,
      transition: { staggerChildren: 0.05, staggerDirection: -1 }
    }
  };

  const mobileMenuItemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        y: { stiffness: 1000, velocity: -100 }
      }
    },
    closed: {
      y: 50,
      opacity: 0,
      transition: {
        y: { stiffness: 1000 }
      }
    }
  };

  const shouldBeTransparent = isHomePage && !isScrolled;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      shouldBeTransparent ? 'bg-transparent py-4' : 'bg-white shadow-md py-2'
    }`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Salad size={shouldBeTransparent ? 34 : 28} className="text-[#7D9D74] transition-all duration-300" />
            <div className={`transition-all duration-300 ${
              shouldBeTransparent ? "transform scale-125 origin-left" : ""
            }`}>
              <span className={`font-bold font-heading text-xl md:text-2xl ${
                shouldBeTransparent ? 'text-white drop-shadow-md' : 'text-gray-800'
              }`}>
                Stacey's Wraps
              </span>
              {shouldBeTransparent && 
                <div className="h-0.5 bg-brand-secondary mt-1 animate-pulse"></div>
              }
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-colors duration-200 ${
                  location.pathname === item.path 
                    ? 'text-[#E67E22] border-b-2 border-[#E67E22]' 
                    : shouldBeTransparent ? 'text-white hover:text-brand-cream' : 'text-gray-700 hover:text-[#7D9D74]'
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button className={`md:hidden ${shouldBeTransparent ? 'text-white' : 'text-gray-800'}`} onClick={toggleMenu}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div 
        className={`
          md:hidden bg-white fixed inset-x-0 shadow-md
          ${isOpen ? 'top-16' : '-top-full pointer-events-none'} 
        `}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
          closed: { opacity: 0, y: "-100%", transition: { duration: 0.3, ease: "easeIn" } }
        }}
      >
        <motion.div 
          className="flex flex-col px-4 pt-2 pb-4 space-y-3"
          variants={mobileMenuVariants}
        >
          {navItems.map((item) => (
            <motion.div variants={mobileMenuItemVariants} key={item.path}>
              <Link
                to={item.path}
                className={`block py-2 px-4 font-medium rounded-lg ${
                  location.pathname === item.path 
                    ? 'bg-[#F5F1E8] text-[#7D9D74]' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.title}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </nav>
  );
};

export default Navbar;