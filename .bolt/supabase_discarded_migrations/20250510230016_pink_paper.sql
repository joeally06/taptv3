/*
  # Create admin user and security policies

  1. Changes
    - Create initial admin user with all required fields
    - Enable RLS on users table
    - Add admin access policy
  
  2. Security
    - Enable RLS on users table
    - Add policy for admin access
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
);

-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admin users can access everything" 
ON auth.users 
FOR ALL 
TO authenticated 
USING (role = 'admin');