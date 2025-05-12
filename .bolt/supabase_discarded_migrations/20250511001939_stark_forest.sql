-- Drop old users table and related objects
DROP TABLE IF EXISTS public.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create admin user in Supabase Auth
DO $$
DECLARE
  admin_uid uuid;
BEGIN
  -- Insert admin user into auth.users if not exists
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
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@tapt.org',
    crypt('27Ja@1396!@', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO admin_uid;

  -- Set admin role in auth.users
  IF admin_uid IS NOT NULL THEN
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
    WHERE id = admin_uid;
  END IF;
END $$;