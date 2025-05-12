/*
  # Database Schema Setup
  
  1. New Tables
    - conferences
    - board_members
    - hall_of_fame_nominations
    
  2. Security
    - Enable RLS on all tables
    - Add admin and public policies
    
  3. Features
    - Automatic updated_at timestamps
    - UUID primary keys
    - JSON contact info for board members
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Conferences table
CREATE TABLE IF NOT EXISTS public.conferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text NOT NULL,
  price numeric NOT NULL,
  max_attendees integer,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.conferences ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'conferences' AND policyname = 'conferences_admin_all'
  ) THEN
    CREATE POLICY "conferences_admin_all" ON public.conferences
      FOR ALL
      TO authenticated
      USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
      ))
      WITH CHECK (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'conferences' AND policyname = 'conferences_public_read'
  ) THEN
    CREATE POLICY "conferences_public_read" ON public.conferences
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_conferences_updated_at ON public.conferences;
CREATE TRIGGER update_conferences_updated_at
  BEFORE UPDATE ON public.conferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Board members table
CREATE TABLE IF NOT EXISTS public.board_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  role text,
  organization text,
  location text,
  contact_info jsonb,
  image_url text,
  website text,
  notes text,
  term text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'board_members' AND policyname = 'board_members_admin_all'
  ) THEN
    CREATE POLICY "board_members_admin_all" ON public.board_members
      FOR ALL
      TO authenticated
      USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
      ))
      WITH CHECK (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'board_members' AND policyname = 'board_members_public_read'
  ) THEN
    CREATE POLICY "board_members_public_read" ON public.board_members
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_board_members_updated_at ON public.board_members;
CREATE TRIGGER update_board_members_updated_at
  BEFORE UPDATE ON public.board_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Hall of Fame nominations table
CREATE TABLE IF NOT EXISTS public.hall_of_fame_nominations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nominee_name text NOT NULL,
  nominator_name text NOT NULL,
  nominator_email text NOT NULL,
  nomination_reason text NOT NULL,
  district text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.hall_of_fame_nominations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'hall_of_fame_nominations' AND policyname = 'hof_nominations_admin_all'
  ) THEN
    CREATE POLICY "hof_nominations_admin_all" ON public.hall_of_fame_nominations
      FOR ALL
      TO authenticated
      USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
      ))
      WITH CHECK (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
      ));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'hall_of_fame_nominations' AND policyname = 'hof_nominations_public_insert'
  ) THEN
    CREATE POLICY "hof_nominations_public_insert" ON public.hall_of_fame_nominations
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_hall_of_fame_nominations_updated_at ON public.hall_of_fame_nominations;
CREATE TRIGGER update_hall_of_fame_nominations_updated_at
  BEFORE UPDATE ON public.hall_of_fame_nominations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();