import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Menu as MenuIcon, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Calendar,
  Package
} from 'lucide-react';
import { API_URL } from '../App';
import AdminSidebar from '../components/AdminSidebar';

interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

interface Order {
  id: string;
  status: string;
  date: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  total: number;
}

const AdminDashboardPage: React.FC = () => {
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0
  });
  
  const [menuStats, setMenuStats] = useState({
    totalItems: 0,
    categories: []
  });
  
  const [timeSlotStats, setTimeSlotStats] = useState({
    totalSlots: 0,
    availableDays: [],
    leadTime: 0
  });
  
  const [loading, setLoading] = useState({
    orders: true,
    menu: true,
    timeSlots: true
  });
  
  const [error, setError] = useState<{
    orders: string | null;
    menu: string | null;
    timeSlots: string | null;
  }>({
    orders: null,
    menu: null,
    timeSlots: null
  });
  
  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_URL}/orders`);
        const data = await response.json();
        
        if (data.success) {
          // Calculate stats
          const orders: Order[] = data.orders || [];
          const pending = orders.filter(order => order.status === 'pending').length;
          const processing = orders.filter(order => order.status === 'processing').length;
          const completed = orders.filter(order => order.status === 'completed').length;
          
          setOrderStats({
            total: orders.length,
            pending,
            processing,
            completed
          });
        } else {
          setError(prev => ({ ...prev, orders: 'Failed to load orders' }));
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(prev => ({ ...prev, orders: 'Error loading orders' }));
      } finally {
        setLoading(prev => ({ ...prev, orders: false }));
      }
    };
    
    fetchOrders();
  }, []);
  
  // Fetch menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const itemsResponse = await fetch(`${API_URL}/menu/items`);
        const categoriesResponse = await fetch(`${API_URL}/menu/categories`);
        
        const itemsData = await itemsResponse.json();
        const categoriesData = await categoriesResponse.json();
        
        if (itemsData.success && categoriesData.success) {
          setMenuStats({
            totalItems: itemsData.items.length,
            categories: categoriesData.categories
          });
        } else {
          setError(prev => ({ ...prev, menu: 'Failed to load menu data' }));
        }
      } catch (error) {
        console.error('Error fetching menu data:', error);
        setError(prev => ({ ...prev, menu: 'Error loading menu data' }));
      } finally {
        setLoading(prev => ({ ...prev, menu: false }));
      }
    };
    
    fetchMenuItems();
  }, []);
  
  // Fetch time slots
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const response = await fetch(`${API_URL}/time-slots/config`);
        const data = await response.json();
        
        if (data.success) {
          setTimeSlotStats({
            totalSlots: data.config.timeSlots.length,
            availableDays: data.config.availableDays,
            leadTime: data.config.leadTime
          });
        } else {
          setError(prev => ({ ...prev, timeSlots: 'Failed to load time slot configuration' }));
        }
      } catch (error) {
        console.error('Error fetching time slots:', error);
        setError(prev => ({ ...prev, timeSlots: 'Error loading time slots' }));
      } finally {
        setLoading(prev => ({ ...prev, timeSlots: false }));
      }
    };
    
    fetchTimeSlots();
  }, []);
  
  const renderOrdersSummary = () => (
    <div className="bg-white rounded shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-light">Orders</h3>
        <ShoppingBag className="w-5 h-5" />
      </div>
      
      {loading.orders ? (
        <div className="space-y-3">
          <div className="animate-pulse h-8 w-full bg-gray-200 rounded"></div>
          <div className="animate-pulse h-8 w-full bg-gray-200 rounded"></div>
          <div className="animate-pulse h-8 w-full bg-gray-200 rounded"></div>
        </div>
      ) : error.orders ? (
        <div className="text-red-500 text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error.orders}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-yellow-50 rounded">
              <div className="text-yellow-500 text-sm mb-1">Pending</div>
              <div className="text-xl font-light">{orderStats.pending}</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-blue-500 text-sm mb-1">Processing</div>
              <div className="text-xl font-light">{orderStats.processing}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-green-500 text-sm mb-1">Completed</div>
              <div className="text-xl font-light">{orderStats.completed}</div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 mb-4">
            Total Orders: {orderStats.total}
          </div>
        </>
      )}
      
      <Link 
        to="/admin/orders" 
        className="inline-flex items-center text-sm text-gray-600 hover:text-black"
      >
        Manage Orders
        <ArrowRight className="w-4 h-4 ml-1" />
      </Link>
    </div>
  );
  
  const renderTimeSlotsSummary = () => (
    <div className="bg-white rounded shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-light">Pickup Times</h3>
        <Clock className="w-5 h-5" />
      </div>
      
      {loading.timeSlots ? (
        <div className="space-y-3">
          <div className="animate-pulse h-8 w-full bg-gray-200 rounded"></div>
          <div className="animate-pulse h-8 w-full bg-gray-200 rounded"></div>
        </div>
      ) : error.timeSlots ? (
        <div className="text-red-500 text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error.timeSlots}
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Total Time Slots</div>
            <div className="text-xl font-light">{timeSlotStats.totalSlots}</div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Available Days</div>
            <div className="flex flex-wrap gap-1">
              {timeSlotStats.availableDays.map(day => (
                <span key={day} className="inline-block px-2 py-1 bg-gray-100 text-xs rounded">
                  {day}
                </span>
              ))}
              {timeSlotStats.availableDays.length === 0 && (
                <span className="text-gray-400 text-sm">No days configured</span>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Lead Time</div>
            <div className="text-base">
              {timeSlotStats.leadTime === 0 ? (
                <span>Same day orders allowed</span>
              ) : timeSlotStats.leadTime === 1 ? (
                <span>1 day in advance</span>
              ) : (
                <span>{timeSlotStats.leadTime} days in advance</span>
              )}
            </div>
          </div>
        </>
      )}
      
      <Link 
        to="/admin/pickup-times" 
        className="inline-flex items-center text-sm text-gray-600 hover:text-black"
      >
        Manage Pickup Times
        <ArrowRight className="w-4 h-4 ml-1" />
      </Link>
    </div>
  );
  
  const renderMenuSummary = () => (
    <div className="bg-white rounded shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-light">Menu</h3>
        <MenuIcon className="w-5 h-5" />
      </div>
      
      {loading.menu ? (
        <div className="space-y-3">
          <div className="animate-pulse h-8 w-full bg-gray-200 rounded"></div>
          <div className="animate-pulse h-8 w-full bg-gray-200 rounded"></div>
        </div>
      ) : error.menu ? (
        <div className="text-red-500 text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error.menu}
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Total Items</div>
            <div className="text-xl font-light">{menuStats.totalItems}</div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Categories</div>
            <div className="flex flex-wrap gap-1">
              {menuStats.categories.map(category => (
                <span key={category} className="inline-block px-2 py-1 bg-gray-100 text-xs rounded">
                  {category}
                </span>
              ))}
              {menuStats.categories.length === 0 && (
                <span className="text-gray-400 text-sm">No categories found</span>
              )}
            </div>
          </div>
        </>
      )}
      
      <Link 
        to="/admin/menu" 
        className="inline-flex items-center text-sm text-gray-600 hover:text-black"
      >
        Manage Menu
        <ArrowRight className="w-4 h-4 ml-1" />
      </Link>
    </div>
  );
  
  const renderQuickActions = () => (
    <div className="bg-white rounded shadow-sm p-6">
      <h3 className="text-lg font-light mb-4">Quick Actions</h3>
      
      <div className="space-y-3">
        <Link
          to="/admin/menu"
          className="block w-full p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors flex items-center"
        >
          <MenuIcon className="w-4 h-4 mr-2 text-blue-500" />
          <span>Add New Menu Item</span>
        </Link>
        
        <Link
          to="/admin/pickup-times"
          className="block w-full p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors flex items-center"
        >
          <Clock className="w-4 h-4 mr-2 text-green-500" />
          <span>Configure Pickup Times</span>
        </Link>
        
        <Link
          to="/admin/orders"
          className="block w-full p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors flex items-center"
        >
          <Package className="w-4 h-4 mr-2 text-purple-500" />
          <span>View Recent Orders</span>
        </Link>
        
        <Link
          to="/admin/backups"
          className="block w-full p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors flex items-center"
        >
          <Calendar className="w-4 h-4 mr-2 text-orange-500" />
          <span>Manage Backups</span>
        </Link>
      </div>
    </div>
  );
  
  return (
    <div className="flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <Helmet>
          <title>Admin Dashboard | Lentil Life</title>
        </Helmet>
        
        <h1 className="text-2xl font-light mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderOrdersSummary()}
          {renderTimeSlotsSummary()}
          {renderMenuSummary()}
          {renderQuickActions()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage; 