/*
  # Create admin tables and policies

  1. New Tables
    - conferences (conference details and registration)
    - board_members (TAPT board member information)
    - hall_of_fame_nominations (nominations for Hall of Fame)

  2. Security
    - Enable RLS on all tables
    - Add admin-only policies for full access
    - Add public read policies where appropriate
    - Add public nomination policy for Hall of Fame

  3. Triggers
    - Add updated_at triggers for all tables
*/

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

CREATE POLICY "conferences_admin_all" ON public.conferences
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'admin'
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'admin'
  ));

CREATE POLICY "conferences_public_read" ON public.conferences
  FOR SELECT
  TO public
  USING (true);

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

CREATE POLICY "board_members_admin_all" ON public.board_members
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'admin'
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'admin'
  ));

CREATE POLICY "board_members_public_read" ON public.board_members
  FOR SELECT
  TO public
  USING (true);

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

CREATE POLICY "hof_nominations_admin_read" ON public.hall_of_fame_nominations
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'admin'
  ));

CREATE POLICY "hof_nominations_public_insert" ON public.hall_of_fame_nominations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE TRIGGER update_hall_of_fame_nominations_updated_at
  BEFORE UPDATE ON public.hall_of_fame_nominations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();