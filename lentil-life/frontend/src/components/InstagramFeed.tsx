import React from 'react';
import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';

// Mock data for Instagram posts - in a real app, this would come from the Instagram API
const mockInstagramPosts = [
  {
    id: 'post1',
    imageUrl: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf',
    likes: 124,
    comments: 8,
    caption: 'Start your day right with our protein-packed lentil breakfast bowl! #LentilLife #PlantBased',
    date: '2 days ago'
  },
  {
    id: 'post2',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    likes: 89,
    comments: 5,
    caption: 'Fresh, colorful, and nutrient-rich lunch options available today! #EatTheRainbow',
    date: '4 days ago'
  },
  {
    id: 'post3',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
    likes: 213,
    comments: 12,
    caption: 'Our chef preparing this week\'s special: Mediterranean lentil salad with fresh herbs.',
    date: '1 week ago'
  },
  {
    id: 'post4',
    imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082',
    likes: 157,
    comments: 6,
    caption: 'New menu items coming soon! Any guesses? 🌱 #ComingSoon #Vegan',
    date: '1 week ago'
  },
  {
    id: 'post5',
    imageUrl: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2',
    likes: 94,
    comments: 3,
    caption: 'Behind the scenes: Our sustainable packaging getting prepared for delivery.',
    date: '2 weeks ago'
  },
  {
    id: 'post6',
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
    likes: 178,
    comments: 15,
    caption: 'Community event this weekend! Come join us for free food tastings and cooking demos.',
    date: '2 weeks ago'
  }
];

interface InstagramFeedProps {
  postsToShow?: number;
}

const InstagramFeed: React.FC<InstagramFeedProps> = ({ postsToShow = 6 }) => {
  // Limit the number of posts shown
  const displayedPosts = mockInstagramPosts.slice(0, postsToShow);
  
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="flex items-center mb-4">
            <Instagram size={24} className="text-[#E67E22] mr-2" />
            <h2 className="text-2xl md:text-3xl font-bold">Follow Us on Instagram</h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join our community and stay updated with our latest creations, behind-the-scenes moments, and special announcements.
          </p>
          <a 
            href="https://instagram.com/lentillife" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-4 text-[#E67E22] font-medium flex items-center hover:underline"
          >
            @lentillife
          </a>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {displayedPosts.map((post, index) => (
            <motion.a
              key={post.id}
              href="https://instagram.com/lentillife"
              target="_blank"
              rel="noopener noreferrer"
              className="relative block group overflow-hidden rounded-lg aspect-square"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <img 
                src={post.imageUrl} 
                alt={post.caption}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-white p-4">
                <div className="flex items-center mb-3">
                  <span className="flex items-center mr-4">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    {post.likes}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    {post.comments}
                  </span>
                </div>
                <p className="text-sm text-center line-clamp-3">{post.caption}</p>
                <span className="mt-2 text-xs text-gray-300">{post.date}</span>
              </div>
            </motion.a>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <a 
            href="https://instagram.com/lentillife" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#8a3ab9] via-[#bc2a8d] to-[#fccc63] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <Instagram size={20} className="mr-2" />
            View Instagram Profile
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed; 