import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  location_data?: {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    country: string;
    address: string;
  };
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
}

interface Session {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (userData: SignUpData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  validatePromo: (promoCode: string) => Promise<PromoValidationResult>;
  getLocationFromCoordinates: (latitude: number, longitude: number) => Promise<LocationData>;
}

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  marketingConsent?: boolean;
  promoCode?: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  address: string;
  confidence: number;
}

interface PromoValidationResult {
  valid: boolean;
  promo?: {
    code: string;
    description: string;
    discountType: string;
    discountValue: number;
    minOrderAmount: number;
  };
  error?: string;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // API base URL
  const API_BASE = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com/api' 
    : 'http://localhost:4000/api';

  // Check for existing session on app load
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: SignUpData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setUser(data.user);
      setProfile(data.profile);
      setSession(data.session);

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sign in failed');
      }

      setUser(data.user);
      setProfile(data.profile);
      setSession(data.session);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fetch(`${API_BASE}/auth/signout`, {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Profile update failed');
      }

      setProfile(result.profile);
      return result.profile;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const validatePromo = async (promoCode: string): Promise<PromoValidationResult> => {
    try {
      const response = await fetch(`${API_BASE}/auth/validate-promo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ promoCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          valid: false,
          error: data.error || 'Invalid promo code'
        };
      }

      return {
        valid: true,
        promo: data.promo
      };
    } catch (error) {
      console.error('Promo validation error:', error);
      return {
        valid: false,
        error: 'Failed to validate promo code'
      };
    }
  };

  const getLocationFromCoordinates = async (latitude: number, longitude: number): Promise<LocationData> => {
    try {
      const response = await fetch(`${API_BASE}/auth/location/coordinates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get location');
      }

      return data.location;
    } catch (error) {
      console.error('Location error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    validatePromo,
    getLocationFromCoordinates,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 