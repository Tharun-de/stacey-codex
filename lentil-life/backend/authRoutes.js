const express = require('express');
const router = express.Router();
const authService = require('./authService');
const locationService = require('./locationService');

/**
 * POST /auth/signup
 * Register a new user with location and optional promo code
 */
router.post('/signup', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phoneNumber, 
      coordinates, 
      address,
      marketingConsent, 
      promoCode 
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Email, password, first name, and last name are required' 
      });
    }

    // TEMPORARY: Skip actual signup and return success for testing
    console.log('=== SIGNUP ATTEMPT (MOCK MODE) ===');
    console.log('Email:', email);
    console.log('Name:', firstName, lastName);
    console.log('Phone:', phoneNumber);
    console.log('Coordinates:', coordinates);
    console.log('Address:', address);
    console.log('Promo Code:', promoCode);
    
    // Return mock success response
    res.status(201).json({
      success: true,
      message: 'User created successfully (MOCK MODE)',
      user: {
        id: 'mock-user-123',
        email: email,
        firstName: firstName,
        lastName: lastName
      },
      profile: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phoneNumber
      },
      promoApplied: promoCode ? { code: promoCode, valid: true } : null,
      session: { access_token: 'mock-token' }
    });

    // ORIGINAL CODE (commented out for testing):
    /*
    // Process location data
    let locationData = null;
    console.log('Received coordinates:', coordinates);
    console.log('Received address:', address);
    
    if (coordinates && coordinates.latitude && coordinates.longitude) {
      try {
        console.log('Processing GPS coordinates:', coordinates.latitude, coordinates.longitude);
        locationData = await locationService.reverseGeocode(
          coordinates.latitude, 
          coordinates.longitude
        );
        console.log('GPS location result:', locationData);
      } catch (error) {
        console.warn('Location processing failed:', error.message);
        // Use IP fallback if coordinates fail
        locationData = await locationService.getLocationFromIP(req.ip);
        console.log('IP fallback location result:', locationData);
      }
    } else if (address) {
      try {
        console.log('Processing address:', address);
        locationData = await locationService.geocode(address);
        console.log('Address geocoding result:', locationData);
      } catch (error) {
        console.warn('Address geocoding failed:', error.message);
        locationData = await locationService.getLocationFromIP(req.ip);
        console.log('IP fallback from address failure:', locationData);
      }
    } else {
      // Fallback to IP geolocation
      console.log('No coordinates or address provided, using IP fallback');
      locationData = await locationService.getLocationFromIP(req.ip);
      console.log('IP fallback result:', locationData);
    }

    // Create user with all data
    const result = await authService.signUpUser({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      locationData,
      marketingConsent,
      promoCode
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.profile.first_name,
        lastName: result.profile.last_name
      },
      profile: result.profile,
      promoApplied: result.promoApplied,
      session: result.session
    });
    */

  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle specific error types
    if (error.message.includes('already registered')) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    res.status(400).json({ 
      error: error.message || 'Registration failed' 
    });
  }
});

/**
 * POST /auth/signin
 * Sign in existing user
 */
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.signInUser(email, password);

    res.json({
      success: true,
      message: 'Signed in successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.profile?.first_name,
        lastName: result.profile?.last_name
      },
      profile: result.profile,
      session: result.session
    });

  } catch (error) {
    console.error('Sign in error:', error);
    res.status(401).json({ 
      error: 'Invalid email or password' 
    });
  }
});

/**
 * POST /auth/signout
 * Sign out current user
 */
router.post('/signout', async (req, res) => {
  try {
    await authService.signOutUser();
    res.json({
      success: true,
      message: 'Signed out successfully'
    });
  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({ error: 'Sign out failed' });
  }
});

/**
 * GET /auth/me
 * Get current user profile (made non-auth for admin testing)
 */
router.get('/me', async (req, res) => {
  try {
    // For now, return a mock admin user to allow admin page to work
    // In production, you'd implement proper authentication
    res.json({
      success: true,
      user: {
        id: 'admin-user',
        email: 'admin@lentillife.com',
        firstName: 'Admin',
        lastName: 'User'
      },
      profile: {
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@lentillife.com'
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

/**
 * PUT /auth/profile
 * Update user profile
 */
router.put('/profile', async (req, res) => {
  try {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const updateData = req.body;
    
    // Process location update if provided
    if (updateData.coordinates) {
      try {
        const locationData = await locationService.reverseGeocode(
          updateData.coordinates.latitude,
          updateData.coordinates.longitude
        );
        updateData.location_data = locationData;
        delete updateData.coordinates;
      } catch (error) {
        console.warn('Location update failed:', error.message);
      }
    }

    const updatedProfile = await authService.updateUserProfile(
      currentUser.user.id,
      updateData
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ error: 'Profile update failed' });
  }
});

/**
 * POST /auth/validate-promo-public
 * Validate a promo code without authentication (for signup)
 */
router.post('/validate-promo-public', async (req, res) => {
  try {
    const { promoCode } = req.body;
    if (!promoCode) {
      return res.status(400).json({ error: 'Promo code is required' });
    }

    // Get promo code details directly from database
    const supabase = require('./supabaseClient');
    const { data: promo, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (promoError || !promo) {
      return res.status(400).json({ error: 'Invalid or expired promo code' });
    }

    // Check expiration
    if (promo.valid_until && new Date(promo.valid_until) < new Date()) {
      return res.status(400).json({ error: 'Promo code has expired' });
    }

    // Check usage limits
    if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
      return res.status(400).json({ error: 'Promo code usage limit reached' });
    }

    res.json({
      success: true,
      message: 'Promo code is valid',
      promo: {
        code: promo.code,
        discountType: promo.discount_type,
        discountValue: promo.discount_value,
        minOrderAmount: promo.minimum_order
      }
    });

  } catch (error) {
    console.error('Public promo validation error:', error);
    res.status(400).json({ 
      error: error.message || 'Invalid promo code' 
    });
  }
});

/**
 * POST /auth/validate-promo
 * Validate a promo code for current user
 */
router.post('/validate-promo', async (req, res) => {
  try {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { promoCode } = req.body;
    if (!promoCode) {
      return res.status(400).json({ error: 'Promo code is required' });
    }

    const result = await authService.validateAndApplyPromo(
      currentUser.user.id,
      promoCode,
      false // Not a new user
    );

    res.json({
      success: true,
      message: 'Promo code is valid',
      promo: {
        code: result.promo.code,
        description: result.promo.description,
        discountType: result.promo.discount_type,
        discountValue: result.promo.discount_value,
        minOrderAmount: result.promo.min_order_amount
      }
    });

  } catch (error) {
    console.error('Promo validation error:', error);
    res.status(400).json({ 
      error: error.message || 'Invalid promo code' 
    });
  }
});

/**
 * POST /auth/location/ip
 * Get location from IP address (fallback method)
 */
router.post('/location/ip', async (req, res) => {
  try {
    const locationData = await locationService.getLocationFromIP(req.ip);
    
    res.json({
      success: true,
      location: locationData
    });

  } catch (error) {
    console.error('IP location error:', error);
    res.status(500).json({ error: 'Failed to get location from IP' });
  }
});

/**
 * POST /auth/location/coordinates
 * Get location details from coordinates
 */
router.post('/location/coordinates', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const locationData = await locationService.reverseGeocode(latitude, longitude);
    
    res.json({
      success: true,
      location: locationData
    });

  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({ error: 'Failed to get location details' });
  }
});

module.exports = router; 