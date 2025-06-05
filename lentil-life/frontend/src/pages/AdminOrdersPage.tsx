import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Check, 
  AlertCircle, 
  ShoppingBag, 
  Clock,
  Package,
  Truck,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_URL } from '../App';

// Define order status type
type OrderStatus = 'pending' | 'processing' | 'completed' | 'delivered' | 'cancelled' | 'Pending Venmo Payment' | 'Venmo Payment Completed' | 'Cash on Pickup' | 'Pending Cash Payment';

// Define order types
interface OrderItem {
  id: number | string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

interface Customer {
  name: string;
  email: string;
  phone: string;
}

interface Pickup {
  date: string;
  time: string;
}

interface Order {
  id: string;
  customer: Customer;
  date: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  pickup: Pickup;
  specialInstructions?: string;
}

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Fetch orders from the API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/orders`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.message || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Error loading orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Search filter
    if (searchTerm && 
        !(
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter as OrderStatus) {
      return false;
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.date);
      const today = new Date();
      
      if (dateFilter === 'today') {
        // Check if order is from today
        return (
          orderDate.getDate() === today.getDate() &&
          orderDate.getMonth() === today.getMonth() &&
          orderDate.getFullYear() === today.getFullYear()
        );
      } else if (dateFilter === 'week') {
        // Check if order is from this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        return orderDate >= oneWeekAgo;
      } else if (dateFilter === 'month') {
        // Check if order is from this month
        return (
          orderDate.getMonth() === today.getMonth() &&
          orderDate.getFullYear() === today.getFullYear()
        );
      }
    }
    
    return true;
  });

  // Toggle order expansion
  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update order in state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        
        setNotification({
          show: true,
          message: `Order ${orderId} status updated to ${newStatus}`,
          type: 'success'
        });
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
      } else {
        setNotification({
          show: true,
          message: data.message || 'Failed to update order status',
          type: 'error'
        });
      }
    } catch (error) {
      console.error(`Error updating order status:`, error);
      setNotification({
        show: true,
        message: 'Error updating order status. Please try again.',
        type: 'error'
      });
    }
  };

  // Delete order function
  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm(`Are you sure you want to delete order ${orderId}? This action cannot be undone.`)) {
      try {
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
          method: 'DELETE'
        });
        const data = await response.json();

        if (data.success) {
          setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
          setNotification({
            show: true,
            message: `Order ${orderId} deleted successfully`,
            type: 'success'
          });
        } else {
          setNotification({
            show: true,
            message: data.message || 'Failed to delete order',
            type: 'error'
          });
        }
      } catch (err) {
        console.error('Error deleting order:', err);
        setNotification({
          show: true,
          message: 'An error occurred while deleting the order.',
          type: 'error'
        });
      }
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Get status badge class
  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending Venmo Payment':
        return 'bg-orange-100 text-orange-800 border border-orange-300';
      case 'Venmo Payment Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending Cash Payment':
        return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'Cash on Pickup':
        return 'bg-slate-100 text-slate-800 border border-slate-300';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'Pending Venmo Payment':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'Venmo Payment Completed':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'Pending Cash Payment':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'completed':
        return <Check className="w-4 h-4" />;
      case 'Cash on Pickup':
        return <User className="w-4 h-4 text-slate-600" />;
      case 'delivered':
        return <Truck className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Close notification after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Status options for filtering and updating
  const statusOptions: { value: OrderStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'Pending Venmo Payment', label: 'Pending Venmo Payment' },
    { value: 'Venmo Payment Completed', label: 'Venmo Payment Completed' },
    { value: 'Pending Cash Payment', label: 'Pending Cash Payment' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'Cash on Pickup', label: 'Cash on Pickup' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // Render content based on loading state
  if (loading) {
    return (
      <div className="bg-white p-6 rounded shadow-sm">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded shadow-sm">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Order Management | Lentil Life</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
              <div className="flex space-x-3">
                <Link
                  to="/admin/menu"
                  className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Menu Management
                </Link>
                <Link
                  to="/admin/backups"
                  className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Backups
                </Link>
              </div>
            </div>

            {/* Notification */}
            {notification.show && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mx-6 mt-4 p-4 rounded-md flex items-start ${
                  notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {notification.type === 'success' ? (
                  <Check className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                )}
                <span>{notification.message}</span>
              </motion.div>
            )}

            {/* Filters */}
            <div className="p-6">
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
                  {/* Search */}
                  <div className="flex-grow">
                    <div className="relative">
                      <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by order ID or customer"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7D9D74] focus:border-transparent"
                      />
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                  
                  {/* Status Filter */}
                  <div className="w-full md:w-auto">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full md:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7D9D74] focus:border-transparent appearance-none bg-white"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Date Filter */}
                  <div className="w-full md:w-auto">
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full md:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7D9D74] focus:border-transparent appearance-none bg-white"
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>
                </div>
                
                {/* Results count */}
                <div className="mt-3 text-sm text-gray-500">
                  {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
                </div>
              </div>
              
              {/* Orders List */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center">
                  <ShoppingBag className="w-4 h-4 text-gray-500 mr-2" />
                  <h3 className="font-medium">Orders</h3>
                </div>
                
                {filteredOrders.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {filteredOrders.map(order => (
                      <div key={order.id} className="p-4">
                        {/* Order Header - always visible */}
                        <div 
                          className="flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer"
                          onClick={() => toggleOrderExpansion(order.id)}
                        >
                          <div className="flex items-center mb-2 md:mb-0">
                            <span className="text-gray-800 font-medium mr-3">{order.id}</span>
                            <span className={`px-2 py-1 rounded-full text-xs flex items-center ${getStatusBadgeClass(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between md:justify-end w-full md:w-auto">
                            <div className="flex items-center">
                              <User className="w-4 h-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-600 mr-4">{order.customer.name}</span>
                              
                              <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-600">{formatDate(order.date)}</span>
                            </div>
                            
                            <button
                              type="button"
                              className="ml-4 text-gray-400 hover:text-gray-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleOrderExpansion(order.id);
                              }}
                            >
                              {expandedOrders[order.id] ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        {/* Order Details - visible when expanded */}
                        {expandedOrders[order.id] && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4 pt-4 border-t border-gray-200"
                          >
                            {/* Customer Information */}
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-700 mb-2">Customer Information</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div className="flex items-center">
                                  <span className="text-gray-500 w-20">Name:</span>
                                  <span>{order.customer.name}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-gray-500 w-20">Email:</span>
                                  <span>{order.customer.email}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-gray-500 w-20">Phone:</span>
                                  <span>{order.customer.phone}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Order Items */}
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-700 mb-2">Order Items</h4>
                              <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Item
                                      </th>
                                      <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Qty
                                      </th>
                                      <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                      </th>
                                      <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {order.items.map((item) => (
                                      <tr key={item.id}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                                          {item.name}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 text-right">
                                          {item.quantity}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 text-right">
                                          ${item.price.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 font-medium text-right">
                                          ${(item.price * item.quantity).toFixed(2)}
                                        </td>
                                      </tr>
                                    ))}
                                    <tr className="bg-gray-50">
                                      <td colSpan={3} className="px-4 py-2 text-sm text-gray-800 font-medium text-right">
                                        Total:
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-800 font-bold text-right">
                                        ${order.total.toFixed(2)}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            
                            {/* Order Details */}
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-700 mb-2">Order Details</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex flex-col">
                                  <span className="text-gray-500 text-sm">Pickup Date:</span>
                                  <span className="font-medium">{order.pickup.date} at {order.pickup.time}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Order Actions */}
                            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3">
                              <div className="flex items-center space-x-2">
                                <label htmlFor={`status-${order.id}`} className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                  Update Status:
                                </label>
                                <select
                                  id={`status-${order.id}`}
                                  value={order.status}
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                  className={`py-1.5 pl-2 pr-8 border rounded-md text-xs font-medium ${getStatusBadgeClass(order.status)} focus:ring-1 focus:ring-offset-0 focus:ring-[#7D9D74] focus:border-[#7D9D74] transition-colors duration-150 ease-in-out appearance-none cursor-pointer`}
                                  style={{ minWidth: '180px' }} // Adjusted min-width
                                >
                                  {statusOptions.filter(opt => opt.value !== 'all').map(option => (
                                    <option 
                                      key={option.value} 
                                      value={option.value} 
                                      className="bg-white text-gray-800 font-normal" // Standard option styling
                                    >
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <button 
                                onClick={() => handleDeleteOrder(order.id)}
                                className="ml-2 p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm flex items-center"
                                title="Delete Order"
                              >
                                <Trash2 size={16} className="mr-1" /> Delete
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-500">No orders match your search criteria.</p>
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setDateFilter('all');
                      }}
                      className="mt-2 text-[#7D9D74] hover:text-[#5D7D54] font-medium"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminOrdersPage; 