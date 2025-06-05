const supabase = require('./supabaseClient');

/**
 * Sign up a new user with profile and location data
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} User and profile data
 */
async function signUpUser(userData) {
  try {
    const { email, password, firstName, lastName, phoneNumber, locationData, marketingConsent, promoCode } = userData;

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        },
        emailRedirectTo: undefined // Disable email confirmation
      }
    });

    if (authError) throw authError;

    const user = authData.user;
    if (!user) throw new Error('User creation failed');

    // 2. Create user profile with location data
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phoneNumber,
        location_data: locationData,
        marketing_consent: marketingConsent || false
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }

    // 3. Apply promo code if provided
    let promoResult = null;
    if (promoCode) {
      try {
        promoResult = await validateAndApplyPromo(user.id, promoCode, true);
      } catch (promoError) {
        console.warn('Promo code application failed during signup:', promoError.message);
        // Don't fail signup if promo fails
      }
    }

    return {
      user: authData.user,
      profile: profileData,
      session: authData.session,
      promoApplied: promoResult
    };

  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

/**
 * Sign in user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} User session and profile
 */
async function signInUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.warn('Could not fetch user profile:', profileError);
    }

    return {
      user: data.user,
      session: data.session,
      profile: profileData
    };

  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

/**
 * Sign out user
 * @returns {Promise<void>}
 */
async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Get current user with profile
 * @returns {Promise<Object|null>} User and profile data
 */
async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;

    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.warn('Could not fetch user profile:', profileError);
    }

    return {
      user,
      profile: profileData
    };

  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Update user profile
 * @param {string} userId 
 * @param {Object} updateData 
 * @returns {Promise<Object>} Updated profile
 */
async function updateUserProfile(userId, updateData) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return data;

  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
}

/**
 * Validate and apply promo code
 * @param {string} userId 
 * @param {string} promoCode 
 * @param {boolean} isNewUser 
 * @returns {Promise<Object>} Promo validation result
 */
async function validateAndApplyPromo(userId, promoCode, isNewUser = false) {
  try {
    // 1. Get promo code details
    const { data: promo, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (promoError || !promo) {
      throw new Error('Invalid or expired promo code');
    }

    // 2. Check expiration
    if (promo.valid_until && new Date(promo.valid_until) < new Date()) {
      throw new Error('Promo code has expired');
    }

    // 3. Check usage limits
    if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
      throw new Error('Promo code usage limit reached');
    }

    // 4. Check user restrictions
    if (promo.user_restriction === 'new_users_only' && !isNewUser) {
      throw new Error('This promo code is only for new users');
    }

    // 5. Check if user already used this promo
    const { data: existingUsage } = await supabase
      .from('user_promo_usage')
      .select('id')
      .eq('user_id', userId)
      .eq('promo_code_id', promo.id)
      .single();

    if (existingUsage) {
      throw new Error('You have already used this promo code');
    }

    // 6. Get user location for location-based validation
    if (promo.location_restriction) {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('location_data')
        .eq('id', userId)
        .single();

      if (userProfile?.location_data) {
        const userLocation = userProfile.location_data;
        const restrictions = promo.location_restriction;

        // Check city/state/country restrictions
        if (restrictions.cities && restrictions.cities.length > 0) {
          if (!restrictions.cities.includes(userLocation.city)) {
            throw new Error('This promo code is not available in your location');
          }
        }
        if (restrictions.states && restrictions.states.length > 0) {
          if (!restrictions.states.includes(userLocation.state)) {
            throw new Error('This promo code is not available in your state');
          }
        }
      }
    }

    return {
      valid: true,
      promo: promo,
      message: 'Promo code is valid'
    };

  } catch (error) {
    console.error('Promo validation error:', error);
    throw error;
  }
}

/**
 * Record promo code usage
 * @param {string} userId 
 * @param {string} promoCodeId 
 * @param {string} orderId 
 * @param {number} discountAmount 
 * @returns {Promise<Object>} Usage record
 */
async function recordPromoUsage(userId, promoCodeId, orderId, discountAmount) {
  try {
    // 1. Record usage
    const { data: usageData, error: usageError } = await supabase
      .from('user_promo_usage')
      .insert({
        user_id: userId,
        promo_code_id: promoCodeId,
        order_id: orderId,
        discount_amount: discountAmount
      })
      .select()
      .single();

    if (usageError) throw usageError;

    // 2. Increment promo code usage count
    const { error: updateError } = await supabase
      .from('promo_codes')
      .update({ 
        current_uses: supabase.sql`current_uses + 1`
      })
      .eq('id', promoCodeId);

    if (updateError) throw updateError;

    return usageData;

  } catch (error) {
    console.error('Record promo usage error:', error);
    throw error;
  }
}

module.exports = {
  signUpUser,
  signInUser,
  signOutUser,
  getCurrentUser,
  updateUserProfile,
  validateAndApplyPromo,
  recordPromoUsage
}; 