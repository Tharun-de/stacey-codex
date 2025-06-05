import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, CheckCircle, XCircle, Calendar, DollarSign } from 'lucide-react';
import { API_URL } from '../config';

interface Order {
  id: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  pickup: {
    date: string;
    time: string;
  };
  created_at: string;
  special_instructions?: string;
}

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, isLoading, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        setError('Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Orders | Lentil Life</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="mt-2 text-gray-600">Track your Lentil Life orders and pickup times</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No orders yet</h3>
              <p className="mt-2 text-gray-500">
                When you place your first order, it will appear here.
              </p>
              <Link
                to="/shop"
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white shadow-sm rounded-lg border border-gray-200">
                  {/* Order Header */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-500">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            Placed on {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          <DollarSign className="inline h-4 w-4" />
                          {order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-6 py-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex-1">
                            <span className="text-sm text-gray-900">{item.name}</span>
                            <span className="text-sm text-gray-500 ml-2">x{item.quantity}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pickup Info */}
                  <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Pickup Details</h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.pickup.date)} at {order.pickup.time}
                        </p>
                      </div>
                      {order.special_instructions && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Special Instructions</h4>
                          <p className="text-sm text-gray-600">{order.special_instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrdersPage; 