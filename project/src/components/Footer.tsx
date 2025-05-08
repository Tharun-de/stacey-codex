import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Salad } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#F5F1E8] pt-12 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Salad size={24} className="text-[#7D9D74]" />
              <span className="font-bold text-xl">Stacey's Wraps</span>
            </div>
            <p className="text-gray-600 mb-4">
              Nourishing bodies while respecting nature. Our mission is to provide healthy, 
              sustainable food options that are good for you and the planet.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                 className="text-[#8B6E4F] hover:text-[#E67E22] transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                 className="text-[#8B6E4F] hover:text-[#E67E22] transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                 className="text-[#8B6E4F] hover:text-[#E67E22] transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 hover:text-[#7D9D74]">Home</Link></li>
              <li><Link to="/menu" className="text-gray-600 hover:text-[#7D9D74]">Menu</Link></li>
              <li><Link to="/about" className="text-gray-600 hover:text-[#7D9D74]">About Us</Link></li>
              <li><Link to="/story" className="text-gray-600 hover:text-[#7D9D74]">Our Story</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-[#7D9D74]">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-1">
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <address className="not-italic">
              <p className="text-gray-600 mb-2">123 Green Street</p>
              <p className="text-gray-600 mb-2">Healthyville, CA 98765</p>
              <p className="text-gray-600 mb-2">
                <a href="tel:+15551234567" className="hover:text-[#7D9D74]">(555) 123-4567</a>
              </p>
              <p className="text-gray-600">
                <a href="mailto:info@natureswraps.com" className="hover:text-[#7D9D74]">
                  info@natureswraps.com
                </a>
              </p>
            </address>
          </div>

          {/* Newsletter Signup */}
          <div className="md:col-span-1">
            <h3 className="font-semibold text-lg mb-4">Stay Updated</h3>
            <p className="text-gray-600 mb-4">
              Subscribe to our newsletter for seasonal menu updates and exclusive offers.
            </p>
            <form className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D9D74]"
                required
              />
              <button
                type="submit"
                className="bg-[#7D9D74] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Stacey's Wraps. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;