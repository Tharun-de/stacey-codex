import React, { useState } from 'react';
import Button from './Button';
import { Send, AlertCircle } from 'lucide-react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.subject) errors.subject = 'Subject is required';
    if (!formData.message.trim()) errors.message = 'Message is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // This would normally submit to a server
    console.log('Form submitted:', formData);
    
    // Show success message
    setIsSubmitted(true);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      {isSubmitted && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-start">
          <div className="flex-shrink-0 mr-3">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p>Your message has been sent! We'll get back to you soon.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D9D74] focus:border-transparent ${
              formErrors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.name && (
            <p className="text-red-500 mt-1 text-sm flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {formErrors.name}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D9D74] focus:border-transparent ${
              formErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.email && (
            <p className="text-red-500 mt-1 text-sm flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {formErrors.email}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D9D74] focus:border-transparent ${
              formErrors.subject ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a subject</option>
            <option value="general">General Inquiry</option>
            <option value="catering">Catering</option>
            <option value="feedback">Feedback</option>
            <option value="career">Career Opportunities</option>
          </select>
          {formErrors.subject && (
            <p className="text-red-500 mt-1 text-sm flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {formErrors.subject}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7D9D74] focus:border-transparent ${
              formErrors.message ? 'border-red-500' : 'border-gray-300'
            }`}
          ></textarea>
          {formErrors.message && (
            <p className="text-red-500 mt-1 text-sm flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {formErrors.message}
            </p>
          )}
        </div>
        
        <div>
          <Button type="submit" variant="primary">
            <Send size={18} className="mr-2" />
            Send Message
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;