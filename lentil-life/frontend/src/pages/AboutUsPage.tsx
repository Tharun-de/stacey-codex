import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, MapPin, Heart, Book, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
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
      bio: "Stacey founded Lentil Life after 10 years as a nutritionist. She combines her passion for healthy eating with culinary expertise to create our delicious menu.",
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
  
  // Page sections
  const sections = [
    { id: "our-story", title: "Our Story", icon: <Book size={24} className="text-[#7D9D74] mr-2" />, href: "#our-story" },
    { id: "our-mission", title: "Our Mission", icon: <Heart size={24} className="text-[#7D9D74] mr-2" />, href: "#our-mission" },
    { id: "our-team", title: "Our Team", icon: <Users size={24} className="text-[#7D9D74] mr-2" />, href: "#our-team" },
    { id: "community-impact", title: "Community Impact", icon: <Globe size={24} className="text-[#7D9D74] mr-2" />, href: "#community-impact" }
  ];
  
  return (
    <div className="pt-20 md:pt-24 pb-12 md:pb-16">
      {/* Page Navigation */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl font-bold mb-6 text-center">About Lentil Life</h1>
          <div className="flex flex-wrap justify-center gap-4">
            {sections.map((section) => (
              <a 
                key={section.id}
                href={section.href}
                className="flex items-center bg-white px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              >
                {section.icon}
                <span className="font-medium">{section.title}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section id="our-story" className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center mb-8">
            <Book size={24} className="text-[#7D9D74] mr-2" />
            <h2 className="text-2xl md:text-3xl font-bold">Our Story</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-gray-600 mb-4">
                Lentil Life began with a simple passion: making nutritious, plant-based food that's both delicious and accessible. 
                Our founder, Stacey, discovered the versatility and nutritional power of lentils during her travels across the Mediterranean and South Asia.
              </p>
              <p className="text-gray-600 mb-4">
                After returning home, she was determined to create a space where people could experience the incredible flavors and health benefits of lentil-based cuisine. 
                What started as a small food truck in 2018 has grown into the thriving establishment you see today.
              </p>
              <p className="text-gray-600">
                Every dish we serve is a testament to our ongoing journey of exploring creative, sustainable ways to nourish both people and planet.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1631516402137-30a35f478754" 
                alt="Assortment of colorful lentils" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Mission Section */}
      <section id="our-mission" className="py-16 bg-[#F5F9F1]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center mb-8">
            <Heart size={24} className="text-[#7D9D74] mr-2" />
            <h2 className="text-2xl md:text-3xl font-bold">Our Mission</h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <p className="text-xl text-center text-gray-700 italic mb-6">
                "To create a more sustainable food system by making nutritious, plant-forward meals that delight the senses and nourish both people and planet."
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#7D9D74] text-white flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Nutritional Excellence</h3>
                  <p className="text-sm text-gray-600">Creating meals that provide optimal nutrition without compromising on flavor</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#7D9D74] text-white flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Environmental Stewardship</h3>
                  <p className="text-sm text-gray-600">Minimizing our ecological footprint through responsible sourcing and zero-waste practices</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#7D9D74] text-white flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Community Education</h3>
                  <p className="text-sm text-gray-600">Empowering people with knowledge about sustainable, healthy food choices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section id="our-team" className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center mb-8">
            <Users size={24} className="text-[#7D9D74] mr-2" />
            <h2 className="text-2xl md:text-3xl font-bold">Our Team</h2>
          </div>
          
          <p className="text-gray-600 max-w-3xl mb-8 md:mb-12 text-base md:text-lg">
            Our dedicated team brings together expertise in nutrition, culinary arts, environmental science, 
            and community building. We're united by a shared passion for creating delicious food that's good 
            for both people and the planet.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <motion.div 
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: member.id * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#7D9D74] flex items-center justify-center text-white font-bold text-lg">
                    {member.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-[#7D9D74] font-medium">{member.role}</p>
                  </div>
                </div>
                <p className="text-gray-600">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Community Impact Section */}
      <section id="community-impact" className="py-16 bg-[#F5F9F1]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center mb-8">
            <Globe size={24} className="text-[#7D9D74] mr-2" />
            <h2 className="text-2xl md:text-3xl font-bold">Community Impact</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Our Initiatives</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-[#7D9D74] text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm">✓</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">School Garden Program</h4>
                    <p className="text-sm text-gray-600">Supporting 5 local schools in creating and maintaining educational vegetable gardens.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-[#7D9D74] text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm">✓</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">Cooking Classes for All</h4>
                    <p className="text-sm text-gray-600">Free monthly cooking workshops focusing on affordable, nutritious plant-based meals.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-[#7D9D74] text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm">✓</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">Food Security Partnership</h4>
                    <p className="text-sm text-gray-600">Working with local food banks to provide fresh, nutritious meals to families in need.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-[#7D9D74] text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm">✓</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">Farmer Support Network</h4>
                    <p className="text-sm text-gray-600">Direct partnerships with local sustainable farmers to ensure fair compensation and support regenerative agriculture.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Our Impact in Numbers</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <div className="text-3xl font-bold text-[#7D9D74] mb-1">12,500+</div>
                  <div className="text-sm text-gray-600">Meals donated annually</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <div className="text-3xl font-bold text-[#7D9D74] mb-1">8</div>
                  <div className="text-sm text-gray-600">Local farm partnerships</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <div className="text-3xl font-bold text-[#7D9D74] mb-1">1,200+</div>
                  <div className="text-sm text-gray-600">Workshop participants</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <div className="text-3xl font-bold text-[#7D9D74] mb-1">5</div>
                  <div className="text-sm text-gray-600">School gardens funded</div>
                </div>
              </div>
              <div className="mt-6">
                <Link to="/contact">
                  <Button variant="primary" size="md" className="w-full">
                    Get Involved
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-white">
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
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <Calendar size={20} className="text-[#7D9D74] mr-2" />
                <h3 className="text-xl font-semibold">Hours of Operation</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Monday - Friday</span>
                  <span>7:30 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Saturday</span>
                  <span>8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sunday</span>
                  <span>8:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-6">
                <MapPin size={20} className="text-[#7D9D74] mr-2" />
                <h3 className="text-xl font-semibold">Location</h3>
              </div>
              
              <address className="not-italic">
                <p className="mb-2">123 Green Street</p>
                <p className="mb-2">Healthyville, CA 98765</p>
                <p className="mb-2">
                  <a href="tel:+15551234567" className="text-[#7D9D74] hover:underline">(555) 123-4567</a>
                </p>
                <p>
                  <a href="mailto:hello@lentillife.com" className="text-[#7D9D74] hover:underline">
                    hello@lentillife.com
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