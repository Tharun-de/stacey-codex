import React from 'react';
import { Testimonial } from '../types';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
            <img 
              src={testimonial.image} 
              alt={testimonial.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
            <div className="flex mt-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  fill={i < testimonial.rating ? "#E67E22" : "none"} 
                  stroke={i < testimonial.rating ? "#E67E22" : "#CBD5E0"}
                  className="mr-1" 
                />
              ))}
            </div>
          </div>
        </div>
        
        <blockquote className="flex-grow">
          <p className="text-gray-600 italic">"{testimonial.quote}"</p>
        </blockquote>
      </div>
    </div>
  );
};

export default TestimonialCard;