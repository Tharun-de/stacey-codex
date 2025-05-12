import React, { useState } from 'react';
import Button from './Button';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your email address');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }
    
    // This would normally send the email to a server
    console.log('Newsletter signup:', email);
    
    // Show success message
    setStatus('success');
    setEmail('');
    
    // Reset after 3 seconds
    setTimeout(() => {
      setStatus('idle');
    }, 3000);
  };

  return (
    <div className="bg-[#F5F1E8] p-8 rounded-lg">
      <div className="flex items-center mb-4">
        <Mail size={24} className="text-[#8B6E4F] mr-2" />
        <h3 className="text-xl font-semibold text-gray-800">Stay Up to Date</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Subscribe to our newsletter for seasonal menu updates, nutritional tips, 
        and exclusive offers.
      </p>
      
      {status === 'success' ? (
        <div className="flex items-center p-4 bg-green-50 text-green-700 rounded-lg">
          <CheckCircle size={20} className="mr-2" />
          <p>Thank you for subscribing!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-grow">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D9D74] ${
                status === 'error' ? 'border border-red-500' : ''
              }`}
            />
            {status === 'error' && (
              <p className="mt-1 text-red-500 text-sm flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errorMessage}
              </p>
            )}
          </div>
          <Button type="submit" variant="primary">
            Subscribe
          </Button>
        </form>
      )}
    </div>
  );
};

export default Newsletter;