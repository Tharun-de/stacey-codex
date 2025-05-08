import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, MapPin } from 'lucide-react';
import Button from '../components/Button';
import FAQSection from '../components/FAQSection';
import { faqItems } from '../data/faqData';

const AboutUsPage = () => {
  // Filter FAQs to show only a subset on this page
  const filteredFaqs = faqItems.filter(faq => 
    faq.category === 'food' || faq.category === 'sustainability'
  );
  
  const teamMembers = [
    {
      id: 1,
      name: "Stacey",
      role: "Founder & Chef",
      image: "https://images.pexels.com/photos/3992656/pexels-photo-3992656.png",
      bio: "Stacey founded Stacey's Wraps after 10 years as a nutritionist. She combines her passion for healthy eating with culinary expertise to create our delicious menu.",
    },
    {
      id: 2,
      name: "David Chen",
      role: "Sustainability Director",
      image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
      bio: "David oversees our sustainability initiatives, from packaging choices to composting programs. He has a background in environmental science and sustainable business practices.",
    },
    {
      id: 3,
      name: "Maria Rodriguez",
      role: "Nutrition Specialist",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
      bio: "Maria ensures our menu options meet diverse nutritional needs. She develops balanced recipes that are both health-conscious and delicious.",
    },
    {
      id: 4,
      name: "James Wilson",
      role: "Community Outreach",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
      bio: "James manages our relationships with local farmers and community partners. He's passionate about supporting local agriculture and food education.",
    }
  ];
  
  return (
    <div className="pt-20 md:pt-24 pb-12 md:pb-16">
      {/* Team Section */}
      <section className="py-10 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center mb-8 md:mb-12">
            <Users size={24} className="text-[#7D9D74] mr-2" />
            <h1 className="text-2xl md:text-3xl font-bold">Our Team</h1>
          </div>
          <p className="text-gray-600 max-w-3xl mb-8 md:mb-12 text-base md:text-lg">
            Our dedicated team brings together expertise in nutrition, culinary arts, environmental science, 
            and community building. We're united by a shared passion for creating delicious food that's good 
            for both people and the planet.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg p-4 md:p-6">
                <div className="flex items-center mb-3 md:mb-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#7D9D74] flex items-center justify-center text-white font-bold text-base md:text-lg">
                    {member.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg md:text-xl font-semibold">{member.name}</h3>
                    <p className="text-sm md:text-base text-[#7D9D74] font-medium">{member.role}</p>
                  </div>
                </div>
                <p className="text-sm md:text-base text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="py-10 md:py-16 bg-[#F5F1E8]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Our Core Values</h2>
            <p className="text-gray-600 text-sm md:text-base">
              These principles guide every decision we make, from menu development to operational practices.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <div className="bg-white p-5 md:p-8 rounded-lg shadow-md">
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Health First</h3>
              <p className="text-sm md:text-base text-gray-600">
                We prioritize nutritional value without compromising on taste. 
                Every ingredient is selected with your wellbeing in mind.
              </p>
            </div>
            
            <div className="bg-white p-5 md:p-8 rounded-lg shadow-md">
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Environmental Stewardship</h3>
              <p className="text-sm md:text-base text-gray-600">
                We're committed to minimizing our environmental impact through 
                sustainable sourcing, waste reduction, and eco-friendly packaging.
              </p>
            </div>
            
            <div className="bg-white p-5 md:p-8 rounded-lg shadow-md">
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Community Connection</h3>
              <p className="text-sm md:text-base text-gray-600">
                We believe in supporting local farmers and producers, creating 
                a stronger food system and community.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-10 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Frequently Asked Questions</h2>
              <p className="text-sm md:text-base text-gray-600">
                Learn more about our food philosophy and sustainability practices.
              </p>
            </div>
            
            <FAQSection faqs={filteredFaqs} />
            
            <div className="text-center mt-8 md:mt-12">
              <Link to="/contact">
                <Button variant="primary" size="md">
                  Have more questions? Contact us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Hours & Location */}
      <section className="py-10 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <div className="bg-white p-5 md:p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-4 md:mb-6">
                <Calendar size={20} className="text-[#7D9D74] mr-2" />
                <h3 className="text-lg md:text-xl font-semibold">Hours of Operation</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm md:text-base">
                  <span className="font-medium">Monday - Friday</span>
                  <span>7:30 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="font-medium">Saturday</span>
                  <span>8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="font-medium">Sunday</span>
                  <span>8:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 md:p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-4 md:mb-6">
                <MapPin size={20} className="text-[#7D9D74] mr-2" />
                <h3 className="text-lg md:text-xl font-semibold">Location</h3>
              </div>
              
              <address className="not-italic text-sm md:text-base">
                <p className="mb-2">123 Green Street</p>
                <p className="mb-2">Healthyville, CA 98765</p>
                <p className="mb-2">
                  <a href="tel:+15551234567" className="text-[#7D9D74] hover:underline">(555) 123-4567</a>
                </p>
                <p>
                  <a href="mailto:info@natureswraps.com" className="text-[#7D9D74] hover:underline">
                    info@natureswraps.com
                  </a>
                </p>
              </address>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;