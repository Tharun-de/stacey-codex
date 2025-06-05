import React, { useState, useEffect } from 'react';
import { Star, Gift, Clock, TrendingUp, Award } from 'lucide-react';
import { API_URL } from '../config';

interface PointsTransaction {
  id: string;
  transaction_type: 'earned' | 'spent' | 'expired' | 'refunded';
  points_amount: number;
  description: string;
  created_at: string;
  order_id?: string;
  order_amount?: number;
}

interface UserPoints {
  points_balance: number;
  lifetime_points_earned: number;
  user_id: string;
}

interface PointsConfig {
  points_per_dollar: number;
  min_order_for_points: number;
  signup_bonus_points?: number;
}

interface PointsDisplayProps {
  userId?: string;
  showHistory?: boolean;
  compact?: boolean;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({ 
  userId, 
  showHistory = true, 
  compact = false 
}) => {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
  const [pointsConfig, setPointsConfig] = useState<PointsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserPoints();
      fetchPointsConfig();
      if (showHistory) {
        fetchPointsHistory();
      }
    }
  }, [userId, showHistory]);

  const fetchUserPoints = async () => {
    try {
      const response = await fetch(`${API_URL}/points/user/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setUserPoints(data.user_points);
      } else {
        setError('Failed to load points balance');
      }
    } catch (err) {
      console.error('Error fetching user points:', err);
      setError('Failed to load points balance');
    }
  };

  const fetchPointsHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/points/user/${userId}/history?limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setPointsHistory(data.transactions);
      }
    } catch (err) {
      console.error('Error fetching points history:', err);
    }
  };

  const fetchPointsConfig = async () => {
    try {
      const response = await fetch(`${API_URL}/points/config`);
      const data = await response.json();
      
      if (data.success) {
        setPointsConfig(data.config);
      }
    } catch (err) {
      console.error('Error fetching points config:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'spent':
        return <Gift className="w-4 h-4 text-blue-500" />;
      case 'expired':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'refunded':
        return <Award className="w-4 h-4 text-orange-500" />;
      default:
        return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned':
        return 'text-green-600';
      case 'spent':
        return 'text-blue-600';
      case 'expired':
        return 'text-gray-600';
      case 'refunded':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading points...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!userPoints) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <Star className="w-4 h-4 text-yellow-500" />
        <span className="font-medium">{userPoints.points_balance} points</span>
        {pointsConfig && (
          <span className="text-gray-500">
            (Earn {pointsConfig.points_per_dollar} pt/$1)
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Points Balance Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-full">
            <Star className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Lentil Points</h3>
            <p className="text-sm text-gray-500">Your loyalty rewards</p>
          </div>
        </div>
      </div>

      {/* Points Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{userPoints.points_balance}</div>
          <div className="text-sm text-gray-500">Available Points</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{userPoints.lifetime_points_earned}</div>
          <div className="text-sm text-gray-500">Total Earned</div>
        </div>
      </div>

      {/* Points Info */}
      {pointsConfig && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Gift className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">How to Earn Points</span>
          </div>
          <p className="text-sm text-blue-700">
            Earn {pointsConfig.points_per_dollar} point{pointsConfig.points_per_dollar !== 1 ? 's' : ''} for every $1 spent
            {pointsConfig.min_order_for_points > 0 && (
              ` on orders over $${pointsConfig.min_order_for_points}`
            )}
          </p>
        </div>
      )}

      {/* Recent Transactions */}
      {showHistory && pointsHistory.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Recent Activity</h4>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {pointsHistory.slice(0, 3).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getTransactionIcon(transaction.transaction_type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>
                <div className={`text-sm font-medium ${getTransactionColor(transaction.transaction_type)}`}>
                  {transaction.points_amount > 0 ? '+' : ''}{transaction.points_amount} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Points History</h3>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-80">
              <div className="space-y-3">
                {pointsHistory.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.transaction_type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(transaction.created_at)}
                        </p>
                        {transaction.order_amount && (
                          <p className="text-xs text-gray-400">
                            Order: ${transaction.order_amount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${getTransactionColor(transaction.transaction_type)}`}>
                      {transaction.points_amount > 0 ? '+' : ''}{transaction.points_amount} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsDisplay; 