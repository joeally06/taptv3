/*
  # Create board members table

  1. New Tables
    - `board_members`
      - `id` (uuid, primary key)
      - `name` (text)
      - `title` (text) 
      - `role` (text)
      - `organization` (text)
      - `location` (text)
      - `contact_info` (jsonb)
      - `image_url` (text)
      - `website` (text)
      - `notes` (text)
      - `term` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `board_members` table
    - Add policy for public read access
    - Add policy for admin full access
*/

DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS board_members (
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
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ BEGIN
  CREATE POLICY "Allow public read access" 
    ON board_members
    FOR SELECT 
    TO public
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow admin full access" 
    ON board_members
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create updated_at trigger if it doesn't exist
DO $$ BEGIN
  CREATE TRIGGER update_board_members_updated_at
    BEFORE UPDATE ON board_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;