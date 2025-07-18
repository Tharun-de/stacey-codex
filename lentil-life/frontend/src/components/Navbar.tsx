import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PointsDisplay from './PointsDisplay';

interface NavbarProps {
  onPromoBannerVisibilityChange: (isVisible: boolean) => void;
}

// Custom basket icon component that matches the minimalist Mast Market design
const BasketIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Navbar: React.FC<NavbarProps> = ({ onPromoBannerVisibilityChange }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalItems } = useCart();
  const { user, signOut, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect to notify parent about promo banner visibility for spacing
  useEffect(() => {
    onPromoBannerVisibilityChange(!isScrolled);
  }, [isScrolled, onPromoBannerVisibilityChange]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="w-full fixed z-50">
      {/* Simple promotional banner */}
      {!isScrolled && (
        <div className="w-full bg-gray-100 text-center py-2 text-xs uppercase tracking-wider font-light">
          Free Shipping on Orders Over $50
        </div>
      )}
      
      {/* Simple, elegant navigation */}
      <div 
        className={`w-full transition-colors duration-300 ${isScrolled ? 'bg-white shadow-sm' : 'bg-white'}`}
      >
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-gray-800" />
            ) : (
              <Menu className="h-5 w-5 text-gray-800" />
            )}
          </button>
          
          {/* Left Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/shop">Shop</NavLink>
            <NavLink to="/about">About</NavLink>
          </div>
          
          {/* Logo - Center */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="font-light text-xl tracking-wide">
              LENTIL LIFE
            </Link>
          </div>
          
          {/* Right Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/contact">Contact</NavLink>
            
            {/* Auth Section */}
            {!isLoading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 text-sm uppercase tracking-wider font-light hover:opacity-70 transition-opacity"
                    >
                      <User className="h-4 w-4" />
                      <span>{user.firstName}</span>
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="px-4 py-2 border-b">
                          <PointsDisplay userId={user.id} compact={true} showHistory={false} />
                        </div>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Orders
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="inline h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <NavLink to="/login">Login</NavLink>
                    <Link
                      to="/signup"
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-xs uppercase tracking-wider font-medium hover:bg-green-700 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}
            
            <Link to="/cart" className="relative">
              <BasketIcon />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
          
          {/* Mobile right icons */}
          <div className="md:hidden flex items-center space-x-4">
            {!isLoading && !user && (
              <Link
                to="/signup"
                className="bg-green-600 text-white px-3 py-1 rounded-md text-xs uppercase tracking-wider font-medium"
              >
                Sign Up
              </Link>
            )}
            <Link to="/cart" className="relative">
              <BasketIcon />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="space-y-3">
              <MobileNavLink to="/shop" onClick={() => setMobileMenuOpen(false)}>Shop</MobileNavLink>
              <MobileNavLink to="/about" onClick={() => setMobileMenuOpen(false)}>About</MobileNavLink>
              <MobileNavLink to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</MobileNavLink>
              
              {/* Mobile Auth Links */}
              {!isLoading && (
                <>
                  {user ? (
                    <>
                      <div className="border-t pt-3 mt-3">
                        <div className="text-sm text-gray-600 mb-2">
                          Welcome, {user.firstName}!
                        </div>
                        <MobileNavLink to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</MobileNavLink>
                        <MobileNavLink to="/orders" onClick={() => setMobileMenuOpen(false)}>My Orders</MobileNavLink>
                        <button
                          onClick={() => {
                            handleSignOut();
                            setMobileMenuOpen(false);
                          }}
                          className="block w-full text-left py-2 text-sm uppercase tracking-wider font-light text-red-600"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="border-t pt-3 mt-3 space-y-3">
                      <MobileNavLink to="/login" onClick={() => setMobileMenuOpen(false)}>Login</MobileNavLink>
                      <MobileNavLink to="/signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</MobileNavLink>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// Simplified NavLink for desktop
const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link 
    to={to} 
    className="text-sm uppercase tracking-wider font-light hover:opacity-70 transition-opacity"
  >
    {children}
  </Link>
);

// Mobile NavLink
const MobileNavLink = ({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: () => void }) => (
  <Link 
    to={to} 
    className="block py-2 text-sm uppercase tracking-wider font-light"
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Navbar;