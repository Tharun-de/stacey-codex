import React from 'react';
import { EnvironmentalMetric } from '../types';
import { Leaf, Droplet, Truck, Recycle } from 'lucide-react';

interface EnvironmentalImpactProps {
  metrics: EnvironmentalMetric[];
}

const EnvironmentalImpact: React.FC<EnvironmentalImpactProps> = ({ metrics }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'leaf':
        return <Leaf size={36} className="text-[#7D9D74]" />;
      case 'droplet':
        return <Droplet size={36} className="text-[#7D9D74]" />;
      case 'truck':
        return <Truck size={36} className="text-[#7D9D74]" />;
      case 'recycle':
        return <Recycle size={36} className="text-[#7D9D74]" />;
      default:
        return <Leaf size={36} className="text-[#7D9D74]" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <div 
          key={metric.id} 
          className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex justify-center mb-4">
            {getIcon(metric.icon)}
          </div>
          <h3 className="text-2xl font-bold text-[#7D9D74] mb-2">{metric.value}</h3>
          <h4 className="text-lg font-medium text-gray-800 mb-2">{metric.title}</h4>
          <p className="text-gray-600">{metric.description}</p>
        </div>
      ))}
    </div>
  );
};

export default EnvironmentalImpact;