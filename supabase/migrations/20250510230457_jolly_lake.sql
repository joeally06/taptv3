/*
  # Create users table and policies

  1. New Tables
    - `users` table linked to auth.users
      - `id` (uuid, primary key, references auth.users)
      - `role` (text, default 'user')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on users table
    - Add policy for users to read their own data
    - Add policy for admin access
    
  3. Triggers
    - Create trigger to automatically create user records
*/

-- Enable Supabase Auth
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data" 
      ON public.users 
      FOR SELECT 
      TO authenticated 
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Admin users can access everything'
  ) THEN
    CREATE POLICY "Admin users can access everything" 
      ON public.users 
      FOR ALL 
      TO authenticated 
      USING (role = 'admin');
  END IF;
END $$;

-- Create trigger to sync users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();