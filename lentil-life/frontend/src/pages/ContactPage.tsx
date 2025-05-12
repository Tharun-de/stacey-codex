import React from 'react';
import ContactForm from '../components/ContactForm';
import FAQSection from '../components/FAQSection';
import { faqItems } from '../data/faqData';
import { Mail, PhoneCall, MapPin, Clock, CreditCard } from 'lucide-react';

const ContactPage = () => {
  // Filter FAQs to show only ordering and payment related ones
  const filteredFaqs = faqItems.filter(faq => 
    faq.category === 'ordering' || faq.category === 'payment'
  );
  
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col mb-12">
          <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
          <p className="text-gray-600">
            Have questions, feedback, or want to place a catering order? We'd love to hear from you!
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#F5F1E8] flex items-center justify-center text-[#7D9D74] mr-4">
                    <PhoneCall size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="font-medium">
                      <a href="tel:+15551234567" className="hover:text-[#7D9D74]">(555) 123-4567</a>
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#F5F1E8] flex items-center justify-center text-[#7D9D74] mr-4">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-medium">
                      <a href="mailto:info@natureswraps.com" className="hover:text-[#7D9D74]">info@natureswraps.com</a>
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#F5F1E8] flex items-center justify-center text-[#7D9D74] mr-4">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <address className="not-italic font-medium">
                      123 Green Street<br />
                      Healthyville, CA 98765
                    </address>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#F5F1E8] flex items-center justify-center text-[#7D9D74] mr-4">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Hours</p>
                    <p className="font-medium">Monday - Friday: 7:30 AM - 8:00 PM</p>
                    <p className="font-medium">Saturday: 8:00 AM - 8:00 PM</p>
                    <p className="font-medium">Sunday: 8:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center mb-6">
                <CreditCard size={24} className="text-[#7D9D74] mr-2" />
                <h3 className="text-xl font-semibold">Payment Information</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                We currently accept payments through Venmo. After placing your order, please send your payment to:
              </p>
              
              <div className="p-4 bg-[#F5F1E8] rounded-lg mb-4">
                <p className="font-bold text-center">@YourVenmoHere</p>
              </div>
              
              <p className="text-sm text-gray-500">
                Be sure to include your order number in the payment note for faster processing.
              </p>
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
          <FAQSection faqs={filteredFaqs} />
        </div>
        
        {/* Map Section (placeholder) */}
        <div className="mt-16 bg-gray-200 h-96 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Interactive Map Would Be Embedded Here</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;