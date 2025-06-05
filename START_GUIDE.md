# 🚀 Lentil Life Auth System - Quick Start Guide

## ✅ Setup Complete
- ✅ Backend authentication system with Supabase
- ✅ Frontend signup/login with location tracking
- ✅ Promo code system with real-time validation
- ✅ Database schema deployed in Supabase
- ✅ All TypeScript errors fixed

## 🔧 How to Start Testing

### 1. Start Backend Server
```bash
cd lentil-life/backend
npm start
```
Expected output:
```
Supabase client initialized.
Server running on port 4000
```

### 2. Start Frontend Server
Open a new terminal:
```bash
cd lentil-life/frontend
npm run dev
```

### 3. Test the System
- Visit: `http://localhost:3000/signup`
- Try creating an account with promo code: `WELCOME10`
- Test location permission when prompted
- Test login/logout flow

## 🎯 What to Test

### User Registration
- Visit `/signup`
- Fill out 2-step form
- Allow location access (optional)
- Try promo codes: `WELCOME10`, `SAVE5`, `FIRST20`, `WEEKEND15`
- Check navbar shows user menu after signup

### User Login
- Visit `/login`
- Use credentials you just created
- Check navbar updates with user info

### Data Verification
Check your Supabase dashboard:
- `user_profiles` table: Should show new user with location data
- `user_promo_usage` table: Should show promo code usage
- `auth.users` table: Should show the authenticated user

## 🎉 Sample Promo Codes
- `WELCOME10` - 10% off for new users
- `SAVE5` - $5 off orders over $25
- `FIRST20` - 20% off first order  
- `WEEKEND15` - 15% off weekend orders

## 🔍 Troubleshooting
- If backend won't start: Make sure you're in `lentil-life/backend` directory
- If promo codes don't work: Check Supabase connection
- If location doesn't work: It will fallback to IP-based location
- If signup fails: Check browser console for detailed errors

## 📊 Marketing Data You'll Get
- User locations (city, state, country)
- Promo code usage analytics
- Marketing consent tracking
- User registration patterns

Your complete MVP auth system is ready! 🎯 