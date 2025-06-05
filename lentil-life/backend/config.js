require('dotenv').config();

module.exports = {
  // Supabase Configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY
  },

  // Stripe Configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_replace_with_your_key',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_replace_with_your_key',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_replace_with_your_webhook_secret'
  },

  // Email Configuration
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    password: process.env.EMAIL_PASSWORD || 'your-app-password',
    from: process.env.EMAIL_FROM || '"Lentil Life" <your-email@gmail.com>'
  },

  // Location Services
  location: {
    opencageApiKey: process.env.OPENCAGE_API_KEY || 'your_opencage_api_key_here'
  },

  // Application Settings
  app: {
    port: process.env.PORT || 4000,
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  }
}; 