/*
  # Fix authentication setup

  1. Changes
    - Remove old users table and related objects
    - Create admin user in auth schema using proper method
    - Set admin role in user metadata
*/

-- Drop old users table and related objects
DROP TABLE IF EXISTS public.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create admin user through auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@tapt.org',
  crypt('27Ja@1396!@', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "admin"}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@tapt.org'
);