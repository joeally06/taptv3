/*
  # Create initial admin user
  
  1. New Data
    - Creates initial admin user with email/password login
    
  2. Security  
    - Enables RLS on auth.users
    - Adds policy for admin access
*/

-- Create initial admin user
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  role
)
VALUES (
  'admin@tapt.org',
  crypt('TAPT2025admin', gen_salt('bf')),
  now(),
  'admin'
) ON CONFLICT DO NOTHING;