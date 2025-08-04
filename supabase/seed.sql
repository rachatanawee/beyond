-- Seed data for Beyond application
-- This file contains sample data for development and testing

-- Insert sample admin user (update email to match your actual admin account)
-- Note: You need to sign up through the app first, then run this to make the user admin
UPDATE public.profiles 
SET 
  role = 'admin',
  status = 'active',
  full_name = 'System Administrator',
  bio = 'Application administrator with full access to all features.'
WHERE email = 'admin@example.com'; -- Change this to your actual admin email

-- Insert sample moderator user (optional)
-- UPDATE public.profiles 
-- SET 
--   role = 'moderator',
--   status = 'active',
--   full_name = 'Content Moderator',
--   bio = 'Content moderator with limited administrative access.'
-- WHERE email = 'moderator@example.com';

-- Insert sample admin log entries (for demonstration)
INSERT INTO public.admin_logs (admin_id, action, details, created_at)
SELECT 
  p.user_id,
  'system_setup',
  '{"message": "Initial system setup completed", "version": "1.0.0"}'::jsonb,
  NOW()
FROM public.profiles p 
WHERE p.role = 'admin' 
LIMIT 1;

-- You can add more seed data here as needed
-- For example, sample users, test data, etc.

-- Note: This seed file should be run after:
-- 1. Running migrations (bunx supabase db reset)
-- 2. Creating at least one user account through the application
-- 3. Updating the email address above to match your admin account