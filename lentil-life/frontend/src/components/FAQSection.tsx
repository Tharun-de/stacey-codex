import React, { useState } from 'react';
import { FAQItem } from '../types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQSectionProps {
  faqs: FAQItem[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Group FAQs by category
  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  const categoryTitles: Record<string, string> = {
    ordering: 'Ordering',
    payment: 'Payment',
    food: 'Food & Nutrition',
    sustainability: 'Sustainability Practices'
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedFaqs).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-xl font-semibold mb-4">{categoryTitles[category]}</h3>
          <div className="space-y-4">
            {items.map((faq) => (
              <div 
                key={faq.id} 
                className="border border-gray-200 rounded-lg overflow-hidden bg-white transition-all duration-200"
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                  onClick={() => toggleExpand(faq.id)}
                >
                  <span className="font-medium text-gray-800">{faq.question}</span>
                  {expandedId === faq.id ? (
                    <ChevronUp size={20} className="text-[#7D9D74]" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500" />
                  )}
                </button>
                
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ${
                    expandedId === faq.id ? 'max-h-96 pb-4' : 'max-h-0'
                  }`}
                >
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQSection;