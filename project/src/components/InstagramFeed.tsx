import React from 'react';
import { Instagram } from 'lucide-react';

const InstagramFeed = () => {
  // In a real application, this would fetch data from Instagram's API
  // Here we're using placeholder images for demonstration purposes
  const instagramPosts = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/1095550/pexels-photo-1095550.jpeg',
      caption: 'Our new seasonal wrap is here! #HealthyEating #Sustainability',
      likes: 124,
      url: 'https://instagram.com'
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg',
      caption: 'Behind the scenes: Prepping fresh ingredients for the day! #FreshFood',
      likes: 98,
      url: 'https://instagram.com'
    },
    {
      id: 3,
      image: 'https://images.pexels.com/photos/806361/pexels-photo-806361.jpeg',
      caption: 'Enjoying Nature\'s Wraps outdoors! Thanks @customer for sharing! #HappyCustomer',
      likes: 156,
      url: 'https://instagram.com'
    },
    {
      id: 4,
      image: 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg',
      caption: 'Proud to partner with local farmers to source the freshest ingredients! #LocalPartners',
      likes: 112,
      url: 'https://instagram.com'
    }
  ];

  return (
    <div>
      <div className="flex items-center mb-6">
        <Instagram size={24} className="text-[#E67E22] mr-2" />
        <h3 className="text-xl font-semibold">Follow us on Instagram</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {instagramPosts.map((post) => (
          <a
            key={post.id}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group relative overflow-hidden rounded-lg"
          >
            <img 
              src={post.image} 
              alt={post.caption}
              className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="text-white text-center p-4">
                <p className="mb-2">{post.likes} likes</p>
                <p className="text-sm line-clamp-3">{post.caption}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
      
      <div className="text-center mt-6">
        <a 
          href="https://instagram.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-[#E67E22] hover:text-[#7D9D74] font-medium transition-colors"
        >
          <span>View more on Instagram</span>
          <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default InstagramFeed;