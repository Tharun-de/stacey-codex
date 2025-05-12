import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Book, Sprout, Users, Leaf, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const EducationPage = () => {
  const workshops = [
    {
      id: 1,
      title: "Plant-Based Nutrition 101",
      image: "https://images.pexels.com/photos/4871119/pexels-photo-4871119.jpeg",
      description: "Learn the fundamentals of plant-based nutrition, including protein sources, essential nutrients, and meal planning basics.",
      duration: "90 minutes",
      frequency: "Monthly",
    },
    {
      id: 2,
      title: "Cooking with Lentils Workshop",
      image: "https://images.pexels.com/photos/8108505/pexels-photo-8108505.jpeg",
      description: "Discover the versatility of lentils in this hands-on cooking workshop. Learn to make everything from hearty soups to protein-packed salads.",
      duration: "2 hours",
      frequency: "Bi-monthly",
    },
    {
      id: 3,
      title: "Sustainable Food Choices",
      image: "https://images.pexels.com/photos/4955739/pexels-photo-4955739.jpeg",
      description: "Understand the environmental impact of different food choices and how to make more sustainable decisions in your daily life.",
      duration: "60 minutes",
      frequency: "Monthly",
    },
    {
      id: 4,
      title: "Kids & Veggies: Making Healthy Fun",
      image: "https://images.pexels.com/photos/8105063/pexels-photo-8105063.jpeg",
      description: "A workshop for parents and caregivers on making plant-based foods appealing to children through creative presentation and recipes.",
      duration: "75 minutes",
      frequency: "Monthly",
    }
  ];

  const resourceTypes = [
    {
      id: 1,
      title: "Recipe Collections",
      icon: <Book className="w-8 h-8" />,
      description: "Free downloadable recipe guides highlighting seasonal ingredients and nutritionally complete meals.",
    },
    {
      id: 2,
      title: "Video Tutorials",
      icon: <Sprout className="w-8 h-8" />,
      description: "Step-by-step cooking demonstrations for lentil-based meals and other plant-forward recipes.",
    },
    {
      id: 3,
      title: "Nutritional Guides",
      icon: <Award className="w-8 h-8" />,
      description: "Educational materials about micronutrients, balanced eating, and the health benefits of various plant foods.",
    },
    {
      id: 4,
      title: "Community Programs",
      icon: <Users className="w-8 h-8" />,
      description: "Information about our school outreach, community garden partnerships, and food education initiatives.",
    }
  ];

  const lentilFacts = [
    {
      title: "Nutritional Powerhouse",
      description: "Lentils are packed with protein, fiber, folate, iron, potassium, and antioxidants. A 1-cup serving provides about 18g of protein and 15g of fiber.",
    },
    {
      title: "Environmental Impact",
      description: "Lentils are nitrogen-fixing crops that improve soil health and require significantly less water than animal protein sources.",
    },
    {
      title: "Versatility",
      description: "From red to green to black, different lentil varieties offer unique textures and cooking properties suitable for soups, salads, burgers, and more.",
    },
    {
      title: "Global Heritage",
      description: "One of the world's oldest cultivated foods, lentils have been a dietary staple across cultures for over 8,000 years.",
    },
    {
      title: "Sustainable Protein",
      description: "Producing 1kg of lentil protein generates about 50 times less CO2 than 1kg of beef protein.",
    }
  ];

  return (
    <div className="pt-20 md:pt-24 pb-12 md:pb-16">
      <Helmet>
        <title>Food Education & Lentology | Stacey's Wraps</title>
        <meta 
          name="description" 
          content="Explore our food education resources, lentil workshops, and sustainable eating guides at Stacey's Wraps. Join our mission for healthier people and planet."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-brand-forest text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4 md:mb-6">
              Lentology & Food Education
            </h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8 text-white/90">
              Empowering our community with knowledge about sustainable food choices, 
              plant-based nutrition, and the transformative power of lentils and other legumes.
            </p>
            <div className="flex flex-wrap gap-3 md:gap-4">
              <Link to="#workshops">
                <Button variant="secondary" size="sm" className="md:text-base">
                  Explore Workshops
                </Button>
              </Link>
              <Link to="#resources">
                <Button variant="outline" size="sm" className="md:text-base">
                  View Resources
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-1/3 h-full opacity-10">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M50.2,-60.5C66.1,-50.5,80.8,-35.8,85.6,-18.4C90.5,-1,85.5,19.2,74.3,33.9C63.1,48.7,45.6,58,27.4,67.1C9.1,76.1,-9.8,84.9,-27.7,81.5C-45.6,78.1,-62.3,62.5,-73.7,43.4C-85.1,24.3,-91,-8.1,-83.3,-33.8C-75.7,-59.4,-54.5,-78.3,-33.3,-85.5C-12.1,-92.7,8.9,-88.1,26.7,-79.1C44.5,-70.1,59.1,-56.7,50.2,-60.5Z" transform="translate(100 100)" />
          </svg>
        </div>
      </section>

      {/* Lentology Introduction */}
      <section className="py-10 md:py-16 bg-white" id="lentology">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <div className="flex items-center mb-4 md:mb-6">
                <Leaf className="text-brand-forest w-5 h-5 md:w-6 md:h-6 mr-2" />
                <h2 className="text-2xl md:text-3xl font-bold">What is Lentology?</h2>
              </div>
              <p className="text-sm md:text-base text-gray-700 mb-4 md:mb-6">
                <span className="font-semibold">Lentology</span> is our term for the study and appreciation of lentils 
                and other legumes as cornerstone ingredients for both human health and environmental sustainability. 
              </p>
              <p className="text-sm md:text-base text-gray-700 mb-4 md:mb-6">
                At Stacey's Wraps, we believe these humble superfoods represent a perfect intersection of 
                nutrition, culinary versatility, cultural heritage, and ecological responsibility.
              </p>
              <p className="text-sm md:text-base text-gray-700">
                Through our educational initiatives, we aim to spread knowledge about the benefits 
                of incorporating more plant-based proteins like lentils into everyday meals.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {lentilFacts.map((fact, index) => (
                <motion.div 
                  key={index}
                  className="bg-brand-cream p-4 md:p-6 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h3 className="text-base md:text-lg font-semibold mb-2 text-brand-forest">{fact.title}</h3>
                  <p className="text-xs md:text-sm text-gray-700">{fact.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workshops Section */}
      <section className="py-10 md:py-16 bg-brand-cream" id="workshops">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Educational Workshops</h2>
            <p className="text-sm md:text-base text-gray-700">
              Join us for hands-on learning experiences led by nutrition experts, chefs, and environmental educators.
              Our workshops are designed to be informative, engaging, and immediately applicable to your daily life.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {workshops.map((workshop) => (
              <motion.div 
                key={workshop.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: workshop.id * 0.1 }}
              >
                <div className="h-40 md:h-48 overflow-hidden">
                  <img 
                    src={workshop.image} 
                    alt={workshop.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-2">{workshop.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">{workshop.description}</p>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-brand-forest font-medium">Duration: {workshop.duration}</span>
                    <span className="text-brand-forest font-medium">Frequency: {workshop.frequency}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-8 md:mt-12">
            <Link to="/contact">
              <Button variant="primary" size="sm" className="md:text-base">
                Register for a Workshop
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-10 md:py-16 bg-white" id="resources">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Educational Resources</h2>
            <p className="text-sm md:text-base text-gray-700">
              Explore our collection of free resources designed to support your journey toward healthier, 
              more sustainable food choices. From recipes to research, we've got you covered.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {resourceTypes.map((resource) => (
              <motion.div 
                key={resource.id}
                className="bg-gray-50 p-4 md:p-6 rounded-lg text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: resource.id * 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-sage/20 text-brand-forest mb-3 md:mb-4">
                  {resource.icon}
                </div>
                <h3 className="text-base md:text-lg font-semibold mb-2">{resource.title}</h3>
                <p className="text-xs md:text-sm text-gray-600">{resource.description}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="bg-brand-cream p-5 md:p-8 rounded-lg mt-8 md:mt-12">
            <div className="text-center mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold">Subscribe to Our Newsletter</h3>
              <p className="text-sm md:text-base text-gray-700">
                Get monthly updates on new resources, upcoming workshops, and sustainable food tips.
              </p>
            </div>
            <form className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <input 
                  type="email" 
                  placeholder="Your email address"
                  className="flex-grow px-3 md:px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-forest text-sm md:text-base"
                />
                <button 
                  type="submit"
                  className="px-4 md:px-6 py-2 bg-brand-forest text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm md:text-base"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Community Impact Section */}
      <section className="py-10 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Our Community Impact</h2>
            <p className="text-sm md:text-base text-gray-700">
              We're proud to partner with local schools, community gardens, and food justice organizations 
              to spread knowledge about sustainable, healthy eating practices.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-brand-forest">School Programs</h3>
              <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                Our educators visit local schools to teach children about plant-based nutrition, 
                sustainable agriculture, and cooking basics.
              </p>
              <p className="text-sm md:text-base text-gray-600">
                <strong>Impact:</strong> Reached over 1,500 students across 12 schools in the past year.
              </p>
            </div>
            
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-brand-forest">Community Garden</h3>
              <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                We maintain a demonstration garden where we grow various lentils, beans, and companion plants, 
                hosting monthly open days for the public.
              </p>
              <p className="text-sm md:text-base text-gray-600">
                <strong>Impact:</strong> Provided over 200 pounds of fresh produce to local food banks.
              </p>
            </div>
            
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-brand-forest">Education Scholarships</h3>
              <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
                We offer scholarships for nutrition education to individuals from underserved communities 
                interested in promoting healthy eating.
              </p>
              <p className="text-sm md:text-base text-gray-600">
                <strong>Impact:</strong> Funded 8 scholarships in the past year.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-brand-forest text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Join Our Food Education Movement</h2>
          <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
            Whether you're interested in workshops, resources, or volunteer opportunities, 
            we'd love to have you as part of our growing community of food enthusiasts.
          </p>
          <div className="flex justify-center gap-3 md:gap-4 flex-wrap">
            <Link to="/contact">
              <Button variant="secondary" size="sm" className="md:text-base">
                Contact Us
              </Button>
            </Link>
            <Link to="/menu">
              <Button variant="outline" size="sm" className="md:text-base">
                Try Our Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EducationPage; 