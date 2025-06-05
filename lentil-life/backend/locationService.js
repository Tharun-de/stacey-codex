/**
 * Location service for handling user location data
 * Uses OpenCage Data API for geocoding (free tier: 2,500 requests/day)
 * You can also use Google Geocoding API or other services
 */

const axios = require('axios');

// You'll need to get a free API key from OpenCage Data: https://opencagedata.com/
const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;

/**
 * Get location details from coordinates
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<Object>} Location details
 */
async function reverseGeocode(latitude, longitude) {
  try {
    if (!OPENCAGE_API_KEY) {
      console.warn('OPENCAGE_API_KEY not set, using mock location data');
      return getMockLocationData(latitude, longitude);
    }

    const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
      params: {
        q: `${latitude}+${longitude}`,
        key: OPENCAGE_API_KEY,
        limit: 1,
        no_annotations: 1
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      const components = result.components;

      return {
        latitude,
        longitude,
        address: result.formatted,
        city: components.city || components.town || components.village || 'Unknown',
        state: components.state || components.province || 'Unknown',
        country: components.country || 'Unknown',
        country_code: components.country_code || 'unknown',
        postal_code: components.postcode || null,
        confidence: result.confidence || 0
      };
    } else {
      throw new Error('No location data found');
    }

  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    
    // Fallback to basic location data
    return {
      latitude,
      longitude,
      address: `${latitude}, ${longitude}`,
      city: 'Unknown',
      state: 'Unknown',
      country: 'Unknown',
      country_code: 'unknown',
      postal_code: null,
      confidence: 0,
      error: 'Could not determine location details'
    };
  }
}

/**
 * Get coordinates from address
 * @param {string} address 
 * @returns {Promise<Object>} Coordinates and location details
 */
async function geocode(address) {
  try {
    if (!OPENCAGE_API_KEY) {
      throw new Error('OPENCAGE_API_KEY not configured');
    }

    const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
      params: {
        q: address,
        key: OPENCAGE_API_KEY,
        limit: 1,
        no_annotations: 1
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      const components = result.components;

      return {
        latitude: result.geometry.lat,
        longitude: result.geometry.lng,
        address: result.formatted,
        city: components.city || components.town || components.village || 'Unknown',
        state: components.state || components.province || 'Unknown',
        country: components.country || 'Unknown',
        country_code: components.country_code || 'unknown',
        postal_code: components.postcode || null,
        confidence: result.confidence || 0
      };
    } else {
      throw new Error('No coordinates found for address');
    }

  } catch (error) {
    console.error('Geocoding error:', error.message);
    throw error;
  }
}

/**
 * Mock location data for development/testing
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Object} Mock location data
 */
function getMockLocationData(latitude, longitude) {
  // Simple mock data based on coordinates
  const mockLocations = [
    { lat: 40.7128, lng: -74.0060, city: 'New York', state: 'NY', country: 'USA' },
    { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', state: 'CA', country: 'USA' },
    { lat: 41.8781, lng: -87.6298, city: 'Chicago', state: 'IL', country: 'USA' },
    { lat: 29.7604, lng: -95.3698, city: 'Houston', state: 'TX', country: 'USA' },
    { lat: 33.4484, lng: -112.0740, city: 'Phoenix', state: 'AZ', country: 'USA' }
  ];

  // Find closest mock location
  let closest = mockLocations[0];
  let minDistance = Math.abs(latitude - closest.lat) + Math.abs(longitude - closest.lng);

  for (const location of mockLocations) {
    const distance = Math.abs(latitude - location.lat) + Math.abs(longitude - location.lng);
    if (distance < minDistance) {
      closest = location;
      minDistance = distance;
    }
  }

  return {
    latitude,
    longitude,
    address: `${closest.city}, ${closest.state}, ${closest.country}`,
    city: closest.city,
    state: closest.state,
    country: closest.country,
    country_code: 'us',
    postal_code: null,
    confidence: 8,
    mock: true
  };
}

/**
 * Get location from IP address (fallback method)
 * @param {string} ipAddress 
 * @returns {Promise<Object>} Location data from IP
 */
async function getLocationFromIP(ipAddress = null) {
  try {
    const response = await axios.get(`http://ip-api.com/json/${ipAddress || ''}`, {
      params: {
        fields: 'status,country,countryCode,region,regionName,city,lat,lon,query'
      }
    });

    const data = response.data;

    if (data.status === 'success') {
      return {
        latitude: data.lat,
        longitude: data.lon,
        address: `${data.city}, ${data.regionName}, ${data.country}`,
        city: data.city || 'Unknown',
        state: data.regionName || 'Unknown',
        country: data.country || 'Unknown',
        country_code: data.countryCode?.toLowerCase() || 'unknown',
        postal_code: null,
        confidence: 5,
        method: 'ip_geolocation',
        ip: data.query
      };
    } else {
      throw new Error('IP geolocation failed');
    }

  } catch (error) {
    console.error('IP geolocation error:', error.message);
    
    // Ultimate fallback
    return {
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'New York, NY, USA',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      country_code: 'us',
      postal_code: null,
      confidence: 1,
      method: 'fallback',
      error: 'Could not determine location'
    };
  }
}

/**
 * Calculate distance between two coordinates (in miles)
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in miles
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Validate location data
 * @param {Object} locationData 
 * @returns {boolean} Is valid location data
 */
function validateLocationData(locationData) {
  return (
    locationData &&
    typeof locationData.latitude === 'number' &&
    typeof locationData.longitude === 'number' &&
    locationData.latitude >= -90 && locationData.latitude <= 90 &&
    locationData.longitude >= -180 && locationData.longitude <= 180
  );
}

module.exports = {
  reverseGeocode,
  geocode,
  getLocationFromIP,
  calculateDistance,
  validateLocationData,
  getMockLocationData
}; 