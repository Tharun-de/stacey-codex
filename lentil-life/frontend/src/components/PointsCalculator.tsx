import React, { useState, useEffect } from 'react';
import { Star, Info } from 'lucide-react';

interface PointsCalculatorProps {
  orderAmount: number;
  className?: string;
  showDetailed?: boolean;
}

interface PointsConfig {
  points_per_dollar: number;
  min_order_for_points: number;
}

const PointsCalculator: React.FC<PointsCalculatorProps> = ({ 
  orderAmount, 
  className = "",
  showDetailed = false 
}) => {
  const [pointsConfig, setPointsConfig] = useState<PointsConfig | null>(null);
  const [pointsToEarn, setPointsToEarn] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPointsConfig();
  }, []);

  useEffect(() => {
    if (pointsConfig && orderAmount > 0) {
      calculatePoints();
    }
  }, [pointsConfig, orderAmount]);

  const fetchPointsConfig = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/points/config');
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

  const calculatePoints = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/points/calculate?amount=${orderAmount}`);
      const data = await response.json();
      
      if (data.success) {
        setPointsToEarn(data.points_earned);
      }
    } catch (err) {
      console.error('Error calculating points:', err);
      // Fallback calculation
      if (pointsConfig) {
        const points = orderAmount >= pointsConfig.min_order_for_points 
          ? Math.floor(orderAmount * pointsConfig.points_per_dollar)
          : 0;
        setPointsToEarn(points);
      }
    }
  };

  if (loading || !pointsConfig) {
    return null;
  }

  if (orderAmount < pointsConfig.min_order_for_points) {
    if (!showDetailed) return null;
    
    return (
      <div className={`p-3 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Spend ${pointsConfig.min_order_for_points} or more to earn points
          </span>
        </div>
      </div>
    );
  }

  if (pointsToEarn === 0) {
    return null;
  }

  if (showDetailed) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2 mb-2">
          <Star className="w-5 h-5 text-yellow-600" />
          <span className="font-medium text-yellow-900">Lentil Points</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-yellow-700">Order Amount:</span>
            <span className="text-sm font-medium text-yellow-900">${orderAmount.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-yellow-700">Points Rate:</span>
            <span className="text-sm font-medium text-yellow-900">
              {pointsConfig.points_per_dollar} pt/$1
            </span>
          </div>
          
          <div className="border-t border-yellow-300 pt-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-yellow-900">Points You'll Earn:</span>
              <span className="text-lg font-bold text-yellow-900">+{pointsToEarn} pts</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Star className="w-4 h-4 text-yellow-500" />
      <span className="text-sm text-gray-600">
        Earn <span className="font-semibold text-yellow-600">+{pointsToEarn} points</span> with this order
      </span>
    </div>
  );
};

export default PointsCalculator; 