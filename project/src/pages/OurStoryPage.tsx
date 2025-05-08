import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import InstagramFeed from '../components/InstagramFeed';
import { History, TrendingUp, Heart } from 'lucide-react';

const OurStoryPage = () => {
  const milestones = [
    {
      year: 2018,
      title: "The Seed is Planted",
      description: "Founder Stacey recognized the need for healthy, sustainable fast-casual options and began developing the concept for Stacey's Wraps."
    },
    {
      year: 2019,
      title: "Farmers Market Beginnings",
      description: "Stacey's Wraps began as a weekend stand at the local farmers market, building a loyal following and refining recipes based on customer feedback."
    },
    {
      year: 2020,
      title: "Sustainability Commitment",
      description: "We formalized our sustainability practices, partnering with local farms and implementing our compostable packaging program."
    },
    {
      year: 2021,
      title: "Brick & Mortar Opening",
      description: "Our first physical location opened, designed with eco-friendly materials and energy-efficient systems."
    },
    {
      year: 2022,
      title: "Community Programs Launch",
      description: "We introduced educational workshops and community events focused on nutrition and environmental awareness."
    },
    {
      year: 2023,
      title: "Growing Our Impact",
      description: "Expanded our local farm partnerships to source 80% of our ingredients from within a 50-mile radius."
    }
  ];

  return (
    <div className="pt-24 pb-16">
      {/* Story Intro */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
              <History size={28} className="text-[#7D9D74] mr-2" />
              <h1 className="text-3xl font-bold">Our Story</h1>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                Stacey's Wraps began with a simple question: Why can't fast food be both healthy and environmentally responsible? 
                Our founder, Stacey, a nutritionist by training, was frustrated by the lack of truly 
                nutritious grab-and-go options that didn't come with excessive packaging waste.
              </p>
              
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                What started as weekend experiments in Stacey's kitchen eventually grew into a farmers market stand, 
                where the first versions of our now-popular Mediterranean Delight and Avocado Ranch Chicken wraps were born. 
                The enthusiastic response from market-goers confirmed what Stacey suspected: people were hungry for better options.
              </p>
              
              <blockquote className="bg-[#F5F1E8] p-6 rounded-lg my-8 border-l-4 border-[#7D9D74]">
                <p className="text-gray-700 italic text-lg">
                  "I believed that we could create food that nourishes both people and the planet. Food shouldn't be a 
                  compromise between health, taste, convenience, and environmental impact."
                </p>
                <footer className="mt-2 font-medium">— Stacey, Founder</footer>
              </blockquote>
              
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                As our concept evolved, we partnered with local organic farms to source the freshest ingredients 
                while reducing food miles. We invested in compostable packaging, developed water-saving kitchen practices, 
                and created a menu that caters to various dietary needs without sacrificing flavor.
              </p>
              
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                Today, Stacey's Wraps stands as a testament to our belief that everyday food choices can make a difference. 
                We continue to innovate, both in our kitchen and in our sustainability practices, working toward a 
                future where healthy eating and environmental responsibility go hand in hand.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Timeline/Milestones */}
      <section className="py-16 bg-[#F5F1E8]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-12">
              <TrendingUp size={28} className="text-[#7D9D74] mr-2" />
              <h2 className="text-3xl font-bold">Our Journey</h2>
            </div>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-[#7D9D74] opacity-50"></div>
              
              {/* Timeline Items */}
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={milestone.year} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 -mt-2 w-5 h-5 rounded-full border-4 border-[#7D9D74] bg-white"></div>
                    
                    {/* Content */}
                    <div className={`
                      flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}
                    `}>
                      {/* Year */}
                      <div className="md:w-1/2 mb-4 md:mb-0 pl-8 md:pl-0 
                        ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12 md:text-right'}">
                        <span className="inline-block px-4 py-2 bg-[#7D9D74] text-white rounded-lg font-bold">
                          {milestone.year}
                        </span>
                      </div>
                      
                      {/* Milestone Content */}
                      <div className="md:w-1/2 pl-8 md:pl-0 
                        ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}">
                        <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Vision for the Future */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
              <Heart size={28} className="text-[#7D9D74] mr-2" />
              <h2 className="text-3xl font-bold">Our Vision for the Future</h2>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                Looking ahead, we're committed to expanding our positive impact in several key areas:
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[#F5F1E8] flex items-center justify-center text-[#7D9D74] mr-3 mt-1">
                    1
                  </span>
                  <div>
                    <strong className="text-gray-900">Complete Carbon Neutrality</strong>
                    <p className="text-gray-600">
                      We're working toward becoming a carbon-neutral operation by 2025, further reducing our environmental footprint.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[#F5F1E8] flex items-center justify-center text-[#7D9D74] mr-3 mt-1">
                    2
                  </span>
                  <div>
                    <strong className="text-gray-900">Educational Outreach</strong>
                    <p className="text-gray-600">
                      Expanding our workshop series to reach more schools and community centers, educating on nutrition and sustainable food practices.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[#F5F1E8] flex items-center justify-center text-[#7D9D74] mr-3 mt-1">
                    3
                  </span>
                  <div>
                    <strong className="text-gray-900">Seasonal Menu Innovation</strong>
                    <p className="text-gray-600">
                      Developing even more seasonal options that showcase local produce at its peak, reducing food miles while increasing flavor.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[#F5F1E8] flex items-center justify-center text-[#7D9D74] mr-3 mt-1">
                    4
                  </span>
                  <div>
                    <strong className="text-gray-900">Community Garden Initiative</strong>
                    <p className="text-gray-600">
                      Creating a community garden space that will supply ingredients while serving as a hands-on educational resource.
                    </p>
                  </div>
                </li>
              </ul>
              
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                We believe that by continuing to prioritize both health and sustainability, we can help shift the 
                expectations around convenient food. Every wrap we serve is a step toward a future where eating well 
                and protecting our environment are one and the same.
              </p>
              
              <div className="text-center mt-12">
                <Link to="/menu">
                  <Button variant="primary" size="lg">
                    Experience Our Menu
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Instagram Feed */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <InstagramFeed />
        </div>
      </section>
    </div>
  );
};

export default OurStoryPage;