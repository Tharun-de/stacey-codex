/**
 * Image Service for optimization and handling
 */

// Define image sizes for different contexts
export const IMAGE_SIZES = {
  thumbnail: { width: 100, height: 100 },
  productThumbnail: { width: 200, height: 200 },
  productDisplay: { width: 600, height: 600 },
  listItem: { width: 400, height: 400 },
  banner: { width: 1200, height: 600 }
};

/**
 * Get optimized image URL from Cloudinary or other optimization service
 * @param originalUrl The original image URL
 * @param width Desired width
 * @param height Desired height
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (originalUrl: string, width: number, height: number): string => {
  // If it's already a Cloudinary URL, modify it for resizing
  if (originalUrl.includes('res.cloudinary.com')) {
    // Replace upload with upload/w_[width],h_[height],c_fill
    return originalUrl.replace('/upload/', `/upload/w_${width},h_${height},c_fill/`);
  }
  
  // For imgix
  if (originalUrl.includes('.imgix.net')) {
    const separator = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}w=${width}&h=${height}&fit=crop`;
  }
  
  // For non-optimized images, we could use a proxy service or return the original
  return originalUrl;
};

/**
 * Generates a placeholder URL for when images are loading or missing
 * @param width Width of placeholder
 * @param height Height of placeholder
 * @param text Optional text to display on placeholder
 * @returns Placeholder image URL
 */
export const getPlaceholderImage = (width: number, height: number, text?: string): string => {
  const textParam = text ? `&text=${encodeURIComponent(text)}` : '';
  return `https://via.placeholder.com/${width}x${height}?text=Loading${textParam}`;
};

/**
 * Image component props for our custom Image component
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  size?: keyof typeof IMAGE_SIZES;
  placeholder?: string;
  onError?: () => void;
}

/**
 * Handle image upload with resizing before upload
 * @param file The file to upload
 * @param maxWidth Maximum width
 * @param maxHeight Maximum height
 * @param quality JPEG quality (0-1)
 * @returns Promise with the resized Blob
 */
export const resizeImageBeforeUpload = (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const image = new Image();
      image.onload = () => {
        // Create a canvas and get its context
        const canvas = document.createElement('canvas');
        let width = image.width;
        let height = image.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw image on canvas and convert to blob
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(image, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };
      
      image.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      if (typeof readerEvent.target?.result === 'string') {
        image.src = readerEvent.target.result;
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

export default {
  getOptimizedImageUrl,
  getPlaceholderImage,
  resizeImageBeforeUpload,
  IMAGE_SIZES
}; 