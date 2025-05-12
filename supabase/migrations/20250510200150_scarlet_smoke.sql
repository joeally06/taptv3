/*
  # Conference Management System

  1. New Tables
    - `conferences`
      - `id` (uuid, primary key)
      - `name` (text)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `location` (text)
      - `price` (numeric)
      - `max_attendees` (integer)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for admin access
    - Add policies for public read access
*/

-- Create conferences table
CREATE TABLE IF NOT EXISTS conferences (
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

-- Enable RLS
ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" 
  ON conferences
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Allow admin full access" 
  ON conferences
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create updated_at trigger
CREATE TRIGGER update_conferences_updated_at
  BEFORE UPDATE ON conferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();