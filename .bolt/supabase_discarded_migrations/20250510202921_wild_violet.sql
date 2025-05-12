/*
  # Create Hall of Fame nominations table

  1. New Tables
    - `hall_of_fame_nominations`
      - `id` (uuid, primary key)
      - `nominee_name` (text)
      - `nominator_name` (text)
      - `nominator_email` (text)
      - `nomination_reason` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hall_of_fame_nominations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create a nomination
CREATE POLICY "Allow public to create nominations"
  ON hall_of_fame_nominations
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow admin to read all nominations
CREATE POLICY "Allow admin to read nominations"
  ON hall_of_fame_nominations
  FOR SELECT
  TO public
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- Add trigger for updating the updated_at column
CREATE TRIGGER update_hall_of_fame_nominations_updated_at
  BEFORE UPDATE ON hall_of_fame_nominations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();