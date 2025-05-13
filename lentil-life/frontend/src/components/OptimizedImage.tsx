import React, { useState, useEffect } from 'react';
import { getOptimizedImageUrl, getPlaceholderImage, OptimizedImageProps, IMAGE_SIZES } from '../utils/imageService';

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  size,
  placeholder,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    // Determine dimensions based on size prop or explicit width/height
    let finalWidth = width;
    let finalHeight = height;
    
    if (size && IMAGE_SIZES[size]) {
      finalWidth = IMAGE_SIZES[size].width;
      finalHeight = IMAGE_SIZES[size].height;
    }
    
    // Get optimized image if dimensions are specified
    if (finalWidth && finalHeight) {
      setImageSrc(getOptimizedImageUrl(src, finalWidth, finalHeight));
    } else {
      setImageSrc(src);
    }
  }, [src, width, height, size]);
  
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    
    if (onError) {
      onError();
    }
  };
  
  // Get placeholder image
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    let placeholderWidth = width;
    let placeholderHeight = height;
    
    if (size && IMAGE_SIZES[size]) {
      placeholderWidth = IMAGE_SIZES[size].width;
      placeholderHeight = IMAGE_SIZES[size].height;
    }
    
    if (placeholderWidth && placeholderHeight) {
      return getPlaceholderImage(placeholderWidth, placeholderHeight);
    }
    
    return getPlaceholderImage(200, 200); // Default
  };
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Main Image */}
      <img
        src={hasError ? getPlaceholder() : imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="animate-pulse text-gray-400 text-xs">Loading...</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage; 