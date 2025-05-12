/*
  # Create admin user in Supabase Auth
  
  1. Changes
    - Drop old users table and related objects
    - Create admin user in auth.users table
    - Set proper metadata for admin role
*/

-- Drop old users table and related objects
DROP TABLE IF EXISTS public.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create admin user through auth.users
DO $$
DECLARE
  admin_uid uuid;
BEGIN
  -- First try to get existing admin user
  SELECT id INTO admin_uid FROM auth.users WHERE email = 'admin@tapt.org';

  -- If admin doesn't exist, create them
  IF admin_uid IS NULL THEN
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
    ) VALUES (
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
    )
    RETURNING id INTO admin_uid;
  END IF;

  -- Update metadata for existing admin
  UPDATE auth.users
  SET 
    raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'::jsonb,
    raw_user_meta_data = '{"role": "admin"}'::jsonb,
    updated_at = now()
  WHERE id = admin_uid;
END $$;