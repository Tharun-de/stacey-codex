import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import AboutUsPage from './pages/AboutUsPage';
import CartPage from './pages/CartPage';
import ContactPage from './pages/ContactPage';
import EducationPage from './pages/EducationPage';
import AdminMenuPage from './pages/AdminMenuPage';
import ProductPage from './pages/ProductPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { PaymentProvider } from './context/PaymentContext';
import AdminBackupPage from './pages/AdminBackupPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminTimeSlotPage from './pages/AdminTimeSlotPage.tsx';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminPaymentSettingsPage from './pages/AdminPaymentSettingsPage.tsx';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './components/PrivateRoute';

// Define API URL for use throughout the app
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function App() {
  // Initially, user is not scrolled, so promo banner space is visible.
  const [isPromoBannerVisible, setIsPromoBannerVisible] = useState(true);

  // Callback for Navbar to update banner visibility
  const handlePromoBannerVisibilityChange = useCallback((isVisible: boolean) => {
    setIsPromoBannerVisible(isVisible);
  }, []);

  // Define padding classes based on new sketch dimensions
  // Navbar height: 60px
  // Banner height: 40px
  // Combined: 100px (6.25rem)
  const mainPaddingTopClass = isPromoBannerVisible ? 'pt-[100px]' : 'pt-[60px]';

  return (
    <HelmetProvider>
      <AuthProvider>
        <PaymentProvider>
          <CartProvider>
            <BrowserRouter>
              <ScrollToTop />
              <div className="flex flex-col min-h-screen">
                <Navbar onPromoBannerVisibilityChange={handlePromoBannerVisibilityChange} />
                {/* Add extra padding at the top to account for fixed header elements */}
                <main className={`flex-grow ${mainPaddingTopClass} transition-all duration-300`}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/about" element={<AboutUsPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/education" element={<EducationPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/admin" element={<AdminDashboardPage />} />
                    <Route path="/admin/menu" element={<PrivateRoute><AdminMenuPage /></PrivateRoute>} />
                    <Route path="/admin/backups" element={<AdminBackupPage />} />
                    <Route path="/admin/orders" element={<AdminOrdersPage />} />
                    <Route path="/admin/pickup-times" element={<PrivateRoute><AdminTimeSlotPage /></PrivateRoute>} />
                    <Route path="/admin/payment-settings" element={<PrivateRoute><AdminPaymentSettingsPage /></PrivateRoute>} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </CartProvider>
        </PaymentProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;