/*
  # Create initial admin user
  
  1. Changes
    - Creates initial admin user with UUID
    - Sets up required fields and role
*/

-- Create initial admin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  role,
  aud,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@tapt.org',
  crypt('TAPT2025admin', gen_salt('bf')),
  now(),
  'admin',
  'authenticated',
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admin users can access everything" 
ON auth.users 
FOR ALL 
TO authenticated 
USING (role = 'admin');