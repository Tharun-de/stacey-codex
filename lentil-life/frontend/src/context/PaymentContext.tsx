import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import axios, { AxiosError } from 'axios';
import { API_URL } from '../config';

interface PaymentConfig {
  stripePublishableKey: string;
  supportedPaymentMethods: string[];
}

interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
}

interface PaymentStatus {
  id: string;
  status: string;
  amount: number;
  metadata: Record<string, string>;
}

interface PaymentContextType {
  stripePromise: Promise<Stripe | null> | null;
  paymentConfig: PaymentConfig | null;
  loading: boolean;
  error: string | null;
  createPaymentIntent: (amount: number, orderId: string, customerInfo: CustomerInfo) => Promise<PaymentIntent | null>;
  confirmPayment: (paymentIntentId: string, orderId: string) => Promise<boolean>;
  calculateProcessingFee: (amount: number) => Promise<number>;
  getPaymentStatus: (paymentIntentId: string) => Promise<PaymentStatus | null>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

interface PaymentProviderProps {
  children: React.ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Stripe and payment configuration
  useEffect(() => {
    const initializePayment = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch payment configuration from backend
        const response = await axios.get(`${API_URL}/payment/config`);
        
        if (response.data.success) {
          const config = response.data.config;
          setPaymentConfig(config);

          // Initialize Stripe if publishable key is available
          if (config.stripePublishableKey && config.stripePublishableKey !== 'pk_test_replace_with_your_key') {
            const stripe = loadStripe(config.stripePublishableKey);
            setStripePromise(stripe);
          }
        } else {
          throw new Error('Failed to load payment configuration');
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment system';
        console.error('Payment initialization error:', err);
        setError(errorMessage);
        
        // Set default config for fallback
        setPaymentConfig({
          stripePublishableKey: '',
          supportedPaymentMethods: ['venmo', 'cash']
        });
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, []);

  // Create payment intent for Stripe
  const createPaymentIntent = async (
    amount: number, 
    orderId: string, 
    customerInfo: CustomerInfo
  ): Promise<PaymentIntent | null> => {
    try {
      const response = await axios.post(`${API_URL}/payment/create-intent`, {
        amount,
        orderId,
        customerInfo
      });

      if (response.data.success) {
        return {
          clientSecret: response.data.clientSecret,
          paymentIntentId: response.data.paymentIntentId,
          amount: response.data.amount
        };
      } else {
        throw new Error(response.data.error || 'Failed to create payment intent');
      }
    } catch (err: unknown) {
      let errorMessage = 'Payment processing error';
      
      if (err instanceof AxiosError) {
        errorMessage = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      console.error('Error creating payment intent:', err);
      setError(errorMessage);
      return null;
    }
  };

  // Confirm payment
  const confirmPayment = async (paymentIntentId: string, orderId: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/payment/confirm`, {
        paymentIntentId,
        orderId
      });

      if (response.data.success) {
        return true;
      } else {
        throw new Error(response.data.error || 'Payment confirmation failed');
      }
    } catch (err: unknown) {
      let errorMessage = 'Payment confirmation error';
      
      if (err instanceof AxiosError) {
        errorMessage = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      console.error('Error confirming payment:', err);
      setError(errorMessage);
      return false;
    }
  };

  // Calculate processing fee
  const calculateProcessingFee = async (amount: number): Promise<number> => {
    try {
      const response = await axios.post(`${API_URL}/payment/calculate-fee`, {
        amount
      });

      if (response.data.success) {
        return response.data.calculation.processingFee;
      } else {
        throw new Error(response.data.error || 'Failed to calculate processing fee');
      }
    } catch (err: unknown) {
      console.error('Error calculating processing fee:', err);
      return 0;
    }
  };

  // Get payment status
  const getPaymentStatus = async (paymentIntentId: string): Promise<PaymentStatus | null> => {
    try {
      const response = await axios.get(`${API_URL}/payment/status/${paymentIntentId}`);

      if (response.data.success) {
        return response.data.payment;
      } else {
        throw new Error(response.data.error || 'Failed to get payment status');
      }
    } catch (err: unknown) {
      console.error('Error getting payment status:', err);
      return null;
    }
  };

  const value: PaymentContextType = {
    stripePromise,
    paymentConfig,
    loading,
    error,
    createPaymentIntent,
    confirmPayment,
    calculateProcessingFee,
    getPaymentStatus
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
}; 