/*
  # Set up authentication tables
  
  1. New Tables
    - `users` table for storing user accounts
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password` (text)
      - `role` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on users table
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data" 
  ON public.users 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Admin users can access everything" 
  ON public.users 
  FOR ALL 
  TO authenticated 
  USING (role = 'admin');

-- Create initial admin user
INSERT INTO public.users (
  email,
  password,
  role
) VALUES (
  'admin@tapt.org',
  crypt('TAPT2025admin', gen_salt('bf')),
  'admin'
) ON CONFLICT (email) DO NOTHING;