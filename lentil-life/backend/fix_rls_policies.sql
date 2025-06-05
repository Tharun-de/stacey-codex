-- =============================================================================
-- FIX RLS POLICIES - Run this to fix signup issues
-- =============================================================================

-- Fix user_profiles policies to allow signup
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON user_profiles;

-- Create a proper INSERT policy that allows signup
CREATE POLICY "Allow profile creation during signup" ON user_profiles 
FOR INSERT WITH CHECK (true);

-- Fix the SELECT and UPDATE policies to be more flexible
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles 
FOR SELECT USING (auth.uid() = id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles 
FOR UPDATE USING (auth.uid() = id OR auth.uid() IS NULL);

-- Make sure promo_codes can be read publicly
DROP POLICY IF EXISTS "Allow public read access to active promo codes" ON promo_codes;
CREATE POLICY "Allow public read access to active promo codes" ON promo_codes 
FOR SELECT USING (is_active = true);

-- Allow public promo usage tracking
DROP POLICY IF EXISTS "Users can insert own promo usage" ON user_promo_usage;
CREATE POLICY "Allow promo usage insertion" ON user_promo_usage 
FOR INSERT WITH CHECK (true);

-- Verify the policies are working
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'promo_codes', 'user_promo_usage')
ORDER BY tablename, policyname; 