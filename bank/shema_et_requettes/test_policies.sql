-- Test if the policies exist and are working
-- Run these queries in Supabase SQL Editor to verify

-- 1. Check if policies exist for events table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'events';

-- 2. Check current user authentication (should return user ID if authenticated)
SELECT auth.uid() as current_user_id;

-- 3. Test if current user can theoretically insert into events
-- This should show what policies would allow/deny
SELECT 
    auth.uid() as user_id,
    auth.uid() IS NOT NULL as is_authenticated,
    'test-policy-check' as test_note;

-- 4. Check if there are any conflicting policies
SELECT * FROM pg_policies WHERE tablename = 'events';