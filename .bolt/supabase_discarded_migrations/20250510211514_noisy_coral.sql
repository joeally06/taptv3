/*
  # Add Hall of Fame nominations table

  1. New Tables
    - `hall_of_fame_nominations`
      - `id` (uuid, primary key)
      - `nominee_name` (text, required)
      - `nominator_name` (text, required)
      - `nominator_email` (text, required)
      - `nomination_reason` (text, required)
      - `district` (text, required)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `hall_of_fame_nominations` table
    - Add policy for public to create nominations
    - Add policy for admin to read all nominations
*/

CREATE TABLE IF NOT EXISTS hall_of_fame_nominations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nominee_name text NOT NULL,
  nominator_name text NOT NULL,
  nominator_email text NOT NULL,
  nomination_reason text NOT NULL,
  district text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE hall_of_fame_nominations ENABLE ROW LEVEL SECURITY;

-- Create trigger for updating the updated_at column
CREATE TRIGGER update_hall_of_fame_nominations_updated_at
  BEFORE UPDATE ON hall_of_fame_nominations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Allow public to create nominations
CREATE POLICY "Allow public to create nominations"
  ON hall_of_fame_nominations
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow admin to read all nominations
CREATE POLICY "Allow admin to read all nominations"
  ON hall_of_fame_nominations
  FOR SELECT
  TO public
  USING ((jwt() ->> 'role'::text) = 'admin'::text);