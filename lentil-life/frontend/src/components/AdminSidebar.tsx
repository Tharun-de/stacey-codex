import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Menu, Database, ShoppingBag, Clock, CreditCard } from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  
  const menuItems = [
    { label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/admin' },
    { label: 'Menu Management', icon: <Menu className="w-5 h-5" />, path: '/admin/menu' },
    { label: 'Orders', icon: <ShoppingBag className="w-5 h-5" />, path: '/admin/orders' },
    { label: 'Pickup Times', icon: <Clock className="w-5 h-5" />, path: '/admin/pickup-times' },
    { label: 'Backups', icon: <Database className="w-5 h-5" />, path: '/admin/backups' },
    { label: 'Payment Settings', icon: <CreditCard className="w-5 h-5" />, path: '/admin/payment-settings' }
  ];
  
  // Function to check if a menu item is active
  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <aside className="bg-white w-64 min-h-screen shadow-sm p-4 hidden md:block">
      <div className="mb-8">
        <h2 className="text-xl font-light">Admin Portal</h2>
      </div>
      
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded transition-colors ${
                  isActive(item.path)
                    ? 'bg-gray-100 text-black'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar; 